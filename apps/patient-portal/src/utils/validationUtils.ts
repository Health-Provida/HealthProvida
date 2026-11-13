/**
 * validationUtils.js
 * ──────────────────────────────────────────────────────────────
 * Centralized validation utilities for form fields.
 * Provides regex-based validators, a password strength checker,
 * and a Supabase error message mapper.
 * ──────────────────────────────────────────────────────────────
 */

// ─── Email ─────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate an email address.
 * @param {string} email
 * @returns {string|null} Error message or null if valid.
 */
export function validateEmail(email) {
  if (!email || !email.trim()) return 'Email is required.';
  if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address.';
  return null;
}

// ─── Password ──────────────────────────────────────────────────
const PASSWORD_RULES = [
  { test: (p) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p) => /[0-9]/.test(p), label: 'One number' },
  { test: (p) => /[^A-Za-z0-9]/.test(p), label: 'One special character (!@#$%...)' },
];

/**
 * Validate password strength.
 * @param {string} password
 * @returns {{ isValid: boolean, strength: 'weak'|'fair'|'strong', errors: string[], score: number }}
 */
export function validatePassword(password) {
  if (!password) {
    return { isValid: false, strength: 'weak', errors: ['Password is required.'], score: 0 };
  }

  const passed = PASSWORD_RULES.filter((rule) => rule.test(password));
  const failed = PASSWORD_RULES.filter((rule) => !rule.test(password));
  const score = passed.length;

  let strength = 'weak';
  if (score >= 4) strength = 'fair';
  if (score === 5) strength = 'strong';

  return {
    isValid: score === 5,
    strength,
    errors: failed.map((r) => r.label),
    score,
  };
}

// ─── Phone ─────────────────────────────────────────────────────
const PHONE_REGEX = /^\+?[\d\s\-()]{7,15}$/;

/**
 * Validate a phone number format (optional field — empty is valid).
 * @param {string} phone
 * @returns {string|null} Error message or null if valid.
 */
export function validatePhone(phone) {
  if (!phone || !phone.trim()) return null; // Optional
  if (!PHONE_REGEX.test(phone.trim())) {
    return 'Please enter a valid phone number (7–15 digits).';
  }
  return null;
}

// ─── Name ──────────────────────────────────────────────────────
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,}$/;

/**
 * Validate a name field.
 * @param {string} name
 * @param {string} [fieldLabel='Name'] Human-readable field name for the error.
 * @returns {string|null}
 */
export function validateName(name, fieldLabel = 'Name') {
  if (!name || !name.trim()) return `${fieldLabel} is required.`;
  if (name.trim().length < 2) return `${fieldLabel} must be at least 2 characters.`;
  if (!NAME_REGEX.test(name.trim())) {
    return `${fieldLabel} can only contain letters, hyphens, and apostrophes.`;
  }
  return null;
}

// ─── Date of Birth ─────────────────────────────────────────────

/**
 * Validate date of birth (must be at least 18, not in the future).
 * @param {string} dob — ISO date string (YYYY-MM-DD)
 * @returns {string|null}
 */
export function validateDateOfBirth(dob) {
  if (!dob) return 'Date of birth is required.';

  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return 'Please enter a valid date.';

  const today = new Date();
  if (birthDate > today) return 'Date of birth cannot be in the future.';

  // Must be at least 18
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

  if (actualAge < 18) return 'You must be at least 18 years old to create an account.';

  return null;
}

// ─── Supabase Error Mapper ─────────────────────────────────────

const SUPABASE_ERROR_MAP = [
  {
    match: /user already registered/i,
    message: 'An account with this email already exists. Try logging in instead.',
  },
  {
    match: /password should be at least/i,
    message: 'Password is too weak. Please use at least 8 characters with a mix of letters, numbers, and symbols.',
  },
  {
    match: /invalid.*email/i,
    message: 'Please enter a valid email address.',
  },
  {
    match: /email rate limit exceeded/i,
    message: 'Too many signup attempts. Please wait a few minutes and try again.',
  },
  {
    match: /signup.*disabled/i,
    message: 'Signups are currently disabled. Please try again later.',
  },
  {
    match: /duplicate key.*phone/i,
    message: 'This phone number is already associated with an account.',
  },
  {
    match: /invalid login credentials/i,
    message: 'Invalid email or password.',
  },
  {
    match: /email not confirmed/i,
    message: 'Please verify your email address before logging in.',
  },
  {
    match: /token.*expired|otp.*expired/i,
    message: 'Your verification code has expired. Please request a new one.',
  },
  {
    match: /invalid.*otp|otp.*invalid/i,
    message: 'Invalid verification code. Please check and try again.',
  },
];

/**
 * Map a Supabase auth error to a user-friendly message.
 * @param {Error|{message: string}} error
 * @returns {string}
 */
export function mapSupabaseError(error) {
  const msg = error?.message || error?.error_description || String(error);

  for (const entry of SUPABASE_ERROR_MAP) {
    if (entry.match.test(msg)) return entry.message;
  }

  // Fallback
  return 'Something went wrong. Please try again.';
}
