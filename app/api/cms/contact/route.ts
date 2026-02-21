import { NextRequest, NextResponse } from 'next/server';
import { getContactInfo, updateContactInfo } from '@/lib/turso/cms';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';

export const runtime = 'nodejs';

// GET /api/cms/contact - Get contact info
export async function GET(request: NextRequest) {
  try {
    const data = await getContactInfo();
    return NextResponse.json({
      success: true,
      data: data || null
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error('Error fetching contact info:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch contact info' },
      { status: 500 }
    );
  }
}

// PUT /api/cms/contact - Update contact info
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    // Validation
    if (!body.email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    await updateContactInfo(body);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating contact info:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update contact info' },
      { status: 500 }
    );
  }
}
