import { turso } from '@/lib/turso';
import { startSync, completeSync, failSync } from './sync-status';

export interface ShoptetCustomer {
  id: number;
  shoptet_id: string;
  email: string;
  name: string;
  phone: string | null;
  company: string | null;
  city: string | null;
  country: string | null;
  total_orders: number;
  total_spent: number;
  currency: string;
  rfm_segment: string | null;
  first_order_date: number | null;
  last_order_date: number | null;
  created_at: number;
  updated_at: number;
  synced_at: number;
}

function isDbConfigured(): boolean {
  return !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}

async function initCustomersTable(): Promise<void> {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS shoptet_customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shoptet_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      city TEXT,
      country TEXT,
      total_orders INTEGER NOT NULL DEFAULT 0,
      total_spent REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'CZK',
      rfm_segment TEXT,
      first_order_date INTEGER,
      last_order_date INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced_at INTEGER NOT NULL
    )
  `);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_shoptet_customers_shoptet_id ON shoptet_customers(shoptet_id)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_shoptet_customers_email ON shoptet_customers(email)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_shoptet_customers_rfm ON shoptet_customers(rfm_segment)`);
}

function rowToCustomer(row: Record<string, unknown>): ShoptetCustomer {
  return {
    id: Number(row.id),
    shoptet_id: row.shoptet_id as string,
    email: row.email as string,
    name: row.name as string,
    phone: row.phone as string | null,
    company: row.company as string | null,
    city: row.city as string | null,
    country: row.country as string | null,
    total_orders: Number(row.total_orders),
    total_spent: Number(row.total_spent),
    currency: (row.currency as string) || 'CZK',
    rfm_segment: row.rfm_segment as string | null,
    first_order_date: row.first_order_date ? Number(row.first_order_date) : null,
    last_order_date: row.last_order_date ? Number(row.last_order_date) : null,
    created_at: Number(row.created_at),
    updated_at: Number(row.updated_at),
    synced_at: Number(row.synced_at),
  };
}

export async function upsertCustomer(customer: {
  shoptet_id: string;
  email: string;
  name: string;
  phone?: string | null;
  company?: string | null;
  city?: string | null;
  country?: string | null;
  total_orders?: number;
  total_spent?: number;
  currency?: string;
  rfm_segment?: string | null;
  first_order_date?: number | null;
  last_order_date?: number | null;
}): Promise<void> {
  await initCustomersTable();
  const now = Math.floor(Date.now() / 1000);
  await turso.execute({
    sql: `INSERT INTO shoptet_customers (shoptet_id, email, name, phone, company, city, country, total_orders, total_spent, currency, rfm_segment, first_order_date, last_order_date, created_at, updated_at, synced_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(shoptet_id) DO UPDATE SET
            email = excluded.email,
            name = excluded.name,
            phone = excluded.phone,
            company = excluded.company,
            city = excluded.city,
            country = excluded.country,
            total_orders = excluded.total_orders,
            total_spent = excluded.total_spent,
            currency = excluded.currency,
            rfm_segment = excluded.rfm_segment,
            first_order_date = excluded.first_order_date,
            last_order_date = excluded.last_order_date,
            updated_at = excluded.updated_at,
            synced_at = excluded.synced_at`,
    args: [
      customer.shoptet_id,
      customer.email,
      customer.name,
      customer.phone ?? null,
      customer.company ?? null,
      customer.city ?? null,
      customer.country ?? null,
      customer.total_orders ?? 0,
      customer.total_spent ?? 0,
      customer.currency ?? 'CZK',
      customer.rfm_segment ?? null,
      customer.first_order_date ?? null,
      customer.last_order_date ?? null,
      now,
      now,
      now,
    ],
  });
}

export interface CustomersQueryParams {
  limit?: number;
  offset?: number;
  search?: string;
  rfmSegment?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function getCustomers(params: CustomersQueryParams = {}): Promise<{ items: ShoptetCustomer[]; total: number }> {
  await initCustomersTable();

  const { limit = 20, offset = 0, search, rfmSegment, sortBy = 'total_spent', sortOrder = 'desc' } = params;

  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (search) {
    conditions.push(`(name LIKE ? OR email LIKE ? OR company LIKE ?)`);
    args.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (rfmSegment) {
    conditions.push(`rfm_segment = ?`);
    args.push(rfmSegment);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = ['name', 'email', 'total_orders', 'total_spent', 'last_order_date', 'created_at'];
  const safeSort = allowedSortColumns.includes(sortBy) ? sortBy : 'total_spent';
  const safeOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const countResult = await turso.execute({
    sql: `SELECT COUNT(*) as total FROM shoptet_customers ${whereClause}`,
    args,
  });
  const total = Number((countResult.rows[0] as unknown as Record<string, unknown>).total);

  const rows = await turso.execute({
    sql: `SELECT * FROM shoptet_customers ${whereClause} ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  });

  return {
    items: rows.rows.map((row) => rowToCustomer(row as unknown as Record<string, unknown>)),
    total,
  };
}

export async function enrichCustomerAggregates(): Promise<number> {
  await initCustomersTable();
  // Update total_orders and total_spent from the orders table
  const result = await turso.execute(`
    UPDATE shoptet_customers SET
      total_orders = COALESCE((
        SELECT COUNT(*) FROM shoptet_orders WHERE shoptet_orders.customer_email = shoptet_customers.email
      ), 0),
      total_spent = COALESCE((
        SELECT SUM(total_price) FROM shoptet_orders WHERE shoptet_orders.customer_email = shoptet_customers.email
      ), 0),
      first_order_date = (
        SELECT MIN(order_date) FROM shoptet_orders WHERE shoptet_orders.customer_email = shoptet_customers.email
      ),
      last_order_date = (
        SELECT MAX(order_date) FROM shoptet_orders WHERE shoptet_orders.customer_email = shoptet_customers.email
      ),
      rfm_segment = CASE
        WHEN COALESCE((SELECT COUNT(*) FROM shoptet_orders WHERE shoptet_orders.customer_email = shoptet_customers.email), 0) >= 5
          AND COALESCE((SELECT MAX(order_date) FROM shoptet_orders WHERE shoptet_orders.customer_email = shoptet_customers.email), 0) > (CAST(strftime('%s', 'now') AS INTEGER) - 7776000)
          THEN 'champion'
        WHEN COALESCE((SELECT COUNT(*) FROM shoptet_orders WHERE shoptet_orders.customer_email = shoptet_customers.email), 0) >= 3
          THEN 'loyal'
        WHEN COALESCE((SELECT MAX(order_date) FROM shoptet_orders WHERE shoptet_orders.customer_email = shoptet_customers.email), 0) > (CAST(strftime('%s', 'now') AS INTEGER) - 2592000)
          THEN 'recent'
        WHEN COALESCE((SELECT MAX(order_date) FROM shoptet_orders WHERE shoptet_orders.customer_email = shoptet_customers.email), 0) < (CAST(strftime('%s', 'now') AS INTEGER) - 15552000)
          AND COALESCE((SELECT COUNT(*) FROM shoptet_orders WHERE shoptet_orders.customer_email = shoptet_customers.email), 0) > 0
          THEN 'at_risk'
        WHEN COALESCE((SELECT COUNT(*) FROM shoptet_orders WHERE shoptet_orders.customer_email = shoptet_customers.email), 0) = 1
          THEN 'new'
        ELSE 'other'
      END,
      updated_at = CAST(strftime('%s', 'now') AS INTEGER)
  `);
  return result.rowsAffected;
}

export async function getRfmSegments(): Promise<string[]> {
  await initCustomersTable();
  const rows = await turso.execute(`SELECT DISTINCT rfm_segment FROM shoptet_customers WHERE rfm_segment IS NOT NULL ORDER BY rfm_segment`);
  return rows.rows.map((row) => (row as unknown as Record<string, unknown>).rfm_segment as string);
}

export async function syncCustomers(apiCustomers: Array<Record<string, unknown>>): Promise<number> {
  if (!isDbConfigured()) {
    console.log('⚠️ DB not configured, skipping customers sync');
    return 0;
  }

  const syncId = await startSync('customers');
  try {
    let count = 0;
    for (const c of apiCustomers) {
      const addr = (c.billingAddress || c.address || {}) as Record<string, unknown>;
      await upsertCustomer({
        shoptet_id: String(c.guid || c.id || ''),
        email: String(c.email || addr.email || ''),
        name: addr.fullName ? String(addr.fullName) : (c.name ? String(c.name) : String(c.email || '')),
        phone: addr.phone ? String(addr.phone) : (c.phone ? String(c.phone) : null),
        company: addr.company ? String(addr.company) : (c.company ? String(c.company) : null),
        city: addr.city ? String(addr.city) : null,
        country: addr.countryCode ? String(addr.countryCode) : null,
      });
      count++;
    }
    // Enrich with order data after sync
    await enrichCustomerAggregates();
    await completeSync(syncId, count);
    return count;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await failSync(syncId, message);
    throw error;
  }
}
