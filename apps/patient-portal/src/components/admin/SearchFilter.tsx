/**
 * SearchFilter.jsx
 * Reusable search bar + dropdown filters for admin tables.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export default function SearchFilter({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  // filters: Array<{ key: string, label: string, options: Array<{ value: string, label: string }>, value: string }>
  onFilterChange,
  onClearAll,
  className = '',
}) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setLocalSearch(val);

    // Debounce search
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange?.(val);
    }, 300);
  };

  const clearSearch = () => {
    setLocalSearch('');
    onSearchChange?.('');
  };

  const hasActiveFilters = filters.some(f => f.value && f.value !== '' && f.value !== 'all');

  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      {/* Search input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
        <input
          type="text"
          value={localSearch}
          onChange={handleSearchInput}
          placeholder={searchPlaceholder}
          className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
        />
        {localSearch && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter dropdowns */}
      {filters.map((filter) => (
        <select
          key={filter.key}
          value={filter.value || ''}
          onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition min-w-[140px] appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            paddingRight: '2.5rem',
          }}
        >
          <option value="">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition whitespace-nowrap"
        >
          <X className="w-3.5 h-3.5" />
          Clear filters
        </button>
      )}
    </div>
  );
}
