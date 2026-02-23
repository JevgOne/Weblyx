import { turso } from '@/lib/turso';
import { startSync, completeSync, failSync } from './sync-status';

export interface ShoptetOrder {
  id: number;
  shoptet_id: string;
  order_number: string;
  status: string;
  status_id: number | null;
  customer_email: string | null;
  customer_name: string | null;
  total_price: number;
  currency: string;
  payment_method: string | null;
  shipping_method: string | null;
  items_count: number;
  note: string | null;
  order_date: number;
  created_at: number;
  updated_at: number;
  synced_at: number;
}

function isDbConfigured(): boolean {
  return !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}

async function initOrdersTable(): Promise<void> {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS shoptet_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shoptet_id TEXT UNIQUE NOT NULL,
      order_number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT '',
      status_id INTEGER,
      customer_email TEXT,
      customer_name TEXT,
      total_price REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'CZK',
      payment_method TEXT,
      shipping_method TEXT,
      items_count INTEGER NOT NULL DEFAULT 0,
      note TEXT,
      order_date INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced_at INTEGER NOT NULL
    )
  `);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_shoptet_orders_shoptet_id ON shoptet_orders(shoptet_id)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_shoptet_orders_status ON shoptet_orders(status)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_shoptet_orders_order_date ON shoptet_orders(order_date)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_shoptet_orders_customer_email ON shoptet_orders(customer_email)`);
}

function rowToOrder(row: Record<string, unknown>): ShoptetOrder {
  return {
    id: Number(row.id),
    shoptet_id: row.shoptet_id as string,
    order_number: row.order_number as string,
    status: row.status as string,
    status_id: row.status_id != null ? Number(row.status_id) : null,
    customer_email: row.customer_email as string | null,
    customer_name: row.customer_name as string | null,
    total_price: Number(row.total_price),
    currency: (row.currency as string) || 'CZK',
    payment_method: row.payment_method as string | null,
    shipping_method: row.shipping_method as string | null,
    items_count: Number(row.items_count),
    note: row.note as string | null,
    order_date: Number(row.order_date),
    created_at: Number(row.created_at),
    updated_at: Number(row.updated_at),
    synced_at: Number(row.synced_at),
  };
}

export async function upsertOrder(order: {
  shoptet_id: string;
  order_number: string;
  status?: string;
  status_id?: number | null;
  customer_email?: string | null;
  customer_name?: string | null;
  total_price: number;
  currency?: string;
  payment_method?: string | null;
  shipping_method?: string | null;
  items_count?: number;
  note?: string | null;
  order_date: number;
}): Promise<void> {
  await initOrdersTable();
  const now = Math.floor(Date.now() / 1000);
  await turso.execute({
    sql: `INSERT INTO shoptet_orders (shoptet_id, order_number, status, status_id, customer_email, customer_name, total_price, currency, payment_method, shipping_method, items_count, note, order_date, created_at, updated_at, synced_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(shoptet_id) DO UPDATE SET
            order_number = excluded.order_number,
            status = excluded.status,
            status_id = excluded.status_id,
            customer_email = excluded.customer_email,
            customer_name = excluded.customer_name,
            total_price = excluded.total_price,
            currency = excluded.currency,
            payment_method = excluded.payment_method,
            shipping_method = excluded.shipping_method,
            items_count = excluded.items_count,
            note = excluded.note,
            updated_at = excluded.updated_at,
            synced_at = excluded.synced_at`,
    args: [
      order.shoptet_id,
      order.order_number,
      order.status ?? '',
      order.status_id ?? null,
      order.customer_email ?? null,
      order.customer_name ?? null,
      order.total_price,
      order.currency ?? 'CZK',
      order.payment_method ?? null,
      order.shipping_method ?? null,
      order.items_count ?? 0,
      order.note ?? null,
      order.order_date,
      now,
      now,
      now,
    ],
  });
}

export interface OrdersQueryParams {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function getOrders(params: OrdersQueryParams = {}): Promise<{ items: ShoptetOrder[]; total: number }> {
  await initOrdersTable();

  const { limit = 20, offset = 0, search, status, dateFrom, dateTo, sortBy = 'order_date', sortOrder = 'desc' } = params;

  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (search) {
    conditions.push(`(order_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ?)`);
    args.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (status) {
    conditions.push(`status = ?`);
    args.push(status);
  }
  if (dateFrom) {
    const fromTs = Math.floor(new Date(dateFrom).getTime() / 1000);
    conditions.push(`order_date >= ?`);
    args.push(fromTs);
  }
  if (dateTo) {
    const toTs = Math.floor(new Date(dateTo).getTime() / 1000) + 86400;
    conditions.push(`order_date < ?`);
    args.push(toTs);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = ['order_number', 'total_price', 'order_date', 'status', 'customer_name'];
  const safeSort = allowedSortColumns.includes(sortBy) ? sortBy : 'order_date';
  const safeOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const countResult = await turso.execute({
    sql: `SELECT COUNT(*) as total FROM shoptet_orders ${whereClause}`,
    args,
  });
  const total = Number((countResult.rows[0] as unknown as Record<string, unknown>).total);

  const rows = await turso.execute({
    sql: `SELECT * FROM shoptet_orders ${whereClause} ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  });

  return {
    items: rows.rows.map((row) => rowToOrder(row as unknown as Record<string, unknown>)),
    total,
  };
}

export async function getOrderStatuses(): Promise<string[]> {
  await initOrdersTable();
  const rows = await turso.execute(`SELECT DISTINCT status FROM shoptet_orders WHERE status != '' ORDER BY status`);
  return rows.rows.map((row) => (row as unknown as Record<string, unknown>).status as string);
}

export async function syncOrders(apiOrders: Array<Record<string, unknown>>): Promise<number> {
  if (!isDbConfigured()) {
    console.log('⚠️ DB not configured, skipping orders sync');
    return 0;
  }

  const syncId = await startSync('orders');
  try {
    let count = 0;
    for (const o of apiOrders) {
      const orderDate = o.creationTime || o.date || o.createdAt;
      const orderDateTs = orderDate ? Math.floor(new Date(String(orderDate)).getTime() / 1000) : Math.floor(Date.now() / 1000);
      const statusObj = o.status as Record<string, unknown> | undefined;
      const billingAddr = o.billingAddress as Record<string, unknown> | undefined;
      const priceObj = o.price as Record<string, unknown> | undefined;
      const paymentObj = o.paymentMethod as Record<string, unknown> | undefined;
      const shippingObj = o.shipping as Record<string, unknown> | undefined;

      await upsertOrder({
        shoptet_id: String(o.guid || o.code || o.id || ''),
        order_number: String(o.code || o.orderNumber || o.id || ''),
        status: statusObj?.name ? String(statusObj.name) : (o.statusName ? String(o.statusName) : ''),
        status_id: statusObj?.id != null ? Number(statusObj.id) : (o.statusId != null ? Number(o.statusId) : null),
        customer_email: o.email ? String(o.email) : (billingAddr?.email ? String(billingAddr.email) : null),
        customer_name: billingAddr?.fullName ? String(billingAddr.fullName) : (o.customerName ? String(o.customerName) : null),
        total_price: Number(priceObj?.withVat ?? o.totalPrice ?? o.priceWithVat ?? 0),
        currency: String(priceObj?.currencyCode ?? o.currency ?? 'CZK'),
        payment_method: paymentObj?.name ? String(paymentObj.name) : (o.paymentMethodName ? String(o.paymentMethodName) : null),
        shipping_method: shippingObj?.name ? String(shippingObj.name) : (o.shippingMethodName ? String(o.shippingMethodName) : null),
        items_count: Array.isArray(o.items) ? o.items.length : Number(o.itemsCount ?? 0),
        note: o.customerRemark ? String(o.customerRemark) : null,
        order_date: orderDateTs,
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
