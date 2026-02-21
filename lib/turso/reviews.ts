// Turso Reviews Data Access Layer
import { turso, dateToUnix, unixToDate } from '../turso';
import type { Review } from '@/types/review';
import { nanoid } from 'nanoid';

interface ReviewRow {
  id: string;
  author_name: string;
  author_image: string | null;
  author_role: string | null;
  rating: number;
  text: string;
  date: number;
  source: string;
  source_url: string | null;
  published: number;
  featured: number;
  order: number;
  locale: string;
  portfolio_id: string | null;
  portfolio_title: string | null;
  created_at: number;
  updated_at: number;
}

function rowToReview(row: ReviewRow): Review {
  // Fallback to a historical date (Jan 1, 2024) if date is missing
  // NEVER use new Date() as fallback - it causes future dates in structured data!
  const fallbackDate = new Date('2024-01-01T00:00:00Z');

  return {
    id: row.id,
    authorName: row.author_name,
    authorImage: row.author_image || undefined,
    authorRole: row.author_role || undefined,
    rating: row.rating,
    text: row.text,
    date: unixToDate(row.date) || fallbackDate,
    source: row.source || 'manual',
    sourceUrl: row.source_url || undefined,
    published: Boolean(row.published),
    featured: Boolean(row.featured),
    order: row.order,
    locale: (row.locale || 'cs') as 'cs' | 'de',
    portfolioId: row.portfolio_id || undefined,
    portfolioTitle: row.portfolio_title || undefined,
    createdAt: unixToDate(row.created_at) || fallbackDate,
    updatedAt: unixToDate(row.updated_at) || fallbackDate,
  };
}

export async function getAllReviews(): Promise<Review[]> {
  const result = await turso.execute(
    'SELECT r.*, p.title as portfolio_title FROM reviews r LEFT JOIN portfolio p ON r.portfolio_id = p.id ORDER BY r."order" ASC'
  );
  return result.rows.map((row) => rowToReview(row as unknown as ReviewRow));
}

export async function getReviewById(id: string): Promise<Review | null> {
  const result = await turso.execute({
    sql: 'SELECT r.*, p.title as portfolio_title FROM reviews r LEFT JOIN portfolio p ON r.portfolio_id = p.id WHERE r.id = ?',
    args: [id],
  });

  if (result.rows.length === 0) return null;
  return rowToReview(result.rows[0] as unknown as ReviewRow);
}

export async function getPublishedReviews(locale?: 'cs' | 'de'): Promise<Review[]> {
  let sql = 'SELECT r.*, p.title as portfolio_title FROM reviews r LEFT JOIN portfolio p ON r.portfolio_id = p.id WHERE r.published = 1';
  const args: any[] = [];

  if (locale) {
    sql += ' AND r.locale = ?';
    args.push(locale);
  }

  sql += ' ORDER BY r."order" ASC';

  const result = await turso.execute(args.length > 0 ? { sql, args } : sql);
  return result.rows.map((row) => rowToReview(row as unknown as ReviewRow));
}

export async function getFeaturedReviews(): Promise<Review[]> {
  const result = await turso.execute(
    'SELECT r.*, p.title as portfolio_title FROM reviews r LEFT JOIN portfolio p ON r.portfolio_id = p.id WHERE r.published = 1 AND r.featured = 1 ORDER BY r."order" ASC'
  );
  return result.rows.map((row) => rowToReview(row as unknown as ReviewRow));
}

export async function createReview(data: {
  authorName: string;
  authorImage?: string;
  authorRole?: string;
  rating: number;
  text: string;
  date: Date;
  source: string;
  sourceUrl?: string;
  published?: boolean;
  featured?: boolean;
  locale?: 'cs' | 'de';
  portfolioId?: string;
}): Promise<Review> {
  const id = nanoid();
  const now = Math.floor(Date.now() / 1000);

  // Get max order
  const maxOrderResult = await turso.execute(
    'SELECT MAX("order") as max_order FROM reviews'
  );
  const maxOrder = (maxOrderResult.rows[0]?.max_order as number) || 0;

  await turso.execute({
    sql: `INSERT INTO reviews (
      id, author_name, author_image, author_role, rating, text,
      date, source, source_url, published, featured, "order", locale,
      portfolio_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      data.authorName,
      data.authorImage || null,
      data.authorRole || null,
      data.rating,
      data.text,
      dateToUnix(data.date),
      data.source,
      data.sourceUrl || null,
      data.published ? 1 : 0,
      data.featured ? 1 : 0,
      maxOrder + 1,
      data.locale || 'cs',
      data.portfolioId || null,
      now,
      now,
    ],
  });

  const created = await getReviewById(id);
  if (!created) throw new Error('Failed to create review');
  return created;
}

export async function updateReview(
  id: string,
  data: Partial<{
    authorName: string;
    authorImage: string;
    authorRole: string;
    rating: number;
    text: string;
    date: Date;
    source: string;
    sourceUrl: string;
    published: boolean;
    featured: boolean;
    order: number;
    portfolioId: string | null;
  }>
): Promise<Review> {
  const now = Math.floor(Date.now() / 1000);
  const updates: string[] = [];
  const args: any[] = [];

  if (data.authorName !== undefined) {
    updates.push('author_name = ?');
    args.push(data.authorName);
  }
  if (data.authorImage !== undefined) {
    updates.push('author_image = ?');
    args.push(data.authorImage || null);
  }
  if (data.authorRole !== undefined) {
    updates.push('author_role = ?');
    args.push(data.authorRole || null);
  }
  if (data.rating !== undefined) {
    updates.push('rating = ?');
    args.push(data.rating);
  }
  if (data.text !== undefined) {
    updates.push('text = ?');
    args.push(data.text);
  }
  if (data.date !== undefined) {
    updates.push('date = ?');
    args.push(dateToUnix(data.date));
  }
  if (data.source !== undefined) {
    updates.push('source = ?');
    args.push(data.source);
  }
  if (data.sourceUrl !== undefined) {
    updates.push('source_url = ?');
    args.push(data.sourceUrl || null);
  }
  if (data.published !== undefined) {
    updates.push('published = ?');
    args.push(data.published ? 1 : 0);
  }
  if (data.featured !== undefined) {
    updates.push('featured = ?');
    args.push(data.featured ? 1 : 0);
  }
  if (data.order !== undefined) {
    updates.push('"order" = ?');
    args.push(data.order);
  }
  if (data.portfolioId !== undefined) {
    updates.push('portfolio_id = ?');
    args.push(data.portfolioId || null);
  }

  updates.push('updated_at = ?');
  args.push(now);
  args.push(id);

  await turso.execute({
    sql: `UPDATE reviews SET ${updates.join(', ')} WHERE id = ?`,
    args,
  });

  const updated = await getReviewById(id);
  if (!updated) throw new Error('Review not found after update');
  return updated;
}

export async function deleteReview(id: string): Promise<void> {
  await turso.execute({
    sql: 'DELETE FROM reviews WHERE id = ?',
    args: [id],
  });
}

export async function reorderReviews(items: { id: string; order: number }[]): Promise<void> {
  if (items.length === 0) return;
  const now = Math.floor(Date.now() / 1000);
  await turso.batch(
    items.map((item) => ({
      sql: 'UPDATE reviews SET "order" = ?, updated_at = ? WHERE id = ?',
      args: [item.order, now, item.id],
    }))
  );
}
