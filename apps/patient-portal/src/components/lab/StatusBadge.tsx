/**
 * StatusBadge — color-coded pill for order/sample/result/test status.
 * Converted from the Lovable TSX version to JSX with Tailwind v3 classes.
 */
import React from 'react';

const toneClasses = {
  info:    'bg-blue-50 text-blue-600 border-blue-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  neutral: 'bg-gray-100 text-gray-500 border-gray-200',
  danger:  'bg-red-50 text-red-600 border-red-200',
};

const dotClasses = {
  info:    'bg-blue-600',
  success: 'bg-green-600',
  warning: 'bg-amber-500',
  neutral: 'bg-gray-400',
  danger:  'bg-red-500',
};

const statusToneMap = {
  new: 'info',
  awaiting_sample: 'warning',
  awaiting: 'warning',
  processing: 'info',
  collected: 'info',
  results_ready: 'success',
  review: 'warning',
  ready: 'success',
  completed: 'success',
  published: 'success',
  cancelled: 'danger',
  rejected: 'danger',
  pending: 'neutral',
  inactive: 'neutral',
  active: 'success',
};

export default function StatusBadge({ status, label, className = '' }) {
  const tone = statusToneMap[status] || 'neutral';
  return (
    <span
      className={
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ' +
        toneClasses[tone] + ' ' + className
      }
    >
      <span className={'h-1.5 w-1.5 rounded-full ' + dotClasses[tone]} aria-hidden="true" />
      {label}
    </span>
  );
}
