// Turso Portfolio Data Access Layer
import { turso, dateToUnix, unixToDate, parseJSON, stringifyJSON } from '../turso';
import type { PortfolioItem } from '@/types/portfolio';
import { nanoid } from 'nanoid';

interface PortfolioRow {
  id: string;
  title: string;
  description: string | null;
  title_de: string | null;
  description_de: string | null;
  client_name: string | null;
  project_url: string | null;
  image_url: string | null;
  before_image_url: string | null;
  technologies: string | null;
  category: string | null;
  pagespeed_mobile: number | null;
  pagespeed_desktop: number | null;
  load_time_before: number | null;
  load_time_after: number | null;
  featured: number;
  published: number;
  order: number;
  created_at: number;
  updated_at: number;
}

function rowToPortfolio(row: PortfolioRow, locale?: string): PortfolioItem {
  const useDE = locale === 'de';
  return {
    id: row.id,
    title: (useDE && row.title_de) ? row.title_de : row.title,
    description: (useDE && row.description_de) ? row.description_de : (row.description || ''),
    clientName: row.client_name || undefined,
    projectUrl: row.project_url || '',
    imageUrl: row.image_url || '',
    beforeImageUrl: row.before_image_url || undefined,
    technologies: parseJSON<string[]>(row.technologies) || [],
    category: row.category || '',
    pagespeedMobile: row.pagespeed_mobile || undefined,
    pagespeedDesktop: row.pagespeed_desktop || undefined,
    loadTimeBefore: row.load_time_before || undefined,
    loadTimeAfter: row.load_time_after || undefined,
    featured: Boolean(row.featured),
    published: Boolean(row.published),
    order: row.order,
    createdAt: unixToDate(row.created_at) || new Date(),
    updatedAt: unixToDate(row.updated_at) || new Date(),
  };
}

export async function getAllPortfolio(locale?: string): Promise<PortfolioItem[]> {
  const result = await turso.execute(
    'SELECT * FROM portfolio ORDER BY "order" ASC'
  );
  return result.rows.map((row) => rowToPortfolio(row as unknown as PortfolioRow, locale));
}

export async function getPortfolioById(id: string): Promise<PortfolioItem | null> {
  const result = await turso.execute({
    sql: 'SELECT * FROM portfolio WHERE id = ?',
    args: [id],
  });

  if (result.rows.length === 0) return null;
  return rowToPortfolio(result.rows[0] as unknown as PortfolioRow);
}

export async function getPublishedPortfolio(locale?: string): Promise<PortfolioItem[]> {
  const result = await turso.execute(
    'SELECT * FROM portfolio WHERE published = 1 ORDER BY "order" ASC'
  );
  return result.rows.map((row) => rowToPortfolio(row as unknown as PortfolioRow, locale));
}

export async function createPortfolio(data: {
  title: string;
  description?: string;
  clientName?: string;
  projectUrl?: string;
  imageUrl: string;
  technologies: string[];
  category: string;
  featured?: boolean;
  published?: boolean;
}): Promise<PortfolioItem> {
  const id = nanoid();
  const now = Math.floor(Date.now() / 1000);

  // Get max order
  const maxOrderResult = await turso.execute(
    'SELECT MAX("order") as max_order FROM portfolio'
  );
  const maxOrder = (maxOrderResult.rows[0]?.max_order as number) || 0;

  await turso.execute({
    sql: `INSERT INTO portfolio (
      id, title, description, client_name, project_url, image_url,
      technologies, category, featured, published, "order",
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      data.title,
      data.description || null,
      data.clientName || null,
      data.projectUrl || null,
      data.imageUrl,
      stringifyJSON(data.technologies),
      data.category,
      data.featured ? 1 : 0,
      data.published ? 1 : 0,
      maxOrder + 1,
      now,
      now,
    ],
  });

  const created = await getPortfolioById(id);
  if (!created) throw new Error('Failed to create portfolio item');
  return created;
}

export async function updatePortfolio(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    clientName: string;
    projectUrl: string;
    imageUrl: string;
    technologies: string[];
    category: string;
    featured: boolean;
    published: boolean;
    order: number;
  }>
): Promise<PortfolioItem> {
  const now = Math.floor(Date.now() / 1000);
  const updates: string[] = [];
  const args: any[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    args.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    args.push(data.description || null);
  }
  if (data.clientName !== undefined) {
    updates.push('client_name = ?');
    args.push(data.clientName || null);
  }
  if (data.projectUrl !== undefined) {
    updates.push('project_url = ?');
    args.push(data.projectUrl || null);
  }
  if (data.imageUrl !== undefined) {
    updates.push('image_url = ?');
    args.push(data.imageUrl);
  }
  if (data.technologies !== undefined) {
    updates.push('technologies = ?');
    args.push(stringifyJSON(data.technologies));
  }
  if (data.category !== undefined) {
    updates.push('category = ?');
    args.push(data.category);
  }
  if (data.featured !== undefined) {
    updates.push('featured = ?');
    args.push(data.featured ? 1 : 0);
  }
  if (data.published !== undefined) {
    updates.push('published = ?');
    args.push(data.published ? 1 : 0);
  }
  if (data.order !== undefined) {
    updates.push('"order" = ?');
    args.push(data.order);
  }

  updates.push('updated_at = ?');
  args.push(now);
  args.push(id);

  await turso.execute({
    sql: `UPDATE portfolio SET ${updates.join(', ')} WHERE id = ?`,
    args,
  });

  const updated = await getPortfolioById(id);
  if (!updated) throw new Error('Portfolio item not found after update');
  return updated;
}

export async function deletePortfolio(id: string): Promise<void> {
  await turso.execute({
    sql: 'DELETE FROM portfolio WHERE id = ?',
    args: [id],
  });
}

export async function reorderPortfolio(items: { id: string; order: number }[]): Promise<void> {
  for (const item of items) {
    await turso.execute({
      sql: 'UPDATE portfolio SET "order" = ?, updated_at = ? WHERE id = ?',
      args: [item.order, Math.floor(Date.now() / 1000), item.id],
    });
  }
}
