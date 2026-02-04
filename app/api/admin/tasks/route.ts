/**
 * Tasks API - List and Create
 * GET /api/admin/tasks - List tasks
 * POST /api/admin/tasks - Create task (owner/admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth/simple-auth';
import { isAdminOrHigher } from '@/lib/auth/permissions';
import {
  getAllTasks,
  getTasksForUser,
  createTask,
  initTasksTable,
  getTaskStats,
} from '@/lib/turso/tasks';

// Initialize table on first request
let tableInitialized = false;

async function ensureTable() {
  if (!tableInitialized) {
    await initTasksTable();
    tableInitialized = true;
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifySessionToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    await ensureTable();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;
    const includeStats = searchParams.get('stats') === 'true';

    let tasks;
    let stats;

    // Owner/Admin sees all tasks, Specialist sees only their own
    if (isAdminOrHigher(user.role)) {
      tasks = await getAllTasks({ status: status || undefined });
      if (includeStats) {
        stats = await getTaskStats();
      }
    } else {
      // Specialist - only assigned tasks
      tasks = await getTasksForUser(user.id);
    }

    return NextResponse.json({ tasks, stats }, {
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error: any) {
    console.error('Tasks GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifySessionToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Only owner/admin can create tasks
    if (!isAdminOrHigher(user.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    await ensureTable();

    const body = await req.json();

    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const task = await createTask({
      title: body.title,
      description: body.description,
      domain: body.domain,
      assigned_to: body.assigned_to,
      assigned_to_name: body.assigned_to_name,
      created_by: user.id,
      created_by_name: user.name,
      priority: body.priority || 'medium',
      deadline: body.deadline,
      source_analysis_id: body.source_analysis_id,
    });

    return NextResponse.json({ task });
  } catch (error: any) {
    console.error('Tasks POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
