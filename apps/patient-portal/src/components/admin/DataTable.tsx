/**
 * DataTable.jsx
 * Reusable sortable, paginated table component for admin pages.
 */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

/**
 * @param {Object} props
 * @param {Array<{key: string, label: string, sortable?: boolean, render?: Function, className?: string}>} props.columns
 * @param {Array<Object>} props.data
 * @param {boolean} [props.loading]
 * @param {string} [props.emptyMessage]
 * @param {string} [props.emptyIcon]
 * @param {number} [props.pageSize]
 * @param {boolean} [props.selectable]
 * @param {Set} [props.selectedIds]
 * @param {Function} [props.onSelectionChange]
 * @param {string} [props.rowKey] - key to use as unique row identifier (default: 'id')
 * @param {Function} [props.onRowClick]
 * @param {string} [props.className]
 */
export default function DataTable({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No data found',
  pageSize = 20,
  selectable = false,
  selectedIds,
  onSelectionChange,
  rowKey = 'id',
  onRowClick,
  className = '',
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const pagedData = sortedData.slice(page * pageSize, (page + 1) * pageSize);

  // Reset page when data changes
  React.useEffect(() => {
    setPage(0);
  }, [data.length]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const allSelected = pagedData.length > 0 && pagedData.every(r => selectedIds?.has(r[rowKey]));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      const newSet = new Set(selectedIds);
      pagedData.forEach(r => newSet.delete(r[rowKey]));
      onSelectionChange(newSet);
    } else {
      const newSet = new Set(selectedIds);
      pagedData.forEach(r => newSet.add(r[rowKey]));
      onSelectionChange(newSet);
    }
  };

  const toggleRow = (id) => {
    if (!onSelectionChange) return;
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    onSelectionChange(newSet);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden ${className}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      <div className="h-4 bg-gray-100 rounded-lg animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-100 ${className}`}>
        <div className="py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
            <ChevronsUpDown className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {selectable && (
                <th className="px-4 py-3.5 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.sortable !== false ? 'cursor-pointer select-none hover:text-gray-700 transition' : ''} ${col.className || ''}`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable !== false && (
                      <span className="text-gray-300">
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedData.map((row, idx) => {
              const id = row[rowKey];
              const isSelected = selectedIds?.has(id);
              return (
                <motion.tr
                  key={id ?? idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-gray-50 transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-blue-50/30' : 'hover:bg-gray-50/50'
                  } ${isSelected ? 'bg-blue-50/40' : ''}`}
                >
                  {selectable && (
                    <td className="px-4 py-3.5 w-12" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected || false}
                        onChange={() => toggleRow(id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3.5 text-sm text-gray-700 ${col.className || ''}`}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/30">
          <p className="text-xs text-gray-500">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sortedData.length)} of {sortedData.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (page < 3) {
                pageNum = i;
              } else if (page > totalPages - 4) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                    pageNum === page
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
