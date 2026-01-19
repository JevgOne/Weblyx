import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { verifySessionToken } from '@/lib/auth/simple-auth';
import { cookies } from 'next/headers';

// Helper to get admin user by ID
function getAdminById(adminId: string): { id: string; email: string; name: string } | null {
  const ADMIN_USERS = [
    { id: 'admin-1', email: 'admin@weblyx.cz', name: 'Admin' },
    { id: 'admin-2', email: 'zvin.a@seznam.cz', name: 'Zen' },
    { id: 'admin-3', email: 'filip@weblyx.com', name: 'Filip' },
  ];

  return ADMIN_USERS.find(u => u.id === adminId) || null;
}

/**
 * POST /api/admin/projects/[id]/assign
 * Assign project to specified admin user (or current user if not specified)
 */
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;

    // Verify admin session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin-session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = verifySessionToken(sessionToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const projectId = params.id;

    // Get target admin ID from request body (or use current user)
    const body = await request.json().catch(() => ({}));
    const targetAdminId = body.adminId || user.id;

    // Validate that target admin exists
    const targetAdmin = getAdminById(targetAdminId);
    if (!targetAdmin) {
      return NextResponse.json(
        { error: 'Invalid admin ID - admin does not exist' },
        { status: 400 }
      );
    }

    // Check if project exists
    const projectResult = await turso.execute({
      sql: 'SELECT * FROM projects WHERE id = ?',
      args: [projectId],
    });

    if (projectResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Assign project to target admin
    await turso.execute({
      sql: `UPDATE projects
            SET assigned_to = ?,
                updated_at = unixepoch()
            WHERE id = ?`,
      args: [targetAdminId, projectId],
    });

    console.log(`✅ Project ${projectId} assigned to ${targetAdmin.email} by ${user.email}`);

    return NextResponse.json({
      success: true,
      assignedTo: targetAdmin,
    });

  } catch (error: any) {
    console.error('Error assigning project:', error);
    return NextResponse.json(
      { error: 'Failed to assign project' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/projects/[id]/assign
 * Unassign project (release it)
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;

    // Verify admin session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin-session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = verifySessionToken(sessionToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const projectId = params.id;

    // Unassign project
    await turso.execute({
      sql: `UPDATE projects
            SET assigned_to = NULL,
                updated_at = unixepoch()
            WHERE id = ?`,
      args: [projectId],
    });

    console.log(`✅ Project ${projectId} unassigned by ${user.email}`);

    return NextResponse.json({
      success: true,
    });

  } catch (error: any) {
    console.error('Error unassigning project:', error);
    return NextResponse.json(
      { error: 'Failed to unassign project' },
      { status: 500 }
    );
  }
}
