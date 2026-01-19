import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { verifySessionToken } from '@/lib/auth/simple-auth';
import { cookies } from 'next/headers';

/**
 * POST /api/admin/projects/[id]/assign
 * Assign project to current admin user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const project = projectResult.rows[0];

    // Check if already assigned to someone else
    if (project.assigned_to && project.assigned_to !== user.id) {
      return NextResponse.json(
        { error: 'Project is already assigned to another admin' },
        { status: 409 }
      );
    }

    // Assign project to current user
    await turso.execute({
      sql: `UPDATE projects
            SET assigned_to = ?,
                updated_at = unixepoch()
            WHERE id = ?`,
      args: [user.id, projectId],
    });

    console.log(`✅ Project ${projectId} assigned to ${user.email}`);

    return NextResponse.json({
      success: true,
      assignedTo: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
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
  { params }: { params: { id: string } }
) {
  try {
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
