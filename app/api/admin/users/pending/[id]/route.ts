import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';
import { approvePendingAdmin, rejectPendingAdmin } from '@/lib/auth/simple-auth';
import { isAdminOrHigher, isOwner } from '@/lib/auth/permissions';
import { logActivity } from '@/lib/activity-log';

const approveSchema = z.object({ role: z.enum(['owner', 'admin', 'specialist']) });

/**
 * POST /api/admin/users/pending/[id]
 * Approve a registration and give it a role.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();
  if (!isAdminOrHigher(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = approveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Vyberte roli' }, { status: 400 });
  }
  // Same rule as creating a user by hand: an owner is made only by an owner.
  if (parsed.data.role === 'owner' && !isOwner(user.role)) {
    return NextResponse.json({ error: 'Vlastníka může založit jen vlastník' }, { status: 403 });
  }

  const { id } = await params;
  const approved = await approvePendingAdmin(id, parsed.data.role);
  if (!approved) {
    return NextResponse.json({ error: 'Žádost nenalezena' }, { status: 404 });
  }

  await logActivity({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action: 'user_created',
    entityType: 'user',
    entityId: id,
    entityName: `${approved.name} (${approved.email})`,
    details: `Schválena registrace, role: ${parsed.data.role}`,
  });

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/admin/users/pending/[id]
 * Reject a registration.
 */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();
  if (!isAdminOrHigher(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const rejected = await rejectPendingAdmin(id);
  if (!rejected) {
    return NextResponse.json({ error: 'Žádost nenalezena' }, { status: 404 });
  }

  await logActivity({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action: 'user_deleted',
    entityType: 'user',
    entityId: id,
    entityName: `${rejected.name} (${rejected.email})`,
    details: 'Zamítnuta registrace',
  });

  return NextResponse.json({ success: true });
}
