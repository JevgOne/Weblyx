import { NextResponse } from 'next/server';
import { getLatestSyncStatuses, getSyncHistory } from '@/lib/shoptet/sync-status';

/**
 * GET /api/shoptet/sync/status
 * Returns latest sync status for each type + recent sync history
 */
export async function GET() {
  try {
    const [latest, history] = await Promise.all([
      getLatestSyncStatuses(),
      getSyncHistory(20),
    ]);

    return NextResponse.json({
      success: true,
      data: { latest, history },
    });
  } catch (error: unknown) {
    console.error('❌ Sync status error:', error);
    return NextResponse.json({
      success: true,
      data: {
        latest: { products: null, orders: null, customers: null },
        history: [],
      },
    });
  }
}
