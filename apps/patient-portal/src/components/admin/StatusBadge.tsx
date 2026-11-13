/**
 * StatusBadge.jsx
 * Color-coded status badge used across all admin tables.
 */
import React from 'react';

const STATUS_STYLES = {
  // Application statuses
  pending:   'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
  approved:  'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
  rejected:  'bg-red-50 text-red-700 border-red-200 ring-red-500/20',
  // Appointment statuses
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200 ring-gray-500/20',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
  no_show:   'bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/20',
  // Generic
  active:    'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
  inactive:  'bg-gray-100 text-gray-600 border-gray-200 ring-gray-500/20',
  verified:  'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
  unverified:'bg-gray-100 text-gray-500 border-gray-200 ring-gray-500/20',
  read:      'bg-gray-100 text-gray-500 border-gray-200 ring-gray-500/20',
  unread:    'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
  // Roles
  super_admin: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20',
  admin:       'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
  moderator:   'bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/20',
  provider:    'bg-green-50 text-green-700 border-green-200 ring-green-500/20',
  patient:     'bg-gray-50 text-gray-600 border-gray-200 ring-gray-500/20',
};

const DOT_COLORS = {
  pending: 'bg-amber-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
  confirmed: 'bg-blue-500',
  cancelled: 'bg-gray-400',
  completed: 'bg-emerald-500',
  active: 'bg-emerald-500',
  inactive: 'bg-gray-400',
  unread: 'bg-blue-500',
};

function formatLabel(status) {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({ status, showDot = false, className = '' }) {
  const styles = STATUS_STYLES[status] || STATUS_STYLES.inactive;
  const dotColor = DOT_COLORS[status] || 'bg-gray-400';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ring-1 ${styles} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      )}
      {formatLabel(status)}
    </span>
  );
}
