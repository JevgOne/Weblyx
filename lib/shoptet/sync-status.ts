import { turso } from '@/lib/turso';

export type SyncType = 'products' | 'orders' | 'customers';
export type SyncStatus = 'running' | 'completed' | 'failed';

export interface SyncStatusRecord {
  id: number;
  sync_type: SyncType;
  status: SyncStatus;
  items_synced: number;
  error_message: string | null;
  started_at: number;
  completed_at: number | null;
}

async function initSyncStatusTable(): Promise<void> {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS shoptet_sync_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sync_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'running',
      items_synced INTEGER NOT NULL DEFAULT 0,
      error_message TEXT,
      started_at INTEGER NOT NULL,
      completed_at INTEGER
    )
  `);
  await turso.execute(`
    CREATE INDEX IF NOT EXISTS idx_sync_status_type ON shoptet_sync_status(sync_type)
  `);
}

export async function startSync(syncType: SyncType): Promise<number> {
  await initSyncStatusTable();
  const now = Math.floor(Date.now() / 1000);
  const result = await turso.execute({
    sql: `INSERT INTO shoptet_sync_status (sync_type, status, started_at) VALUES (?, 'running', ?)`,
    args: [syncType, now],
  });
  return Number(result.lastInsertRowid);
}

export async function completeSync(syncId: number, itemsSynced: number): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await turso.execute({
    sql: `UPDATE shoptet_sync_status SET status = 'completed', items_synced = ?, completed_at = ? WHERE id = ?`,
    args: [itemsSynced, now, syncId],
  });
}

export async function failSync(syncId: number, errorMessage: string): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await turso.execute({
    sql: `UPDATE shoptet_sync_status SET status = 'failed', error_message = ?, completed_at = ? WHERE id = ?`,
    args: [errorMessage, now, syncId],
  });
}

function rowToSyncStatus(row: Record<string, unknown>): SyncStatusRecord {
  return {
    id: Number(row.id),
    sync_type: row.sync_type as SyncType,
    status: row.status as SyncStatus,
    items_synced: Number(row.items_synced),
    error_message: row.error_message as string | null,
    started_at: Number(row.started_at),
    completed_at: row.completed_at ? Number(row.completed_at) : null,
  };
}

export async function getLatestSyncStatuses(): Promise<Record<SyncType, SyncStatusRecord | null>> {
  await initSyncStatusTable();
  const result: Record<SyncType, SyncStatusRecord | null> = {
    products: null,
    orders: null,
    customers: null,
  };

  for (const syncType of ['products', 'orders', 'customers'] as SyncType[]) {
    const rows = await turso.execute({
      sql: `SELECT * FROM shoptet_sync_status WHERE sync_type = ? ORDER BY started_at DESC LIMIT 1`,
      args: [syncType],
    });
    if (rows.rows.length > 0) {
      result[syncType] = rowToSyncStatus(rows.rows[0] as unknown as Record<string, unknown>);
    }
  }

  return result;
}

export async function getSyncHistory(limit: number = 20): Promise<SyncStatusRecord[]> {
  await initSyncStatusTable();
  const rows = await turso.execute({
    sql: `SELECT * FROM shoptet_sync_status ORDER BY started_at DESC LIMIT ?`,
    args: [limit],
  });
  return rows.rows.map((row) => rowToSyncStatus(row as unknown as Record<string, unknown>));
}
