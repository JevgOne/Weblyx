import { turso } from '@/lib/turso';
import { nanoid } from 'nanoid';

export interface AuditMetric {
  label: string;
  value: string;
  rating?: string;
}

export interface AuditRecord {
  id: string;
  url: string;
  email: string;
  score: number | null;
  metrics: AuditMetric[];
  issueCount: number | null;
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
  return {
    id: String(row.id),
    url: String(row.url),
    email: String(row.email),
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

export async function listAudits(options: { limit?: number; offset?: number } = {}) {
  const { limit = 25, offset = 0 } = options;
  try {
    const countResult = await turso.execute('SELECT COUNT(*) AS count FROM audits');
    const result = await turso.execute({
      sql: `SELECT * FROM audits ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [limit, offset],
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
