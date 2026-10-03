import { turso } from '@/lib/turso';
import type { Project, ProjectStatus } from '@/types/project';

/**
 * Projects in Turso, shaped as the admin pages expect them.
 *
 * Dates are stored as unix seconds but edited in `<input type="date">`, which
 * only accepts YYYY-MM-DD — a full ISO string renders as an empty field and
 * the next save wipes the date. So they cross this boundary as plain days.
 */

const STATUSES: ProjectStatus[] = [
  'unpaid',
  'awaiting_invoice',
  'in_progress',
  'delivered',
  'warranty_ended',
  'cancelled',
  'paused',
];

const ADMINS = [{ id: 'admin-1', email: process.env.ADMIN_EMAIL || 'admin@weblyx.cz', name: 'Admin' }];

function toDay(unix: unknown): string | undefined {
  if (unix === null || unix === undefined || unix === '') return undefined;
  return new Date(Number(unix) * 1000).toISOString().slice(0, 10);
}

function fromDay(day: unknown): number | null {
  if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(day)) return null;
  return Math.floor(new Date(`${day.slice(0, 10)}T12:00:00Z`).getTime() / 1000);
}

function parseJSON(field: unknown) {
  if (!field) return null;
  try {
    return typeof field === 'string' ? JSON.parse(field) : field;
  } catch {
    return null;
  }
}

export function rowToProject(row: any) {
  const tags = parseJSON(row.tags);
  const status = String(row.status ?? '').replace('-', '_') as ProjectStatus;
  return {
    id: String(row.id),
    projectNumber: `WBX-${new Date(Number(row.created_at) * 1000).getFullYear()}-${String(row.id).slice(-4)}`,
    name: row.name ?? '',
    description: row.description ?? '',
    notes: row.notes ?? '',
    clientName: row.client_name ?? '',
    clientEmail: row.client_email ?? '',
    clientPhone: row.client_phone ?? undefined,
    projectType: row.project_type || (Array.isArray(tags) && tags[0]) || 'Web',
    status: STATUSES.includes(status) ? status : 'in_progress',
    priority: row.priority || 'medium',
    progress: Number(row.progress) || 0,
    startDate: toDay(row.start_date),
    deadline: toDay(row.deadline) ?? '',
    completedAt: toDay(row.completion_date),
    priceTotal: Number(row.budget) || 0,
    pricePaid: Number(row.price_paid) || 0,
    currency: row.currency || 'CZK',
    productionUrl: row.production_url ?? undefined,
    stagingUrl: row.staging_url ?? undefined,
    githubRepo: row.github_repo ?? undefined,
    hostingProvider: row.hosting_provider ?? undefined,
    hostingInfo: row.hosting_info ?? undefined,
    domainName: row.domain_name ?? undefined,
    domainRegistrar: row.domain_registrar ?? undefined,
    leadId: row.lead_id ?? null,
    assignedTo: row.assigned_to ? ADMINS.find((a) => a.id === row.assigned_to) ?? null : null,
    createdAt: new Date(Number(row.created_at) * 1000).toISOString(),
    updatedAt: new Date(Number(row.updated_at) * 1000).toISOString(),
  } satisfies Project & Record<string, unknown>;
}

export async function listProjects() {
  const result = await turso.execute('SELECT * FROM projects ORDER BY created_at DESC');
  return result.rows.map(rowToProject);
}

export async function getProject(id: string) {
  const result = await turso.execute({ sql: 'SELECT * FROM projects WHERE id = ? LIMIT 1', args: [id] });
  return result.rows[0] ? rowToProject(result.rows[0]) : null;
}

/** Form field -> column, with the conversion each one needs. */
const COLUMNS: Record<string, [string, (v: unknown) => unknown]> = {
  name: ['name', (v) => String(v ?? '').trim()],
  description: ['description', (v) => (v == null ? null : String(v))],
  notes: ['notes', (v) => (v == null ? null : String(v))],
  clientName: ['client_name', (v) => String(v ?? '').trim()],
  clientEmail: ['client_email', (v) => String(v ?? '').trim()],
  clientPhone: ['client_phone', (v) => (v ? String(v) : null)],
  projectType: ['project_type', (v) => (v ? String(v) : null)],
  status: ['status', (v) => (STATUSES.includes(v as ProjectStatus) ? v : 'in_progress')],
  priority: ['priority', (v) => (['high', 'medium', 'low'].includes(String(v)) ? v : 'medium')],
  progress: ['progress', (v) => Math.max(0, Math.min(100, Math.round(Number(v) || 0)))],
  startDate: ['start_date', fromDay],
  deadline: ['deadline', fromDay],
  completedAt: ['completion_date', fromDay],
  priceTotal: ['budget', (v) => Math.max(0, Math.round(Number(v) || 0))],
  pricePaid: ['price_paid', (v) => Math.max(0, Math.round(Number(v) || 0))],
  currency: ['currency', (v) => (v ? String(v) : 'CZK')],
  productionUrl: ['production_url', (v) => (v ? String(v) : null)],
  stagingUrl: ['staging_url', (v) => (v ? String(v) : null)],
  githubRepo: ['github_repo', (v) => (v ? String(v) : null)],
  hostingProvider: ['hosting_provider', (v) => (v ? String(v) : null)],
  hostingInfo: ['hosting_info', (v) => (v ? String(v) : null)],
  domainName: ['domain_name', (v) => (v ? String(v) : null)],
  domainRegistrar: ['domain_registrar', (v) => (v ? String(v) : null)],
};

/** Writes the fields present in `patch`; unknown keys are ignored, never interpolated. */
export async function updateProject(id: string, patch: Record<string, unknown>) {
  const sets: string[] = [];
  const args: any[] = [];
  for (const [key, value] of Object.entries(patch)) {
    const column = COLUMNS[key];
    if (!column) continue;
    sets.push(`${column[0]} = ?`);
    args.push(column[1](value));
  }
  if (sets.length > 0) {
    sets.push('updated_at = unixepoch()');
    await turso.execute({ sql: `UPDATE projects SET ${sets.join(', ')} WHERE id = ?`, args: [...args, id] });
  }
  return getProject(id);
}
