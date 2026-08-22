/**
 * Honeypot protection for forms
 *
 * HOW IT WORKS:
 * 1. Add hidden field to form that humans won't see (CSS hidden)
 * 2. Bots auto-fill all fields, including honeypot
 * 3. If honeypot field is filled = bot detected = reject
 *
 * USAGE:
 * - Client: Use HoneypotInput component in forms
 * - Server: Use validateHoneypot() to check requests
 */

import { nanoid } from 'nanoid';

// Shared prefix — the client renders `${HONEYPOT_FIELD_PREFIX}${useId()}` so the
// name stays stable between SSR and hydration, the server matches on the prefix.
export const HONEYPOT_FIELD_PREFIX = 'website_url_';

// Honeypot field name (random to avoid bot detection)
export const HONEYPOT_FIELD_NAME = `${HONEYPOT_FIELD_PREFIX}${nanoid(6)}`;

/**
 * Validate honeypot field on server
 * Returns true if request is valid (not a bot)
 */
export function validateHoneypot(formData: FormData | Record<string, any>): boolean {
  // The field name carries a per-form suffix, so match on the prefix instead of
  // the exact name.
  const entries: Array<[string, unknown]> = formData instanceof FormData
    ? Array.from(formData.entries())
    : Object.entries(formData);

  const filled = entries.some(([key, value]) =>
    key.startsWith(HONEYPOT_FIELD_PREFIX) && typeof value === 'string' && value.trim() !== ''
  );

  if (filled) {
    console.warn('Bot detected: Honeypot field filled');
    return false;
  }

  return true;
}

/**
 * Upper bound on the form's age. The timestamp is client-supplied and
 * unsigned, so a tight window buys no replay protection (a bot just sends
 * `Date.now() - 10000`) while it silently drops leads from people who left the
 * tab open. 24 hours is a sanity bound, not a security control.
 */
const MAX_AGE_SECONDS = 24 * 60 * 60;

/**
 * Validate time-based honeypot
 * Forms submitted too quickly are likely bots
 */
export function validateSubmissionTime(
  timestamp: string | number,
  minSeconds: number = 3
): boolean {
  try {
    const submittedTime = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;

    // parseInt('abc') is NaN, and every NaN comparison is false — without this
    // guard a bot skips the timing check by sending a non-numeric timestamp.
    if (!Number.isFinite(submittedTime)) {
      console.warn('Bot detected: Form timestamp is not a number');
      return false;
    }

    const now = Date.now();
    const diff = (now - submittedTime) / 1000; // Convert to seconds

    if (diff < minSeconds) {
      console.warn(`Bot detected: Form submitted too quickly (${diff.toFixed(1)}s < ${minSeconds}s)`);
      return false;
    }

    if (diff > MAX_AGE_SECONDS) {
      console.warn('Bot detected: Form timestamp too old');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating submission time:', error);
    return false;
  }
}

/**
 * Generate client-side timestamp
 */
export function generateTimestamp(): number {
  return Date.now();
}
