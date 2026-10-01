import { NextRequest, NextResponse } from 'next/server';
import { getAllReviews, getReviewById, updateReview, deleteReview, reorderReviews, createReview } from '@/lib/turso/reviews';
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

    /**
     * Bulk import, because the Places API is not an option.
     *
     * Pulling reviews from Google needs billing enabled on the Cloud project,
     * and even with it the API returns at most five. There are nineteen on the
     * profile. So they are pasted in — but pasting nineteen reviews through a
     * one-at-a-time form is how fourteen of them stayed off the site.
     *
     * Existing authors are skipped rather than updated: a re-import must not
     * quietly rewrite a review someone already edited here.
     */
    if (action === 'bulk' && Array.isArray(items)) {
      const existing = new Set(
        (await getAllReviews()).map((r) => `${r.authorName.trim().toLowerCase()}|${r.text.trim().slice(0, 60)}`)
      );

      let created = 0;
      const skipped: string[] = [];
      const failed: string[] = [];

      for (const raw of items.slice(0, 100)) {
        const authorName = String(raw?.authorName ?? '').trim();
        const text = String(raw?.text ?? '').trim();
        const rating = Number(raw?.rating);

        if (!authorName || !text || !(rating >= 1 && rating <= 5)) {
          failed.push(authorName || '(bez jména)');
          continue;
        }
        if (existing.has(`${authorName.toLowerCase()}|${text.slice(0, 60)}`)) {
          skipped.push(authorName);
          continue;
        }

        try {
          await createReview({
            authorName,
            authorRole: raw?.authorRole ? String(raw.authorRole).trim() : undefined,
            rating: Math.round(rating),
            text,
            // A review with no date would sort to 1970; today is the honest
            // fallback when the paste does not carry one.
            date: raw?.date ? new Date(raw.date) : new Date(),
            source: raw?.source ? String(raw.source) : 'Google',
            sourceUrl: raw?.sourceUrl ? String(raw.sourceUrl) : undefined,
            // Imported reviews go live straight away; they are already public
            // on Google and the point of the import is to show them.
            published: raw?.published !== false,
            locale: 'cs',
          });
          created++;
        } catch (err) {
          console.error('bulk review import failed for', authorName, err);
          failed.push(authorName);
        }
      }

      return NextResponse.json({ success: true, created, skipped, failed });
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
