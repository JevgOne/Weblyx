#!/usr/bin/env tsx

/**
 * Add assigned_to column to leads table
 */

import { turso } from '../lib/turso';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigration() {
  console.log('🔄 Running assigned_to migration...\n');

  try {
    const sqlContent = readFileSync(
      join(__dirname, 'add-assigned-to-leads.sql'),
      'utf-8'
    );

    // Remove comments and split into statements
    const cleanedSql = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Execute each statement
    for (const statement of statements) {
      console.log('📝 Executing:', statement.substring(0, 80) + '...\n');

      try {
        const result = await turso.execute(statement);
        console.log(`✅ Success - ${result.rowsAffected} rows affected\n`);
      } catch (err: any) {
        // Ignore "duplicate column" error
        if (err.message?.includes('duplicate column')) {
          console.log('⚠️  Column already exists, skipping...\n');
        } else {
          throw err;
        }
      }
    }

    console.log('✅ Migration completed successfully!');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
