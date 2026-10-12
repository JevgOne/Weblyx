/**
 * Who may call which /api route. Enforced in middleware, so a route is closed
 * by default: a new endpoint needs no auth code of its own to be private, and
 * forgetting that code — which is how invoices, ad campaigns and analytics
 * ended up readable without a login — no longer opens it.
 *
 * Edge-safe: no Node imports. The session token is checked with Web Crypto.
 */
import { hasPermission, type Permission, type UserRole } from './permissions';

type Rule = { path: string; methods?: string[]; exact?: boolean };

/** Reachable without a session: public forms, auth itself, and callers that
 *  authenticate another way (cron secret, payment gateway signature). */
const PUBLIC_RULES: Rule[] = [
  { path: '/api/contact', methods: ['POST'], exact: true },
  { path: '/api/leads', methods: ['POST'], exact: true },
  { path: '/api/audit', methods: ['POST'], exact: true },
  { path: '/api/newsletter/subscribe', methods: ['POST'], exact: true },
  { path: '/api/blog/feedback', methods: ['POST'], exact: true },
  { path: '/api/reviews/submit', methods: ['POST'], exact: true },
  { path: '/api/promo-code/validate', methods: ['POST'], exact: true },
  { path: '/api/google-reviews', methods: ['GET'], exact: true },
  { path: '/api/status', methods: ['GET'], exact: true },
  { path: '/api/auth' },
  { path: '/api/cron' },
  // GET is the scheduler (it checks the cron secret); POST is the admin's
  // "run now" button and needs a session like the rest.
  { path: '/api/google-marketing/cron', methods: ['GET'], exact: true },
  { path: '/api/payments/webhook' },
  // Published content. Their write handlers check the session themselves and
  // are covered by the permission table below.
  { path: '/api/cms', methods: ['GET'] },
  { path: '/api/blog', methods: ['GET'], exact: true },
  { path: '/api/portfolio', methods: ['GET'], exact: true },
];

/** First match wins, so the longer prefix goes above the shorter one. */
const PERMISSION_RULES: Array<{ path: string; permission: Permission }> = [
  { path: '/api/admin/users', permission: 'users' },
  { path: '/api/admin/activity-logs', permission: 'users' },
  { path: '/api/admin/tasks', permission: 'tasks' },
  { path: '/api/admin/stats', permission: 'dashboard' },
  { path: '/api/admin/site-stats', permission: 'dashboard' },
  { path: '/api/push', permission: 'dashboard' },
  { path: '/api/admin/leads', permission: 'leads' },
  { path: '/api/admin/audits', permission: 'leads' },
  { path: '/api/admin/konzultace', permission: 'leads' },
  { path: '/api/admin/generate-pdf', permission: 'leads' },
  { path: '/api/leads', permission: 'leads' },
  { path: '/api/clients', permission: 'leads' },
  { path: '/api/generate-designs', permission: 'leads' },
  { path: '/api/admin/projects', permission: 'projects' },
  { path: '/api/admin/analyze-website', permission: 'web_analyzer' },
  { path: '/api/admin/screenshot', permission: 'web_analyzer' },
  { path: '/api/admin/blog', permission: 'blog' },
  { path: '/api/blog', permission: 'blog' },
  { path: '/api/admin/reviews', permission: 'reviews' },
  { path: '/api/reviews', permission: 'reviews' },
  { path: '/api/portfolio', permission: 'portfolio' },
  { path: '/api/media', permission: 'media' },
  { path: '/api/upload', permission: 'media' },
  { path: '/api/admin/changelog', permission: 'content' },
  { path: '/api/cms', permission: 'content' },
  { path: '/api/services', permission: 'content' },
  { path: '/api/revalidate', permission: 'content' },
  { path: '/api/promo-code', permission: 'promo_codes' },
  { path: '/api/payments', permission: 'payments' },
  { path: '/api/invoices', permission: 'invoices' },
  { path: '/api/eroweb', permission: 'eroweb' },
  { path: '/api/google-ads', permission: 'stats' },
  { path: '/api/meta-ads', permission: 'stats' },
  { path: '/api/marketing', permission: 'stats' },
  { path: '/api/google-marketing', permission: 'stats' },
  { path: '/api/search-console', permission: 'stats' },
  { path: '/api/analytics', permission: 'stats' },
  { path: '/api/shoptet', permission: 'stats' },
  { path: '/api/ai-assistant', permission: 'stats' },
];

/** Admin pages, for the same check on navigation. Anything under /admin that
 *  is not listed needs the widest permission. */
const PAGE_RULES: Array<{ path: string; permission: Permission }> = [
  { path: '/admin/dashboard', permission: 'dashboard' },
  { path: '/admin/tasks', permission: 'tasks' },
  { path: '/admin/settings', permission: 'settings' },
];

// A path the table does not know is treated as the most sensitive kind.
const FALLBACK_PERMISSION: Permission = 'users';

const under = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

export function isPublicApi(pathname: string, method: string): boolean {
  return PUBLIC_RULES.some(
    (r) =>
      (r.exact ? pathname === r.path : under(pathname, r.path)) &&
      (!r.methods || r.methods.includes(method))
  );
}

export function permissionForApi(pathname: string): Permission {
  return PERMISSION_RULES.find((r) => under(pathname, r.path))?.permission ?? FALLBACK_PERMISSION;
}

export function permissionForAdminPage(pathname: string): Permission | null {
  // /admin.webmanifest and the like are not the panel.
  if (!under(pathname, '/admin')) return null;
  if (pathname === '/admin' || under(pathname, '/admin/login') || under(pathname, '/admin/register')) return null;
  return PAGE_RULES.find((r) => under(pathname, r.path))?.permission ?? FALLBACK_PERMISSION;
}

export function roleMay(role: UserRole, permission: Permission): boolean {
  return hasPermission(role, permission);
}

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = '';
  for (const b of new Uint8Array(bytes)) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * The role carried by a session token, or null when the token is missing,
 * forged or expired. Mirrors verifySessionToken in simple-auth.ts, which the
 * route handlers keep using — this one only has to run on the edge.
 */
export async function roleFromSessionToken(token: string | undefined): Promise<UserRole | null> {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!token || !secret) return null;

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const expected = toBase64Url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(encoded)));
    if (!safeEqual(signature, expected)) return null;

    const json = new TextDecoder().decode(
      Uint8Array.from(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
    );
    const payload = JSON.parse(json);
    if (payload.exp && payload.exp < Date.now()) return null;
    if (typeof payload.id !== 'string' || !payload.id.startsWith('admin-')) return null;

    // The account from the environment is always the owner, whatever the token says.
    if (payload.id === 'admin-1') {
      return payload.email === (process.env.ADMIN_EMAIL || '') ? 'owner' : null;
    }
    return payload.role === 'owner' || payload.role === 'admin' || payload.role === 'specialist' ? payload.role : 'admin';
  } catch {
    return null;
  }
}

/** Server-to-server calls the site makes to itself carry this instead of a cookie. */
export function hasInternalSecret(provided: string | null): boolean {
  const secret = process.env.INTERNAL_API_SECRET;
  return Boolean(secret && provided && safeEqual(provided, secret));
}
