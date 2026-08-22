import { timingSafeEqual } from 'crypto';

/**
 * Shared secret for server-to-server calls (the lead API triggers the AI
 * endpoints on itself). Without it those endpoints would be open to anyone and
 * every request would spend model credits.
 */
export function isInternalRequest(request: Request): boolean {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) return false;

  const provided = request.headers.get('x-internal-secret');
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

/** Headers for an internal fetch; empty when the secret is not configured. */
export function internalRequestHeaders(): Record<string, string> {
  const secret = process.env.INTERNAL_API_SECRET;
  return secret ? { 'x-internal-secret': secret } : {};
}
