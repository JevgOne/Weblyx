import { NextRequest, NextResponse } from 'next/server';
import {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
} from '@/lib/turso';

export const runtime = 'edge';

// GET /api/reviews - Get all reviews
export async function GET(request: NextRequest) {
  try {
    const reviews = await getAllReviews();
    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.authorName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Author name is required' },
        { status: 400 }
      );
    }

    if (!body.text?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Review text is required' },
        { status: 400 }
      );
    }

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const review = await createReview({
      authorName: body.authorName,
      authorImage: body.authorImage,
      authorRole: body.authorRole,
      rating: body.rating,
      text: body.text,
      date: body.date ? new Date(body.date) : new Date(),
      source: body.source || 'manual',
      sourceUrl: body.sourceUrl,
      published: Boolean(body.published),
      featured: Boolean(body.featured),
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
}

// PUT /api/reviews - Update review
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (body.authorName !== undefined) updateData.authorName = body.authorName;
    if (body.authorImage !== undefined) updateData.authorImage = body.authorImage;
    if (body.authorRole !== undefined) updateData.authorRole = body.authorRole;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.text !== undefined) updateData.text = body.text;
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.source !== undefined) updateData.source = body.source;
    if (body.sourceUrl !== undefined) updateData.sourceUrl = body.sourceUrl;
    if (body.published !== undefined) updateData.published = body.published;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.order !== undefined) updateData.order = body.order;

    const review = await updateReview(body.id, updateData);

    return NextResponse.json({ success: true, data: review });
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews - Delete review
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    await deleteReview(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete review' },
      { status: 500 }
    );
  }
}
