// Turso Services Data Access Layer
import { turso, dateToUnix, unixToDate } from '../turso';
import { nanoid } from 'nanoid';

export interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  features: string[];
  priceFrom?: number;
  priceTo?: number;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ServiceRow {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  image_url: string | null;
  features: string | null;
  price_from: number | null;
  price_to: number | null;
  order: number;
  active: number;
  created_at: number;
  updated_at: number;
}

function rowToService(row: ServiceRow): Service {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon || undefined,
    imageUrl: row.image_url || undefined,
    features: row.features ? JSON.parse(row.features) : [],
    priceFrom: row.price_from || undefined,
    priceTo: row.price_to || undefined,
    order: row.order,
    active: Boolean(row.active),
    createdAt: unixToDate(row.created_at) || new Date(),
    updatedAt: unixToDate(row.updated_at) || new Date(),
  };
}

export async function getAllServices(): Promise<Service[]> {
  const result = await turso.execute(
    'SELECT * FROM services ORDER BY "order" ASC'
  );
  return result.rows.map((row) => rowToService(row as unknown as ServiceRow));
}

export async function getServiceById(id: string): Promise<Service | null> {
  const result = await turso.execute({
    sql: 'SELECT * FROM services WHERE id = ?',
    args: [id],
  });

  if (result.rows.length === 0) return null;
  return rowToService(result.rows[0] as unknown as ServiceRow);
}

export async function getActiveServices(): Promise<Service[]> {
  const result = await turso.execute(
    'SELECT * FROM services WHERE active = 1 ORDER BY "order" ASC'
  );
  return result.rows.map((row) => rowToService(row as unknown as ServiceRow));
}

export async function createService(data: {
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  features?: string[];
  priceFrom?: number;
  priceTo?: number;
  active?: boolean;
}): Promise<Service> {
  const id = nanoid();
  const now = Math.floor(Date.now() / 1000);

  // Get max order
  const maxOrderResult = await turso.execute(
    'SELECT MAX("order") as max_order FROM services'
  );
  const maxOrder = (maxOrderResult.rows[0]?.max_order as number) || 0;

  await turso.execute({
    sql: `INSERT INTO services (
      id, title, description, icon, image_url, features,
      price_from, price_to, "order", active,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      data.title,
      data.description,
      data.icon || null,
      data.imageUrl || null,
      data.features ? JSON.stringify(data.features) : null,
      data.priceFrom || null,
      data.priceTo || null,
      maxOrder + 1,
      data.active ? 1 : 0,
      now,
      now,
    ],
  });

  const created = await getServiceById(id);
  if (!created) throw new Error('Failed to create service');
  return created;
}

export async function updateService(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    icon: string;
    imageUrl: string;
    features: string[];
    priceFrom: number;
    priceTo: number;
    active: boolean;
    order: number;
  }>
): Promise<Service> {
  const now = Math.floor(Date.now() / 1000);
  const updates: string[] = [];
  const args: any[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    args.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    args.push(data.description);
  }
  if (data.icon !== undefined) {
    updates.push('icon = ?');
    args.push(data.icon || null);
  }
  if (data.imageUrl !== undefined) {
    updates.push('image_url = ?');
    args.push(data.imageUrl || null);
  }
  if (data.features !== undefined) {
    updates.push('features = ?');
    args.push(JSON.stringify(data.features));
  }
  if (data.priceFrom !== undefined) {
    updates.push('price_from = ?');
    args.push(data.priceFrom || null);
  }
  if (data.priceTo !== undefined) {
    updates.push('price_to = ?');
    args.push(data.priceTo || null);
  }
  if (data.active !== undefined) {
    updates.push('active = ?');
    args.push(data.active ? 1 : 0);
  }
  if (data.order !== undefined) {
    updates.push('"order" = ?');
    args.push(data.order);
  }

  updates.push('updated_at = ?');
  args.push(now);
  args.push(id);

  await turso.execute({
    sql: `UPDATE services SET ${updates.join(', ')} WHERE id = ?`,
    args,
  });

  const updated = await getServiceById(id);
  if (!updated) throw new Error('Service not found after update');
  return updated;
}

export async function deleteService(id: string): Promise<void> {
  await turso.execute({
    sql: 'DELETE FROM services WHERE id = ?',
    args: [id],
  });
}

export async function reorderServices(items: { id: string; order: number }[]): Promise<void> {
  for (const item of items) {
    await turso.execute({
      sql: 'UPDATE services SET "order" = ?, updated_at = ? WHERE id = ?',
      args: [item.order, Math.floor(Date.now() / 1000), item.id],
    });
  }
}
