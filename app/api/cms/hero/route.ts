import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getHomepageSections, updateHeroSection } from '@/lib/turso/cms';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';

export const runtime = 'nodejs';

// GET /api/cms/hero - Get hero section
export async function GET(request: NextRequest) {
  try {
    const data = await getHomepageSections();
    return NextResponse.json({
      success: true,
      data: data?.hero || null
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error('Error fetching hero section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hero section' },
      { status: 500 }
    );
  }
}

// PUT /api/cms/hero - Update hero section
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    await updateHeroSection({
      headline: body.headline || '',
      subheadline: body.subheadline || '',
      ctaText: body.ctaText || '',
      ctaLink: body.ctaLink || '',
      backgroundImage: body.backgroundImage || '',
      enabled: body.enabled !== undefined ? body.enabled : true,
    });

    // Revalidate homepage to show changes immediately
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating hero section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update hero section' },
      { status: 500 }
    );
  }
}
