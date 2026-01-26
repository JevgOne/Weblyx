#!/usr/bin/env tsx

/**
 * Migration: Add blog scheduling and multi-language support
 *
 * Adds fields for:
 * - language (cs/de)
 * - scheduled_date (unix timestamp)
 * - auto_translate (0/1 boolean)
 * - parent_post_id (for linking translations)
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables BEFORE importing turso
// Try .env.production.local first (has Turso credentials), then .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.production.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function runMigration() {
  // Dynamic import turso AFTER env is loaded
  const { turso } = await import('../lib/turso');
  console.log('🚀 Starting blog scheduling migration...\n');

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'add-blog-scheduling.sql');
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
        // Check if index already exists
        if (error.message?.includes('already exists')) {
          console.log('⚠️  Index already exists, skipping...');
          continue;
        }
        throw error;
      }
    }

    console.log('\n\n🎉 Migration completed successfully!\n');

    // Verify migration
    console.log('🔍 Verifying migration...\n');
    const verifyResult = await turso.execute(
      'SELECT id, title, language, scheduled_date, auto_translate, parent_post_id FROM blog_posts LIMIT 3'
    );

    console.log('Sample blog posts with new fields:');
    console.table(verifyResult.rows);

    // Show schema
    console.log('\n📋 Updated blog_posts schema:');
    const schemaResult = await turso.execute(
      "PRAGMA table_info(blog_posts)"
    );
    console.table(schemaResult.rows);

    console.log('\n✅ Verification complete!');
    console.log('\n📝 New fields added:');
    console.log('  - language: TEXT (cs/de)');
    console.log('  - scheduled_date: INTEGER (unix timestamp)');
    console.log('  - auto_translate: INTEGER (0/1 boolean)');
    console.log('  - parent_post_id: TEXT (links translations)');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
