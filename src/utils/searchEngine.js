/**
 * searchEngine.js
 * ──────────────────────────────────────────────────────────────
 * Intelligent healthcare search engine for HealthProvida.
 *
 * Provides:
 *   • Query normalization and intent resolution
 *   • Synonym-aware search across provider fields
 *   • Fuzzy/partial text matching
 *   • Coordinate-based location proximity scoring
 *   • Weighted composite ranking
 *
 * The main entry point is `searchProviders()`.
 * ──────────────────────────────────────────────────────────────
 */
import { haversineDistance } from './haversine';
import { resolveAbujaLocation, addressMatchesLocation } from './abujaLocations';
import {
  findSpecialtyByAlias,
  findSpecialtiesByPartialMatch,
  getExpandedSearchTerms,
  PROVIDER_TYPE_SYNONYMS,
} from './healthcareSearchDictionary';

// ═════════════════════════════════════════════════════════════
//  QUERY NORMALIZATION
// ═════════════════════════════════════════════════════════════

/**
 * Normalize a raw search query: lowercase, trim, collapse whitespace,
 * strip non-essential punctuation.
 *
 * @param {string} raw
 * @returns {string}
 */
export function normalizeQuery(raw) {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .trim()
    .replace(/[''`]/g, "'")     // normalize quotes
    .replace(/[^\w\s'&/-]/g, '') // strip special chars except useful ones
    .replace(/\s+/g, ' ')       // collapse whitespace
    .trim();
}

// ═════════════════════════════════════════════════════════════
//  SEARCH INTENT RESOLUTION
// ═════════════════════════════════════════════════════════════

/**
 * Resolve a user's query into a structured search intent.
 *
 * @param {string} rawQuery
 * @returns {{
 *   originalQuery: string,
 *   normalizedQuery: string,
 *   searchTerms: string[],
 *   intentType: 'specialty' | 'provider_type' | 'general',
 *   resolvedSpecialty: string | null
 * }}
 */
export function resolveSearchIntent(rawQuery) {
  const normalized = normalizeQuery(rawQuery);
  const result = {
    originalQuery: rawQuery,
    normalizedQuery: normalized,
    searchTerms: [normalized],
    intentType: 'general',
    resolvedSpecialty: null,
  };

  if (!normalized) return result;

  // 1. Try exact specialty alias match
  const exactSpec = findSpecialtyByAlias(normalized);
  if (exactSpec) {
    result.intentType = 'specialty';
    result.resolvedSpecialty = exactSpec.canonical;
    result.searchTerms = [...new Set([...exactSpec.matchTerms, normalized])];
    return result;
  }

  // 2. Try provider type synonym match
  for (const [type, synonyms] of Object.entries(PROVIDER_TYPE_SYNONYMS)) {
    if (synonyms.some((s) => s === normalized || normalized.includes(s))) {
      result.intentType = 'provider_type';
      result.searchTerms = [...new Set([type, ...synonyms, normalized])];
      return result;
    }
  }

  // 3. Try partial specialty match
  const partialMatches = findSpecialtiesByPartialMatch(normalized);
  if (partialMatches.length > 0) {
    result.intentType = 'specialty';
    result.resolvedSpecialty = partialMatches[0].canonical;
    const terms = new Set([normalized]);
    partialMatches.forEach((spec) => {
      spec.matchTerms.forEach((t) => terms.add(t));
    });
    result.searchTerms = Array.from(terms);
    return result;
  }

  // 4. Also expand using the dictionary (catches multi-word partial matches)
  const expanded = getExpandedSearchTerms(normalized);
  if (expanded.length > 1) {
    result.searchTerms = expanded;
    result.intentType = 'specialty';
  }

  return result;
}

// ═════════════════════════════════════════════════════════════
//  FUZZY MATCHING
// ═════════════════════════════════════════════════════════════

/**
 * Simple similarity score between two strings (0–1).
 * Uses bigram overlap — fast, good enough for typo tolerance.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number} 0–1 similarity score
 */
function bigramSimilarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const bigrams = (str) => {
    const result = new Set();
    for (let i = 0; i < str.length - 1; i++) {
      result.add(str.slice(i, i + 2));
    }
    return result;
  };

  const setA = bigrams(a.toLowerCase());
  const setB = bigrams(b.toLowerCase());
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const bg of setA) {
    if (setB.has(bg)) intersection++;
  }

  return (2 * intersection) / (setA.size + setB.size);
}

/**
 * Check whether a text contains any of the given search terms.
 * Returns the best match score (0–1).
 *
 * @param {string} text
 * @param {string[]} searchTerms
 * @returns {{ score: number, matched: boolean }}
 */
function matchTermsAgainstText(text, searchTerms) {
  if (!text || !searchTerms.length) return { score: 0, matched: false };
  const lower = text.toLowerCase();

  let bestScore = 0;

  for (const term of searchTerms) {
    // Exact substring match
    if (lower.includes(term)) {
      const exactness = term.length / lower.length;
      bestScore = Math.max(bestScore, 0.7 + (exactness * 0.3));
      continue;
    }

    // Word-level matching
    const words = lower.split(/[\s,./\\-]+/).filter(Boolean);
    for (const word of words) {
      if (word === term) {
        bestScore = Math.max(bestScore, 0.9);
      } else if (word.startsWith(term) || term.startsWith(word)) {
        bestScore = Math.max(bestScore, 0.6);
      } else {
        // Fuzzy match for typo tolerance
        const sim = bigramSimilarity(word, term);
        if (sim > 0.6) {
          bestScore = Math.max(bestScore, sim * 0.5);
        }
      }
    }
  }

  return { score: bestScore, matched: bestScore > 0 };
}

/**
 * Check whether any item in an array matches the search terms.
 *
 * @param {string[]} items
 * @param {string[]} searchTerms
 * @returns {{ score: number, matched: boolean }}
 */
function matchTermsAgainstArray(items, searchTerms) {
  if (!items || !items.length || !searchTerms.length) return { score: 0, matched: false };

  let bestScore = 0;
  for (const item of items) {
    const result = matchTermsAgainstText(item, searchTerms);
    if (result.score > bestScore) bestScore = result.score;
  }

  return { score: bestScore, matched: bestScore > 0 };
}

// ═════════════════════════════════════════════════════════════
//  QUERY RELEVANCE SCORING
// ═════════════════════════════════════════════════════════════

// Scoring weights for different provider fields
const WEIGHTS = {
  exactName: 100,     // provider name exactly matches query
  namePartial: 60,    // provider name partially contains query
  specialty: 85,      // specialty field matches
  practiceType: 70,   // practice_type matches
  tags: 50,           // tags match
  category: 40,       // practitioner_category matches
  address: 15,        // address matches (low — mostly for location)
};

/**
 * Calculate how well a clinic matches the user's search query.
 *
 * @param {Object} clinic — shaped clinic object
 * @param {string[]} searchTerms — expanded search terms
 * @param {string} originalQuery — raw user query (for exact match bonus)
 * @returns {number} 0–100 relevance score
 */
export function calculateQueryScore(clinic, searchTerms, originalQuery) {
  if (!searchTerms.length) return 0;

  let totalScore = 0;
  const oq = (originalQuery || '').toLowerCase().trim();

  // ── Exact name match (highest priority) ──────────────────
  const clinicName = (clinic.practitioner_name || '').toLowerCase();
  if (oq && clinicName === oq) {
    totalScore += WEIGHTS.exactName;
  } else if (oq && clinicName.includes(oq)) {
    totalScore += WEIGHTS.namePartial;
  } else {
    const nameResult = matchTermsAgainstText(clinic.practitioner_name, searchTerms);
    if (nameResult.matched) {
      totalScore += nameResult.score * WEIGHTS.namePartial;
    }
  }

  // ── Specialty match ──────────────────────────────────────
  const specResult = matchTermsAgainstArray(clinic.specialties, searchTerms);
  if (specResult.matched) {
    totalScore += specResult.score * WEIGHTS.specialty;
  }

  // ── Practice type match ──────────────────────────────────
  const typeResult = matchTermsAgainstText(clinic.practice_type, searchTerms);
  if (typeResult.matched) {
    totalScore += typeResult.score * WEIGHTS.practiceType;
  }

  // ── Tags match ───────────────────────────────────────────
  const tagsResult = matchTermsAgainstArray(clinic.tags, searchTerms);
  if (tagsResult.matched) {
    totalScore += tagsResult.score * WEIGHTS.tags;
  }

  // ── Category match ───────────────────────────────────────
  const catResult = matchTermsAgainstText(clinic.practitioner_category, searchTerms);
  if (catResult.matched) {
    totalScore += catResult.score * WEIGHTS.category;
  }

  // ── Address match (low weight — mostly caught by location scoring)
  const addrResult = matchTermsAgainstText(clinic.address, searchTerms);
  if (addrResult.matched) {
    totalScore += addrResult.score * WEIGHTS.address;
  }

  // Normalize to 0–100 range
  // Max possible is roughly 100+85+70+50+40+15 = 360
  return Math.min(100, (totalScore / 360) * 100);
}

// ═════════════════════════════════════════════════════════════
//  LOCATION / PROXIMITY SCORING
// ═════════════════════════════════════════════════════════════

/**
 * Calculate a location relevance score for a clinic.
 *
 * Strategy:
 *   1. If the clinic's address text matches the location → high score
 *   2. If coordinates are available, use haversine distance with
 *      distance-decay tiers — closer = higher score
 *   3. ALL clinics get a non-zero location score so nothing is excluded
 *
 * @param {Object} clinic — shaped clinic object
 * @param {string} locationQuery — user's location search
 * @returns {{ score: number, distanceKm: number|null, tier: string }}
 */
export function calculateLocationScore(clinic, locationQuery) {
  if (!locationQuery || !locationQuery.trim() || locationQuery === 'Current Location') {
    return { score: 100, distanceKm: null, tier: 'none' };
  }

  const q = locationQuery.trim();

  // ── 1. Text-based address match ──────────────────────────
  const addressMatches = addressMatchesLocation(clinic.address, q);

  // ── 2. Coordinate-based distance ─────────────────────────
  const resolvedLocation = resolveAbujaLocation(q);
  let distanceKm = null;

  if (resolvedLocation && clinic.latitude != null && clinic.longitude != null) {
    distanceKm = haversineDistance(
      resolvedLocation.latitude,
      resolvedLocation.longitude,
      clinic.latitude,
      clinic.longitude
    );
  }

  // ── 3. Compute tiered score ──────────────────────────────
  // Address text match gives a bonus
  let score = 0;
  let tier = 'far';

  if (addressMatches) {
    // Clinic address literally contains the search location
    score = 100;
    tier = 'exact';
  }

  if (distanceKm != null) {
    // Distance-based scoring (always computed when coordinates exist)
    let distScore;
    if (distanceKm <= 2) {
      distScore = 95;
      tier = tier === 'exact' ? 'exact' : 'very_near';
    } else if (distanceKm <= 5) {
      distScore = 80;
      tier = tier === 'exact' ? 'exact' : 'near';
    } else if (distanceKm <= 10) {
      distScore = 60;
      if (tier !== 'exact') tier = 'moderate';
    } else if (distanceKm <= 20) {
      distScore = 35;
      if (tier !== 'exact') tier = 'far';
    } else {
      distScore = 15;
      if (tier !== 'exact') tier = 'very_far';
    }

    // Take the higher of text-match score and distance score
    score = Math.max(score, distScore);
  } else if (!addressMatches) {
    // No coordinates, no address match — give a baseline so it's not excluded
    score = 10;
    tier = 'unknown';
  }

  return { score, distanceKm, tier };
}

// ═════════════════════════════════════════════════════════════
//  MAIN SEARCH FUNCTION
// ═════════════════════════════════════════════════════════════

/**
 * Search providers with intelligent query understanding and
 * proximity-based location ranking.
 *
 * IMPORTANT: This function NEVER excludes providers based on location
 * alone. It ranks them by a composite score so nearby providers appear
 * first, but distant ones still show up.
 *
 * @param {Object[]} clinics — all clinics from ClinicsContext
 * @param {string} query — user's search query (can be empty)
 * @param {string} location — user's location query (can be empty)
 * @returns {{
 *   results: Object[],       — scored & sorted clinics
 *   searchMeta: {
 *     originalQuery: string,
 *     resolvedSpecialty: string|null,
 *     intentType: string,
 *     searchTerms: string[],
 *     hasExactLocationMatches: boolean,
 *     expandedToNearby: boolean,
 *     totalResults: number,
 *     locationName: string|null,
 *   }
 * }}
 */
export function searchProviders(clinics, query, location) {
  const hasQuery = query && query.trim().length > 0;
  const hasLocation = location && location.trim().length > 0 && location.trim() !== 'Current Location';

  // ── Resolve search intent ────────────────────────────────
  const intent = hasQuery ? resolveSearchIntent(query) : {
    originalQuery: '',
    normalizedQuery: '',
    searchTerms: [],
    intentType: 'general',
    resolvedSpecialty: null,
  };

  // ── Resolve location ─────────────────────────────────────
  const resolvedLoc = hasLocation ? resolveAbujaLocation(location.trim()) : null;

  // ── Score every clinic ───────────────────────────────────
  let exactLocationMatchCount = 0;
  let queryMatchCount = 0;

  const scored = clinics.map((clinic) => {
    // Query score (0–100)
    const queryScore = hasQuery
      ? calculateQueryScore(clinic, intent.searchTerms, intent.originalQuery)
      : 0;

    // Location score (0–100)
    const locResult = hasLocation
      ? calculateLocationScore(clinic, location.trim())
      : { score: 100, distanceKm: null, tier: 'none' };

    // Track stats
    if (queryScore > 0) queryMatchCount++;
    if (locResult.tier === 'exact' || locResult.tier === 'very_near') {
      exactLocationMatchCount++;
    }

    // ── Composite score ────────────────────────────────────
    let compositeScore;
    if (hasQuery && hasLocation) {
      // Both query and location — weight query higher
      compositeScore = (queryScore * 0.6) + (locResult.score * 0.4);
    } else if (hasQuery) {
      // Query only
      compositeScore = queryScore;
    } else if (hasLocation) {
      // Location only
      compositeScore = locResult.score;
    } else {
      // No search criteria — keep original order
      compositeScore = 50;
    }

    return {
      ...clinic,
      _searchScore: compositeScore,
      _queryScore: queryScore,
      _locationScore: locResult.score,
      _distanceKm: locResult.distanceKm,
      _locationTier: locResult.tier,
    };
  });

  // ── Filter: only keep clinics that match SOMETHING ───────
  let results;
  if (hasQuery) {
    // When there's a query, filter to clinics with non-zero query relevance
    results = scored.filter((c) => c._queryScore > 0);

    // If no results with query match, check for fuzzy/lenient matches
    if (results.length === 0) {
      // Try with a much lower threshold — catch fuzzy matches
      results = scored.filter((c) => c._queryScore > 0 || c._searchScore > 5);
    }
  } else if (hasLocation) {
    // Location-only search — show all, ranked by proximity
    results = scored;
  } else {
    // No search at all — show everything
    results = scored;
  }

  // ── Sort by composite score (descending) ─────────────────
  results.sort((a, b) => {
    // Primary: composite search score
    const scoreDiff = b._searchScore - a._searchScore;
    if (Math.abs(scoreDiff) > 0.5) return scoreDiff;

    // Secondary: rating
    const ratingDiff = (b.rating || 0) - (a.rating || 0);
    if (ratingDiff !== 0) return ratingDiff;

    // Tertiary: number of reviews
    return (b.number_of_reviews || 0) - (a.number_of_reviews || 0);
  });

  // ── Build search metadata ────────────────────────────────
  const expandedToNearby = hasLocation && hasQuery
    && exactLocationMatchCount === 0
    && results.length > 0;

  const searchMeta = {
    originalQuery: query || '',
    resolvedSpecialty: intent.resolvedSpecialty,
    intentType: intent.intentType,
    searchTerms: intent.searchTerms,
    hasExactLocationMatches: exactLocationMatchCount > 0,
    expandedToNearby,
    totalResults: results.length,
    locationName: resolvedLoc ? resolvedLoc.name : (hasLocation ? location.trim() : null),
  };

  return { results, searchMeta };
}
