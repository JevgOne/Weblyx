import { turso } from '@/lib/turso';
import { buildEmailHtml, type AuditResult } from '@/lib/audits/report';
import { audit } from '@/lib/outreach/improve';
import { OUTREACH } from '@/lib/outreach/email';
import { EMAIL_CONFIG, sendEmail } from '@/lib/email/resend-client';
import { sendTelegramText } from '@/lib/telegram';

/**
 * The full analysis of a lead's website — the report the outreach e-mail
 * offers "for a reply". It is the same report the free audit sends, with a
 * short personal note on top.
 *
 * The analysis is stored with the lead when its e-mail is written. A lead
 * analysed before that was stored, or never analysed, is read now and kept.
 */
export interface LeadReport {
  email: string;
  company: string;
  domain: string;
  subject: string;
  html: string;
  score: number;
}

export async function getLeadReport(leadId: string): Promise<LeadReport | { error: string }> {
  const found = await turso.execute({
    sql: 'SELECT company_name, email, website, analysis_result FROM lead_generation_leads WHERE id = ?',
    args: [leadId],
  });
  const row = found.rows[0];
  if (!row) return { error: 'Firma nenalezena.' };
  const website = String(row.website ?? '');
  if (!website) return { error: 'Tato firma nemá v seznamu web, rozbor není z čeho udělat.' };

  let result: AuditResult | null = null;
  try {
    const stored = row.analysis_result ? JSON.parse(String(row.analysis_result)) : null;
    if (stored && Array.isArray(stored.checks) && typeof stored.score === 'number') result = stored;
  } catch {
    /* an older, differently shaped analysis: read the site again */
  }
  if (!result) {
    try {
      result = await audit(website);
    } catch {
      return { error: 'Web se nepodařilo načíst, rozbor teď nejde udělat.' };
    }
    await turso.execute({
      sql: 'UPDATE lead_generation_leads SET analysis_result = ?, analysis_score = ?, analyzed_at = coalesce(analyzed_at, unixepoch()), updated_at = unixepoch() WHERE id = ?',
      args: [JSON.stringify(result), result.score, leadId],
    });
  }

  const domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
  const intro =
    `Dobrý den,\n\nposílám slíbený rozbor webu ${domain}. Najdete v něm celkové skóre, kontrolu bod po bodu ` +
    `a u každé věci i to, jak ji opravit. Kdybyste k čemukoli měli otázku, stačí na tento e-mail odpovědět.\n\n` +
    // Name only: the report closes with its own contact block, and the phone
    // number used to appear in the message twice.
    `${OUTREACH.name}`;

  return {
    email: String(row.email),
    company: String(row.company_name ?? ''),
    domain,
    subject: `Rozbor webu ${domain} — ${result.score}/100 a co zlepšit`,
    html: buildEmailHtml(result, { intro }),
    score: result.score,
  };
}

/**
 * Sends the report to the company and records it.
 *
 * `via` says who asked: staff from the admin, or the company itself through
 * the link in its e-mail. In the second case the team is told straight away —
 * someone who asks for the report is the warmest lead this produces.
 */
export async function sendLeadReport(leadId: string, via: 'admin' | 'link'): Promise<{ to: string } | { error: string }> {
  const report = await getLeadReport(leadId);
  if ('error' in report) return report;

  const result = await sendEmail({ from: OUTREACH.from, to: report.email, subject: report.subject, html: report.html });
  if (!result.success) return { error: result.error ?? 'Odeslání selhalo' };

  await turso.execute({
    sql: "UPDATE lead_generation_leads SET lead_status = 'interested', notes = coalesce(notes || ' · ', '') || ? || date('now'), updated_at = unixepoch() WHERE id = ?",
    args: [via === 'link' ? 'rozbor si vyžádali odkazem ' : 'rozbor odeslán ', leadId],
  });

  if (via === 'link') {
    const who = `${report.company || report.domain} (${report.email})`;
    await Promise.allSettled([
      sendTelegramText(`📩 <b>Firma si vyžádala rozbor webu</b>\n${who}\n${report.domain} — ${report.score}/100\nRozbor odešel automaticky. Ozvěte se jim.`),
      sendEmail({
        to: EMAIL_CONFIG.adminEmail,
        subject: `📩 ${report.company || report.domain} si vyžádali rozbor webu`,
        html: `<p><strong>${who}</strong> klikli v oslovovacím e-mailu na „Poslat mi celý rozbor“.</p><p>Web ${report.domain}, skóre ${report.score}/100. Rozbor jim odešel automaticky — teď je dobrá chvíle se ozvat.</p>`,
        replyTo: report.email,
      }),
    ]);
  }
  return { to: report.email };
}

/** The lead an address belongs to, and whether its report has already gone out. */
export async function leadForReport(email: string): Promise<{ id: string; domain: string; alreadySent: boolean } | null> {
  const found = await turso.execute({
    sql: "SELECT id, website, notes FROM lead_generation_leads WHERE lower(email) = ? AND website IS NOT NULL AND website != '' ORDER BY created_at LIMIT 1",
    args: [email.trim().toLowerCase()],
  });
  const row = found.rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    domain: String(row.website).replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, ''),
    alreadySent: /rozbor (odeslán|si vyžádali)/.test(String(row.notes ?? '')),
  };
}
