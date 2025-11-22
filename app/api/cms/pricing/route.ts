import { NextRequest, NextResponse } from 'next/server';
import { getAllPricingTiers } from '@/lib/turso/cms';

export const runtime = 'nodejs';

// GET /api/cms/pricing - Get all pricing tiers
export async function GET(request: NextRequest) {
  try {
    const data = await getAllPricingTiers();
    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error: any) {
    console.error('Error fetching pricing tiers:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch pricing tiers' },
      { status: 500 }
    );
  }
}
