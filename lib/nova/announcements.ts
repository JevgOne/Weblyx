/**
 * The hero's announcement pill.
 *
 * It used to be a hardcoded string ("Červenec 2026: kapacita omezená"), which
 * silently went stale the moment the month turned — a site that advertises a
 * five-day turnaround cannot be caught advertising last month.
 *
 * So the month is computed and the message rotates. Two rules make that safe:
 *
 * 1. The pick is a pure function of the date, never random. The page renders on
 *    the server; anything non-deterministic would render one string on the
 *    server and another on the client and trip a hydration mismatch.
 * 2. Every line only restates a promise the site already makes elsewhere
 *    (48h start, 2h reply, payment on delivery, 5–7 days, no monthly fees).
 *    An announcement bar is not the place to invent a new commitment.
 */

const MONTHS_NOMINATIVE = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
] as const;

/** "na srpen", "na září" — the accusative after `na` matches the nominative. */
const MONTHS_ACCUSATIVE = [
  'leden', 'únor', 'březen', 'duben', 'květen', 'červen',
  'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec',
] as const;

/**
 * ISO-8601 week number. Used as the rotation index so the pill changes once a
 * week rather than on every request — a message that flickers between reloads
 * reads as broken, and a weekly cadence matches a capacity claim.
 */
export function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Thursday of the current week decides which year the week belongs to.
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

type Template = (month: string, monthLower: string, year: number) => string;

const TEMPLATES: Template[] = [
  (month, _lower, year) => `${month} ${year}: kapacita omezená — start do 48 hodin`,
  (_month, lower, year) => `Volné termíny na ${lower} ${year} — odpovídáme do 2 hodin`,
  () => `Platba až po předání webu — žádné zálohy předem`,
  () => `Základní web hotový za 5–7 pracovních dní`,
  (month, _lower, year) => `${month} ${year}: web bez měsíčních poplatků — platíte jednou`,
];

/** How many distinct messages exist; exported so tests cannot drift from it. */
export const ANNOUNCEMENT_COUNT = TEMPLATES.length;

/**
 * The announcement for a given moment. Pass the date explicitly so callers —
 * and tests — control the clock instead of reaching for `new Date()` inside.
 */
export function pickAnnouncement(now: Date): string {
  const monthIndex = now.getMonth();
  const template = TEMPLATES[isoWeek(now) % TEMPLATES.length];
  return template(
    MONTHS_NOMINATIVE[monthIndex],
    MONTHS_ACCUSATIVE[monthIndex],
    now.getFullYear()
  );
}
