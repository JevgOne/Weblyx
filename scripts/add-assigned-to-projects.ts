// Add assigned_to column to projects table
import { turso } from '../lib/turso';

async function addAssignedToColumn() {
  try {
    console.log('Adding assigned_to column to projects table...');

    // Add column
    await turso.execute(`
      ALTER TABLE projects
      ADD COLUMN assigned_to TEXT
    `);

    console.log('✅ Successfully added assigned_to column');

    // Create index for faster queries
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_projects_assigned_to
      ON projects(assigned_to)
    `);

    console.log('✅ Successfully created index on assigned_to');

    // Verify
    const result = await turso.execute('PRAGMA table_info(projects)');
    console.log('Current projects table columns:');
    result.rows.forEach((row: any) => {
      console.log(`  - ${row.name} (${row.type})`);
    });

  } catch (error: any) {
    // Ignore error if column already exists
    if (error.message.includes('duplicate column name')) {
      console.log('⚠️ Column assigned_to already exists');
    } else {
      console.error('❌ Error:', error);
      throw error;
    }
  }
}

addAssignedToColumn()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
