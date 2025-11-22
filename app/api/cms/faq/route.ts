import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  getFAQSection,
  updateFAQSection,
  getAllFAQItems,
  createFAQItem,
  updateFAQItem,
  deleteFAQItem
} from '@/lib/turso/cms';

export const runtime = 'nodejs';

// GET /api/cms/faq - Get FAQ section and items
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // If ID is provided, return single item (not implemented in current spec)
    // Otherwise return section + all items
    const section = await getFAQSection();
    const items = await getAllFAQItems();

    return NextResponse.json({
      success: true,
      data: {
        section: section || null,
        items: items || []
      }
    });
  } catch (error: any) {
    console.error('Error fetching FAQ data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch FAQ data' },
      { status: 500 }
    );
  }
}

// POST /api/cms/faq - Create FAQ item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.question?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }
    if (!body.answer?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Answer is required' },
        { status: 400 }
      );
    }

    const id = await createFAQItem({
      question: body.question,
      answer: body.answer,
      order: body.order || 0,
      enabled: body.enabled !== undefined ? body.enabled : true,
    });

    // Revalidate homepage
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      data: { id }
    });
  } catch (error: any) {
    console.error('Error creating FAQ item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create FAQ item' },
      { status: 500 }
    );
  }
}

// PUT /api/cms/faq - Update FAQ section or item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if updating section or item
    if (body.id) {
      // Update FAQ item
      if (!body.question?.trim()) {
        return NextResponse.json(
          { success: false, error: 'Question is required' },
          { status: 400 }
        );
      }
      if (!body.answer?.trim()) {
        return NextResponse.json(
          { success: false, error: 'Answer is required' },
          { status: 400 }
        );
      }

      await updateFAQItem(body.id, {
        question: body.question,
        answer: body.answer,
        order: body.order,
        enabled: body.enabled,
      });

      // Revalidate homepage
      revalidatePath('/');

      return NextResponse.json({ success: true });
    } else {
      // Update FAQ section
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

      // Revalidate homepage
      revalidatePath('/');

      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

// DELETE /api/cms/faq - Delete FAQ item
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    await deleteFAQItem(id);

    // Revalidate homepage
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting FAQ item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete FAQ item' },
      { status: 500 }
    );
  }
}
