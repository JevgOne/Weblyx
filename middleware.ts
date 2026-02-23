import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { checkRateLimit } from './lib/rate-limit';

// WHITELIST: Legitimate search engine bots + AI crawlers (NEVER block these!)
const WHITELISTED_BOTS = [
  'googlebot', 'google-inspectiontool', 'bingbot', 'slurp',
  'duckduckbot', 'baiduspider', 'yandexbot', 'facebot',
  'facebookexternalhit', 'twitterbot', 'linkedinbot', 'discordbot',
  'slackbot', 'telegrambot', 'whatsapp',
  // AI crawlers — allowed per robots.txt for AI search visibility
  'gptbot', 'chatgpt-user', 'ccbot', 'perplexitybot',
  'anthropic-ai', 'claude-web', 'cohere-ai', 'google-extended',
];

// Block ALL bots and automated tools EXCEPT whitelisted
const BLOCKED_USER_AGENTS = [
  'spider', 'scraper', 'scrape', 'crawl',
  'curl', 'wget', 'aria2', 'axel', 'download', 'fetch',
  'python-requests', 'python-urllib', 'urllib', 'httpie', 'http-client',
  'axios', 'got', 'node-fetch', 'superagent', 'request',
  'selenium', 'webdriver', 'headless', 'phantom', 'puppeteer', 'playwright',
  'mechanize', 'beautifulsoup', 'scrapy', 'jsdom', 'cheerio',
  // AI/LLM bots — MOVED TO WHITELIST
  'archive', 'wayback', 'snapshot', 'mirror', 'httrack', 'teleport',
  'pingdom', 'uptime', 'monitor', 'check', 'test', 'benchmark',
  'auto', 'script', 'program', 'library', 'framework',
];

const REQUIRED_BROWSER_KEYWORDS = ['mozilla', 'chrome', 'safari', 'firefox', 'edge', 'opera'];

const SUSPICIOUS_QUERIES = [
  'wp-admin', 'wp-login', 'wp-content', 'wp-includes', 'wp-json',
  '.env', '.git', 'config', 'backup', 'database', 'dump', 'sql',
  'phpmyadmin', 'mysql', 'api-docs', 'swagger',
];

const BLOCKED_EXTENSIONS = [
  '.git', '.env', '.config', '.yml', '.yaml',
  '.sql', '.db', '.sqlite', '.backup', '.bak',
  '.zip', '.tar', '.gz', '.rar', '.7z',
];

function isSuspiciousUserAgent(userAgent: string): boolean {
  if (!userAgent || userAgent.length < 10) return true;
  const ua = userAgent.toLowerCase();

  if (WHITELISTED_BOTS.some(bot => ua.includes(bot))) return false;
  if (BLOCKED_USER_AGENTS.some(pattern => ua.includes(pattern))) return true;
  if (!REQUIRED_BROWSER_KEYWORDS.some(keyword => ua.includes(keyword))) return true;

  return false;
}

function isSuspiciousQuery(pathname: string): boolean {
  const path = pathname.toLowerCase();
  if (SUSPICIOUS_QUERIES.some(pattern => path.includes(pattern))) return true;
  if (BLOCKED_EXTENSIONS.some(ext => path.endsWith(ext))) return true;
  return false;
}

function hasValidHeaders(request: NextRequest): boolean {
  const acceptHeader = request.headers.get('accept');
  if (!acceptHeader) return false;
  if (!acceptHeader.includes('text/html') && !acceptHeader.includes('*/*')) return false;
  return true;
}

// Generate CSRF token
function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Create i18n middleware instance
const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const hostname = request.headers.get('host') || '';

  // WWW REDIRECT
  if (hostname === 'weblyx.cz') {
    const url = new URL(request.url);
    url.host = 'www.weblyx.cz';
    return NextResponse.redirect(url, 301);
  }

  // E-shop pages temporarily disabled - redirect to services
  if (pathname === '/tvorba-eshopu') {
    return NextResponse.redirect(new URL('/sluzby', request.url), 302);
  }
  if (pathname === '/onlineshop-erstellen') {
    return NextResponse.redirect(new URL('/leistungen', request.url), 302);
  }

  const isWhitelistedBot = WHITELISTED_BOTS.some(bot => userAgent.toLowerCase().includes(bot));

  // Skip security checks for static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // SKIP security checks for AI/bot-facing discovery files
  if (pathname === '/llms.txt' || pathname.startsWith('/.well-known/')) {
    return NextResponse.next();
  }

  const isAdminRoute = pathname.startsWith('/admin');
  const isApiRoute = pathname.startsWith('/api');

  // 1. Block suspicious user agents
  if (!isAdminRoute && isSuspiciousUserAgent(userAgent)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 2. Validate browser headers
  if (!isApiRoute && !isWhitelistedBot && !hasValidHeaders(request)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 3. Block suspicious paths
  const isBlogRoute = pathname.startsWith('/blog/');
  if (!isBlogRoute && isSuspiciousQuery(pathname)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // 4. Rate limiting (single check - burst limit covers both burst and sustained)
  if (!isWhitelistedBot && !isAdminRoute) {
    const type = isApiRoute ? 'api' : 'burst';
    const rateResult = await checkRateLimit(ip, type);
    if (rateResult.limited) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': isApiRoute ? '60' : '10' },
      });
    }
  }

  // 5. CSRF protection for state-changing API requests
  if (isApiRoute && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');
    const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1');

    // Origin/Referer check
    const isSameOrigin = origin && (origin.includes(host || '') || isLocalhost);
    const hasReferer = referer && (referer.includes(host || '') || isLocalhost);

    if (!isSameOrigin && !hasReferer && !isLocalhost) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // CSRF double-submit cookie check (skip for public form endpoints and admin sessions)
    const publicEndpoints = ['/api/contact', '/api/leads', '/api/audit', '/api/newsletter', '/api/auth/login', '/api/auth/register'];
    const isPublicEndpoint = publicEndpoints.some(ep => pathname.startsWith(ep));

    // Admin session cookie uses sameSite: strict, which already prevents CSRF attacks
    // (browser won't send the cookie on cross-site requests), so skip double-submit check
    const hasAdminSession = !!request.cookies.get('admin-session')?.value;

    if (!isPublicEndpoint && !isLocalhost && !hasAdminSession) {
      const csrfCookie = request.cookies.get('csrf-token')?.value;
      const csrfHeader = request.headers.get('x-csrf-token');

      if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return new NextResponse('CSRF token mismatch', { status: 403 });
      }
    }
  }

  // 6. Domain-based locale detection
  let locale = 'cs';
  if (hostname.includes('seitelyx.de')) {
    locale = 'de';
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);
  requestHeaders.set('x-default-locale', locale);

  // 7. Build response
  let response: NextResponse = NextResponse.next();

  // 8. Set CSRF token cookie if not present
  if (!request.cookies.get('csrf-token')?.value) {
    const csrfToken = generateCsrfToken();
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: false, // JS needs to read it for the header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  // 9. Locale headers
  response.headers.set('x-locale', locale);
  response.headers.set('x-domain', hostname);

  if (isWhitelistedBot) {
    response.headers.set('X-Bot-Status', 'whitelisted');
  }

  // 10. Cross-locale noindex
  const germanOnlyRoutes = ['/leistungen', '/uber-uns', '/anfrage', '/preise', '/impressum', '/datenschutz', '/schreiben-sie-eine-bewertung', '/website-erstellen-berlin', '/website-erstellen-muenchen', '/onlineshop-erstellen', '/wordpress-alternative', '/website-fuer-aerzte'];
  const czechOnlyRoutes = ['/sluzby', '/o-nas', '/poptavka', '/napiste-recenzi', '/pagespeed-garance', '/ochrana-udaju', '/obchodni-podminky', '/cookies', '/tvorba-webu-praha', '/tvorba-webu-brno', '/tvorba-webu-ostrava', '/webnode-alternativa', '/wordpress-alternativa'];
  const isGermanPage = germanOnlyRoutes.some(r => pathname === r || pathname.startsWith(r + '/'));
  const isCzechPage = czechOnlyRoutes.some(r => pathname === r || pathname.startsWith(r + '/'));
  const isSeitelyx = hostname.includes('seitelyx.de');
  const wrongLocale = (isGermanPage && !isSeitelyx) || (isCzechPage && isSeitelyx);

  if (wrongLocale) {
    response.headers.set('X-Robots-Tag', 'noindex, noarchive');
  } else {
    response.headers.set('X-Robots-Tag', 'noarchive');
  }

  // 11. Cache headers
  if (isAdminRoute || isApiRoute) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Download-Options', 'noopen');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:css|js|svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
