import { turso } from '@/lib/turso';
import {
  ALWAYS_INTERNAL,
  DEFAULT_PUBLIC,
  isChangeType,
  type ChangeType,
  type ChangelogEntry,
} from './types';

/** How many entries the public timeline on the landing page shows. */
export const PUBLIC_TIMELINE_LIMIT = 10;
/** Page size for both the admin list and the /archiv page. */
export const PAGE_SIZE = 20;

function toEntry(row: any): ChangelogEntry {
  return {
    id: Number(row.id),
    type: (isChangeType(row.type) ? row.type : 'system') as ChangeType,
    title: String(row.title),
    detail: row.detail ? String(row.detail) : null,
    author: row.author ? String(row.author) : null,
    isPublic: Number(row.is_public) === 1,
    createdAt: Number(row.created_at),
  };
}

export interface RecordChangeParams {
  type: ChangeType;
  title: string;
  detail?: string | null;
  /** Usually `user.name` / `user.email` from the admin session. */
  author?: string | null;
  /** Overrides `DEFAULT_PUBLIC`; ignored for the always-internal types. */
  isPublic?: boolean;
}

/**
 * Write one changelog entry.
 *
 * Deliberately never throws: this is called from the tail end of admin
 * mutations that have already succeeded, and losing the history line is not a
 * reason to report the save as failed to the person who made it.
 */
export async function recordChange(params: RecordChangeParams): Promise<void> {
  const isPublic = ALWAYS_INTERNAL.includes(params.type)
    ? false
    : params.isPublic ?? DEFAULT_PUBLIC[params.type];

  try {
    await turso.execute({
      sql: `INSERT INTO changelog (type, title, detail, author, is_public, created_at)
            VALUES (?, ?, ?, ?, ?, unixepoch())`,
      args: [
        params.type,
        params.title,
        params.detail ?? null,
        params.author ?? null,
        isPublic ? 1 : 0,
      ],
    });
  } catch (error) {
    console.error('Failed to record changelog entry:', error);
  }
}

/**
 * A value diff for the `detail` column: "Cena Základní web: 9 990 Kč → 10 990 Kč".
 * Returns null when nothing actually changed, so callers can skip the write.
 */
export function describeDiff(
  label: string,
  before: unknown,
  after: unknown,
  format: (value: unknown) => string = (value) => String(value)
): string | null {
  if (before === after) return null;
  if (before === undefined || before === null) return null;
  return `${label}: ${format(before)} → ${format(after)}`;
}

export interface ListOptions {
  limit?: number;
  offset?: number;
  type?: ChangeType;
  /** true = public timeline, false/undefined = the admin's full list. */
  publicOnly?: boolean;
}

/**
 * Newest first, with the total so the caller can decide whether to keep
 * offering "Načíst další". Returns an empty page rather than throwing when the
 * database is unreachable — the landing page must not lose a section over it.
 */
export async function listChanges(
  options: ListOptions = {}
): Promise<{ entries: ChangelogEntry[]; total: number }> {
  const { limit = PAGE_SIZE, offset = 0, type, publicOnly = false } = options;

  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (publicOnly) {
    conditions.push('is_public = 1');
    // Belt and braces: even a hand-edited row of these types stays internal.
    conditions.push(`type NOT IN (${ALWAYS_INTERNAL.map(() => '?').join(', ')})`);
    args.push(...ALWAYS_INTERNAL);
  }

  if (type) {
    conditions.push('type = ?');
    args.push(type);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const countResult = await turso.execute({
      sql: `SELECT COUNT(*) AS count FROM changelog ${where}`,
      args,
    });

    const result = await turso.execute({
      sql: `SELECT id, type, title, detail, author, is_public, created_at
              FROM changelog ${where}
             ORDER BY created_at DESC, id DESC
             LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    return {
      entries: result.rows.map(toEntry),
      total: Number((countResult.rows[0] as any)?.count ?? 0),
    };
  } catch (error) {
    console.error('Failed to list changelog entries:', error);
    return { entries: [], total: 0 };
  }
}

/** The landing page's timeline: the newest public entries, nothing else. */
export async function listPublicChanges(limit = PUBLIC_TIMELINE_LIMIT) {
  const { entries } = await listChanges({ limit, publicOnly: true });
  return entries;
}

/** Flip one entry between public and internal from the admin list. */
export async function setChangeVisibility(id: number, isPublic: boolean): Promise<void> {
  await turso.execute({
    sql: `UPDATE changelog
             SET is_public = ?
           WHERE id = ?
             AND type NOT IN (${ALWAYS_INTERNAL.map(() => '?').join(', ')})`,
    args: [isPublic ? 1 : 0, id, ...ALWAYS_INTERNAL],
  });
}
