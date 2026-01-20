/**
 * Migration: Create activity_logs table for audit logging
 * Run with: npx tsx scripts/migrate-activity-logs.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
  console.log('🚀 Starting activity_logs table migration...\n');

  try {
    // Create activity_logs table
    console.log('Creating activity_logs table...');
    await turso.execute({
      sql: `CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        user_name TEXT,
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        entity_name TEXT,
        details TEXT,
        ip_address TEXT,
        created_at INTEGER DEFAULT (unixepoch())
      )`,
      args: [],
    });
    console.log('✅ activity_logs table created');

    // Create index for faster queries
    console.log('Creating indexes...');
    await turso.execute({
      sql: `CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id)`,
      args: [],
    });
    await turso.execute({
      sql: `CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC)`,
      args: [],
    });
    await turso.execute({
      sql: `CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action)`,
      args: [],
    });
    console.log('✅ Indexes created');

    // Verify table
    const tableInfo = await turso.execute({
      sql: "PRAGMA table_info(activity_logs)",
      args: [],
    });

    console.log('\n📋 Table schema:');
    tableInfo.rows.forEach((row: any) => {
      console.log(`  - ${row.name} (${row.type || 'TEXT'})`);
    });

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
