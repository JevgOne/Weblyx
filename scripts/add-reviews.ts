#!/usr/bin/env tsx
import { turso } from '../lib/turso';

async function addReviewsTable() {
  const statements = [
    'CREATE INDEX IF NOT EXISTS idx_portfolio_published ON portfolio(published)',
    `CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      author_name TEXT NOT NULL,
      author_image TEXT,
      author_role TEXT,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      text TEXT NOT NULL,
      date INTEGER NOT NULL,
      source TEXT DEFAULT 'manual',
      source_url TEXT,
      published BOOLEAN DEFAULT 0,
      featured BOOLEAN DEFAULT 0,
      "order" INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    'CREATE INDEX IF NOT EXISTS idx_reviews_published ON reviews(published, "order")',
    'CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(featured)'
  ];

  for (const sql of statements) {
    try {
      await turso.execute(sql);
      const preview = sql.substring(0, 60).replace(/\s+/g, ' ');
      console.log(`✅ ${preview}...`);
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        const preview = sql.substring(0, 60).replace(/\s+/g, ' ');
        console.log(`⚠️  ${preview}... (exists)`);
      } else {
        console.error('❌', e.message);
        throw e;
      }
    }
  }

  // Verify
  const result = await turso.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  console.log('\n📊 Tables:');
  result.rows.forEach((r: any) => console.log(`  - ${r.name}`));
}

addReviewsTable();
