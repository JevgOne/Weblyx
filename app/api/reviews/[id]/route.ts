import { NextRequest, NextResponse } from 'next/server';
import { getReviewById } from '@/lib/turso/reviews';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const review = await getReviewById(id);

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch review' },
      { status: 500 }
    );
  }
}
