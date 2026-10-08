import { NextRequest, NextResponse } from 'next/server';
import { isUnsubscribed, isValidUnsubscribeLink, unsubscribe } from '@/lib/outreach/unsubscribe';

/**
 * /odhlasit/stav?e=…&t=…
 *
 * GET  — whether the address has opted out; the sender asks before each e-mail.
 * POST — one-click unsubscribe (RFC 8058), the target of the e-mail's
 *        List-Unsubscribe header, which mail apps call without showing a page.
 *
 * It lives outside /api on purpose: the middleware requires a browser-shaped
 * request and a same-origin POST there, and a mail provider's one-click call
 * is neither.
 */
export const dynamic = 'force-dynamic';

function linkFrom(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  return { email: searchParams.get('e'), token: searchParams.get('t') };
}

export async function GET(request: NextRequest) {
  const { email, token } = linkFrom(request);
  if (!isValidUnsubscribeLink(email, token)) return NextResponse.json({ error: 'invalid link' }, { status: 400 });
  return NextResponse.json({ unsubscribed: await isUnsubscribed(email) });
}

export async function POST(request: NextRequest) {
  const { email, token } = linkFrom(request);
  if (!isValidUnsubscribeLink(email, token)) return NextResponse.json({ error: 'invalid link' }, { status: 400 });
  await unsubscribe(email, 'one-click');
  return NextResponse.json({ unsubscribed: true });
}
