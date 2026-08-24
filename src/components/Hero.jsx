import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Crosshair, Stethoscope, Building2, Pill, Baby, Heart, Eye, Brain, Bone } from 'lucide-react';
import RotatingText from './RotatingText';
import { useClinics } from '@/context/ClinicsContext';
import { fetchStats } from '@/utils/supabaseQueries';
import { findSpecialtiesByPartialMatch, findSpecialtyByAlias } from '@/utils/healthcareSearchDictionary';

// Words that rotate in the hero heading
const ROTATING_WORDS = ['Healthcare', 'Hospitals', 'Clinics', 'Laboratories', 'Pharmacies', 'Practitioners'];

// Quick-access category chips — these map to common search queries
const QUICK_CATEGORIES = [
  { label: 'Hospitals', icon: Building2, query: 'Hospital' },
  { label: 'Dentists', icon: Stethoscope, query: 'Dental' },
  { label: 'Pharmacies', icon: Pill, query: 'Pharmacy' },
  { label: 'Pediatrics', icon: Baby, query: 'Pediatric' },
  { label: 'Cardiology', icon: Heart, query: 'Cardiology' },
  { label: 'Eye Care', icon: Eye, query: 'Eye' },
  { label: 'Orthopedics', icon: Bone, query: 'Orthopedic' },
  { label: 'Neurology', icon: Brain, query: 'Neurology' },
];

// ── Typeahead suggestions helper ─────────────────────────────
// Builds suggestions from the loaded clinic data
function buildSuggestions(clinics) {
  const suggestions = new Map();

  clinics.forEach((c) => {
    // Practitioner names
    if (c.practitioner_name) {
      suggestions.set(c.practitioner_name, { type: 'clinic', label: c.practitioner_name, sublabel: c.practice_type });
    }
    // Practice types
    if (c.practice_type && !suggestions.has(c.practice_type)) {
      suggestions.set(c.practice_type, { type: 'type', label: c.practice_type });
    }
    // Specialties
    (c.specialties || []).forEach((s) => {
      if (!suggestions.has(s)) {
        suggestions.set(s, { type: 'specialty', label: s });
      }
    });
  });

  return Array.from(suggestions.values());
}

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [stats, setStats] = useState({ providerCount: 0, reviewCount: 0, hmoCount: 0 });

  const navigate = useNavigate();
  const { clinics } = useClinics();
  const searchInputRef = useRef(null);
  const locationInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats().then(({ data }) => {
      if (data) setStats(data);
    });
  }, []);

  // Build typeahead suggestions from clinic data
  const allSuggestions = React.useMemo(() => buildSuggestions(clinics), [clinics]);

  const filteredSuggestions = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();

    // 1. Standard suggestions from clinic data
    const clinicMatches = allSuggestions
      .filter((s) => s.label.toLowerCase().includes(q))
      .slice(0, 4);

    // 2. Synonym-based suggestions from the healthcare dictionary
    //    (e.g. typing "heart doctor" → suggest "Cardiology")
    const dictionarySuggestions = [];
    const exact = findSpecialtyByAlias(q);
    if (exact) {
      // Exact alias match — suggest the canonical specialty
      const alreadyListed = clinicMatches.some(
        (s) => s.label.toLowerCase() === exact.canonical.toLowerCase()
      );
      if (!alreadyListed) {
        dictionarySuggestions.push({
          type: 'specialty',
          label: exact.canonical,
          sublabel: 'Specialty',
        });
      }
    } else {
      // Partial match — suggest matching specialties
      const partials = findSpecialtiesByPartialMatch(q);
      for (const spec of partials.slice(0, 2)) {
        const alreadyListed = clinicMatches.some(
          (s) => s.label.toLowerCase() === spec.canonical.toLowerCase()
        );
        if (!alreadyListed) {
          dictionarySuggestions.push({
            type: 'specialty',
            label: spec.canonical,
            sublabel: 'Specialty',
          });
        }
      }
    }

    return [...dictionarySuggestions, ...clinicMatches].slice(0, 6);
  }, [searchQuery, allSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Search handler ─────────────────────────────────────────
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    const trimmedQuery = searchQuery.trim();
    const trimmedLocation = locationQuery.trim();

    if (trimmedQuery) params.set('q', trimmedQuery);
    if (trimmedLocation) params.set('location', trimmedLocation);

    const queryString = params.toString();
    navigate(`/search${queryString ? `?${queryString}` : ''}`);
  }, [searchQuery, locationQuery, navigate]);

  const handleKeyDown = (e) => {
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          const selected = filteredSuggestions[activeSuggestionIndex];
          setSearchQuery(selected.label);
          setShowSuggestions(false);
          setActiveSuggestionIndex(-1);
          // Focus the location input if empty, otherwise search
          if (!locationQuery.trim() && locationInputRef.current) {
            locationInputRef.current.focus();
          } else {
            // Defer search to let state update
            setTimeout(() => {
              const params = new URLSearchParams();
              params.set('q', selected.label);
              if (locationQuery.trim()) params.set('location', locationQuery.trim());
              navigate(`/search?${params.toString()}`);
            }, 0);
          }
        } else {
          handleSearch();
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    } else if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLocationKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // ── Geolocation handler ────────────────────────────────────
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocode the coordinates to get a readable address
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await response.json();

          if (data.address) {
            const parts = [];
            if (data.address.suburb || data.address.neighbourhood) {
              parts.push(data.address.suburb || data.address.neighbourhood);
            }
            if (data.address.city || data.address.town || data.address.village) {
              parts.push(data.address.city || data.address.town || data.address.village);
            }
            if (data.address.state) {
              parts.push(data.address.state);
            }
            setLocationQuery(parts.join(', ') || 'Current Location');
          } else {
            setLocationQuery('Current Location');
          }
        } catch {
          setLocationQuery('Current Location');
        }
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location unavailable');
            break;
          default:
            setLocationError('Could not get location');
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  // ── Quick category click ───────────────────────────────────
  const handleCategoryClick = (category) => {
    const params = new URLSearchParams();
    params.set('q', category.query);
    if (locationQuery.trim()) params.set('location', locationQuery.trim());
    navigate(`/search?${params.toString()}`);
  };

  // ── Suggestion click ───────────────────────────────────────
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.label);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    const params = new URLSearchParams();
    params.set('q', suggestion.label);
    if (locationQuery.trim()) params.set('location', locationQuery.trim());
    navigate(`/search?${params.toString()}`);
  };

  // ── Suggestion type badge ──────────────────────────────────
  const getSuggestionBadge = (type) => {
    switch (type) {
      case 'clinic':
        return { text: 'Clinic', color: 'bg-blue-400/20 text-blue-200' };
      case 'type':
        return { text: 'Type', color: 'bg-green-400/20 text-green-200' };
      case 'specialty':
        return { text: 'Specialty', color: 'bg-purple-400/20 text-purple-200' };
      default:
        return { text: '', color: '' };
    }
  };

  return (
    <section className="hero-gradient text-white min-h-[68vh] md:min-h-[calc(100vh-60px)] py-12 md:py-20 flex items-center relative overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Subtle animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-48 -left-32 w-[500px] h-[500px] bg-green-400/5 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* ── Heading ─────────────────────────────────────── */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-5 leading-tight">
            Find Quality{' '}
            <RotatingText
              words={ROTATING_WORDS}
              interval={2800}
              initialDelay={5000}
            />
            <span className="block text-green-300">Near You</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 text-blue-100 max-w-2xl mx-auto px-2 sm:px-0">
            Discover trusted medical clinics, compare services, and book appointments with ease. Your health journey starts here.
          </p>

          {/* ── Search Bar ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-3xl mx-auto w-full px-1 sm:px-0"
            ref={containerRef}
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-[20px] p-1.5 sm:p-2 shadow-2xl shadow-black/10">
              <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-0">

                {/* ── "What" field ─────────────────────── */}
                <div className="relative flex-1 min-w-0">
                  <div className="flex items-center bg-white/10 sm:bg-transparent rounded-xl sm:rounded-none sm:border-r sm:border-white/15 pl-3 sm:pl-4 pr-2">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 text-green-300 flex-shrink-0 mr-2 sm:mr-3" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Condition, doctor, or clinic..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                        setActiveSuggestionIndex(-1);
                      }}
                      onFocus={() => {
                        if (searchQuery.trim()) setShowSuggestions(true);
                      }}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-transparent text-white placeholder-blue-200/70 outline-none text-sm sm:text-base font-medium py-3 sm:py-3.5"
                      autoComplete="off"
                      aria-label="Search for clinics, specialties, or conditions"
                      aria-autocomplete="list"
                      aria-expanded={showSuggestions && filteredSuggestions.length > 0}
                    />
                  </div>

                  {/* ── Typeahead Dropdown ──────────────── */}
                  <AnimatePresence>
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <motion.div
                        ref={suggestionsRef}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-gray-900/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden"
                        role="listbox"
                      >
                        {filteredSuggestions.map((suggestion, i) => {
                          const badge = getSuggestionBadge(suggestion.type);
                          return (
                            <button
                              key={`${suggestion.type}-${suggestion.label}`}
                              role="option"
                              aria-selected={i === activeSuggestionIndex}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                                i === activeSuggestionIndex
                                  ? 'bg-white/15 text-white'
                                  : 'text-gray-200 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium truncate block">{suggestion.label}</span>
                                {suggestion.sublabel && (
                                  <span className="text-xs text-gray-400 truncate block">{suggestion.sublabel}</span>
                                )}
                              </div>
                              {badge.text && (
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${badge.color}`}>
                                  {badge.text}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── "Where" field ────────────────────── */}
                <div className="relative flex-1 min-w-0">
                  <div className="flex items-center bg-white/10 sm:bg-transparent rounded-xl sm:rounded-none pl-3 sm:pl-4 pr-1">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-300 flex-shrink-0 mr-2 sm:mr-3" />
                    <input
                      ref={locationInputRef}
                      type="text"
                      placeholder="City, area, or address..."
                      value={locationQuery}
                      onChange={(e) => {
                        setLocationQuery(e.target.value);
                        setLocationError('');
                      }}
                      onKeyDown={handleLocationKeyDown}
                      className="w-full bg-transparent text-white placeholder-blue-200/70 outline-none text-sm sm:text-base font-medium py-3 sm:py-3.5"
                      autoComplete="off"
                      aria-label="Location"
                    />
                    {/* GPS button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleUseMyLocation}
                      disabled={isLocating}
                      className={`p-2 rounded-lg flex-shrink-0 transition-colors duration-200 ${
                        isLocating
                          ? 'text-green-300 animate-pulse cursor-wait'
                          : 'text-blue-200/60 hover:text-green-300 hover:bg-white/10 cursor-pointer'
                      }`}
                      title="Use my current location"
                      aria-label="Use my current location"
                    >
                      <Crosshair className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    </motion.button>
                  </div>
                </div>

                {/* ── Search button ────────────────────── */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSearch}
                  className="bg-green-400 hover:bg-green-300 text-gray-950 font-bold px-5 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm sm:text-base transition-all duration-200 flex-shrink-0 shadow-lg shadow-green-400/20 hover:shadow-green-400/30 cursor-pointer flex items-center justify-center gap-2"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Search</span>
                </motion.button>
              </div>
            </div>

            {/* Location error message */}
            <AnimatePresence>
              {locationError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-300 text-xs sm:text-sm mt-2 text-center"
                >
                  {locationError}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Quick Category Chips ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-6 sm:mt-8 max-w-3xl mx-auto"
          >
            <p className="text-blue-200/60 text-xs sm:text-sm mb-3 font-medium tracking-wide uppercase">
              Popular searches
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
              {QUICK_CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.label}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryClick(cat)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/8 hover:bg-white/15 border border-white/10 hover:border-white/25 rounded-full text-xs sm:text-sm text-blue-100 hover:text-white font-medium transition-all duration-200 cursor-pointer backdrop-blur-sm"
                >
                  <cat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-300/80" />
                  {cat.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* ── Trust Stats ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 sm:mt-12 flex items-center justify-center gap-6 sm:gap-10 text-blue-100/70"
          >
            {[
              { value: stats.providerCount, label: 'Providers' },
              { value: stats.reviewCount, label: 'Reviews' },
              { value: stats.hmoCount, label: 'HMOs' },
            ].map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <div className="w-px h-8 bg-white/10" />}
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white tabular-nums">
                    {stat.value > 0 ? (
                      <AnimatedCounter target={stat.value} />
                    ) : (
                      <span className="opacity-30">—</span>
                    )}
                  </div>
                  <div className="text-[10px] sm:text-xs tracking-wide uppercase mt-0.5">{stat.label}</div>
                </div>
              </React.Fragment>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ── Animated Counter ─────────────────────────────────────────
// Counts up from 0 to target on mount for visual delight
function AnimatedCounter({ target, duration = 1.5 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || target <= 0) return;
    hasAnimated.current = true;

    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      // Ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        ref.current = requestAnimationFrame(step);
      }
    };
    ref.current = requestAnimationFrame(step);

    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [target, duration]);

  // Format large numbers with commas
  return <>{count.toLocaleString()}{target >= 100 ? '+' : ''}</>;
}

export default Hero;