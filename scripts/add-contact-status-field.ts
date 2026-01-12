// Migration: Add contact_status field to eroweb_analyses table
// This adds CRM functionality to organize analyses by contact status

import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function addContactStatusField() {
  console.log('🔧 Adding contact_status field to eroweb_analyses table...\n');

  try {
    // Check if column already exists
    const tableInfo = await client.execute(
      "PRAGMA table_info(eroweb_analyses)"
    );

    const columnExists = tableInfo.rows.some(
      (row: any) => row.name === 'contact_status'
    );

    if (columnExists) {
      console.log('ℹ️  Column contact_status already exists, skipping...');
      return;
    }

    // Add column with default value 'not_contacted'
    await client.execute(`
      ALTER TABLE eroweb_analyses
      ADD COLUMN contact_status TEXT NOT NULL DEFAULT 'not_contacted'
      CHECK(contact_status IN ('not_contacted', 'contacted', 'agreed', 'no_response'))
    `);

    console.log('✅ Column contact_status added successfully');

    // Verify the column was added
    const verifyTableInfo = await client.execute(
      "PRAGMA table_info(eroweb_analyses)"
    );

    const verifyColumn = verifyTableInfo.rows.find(
      (row: any) => row.name === 'contact_status'
    );

    if (verifyColumn) {
      console.log('✅ Verification: Column exists');
      console.log(`   Name: ${verifyColumn.name}`);
      console.log(`   Type: ${verifyColumn.type}`);
      console.log(`   Default: ${verifyColumn.dflt_value}`);
    }

    // Show current data count
    const countResult = await client.execute(
      "SELECT COUNT(*) as count FROM eroweb_analyses"
    );
    const count = countResult.rows[0]?.count || 0;

    console.log(`\n📊 Table now has ${count} analyses (all set to 'not_contacted' by default)`);
    console.log('\n✅ Migration completed successfully!\n');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

addContactStatusField();
