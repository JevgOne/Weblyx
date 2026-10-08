import { turso } from '@/lib/turso';
import { buildEmailHtml, type AuditResult } from '@/lib/audits/report';
import { audit } from '@/lib/outreach/improve';
import { OUTREACH } from '@/lib/outreach/email';

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
    `${OUTREACH.name}, Weblyx · ${OUTREACH.phone}`;

  return {
    email: String(row.email),
    company: String(row.company_name ?? ''),
    domain,
    subject: `Rozbor webu ${domain} — ${result.score}/100 a co zlepšit`,
    html: buildEmailHtml(result, { intro }),
    score: result.score,
  };
}
