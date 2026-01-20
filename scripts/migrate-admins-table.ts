/**
 * Migration: Add password_hash, role, and active columns to admins table
 * Run with: npx tsx scripts/migrate-admins-table.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
  console.log('🚀 Starting admins table migration...\n');

  try {
    // Check if columns already exist
    const tableInfo = await turso.execute({
      sql: "PRAGMA table_info(admins)",
      args: [],
    });

    const columns = tableInfo.rows.map((row: any) => row.name);
    console.log('Current columns:', columns);

    // Add password_hash column if not exists
    if (!columns.includes('password_hash')) {
      console.log('Adding password_hash column...');
      await turso.execute({
        sql: "ALTER TABLE admins ADD COLUMN password_hash TEXT",
        args: [],
      });
      console.log('✅ password_hash column added');
    } else {
      console.log('⏭️  password_hash column already exists');
    }

    // Add role column if not exists
    if (!columns.includes('role')) {
      console.log('Adding role column...');
      await turso.execute({
        sql: "ALTER TABLE admins ADD COLUMN role TEXT DEFAULT 'admin'",
        args: [],
      });
      console.log('✅ role column added');
    } else {
      console.log('⏭️  role column already exists');
    }

    // Add active column if not exists
    if (!columns.includes('active')) {
      console.log('Adding active column...');
      await turso.execute({
        sql: "ALTER TABLE admins ADD COLUMN active INTEGER DEFAULT 1",
        args: [],
      });
      console.log('✅ active column added');
    } else {
      console.log('⏭️  active column already exists');
    }

    // Verify final schema
    const finalInfo = await turso.execute({
      sql: "PRAGMA table_info(admins)",
      args: [],
    });

    console.log('\n📋 Final table schema:');
    finalInfo.rows.forEach((row: any) => {
      console.log(`  - ${row.name} (${row.type || 'TEXT'})`);
    });

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
