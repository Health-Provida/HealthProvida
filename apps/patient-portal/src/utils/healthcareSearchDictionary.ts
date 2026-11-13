/**
 * healthcareSearchDictionary.js
 * ──────────────────────────────────────────────────────────────
 * Centralized healthcare search synonym / intent dictionary.
 *
 * Each specialty entry defines:
 *   • canonical  — the formal specialty name used for display
 *   • aliases    — all terms that should resolve to this specialty
 *                  (colloquial, British/Nigerian English, abbreviations)
 *   • matchTerms — terms to search against provider data when this
 *                  specialty is the resolved intent
 *
 * To add a new specialty: append an entry to SPECIALTIES.
 * To add a new alias for an existing specialty: add it to the
 * aliases array of the relevant entry.
 * ──────────────────────────────────────────────────────────────
 */

// ── Specialty definitions ───────────────────────────────────
export const SPECIALTIES = [
  {
    canonical: 'Cardiology',
    aliases: [
      'heart doctor', 'heart specialist', 'heart disease', 'heart clinic',
      'cardiologist', 'cardiology', 'cardiac', 'cardiovascular',
      'heart surgeon', 'heart surgery', 'chest pain doctor',
    ],
    matchTerms: [
      'cardiologist', 'cardiology', 'heart', 'cardiac', 'cardiovascular',
      'heart specialist', 'chest',
    ],
  },
  {
    canonical: 'Dermatology',
    aliases: [
      'skin doctor', 'skin specialist', 'skin clinic', 'dermatologist',
      'dermatology', 'acne doctor', 'skin disease', 'skin care doctor',
      'skin problem', 'rash doctor', 'eczema doctor',
    ],
    matchTerms: [
      'dermatologist', 'dermatology', 'skin', 'acne', 'cosmetic',
      'skin specialist', 'eczema', 'rash',
    ],
  },
  {
    canonical: 'Pediatrics',
    aliases: [
      'children doctor', 'child doctor', 'kids doctor', 'children\'s doctor',
      'pediatrician', 'paediatrician', 'pediatrics', 'paediatrics',
      'child specialist', 'children specialist', 'baby doctor',
      'infant doctor', 'child health', 'children health',
      'pediatric', 'paediatric',
    ],
    matchTerms: [
      'pediatrician', 'paediatrician', 'pediatrics', 'paediatrics',
      'pediatric', 'paediatric', 'child', 'children', 'kids', 'baby',
      'infant', 'child specialist',
    ],
  },
  {
    canonical: 'Orthopedics',
    aliases: [
      'bone doctor', 'bone specialist', 'joint doctor', 'joint specialist',
      'orthopedic doctor', 'orthopaedic doctor', 'orthopedics', 'orthopaedics',
      'orthopedic', 'orthopaedic', 'fracture doctor', 'bone surgery',
      'joint pain doctor', 'spine doctor', 'back doctor',
      'orthopedic surgeon', 'orthopaedic surgeon',
    ],
    matchTerms: [
      'orthopedic', 'orthopaedic', 'orthopedics', 'orthopaedics',
      'bone', 'joint', 'fracture', 'spine', 'musculoskeletal',
    ],
  },
  {
    canonical: 'Ophthalmology',
    aliases: [
      'eye doctor', 'eye specialist', 'eye clinic', 'ophthalmologist',
      'optometrist', 'eye hospital', 'ophthalmology', 'optometry',
      'vision doctor', 'eye care', 'eye surgeon', 'eye surgery',
      'cataract doctor', 'glaucoma doctor',
    ],
    matchTerms: [
      'ophthalmologist', 'optometrist', 'ophthalmology', 'optometry',
      'eye', 'vision', 'cataract', 'glaucoma', 'eye care',
      'eye specialist', 'eye clinic',
    ],
  },
  {
    canonical: 'Dentistry',
    aliases: [
      'dentist', 'dental doctor', 'tooth doctor', 'teeth doctor',
      'dental clinic', 'dentistry', 'dental', 'dental care',
      'oral surgeon', 'oral surgery', 'teeth cleaning',
      'dental surgeon', 'tooth pain', 'teeth pain',
    ],
    matchTerms: [
      'dentist', 'dental', 'dentistry', 'tooth', 'teeth', 'oral',
      'dental clinic', 'dental care',
    ],
  },
  {
    canonical: 'Neurology',
    aliases: [
      'brain doctor', 'nerve doctor', 'neurologist', 'neurology',
      'brain specialist', 'neurosurgeon', 'neurosurgery',
      'brain surgery', 'nerve specialist', 'epilepsy doctor',
      'seizure doctor', 'stroke doctor',
    ],
    matchTerms: [
      'neurologist', 'neurology', 'brain', 'nerve', 'neurosurgeon',
      'neurosurgery', 'epilepsy', 'seizure', 'stroke',
      'brain specialist',
    ],
  },
  {
    canonical: 'Gastroenterology',
    aliases: [
      'stomach doctor', 'stomach specialist', 'digestive doctor',
      'gastro doctor', 'gastroenterologist', 'gastroenterology',
      'gut doctor', 'bowel doctor', 'intestine doctor',
      'digestive specialist', 'gi doctor', 'abdominal doctor',
    ],
    matchTerms: [
      'gastroenterologist', 'gastroenterology', 'stomach', 'digestive',
      'gastro', 'gut', 'bowel', 'intestine', 'gi', 'abdominal',
      'endoscopy',
    ],
  },
  {
    canonical: 'Nephrology',
    aliases: [
      'kidney doctor', 'kidney specialist', 'nephrologist', 'nephrology',
      'kidney disease', 'renal doctor', 'renal specialist',
      'dialysis doctor', 'kidney surgeon',
    ],
    matchTerms: [
      'nephrologist', 'nephrology', 'kidney', 'renal', 'dialysis',
      'kidney specialist',
    ],
  },
  {
    canonical: 'Oncology',
    aliases: [
      'cancer doctor', 'cancer specialist', 'oncologist', 'oncology',
      'cancer clinic', 'cancer hospital', 'tumor doctor', 'tumour doctor',
      'chemotherapy', 'cancer treatment', 'cancer surgeon',
    ],
    matchTerms: [
      'oncologist', 'oncology', 'cancer', 'tumor', 'tumour',
      'chemotherapy', 'cancer specialist',
    ],
  },
  {
    canonical: 'Obstetrics & Gynecology',
    aliases: [
      'gynecologist', 'gynaecologist', 'gynae', 'gyne',
      'women\'s doctor', 'women doctor', 'womens doctor',
      'women\'s health', 'womens health', 'women health',
      'pregnancy doctor', 'maternity', 'maternity doctor',
      'obstetrician', 'obstetrics', 'gynecology', 'gynaecology',
      'ob gyn', 'obgyn', 'ob/gyn', 'prenatal', 'antenatal',
      'postnatal', 'fertility doctor', 'reproductive health',
    ],
    matchTerms: [
      'gynecologist', 'gynaecologist', 'gynecology', 'gynaecology',
      'obstetrics', 'obstetrician', 'women', 'maternity', 'pregnancy',
      'prenatal', 'antenatal', 'postnatal', 'fertility', 'reproductive',
      'women\'s health', 'gynae',
    ],
  },
  {
    canonical: 'ENT',
    aliases: [
      'ent', 'ent doctor', 'ent specialist', 'ear nose throat',
      'ear nose and throat', 'ear doctor', 'nose doctor', 'throat doctor',
      'otolaryngologist', 'otolaryngology', 'ear specialist',
      'nose specialist', 'throat specialist', 'hearing doctor',
      'sinus doctor',
    ],
    matchTerms: [
      'ent', 'otolaryngologist', 'otolaryngology', 'ear', 'nose',
      'throat', 'hearing', 'sinus', 'ent specialist',
    ],
  },
  {
    canonical: 'Psychiatry / Mental Health',
    aliases: [
      'mental health', 'mental health doctor', 'psychiatrist',
      'psychologist', 'therapist', 'counseling', 'counselling',
      'counselor', 'counsellor', 'mental health specialist',
      'depression doctor', 'anxiety doctor', 'mental doctor',
      'psychiatry', 'psychology', 'therapy',
    ],
    matchTerms: [
      'psychiatrist', 'psychologist', 'psychiatry', 'psychology',
      'mental health', 'therapist', 'counseling', 'counselling',
      'counselor', 'counsellor', 'therapy', 'depression', 'anxiety',
      'mental',
    ],
  },
  {
    canonical: 'General Practice',
    aliases: [
      'general doctor', 'gp', 'family doctor', 'family medicine',
      'general practice', 'general practitioner', 'primary care',
      'family physician', 'check up', 'checkup', 'health screening',
      'medical checkup', 'routine checkup', 'general medicine',
    ],
    matchTerms: [
      'general practice', 'general practitioner', 'family medicine',
      'primary care', 'general', 'gp', 'family doctor', 'checkup',
      'check up', 'health screening', 'general medicine',
    ],
  },
  {
    canonical: 'Urology',
    aliases: [
      'urologist', 'urology', 'bladder doctor', 'prostate doctor',
      'urinary doctor', 'kidney stone doctor',
    ],
    matchTerms: [
      'urologist', 'urology', 'bladder', 'prostate', 'urinary',
      'kidney stone',
    ],
  },
  {
    canonical: 'Radiology',
    aliases: [
      'radiologist', 'radiology', 'x-ray', 'xray', 'scan', 'ct scan',
      'mri', 'ultrasound', 'imaging', 'diagnostic imaging',
    ],
    matchTerms: [
      'radiologist', 'radiology', 'x-ray', 'xray', 'scan', 'ct scan',
      'mri', 'ultrasound', 'imaging', 'diagnostic',
    ],
  },
  {
    canonical: 'Physiotherapy',
    aliases: [
      'physiotherapy', 'physiotherapist', 'physical therapy',
      'physical therapist', 'rehab', 'rehabilitation',
      'sports medicine', 'sports doctor', 'physio',
    ],
    matchTerms: [
      'physiotherapy', 'physiotherapist', 'physical therapy',
      'rehabilitation', 'rehab', 'sports', 'physio',
    ],
  },
  {
    canonical: 'Surgery',
    aliases: [
      'surgeon', 'surgery', 'general surgery', 'general surgeon',
      'surgical', 'operation', 'laparoscopic', 'laparoscopy',
    ],
    matchTerms: [
      'surgeon', 'surgery', 'surgical', 'operation', 'laparoscopic',
      'laparoscopy', 'general surgery',
    ],
  },
  {
    canonical: 'Emergency Medicine',
    aliases: [
      'emergency', 'emergency room', 'er', 'a&e', 'accident and emergency',
      'emergency department', 'urgent care', 'emergency doctor',
      'emergency services', 'trauma',
    ],
    matchTerms: [
      'emergency', 'urgent care', 'trauma', 'er', 'a&e',
      'emergency medicine', 'emergency department',
    ],
  },
  {
    canonical: 'Pharmacy',
    aliases: [
      'pharmacy', 'pharmacist', 'drugstore', 'chemist',
      'drug store', 'medicine shop', 'pharmaceutical',
    ],
    matchTerms: [
      'pharmacy', 'pharmacist', 'drug', 'chemist', 'pharmaceutical',
      'medicine',
    ],
  },
];

// ── Provider type synonyms ──────────────────────────────────
// Maps colloquial provider type terms to formal types used in the data
export const PROVIDER_TYPE_SYNONYMS = {
  'hospital': ['hospital', 'hospitals', 'medical center', 'medical centre'],
  'clinic': ['clinic', 'clinics', 'medical clinic', 'health clinic', 'health center', 'health centre'],
  'specialist center': ['specialist', 'specialist center', 'specialist centre', 'specialist hospital'],
  'diagnostic center': ['diagnostic', 'diagnostic center', 'diagnostic centre', 'lab', 'laboratory', 'test center'],
  'pharmacy': ['pharmacy', 'pharmacist', 'drugstore', 'chemist'],
  'dental clinic': ['dental', 'dental clinic', 'dentist'],
};

// ── Pre-built lookup for fast alias → specialty resolution ───
// Built once at import time, not on every search
const _aliasMap = new Map();
SPECIALTIES.forEach((spec) => {
  spec.aliases.forEach((alias) => {
    _aliasMap.set(alias.toLowerCase(), spec);
  });
});

/**
 * Look up a specialty entry by any of its aliases.
 * Returns the full specialty object or null.
 *
 * @param {string} term
 * @returns {Object|null}
 */
export function findSpecialtyByAlias(term) {
  if (!term) return null;
  return _aliasMap.get(term.toLowerCase().trim()) || null;
}

/**
 * Find all specialties whose aliases partially match the query.
 * Used when an exact alias match fails — tries substring matching.
 *
 * @param {string} query - normalized, lowercased query
 * @returns {Array} matching specialty objects
 */
export function findSpecialtiesByPartialMatch(query) {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  const matches = new Set();

  SPECIALTIES.forEach((spec) => {
    // Check if query is a substring of any alias
    for (const alias of spec.aliases) {
      if (alias.includes(q) || q.includes(alias)) {
        matches.add(spec);
        break;
      }
    }
    // Also check matchTerms
    for (const term of spec.matchTerms) {
      if (term.includes(q) || q.includes(term)) {
        matches.add(spec);
        break;
      }
    }
  });

  return Array.from(matches);
}

/**
 * Get all unique matchTerms for a given query after resolving synonyms.
 * Returns an array of search terms to use against provider data.
 *
 * @param {string} query
 * @returns {string[]}
 */
export function getExpandedSearchTerms(query) {
  if (!query) return [];
  const q = query.toLowerCase().trim();

  // Try exact alias match first
  const exactMatch = findSpecialtyByAlias(q);
  if (exactMatch) {
    return [...new Set([...exactMatch.matchTerms, q])];
  }

  // Try partial matching
  const partialMatches = findSpecialtiesByPartialMatch(q);
  if (partialMatches.length > 0) {
    const terms = new Set([q]);
    partialMatches.forEach((spec) => {
      spec.matchTerms.forEach((t) => terms.add(t));
    });
    return Array.from(terms);
  }

  // No dictionary match — return original query
  return [q];
}
