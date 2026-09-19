import { getPublishedPortfolio } from '@/lib/turso/portfolio';
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
