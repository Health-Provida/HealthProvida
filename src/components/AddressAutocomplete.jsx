import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import { loadGoogleMaps, isGoogleMapsConfigured } from '@/utils/googleMaps';

/**
 * AddressAutocomplete
 * ──────────────────────────────────────────────────────────────
 * A Google Places Autocomplete input for address entry.
 * Biased to Africa with priority on the user's country.
 *
 * Falls back to a plain text input if no API key is configured.
 *
 * Props:
 *   value            - Controlled input value (address string)
 *   onChange          - Called on every keystroke (e) => void
 *   onAddressSelect  - Called when a place is selected:
 *                      (address, lat, lng) => void
 *   placeholder      - Input placeholder text
 *   required         - HTML required attribute
 *   className        - Additional className for the wrapper
 *   inputClassName   - Additional className for the input element
 *   name             - Input name attribute
 * ──────────────────────────────────────────────────────────────
 */
export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = 'Start typing an address...',
  required = false,
  className = '',
  inputClassName = '',
  name = 'address',
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Load the Google Maps API
  useEffect(() => {
    if (!isGoogleMapsConfigured()) return;

    let cancelled = false;

    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !google) return;
        setApiLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Initialize autocomplete once API is loaded and input is mounted
  useEffect(() => {
    if (!apiLoaded || !inputRef.current || autocompleteRef.current) return;

    const google = window.google;
    if (!google?.maps?.places) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      fields: ['formatted_address', 'geometry', 'name', 'address_components'],
      // No country restriction — serves all of Africa
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return;

      const address = place.formatted_address || place.name || '';
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      // Extract city and state from address_components
      let city = '';
      let state = '';
      if (place.address_components) {
        for (const component of place.address_components) {
          if (component.types.includes('locality')) {
            city = component.long_name;
          } else if (!city && component.types.includes('administrative_area_level_2')) {
            // Fallback: some African addresses use level_2 for city
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.short_name;
          }
        }
      }

      if (onAddressSelect) {
        onAddressSelect(address, lat, lng, city, state);
      }
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [apiLoaded, onAddressSelect]);

  // Prevent form submission when pressing Enter to select a suggestion
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      // If the autocomplete dropdown is open, prevent form submit
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer && pacContainer.style.display !== 'none') {
        e.preventDefault();
      }
    }
  }, []);

  const showAutocompleteHint =
    isGoogleMapsConfigured() && apiLoaded && !loadError;

  return (
    <div className={`relative ${className}`}>
      <MapPin
        className="absolute left-3 top-3 text-gray-400 pointer-events-none"
        size={18}
      />
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className={`w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 ${inputClassName}`}
      />
      {showAutocompleteHint && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-300"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>
      )}
    </div>
  );
}
