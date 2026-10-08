import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';
import { turso } from '@/lib/turso';
import { COMPLETED_PROJECTS_KEY, getCompletedProjects, projectsLabel } from '@/lib/site-stats';

/**
 * The figures about the studio that the whole site quotes — for now one: how
 * many projects have been delivered. Saved here, read by lib/site-stats, and
 * every page is rebuilt on save so the new number shows at once.
 */
export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();
  const completed = await getCompletedProjects();
  return NextResponse.json({ success: true, completedProjects: completed, shownAs: projectsLabel(completed) });
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  const body = await request.json().catch(() => ({}));
  const completed = Number.parseInt(String(body.completedProjects), 10);
  if (!Number.isFinite(completed) || completed < 1 || completed > 100000) {
    return NextResponse.json({ success: false, error: 'Zadejte počet projektů jako celé číslo.' }, { status: 400 });
  }

  await turso.execute({
    sql: `INSERT INTO settings (key, value, type, description, updated_at)
          VALUES (?, ?, 'number', 'Počet dokončených projektů uváděný na webu', unixepoch())
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    args: [COMPLETED_PROJECTS_KEY, String(completed)],
  });

  // Every page that quotes the figure is prerendered; rebuild them all.
  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true, completedProjects: completed, shownAs: projectsLabel(completed) });
}
