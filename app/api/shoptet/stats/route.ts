import { NextResponse } from 'next/server';
import { turso } from '@/lib/turso';

/**
 * GET /api/shoptet/stats
 * Returns summary statistics: product count, order count, customer count, total revenue
 */
export async function GET() {
  try {
    const [productsResult, ordersResult, customersResult, revenueResult] = await Promise.all([
      turso.execute(`SELECT COUNT(*) as count FROM shoptet_products`).catch(() => ({ rows: [{ count: 0 }] })),
      turso.execute(`SELECT COUNT(*) as count FROM shoptet_orders`).catch(() => ({ rows: [{ count: 0 }] })),
      turso.execute(`SELECT COUNT(*) as count FROM shoptet_customers`).catch(() => ({ rows: [{ count: 0 }] })),
      turso.execute(`SELECT COALESCE(SUM(total_price), 0) as total FROM shoptet_orders`).catch(() => ({ rows: [{ total: 0 }] })),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products: Number((productsResult.rows[0] as unknown as Record<string, unknown>).count),
        orders: Number((ordersResult.rows[0] as unknown as Record<string, unknown>).count),
        customers: Number((customersResult.rows[0] as unknown as Record<string, unknown>).count),
        revenue: Number((revenueResult.rows[0] as unknown as Record<string, unknown>).total),
      },
    });
  } catch (error: unknown) {
    console.error('❌ Shoptet stats error:', error);
    return NextResponse.json({
      success: true,
      data: { products: 0, orders: 0, customers: 0, revenue: 0 },
    });
  }
}
