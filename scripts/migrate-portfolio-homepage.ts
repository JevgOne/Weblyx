#!/usr/bin/env tsx
// Migration: Add show_on_homepage and client_logo_url columns to portfolio table
import { turso } from '../lib/turso';

async function migrate() {
  console.log('Adding show_on_homepage and client_logo_url columns to portfolio...');

  try {
    await turso.execute(
      `ALTER TABLE portfolio ADD COLUMN show_on_homepage INTEGER NOT NULL DEFAULT 0`
    );
    console.log('Added show_on_homepage column');
  } catch (error: any) {
    if (error.message?.includes('duplicate column')) {
      console.log('show_on_homepage column already exists, skipping');
    } else {
      throw error;
    }
  }

  try {
    await turso.execute(
      `ALTER TABLE portfolio ADD COLUMN client_logo_url TEXT`
    );
    console.log('Added client_logo_url column');
  } catch (error: any) {
    if (error.message?.includes('duplicate column')) {
      console.log('client_logo_url column already exists, skipping');
    } else {
      throw error;
    }
  }

  console.log('Migration complete!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
