/**
 * redFlags.js
 * ──────────────────────────────────────────────────────────────
 * Central data file for the red-flag (triage) screening flow.
 *
 * Contains:
 *   1. RED_FLAGS          – the 11 emergency symptom definitions
 *   2. COMPLAINT_CATEGORIES – presenting-complaint options
 *   3. COMPLAINT_RED_FLAG_MAP – complaint → relevant red flag ids
 *   4. KEYWORD_ALIASES    – free-text → category matching
 *   5. SHOW_ALL_RED_FLAGS – config toggle
 * ──────────────────────────────────────────────────────────────
 */

// ─── Red Flag Catalogue ─────────────────────────────────────────
export const RED_FLAGS = [
  {
    id: 'heart_attack',
    label: 'Signs of a heart attack',
    description:
      'Chest pain, pressure, heaviness, tightness or squeezing across the chest',
  },
  {
    id: 'stroke',
    label: 'Signs of a stroke',
    description:
      'Face dropping on one side, cannot hold both arms up, difficulty speaking',
  },
  {
    id: 'confusion',
    label: 'Sudden confusion (delirium)',
    description:
      'Cannot be sure of own name or age, slurred speech or not making sense',
  },
  {
    id: 'suicide_attempt',
    label: 'Suicide attempt',
    description: 'By taking something or self-harming',
  },
  {
    id: 'breathing',
    label: 'Severe difficulty breathing',
    description:
      'Not being able to get words out, breathing very fast, choking or gasping',
  },
  {
    id: 'bleeding',
    label: 'Heavy bleeding',
    description: 'Spraying, pouring, or enough to make a puddle',
  },
  {
    id: 'injury',
    label: 'Severe injuries',
    description: 'After a serious accident',
  },
  {
    id: 'seizure',
    label: 'Seizure (fit)',
    description:
      'Shaking or jerking because of a fit, or unconscious (can\u2019t be woken up)',
  },
  {
    id: 'swelling',
    label: 'Sudden, rapid swelling',
    description: 'Of the lips, mouth, throat or tongue',
  },
  {
    id: 'labour',
    label: 'Labour or childbirth',
    description:
      'Water breaking, more frequent intense cramps (contractions), baby coming, or just born',
  },
  {
    id: 'sepsis',
    label: 'Signs of a severe infection (sepsis)',
    description:
      'Blue, grey, pale or blotchy skin, lips, tongue, palms or soles; a rash that does not fade when you roll a glass over it; or high temperature with a stiff neck or being bothered by light',
  },
];

// ─── Complaint Categories ───────────────────────────────────────
export const COMPLAINT_CATEGORIES = [
  { id: 'chest_pain', label: 'Chest pain' },
  { id: 'abdominal_pain', label: 'Abdominal pain' },
  { id: 'headache', label: 'Headache' },
  { id: 'breathing_problems', label: 'Breathing problems' },
  { id: 'fever', label: 'Fever' },
  { id: 'injury_or_trauma', label: 'Injury or trauma' },
  { id: 'rash_or_allergic_reaction', label: 'Rash or allergic reaction' },
  { id: 'dizziness_or_fainting', label: 'Dizziness or fainting' },
  { id: 'vomiting_or_diarrhoea', label: 'Vomiting or diarrhoea' },
  { id: 'mental_health_or_low_mood', label: 'Mental health or low mood' },
  { id: 'pregnancy_related', label: 'Pregnancy related' },
  { id: 'weakness_or_numbness', label: 'Weakness or numbness' },
  { id: 'throat_or_swallowing', label: 'Throat or swallowing' },
  { id: 'back_pain', label: 'Back pain' },
  { id: 'other', label: 'Something else' },
];

// ─── Complaint → Red Flag Mapping ───────────────────────────────
export const COMPLAINT_RED_FLAG_MAP = {
  chest_pain: ['heart_attack', 'breathing', 'sepsis', 'confusion'],
  abdominal_pain: ['bleeding', 'labour', 'sepsis', 'injury', 'confusion'],
  headache: ['stroke', 'sepsis', 'confusion', 'seizure'],
  breathing_problems: ['breathing', 'swelling', 'heart_attack', 'sepsis'],
  fever: ['sepsis', 'confusion', 'seizure', 'breathing'],
  injury_or_trauma: ['injury', 'bleeding', 'seizure', 'confusion'],
  rash_or_allergic_reaction: ['swelling', 'sepsis', 'breathing'],
  dizziness_or_fainting: ['stroke', 'heart_attack', 'seizure', 'confusion', 'bleeding'],
  vomiting_or_diarrhoea: ['sepsis', 'confusion', 'bleeding'],
  mental_health_or_low_mood: ['suicide_attempt', 'confusion'],
  pregnancy_related: ['labour', 'bleeding', 'sepsis'],
  weakness_or_numbness: ['stroke', 'seizure', 'confusion'],
  throat_or_swallowing: ['swelling', 'breathing', 'sepsis'],
  back_pain: ['injury', 'sepsis', 'bleeding'],
  other: [
    'heart_attack', 'stroke', 'confusion', 'suicide_attempt',
    'breathing', 'bleeding', 'injury', 'seizure', 'swelling',
    'labour', 'sepsis',
  ],
};

// ─── Keyword Aliases (free-text → complaint category) ───────────
// Each entry maps an array of lowercase keywords/phrases to a
// complaint category id. Used by matchFreeTextToCategories().
export const KEYWORD_ALIASES = {
  chest_pain: [
    'chest', 'heart pain', 'heartburn', 'palpitation', 'palpitations',
    'chest tightness', 'chest pressure', 'angina',
  ],
  abdominal_pain: [
    'stomach', 'belly', 'tummy', 'abdomen', 'abdominal', 'stomach ache',
    'stomach pain', 'belly pain', 'tummy ache', 'cramp', 'cramps',
    'gastric', 'bloating', 'bloated',
  ],
  headache: [
    'headache', 'head ache', 'head pain', 'migraine', 'head hurts',
    'head pounding', 'head throbbing',
  ],
  breathing_problems: [
    'breathing', 'breath', 'breathless', 'short of breath', 'shortness of breath',
    'asthma', 'wheeze', 'wheezing', "can't breathe", 'cannot breathe',
    'difficulty breathing', 'hard to breathe',
  ],
  fever: [
    'fever', 'high temperature', 'hot', 'feverish', 'temperature',
    'chills', 'shivering', 'malaria',
  ],
  injury_or_trauma: [
    'injury', 'injured', 'trauma', 'accident', 'crash', 'fall', 'fell',
    'broken', 'fracture', 'wound', 'cut', 'hit',
  ],
  rash_or_allergic_reaction: [
    'rash', 'allergic', 'allergy', 'allergies', 'hives', 'itch', 'itchy',
    'itching', 'skin reaction', 'bumps', 'spots',
  ],
  dizziness_or_fainting: [
    'dizzy', 'dizziness', 'faint', 'fainting', 'fainted', 'light-headed',
    'lightheaded', 'vertigo', 'spinning', 'blackout', 'blacked out',
    'pass out', 'passed out',
  ],
  vomiting_or_diarrhoea: [
    'vomit', 'vomiting', 'throwing up', 'throw up', 'nausea', 'nauseous',
    'diarrhoea', 'diarrhea', 'loose stool', 'watery stool', 'purging',
    'running stomach',
  ],
  mental_health_or_low_mood: [
    'mental health', 'depression', 'depressed', 'anxious', 'anxiety',
    'sad', 'low mood', 'suicidal', 'self-harm', 'self harm', 'panic',
    'panic attack', 'stressed', 'overwhelmed',
  ],
  pregnancy_related: [
    'pregnant', 'pregnancy', 'labour', 'labor', 'contraction', 'contractions',
    'water broke', 'water breaking', 'baby', 'antenatal', 'prenatal',
    'morning sickness', 'trimester',
  ],
  weakness_or_numbness: [
    'weak', 'weakness', 'numb', 'numbness', 'tingling', 'pins and needles',
    "can't move", 'cannot move', 'paralysis', 'paralysed', 'paralyzed',
  ],
  throat_or_swallowing: [
    'throat', 'sore throat', 'swallow', 'swallowing', "can't swallow",
    'cannot swallow', 'lump in throat', 'tonsil', 'tonsils',
  ],
  back_pain: [
    'back', 'back pain', 'backache', 'back ache', 'lower back',
    'upper back', 'spine', 'spinal',
  ],
};

/**
 * Match free-text input to complaint categories using keyword aliases.
 * Returns an array of matched category IDs, or ['other'] if nothing matched.
 */
export function matchFreeTextToCategories(text) {
  if (!text || !text.trim()) return [];
  const lower = text.toLowerCase().trim();

  const matched = new Set();
  for (const [categoryId, keywords] of Object.entries(KEYWORD_ALIASES)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        matched.add(categoryId);
        break;
      }
    }
  }

  return matched.size > 0 ? Array.from(matched) : ['other'];
}

/**
 * Given an array of complaint category IDs, returns the union of
 * mapped red flag IDs (de-duplicated, order preserved).
 */
export function getRedFlagsForComplaints(complaintIds) {
  const seen = new Set();
  const result = [];

  for (const complaintId of complaintIds) {
    const flagIds = COMPLAINT_RED_FLAG_MAP[complaintId] || [];
    for (const flagId of flagIds) {
      if (!seen.has(flagId)) {
        seen.add(flagId);
        result.push(flagId);
      }
    }
  }

  return result;
}

/**
 * Given an array of mapped red flag IDs, returns the remaining
 * red flags (those NOT in the mapped set).
 */
export function getRemainingRedFlags(mappedFlagIds) {
  const mappedSet = new Set(mappedFlagIds);
  return RED_FLAGS.filter(rf => !mappedSet.has(rf.id));
}

// ─── Config ─────────────────────────────────────────────────────
/**
 * When true, the red flag screen shows ALL red flags in two groups:
 *   1. "Based on what you've told us" (mapped)
 *   2. "Other emergency symptoms" (remaining)
 * When false, only group 1 is shown.
 */
export const SHOW_ALL_RED_FLAGS = true;
