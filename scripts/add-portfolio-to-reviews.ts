#!/usr/bin/env tsx

/**
 * Migration: Add portfolio_id to reviews
 *
 * Adds portfolio_id column to reviews table to link reviews with portfolio items
 */

import { turso } from '../lib/turso';

async function runMigration() {
  console.log('Starting reviews portfolio_id migration...\n');

  try {
    // Add portfolio_id column
    try {
      await turso.execute('ALTER TABLE reviews ADD COLUMN portfolio_id TEXT');
      console.log('Added portfolio_id column');
    } catch (error: any) {
      if (error.message?.includes('duplicate column name')) {
        console.log('portfolio_id column already exists, skipping...');
      } else {
        throw error;
      }
    }

    // Add index
    try {
      await turso.execute('CREATE INDEX IF NOT EXISTS idx_reviews_portfolio ON reviews(portfolio_id)');
      console.log('Created idx_reviews_portfolio index');
    } catch (error: any) {
      console.log('Index creation note:', error.message);
    }

    console.log('\nMigration completed successfully!\n');

    // Verify
    const result = await turso.execute('SELECT id, author_name, portfolio_id FROM reviews LIMIT 5');
    console.log('Sample reviews:');
    console.table(result.rows);
  } catch (error: any) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
