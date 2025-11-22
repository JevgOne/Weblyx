#!/usr/bin/env tsx
// Add missing columns and reviews table to Turso
import { turso } from '../lib/turso';
import * as fs from 'fs';

async function migrate() {
  console.log('🚀 Running Turso migration...');

  try {
    const sql = fs.readFileSync('/tmp/add-columns.sql', 'utf-8');
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await turso.execute(statement);
        const preview = statement.substring(0, 60).replace(/\s+/g, ' ');
        console.log(`✅ ${preview}...`);
      } catch (error: any) {
        if (error.message?.includes('already exists') || error.message?.includes('duplicate column')) {
          const preview = statement.substring(0, 60).replace(/\s+/g, ' ');
          console.log(`⚠️  ${preview}... (already exists)`);
        } else {
          console.error(`❌ Error:`, error.message);
          console.error(`SQL: ${statement}`);
          throw error;
        }
      }
    }

    console.log('\n✨ Migration completed!');

    // Verify
    const result = await turso.execute(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    console.log('\n📊 Tables in database:');
    result.rows.forEach((row: any) => {
      console.log(`  - ${row.name}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
