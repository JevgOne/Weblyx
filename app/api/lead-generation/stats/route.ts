import { NextResponse } from 'next/server';
import { getLeadGenerationStats } from '@/lib/turso/lead-generation';

/**
 * GET /api/lead-generation/stats
 * Get lead generation statistics
 */
export async function GET() {
  try {
    const stats = await getLeadGenerationStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('GET /api/lead-generation/stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch stats',
      },
      { status: 500 }
    );
  }
}
