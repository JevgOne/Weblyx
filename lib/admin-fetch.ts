/**
 * Helper for admin panel API calls - includes CSRF token automatically.
 * The middleware requires x-csrf-token header for all POST/PATCH/DELETE requests in production.
 */

function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

/** Returns headers object with Content-Type and CSRF token for state-changing requests */
export function adminHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-csrf-token': getCsrfToken(),
  };
}

/** Wrapper around fetch that includes CSRF token and handles non-JSON error responses */
export async function adminFetch(url: string, options?: RequestInit): Promise<{ ok: boolean; status: number; data: any }> {
  const csrfToken = getCsrfToken();
  const headers = new Headers(options?.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (csrfToken) {
    headers.set('x-csrf-token', csrfToken);
  }

  const res = await fetch(url, { ...options, headers });

  // Handle non-JSON responses (e.g. middleware returning plain text "CSRF token mismatch")
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    return {
      ok: false,
      status: res.status,
      data: { success: false, error: `${res.status}: ${text}` },
    };
  }

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}
