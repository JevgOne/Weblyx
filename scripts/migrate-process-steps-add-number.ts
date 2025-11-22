#!/usr/bin/env ts-node

/**
 * Migration: Add 'number' column to process_steps table
 *
 * This script adds the 'number' column to the process_steps table
 * and populates it with auto-generated values based on order.
 */

import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoAuthToken) {
  console.error('❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env.local');
  process.exit(1);
}

const turso = createClient({
  url: tursoUrl,
  authToken: tursoAuthToken,
});

async function migrate() {
  console.log('🚀 Starting migration: Add number column to process_steps');

  try {
    // Step 1: Check if column already exists
    console.log('\n📋 Step 1: Checking if number column exists...');
    const tableInfo = await turso.execute('PRAGMA table_info(process_steps)');
    const hasNumberColumn = tableInfo.rows.some((row: any) => row.name === 'number');

    if (hasNumberColumn) {
      console.log('✅ Column "number" already exists. Skipping migration.');
      return;
    }

    // Step 2: Add the number column
    console.log('\n📋 Step 2: Adding number column...');
    await turso.execute(`
      ALTER TABLE process_steps ADD COLUMN number TEXT DEFAULT '1'
    `);
    console.log('✅ Column "number" added successfully');

    // Step 3: Populate number column based on order
    console.log('\n📋 Step 3: Populating number column...');
    const steps = await turso.execute('SELECT id, "order" FROM process_steps ORDER BY "order" ASC');

    if (steps.rows.length > 0) {
      for (let i = 0; i < steps.rows.length; i++) {
        const step = steps.rows[i];
        const number = String(i + 1).padStart(2, '0'); // "01", "02", etc.
        await turso.execute({
          sql: 'UPDATE process_steps SET number = ? WHERE id = ?',
          args: [number, step.id as string]
        });
        console.log(`  ✓ Updated step ${step.id}: number = ${number}`);
      }
      console.log(`✅ Populated ${steps.rows.length} steps with number values`);
    } else {
      console.log('ℹ️  No existing steps to populate');
    }

    console.log('\n🎉 Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await turso.close();
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
