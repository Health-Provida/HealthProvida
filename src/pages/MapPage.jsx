import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, ArrowLeft, Star, Navigation, ExternalLink, X, Phone, Clock,
  Search, SlidersHorizontal, ChevronDown, Locate, List, Map as MapIcon,
  Heart, Stethoscope, Loader2
} from 'lucide-react';
import { useClinics } from '@/context/ClinicsContext';
import { useFavorites } from '@/context/FavoritesContext';
import { loadGoogleMaps, isGoogleMapsConfigured, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, ABUJA_CENTER } from '@/utils/googleMaps';
import { haversineDistance, sortByDistance, formatDistance } from '@/utils/haversine';
import { getClinicUrl } from '@/utils/slugUtils';

// ══════════════════════════════════════════════════════════════
// MAP STYLES — Minimalist, clean Google Map theme
// ══════════════════════════════════════════════════════════════
const MAP_STYLES = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e8f5e9' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c5e1f5' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e0e0e0' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f9fafb' }] },
];

// ══════════════════════════════════════════════════════════════
// CLINIC LIST CARD
// ══════════════════════════════════════════════════════════════
function ClinicListCard({ clinic, isActive, isHovered, onHover, onLeave, onClick, onViewClinic, distanceText }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(clinic.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      data-clinic-id={clinic.id}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
        ${isActive
          ? 'border-blue-500 bg-blue-50/70 shadow-lg shadow-blue-100'
          : isHovered
            ? 'border-blue-300 bg-blue-50/30 shadow-md'
            : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
        }
      `}
    >
      {/* Favorite button */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleFavorite(clinic.id); }}
        className={`absolute top-3 right-3 p-1.5 rounded-full transition-all z-10 ${favorited ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-red-400 hover:bg-red-50'
          }`}
      >
        <Heart className={`w-4 h-4 ${favorited ? 'fill-red-500' : ''}`} />
      </button>

      <div className="flex gap-3">
        {/* Image */}
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-green-100">
          <img
            src={clinic.image_src}
            alt={clinic.practitioner_name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 truncate pr-8">{clinic.practitioner_name}</h3>
          <p className="text-xs text-blue-600 font-medium mb-1.5">{clinic.practice_type}</p>

          <div className="flex items-center gap-3 text-xs text-gray-500 mb-1.5">
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="font-semibold text-gray-700">{clinic.rating}</span>
              <span>({clinic.number_of_reviews})</span>
            </div>
            {distanceText && (
              <div className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span>{distanceText}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 truncate">{clinic.address}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={(e) => { e.stopPropagation(); onViewClinic(clinic); }}
          className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-xs font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
        >
          <ExternalLink className="w-3 h-3" />
          View Clinic
        </button>
        <a
          href={`tel:${clinic.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition flex items-center gap-1"
        >
          <Phone className="w-3 h-3" />
          Call
        </a>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAP INFO WINDOW CONTENT (HTML string for Google Maps InfoWindow)
// ══════════════════════════════════════════════════════════════
function buildInfoWindowContent(clinic, distanceText) {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 280px; padding: 0;">
      <div style="position: relative; height: 120px; overflow: hidden; border-radius: 8px 8px 0 0;">
        <img src="${clinic.image_src}" alt="${clinic.practitioner_name}" 
          style="width: 100%; height: 100%; object-fit: cover;" />
        <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);"></div>
        <div style="position: absolute; bottom: 8px; left: 10px; display: flex; align-items: center; gap: 4px;">
          <span style="color: #facc15; font-size: 14px;">★</span>
          <span style="color: white; font-size: 13px; font-weight: 700;">${clinic.rating}</span>
          <span style="color: rgba(255,255,255,0.8); font-size: 11px;">(${clinic.number_of_reviews})</span>
        </div>
      </div>
      <div style="padding: 12px 14px;">
        <h3 style="margin: 0 0 2px; font-size: 15px; font-weight: 700; color: #111827; line-height: 1.3;">
          ${clinic.practitioner_name}
        </h3>
        <p style="margin: 0 0 8px; font-size: 12px; color: #2563eb; font-weight: 500;">
          ${clinic.practice_type}
        </p>
        <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #6b7280;">
            <span style="flex-shrink: 0;">📍</span>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${clinic.address}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #6b7280;">
            <span style="flex-shrink: 0;">📞</span>
            <span>${clinic.phone}</span>
          </div>
          ${distanceText ? `
          <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #6b7280;">
            <span style="flex-shrink: 0;">📏</span>
            <span>${distanceText} away</span>
          </div>
          ` : ''}
        </div>
        <a href="${clinic.slug ? `/clinic/${clinic.slug}` : `/clinic/${clinic.id}`}" target="_blank" rel="noopener noreferrer"
          style="display: block; text-align: center; background: linear-gradient(to right, #2563eb, #16a34a); color: white; 
                 text-decoration: none; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; 
                 transition: opacity 0.2s;"
          onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
          View Clinic Page
        </a>
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════════════════════════
// CUSTOM MARKER ELEMENT (for AdvancedMarkerElement or fallback)
// ══════════════════════════════════════════════════════════════
function createMarkerContent(clinic, isActive = false) {
  const el = document.createElement('div');
  el.className = 'hp-map-marker';
  el.style.cssText = `
    display: flex; flex-direction: column; align-items: center; cursor: pointer;
    transition: transform 0.2s ease;
    transform: ${isActive ? 'scale(1.25)' : 'scale(1)'};
    filter: ${isActive ? 'drop-shadow(0 4px 12px rgba(37, 99, 235, 0.4))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'};
    z-index: ${isActive ? '999' : '1'};
  `;

  const pin = document.createElement('div');
  pin.style.cssText = `
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 3px solid ${isActive ? '#ffffff' : '#3b82f6'};
    background: ${isActive ? '#2563eb' : '#ffffff'};
    transition: all 0.2s ease;
  `;

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('width', '16');
  icon.setAttribute('height', '16');
  icon.setAttribute('fill', isActive ? '#ffffff' : '#2563eb');
  icon.innerHTML = '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>';
  pin.appendChild(icon);

  const tail = document.createElement('div');
  tail.style.cssText = `
    width: 0; height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid ${isActive ? '#2563eb' : '#ffffff'};
    margin-top: -2px;
  `;

  const shadow = document.createElement('div');
  shadow.style.cssText = `
    width: 14px; height: 4px;
    background: rgba(0,0,0,0.15);
    border-radius: 50%;
    margin-top: 2px;
    filter: blur(1px);
  `;

  el.appendChild(pin);
  el.appendChild(tail);
  el.appendChild(shadow);
  return el;
}

// ══════════════════════════════════════════════════════════════
// GRACEFUL FALLBACK — shown when API key is not configured
// ══════════════════════════════════════════════════════════════
function MapFallback() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 p-8">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl mb-6">
          <MapIcon className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Map Not Available</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          The interactive map requires a Google Maps API key. Add your key to the
          <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono mx-1">.env</code>
          file as <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">VITE_GOOGLE_MAPS_API_KEY</code> and restart the dev server.
        </p>
        <div className="p-4 bg-white rounded-xl border border-gray-200 text-left">
          <p className="text-xs font-medium text-gray-700 mb-2">Required Google Cloud APIs:</p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Maps JavaScript API
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Places API
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              Geocoding API
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FILTER BAR
// ══════════════════════════════════════════════════════════════
function FilterBar({ searchQuery, onSearchChange, practiceTypes, selectedType, onTypeChange, minRating, onRatingChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search clinics..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Practice type dropdown */}
      <div className="relative">
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">All Specialties</option>
          {practiceTypes.map(pt => (
            <option key={pt} value={pt}>{pt}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Rating filter */}
      <div className="relative">
        <select
          value={minRating}
          onChange={(e) => onRatingChange(Number(e.target.value))}
          className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value={0}>Any Rating</option>
          <option value={4.5}>4.5+ ★</option>
          <option value={4}>4.0+ ★</option>
          <option value={3.5}>3.5+ ★</option>
          <option value={3}>3.0+ ★</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN MAP PAGE
// ══════════════════════════════════════════════════════════════
export default function MapPage() {
  const navigate = useNavigate();
  const { clinics, loading } = useClinics();

  // ── Map state ──────────────────────────────────────────────
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(new Map()); // clinicId → { marker, element }
  const infoWindowRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  // ── User location ──────────────────────────────────────────
  const [userLocation, setUserLocation] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);

  // ── UI state ───────────────────────────────────────────────
  const [activeClinicId, setActiveClinicId] = useState(null);
  const [hoveredClinicId, setHoveredClinicId] = useState(null);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'map'
  const [mapBounds, setMapBounds] = useState(null);

  // ── Filter state ───────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPracticeType, setSelectedPracticeType] = useState('');
  const [minRating, setMinRating] = useState(0);

  // ── Derived data ───────────────────────────────────────────
  const practiceTypes = useMemo(() => {
    const set = new Set();
    clinics.forEach(c => { if (c.practice_type) set.add(c.practice_type); });
    return [...set].sort();
  }, [clinics]);

  // Clinics with distance calculated
  const clinicsWithDistance = useMemo(() => {
    if (userLocation) {
      return sortByDistance(clinics, userLocation.lat, userLocation.lng);
    }
    return clinics.map(c => ({ ...c, distanceKm: null }));
  }, [clinics, userLocation]);

  // Filtered clinics
  const filteredClinics = useMemo(() => {
    let results = [...clinicsWithDistance];

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(c => {
        return (
          c.practitioner_name?.toLowerCase().includes(q) ||
          c.practice_type?.toLowerCase().includes(q) ||
          c.address?.toLowerCase().includes(q) ||
          c.specialties?.some(s => s.toLowerCase().includes(q))
        );
      });
    }

    // Practice type
    if (selectedPracticeType) {
      results = results.filter(c => c.practice_type === selectedPracticeType);
    }

    // Rating
    if (minRating > 0) {
      results = results.filter(c => (c.rating || 0) >= minRating);
    }

    // Filter to map bounds (only clinics with coords visible on map)
    if (mapBounds) {
      results = results.filter(c => {
        if (c.latitude == null || c.longitude == null) return true; // show clinics without coords in list
        return mapBounds.contains({ lat: c.latitude, lng: c.longitude });
      });
    }

    return results;
  }, [clinicsWithDistance, searchQuery, selectedPracticeType, minRating, mapBounds]);

  // Clinics that have valid geo coordinates for markers
  const geoEnabledClinics = useMemo(() => {
    return filteredClinics.filter(c => c.latitude != null && c.longitude != null);
  }, [filteredClinics]);

  // ── Get user location ──────────────────────────────────────
  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocatingUser(false);
        // Pan map to user location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(loc);
          mapInstanceRef.current.setZoom(12);
        }
      },
      () => {
        setLocatingUser(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  // ── Initialize Google Map ──────────────────────────────────
  useEffect(() => {
    if (!isGoogleMapsConfigured()) {
      setMapError(true);
      return;
    }

    let cancelled = false;

    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !google || !mapContainerRef.current) return;

        const map = new google.maps.Map(mapContainerRef.current, {
          center: DEFAULT_MAP_CENTER,
          zoom: DEFAULT_MAP_ZOOM,
          styles: MAP_STYLES,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          gestureHandling: 'greedy',
          clickableIcons: false,
          mapId: 'healthprovida-map', // Required for AdvancedMarkerElement
        });

        mapInstanceRef.current = map;

        // Create a single shared InfoWindow
        infoWindowRef.current = new google.maps.InfoWindow({
          maxWidth: 300,
          pixelOffset: new google.maps.Size(0, -8),
        });

        // Close InfoWindow on map click
        map.addListener('click', () => {
          infoWindowRef.current?.close();
          setActiveClinicId(null);
        });

        // Update bounds when map moves
        map.addListener('idle', () => {
          const bounds = map.getBounds();
          if (bounds) setMapBounds(bounds);
        });

        setMapReady(true);

        // Try getting user location to center map
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (cancelled) return;
              const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              setUserLocation(loc);
              map.panTo(loc);
              map.setZoom(12);
            },
            () => {
              // Geolocation denied — fit to clinic bounds if available
              // Will be handled in the markers effect
            },
            { enableHighAccuracy: false, timeout: 6000 }
          );
        }
      })
      .catch(() => {
        if (!cancelled) setMapError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Render / update markers ────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;

    const google = window.google;
    if (!google?.maps) return;

    const map = mapInstanceRef.current;
    const existingMarkers = markersRef.current;
    const currentClinicIds = new Set(geoEnabledClinics.map(c => c.id));

    // Remove markers that are no longer in the filtered set
    existingMarkers.forEach((entry, clinicId) => {
      if (!currentClinicIds.has(clinicId)) {
        entry.marker.setMap(null);
        existingMarkers.delete(clinicId);
      }
    });

    // Add or update markers
    const bounds = new google.maps.LatLngBounds();
    let hasAnyMarker = false;

    geoEnabledClinics.forEach((clinic) => {
      const pos = { lat: clinic.latitude, lng: clinic.longitude };
      bounds.extend(pos);
      hasAnyMarker = true;

      if (existingMarkers.has(clinic.id)) {
        // Marker already exists — just update its position if needed
        return;
      }

      // Create a standard marker (AdvancedMarkerElement requires mapId which may not work without billing)
      const marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: clinic.practitioner_name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        animation: google.maps.Animation.DROP,
        optimized: true,
      });

      // Click listener — show InfoWindow
      marker.addListener('click', () => {
        const distText = clinic.distanceKm != null && clinic.distanceKm !== Infinity
          ? formatDistance(clinic.distanceKm) : '';
        infoWindowRef.current.setContent(buildInfoWindowContent(clinic, distText));
        infoWindowRef.current.open(map, marker);
        setActiveClinicId(clinic.id);

        // Scroll list to this clinic
        const listEl = document.querySelector(`[data-clinic-id="${clinic.id}"]`);
        if (listEl) listEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      // Hover listeners
      marker.addListener('mouseover', () => {
        marker.setIcon({
          ...marker.getIcon(),
          scale: 14,
          fillColor: '#1d4ed8',
        });
        setHoveredClinicId(clinic.id);
      });

      marker.addListener('mouseout', () => {
        marker.setIcon({
          ...marker.getIcon(),
          scale: 10,
          fillColor: activeClinicId === clinic.id ? '#1d4ed8' : '#2563eb',
        });
        setHoveredClinicId(null);
      });

      existingMarkers.set(clinic.id, { marker });
    });

    // Fit bounds to show all markers (only on initial load or if no user location)
    if (hasAnyMarker && !userLocation) {
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [mapReady, geoEnabledClinics, userLocation]);

  // ── Highlight marker when list card is hovered ─────────────
  useEffect(() => {
    if (!mapReady) return;
    const google = window.google;
    if (!google?.maps) return;

    markersRef.current.forEach((entry, clinicId) => {
      const isHovered = hoveredClinicId === clinicId;
      const isActive = activeClinicId === clinicId;
      const highlighted = isHovered || isActive;

      entry.marker.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: highlighted ? 14 : 10,
        fillColor: highlighted ? '#1d4ed8' : '#2563eb',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: highlighted ? 4 : 3,
      });
      entry.marker.setZIndex(highlighted ? 999 : 1);
    });
  }, [hoveredClinicId, activeClinicId, mapReady]);

  // ── Handlers ───────────────────────────────────────────────
  const handleCardClick = useCallback((clinic) => {
    setActiveClinicId(clinic.id);

    // Pan map to this clinic
    if (mapInstanceRef.current && clinic.latitude && clinic.longitude) {
      mapInstanceRef.current.panTo({ lat: clinic.latitude, lng: clinic.longitude });

      // Open InfoWindow
      const entry = markersRef.current.get(clinic.id);
      if (entry && infoWindowRef.current) {
        const distText = clinic.distanceKm != null && clinic.distanceKm !== Infinity
          ? formatDistance(clinic.distanceKm) : '';
        infoWindowRef.current.setContent(buildInfoWindowContent(clinic, distText));
        infoWindowRef.current.open(mapInstanceRef.current, entry.marker);
      }
    }

    // On mobile, switch to map view
    setMobileView('map');
  }, []);

  const handleViewClinic = useCallback((clinic) => {
    navigate(getClinicUrl(clinic));
  }, [navigate]);

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 shadow-sm z-30 flex-shrink-0">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition font-medium text-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Navigation className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 leading-tight">Explore Clinics</h1>
                <p className="text-[11px] text-gray-500 hidden sm:block">
                  {loading ? 'Loading...' : `${filteredClinics.length} clinics found`}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile view toggle */}
          <div className="flex lg:hidden items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setMobileView('list')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition ${mobileView === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setMobileView('map')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition ${mobileView === 'map' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Map
            </button>
          </div>

          {/* Desktop: Locate me button */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={requestUserLocation}
              disabled={locatingUser}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-50"
            >
              {locatingUser ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Locate className="w-4 h-4" />
              )}
              <span className="hidden xl:inline">My Location</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-4 sm:px-6 pb-3">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            practiceTypes={practiceTypes}
            selectedType={selectedPracticeType}
            onTypeChange={setSelectedPracticeType}
            minRating={minRating}
            onRatingChange={setMinRating}
          />
        </div>
      </div>

      {/* ── Main content: split panel ─────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: clinic list */}
        <div className={`
          w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 flex flex-col
          border-r border-gray-200 bg-white
          ${mobileView === 'map' ? 'hidden lg:flex' : 'flex'}
        `}>
          {/* Result count */}
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
            <span className="text-xs text-gray-500">
              {loading ? (
                <span className="animate-pulse">Searching...</span>
              ) : (
                <>
                  <span className="font-semibold text-gray-800">{filteredClinics.length}</span> clinics
                  {userLocation && ' • sorted by distance'}
                </>
              )}
            </span>
            {/* Mobile: Locate me */}
            <button
              onClick={requestUserLocation}
              disabled={locatingUser}
              className="lg:hidden flex items-center gap-1 px-2 py-1 text-xs text-blue-600 font-medium hover:bg-blue-50 rounded transition disabled:opacity-50"
            >
              {locatingUser ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Locate className="w-3.5 h-3.5" />}
              Locate me
            </button>
          </div>

          {/* Scrollable clinic list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5" style={{ scrollbarWidth: 'thin' }}>
            {loading ? (
              // Skeleton cards
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-100 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-lg bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : filteredClinics.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-3">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">No clinics found</p>
                <p className="text-xs text-gray-500">Try adjusting your filters or pan the map.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredClinics.map(clinic => (
                  <ClinicListCard
                    key={clinic.id}
                    clinic={clinic}
                    isActive={activeClinicId === clinic.id}
                    isHovered={hoveredClinicId === clinic.id}
                    onHover={() => setHoveredClinicId(clinic.id)}
                    onLeave={() => setHoveredClinicId(null)}
                    onClick={() => handleCardClick(clinic)}
                    onViewClinic={handleViewClinic}
                    distanceText={
                      clinic.distanceKm != null && clinic.distanceKm !== Infinity
                        ? formatDistance(clinic.distanceKm)
                        : clinic.distance_from_location || ''
                    }
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Right panel: Google Map */}
        <div className={`
          flex-1 relative
          ${mobileView === 'list' ? 'hidden lg:block' : 'block'}
        `}>
          {mapError ? (
            <MapFallback />
          ) : (
            <>
              {/* Map container */}
              <div ref={mapContainerRef} className="absolute inset-0" />

              {/* Loading overlay */}
              {!mapReady && !mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading map...</p>
                  </div>
                </div>
              )}

              {/* User location indicator */}
              {userLocation && mapReady && (
                <div className="absolute bottom-4 left-4 z-10">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 px-3 py-2 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-xs text-gray-600">Your location</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
