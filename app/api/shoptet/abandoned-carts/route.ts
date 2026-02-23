import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';

export interface AbandonedCart {
  id: number;
  shoptet_id: string;
  customer_email: string | null;
  customer_name: string | null;
  total_price: number;
  currency: string;
  items_count: number;
  recovered: number;
  created_at: number;
  updated_at: number;
}

async function initAbandonedCartsTable(): Promise<void> {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS shoptet_abandoned_carts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shoptet_id TEXT UNIQUE NOT NULL,
      customer_email TEXT,
      customer_name TEXT,
      total_price REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'CZK',
      items_count INTEGER NOT NULL DEFAULT 0,
      recovered INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);
}

function rowToCart(row: Record<string, unknown>): AbandonedCart {
  return {
    id: Number(row.id),
    shoptet_id: row.shoptet_id as string,
    customer_email: row.customer_email as string | null,
    customer_name: row.customer_name as string | null,
    total_price: Number(row.total_price),
    currency: (row.currency as string) || 'CZK',
    items_count: Number(row.items_count),
    recovered: Number(row.recovered),
    created_at: Number(row.created_at),
    updated_at: Number(row.updated_at),
  };
}

/**
 * GET /api/shoptet/abandoned-carts
 * Returns paginated, filtered abandoned carts list
 * Query params: limit, offset, recovered, search
 */
export async function GET(request: NextRequest) {
  try {
    await initAbandonedCartsTable();
    const sp = request.nextUrl.searchParams;
    const limit = Number(sp.get('limit')) || 20;
    const offset = Number(sp.get('offset')) || 0;
    const recovered = sp.get('recovered');
    const search = sp.get('search');

    const conditions: string[] = [];
    const args: (string | number)[] = [];

    if (recovered === '1') {
      conditions.push(`recovered = 1`);
    } else if (recovered === '0') {
      conditions.push(`recovered = 0`);
    }
    if (search) {
      conditions.push(`(customer_email LIKE ? OR customer_name LIKE ?)`);
      args.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await turso.execute({
      sql: `SELECT COUNT(*) as total FROM shoptet_abandoned_carts ${whereClause}`,
      args,
    });
    const total = Number((countResult.rows[0] as unknown as Record<string, unknown>).total);

    const rows = await turso.execute({
      sql: `SELECT * FROM shoptet_abandoned_carts ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    return NextResponse.json({
      success: true,
      data: {
        items: rows.rows.map((row) => rowToCart(row as unknown as Record<string, unknown>)),
        total,
      },
    });
  } catch (error: unknown) {
    console.error('❌ Abandoned carts API error:', error);
    return NextResponse.json({
      success: true,
      data: { items: [], total: 0 },
    });
  }
}
