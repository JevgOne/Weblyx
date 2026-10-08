import { turso } from '@/lib/turso';
import { runLocalAudit } from '@/lib/audits/report';
import { composeFromAudit } from '@/lib/outreach/compose';

/**
 * Replaces the stock e-mail of queued leads with one written from an analysis
 * of their own website (lib/outreach/compose).
 *
 * Each lead is analysed once — `analyzed_at` is stamped whether or not the
 * analysis succeeded, so a site that is down does not hold the rest up. A lead
 * whose site could not be read, or has too little wrong with it, keeps the
 * e-mail it came with. E-mails already sent are never touched.
 */
const SITE_TIMEOUT_MS = 25_000;

export async function improveQueuedEmails(limit: number) {
  const pending = await turso.execute({
    sql: `SELECT l.id, l.company_name, l.website
            FROM lead_generation_leads l
           WHERE l.email_sent = 0 AND l.analyzed_at IS NULL AND l.lead_status != 'rejected'
             AND l.website IS NOT NULL AND l.website != ''
             AND EXISTS (SELECT 1 FROM generated_emails g WHERE g.lead_id = l.id AND g.sent = 0)
           ORDER BY l.created_at, l.id
           LIMIT ?`,
    args: [limit],
  });

  const outcome = { improved: 0, kept: 0, remaining: 0 };

  await Promise.all(
    pending.rows.map(async (row) => {
      const id = String(row.id);
      const website = String(row.website);
      let score: number | null = null;
      let mail: { subject: string; body: string } | null = null;
      try {
        const result = await Promise.race([
          runLocalAudit(/^https?:\/\//.test(website) ? website : `https://${website}`),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), SITE_TIMEOUT_MS)),
        ]);
        score = result.score;
        mail = composeFromAudit(result, { company: String(row.company_name ?? ''), website });
      } catch {
        // Unreachable or unreadable site: the stock e-mail stays.
      }

      if (mail) {
        await turso.execute({
          sql: 'UPDATE generated_emails SET subject = ?, body = ?, updated_at = unixepoch() WHERE lead_id = ? AND sent = 0',
          args: [mail.subject, mail.body, id],
        });
        outcome.improved++;
      } else {
        outcome.kept++;
      }
      await turso.execute({
        sql: 'UPDATE lead_generation_leads SET analyzed_at = unixepoch(), analysis_score = ?, updated_at = unixepoch() WHERE id = ?',
        args: [score ?? 0, id],
      });
    })
  );

  const left = await turso.execute(
    `SELECT COUNT(*) AS n FROM lead_generation_leads l
      WHERE l.email_sent = 0 AND l.analyzed_at IS NULL AND l.lead_status != 'rejected'
        AND l.website IS NOT NULL AND l.website != ''
        AND EXISTS (SELECT 1 FROM generated_emails g WHERE g.lead_id = l.id AND g.sent = 0)`
  );
  outcome.remaining = Number(left.rows[0].n);
  return outcome;
}
