#!/usr/bin/env tsx

/**
 * Migration: Add locale support to reviews
 *
 * Adds locale column to reviews table to support Czech and German reviews
 */

import { turso } from '../lib/turso';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  console.log('🚀 Starting reviews locale migration...\n');

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'add-locale-to-reviews.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Split by semicolons to execute each statement separately
    // Remove comments first
    const cleanedSql = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n[${i + 1}/${statements.length}] Executing:`);
      console.log(statement.substring(0, 100) + '...\n');

      try {
        const result = await turso.execute(statement);
        console.log(`✅ Success! Rows affected: ${result.rowsAffected}`);
      } catch (error: any) {
        // Check if error is about duplicate column (migration already run)
        if (error.message?.includes('duplicate column name')) {
          console.log('⚠️  Column already exists, skipping...');
          continue;
        }
        throw error;
      }
    }

    console.log('\n\n🎉 Migration completed successfully!\n');

    // Verify migration
    console.log('🔍 Verifying migration...\n');
    const verifyResult = await turso.execute(
      'SELECT id, author_name, locale FROM reviews LIMIT 5'
    );

    console.log('Sample reviews with locale:');
    console.table(verifyResult.rows);

    console.log('\n✅ Verification complete!');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
