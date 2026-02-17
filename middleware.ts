import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Rate limiting: Simple in-memory store (for production use Redis/Vercel KV)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// Rate limiting (balanced for real users + security)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 300; // 300 requests per minute (5 req/s - allows multiple page loads)
const RATE_LIMIT_MAX_REQUESTS_API = 100; // 100 requests per minute for API routes

// Burst protection: Max requests per 10 seconds
const BURST_WINDOW = 10 * 1000; // 10 seconds
const BURST_MAX_REQUESTS = 50; // Max 50 requests in 10 seconds (page load with all assets)

// Track burst requests separately
const burstLimit = new Map<string, { count: number; resetTime: number }>();

// WHITELIST: Legitimate search engine bots + AI crawlers (NEVER block these!)
const WHITELISTED_BOTS = [
  'googlebot',      // Google Search
  'google-inspectiontool', // Google Search Console URL Inspection
  'bingbot',        // Bing Search
  'slurp',          // Yahoo Search
  'duckduckbot',    // DuckDuckGo
  'baiduspider',    // Baidu Search
  'yandexbot',      // Yandex Search
  'facebot',        // Facebook crawler
  'facebookexternalhit', // Facebook Sharing Debugger
  'twitterbot',     // Twitter crawler
  'linkedinbot',    // LinkedIn crawler
  'discordbot',     // Discord link previews
  'slackbot',       // Slack link previews
  'telegrambot',    // Telegram link previews
  'whatsapp',       // WhatsApp link previews
  // AI crawlers — allowed per robots.txt for AI search visibility
  'gptbot',         // OpenAI GPTBot
  'chatgpt-user',   // ChatGPT browsing
  'ccbot',          // Common Crawl (used by AI training)
  'perplexitybot',  // Perplexity AI
  'anthropic-ai',   // Anthropic
  'claude-web',     // Claude browsing
  'cohere-ai',      // Cohere
  'google-extended', // Google Gemini training
];

// MAXIMUM SECURITY: Block ALL bots and automated tools EXCEPT whitelisted
const BLOCKED_USER_AGENTS = [
  // Scrapers & Crawlers (but NOT legitimate search engines)
  'spider', 'scraper', 'scrape', 'crawl',

  // Download tools
  'curl', 'wget', 'aria2', 'axel', 'download', 'fetch',

  // HTTP libraries
  'python-requests', 'python-urllib', 'urllib', 'httpie', 'http-client',
  'axios', 'got', 'node-fetch', 'superagent', 'request',

  // Automation tools
  'selenium', 'webdriver', 'headless', 'phantom', 'puppeteer', 'playwright',
  'mechanize', 'beautifulsoup', 'scrapy', 'jsdom', 'cheerio',

  // AI/LLM bots — MOVED TO WHITELIST (need access for AI search visibility)

  // Archive/snapshot tools
  'archive', 'wayback', 'snapshot', 'mirror', 'httrack', 'teleport',

  // Monitoring/testing tools (NOT lighthouse/pagespeed/gtmetrix — those are legitimate)
  'pingdom', 'uptime', 'monitor', 'check', 'test', 'benchmark',

  // Generic patterns
  'auto', 'script', 'program', 'library', 'framework',
];

// Required keywords that MUST be present in legitimate browsers
const REQUIRED_BROWSER_KEYWORDS = ['mozilla', 'chrome', 'safari', 'firefox', 'edge', 'opera'];

// Suspicious query patterns (WordPress & malicious paths)
// NOTE: 'admin' removed because we use /admin for our admin panel
const SUSPICIOUS_QUERIES = [
  'wp-admin', 'wp-login', 'wp-content', 'wp-includes', 'wp-json',
  '.env', '.git', 'config', 'backup', 'database', 'dump', 'sql',
  'phpmyadmin', 'mysql', 'api-docs', 'swagger',
];

// Suspicious file extensions (trying to download source code)
const BLOCKED_EXTENSIONS = [
  '.git', '.env', '.config', '.yml', '.yaml', '.json',
  '.sql', '.db', '.sqlite', '.backup', '.bak',
  '.zip', '.tar', '.gz', '.rar', '.7z',
];

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

function isBurstLimited(ip: string): boolean {
  const now = Date.now();
  const record = burstLimit.get(ip);

  if (!record || now > record.resetTime) {
    burstLimit.set(ip, { count: 1, resetTime: now + BURST_WINDOW });
    return false;
  }

  if (record.count >= BURST_MAX_REQUESTS) {
    return true;
  }

  record.count++;
  return false;
}

function isSuspiciousUserAgent(userAgent: string): boolean {
  if (!userAgent || userAgent.length < 10) {
    // Empty or too short user agent = bot
    return true;
  }

  const ua = userAgent.toLowerCase();

  // ✅ FIRST: Check if it's a whitelisted bot (search engines, social crawlers)
  const isWhitelistedBot = WHITELISTED_BOTS.some(bot => ua.includes(bot));
  if (isWhitelistedBot) {
    console.log(`✅ [WHITELISTED BOT] Allowing: ${userAgent.substring(0, 100)}`);
    return false; // Allow whitelisted bots
  }

  // ❌ THEN: Check if blocked pattern exists
  if (BLOCKED_USER_AGENTS.some(pattern => ua.includes(pattern))) {
    return true;
  }

  // Check if it looks like a legitimate browser
  const hasRequiredKeyword = REQUIRED_BROWSER_KEYWORDS.some(keyword => ua.includes(keyword));
  if (!hasRequiredKeyword) {
    // Doesn't look like a real browser = block
    return true;
  }

  return false;
}

function isSuspiciousQuery(pathname: string): boolean {
  const path = pathname.toLowerCase();

  // Check suspicious queries
  if (SUSPICIOUS_QUERIES.some(pattern => path.includes(pattern))) {
    return true;
  }

  // Check blocked file extensions
  if (BLOCKED_EXTENSIONS.some(ext => path.endsWith(ext))) {
    return true;
  }

  return false;
}

function hasValidHeaders(request: NextRequest): boolean {
  // Real browsers send these headers
  const acceptHeader = request.headers.get('accept');
  const acceptLanguage = request.headers.get('accept-language');
  const acceptEncoding = request.headers.get('accept-encoding');

  // If missing basic headers = likely bot
  if (!acceptHeader) {
    return false;
  }

  // Real browsers accept HTML, but also check for wildcard (mobile browsers sometimes use */*)
  if (!acceptHeader.includes('text/html') && !acceptHeader.includes('*/*')) {
    return false;
  }

  return true;
}

// Create i18n middleware instance
const intlMiddleware = createIntlMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const hostname = request.headers.get('host') || '';

  // WWW REDIRECT: Redirect weblyx.cz → www.weblyx.cz (301 permanent)
  // This ensures Google indexes only the www version and resolves
  // "Alternate page with proper canonical tag" issues in Search Console
  if (hostname === 'weblyx.cz') {
    const url = new URL(request.url);
    url.host = 'www.weblyx.cz';
    return NextResponse.redirect(url, 301);
  }

  // Check if this is a whitelisted bot (used in multiple places)
  const isWhitelistedBot = WHITELISTED_BOTS.some(bot => userAgent.toLowerCase().includes(bot));

  // SKIP security checks for static assets (already in matcher, but double-check)
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

  // ALLOW admin panel access (auth is handled separately by AdminAuthProvider)
  const isAdminRoute = pathname.startsWith('/admin');

  // 1. Block suspicious user agents (skip for admin - auth handled separately)
  if (!isAdminRoute && isSuspiciousUserAgent(userAgent)) {
    console.log(`[BOT BLOCKED] User-Agent: ${userAgent.substring(0, 100)} | IP: ${ip} | Path: ${pathname}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 2. Validate browser headers (skip for whitelisted bots and API routes)
  if (!pathname.startsWith('/api') && !isWhitelistedBot && !hasValidHeaders(request)) {
    console.log(`[INVALID HEADERS] Missing browser headers | IP: ${ip} | Path: ${pathname}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 3. Block suspicious query patterns (skip for blog posts — they may contain tech keywords like "wordpress")
  const isBlogRoute = pathname.startsWith('/blog/');
  if (!isBlogRoute && isSuspiciousQuery(pathname)) {
    console.log(`🚫 [SUSPICIOUS PATH] Blocked: ${pathname} | IP: ${ip}`);
    return new NextResponse('Not Found', { status: 404 });
  }

  // 4. BURST PROTECTION: Block rapid-fire requests (scraper pattern)
  // Skip rate limiting for whitelisted bots and admin routes
  if (!isWhitelistedBot && !isAdminRoute && isBurstLimited(ip)) {
    console.log(`🚫 [BURST LIMIT] IP: ${ip} | Too many requests in 10s | Path: ${pathname}`);
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '10',
      },
    });
  }

  // 5. RATE LIMITING: Standard rate limit (skip for whitelisted bots and admin)
  const isApiRoute = pathname.startsWith('/api');
  const maxRequests = isApiRoute ? RATE_LIMIT_MAX_REQUESTS_API : RATE_LIMIT_MAX_REQUESTS;

  if (!isWhitelistedBot && !isAdminRoute && isRateLimited(ip, maxRequests)) {
    console.log(`🚫 [RATE LIMIT] IP: ${ip} | Exceeded ${maxRequests} req/min | Path: ${pathname}`);
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

  // 6. Domain-based locale detection (for i18n)
  let locale = 'cs'; // Default to Czech
  if (hostname.includes('seitelyx.de')) {
    locale = 'de';
  } else if (hostname.includes('weblyx.cz') || hostname.includes('localhost')) {
    locale = 'cs';
  }

  // Store locale in request headers for i18n middleware
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);
  requestHeaders.set('x-default-locale', locale);

  // 7. Apply i18n middleware (only for non-API, non-admin routes)
  // TEMPORARILY DISABLED: i18n app structure not migrated yet, causing 404s
  let response: NextResponse;
  response = NextResponse.next();

  // if (!pathname.startsWith('/api') && !pathname.startsWith('/admin')) {
  //   // Apply i18n middleware for public pages
  //   const intlResponse = intlMiddleware(request);
  //   response = intlResponse || NextResponse.next();
  // } else {
  //   // Skip i18n for API/admin routes
  //   response = NextResponse.next();
  // }

  // 8. Add locale headers to response
  response.headers.set('x-locale', locale);
  response.headers.set('x-domain', hostname);

  // 9. Add MAXIMUM SECURITY headers to response

  // DEBUG: Add header to show bot was allowed
  if (isWhitelistedBot) {
    response.headers.set('X-Bot-Status', 'whitelisted');
  }

  // Cross-locale noindex: German pages on weblyx.cz and Czech pages on seitelyx.de
  // Prevents Google from indexing wrong-language content under the wrong domain
  const germanOnlyRoutes = ['/leistungen', '/uber-uns', '/anfrage', '/preise', '/impressum', '/datenschutz', '/schreiben-sie-eine-bewertung', '/website-erstellen-berlin', '/website-erstellen-muenchen', '/onlineshop-erstellen', '/wordpress-alternative', '/website-fuer-aerzte'];
  const czechOnlyRoutes = ['/sluzby', '/o-nas', '/poptavka', '/napiste-recenzi', '/pagespeed-garance', '/ochrana-udaju', '/obchodni-podminky', '/cookies', '/tvorba-webu-praha', '/tvorba-webu-brno', '/tvorba-webu-ostrava', '/webnode-alternativa', '/wordpress-alternativa'];
  const isGermanPage = germanOnlyRoutes.some(r => pathname === r || pathname.startsWith(r + '/'));
  const isCzechPage = czechOnlyRoutes.some(r => pathname === r || pathname.startsWith(r + '/'));
  const isSeitelyx = hostname.includes('seitelyx.de');
  const wrongLocale = (isGermanPage && !isSeitelyx) || (isCzechPage && isSeitelyx);

  if (wrongLocale) {
    response.headers.set('X-Robots-Tag', 'noindex, noarchive');
  } else {
    // Anti-scraping headers (ALLOW indexing, just prevent archiving/snippets for copyright)
    response.headers.set('X-Robots-Tag', 'noarchive');
  }

  // PERFORMANCE FIX: Only apply aggressive no-cache for admin/API routes
  // Let Next.js ISR work normally for public pages
  if (isAdminRoute || isApiRoute) {
    // Prevent content download/caching for sensitive routes only
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  } else {
    // Allow Next.js default caching for public pages (ISR, static generation)
    // This dramatically improves performance for legitimate users
    // Note: Next.js will set appropriate cache headers based on page type
  }

  // Content protection
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Download-Options', 'noopen');

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
     * - Static assets (css, js, images)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:css|js|svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
