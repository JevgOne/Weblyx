import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting: Simple in-memory store (for production use Redis/Vercel KV)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute
const RATE_LIMIT_MAX_REQUESTS_API = 20; // 20 requests per minute for API routes

// Suspicious patterns (common bot signatures)
const SUSPICIOUS_USER_AGENTS = [
  'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests',
  'scrapy', 'selenium', 'headless', 'phantom', 'puppeteer', 'playwright',
];

// Suspicious query patterns
const SUSPICIOUS_QUERIES = ['admin', 'wp-admin', '.env', 'config', 'backup', 'database'];

function isRateLimited(ip: string, maxRequests: number): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count++;
  return false;
}

function isSuspiciousUserAgent(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return SUSPICIOUS_USER_AGENTS.some(pattern => ua.includes(pattern));
}

function isSuspiciousQuery(pathname: string): boolean {
  const path = pathname.toLowerCase();
  return SUSPICIOUS_QUERIES.some(pattern => path.includes(pattern));
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  // 1. Block suspicious user agents (except for admin routes if needed)
  if (!pathname.startsWith('/admin') && isSuspiciousUserAgent(userAgent)) {
    console.log(`🚫 Blocked suspicious user agent: ${userAgent} from IP: ${ip}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 2. Block suspicious query patterns
  if (isSuspiciousQuery(pathname)) {
    console.log(`🚫 Blocked suspicious query: ${pathname} from IP: ${ip}`);
    return new NextResponse('Not Found', { status: 404 });
  }

  // 3. Rate limiting
  const isApiRoute = pathname.startsWith('/api');
  const maxRequests = isApiRoute ? RATE_LIMIT_MAX_REQUESTS_API : RATE_LIMIT_MAX_REQUESTS;

  if (isRateLimited(ip, maxRequests)) {
    console.log(`🚫 Rate limit exceeded for IP: ${ip} on ${pathname}`);
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
      },
    });
  }

  // 4. Admin route protection (must be handled in AdminAuthProvider, but add extra layer)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    // Add additional logging for admin access attempts
    console.log(`🔒 Admin access attempt: ${pathname} from IP: ${ip}`);
  }

  // 5. Block direct access to API routes from external origins (CSRF protection)
  if (isApiRoute && request.method === 'POST') {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');

    // Allow requests from same origin or localhost (for development)
    const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1');
    const isSameOrigin = origin && (origin.includes(host || '') || isLocalhost);
    const hasReferer = referer && (referer.includes(host || '') || isLocalhost);

    if (!isSameOrigin && !hasReferer && !isLocalhost) {
      console.log(`🚫 Blocked cross-origin POST request to ${pathname} from ${origin || 'unknown'}`);
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  // 6. Add security headers to response
  const response = NextResponse.next();

  // Anti-scraping headers
  response.headers.set('X-Robots-Tag', 'noarchive, nosnippet');

  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
