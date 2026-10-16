/**
 * lab-data.js
 * ──────────────────────────────────────────────────────────────
 * Constants, label maps, and utility functions for the lab portal.
 * This file replaces the Lovable-generated lab-data.ts, keeping
 * the status labels, formatters, and enums but removing all seed
 * data (now served from Supabase).
 * ──────────────────────────────────────────────────────────────
 */

/** @type {Record<string, string>} */
export const orderStatusLabel = {
  new: 'New',
  awaiting_sample: 'Awaiting Sample',
  processing: 'Processing',
  results_ready: 'Results Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

/** @type {Record<string, string>} */
export const sampleStatusLabel = {
  awaiting: 'Awaiting Collection',
  collected: 'Collected',
  processing: 'Processing',
  completed: 'Completed',
  rejected: 'Rejected',
};

/** @type {Record<string, string>} */
export const resultStatusLabel = {
  pending: 'Pending',
  processing: 'Processing',
  review: 'Ready for Review',
  published: 'Published',
};

/** Valid order status transitions */
export const orderTransitions = {
  new: ['awaiting_sample', 'cancelled'],
  awaiting_sample: ['processing', 'cancelled'],
  processing: ['results_ready'],
  results_ready: ['completed'],
  completed: [],
  cancelled: [],
};

/** Valid sample status transitions */
export const sampleTransitions = {
  awaiting: ['collected', 'rejected'],
  collected: ['processing'],
  processing: ['completed'],
  completed: [],
  rejected: [],
};

/** Next sample action for UI buttons */
export const sampleNextAction = {
  awaiting: { status: 'collected', label: 'Mark collected' },
  collected: { status: 'processing', label: 'Start processing' },
  processing: { status: 'completed', label: 'Mark completed' },
  completed: null,
  rejected: null,
};

/** Format Naira currency */
export function formatNaira(value) {
  return '₦' + Number(value).toLocaleString('en-NG', { maximumFractionDigits: 0 });
}

/** Calculate order total from tests array */
export function orderTotal(tests) {
  if (!tests || !Array.isArray(tests)) return 0;
  return tests.reduce((sum, t) => sum + Number(t.price || 0), 0);
}

/** Lab staff role labels for display */
export const labRoleLabel = {
  lab_admin: 'Laboratory Administrator',
  lab_scientist: 'Medical Laboratory Scientist',
  lab_technician: 'Laboratory Technician',
  lab_phlebotomist: 'Phlebotomist',
};

/** Order timeline steps */
export const orderTimelineSteps = ['Order received', 'Sample collected', 'Processing', 'Result ready', 'Delivered'];

/** Map order status to timeline step index */
export const orderStepIndex = {
  new: 0,
  awaiting_sample: 0,
  processing: 2,
  results_ready: 3,
  completed: 4,
  cancelled: 0,
};

/** Format a date string or Date for display */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/** Format relative time (e.g. "5 minutes ago") */
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  try {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  } catch {
    return '';
  }
}
