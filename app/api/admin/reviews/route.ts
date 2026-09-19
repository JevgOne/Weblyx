import { NextRequest, NextResponse } from 'next/server';
import { getAllReviews, getReviewById, updateReview, deleteReview, reorderReviews } from '@/lib/turso/reviews';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';
import { recordChange } from '@/lib/changelog/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const reviews = await getAllReviews();

    return NextResponse.json({
      success: true,
      data: reviews,
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reviews',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const updated = await updateReview(id, data);

    await recordChange({
      type: 'review',
      title: `Upravena recenze od ${updated.authorName}`,
      author: user.name || user.email,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update review',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Read the name before the row is gone; "Smazána recenze" with no author
    // is a line nobody can act on later.
    const review = await getReviewById(id);
    await deleteReview(id);

    await recordChange({
      type: 'review',
      title: review ? `Smazána recenze od ${review.authorName}` : 'Smazána recenze',
      author: user.name || user.email,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete review',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { action, items } = body;

    if (action === 'reorder' && items) {
      await reorderReviews(items);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing review action:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process action',
      },
      { status: 500 }
    );
  }
}
