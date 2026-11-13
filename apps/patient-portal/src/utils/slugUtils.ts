/**
 * slugUtils.js
 * ──────────────────────────────────────────────────────────────
 * Client-side slug utilities for HealthProvida clinic URLs.
 *
 * These functions mirror the SQL implementations in
 * supabase_slug_migration.sql so that slugs generated on the
 * client (for preview / link-building) match what the DB stores.
 *
 * The canonical slug always lives in the `clinics.slug` column;
 * these helpers are used for:
 *   • Building clinic URLs from shaped clinic objects
 *   • Previewing what a slug will look like before DB insert
 * ──────────────────────────────────────────────────────────────
 */

/**
 * Convert any string to a lowercase URL-safe slug.
 * Mirrors the SQL `slugify()` function.
 *
 * @param {string} text
 * @returns {string}
 *
 * @example slugify('Apex Dental')   → 'apex-dental'
 * @example slugify('Austin, TX')    → 'austin-tx'
 */
export function slugify(text) {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // strip non-alphanumeric (keep space/dash)
    .replace(/[\s-]+/g, '-')         // collapse spaces/dashes → single dash
    .replace(/^-|-$/g, '');          // trim leading/trailing dashes
}

/**
 * Produce a deterministic 4-character base-36 hash from a clinic's
 * numeric ID.  Uses the same prime multiplier (6700417) as the SQL
 * `clinic_short_hash()` function so results are identical.
 *
 * @param {number} id - Clinic BIGINT id
 * @returns {string}  - 4-char string like '8x2k'
 */
export function clinicShortHash(id) {
  const CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';
  const MOD = 36 * 36 * 36 * 36; // 1,679,616

  let hashNum = ((id * 6700417) + 1337) % MOD;
  if (hashNum < 0) hashNum += MOD;

  let result = '';
  for (let i = 0; i < 4; i++) {
    result = CHARS[hashNum % 36] + result;
    hashNum = Math.floor(hashNum / 36);
  }
  return result;
}

/**
 * Assemble the Tier 1 base slug from name + location fields.
 * Does NOT check for collisions — that happens in the DB.
 *
 * @param {string} name  - Clinic / practitioner name
 * @param {string} [city]
 * @param {string} [state]
 * @returns {string}
 *
 * @example generateClinicSlug('Apex Dental', 'Austin', 'TX')
 *          → 'apex-dental-austin-tx'
 */
export function generateClinicSlug(name, city, state) {
  let slug = slugify(name);
  if (city) slug += '-' + slugify(city);
  if (state) slug += '-' + slugify(state);
  return slug;
}

/**
 * Return the public URL path for a clinic.
 * Prefers the DB-stored slug; falls back to numeric ID so that
 * links never break even if the slug column is empty.
 *
 * @param {Object} clinic - Shaped clinic object (must have .id, may have .slug)
 * @returns {string} e.g. '/clinic/apex-dental-austin-tx'
 */
export function getClinicUrl(clinic) {
  if (clinic?.slug) return `/clinic/${clinic.slug}`;
  return `/clinic/${clinic?.id ?? ''}`;
}
