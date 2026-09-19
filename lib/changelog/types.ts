/**
 * Types and labels for the changelog ("Archiv změn").
 *
 * Kept free of any database import so the admin's client components can read
 * the labels and badge colours without pulling the Turso client into the
 * browser bundle.
 */

export const CHANGE_TYPES = [
  'review',
  'project',
  'pricing',
  'content',
  'lead',
  'system',
] as const;

export type ChangeType = (typeof CHANGE_TYPES)[number];

export interface ChangelogEntry {
  id: number;
  type: ChangeType;
  title: string;
  /** Optional longer note or a value diff. Never shown publicly. */
  detail: string | null;
  /** Who made the change. Never shown publicly. */
  author: string | null;
  isPublic: boolean;
  /** Unix seconds. */
  createdAt: number;
}

/** What a visitor sees on a badge, and what the admin filter pills say. */
export const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  review: 'Recenze',
  project: 'Projekt',
  pricing: 'Ceník',
  content: 'Obsah',
  lead: 'Poptávka',
  system: 'Systém',
};

/**
 * Badge colours, drawn from the same palette as the lead-status badges: a
 * solid ink plus the same hue at ~13% alpha behind it.
 */
export const CHANGE_TYPE_COLORS: Record<ChangeType, { fg: string; bg: string }> = {
  review:  { fg: '#0B7F76', bg: 'rgba(11,127,118,.13)' },
  project: { fg: '#2563EB', bg: 'rgba(37,99,235,.13)' },
  pricing: { fg: '#B45309', bg: 'rgba(180,83,9,.13)' },
  content: { fg: '#0F9268', bg: 'rgba(15,146,104,.13)' },
  lead:    { fg: '#7C3AED', bg: 'rgba(124,58,237,.13)' },
  system:  { fg: '#475569', bg: 'rgba(71,85,105,.13)' },
};

/**
 * Types that may never reach the public site, whatever the admin toggle says.
 *
 * Pricing history tells a visitor what the site used to cost, and leads are
 * other people's enquiries. Both are enforced on write *and* on read, so a
 * stray UPDATE cannot publish them either.
 */
export const ALWAYS_INTERNAL: readonly ChangeType[] = ['pricing', 'lead'];

/** Default visibility for a new entry; the admin can still flip it afterwards. */
export const DEFAULT_PUBLIC: Record<ChangeType, boolean> = {
  review: true,
  project: true,
  content: true,
  system: false,
  pricing: false,
  lead: false,
};

export function isChangeType(value: unknown): value is ChangeType {
  return typeof value === 'string' && (CHANGE_TYPES as readonly string[]).includes(value);
}

/** "14. 9. 2026" — the format the spec asks for on the public timeline. */
export function formatChangeDate(unixSeconds: number): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(new Date(unixSeconds * 1000));
}

/** "14. 9. 2026 15:42" — the admin list, which wants the time too. */
export function formatChangeDateTime(unixSeconds: number): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(unixSeconds * 1000));
}
