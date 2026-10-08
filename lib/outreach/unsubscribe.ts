import { createHmac, timingSafeEqual } from 'node:crypto';
import { turso } from '@/lib/turso';

/**
 * Opt-outs from the e-mails we send to companies that never asked for them.
 *
 * Each such e-mail carries a link to /odhlasit with the address and a token.
 * The token is an HMAC of the address, so a link works only for the address it
 * was made for — nobody can unsubscribe somebody else by editing the URL — and
 * the sender (lead-finder/send-leads.mjs) can make it without talking to this
 * site, as long as both hold OUTREACH_UNSUBSCRIBE_SECRET.
 *
 * The sender asks /odhlasit/stav before every e-mail and skips an address that
 * is on the list.
 */
const normalize = (email: string) => email.trim().toLowerCase();

export function unsubscribeToken(email: string): string | null {
  const secret = process.env.OUTREACH_UNSUBSCRIBE_SECRET;
  if (!secret) return null;
  return createHmac('sha256', secret).update(normalize(email)).digest('hex').slice(0, 32);
}

/** Token for the "send me the full report" link — a different one, so neither link can stand in for the other. */
export function reportToken(email: string): string | null {
  const secret = process.env.OUTREACH_UNSUBSCRIBE_SECRET;
  if (!secret) return null;
  return createHmac('sha256', secret).update(`report:${normalize(email)}`).digest('hex').slice(0, 32);
}

export function isValidReportLink(email: unknown, token: unknown): email is string {
  if (typeof email !== 'string' || typeof token !== 'string' || !email.includes('@')) return false;
  const expected = reportToken(email);
  if (!expected || expected.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

export function isValidUnsubscribeLink(email: unknown, token: unknown): email is string {
  if (typeof email !== 'string' || typeof token !== 'string' || !email.includes('@')) return false;
  const expected = unsubscribeToken(email);
  if (!expected || expected.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

let tableReady: Promise<unknown> | null = null;
function ensureTable() {
  tableReady ??= turso.execute(
    `CREATE TABLE IF NOT EXISTS outreach_unsubscribes (
       email TEXT PRIMARY KEY,
       source TEXT,
       created_at INTEGER NOT NULL DEFAULT (unixepoch())
     )`
  );
  return tableReady;
}

export async function unsubscribe(email: string, source: 'page' | 'one-click'): Promise<void> {
  await ensureTable();
  await turso.execute({
    sql: 'INSERT OR IGNORE INTO outreach_unsubscribes (email, source) VALUES (?, ?)',
    args: [normalize(email), source],
  });
}

export async function isUnsubscribed(email: string): Promise<boolean> {
  await ensureTable();
  const result = await turso.execute({
    sql: 'SELECT 1 FROM outreach_unsubscribes WHERE email = ? LIMIT 1',
    args: [normalize(email)],
  });
  return result.rows.length > 0;
}
