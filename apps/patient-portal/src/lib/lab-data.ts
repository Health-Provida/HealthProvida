/**
 * lab-data.ts
 * ──────────────────────────────────────────────────────────────
 * Constants, label maps, and utility functions for the lab portal.
 * ──────────────────────────────────────────────────────────────
 */

export const orderStatusLabel: Record<string, string> = {
  new: 'New',
  awaiting_sample: 'Awaiting Sample',
  processing: 'Processing',
  results_ready: 'Results Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const sampleStatusLabel: Record<string, string> = {
  awaiting: 'Awaiting Collection',
  collected: 'Collected',
  processing: 'Processing',
  completed: 'Completed',
  rejected: 'Rejected',
};

export const resultStatusLabel: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  review: 'Ready for Review',
  published: 'Published',
};

export const orderTransitions: Record<string, string[]> = {
  new: ['awaiting_sample', 'cancelled'],
  awaiting_sample: ['processing', 'cancelled'],
  processing: ['results_ready'],
  results_ready: ['completed'],
  completed: [],
  cancelled: [],
};

export const sampleTransitions: Record<string, string[]> = {
  awaiting: ['collected', 'rejected'],
  collected: ['processing'],
  processing: ['completed'],
  completed: [],
  rejected: [],
};

export const sampleNextAction: Record<string, { status: string; label: string } | null> = {
  awaiting: { status: 'collected', label: 'Mark collected' },
  collected: { status: 'processing', label: 'Start processing' },
  processing: { status: 'completed', label: 'Mark completed' },
  completed: null,
  rejected: null,
};

export function formatNaira(value: number): string {
  return '₦' + Number(value).toLocaleString('en-NG', { maximumFractionDigits: 0 });
}

export function orderTotal(tests: Array<{ price?: number }> | null | undefined): number {
  if (!tests || !Array.isArray(tests)) return 0;
  return tests.reduce((sum, t) => sum + Number(t.price || 0), 0);
}

export const labRoleLabel: Record<string, string> = {
  lab_admin: 'Laboratory Administrator',
  lab_scientist: 'Medical Laboratory Scientist',
  lab_technician: 'Laboratory Technician',
  lab_phlebotomist: 'Phlebotomist',
};

export const orderTimelineSteps: string[] = ['Order received', 'Sample collected', 'Processing', 'Result ready', 'Delivered'];

export const orderStepIndex: Record<string, number> = {
  new: 0,
  awaiting_sample: 0,
  processing: 2,
  results_ready: 3,
  completed: 4,
  cancelled: 0,
};

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr: string | null | undefined): string {
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
