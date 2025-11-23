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

// Honeypot field name (random to avoid bot detection)
export const HONEYPOT_FIELD_NAME = `website_url_${nanoid(6)}`;

/**
 * Validate honeypot field on server
 * Returns true if request is valid (not a bot)
 */
export function validateHoneypot(formData: FormData | Record<string, any>): boolean {
  const honeypotValue = formData instanceof FormData
    ? formData.get(HONEYPOT_FIELD_NAME)
    : formData[HONEYPOT_FIELD_NAME];

  // If honeypot is filled = bot
  if (honeypotValue && typeof honeypotValue === 'string' && honeypotValue.trim() !== '') {
    console.log('🚫 Bot detected: Honeypot field filled');
    return false;
  }

  return true;
}

/**
 * Validate time-based honeypot
 * Forms submitted too quickly are likely bots
 */
export function validateSubmissionTime(
  timestamp: string | number,
  minSeconds: number = 3
): boolean {
  try {
    const submittedTime = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    const now = Date.now();
    const diff = (now - submittedTime) / 1000; // Convert to seconds

    if (diff < minSeconds) {
      console.log(`🚫 Bot detected: Form submitted too quickly (${diff.toFixed(1)}s < ${minSeconds}s)`);
      return false;
    }

    // Also check if timestamp is too old (prevent replay attacks)
    if (diff > 3600) { // 1 hour
      console.log('🚫 Bot detected: Form timestamp too old');
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
