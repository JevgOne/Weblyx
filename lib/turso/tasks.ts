/**
 * Tasks module for Weblyx Admin
 * Allows Owner/Admin to create tasks and assign them to Specialists
 */

import { turso } from './index';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;  // The brief/instructions
  domain: string | null; // Related domain (from EroWeb)

  // Assignment
  assigned_to: string | null;  // Specialist user ID
  assigned_to_name: string | null;
  created_by: string;  // Owner/Admin user ID
  created_by_name: string;

  // Status
  status: TaskStatus;
  priority: TaskPriority;

  // Optional link to EroWeb analysis
  source_analysis_id: string | null;

  // Dates
  deadline: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  domain?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  created_by: string;
  created_by_name: string;
  priority?: TaskPriority;
  deadline?: string;
  source_analysis_id?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  deadline?: string | null;
}

/**
 * Initialize tasks table
 */
export async function initTasksTable(): Promise<void> {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      domain TEXT,
      assigned_to TEXT,
      assigned_to_name TEXT,
      created_by TEXT NOT NULL,
      created_by_name TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      source_analysis_id TEXT,
      deadline TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Create indexes for common queries
  await turso.execute(`
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to)
  `);
  await turso.execute(`
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)
  `);
  await turso.execute(`
    CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by)
  `);
}

/**
 * Create a new task
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  await turso.execute({
    sql: `
      INSERT INTO tasks (
        id, title, description, domain, assigned_to, assigned_to_name,
        created_by, created_by_name, priority, deadline, source_analysis_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      input.title,
      input.description,
      input.domain || null,
      input.assigned_to || null,
      input.assigned_to_name || null,
      input.created_by,
      input.created_by_name,
      input.priority || 'medium',
      input.deadline || null,
      input.source_analysis_id || null,
    ],
  });

  return getTaskById(id) as Promise<Task>;
}

/**
 * Get task by ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
  const result = await turso.execute({
    sql: 'SELECT * FROM tasks WHERE id = ?',
    args: [id],
  });

  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as Task;
}

/**
 * Get all tasks (for owner/admin)
 */
export async function getAllTasks(options?: {
  status?: TaskStatus;
  assignedTo?: string;
  limit?: number;
  offset?: number;
}): Promise<Task[]> {
  let sql = 'SELECT * FROM tasks WHERE 1=1';
  const args: any[] = [];

  if (options?.status) {
    sql += ' AND status = ?';
    args.push(options.status);
  }

  if (options?.assignedTo) {
    sql += ' AND assigned_to = ?';
    args.push(options.assignedTo);
  }

  sql += ' ORDER BY created_at DESC';

  if (options?.limit) {
    sql += ' LIMIT ?';
    args.push(options.limit);
  }

  if (options?.offset) {
    sql += ' OFFSET ?';
    args.push(options.offset);
  }

  const result = await turso.execute({ sql, args });
  return result.rows as unknown as Task[];
}

/**
 * Get tasks assigned to a specific user (for specialist)
 */
export async function getTasksForUser(userId: string): Promise<Task[]> {
  const result = await turso.execute({
    sql: `
      SELECT * FROM tasks
      WHERE assigned_to = ?
      AND status != 'cancelled'
      ORDER BY
        CASE priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        created_at DESC
    `,
    args: [userId],
  });

  return result.rows as unknown as Task[];
}

/**
 * Update a task
 */
export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
  const updates: string[] = ['updated_at = datetime("now")'];
  const args: any[] = [];

  if (input.title !== undefined) {
    updates.push('title = ?');
    args.push(input.title);
  }

  if (input.description !== undefined) {
    updates.push('description = ?');
    args.push(input.description);
  }

  if (input.assigned_to !== undefined) {
    updates.push('assigned_to = ?');
    args.push(input.assigned_to);
  }

  if (input.assigned_to_name !== undefined) {
    updates.push('assigned_to_name = ?');
    args.push(input.assigned_to_name);
  }

  if (input.status !== undefined) {
    updates.push('status = ?');
    args.push(input.status);

    // Set completed_at if status is completed
    if (input.status === 'completed') {
      updates.push('completed_at = datetime("now")');
    }
  }

  if (input.priority !== undefined) {
    updates.push('priority = ?');
    args.push(input.priority);
  }

  if (input.deadline !== undefined) {
    updates.push('deadline = ?');
    args.push(input.deadline);
  }

  args.push(id);

  await turso.execute({
    sql: `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
    args,
  });

  return getTaskById(id);
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<boolean> {
  const result = await turso.execute({
    sql: 'DELETE FROM tasks WHERE id = ?',
    args: [id],
  });

  return result.rowsAffected > 0;
}

/**
 * Get task statistics
 */
export async function getTaskStats(): Promise<{
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  unassigned: number;
}> {
  const result = await turso.execute(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN assigned_to IS NULL THEN 1 ELSE 0 END) as unassigned
    FROM tasks
    WHERE status != 'cancelled'
  `);

  const row = result.rows[0] as any;
  return {
    total: Number(row.total) || 0,
    pending: Number(row.pending) || 0,
    in_progress: Number(row.in_progress) || 0,
    completed: Number(row.completed) || 0,
    unassigned: Number(row.unassigned) || 0,
  };
}
