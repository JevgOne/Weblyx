import { NextRequest, NextResponse } from 'next/server';
import { getProcessSection, updateProcessSection } from '@/lib/turso/cms';

export const runtime = 'nodejs';

// GET /api/cms/process - Get process section
export async function GET(request: NextRequest) {
  try {
    const data = await getProcessSection();
    return NextResponse.json({
      success: true,
      data: data || null
    });
  } catch (error: any) {
    console.error('Error fetching process section:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch process section' },
      { status: 500 }
    );
  }
}

// PUT /api/cms/process - Update process section
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

    await updateProcessSection({
      heading: body.heading,
      subheading: body.subheading || '',
      enabled: body.enabled !== undefined ? body.enabled : true,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating process section:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update process section' },
      { status: 500 }
    );
  }
}
