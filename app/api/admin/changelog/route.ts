import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';
import { listChanges, PAGE_SIZE, recordChange, setChangeVisibility } from '@/lib/changelog/server';
import { ALWAYS_INTERNAL, isChangeType } from '@/lib/changelog/types';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

/** Both public views read this table, so a visibility change has to reach them. */
function revalidateArchive() {
  revalidatePath('/nova');
  revalidatePath('/archiv');
}

// GET /api/admin/changelog?type=project&offset=0
export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get('type') ?? undefined;
  const offset = Math.max(0, Number(searchParams.get('offset') ?? '0') || 0);
  const limit = Math.min(100, Number(searchParams.get('limit') ?? PAGE_SIZE) || PAGE_SIZE);

  if (typeParam && !isChangeType(typeParam)) {
    return NextResponse.json({ success: false, error: 'Unknown change type' }, { status: 400 });
  }

  const { entries, total } = await listChanges({
    type: isChangeType(typeParam) ? typeParam : undefined,
    limit,
    offset,
  });

  return NextResponse.json({ success: true, data: { entries, total } });
}

/**
 * POST — a manual entry.
 *
 * Only `system` is accepted. Every other type is written automatically by the
 * mutation it describes; letting someone type "Přidán projekt X" by hand would
 * produce an archive that no longer matches what the site actually did.
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === 'string' ? body.title.trim() : '';

  if (!title) {
    return NextResponse.json({ success: false, error: 'Titulek je povinný' }, { status: 400 });
  }

  await recordChange({
    type: 'system',
    title,
    detail: typeof body?.detail === 'string' && body.detail.trim() ? body.detail.trim() : null,
    author: user.name || user.email,
    isPublic: Boolean(body?.isPublic),
  });

  revalidateArchive();

  return NextResponse.json({ success: true });
}

// PATCH /api/admin/changelog — flip one entry between public and internal
export async function PATCH(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ success: false, error: 'Chybí id záznamu' }, { status: 400 });
  }
  if (typeof body?.isPublic !== 'boolean') {
    return NextResponse.json({ success: false, error: 'isPublic musí být boolean' }, { status: 400 });
  }

  // The UI hides the toggle for these, but the endpoint is the thing that has
  // to hold: pricing history and other people's enquiries never go public.
  await setChangeVisibility(id, body.isPublic);

  revalidateArchive();

  return NextResponse.json({ success: true, data: { alwaysInternal: ALWAYS_INTERNAL } });
}
