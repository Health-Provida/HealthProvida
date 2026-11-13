/**
 * Anti-Spam Utilities
 * 
 * Three-layer bot protection for form submissions:
 * 1. Honeypot — hidden field that only bots fill out
 * 2. Rate Limiting — per-action submission throttling (client-side now, server-side on AWS)
 * 3. Timestamp Validation — rejects submissions faster than humanly possible
 */

// ─── 1. Honeypot ────────────────────────────────────────────
// CSS class to visually hide the honeypot field without using display:none
// (some bots detect display:none and skip those fields)
export const HONEYPOT_FIELD_NAME = 'website_url';

export const HONEYPOT_STYLES = {
  position: 'absolute',
  left: '-9999px',
  top: '-9999px',
  opacity: 0,
  height: 0,
  width: 0,
  tabIndex: -1,
  overflow: 'hidden',
  pointerEvents: 'none',
};

/**
 * Check if the honeypot field was filled (indicates bot).
 * @param {string} value - The honeypot field value
 * @returns {boolean} true if bot detected
 */
export function isHoneypotTriggered(value) {
  return value != null && value.trim().length > 0;
}


// ─── 2. Rate Limiting ───────────────────────────────────────
// Client-side rate limiter using an in-memory store.
// When migrating to AWS, replace this with express-rate-limit middleware
// or API Gateway throttling — same logic, server-side.

const rateLimitStore = new Map();

/**
 * Check if an action should be rate-limited.
 * 
 * @param {string} action - Unique action key (e.g., 'login-otp', 'submit-review')
 * @param {Object} options
 * @param {number} options.maxAttempts - Max attempts allowed in the window (default: 5)
 * @param {number} options.windowMs - Time window in ms (default: 60000 = 1 minute)
 * @returns {{ allowed: boolean, retryAfterMs: number }} 
 */
export function checkRateLimit(action, { maxAttempts = 5, windowMs = 60000 } = {}) {
  const now = Date.now();
  const key = action;

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }

  const timestamps = rateLimitStore.get(key);

  // Purge expired timestamps
  const validTimestamps = timestamps.filter(t => now - t < windowMs);
  rateLimitStore.set(key, validTimestamps);

  if (validTimestamps.length >= maxAttempts) {
    const oldestInWindow = validTimestamps[0];
    const retryAfterMs = windowMs - (now - oldestInWindow);
    return { allowed: false, retryAfterMs };
  }

  // Record this attempt
  validTimestamps.push(now);
  return { allowed: true, retryAfterMs: 0 };
}

/**
 * Format retry time for user-friendly display.
 * @param {number} ms - Milliseconds to wait
 * @returns {string} e.g., "42 seconds"
 */
export function formatRetryTime(ms) {
  const seconds = Math.ceil(ms / 1000);
  if (seconds <= 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}


// ─── 3. Timestamp Validation ────────────────────────────────

/**
 * Create a timestamp tracker for a form.
 * Call `getLoadTime()` once when the form mounts.
 * Call `isTooFast(minMs)` at submit time.
 * 
 * @returns {{ getLoadTime: () => number, isTooFast: (minMs?: number) => boolean }}
 */
export function createTimestampTracker() {
  let loadTime = null;

  return {
    /** Record the form load time. Returns the timestamp. */
    getLoadTime() {
      loadTime = Date.now();
      return loadTime;
    },

    /**
     * Check if the form was submitted faster than humanly possible.
     * @param {number} minMs - Minimum expected time in ms (default: 2000 = 2 seconds)
     * @returns {boolean} true if submission was suspiciously fast
     */
    isTooFast(minMs = 2000) {
      if (!loadTime) return false; // fail open if tracker wasn't initialized
      return Date.now() - loadTime < minMs;
    },
  };
}


// ─── Combined Guard ─────────────────────────────────────────

/**
 * Run all anti-spam checks. Returns null if clean, or an error string if blocked.
 * 
 * @param {Object} options
 * @param {string} options.honeypotValue - Value of the honeypot field
 * @param {string} options.action - Rate limit action key
 * @param {{ maxAttempts?: number, windowMs?: number }} options.rateLimit - Rate limit config
 * @param {{ isTooFast: (minMs?: number) => boolean }} options.timestampTracker - Tracker instance
 * @param {number} options.minSubmitTimeMs - Min time for timestamp check (default: 2000)
 * @returns {string|null} Error message if blocked, null if clean
 */
export function runAntiSpamChecks({
  honeypotValue,
  action,
  rateLimit = {},
  timestampTracker,
  minSubmitTimeMs = 2000,
}) {
  // 1. Honeypot
  if (isHoneypotTriggered(honeypotValue)) {
    // Silently drop — don't reveal detection to bots
    console.warn('[AntiSpam] Honeypot triggered');
    return '__silent_drop__';
  }

  // 2. Timestamp
  if (timestampTracker && timestampTracker.isTooFast(minSubmitTimeMs)) {
    console.warn('[AntiSpam] Submission too fast');
    return '__silent_drop__';
  }

  // 3. Rate limit
  if (action) {
    const { allowed, retryAfterMs } = checkRateLimit(action, rateLimit);
    if (!allowed) {
      return `Too many attempts. Please try again in ${formatRetryTime(retryAfterMs)}.`;
    }
  }

  return null;
}
