#!/usr/bin/env tsx
// Initialize Turso database schema
import { turso } from '../lib/turso';
import * as fs from 'fs';
import * as path from 'path';

async function initializeSchema() {
  console.log('🚀 Initializing Turso database schema...');

  try {
    // Read schema file
    const schemaPath = path.join(process.cwd(), 'turso-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Remove comments and split by semicolons
    const cleanSchema = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = cleanSchema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await turso.execute(statement);
        const preview = statement.substring(0, 50).replace(/\s+/g, ' ');
        console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message?.includes('already exists')) {
          const preview = statement.substring(0, 50).replace(/\s+/g, ' ');
          console.log(`⚠️  [${i + 1}/${statements.length}] ${preview}... (already exists)`);
        } else {
          console.error(`❌ [${i + 1}/${statements.length}] Error:`, error.message);
          console.error(`SQL: ${statement.substring(0, 100)}...`);
          throw error;
        }
      }
    }

    console.log('✨ Turso database schema initialized successfully!');

    // Verify tables exist
    const result = await turso.execute(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    console.log('\n📊 Tables in database:');
    result.rows.forEach((row: any) => {
      console.log(`  - ${row.name}`);
    });

  } catch (error) {
    console.error('❌ Failed to initialize schema:', error);
    process.exit(1);
  }
}

initializeSchema();
