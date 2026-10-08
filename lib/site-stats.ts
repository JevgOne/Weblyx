import { getPublishedPortfolio } from '@/lib/turso/portfolio';
import { getPublishedReviews } from '@/lib/turso/reviews';
import { safeRead } from '@/lib/safe-read';
import { turso } from '@/lib/turso';

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

/**
 * How many projects the studio has delivered.
 *
 * The portfolio shows only part of the work: a project is published when its
 * client agrees, and most do not. So the public figure is not the count of
 * what is on show — it is a number the owner keeps in the admin (Obsah → Čísla
 * o firmě), stored under this key in `settings`. Every page that says how many
 * projects we have done reads it from here, so changing it in the admin
 * changes it everywhere.
 */
export const COMPLETED_PROJECTS_KEY = 'completed_projects';
/** Used until the figure has been saved in the admin, or if the database cannot be read. */
export const COMPLETED_PROJECTS_DEFAULT = 50;

export async function getCompletedProjects(): Promise<number> {
  return safeRead(
    async () => {
      const result = await turso.execute({ sql: 'SELECT value FROM settings WHERE key = ?', args: [COMPLETED_PROJECTS_KEY] });
      const stated = Number.parseInt(String(result.rows[0]?.value ?? ''), 10);
      return Number.isFinite(stated) && stated > 0 ? stated : COMPLETED_PROJECTS_DEFAULT;
    },
    COMPLETED_PROJECTS_DEFAULT,
    'site stats: completed projects'
  );
}

/** "50+" — what the site says next to "dokončených projektů". Never less than the portfolio shows. */
export async function completedProjectsLabel(publishedCount: number): Promise<string> {
  return projectsLabel(Math.max(await getCompletedProjects(), publishedCount));
}

/** The same, for a page that has not counted its portfolio yet. */
export async function completedProjects(locale: string = 'cs'): Promise<string> {
  return completedProjectsLabel(await countPublishedProjects(locale));
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
