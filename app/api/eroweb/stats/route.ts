// EroWeb Analysis API - Statistics
// GET /api/eroweb/stats - Get analysis statistics

import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisStats } from '@/lib/turso/eroweb';

export async function GET(req: NextRequest) {
  try {
    const stats = await getAnalysisStats();

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error: any) {
    console.error('EroWeb stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
