import { NextRequest, NextResponse } from 'next/server';
import { getFAQSection, updateFAQSection } from '@/lib/turso/cms';

export const runtime = 'nodejs';

// GET /api/cms/faq - Get FAQ section
export async function GET(request: NextRequest) {
  try {
    const data = await getFAQSection();
    return NextResponse.json({
      success: true,
      data: data || null
    });
  } catch (error: any) {
    console.error('Error fetching FAQ section:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch FAQ section' },
      { status: 500 }
    );
  }
}

// PUT /api/cms/faq - Update FAQ section
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

    await updateFAQSection({
      heading: body.heading,
      subheading: body.subheading || '',
      enabled: body.enabled !== undefined ? body.enabled : true,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating FAQ section:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update FAQ section' },
      { status: 500 }
    );
  }
}
