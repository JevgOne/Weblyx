import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';
import {
  getAudit,
  listAudits,
  markReportSent,
  recordAdminAudit,
  updateAuditCall,
  type AuditSource,
  type CallStatus,
} from '@/lib/audits/server';
import { buildEmailHtml, runAudit, type AuditResult } from '@/lib/audits/report';
import { EMAIL_CONFIG, sendEmail } from '@/lib/email/resend-client';

export const runtime = 'nodejs';
// The crawl alone can take half a minute.
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const offset = Math.max(0, Number(searchParams.get('offset') ?? '0') || 0);
  const limit = Math.min(100, Number(searchParams.get('limit') ?? '25') || 25);

  const sourceParam = searchParams.get('source');
  const source: AuditSource | undefined =
    sourceParam === 'web' || sourceParam === 'admin' ? sourceParam : undefined;

  const { audits, total } = await listAudits({ limit, offset, source });
  return NextResponse.json({ success: true, data: { audits, total } });
}

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

/**
 * Runs an audit and mails the report — what is wrong with the site and what
 * to do about it — to the prospect.
 *
 * Two shapes: `{ id }` re-sends for a row already in the list, `{ url, email }`
 * audits a new prospect. Either way the audit is run now, so the mail never
 * quotes a score from three weeks ago.
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const fail = (error: string, status: number) =>
    NextResponse.json({ success: false, error }, { status });

  let id = typeof body?.id === 'string' ? body.id : '';
  let url: string;
  let email: string;
  let contactName: string | null = null;
  let companyName: string | null = null;
  // A visitor who ran /audit asked for the report; a prospect we looked up
  // did not, and needs to be told who is writing.
  let solicited = false;

  if (id) {
    const existing = await getAudit(id);
    if (!existing) return fail('Audit nenalezen', 404);
    if (!existing.email) return fail('U tohoto auditu chybí e-mail', 400);
    ({ url, email, contactName, companyName } = existing);
    solicited = existing.source === 'web';
  } else {
    url = typeof body?.url === 'string' ? body.url.trim() : '';
    email = typeof body?.email === 'string' ? body.email.trim() : '';
    contactName = typeof body?.contactName === 'string' ? body.contactName.trim() || null : null;
    companyName = typeof body?.companyName === 'string' ? body.companyName.trim() || null : null;
    if (!url) return fail('Zadejte adresu webu', 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Zadejte platný e-mail', 400);
    if (!url.startsWith('http')) url = `https://${url}`;
    try {
      new URL(url);
    } catch {
      return fail('Adresa webu není platná', 400);
    }
  }

  let result: AuditResult;
  try {
    result = await runAudit(url);
  } catch (error) {
    console.error('Admin audit failed:', error);
    return fail('Web se nepodařilo analyzovat. Zkontrolujte adresu.', 422);
  }

  const numbers = { score: result.score, metrics: result.metrics, issueCount: result.issueCount };

  // Kept before the mail goes out, so a failed send leaves a row to retry from
  // instead of a prospect typed in for nothing.
  if (!id) {
    id = await recordAdminAudit({ url, email, contactName, companyName, ...numbers });
  }

  const host = hostOf(url);
  const intro = solicited
    ? undefined
    : `Dobrý den${contactName ? `, ${contactName}` : ''},\n\n` +
      `podívali jsme se na web ${host} a sepsali, co na něm brzdí návštěvníky i vyhledávače — a co s tím. ` +
      `Přehled je zdarma a k ničemu vás nezavazuje. Kdybyste k němu měli otázky, stačí na tento e-mail odpovědět.`;

  const sent = await sendEmail({
    to: email,
    subject: `Audit webu ${host} — skóre ${result.score}/100 a co zlepšit`,
    html: buildEmailHtml(result, { intro }),
    replyTo: EMAIL_CONFIG.adminEmail,
  });
  // Resend reports a rejected message in the payload instead of throwing.
  const sendError = !sent.success ? sent.error : (sent.data as any)?.error?.message;
  if (sendError) {
    console.error('Audit report not sent:', sendError);
    return fail(`Audit proběhl, ale e-mail se nepodařilo odeslat: ${sendError}`, 502);
  }

  await markReportSent(id, numbers);
  return NextResponse.json({ success: true, data: { audit: await getAudit(id) } });
}

/** Call state and notes, edited straight from the list. */
export async function PATCH(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id : '';
  if (!id) {
    return NextResponse.json({ success: false, error: 'Chybí id' }, { status: 400 });
  }

  const STATES = ['new', 'called', 'interested', 'rejected'] as const;
  const callStatus = STATES.includes(body?.callStatus) ? (body.callStatus as CallStatus) : undefined;
  const note = typeof body?.note === 'string' ? body.note : undefined;

  if (!callStatus && note === undefined) {
    return NextResponse.json({ success: false, error: 'Nic k uložení' }, { status: 400 });
  }

  await updateAuditCall(id, { callStatus, note });
  return NextResponse.json({ success: true });
}
