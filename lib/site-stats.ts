import { getPublishedPortfolio } from '@/lib/turso/portfolio';
import { getPublishedReviews } from '@/lib/turso/reviews';
import { safeRead } from '@/lib/safe-read';

/**
 * The "completed projects" figure, counted rather than typed.
 *
 * It was written by hand in three places and had drifted apart: the homepage
 * counted thirteen published projects while /o-nas and the FAQ both claimed
 * "15+". Counting the rows the portfolio itself renders means the claim can
 * never be larger than the work on show.
 */

/** Rounded down to a round number the claim can outlive: 13 -> "10+". */
export function projectsLabel(count: number): string {
  if (count >= 10) return `${Math.floor(count / 5) * 5}+`;
  return String(count);
}

/** Counts published portfolio items; 0 when the database is unreachable. */
export async function countPublishedProjects(locale: string = 'cs'): Promise<number> {
  const projects = await safeRead(
    () => getPublishedPortfolio(locale),
    [],
    'site stats: portfolio count'
  );
  return projects.length;
}

/**
 * The Google rating, counted from the same rows the reviews section renders.
 *
 * The city pages used to claim "100% spokojených klientů" — a figure nothing
 * could confirm and nobody measured. The rating is the opposite: a visitor can
 * open Google and check it. Only claim Google as the source when every
 * published review actually came from there.
 */
export type RatingStat = { value: string; label: string; count: number } | null;

export async function getRatingStat(locale: 'cs' | 'de' = 'cs'): Promise<RatingStat> {
  const reviews = await safeRead(
    () => getPublishedReviews(locale),
    [],
    'site stats: rating'
  );
  if (reviews.length === 0) return null;

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const allFromGoogle = reviews.every(
    (r) => r.source?.trim().toLowerCase() === 'google'
  );

  return {
    // Czech decimal comma — this is a display figure, not a number to parse.
    value: average.toFixed(1).replace('.', ','),
    label: allFromGoogle ? 'Hodnocení na Googlu' : 'Hodnocení klientů',
    count: reviews.length,
  };
}
