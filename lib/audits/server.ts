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
    createdAt: Number(row.created_at),
  };
}

/**
 * Records one audit and, for a first-time address, the lead behind it.
 *
 * Never throws: the visitor asked for a report, not for our bookkeeping to
 * work. A failure here must not turn their audit into an error message.
 */
export async function recordAudit(params: {
  url: string;
  email: string;
  score?: number | null;
  metrics?: AuditMetric[];
  issueCount?: number | null;
  status?: 'ok' | 'failed';
  error?: string | null;
  ipAddress?: string | null;
}): Promise<void> {
  try {
    // One lead per address. Someone auditing three of their sites is one
    // prospect, not three, and the audits list already shows every run.
    const existing = await turso.execute({
      sql: 'SELECT id FROM leads WHERE email = ? LIMIT 1',
      args: [params.email],
    });

    let leadId = existing.rows[0] ? String((existing.rows[0] as any).id) : null;

    if (!leadId) {
      leadId = nanoid();
      const host = (() => {
        try {
          return new URL(params.url).hostname.replace(/^www\./, '');
        } catch {
          return params.url;
        }
      })();

      await turso.execute({
        sql: `INSERT INTO leads (
                id, name, email, company, project_type, business_description,
                existing_website, status, source, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', 'audit', unixepoch(), unixepoch())`,
        args: [
          leadId,
          host,
          params.email,
          host,
          'audit',
          params.score !== null && params.score !== undefined
            ? `Spustil bezplatný audit webu ${params.url} — skóre ${params.score}/100.`
            : `Spustil bezplatný audit webu ${params.url}.`,
          params.url,
        ],
      });
    }

    await turso.execute({
      sql: `INSERT INTO audits
              (id, url, email, score, metrics, issue_count, lead_id, status, error, ip_address, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`,
      args: [
        nanoid(),
        params.url,
        params.email,
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
