/**
 * Tasks API - Individual task operations
 * GET /api/admin/tasks/[id] - Get task
 * PATCH /api/admin/tasks/[id] - Update task
 * DELETE /api/admin/tasks/[id] - Delete task (owner/admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth/simple-auth';
import { isAdminOrHigher } from '@/lib/auth/permissions';
import { getTaskById, updateTask, deleteTask } from '@/lib/turso/tasks';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifySessionToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const task = await getTaskById(id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Specialist can only see their own tasks
    if (!isAdminOrHigher(user.role) && task.assigned_to !== user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    return NextResponse.json({ task });
  } catch (error: any) {
    console.error('Task GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifySessionToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const task = await getTaskById(id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const body = await req.json();

    // Specialist can only update status of their own tasks
    if (!isAdminOrHigher(user.role)) {
      if (task.assigned_to !== user.id) {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
      }
      // Specialist can only change status
      const updatedTask = await updateTask(id, { status: body.status });
      return NextResponse.json({ task: updatedTask });
    }

    // Owner/Admin can update everything
    const updatedTask = await updateTask(id, {
      title: body.title,
      description: body.description,
      assigned_to: body.assigned_to,
      assigned_to_name: body.assigned_to_name,
      status: body.status,
      priority: body.priority,
      deadline: body.deadline,
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error: any) {
    console.error('Task PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifySessionToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Only owner/admin can delete
    if (!isAdminOrHigher(user.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const deleted = await deleteTask(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Task DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
