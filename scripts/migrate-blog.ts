#!/usr/bin/env tsx
/**
 * Blog Posts Table Migration Script
 * Creates the blog_posts table in Turso database
 */

import { turso } from '../lib/turso';

async function migrateBlogTable() {
  console.log('🚀 Starting blog_posts table migration...');

  try {
    // Create blog_posts table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt TEXT,
        author_id TEXT,
        author_name TEXT,
        featured_image TEXT,
        published INTEGER DEFAULT 0,
        published_at INTEGER,
        tags TEXT,
        meta_title TEXT,
        meta_description TEXT,
        views INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    console.log('✅ blog_posts table created successfully');

    // Create indexes for better performance
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)
    `);
    console.log('✅ Created index on slug');

    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published, published_at DESC)
    `);
    console.log('✅ Created index on published status');

    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC)
    `);
    console.log('✅ Created index on created_at');

    console.log('\n🎉 Blog migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

// Run migration
migrateBlogTable();
