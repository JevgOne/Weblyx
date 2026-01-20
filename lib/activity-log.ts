/**
 * Activity Log - Audit trail for admin actions
 */

export type ActionType =
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_login'
  | 'user_logout'
  | 'lead_created'
  | 'lead_updated'
  | 'lead_deleted'
  | 'lead_converted'
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'
  | 'portfolio_created'
  | 'portfolio_updated'
  | 'portfolio_deleted'
  | 'blog_created'
  | 'blog_updated'
  | 'blog_deleted'
  | 'review_created'
  | 'review_updated'
  | 'review_deleted'
  | 'settings_updated'
  | 'content_updated'
  | 'password_changed';

export type EntityType =
  | 'user'
  | 'lead'
  | 'project'
  | 'portfolio'
  | 'blog'
  | 'review'
  | 'settings'
  | 'content'
  | 'promo_code'
  | 'invoice'
  | 'payment';

export interface ActivityLog {
  id: number;
  user_id: string;
  user_email: string;
  user_name: string | null;
  action: ActionType;
  entity_type: EntityType | null;
  entity_id: string | null;
  entity_name: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: number;
}

export interface LogActivityParams {
  userId: string;
  userEmail: string;
  userName?: string;
  action: ActionType;
  entityType?: EntityType;
  entityId?: string;
  entityName?: string;
  details?: string;
  ipAddress?: string;
}

/**
 * Log an activity to the database
 */
export async function logActivity(params: LogActivityParams): Promise<boolean> {
  try {
    const { turso } = await import('@/lib/turso');

    await turso.execute({
      sql: `INSERT INTO activity_logs
            (user_id, user_email, user_name, action, entity_type, entity_id, entity_name, details, ip_address, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`,
      args: [
        params.userId,
        params.userEmail,
        params.userName || null,
        params.action,
        params.entityType || null,
        params.entityId || null,
        params.entityName || null,
        params.details || null,
        params.ipAddress || null,
      ],
    });

    return true;
  } catch (error) {
    console.error('Failed to log activity:', error);
    return false;
  }
}

/**
 * Get activity logs with pagination
 */
export async function getActivityLogs(options: {
  limit?: number;
  offset?: number;
  userId?: string;
  action?: ActionType;
  entityType?: EntityType;
}): Promise<{ logs: ActivityLog[]; total: number }> {
  try {
    const { turso } = await import('@/lib/turso');
    const { limit = 50, offset = 0, userId, action, entityType } = options;

    // Build WHERE clause
    const conditions: string[] = [];
    const args: any[] = [];

    if (userId) {
      conditions.push('user_id = ?');
      args.push(userId);
    }
    if (action) {
      conditions.push('action = ?');
      args.push(action);
    }
    if (entityType) {
      conditions.push('entity_type = ?');
      args.push(entityType);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM activity_logs ${whereClause}`,
      args,
    });
    const total = (countResult.rows[0] as any)?.count || 0;

    // Get logs
    const result = await turso.execute({
      sql: `SELECT * FROM activity_logs ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    return {
      logs: result.rows as unknown as ActivityLog[],
      total,
    };
  } catch (error) {
    console.error('Failed to get activity logs:', error);
    return { logs: [], total: 0 };
  }
}

/**
 * Get recent activity for dashboard
 */
export async function getRecentActivity(limit: number = 10): Promise<ActivityLog[]> {
  const { logs } = await getActivityLogs({ limit });
  return logs;
}

/**
 * Human-readable action descriptions
 */
export const ACTION_LABELS: Record<ActionType, { cs: string; en: string }> = {
  user_created: { cs: 'Vytvořil uživatele', en: 'Created user' },
  user_updated: { cs: 'Upravil uživatele', en: 'Updated user' },
  user_deleted: { cs: 'Smazal uživatele', en: 'Deleted user' },
  user_login: { cs: 'Přihlásil se', en: 'Logged in' },
  user_logout: { cs: 'Odhlásil se', en: 'Logged out' },
  lead_created: { cs: 'Vytvořil poptávku', en: 'Created lead' },
  lead_updated: { cs: 'Upravil poptávku', en: 'Updated lead' },
  lead_deleted: { cs: 'Smazal poptávku', en: 'Deleted lead' },
  lead_converted: { cs: 'Převedl poptávku na projekt', en: 'Converted lead to project' },
  project_created: { cs: 'Vytvořil projekt', en: 'Created project' },
  project_updated: { cs: 'Upravil projekt', en: 'Updated project' },
  project_deleted: { cs: 'Smazal projekt', en: 'Deleted project' },
  portfolio_created: { cs: 'Přidal do portfolia', en: 'Added to portfolio' },
  portfolio_updated: { cs: 'Upravil portfolio', en: 'Updated portfolio' },
  portfolio_deleted: { cs: 'Smazal z portfolia', en: 'Removed from portfolio' },
  blog_created: { cs: 'Vytvořil článek', en: 'Created blog post' },
  blog_updated: { cs: 'Upravil článek', en: 'Updated blog post' },
  blog_deleted: { cs: 'Smazal článek', en: 'Deleted blog post' },
  review_created: { cs: 'Přidal recenzi', en: 'Added review' },
  review_updated: { cs: 'Upravil recenzi', en: 'Updated review' },
  review_deleted: { cs: 'Smazal recenzi', en: 'Deleted review' },
  settings_updated: { cs: 'Změnil nastavení', en: 'Updated settings' },
  content_updated: { cs: 'Upravil obsah', en: 'Updated content' },
  password_changed: { cs: 'Změnil heslo', en: 'Changed password' },
};
