import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Star, MapPin, Phone, Clock, Heart, Shield, Stethoscope,
  SlidersHorizontal, X, ChevronDown, ChevronUp, ArrowUpDown
} from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { useClinics } from '@/context/ClinicsContext';
import { availableHMOs } from '@/constants/hmos';

// ── Helper: extract unique values from clinic array ──────────────────
function extractUnique(clinics, key) {
  const set = new Set();
  clinics.forEach(c => {
    const arr = c[key];
    if (Array.isArray(arr)) arr.forEach(v => set.add(v));
    else if (typeof arr === 'string' && arr) set.add(arr);
  });
  return [...set].sort();
}

// ── Collapsible filter section ───────────────────────────────────────
function FilterGroup({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full py-3 px-1 text-left group"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          {Icon && <Icon className="w-4 h-4 text-blue-600" />}
          {title}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 px-1 space-y-1.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Checkbox item ────────────────────────────────────────────────────
function CheckboxItem({ label, checked, onChange, count }) {
  return (
    <label className="flex items-center gap-2.5 py-1 px-1 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
      />
      <span className="text-sm text-gray-700 flex-1 group-hover:text-gray-900 transition-colors">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-gray-400 font-medium">{count}</span>
      )}
    </label>
  );
}

// ── Search result card ───────────────────────────────────────────────
function SearchResultCard({ clinic }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(clinic.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      onClick={() => window.open(`/clinic/${clinic.id}`, '_blank')}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-4 sm:p-6 cursor-pointer"
    >
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        {/* Image */}
        <div className="w-full md:w-64 h-48 md:h-40 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-100 to-green-100">
          <img
            className="w-full h-full object-cover"
            alt={`${clinic.practitioner_name} medical facility`}
            src={clinic.image_src}
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
          {/* Title + Favorite */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">{clinic.practitioner_name}</h3>
              <p className="text-sm sm:text-base text-blue-600 font-medium truncate">{clinic.practice_type}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(clinic.id);
              }}
              className={`p-2 flex-shrink-0 -mt-2 -mr-2 sm:mt-0 sm:mr-0 transition-all duration-200 hover:scale-110 ${
                favorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-5 h-5 ${favorited ? 'fill-red-500' : ''}`} />
            </button>
          </div>

          {/* Rating & distance */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1 flex-shrink-0" />
              <span className="font-medium">{clinic.rating}</span>
              <span className="ml-1">({clinic.number_of_reviews} reviews)</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
              <span className="truncate">{clinic.distance_from_location}</span>
            </div>
          </div>

          {/* Address, phone, next available */}
          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
            <div className="flex items-start">
              <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2 break-words">{clinic.address}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              <span className="truncate">{clinic.phone}</span>
            </div>
            {clinic.nextAvailable && (
              <div className="flex items-start sm:items-center flex-col sm:flex-row">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span>Next available: </span>
                </div>
                <span className="text-green-600 font-medium sm:ml-1 mt-0.5 sm:mt-0">{clinic.nextAvailable}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {(clinic.tags || []).slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/clinic/${clinic.id}`, '_blank');
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-2 px-4 rounded-lg font-medium transition flex justify-center items-center"
            >
              Book Appointment
            </button>
            <a
              href={`tel:${clinic.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:w-auto border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call Now
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN SEARCH PAGE
// ═══════════════════════════════════════════════════════════════════════
export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { clinics, loading, error } = useClinics();

  // ── State ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedHMOs, setSelectedHMOs] = useState([]);
  const [selectedPracticeTypes, setSelectedPracticeTypes] = useState([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(0); // 0 = any
  const [sortBy, setSortBy] = useState('relevance');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync searchQuery from URL on mount / back-navigation
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchQuery(q);
  }, [searchParams]);

  // ── Derived filter options ─────────────────────────────────────────
  const practiceTypes = useMemo(() => extractUnique(clinics, 'practice_type'), [clinics]);
  const specialties = useMemo(() => extractUnique(clinics, 'specialties'), [clinics]);

  const distanceOptions = [
    { label: 'Any distance', value: 0 },
    { label: 'Within 5 km', value: 5 },
    { label: 'Within 10 km', value: 10 },
    { label: 'Within 15 km', value: 15 },
    { label: 'Within 20 km', value: 20 },
  ];

  const ratingOptions = [
    { label: 'Any rating', value: 0 },
    { label: '4.5+ Excellent', value: 4.5 },
    { label: '4.0+ Very Good', value: 4 },
    { label: '3.5+ Good', value: 3.5 },
    { label: '3.0+', value: 3 },
  ];

  // ── Filtering & sorting logic ──────────────────────────────────────
  const filteredClinics = useMemo(() => {
    let results = [...clinics];

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(c => {
        const nameMatch = c.practitioner_name?.toLowerCase().includes(q);
        const specialtyMatch = c.specialties?.some(s => s.toLowerCase().includes(q));
        const tagsMatch = c.tags?.some(t => t.toLowerCase().includes(q));
        const practiceTypeMatch = c.practice_type?.toLowerCase().includes(q);
        const addressMatch = c.address?.toLowerCase().includes(q);
        return nameMatch || specialtyMatch || tagsMatch || practiceTypeMatch || addressMatch;
      });
    }

    // HMO filter (multi-select: clinic must support ALL selected HMOs)
    if (selectedHMOs.length > 0) {
      results = results.filter(c =>
        selectedHMOs.every(hmo => (c.supportedHMOs || []).includes(hmo))
      );
    }

    // Practice type filter
    if (selectedPracticeTypes.length > 0) {
      results = results.filter(c =>
        selectedPracticeTypes.includes(c.practice_type)
      );
    }

    // Specialty filter
    if (selectedSpecialties.length > 0) {
      results = results.filter(c =>
        selectedSpecialties.some(s => (c.specialties || []).includes(s))
      );
    }

    // Rating filter
    if (minRating > 0) {
      results = results.filter(c => (c.rating || 0) >= minRating);
    }

    // Distance filter
    if (maxDistance > 0) {
      results = results.filter(c => {
        const d = parseFloat(c.distance_from_location) || 999;
        return d <= maxDistance;
      });
    }

    // Sorting
    results.sort((a, b) => {
      switch (sortBy) {
        case 'distance-asc': {
          const dA = parseFloat(a.distance_from_location) || 0;
          const dB = parseFloat(b.distance_from_location) || 0;
          return dA - dB;
        }
        case 'distance-desc': {
          const dA = parseFloat(a.distance_from_location) || 0;
          const dB = parseFloat(b.distance_from_location) || 0;
          return dB - dA;
        }
        case 'rating-desc':
          return (b.rating || 0) - (a.rating || 0);
        case 'reviews-desc':
          return (b.number_of_reviews || 0) - (a.number_of_reviews || 0);
        case 'name-asc':
          return (a.practitioner_name || '').localeCompare(b.practitioner_name || '');
        case 'name-desc':
          return (b.practitioner_name || '').localeCompare(a.practitioner_name || '');
        default: // relevance — keep original order from search
          return 0;
      }
    });

    return results;
  }, [clinics, searchQuery, selectedHMOs, selectedPracticeTypes, selectedSpecialties, minRating, maxDistance, sortBy]);

  // ── Active filter count ────────────────────────────────────────────
  const activeFilterCount =
    selectedHMOs.length +
    selectedPracticeTypes.length +
    selectedSpecialties.length +
    (minRating > 0 ? 1 : 0) +
    (maxDistance > 0 ? 1 : 0);

  const clearAllFilters = useCallback(() => {
    setSelectedHMOs([]);
    setSelectedPracticeTypes([]);
    setSelectedSpecialties([]);
    setMinRating(0);
    setMaxDistance(0);
  }, []);

  // Toggle helpers
  const toggleHMO = (hmo) => setSelectedHMOs(prev =>
    prev.includes(hmo) ? prev.filter(h => h !== hmo) : [...prev, hmo]
  );
  const togglePracticeType = (pt) => setSelectedPracticeTypes(prev =>
    prev.includes(pt) ? prev.filter(p => p !== pt) : [...prev, pt]
  );
  const toggleSpecialty = (s) => setSelectedSpecialties(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
  );

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setSearchParams(searchQuery.trim() ? { q: searchQuery.trim() } : {});
  };

  // ── Count clinics per filter value ─────────────────────────────────
  const hmoCountMap = useMemo(() => {
    const map = {};
    clinics.forEach(c => {
      (c.supportedHMOs || []).forEach(hmo => {
        map[hmo] = (map[hmo] || 0) + 1;
      });
    });
    return map;
  }, [clinics]);

  const practiceTypeCountMap = useMemo(() => {
    const map = {};
    clinics.forEach(c => {
      if (c.practice_type) map[c.practice_type] = (map[c.practice_type] || 0) + 1;
    });
    return map;
  }, [clinics]);

  const specialtyCountMap = useMemo(() => {
    const map = {};
    clinics.forEach(c => {
      (c.specialties || []).forEach(s => {
        map[s] = (map[s] || 0) + 1;
      });
    });
    return map;
  }, [clinics]);

  // ── SIDEBAR CONTENT (shared by desktop sidebar & mobile drawer) ────
  const filterSidebarContent = (
    <div className="space-y-1">
      {/* Search within filters */}
      <form onSubmit={handleSearchSubmit} className="pb-3 border-b border-gray-100">
        <label className="text-sm font-semibold text-gray-800 mb-2 block">Search</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Clinic name, specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-700 placeholder-gray-400"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </form>

      {/* HMO */}
      <FilterGroup title="HMO Provider" icon={Shield} defaultOpen={true}>
        <div className="max-h-52 overflow-y-auto pr-1 space-y-0.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full" style={{ scrollbarWidth: 'thin' }}>
          {availableHMOs.map(hmo => (
            <CheckboxItem
              key={hmo}
              label={hmo}
              checked={selectedHMOs.includes(hmo)}
              onChange={() => toggleHMO(hmo)}
              count={hmoCountMap[hmo] || 0}
            />
          ))}
        </div>
      </FilterGroup>

      {/* Practice Type */}
      <FilterGroup title="Practice Type" icon={Stethoscope} defaultOpen={true}>
        {practiceTypes.map(pt => (
          <CheckboxItem
            key={pt}
            label={pt}
            checked={selectedPracticeTypes.includes(pt)}
            onChange={() => togglePracticeType(pt)}
            count={practiceTypeCountMap[pt] || 0}
          />
        ))}
      </FilterGroup>

      {/* Specialty */}
      <FilterGroup title="Specialty" icon={Stethoscope} defaultOpen={false}>
        {specialties.map(s => (
          <CheckboxItem
            key={s}
            label={s}
            checked={selectedSpecialties.includes(s)}
            onChange={() => toggleSpecialty(s)}
            count={specialtyCountMap[s] || 0}
          />
        ))}
      </FilterGroup>

      {/* Rating */}
      <FilterGroup title="Rating" icon={Star} defaultOpen={true}>
        {ratingOptions.map(opt => (
          <label
            key={opt.value}
            className={`flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-150 ${
              minRating === opt.value
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50 border border-transparent'
            }`}
          >
            <input
              type="radio"
              name="rating"
              checked={minRating === opt.value}
              onChange={() => setMinRating(opt.value)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 flex items-center gap-1">
              {opt.value > 0 && (
                <span className="flex items-center">
                  {Array.from({ length: Math.floor(opt.value) }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                  ))}
                </span>
              )}
              {opt.label}
            </span>
          </label>
        ))}
      </FilterGroup>

      {/* Distance */}
      <FilterGroup title="Distance" icon={MapPin} defaultOpen={true}>
        {distanceOptions.map(opt => (
          <label
            key={opt.value}
            className={`flex items-center gap-2.5 py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-150 ${
              maxDistance === opt.value
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50 border border-transparent'
            }`}
          >
            <input
              type="radio"
              name="distance"
              checked={maxDistance === opt.value}
              onChange={() => setMaxDistance(opt.value)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        ))}
      </FilterGroup>

      {/* Clear all */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="w-full mt-3 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          Clear all filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>
          {searchQuery
            ? `"${searchQuery}" — Search Clinics | HealthProvida`
            : 'Search Clinics | HealthProvida'}
        </title>
        <meta
          name="description"
          content="Search and filter healthcare providers by HMO, specialty, rating, and more on HealthProvida."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50/70">

        {/* ── Top bar ────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 sticky top-[73px] z-30">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Search bar */}
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    id="search-bar-input"
                    type="text"
                    placeholder="Search clinics, specialties, doctors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-28 py-3.5 border border-gray-200 rounded-xl text-base text-gray-700 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Right: result count + sort + mobile filter btn */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Result count */}
                <span className="text-sm text-gray-500 hidden sm:block whitespace-nowrap">
                  {loading ? (
                    <span className="animate-pulse">Searching…</span>
                  ) : (
                    <>
                      <span className="font-semibold text-gray-800">{filteredClinics.length}</span>{' '}
                      {filteredClinics.length === 1 ? 'result' : 'results'}
                      {searchQuery && (
                        <> for "<span className="font-medium text-gray-700">{searchQuery}</span>"</>
                      )}
                    </>
                  )}
                </span>

                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold whitespace-nowrap">
                    {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'}
                  </span>
                )}

                {/* Mobile filter toggle */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[18px] text-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer min-w-[160px]"
                  >
                    <option value="relevance">Sort by: Relevance</option>
                    <option value="distance-asc">Distance: Nearest</option>
                    <option value="distance-desc">Distance: Farthest</option>
                    <option value="rating-desc">Rating: Highest</option>
                    <option value="reviews-desc">Most Reviews</option>
                    <option value="name-asc">Name: A → Z</option>
                    <option value="name-desc">Name: Z → A</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main content ───────────────────────────────────────────── */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
              <div className="sticky top-[140px] bg-white rounded-xl shadow-sm border border-gray-100 p-5 max-h-[calc(100vh-160px)] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full" style={{ scrollbarWidth: 'thin' }}>
                {filterSidebarContent}
              </div>
            </aside>

            {/* Results */}
            <main className="flex-1 min-w-0">
              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedHMOs.map(hmo => (
                    <button
                      key={`hmo-${hmo}`}
                      onClick={() => toggleHMO(hmo)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium hover:bg-green-100 transition-colors"
                    >
                      <Shield className="w-3 h-3" />
                      {hmo}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                  {selectedPracticeTypes.map(pt => (
                    <button
                      key={`pt-${pt}`}
                      onClick={() => togglePracticeType(pt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                      {pt}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                  {selectedSpecialties.map(s => (
                    <button
                      key={`sp-${s}`}
                      onClick={() => toggleSpecialty(s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-medium hover:bg-purple-100 transition-colors"
                    >
                      {s}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                  {minRating > 0 && (
                    <button
                      onClick={() => setMinRating(0)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-medium hover:bg-yellow-100 transition-colors"
                    >
                      <Star className="w-3 h-3 fill-current" />
                      {minRating}+
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {maxDistance > 0 && (
                    <button
                      onClick={() => setMaxDistance(0)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-medium hover:bg-teal-100 transition-colors"
                    >
                      <MapPin className="w-3 h-3" />
                      Within {maxDistance} km
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Results list */}
              <div className="space-y-4">
                {loading ? (
                  // Skeleton
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-64 lg:w-72 h-52 md:h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0" />
                        <div className="flex-1 p-5 space-y-4">
                          <div className="flex justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="h-5 bg-gray-200 rounded w-2/3" />
                              <div className="h-4 bg-gray-200 rounded w-1/3" />
                            </div>
                            <div className="w-14 h-12 bg-blue-100 rounded-lg" />
                          </div>
                          <div className="flex gap-4">
                            <div className="h-4 bg-gray-200 rounded w-24" />
                            <div className="h-4 bg-gray-200 rounded w-16" />
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-full" />
                            <div className="h-4 bg-gray-200 rounded w-2/3" />
                          </div>
                          <div className="flex gap-2">
                            <div className="h-5 bg-blue-50 rounded-md w-20" />
                            <div className="h-5 bg-blue-50 rounded-md w-24" />
                            <div className="h-5 bg-blue-50 rounded-md w-16" />
                          </div>
                          <div className="flex gap-3 pt-2 border-t border-gray-50">
                            <div className="h-10 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg flex-1" />
                            <div className="h-10 bg-gray-100 rounded-lg w-28" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : error ? (
                  <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
                      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <p className="text-gray-900 text-lg font-semibold mb-2">Unable to load clinics</p>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-2 px-6 rounded-lg font-medium transition"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredClinics.length > 0 ? (
                  <AnimatePresence mode="popLayout">
                    {filteredClinics.map(clinic => (
                      <SearchResultCard key={clinic.id} clinic={clinic} />
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <Search className="w-7 h-7 text-gray-400" />
                    </div>
                    <p className="text-gray-900 text-lg font-semibold mb-2">No clinics found</p>
                    <p className="text-gray-500 mb-4 max-w-md mx-auto">
                      {searchQuery
                        ? `No results for "${searchQuery}" with the current filters.`
                        : 'No clinics match the current filters.'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {activeFilterCount > 0 && (
                        <button
                          onClick={clearAllFilters}
                          className="px-5 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                          Clear all filters
                        </button>
                      )}
                      {searchQuery && (
                        <button
                          onClick={() => { setSearchQuery(''); setSearchParams({}); }}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-lg font-medium transition"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ─────────────────────────────────────── */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl lg:hidden flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              {/* Drawer content */}
              <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin' }}>
                {filterSidebarContent}
              </div>
              {/* Drawer footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-sm"
                >
                  Show {filteredClinics.length} results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
