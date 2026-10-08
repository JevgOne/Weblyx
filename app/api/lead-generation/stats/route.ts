import { NextResponse } from 'next/server';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';
import { getLeadGenerationStats } from '@/lib/turso/lead-generation';

/**
 * GET /api/lead-generation/stats
 * Get lead generation statistics
 */
export async function GET() {
  try {
    // Leads are other companies' contact details — admin only.
    const authUser = await getAuthUser();
    if (!authUser) return unauthorizedResponse();

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
        error: 'Failed to fetch stats',
      },
      { status: 500 }
    );
  }
}
