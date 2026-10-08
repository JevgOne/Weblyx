import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';
import { turso } from '@/lib/turso';
import { sendEmail } from '@/lib/email/resend-client';
import { OUTREACH, buildOutreachEmail } from '@/lib/outreach/email';
import { isUnsubscribed } from '@/lib/outreach/unsubscribe';
import { EMAIL } from '@/lib/outreach/csv';
import { improveQueuedEmails } from '@/lib/outreach/improve';

/**
 * Sending the outreach e-mails that were imported with the lead list.
 *
 * GET  — what would go out next: the queue size, the next batch, and the first
 *        e-mail rendered. Sends nothing.
 * POST — { action: 'test', to }  one sample to the given address, not recorded
 *        { action: 'analyze' }   rewrites a few queued e-mails from an analysis
 *                                of each company's website; call until none remain
 *        { action: 'send' }      the next batch, at most 20, 1.5 s apart
 *
 * A company is written to once: a lead is marked the moment its e-mail is
 * accepted, the queue only holds unmarked leads, and an address that has
 * opted out is never in it. The first error stops the batch — a bad key or a
 * rate limit will not get better by trying the next nineteen.
 */
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

interface Queued {
  leadId: string;
  emailId: string;
  company: string;
  email: string;
  subject: string;
  body: string;
}

async function queue(limit?: number): Promise<Queued[]> {
  // Creates the opt-out table if this is the first time anything asks about it.
  await isUnsubscribed('nobody@example.invalid');
  const result = await turso.execute({
    sql: `SELECT l.id AS lead_id, g.id AS email_id, l.company_name, l.email, g.subject, g.body
            FROM lead_generation_leads l
            JOIN generated_emails g ON g.lead_id = l.id
           WHERE l.email_sent = 0 AND g.sent = 0 AND l.lead_status != 'rejected'
             AND lower(l.email) NOT IN (SELECT email FROM outreach_unsubscribes)
           GROUP BY l.id
           ORDER BY l.created_at, l.id
           ${limit ? 'LIMIT ?' : ''}`,
    args: limit ? [limit] : [],
  });
  return result.rows.map((r) => ({
    leadId: String(r.lead_id),
    emailId: String(r.email_id),
    company: String(r.company_name),
    email: String(r.email),
    subject: String(r.subject),
    body: String(r.body),
  }));
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  // ?leadId=… — the e-mail of one company, as it was or will be sent.
  const leadId = request.nextUrl.searchParams.get('leadId');
  if (leadId) {
    const one = await turso.execute({
      sql: `SELECT l.email, g.subject, g.body FROM lead_generation_leads l
              JOIN generated_emails g ON g.lead_id = l.id
             WHERE l.id = ? ORDER BY g.created_at DESC LIMIT 1`,
      args: [leadId],
    });
    const row = one.rows[0];
    return NextResponse.json({
      success: true,
      subject: row ? String(row.subject) : null,
      html: row ? buildOutreachEmail(String(row.body), String(row.email)).html : null,
    });
  }

  const all = await queue();
  const batch = all.slice(0, OUTREACH.batchSize);
  const sent = await turso.execute('SELECT COUNT(*) AS n FROM lead_generation_leads WHERE email_sent = 1');
  const optedOut = await turso.execute('SELECT COUNT(*) AS n FROM outreach_unsubscribes');
  const toAnalyze = await turso.execute(
    `SELECT COUNT(*) AS n FROM lead_generation_leads l
      WHERE l.email_sent = 0 AND l.analyzed_at IS NULL AND l.lead_status != 'rejected'
        AND l.website IS NOT NULL AND l.website != ''
        AND EXISTS (SELECT 1 FROM generated_emails g WHERE g.lead_id = l.id AND g.sent = 0)`
  );

  return NextResponse.json({
    success: true,
    from: OUTREACH.from,
    queued: all.length,
    sent: Number(sent.rows[0].n),
    optedOut: Number(optedOut.rows[0].n),
    toAnalyze: Number(toAnalyze.rows[0].n),
    batch: batch.map((m) => ({ company: m.company, email: m.email, subject: m.subject })),
    preview: batch[0] ? { subject: batch[0].subject, html: buildOutreachEmail(batch[0].body, batch[0].email).html } : null,
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  const { action, to } = await request.json().catch(() => ({}));

  if (action === 'test') {
    if (typeof to !== 'string' || !to.includes('@')) {
      return NextResponse.json({ success: false, error: 'Zadejte adresu, kam má zkouška přijít.' }, { status: 400 });
    }
    const [first] = await queue(1);
    if (!first) return NextResponse.json({ success: false, error: 'Fronta je prázdná.' }, { status: 400 });
    // Built for the test address, so its unsubscribe link cannot opt the real company out.
    const mail = buildOutreachEmail(first.body, to);
    const result = await sendEmail({ from: OUTREACH.from, to, subject: first.subject, ...mail });
    return result.success
      ? NextResponse.json({ success: true, sent: 1 })
      : NextResponse.json({ success: false, error: result.error ?? 'Odeslání selhalo' }, { status: 502 });
  }

  if (action === 'analyze') {
    // A site takes ten to twenty seconds to read; four at a time fits the limit.
    return NextResponse.json({ success: true, ...(await improveQueuedEmails(4)) });
  }

  if (action !== 'send') {
    return NextResponse.json({ success: false, error: 'Neznámá akce' }, { status: 400 });
  }

  const batch = await queue(OUTREACH.batchSize);
  let sent = 0;
  let error: string | null = null;

  for (const m of batch) {
    // An address that is not one would be refused by the mail service, and the
    // refusal used to stop the batch — at the same lead, every time. It is set
    // aside instead and the batch goes on.
    if (!EMAIL.test(m.email)) {
      await turso.execute({ sql: "UPDATE lead_generation_leads SET lead_status = 'rejected', notes = coalesce(notes || ' · ', '') || 'neplatná adresa', updated_at = unixepoch() WHERE id = ?", args: [m.leadId] });
      continue;
    }
    const mail = buildOutreachEmail(m.body, m.email);
    const result = await sendEmail({ from: OUTREACH.from, to: m.email, subject: m.subject, ...mail });
    if (!result.success) {
      error = `${m.email}: ${result.error ?? 'odeslání selhalo'}`;
      break;
    }
    await turso.batch(
      [
        { sql: "UPDATE lead_generation_leads SET email_sent = 1, email_sent_at = unixepoch(), lead_status = 'contacted', updated_at = unixepoch() WHERE id = ?", args: [m.leadId] },
        { sql: 'UPDATE generated_emails SET sent = 1, sent_at = unixepoch(), updated_at = unixepoch() WHERE id = ?', args: [m.emailId] },
      ],
      'write'
    );
    sent++;
    if (sent < batch.length) await new Promise((r) => setTimeout(r, OUTREACH.pauseMs));
  }

  const remaining = (await queue()).length;
  return NextResponse.json({ success: !error, sent, remaining, error }, { status: error ? 502 : 200 });
}
