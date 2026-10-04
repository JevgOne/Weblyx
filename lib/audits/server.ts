import { turso } from '@/lib/turso';
import { nanoid } from 'nanoid';

export interface AuditMetric {
  label: string;
  value: string;
  rating?: string;
}

export type AuditSource = 'web' | 'admin';
export type CallStatus = 'new' | 'called' | 'interested' | 'rejected';

export interface AuditRecord {
  id: string;
  /** 'web' = a visitor ran it on /audit; 'admin' = staff analysed a prospect. */
  source: AuditSource;
  url: string;
  email: string;
  companyName: string | null;
  contactName: string | null;
  phone: string | null;
  score: number | null;
  metrics: AuditMetric[];
  issueCount: number | null;
  /** The deep analysis from lib/web-analyzer, admin runs only. */
  analysis: Record<string, unknown> | null;
  outreach: string | null;
  note: string | null;
  callStatus: CallStatus;
  leadId: string | null;
  status: 'ok' | 'failed';
  error: string | null;
  /** When the report was last mailed from the admin panel, unix seconds. */
  reportSentAt: number | null;
  createdAt: number;
}

function toRecord(row: any): AuditRecord {
  let metrics: AuditMetric[] = [];
  try {
    metrics = row.metrics ? JSON.parse(String(row.metrics)) : [];
  } catch {
    metrics = [];
  }
  let analysis: Record<string, unknown> | null = null;
  try {
    analysis = row.analysis ? JSON.parse(String(row.analysis)) : null;
  } catch {
    analysis = null;
  }

  return {
    id: String(row.id),
    source: row.source === 'admin' ? 'admin' : 'web',
    url: String(row.url),
    email: String(row.email ?? ''),
    companyName: row.company_name ? String(row.company_name) : null,
    contactName: row.contact_name ? String(row.contact_name) : null,
    phone: row.phone ? String(row.phone) : null,
    analysis,
    outreach: row.outreach ? String(row.outreach) : null,
    note: row.note ? String(row.note) : null,
    callStatus: (['new', 'called', 'interested', 'rejected'] as const).includes(row.call_status)
      ? row.call_status
      : 'new',
    score: row.score === null || row.score === undefined ? null : Number(row.score),
    metrics,
    issueCount: row.issue_count === null ? null : Number(row.issue_count),
    leadId: row.lead_id ? String(row.lead_id) : null,
    status: row.status === 'failed' ? 'failed' : 'ok',
    error: row.error ? String(row.error) : null,
    reportSentAt: row.report_sent_at ? Number(row.report_sent_at) : null,
    createdAt: Number(row.created_at),
  };
}

/**
 * Records one audit. It is not an enquiry and creates none.
 *
 * Audits used to open a lead for every new address, so each test run and
 * every curious visitor landed in Poptávky next to people who had actually
 * asked for a website. The audit list is where these belong; when the same
 * address has a real enquiry, the audit is linked to it so the lead detail
 * can show it.
 *
 * Never throws: the visitor asked for a report, not for our bookkeeping to
 * work. A failure here must not turn their audit into an error message.
 */
export async function recordAudit(params: {
  url: string;
  email: string;
  /** Optional — the audit form asks for it, and a person's name beats a
   *  hostname on a list someone has to phone through. */
  name?: string | null;
  score?: number | null;
  metrics?: AuditMetric[];
  issueCount?: number | null;
  status?: 'ok' | 'failed';
  error?: string | null;
  ipAddress?: string | null;
}): Promise<void> {
  try {
    const existing = await turso.execute({
      sql: "SELECT id FROM leads WHERE email = ? AND COALESCE(source, '') != 'audit' ORDER BY created_at DESC LIMIT 1",
      args: [params.email],
    });
    const leadId = existing.rows[0] ? String((existing.rows[0] as any).id) : null;

    await turso.execute({
      sql: `INSERT INTO audits
              (id, url, email, contact_name, score, metrics, issue_count, lead_id, status, error, ip_address, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`,
      args: [
        nanoid(),
        params.url,
        params.email,
        params.name?.trim() || null,
        params.score ?? null,
        JSON.stringify(params.metrics ?? []),
        params.issueCount ?? null,
        leadId,
        params.status ?? 'ok',
        params.error ?? null,
        params.ipAddress ?? null,
      ],
    });
  } catch (error) {
    console.error('Failed to record audit:', error);
  }
}

export async function listAudits(
  options: { limit?: number; offset?: number; source?: AuditSource } = {}
) {
  const { limit = 25, offset = 0, source } = options;
  const where = source ? 'WHERE source = ?' : '';
  const filterArgs = source ? [source] : [];
  try {
    const countResult = await turso.execute({
      sql: `SELECT COUNT(*) AS count FROM audits ${where}`,
      args: filterArgs,
    });
    const result = await turso.execute({
      sql: `SELECT * FROM audits ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...filterArgs, limit, offset],
    });
    return {
      audits: result.rows.map(toRecord),
      total: Number((countResult.rows[0] as any)?.count ?? 0),
    };
  } catch (error) {
    console.error('Failed to list audits:', error);
    return { audits: [], total: 0 };
  }
}

/**
 * Records an analysis a staff member ran against a prospect's site.
 *
 * The analyser used to keep nothing — the route still carries the TODO that
 * says so — so a crawl that takes half a minute was thrown away the moment
 * the tab closed, and nobody could call the prospect back with it.
 */
export async function recordAdminAnalysis(params: {
  url: string;
  email?: string | null;
  companyName?: string | null;
  contactName?: string | null;
  phone?: string | null;
  score?: number | null;
  issueCount?: number | null;
  analysis?: unknown;
  outreach?: string | null;
}): Promise<string | null> {
  try {
    const id = nanoid();
    await turso.execute({
      sql: `INSERT INTO audits
              (id, source, url, email, company_name, contact_name, phone,
               score, metrics, issue_count, analysis, outreach,
               status, call_status, created_at)
            VALUES (?, 'admin', ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, 'ok', 'new', unixepoch())`,
      args: [
        id,
        params.url,
        params.email ?? '',
        params.companyName ?? null,
        params.contactName ?? null,
        params.phone ?? null,
        params.score ?? null,
        params.issueCount ?? null,
        params.analysis ? JSON.stringify(params.analysis).slice(0, 400_000) : null,
        params.outreach ?? null,
      ],
    });
    return id;
  } catch (error) {
    console.error('Failed to record admin analysis:', error);
    return null;
  }
}

export async function getAudit(id: string): Promise<AuditRecord | null> {
  const result = await turso.execute({ sql: 'SELECT * FROM audits WHERE id = ? LIMIT 1', args: [id] });
  return result.rows[0] ? toRecord(result.rows[0]) : null;
}

/**
 * Records an audit staff ran from the audits list in order to mail the report.
 *
 * Unlike `recordAudit` this creates no lead: the prospect has not contacted
 * us, we looked them up. They become a lead when they answer.
 */
export async function recordAdminAudit(params: {
  url: string;
  email: string;
  companyName?: string | null;
  contactName?: string | null;
  score: number;
  metrics: AuditMetric[];
  issueCount: number;
}): Promise<string> {
  const id = nanoid();
  await turso.execute({
    sql: `INSERT INTO audits
            (id, source, url, email, company_name, contact_name,
             score, metrics, issue_count, status, call_status, created_at)
          VALUES (?, 'admin', ?, ?, ?, ?, ?, ?, ?, 'ok', 'new', unixepoch())`,
    args: [
      id,
      params.url,
      params.email,
      params.companyName ?? null,
      params.contactName ?? null,
      params.score,
      JSON.stringify(params.metrics),
      params.issueCount,
    ],
  });
  return id;
}

/**
 * Stamps a row once its report has gone out, and refreshes the numbers: the
 * audit is re-run at send time, so the list should show what the mail said.
 */
export async function markReportSent(
  id: string,
  result: { score: number; metrics: AuditMetric[]; issueCount: number }
): Promise<void> {
  await turso.execute({
    sql: `UPDATE audits
             SET score = ?, metrics = ?, issue_count = ?, status = 'ok', error = NULL,
                 report_sent_at = unixepoch()
           WHERE id = ?`,
    args: [result.score, JSON.stringify(result.metrics), result.issueCount, id],
  });
}

/** Updates the call state and notes from the audits list. */
export async function updateAuditCall(
  id: string,
  patch: { callStatus?: CallStatus; note?: string | null }
): Promise<void> {
  const sets: string[] = [];
  const args: (string | null)[] = [];
  if (patch.callStatus) {
    sets.push('call_status = ?');
    args.push(patch.callStatus);
  }
  if (patch.note !== undefined) {
    sets.push('note = ?');
    args.push(patch.note);
  }
  if (sets.length === 0) return;
  args.push(id);
  await turso.execute({ sql: `UPDATE audits SET ${sets.join(', ')} WHERE id = ?`, args });
}
