/**
 * googleMaps.js
 * ──────────────────────────────────────────────────────────────
 * Shared loader for the Google Maps JavaScript API.
 *
 * Usage:
 *   import { loadGoogleMaps, isGoogleMapsAvailable } from '@/utils/googleMaps';
 *
 *   const google = await loadGoogleMaps();
 *   if (google) {
 *     const map = new google.maps.Map(el, { ... });
 *   }
 * ──────────────────────────────────────────────────────────────
 */

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

let _loadPromise = null;

/**
 * Returns true if the API key env var is configured (non-empty).
 */
export function isGoogleMapsConfigured() {
  return API_KEY.length > 0;
}

/**
 * Returns true if `google.maps` is already loaded on the page.
 */
export function isGoogleMapsAvailable() {
  return typeof window !== 'undefined' && window.google?.maps;
}

/**
 * Dynamically load the Google Maps JavaScript API.
 * Returns a Promise that resolves to `window.google` or `null`
 * if the API key is not set.
 *
 * The promise is cached — calling this multiple times will not
 * inject multiple script tags.
 *
 * Libraries loaded: places, geocoding, marker
 */
export function loadGoogleMaps() {
  // Already on the page
  if (isGoogleMapsAvailable()) {
    return Promise.resolve(window.google);
  }

  // No API key — resolve with null (caller handles gracefully)
  if (!isGoogleMapsConfigured()) {
    console.warn(
      '[HealthProvida] VITE_GOOGLE_MAPS_API_KEY is not set. ' +
      'Google Maps features will be unavailable. ' +
      'Add the key to your .env file and restart the dev server.'
    );
    return Promise.resolve(null);
  }

  // Return cached promise if loading is already in flight
  if (_loadPromise) return _loadPromise;

  _loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src =
      `https://maps.googleapis.com/maps/api/js` +
      `?key=${API_KEY}` +
      `&libraries=places,geocoding,marker` +
      `&callback=__healthProvidaGoogleMapsInit` +
      `&v=weekly`;
    script.async = true;
    script.defer = true;

    // Global callback invoked by the script
    window.__healthProvidaGoogleMapsInit = () => {
      delete window.__healthProvidaGoogleMapsInit;
      resolve(window.google);
    };

    script.onerror = () => {
      _loadPromise = null;
      delete window.__healthProvidaGoogleMapsInit;
      console.error('[HealthProvida] Failed to load Google Maps JavaScript API.');
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });

  return _loadPromise;
}

/**
 * Default map center — a broad African view.
 * Used when geolocation is unavailable or denied.
 * Centered roughly on Africa so the continent is visible,
 * since the platform serves a pan-African audience.
 */
export const DEFAULT_MAP_CENTER = { lat: 6.5244, lng: 3.3792 }; // Lagos, Nigeria
export const DEFAULT_MAP_ZOOM = 6; // Shows most of Nigeria

/**
 * Abuja coordinates — used for seed clinic area focus.
 */
export const ABUJA_CENTER = { lat: 9.0579, lng: 7.4951 };
