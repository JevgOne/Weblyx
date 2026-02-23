import { turso } from '@/lib/turso';
import { startSync, completeSync, failSync } from './sync-status';

export interface ShoptetProduct {
  id: number;
  shoptet_id: string;
  name: string;
  sku: string | null;
  price: number;
  price_before_discount: number | null;
  currency: string;
  stock: number;
  brand: string | null;
  category: string | null;
  image_url: string | null;
  url: string | null;
  visible: number;
  created_at: number;
  updated_at: number;
  synced_at: number;
}

function isDbConfigured(): boolean {
  return !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}

async function initProductsTable(): Promise<void> {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS shoptet_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shoptet_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      sku TEXT,
      price REAL NOT NULL DEFAULT 0,
      price_before_discount REAL,
      currency TEXT NOT NULL DEFAULT 'CZK',
      stock INTEGER NOT NULL DEFAULT 0,
      brand TEXT,
      category TEXT,
      image_url TEXT,
      url TEXT,
      visible INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced_at INTEGER NOT NULL
    )
  `);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_shoptet_products_shoptet_id ON shoptet_products(shoptet_id)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_shoptet_products_sku ON shoptet_products(sku)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_shoptet_products_brand ON shoptet_products(brand)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_shoptet_products_category ON shoptet_products(category)`);
}

function rowToProduct(row: Record<string, unknown>): ShoptetProduct {
  return {
    id: Number(row.id),
    shoptet_id: row.shoptet_id as string,
    name: row.name as string,
    sku: row.sku as string | null,
    price: Number(row.price),
    price_before_discount: row.price_before_discount ? Number(row.price_before_discount) : null,
    currency: (row.currency as string) || 'CZK',
    stock: Number(row.stock),
    brand: row.brand as string | null,
    category: row.category as string | null,
    image_url: row.image_url as string | null,
    url: row.url as string | null,
    visible: Number(row.visible),
    created_at: Number(row.created_at),
    updated_at: Number(row.updated_at),
    synced_at: Number(row.synced_at),
  };
}

export async function upsertProduct(product: {
  shoptet_id: string;
  name: string;
  sku?: string | null;
  price: number;
  price_before_discount?: number | null;
  currency?: string;
  stock?: number;
  brand?: string | null;
  category?: string | null;
  image_url?: string | null;
  url?: string | null;
  visible?: number;
}): Promise<void> {
  await initProductsTable();
  const now = Math.floor(Date.now() / 1000);
  await turso.execute({
    sql: `INSERT INTO shoptet_products (shoptet_id, name, sku, price, price_before_discount, currency, stock, brand, category, image_url, url, visible, created_at, updated_at, synced_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(shoptet_id) DO UPDATE SET
            name = excluded.name,
            sku = excluded.sku,
            price = excluded.price,
            price_before_discount = excluded.price_before_discount,
            currency = excluded.currency,
            stock = excluded.stock,
            brand = excluded.brand,
            category = excluded.category,
            image_url = excluded.image_url,
            url = excluded.url,
            visible = excluded.visible,
            updated_at = excluded.updated_at,
            synced_at = excluded.synced_at`,
    args: [
      product.shoptet_id,
      product.name,
      product.sku ?? null,
      product.price,
      product.price_before_discount ?? null,
      product.currency ?? 'CZK',
      product.stock ?? 0,
      product.brand ?? null,
      product.category ?? null,
      product.image_url ?? null,
      product.url ?? null,
      product.visible ?? 1,
      now,
      now,
      now,
    ],
  });
}

export interface ProductsQueryParams {
  limit?: number;
  offset?: number;
  search?: string;
  brand?: string;
  category?: string;
  stock?: 'inStock' | 'outOfStock' | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function getProducts(params: ProductsQueryParams = {}): Promise<{ items: ShoptetProduct[]; total: number }> {
  await initProductsTable();

  const { limit = 20, offset = 0, search, brand, category, stock, sortBy = 'updated_at', sortOrder = 'desc' } = params;

  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (search) {
    conditions.push(`(name LIKE ? OR sku LIKE ?)`);
    args.push(`%${search}%`, `%${search}%`);
  }
  if (brand) {
    conditions.push(`brand = ?`);
    args.push(brand);
  }
  if (category) {
    conditions.push(`category = ?`);
    args.push(category);
  }
  if (stock === 'inStock') {
    conditions.push(`stock > 0`);
  } else if (stock === 'outOfStock') {
    conditions.push(`stock = 0`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = ['name', 'price', 'stock', 'updated_at', 'created_at'];
  const safeSort = allowedSortColumns.includes(sortBy) ? sortBy : 'updated_at';
  const safeOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const countResult = await turso.execute({
    sql: `SELECT COUNT(*) as total FROM shoptet_products ${whereClause}`,
    args,
  });
  const total = Number((countResult.rows[0] as unknown as Record<string, unknown>).total);

  const rows = await turso.execute({
    sql: `SELECT * FROM shoptet_products ${whereClause} ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  });

  return {
    items: rows.rows.map((row) => rowToProduct(row as unknown as Record<string, unknown>)),
    total,
  };
}

export async function getProductBrands(): Promise<string[]> {
  await initProductsTable();
  const rows = await turso.execute(`SELECT DISTINCT brand FROM shoptet_products WHERE brand IS NOT NULL ORDER BY brand`);
  return rows.rows.map((row) => (row as unknown as Record<string, unknown>).brand as string);
}

export async function getProductCategories(): Promise<string[]> {
  await initProductsTable();
  const rows = await turso.execute(`SELECT DISTINCT category FROM shoptet_products WHERE category IS NOT NULL ORDER BY category`);
  return rows.rows.map((row) => (row as unknown as Record<string, unknown>).category as string);
}

export async function syncProducts(apiProducts: Array<Record<string, unknown>>): Promise<number> {
  if (!isDbConfigured()) {
    console.log('⚠️ DB not configured, skipping products sync');
    return 0;
  }

  const syncId = await startSync('products');
  try {
    let count = 0;
    for (const p of apiProducts) {
      const stockObj = p.stock as Record<string, unknown> | undefined;
      const defaultCat = p.defaultCategory as Record<string, unknown> | undefined;
      const imageObj = p.image as Record<string, unknown> | undefined;

      await upsertProduct({
        shoptet_id: String(p.guid || p.id || ''),
        name: String(p.name || ''),
        sku: p.code ? String(p.code) : null,
        price: Number(p.price || p.includingVat || 0),
        price_before_discount: p.priceBeforeDiscount ? Number(p.priceBeforeDiscount) : null,
        currency: String(p.currency || 'CZK'),
        stock: Number(stockObj?.amount ?? p.amountInStock ?? 0),
        brand: p.brand ? String(p.brand) : null,
        category: defaultCat?.name ? String(defaultCat.name) : (p.category ? String(p.category) : null),
        image_url: imageObj?.src ? String(imageObj.src) : (p.imageUrl ? String(p.imageUrl) : null),
        url: p.url ? String(p.url) : null,
        visible: p.visibility === false || p.visible === 0 ? 0 : 1,
      });
      count++;
    }
    await completeSync(syncId, count);
    return count;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await failSync(syncId, message);
    throw error;
  }
}
