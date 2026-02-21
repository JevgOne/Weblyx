/**
 * Distributed rate limiting using Upstash Redis
 * Falls back to in-memory Map if Redis is not configured
 */

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Check if Upstash Redis is configured
const hasRedis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Create Redis client (only if configured)
const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Standard rate limiter: 300 requests per 60 seconds
export const standardRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(300, '60 s'),
      prefix: 'rl:standard',
    })
  : null;

// API rate limiter: 100 requests per 60 seconds
export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '60 s'),
      prefix: 'rl:api',
    })
  : null;

// Burst rate limiter: 50 requests per 10 seconds
export const burstRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, '10 s'),
      prefix: 'rl:burst',
    })
  : null;

// In-memory fallback (for when Redis is not configured)
const memoryStore = new Map<string, { count: number; resetTime: number }>();
const burstStore = new Map<string, { count: number; resetTime: number }>();

// Periodic cleanup of expired entries to prevent memory leak
function cleanupStore(store: Map<string, { count: number; resetTime: number }>) {
  const now = Date.now();
  for (const [key, record] of store) {
    if (now > record.resetTime) store.delete(key);
  }
}
if (typeof setInterval !== 'undefined') {
  setInterval(() => { cleanupStore(memoryStore); cleanupStore(burstStore); }, 60_000);
}

const RATE_LIMIT_WINDOW = 60 * 1000;
const BURST_WINDOW = 10 * 1000;
const BURST_MAX = 50;

export function memoryRateLimit(ip: string, maxRequests: number): boolean {
  const now = Date.now();
  const record = memoryStore.get(ip);

  if (!record || now > record.resetTime) {
    memoryStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= maxRequests) return true;
  record.count++;
  return false;
}

export function memoryBurstLimit(ip: string): boolean {
  const now = Date.now();
  const record = burstStore.get(ip);

  if (!record || now > record.resetTime) {
    burstStore.set(ip, { count: 1, resetTime: now + BURST_WINDOW });
    return false;
  }

  if (record.count >= BURST_MAX) return true;
  record.count++;
  return false;
}

/**
 * Check rate limit (uses Redis if available, falls back to in-memory)
 */
export async function checkRateLimit(
  ip: string,
  type: 'standard' | 'api' | 'burst'
): Promise<{ limited: boolean; remaining?: number }> {
  const limiter =
    type === 'standard' ? standardRateLimit :
    type === 'api' ? apiRateLimit :
    burstRateLimit;

  if (limiter) {
    const result = await limiter.limit(ip);
    return { limited: !result.success, remaining: result.remaining };
  }

  // Fallback to in-memory
  if (type === 'burst') {
    return { limited: memoryBurstLimit(ip) };
  }

  const max = type === 'api' ? 100 : 300;
  return { limited: memoryRateLimit(ip, max) };
}
