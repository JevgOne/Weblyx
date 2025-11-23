#!/usr/bin/env tsx
/**
 * Copy all data from titanboxing database to weblyx database
 */

import { createClient } from '@libsql/client';

const titanboxing = createClient({
  url: 'libsql://titanboxing-jevgone.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjM4MjQzNzUsImlkIjoiNThmNWYxYmItZjFiYS00YmYwLWIwOTItODExNDdjOTRmZTQ5IiwicmlkIjoiYzMwMWFkY2ItYjI0NS00MjY1LTg0YmQtODgyYmUyNjU4NmY0In0.WTtZVte4NmQ360ChSs5DJa2VeC2sMBhEKuP93SuyG3z69thMEBFbNV4udtnc79LbYW-YX9feJ9DLIwD70yiFAA',
});

const weblyx = createClient({
  url: 'libsql://weblyx-jevgone.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjM4OTY1NjksImlkIjoiNjQ0NDNiODktZTBmOC00NTUxLWFiNTItNDhkYTg4ZDIwMTcwIiwicmlkIjoiNTgyYjlkM2QtYjUxYS00NGE0LTgyZGYtMmEwY2I2OTM5N2NkIn0.U_aC0zZdrsTf3y3vz34C880xN_jVM3Mzo6qkKtmdZWqBb8Hsfho_O52rCVyTLZrHJQ2nxnuwWSZoxy7Am7poBw',
});

async function copyTable(tableName: string) {
  console.log(`\n📋 Copying table: ${tableName}`);

  try {
    // Get all data from titanboxing
    const result = await titanboxing.execute(`SELECT * FROM ${tableName}`);
    const rows = result.rows;

    if (rows.length === 0) {
      console.log(`   ⚠️  No data in ${tableName}, skipping...`);
      return;
    }

    console.log(`   Found ${rows.length} rows`);

    // Get column names and escape reserved keywords
    const columns = result.columns;
    const columnNames = columns.map(col => col === 'order' ? '"order"' : col).join(', ');
    const placeholders = columns.map(() => '?').join(', ');

    // Copy each row to weblyx
    for (const row of rows) {
      const values = columns.map(col => (row as any)[col]);

      try {
        await weblyx.execute({
          sql: `INSERT OR REPLACE INTO ${tableName} (${columnNames}) VALUES (${placeholders})`,
          args: values,
        });
      } catch (error) {
        console.error(`   ❌ Error inserting row:`, error);
      }
    }

    console.log(`   ✅ Copied ${rows.length} rows to weblyx`);
  } catch (error) {
    console.error(`   ❌ Error copying ${tableName}:`, error);
  }
}

async function main() {
  console.log('🚀 Starting data copy from titanboxing to weblyx...\n');

  const tables = [
    'homepage_sections',
    'services',
    'portfolio',
    'reviews',
    'pricing_tiers',
    'process_steps',
    'process_section',
    'faq_items',
    'faq_section',
    'cta_section',
    'contact_info',
  ];

  for (const table of tables) {
    await copyTable(table);
  }

  console.log('\n\n🎉 Data copy completed!');
  console.log('✅ All tables have been copied from titanboxing to weblyx');
}

main().catch(console.error);
