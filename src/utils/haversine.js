/**
 * haversine.js
 * ──────────────────────────────────────────────────────────────
 * Client-side Haversine formula for "straight-line" distance
 * between two geographic points.
 *
 * Used for sorting clinics by distance WITHOUT expensive Google
 * Distance Matrix API calls.
 *
 * Usage:
 *   import { haversineDistance, sortByDistance } from '@/utils/haversine';
 *
 *   const km = haversineDistance(lat1, lng1, lat2, lng2);
 *   const sorted = sortByDistance(clinics, userLat, userLng);
 * ──────────────────────────────────────────────────────────────
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Convert degrees to radians.
 */
function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate the straight-line distance between two lat/lng
 * points using the Haversine formula.
 *
 * @param {number} lat1 - Latitude of point A
 * @param {number} lng1 - Longitude of point A
 * @param {number} lat2 - Latitude of point B
 * @param {number} lng2 - Longitude of point B
 * @returns {number} Distance in kilometers (rounded to 1 decimal)
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Sort an array of clinic objects by their distance from a
 * user's position. Each clinic is expected to have `latitude`
 * and `longitude` fields.
 *
 * Returns a NEW array (does not mutate the original) with a
 * `distanceKm` property added to each clinic.
 *
 * Clinics without valid coordinates are placed at the end.
 *
 * @param {Array} clinics - Array of clinic objects with latitude/longitude
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @returns {Array} Sorted clinics with `distanceKm` field
 */
export function sortByDistance(clinics, userLat, userLng) {
  if (!userLat || !userLng) return clinics;

  return clinics
    .map((clinic) => {
      const hasCoords =
        clinic.latitude != null &&
        clinic.longitude != null &&
        !isNaN(clinic.latitude) &&
        !isNaN(clinic.longitude);

      return {
        ...clinic,
        distanceKm: hasCoords
          ? haversineDistance(userLat, userLng, clinic.latitude, clinic.longitude)
          : Infinity,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Format a distance in km for display.
 * e.g. 1.2 → "1.2 km", 0.3 → "300 m"
 *
 * @param {number} km - Distance in kilometers
 * @returns {string} Human-readable distance string
 */
export function formatDistance(km) {
  if (km === Infinity || km == null || isNaN(km)) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}
