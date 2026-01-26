// Turso Blog Data Access Layer
import { turso, dateToUnix, unixToDate, parseJSON, stringifyJSON } from '../turso';
import type { BlogPost, CreateBlogPostData, UpdateBlogPostData } from '@/types/blog';
import { nanoid } from 'nanoid';

interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  author_id: string | null;
  author_name: string | null;
  featured_image: string | null;
  published: number;
  published_at: number | null;
  tags: string | null;
  meta_title: string | null;
  meta_description: string | null;
  views: number;
  created_at: number;
  updated_at: number;
  // Scheduling & Multi-language fields
  language: string;
  scheduled_date: number | null;
  auto_translate: number;
  parent_post_id: string | null;
}

function rowToBlogPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt || undefined,
    authorId: row.author_id || undefined,
    authorName: row.author_name || undefined,
    featuredImage: row.featured_image || undefined,
    published: Boolean(row.published),
    publishedAt: unixToDate(row.published_at) || undefined,
    tags: parseJSON<string[]>(row.tags) || [],
    metaTitle: row.meta_title || undefined,
    metaDescription: row.meta_description || undefined,
    views: row.views || 0,
    createdAt: unixToDate(row.created_at) || new Date(),
    updatedAt: unixToDate(row.updated_at) || new Date(),
    // Scheduling & Multi-language fields
    language: (row.language || 'cs') as 'cs' | 'de',
    scheduledDate: unixToDate(row.scheduled_date) || undefined,
    autoTranslate: Boolean(row.auto_translate),
    parentPostId: row.parent_post_id || undefined,
  };
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const result = await turso.execute(
    'SELECT * FROM blog_posts ORDER BY created_at DESC'
  );
  return result.rows.map((row) => rowToBlogPost(row as unknown as BlogPostRow));
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const result = await turso.execute(
    'SELECT * FROM blog_posts WHERE published = 1 ORDER BY published_at DESC'
  );
  return result.rows.map((row) => rowToBlogPost(row as unknown as BlogPostRow));
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const result = await turso.execute({
    sql: 'SELECT * FROM blog_posts WHERE id = ?',
    args: [id],
  });

  if (result.rows.length === 0) return null;
  return rowToBlogPost(result.rows[0] as unknown as BlogPostRow);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const result = await turso.execute({
    sql: 'SELECT * FROM blog_posts WHERE slug = ?',
    args: [slug],
  });

  if (result.rows.length === 0) return null;
  return rowToBlogPost(result.rows[0] as unknown as BlogPostRow);
}

export async function createBlogPost(data: CreateBlogPostData): Promise<BlogPost> {
  const id = nanoid();
  const now = Math.floor(Date.now() / 1000);
  const publishedAt = data.published && data.publishedAt
    ? dateToUnix(data.publishedAt)
    : data.published
    ? now
    : null;

  await turso.execute({
    sql: `INSERT INTO blog_posts (
      id, title, slug, content, excerpt, author_id, author_name,
      featured_image, published, published_at, tags, meta_title,
      meta_description, views, created_at, updated_at,
      language, scheduled_date, auto_translate, parent_post_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      data.title,
      data.slug,
      data.content,
      data.excerpt || null,
      data.authorId || null,
      data.authorName || null,
      data.featuredImage || null,
      data.published ? 1 : 0,
      publishedAt,
      stringifyJSON(data.tags || []),
      data.metaTitle || null,
      data.metaDescription || null,
      0, // views start at 0
      now,
      now,
      // Scheduling & Multi-language fields
      data.language || 'cs',
      data.scheduledDate ? dateToUnix(data.scheduledDate) : null,
      data.autoTranslate ? 1 : 0,
      data.parentPostId || null,
    ],
  });

  const created = await getBlogPostById(id);
  if (!created) throw new Error('Failed to create blog post');
  return created;
}

export async function updateBlogPost(
  id: string,
  data: UpdateBlogPostData
): Promise<BlogPost> {
  const now = Math.floor(Date.now() / 1000);
  const updates: string[] = [];
  const args: any[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    args.push(data.title);
  }
  if (data.slug !== undefined) {
    updates.push('slug = ?');
    args.push(data.slug);
  }
  if (data.content !== undefined) {
    updates.push('content = ?');
    args.push(data.content);
  }
  if (data.excerpt !== undefined) {
    updates.push('excerpt = ?');
    args.push(data.excerpt || null);
  }
  if (data.authorId !== undefined) {
    updates.push('author_id = ?');
    args.push(data.authorId || null);
  }
  if (data.authorName !== undefined) {
    updates.push('author_name = ?');
    args.push(data.authorName || null);
  }
  if (data.featuredImage !== undefined) {
    updates.push('featured_image = ?');
    args.push(data.featuredImage || null);
  }
  if (data.published !== undefined) {
    updates.push('published = ?');
    args.push(data.published ? 1 : 0);

    // If publishing for the first time, set published_at
    if (data.published) {
      const publishedAt = data.publishedAt ? dateToUnix(data.publishedAt) : now;
      updates.push('published_at = ?');
      args.push(publishedAt);
    }
  }
  if (data.publishedAt !== undefined && data.published !== false) {
    updates.push('published_at = ?');
    args.push(dateToUnix(data.publishedAt));
  }
  if (data.tags !== undefined) {
    updates.push('tags = ?');
    args.push(stringifyJSON(data.tags));
  }
  if (data.metaTitle !== undefined) {
    updates.push('meta_title = ?');
    args.push(data.metaTitle || null);
  }
  if (data.metaDescription !== undefined) {
    updates.push('meta_description = ?');
    args.push(data.metaDescription || null);
  }
  // Scheduling & Multi-language fields
  if (data.language !== undefined) {
    updates.push('language = ?');
    args.push(data.language);
  }
  if (data.scheduledDate !== undefined) {
    updates.push('scheduled_date = ?');
    args.push(data.scheduledDate ? dateToUnix(data.scheduledDate) : null);
  }
  if (data.autoTranslate !== undefined) {
    updates.push('auto_translate = ?');
    args.push(data.autoTranslate ? 1 : 0);
  }
  if (data.parentPostId !== undefined) {
    updates.push('parent_post_id = ?');
    args.push(data.parentPostId || null);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  updates.push('updated_at = ?');
  args.push(now);
  args.push(id);

  await turso.execute({
    sql: `UPDATE blog_posts SET ${updates.join(', ')} WHERE id = ?`,
    args,
  });

  const updated = await getBlogPostById(id);
  if (!updated) throw new Error('Blog post not found after update');
  return updated;
}

export async function deleteBlogPost(id: string): Promise<void> {
  await turso.execute({
    sql: 'DELETE FROM blog_posts WHERE id = ?',
    args: [id],
  });
}

export async function incrementBlogPostViews(id: string): Promise<void> {
  await turso.execute({
    sql: 'UPDATE blog_posts SET views = views + 1 WHERE id = ?',
    args: [id],
  });
}

// ==========================================
// Scheduling & Multi-language Functions
// ==========================================

/**
 * Get all blog posts scheduled for publication that are ready (scheduled_date <= now)
 * and not yet published
 */
export async function getScheduledPostsReadyToPublish(): Promise<BlogPost[]> {
  const now = Math.floor(Date.now() / 1000);
  const result = await turso.execute({
    sql: `SELECT * FROM blog_posts
          WHERE scheduled_date IS NOT NULL
          AND scheduled_date <= ?
          AND published = 0
          ORDER BY scheduled_date ASC`,
    args: [now],
  });
  return result.rows.map((row) => rowToBlogPost(row as unknown as BlogPostRow));
}

/**
 * Get all blog posts in a specific language
 */
export async function getBlogPostsByLanguage(language: 'cs' | 'de'): Promise<BlogPost[]> {
  const result = await turso.execute({
    sql: 'SELECT * FROM blog_posts WHERE language = ? ORDER BY created_at DESC',
    args: [language],
  });
  return result.rows.map((row) => rowToBlogPost(row as unknown as BlogPostRow));
}

/**
 * Get all published blog posts in a specific language
 */
export async function getPublishedBlogPostsByLanguage(language: 'cs' | 'de'): Promise<BlogPost[]> {
  const result = await turso.execute({
    sql: 'SELECT * FROM blog_posts WHERE language = ? AND published = 1 ORDER BY published_at DESC',
    args: [language],
  });
  return result.rows.map((row) => rowToBlogPost(row as unknown as BlogPostRow));
}

/**
 * Get all translations of a blog post (posts with the same parent_post_id or posts where this is the parent)
 */
export async function getPostTranslations(postId: string): Promise<BlogPost[]> {
  // First check if this post has a parent (it's a translation itself)
  const post = await getBlogPostById(postId);
  if (!post) return [];

  const parentId = post.parentPostId || post.id;

  // Get all posts that share this parent (excluding the requested post itself)
  const result = await turso.execute({
    sql: `SELECT * FROM blog_posts
          WHERE (parent_post_id = ? OR (id = ? AND parent_post_id IS NULL))
          AND id != ?
          ORDER BY language ASC`,
    args: [parentId, parentId, postId],
  });
  return result.rows.map((row) => rowToBlogPost(row as unknown as BlogPostRow));
}
