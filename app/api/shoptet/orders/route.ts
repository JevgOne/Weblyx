import { NextRequest, NextResponse } from 'next/server';
import { getOrders, getOrderStatuses } from '@/lib/shoptet/orders';

/**
 * GET /api/shoptet/orders
 * Returns paginated, filtered orders list
 * Query params: limit, offset, search, status, dateFrom, dateTo, sortBy, sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;

    const [result, statuses] = await Promise.all([
      getOrders({
        limit: Number(sp.get('limit')) || 20,
        offset: Number(sp.get('offset')) || 0,
        search: sp.get('search') || undefined,
        status: sp.get('status') || undefined,
        dateFrom: sp.get('dateFrom') || undefined,
        dateTo: sp.get('dateTo') || undefined,
        sortBy: sp.get('sortBy') || undefined,
        sortOrder: (sp.get('sortOrder') as 'asc' | 'desc') || undefined,
      }),
      getOrderStatuses(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: result.items,
        total: result.total,
        statuses,
      },
    });
  } catch (error: unknown) {
    console.error('❌ Orders API error:', error);
    return NextResponse.json({
      success: true,
      data: { items: [], total: 0, statuses: [] },
    });
  }
}
