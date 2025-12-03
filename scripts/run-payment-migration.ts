#!/usr/bin/env tsx
/**
 * Payment & Invoicing Database Migration
 *
 * This script creates the payment system tables in Turso database:
 * - payments (GoPay transactions)
 * - invoices (Czech invoices)
 * - subscriptions (recurring payments)
 * - company_settings (Weblyx company info)
 *
 * Usage: tsx scripts/run-payment-migration.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { readFileSync } from 'fs';
import { join } from 'path';
import { turso } from '../lib/turso';

async function runMigration() {
  console.log('🚀 Starting payment system migration...\n');

  try {
    // Read SQL file
    const sqlFile = join(__dirname, 'create-payment-schema.sql');
    const sql = readFileSync(sqlFile, 'utf-8');

    // Split into individual statements (simple approach)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📄 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments
      if (statement.startsWith('--')) {
        continue;
      }

      try {
        await turso.execute(statement);

        // Get statement type for logging
        const statementType = statement.split(/\s+/)[0].toUpperCase();
        const tableName = statement.match(/(?:TABLE|VIEW|TRIGGER|INDEX)\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i)?.[1] || '';

        console.log(`✅ [${i + 1}/${statements.length}] ${statementType} ${tableName || ''}`);
        successCount++;
      } catch (error: any) {
        // Check if error is "already exists" - this is expected with IF NOT EXISTS
        if (error.message?.includes('already exists')) {
          console.log(`⏭️  [${i + 1}/${statements.length}] Already exists, skipping...`);
          skipCount++;
        } else {
          console.error(`❌ [${i + 1}/${statements.length}] Error:`, error.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
          throw error;
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Migration completed successfully!`);
    console.log(`   - ${successCount} statements executed`);
    console.log(`   - ${skipCount} statements skipped (already exists)`);
    console.log('='.repeat(50) + '\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...\n');

    const tables = ['payments', 'invoices', 'subscriptions', 'company_settings'];

    for (const table of tables) {
      try {
        const result = await turso.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result.rows[0]?.count || 0;
        console.log(`✅ Table '${table}' exists (${count} rows)`);
      } catch (error) {
        console.error(`❌ Table '${table}' NOT found!`);
      }
    }

    console.log('\n✨ Payment system is ready to use!\n');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
runMigration();
