import { NextRequest, NextResponse } from 'next/server';
import { getHomepageSections, updateHeroSection } from '@/lib/turso/cms';

export const runtime = 'nodejs';

// GET /api/cms/hero - Get hero section
export async function GET(request: NextRequest) {
  try {
    const data = await getHomepageSections();
    return NextResponse.json({
      success: true,
      data: data?.hero || null
    });
  } catch (error: any) {
    console.error('Error fetching hero section:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch hero section' },
      { status: 500 }
    );
  }
}

// PUT /api/cms/hero - Update hero section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    await updateHeroSection({
      headline: body.headline || '',
      subheadline: body.subheadline || '',
      ctaText: body.ctaText || '',
      ctaLink: body.ctaLink || '',
      backgroundImage: body.backgroundImage || '',
      enabled: body.enabled !== undefined ? body.enabled : true,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating hero section:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update hero section' },
      { status: 500 }
    );
  }
}
