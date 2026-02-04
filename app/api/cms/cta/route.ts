import { NextRequest, NextResponse } from 'next/server';
import { getCTASection, updateCTASection } from '@/lib/turso/cms';

export const runtime = 'nodejs';

// GET /api/cms/cta - Get CTA section
export async function GET(request: NextRequest) {
  try {
    const data = await getCTASection();
    return NextResponse.json({
      success: true,
      data: data || null
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error('Error fetching CTA section:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch CTA section' },
      { status: 500 }
    );
  }
}

// PUT /api/cms/cta - Update CTA section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.heading?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Heading is required' },
        { status: 400 }
      );
    }

    await updateCTASection({
      heading: body.heading,
      subheading: body.subheading || '',
      primaryButtonText: body.primaryButtonText || '',
      primaryButtonLink: body.primaryButtonLink || '',
      secondaryButtonText: body.secondaryButtonText || '',
      secondaryButtonLink: body.secondaryButtonLink || '',
      benefits: body.benefits || [],
      enabled: body.enabled !== undefined ? body.enabled : true,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating CTA section:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update CTA section' },
      { status: 500 }
    );
  }
}
