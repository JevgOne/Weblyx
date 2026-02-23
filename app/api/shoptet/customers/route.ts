import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, getRfmSegments } from '@/lib/shoptet/customers';

/**
 * GET /api/shoptet/customers
 * Returns paginated, filtered customers list
 * Query params: limit, offset, search, rfmSegment, sortBy, sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;

    const [result, segments] = await Promise.all([
      getCustomers({
        limit: Number(sp.get('limit')) || 20,
        offset: Number(sp.get('offset')) || 0,
        search: sp.get('search') || undefined,
        rfmSegment: sp.get('rfmSegment') || undefined,
        sortBy: sp.get('sortBy') || undefined,
        sortOrder: (sp.get('sortOrder') as 'asc' | 'desc') || undefined,
      }),
      getRfmSegments(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: result.items,
        total: result.total,
        segments,
      },
    });
  } catch (error: unknown) {
    console.error('❌ Customers API error:', error);
    return NextResponse.json({
      success: true,
      data: { items: [], total: 0, segments: [] },
    });
  }
}
