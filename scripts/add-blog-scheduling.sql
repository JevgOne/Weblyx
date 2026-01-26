-- Add scheduling and multi-language support to blog_posts table
-- This enables scheduled publishing and automatic translation between CS/DE

-- Add language column (default 'cs' for existing posts)
ALTER TABLE blog_posts ADD COLUMN language TEXT DEFAULT 'cs';

-- Add scheduled_date column (unix timestamp)
-- NULL = not scheduled, published immediately (default behavior)
-- Set value = scheduled for future publication
ALTER TABLE blog_posts ADD COLUMN scheduled_date INTEGER DEFAULT NULL;

-- Add auto_translate flag (0 = manual, 1 = auto-translate)
ALTER TABLE blog_posts ADD COLUMN auto_translate INTEGER DEFAULT 0;

-- Add parent_post_id to link translations together
-- NULL = original post, non-NULL = translation of another post
ALTER TABLE blog_posts ADD COLUMN parent_post_id TEXT DEFAULT NULL;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_language ON blog_posts(language);
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled_date ON blog_posts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_blog_posts_parent_id ON blog_posts(parent_post_id);

-- Create composite index for fetching scheduled posts ready to publish
-- (scheduled_date not null AND scheduled_date <= current_time AND published = 0)
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled_pending ON blog_posts(scheduled_date, published) WHERE scheduled_date IS NOT NULL;

-- Update existing posts to Czech language
UPDATE blog_posts SET language = 'cs' WHERE language IS NULL OR language = '';
