import { NextRequest, NextResponse } from 'next/server';
import {
  getAllPortfolio,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from '@/lib/turso/portfolio';

export const runtime = 'nodejs';

// GET /api/portfolio - Get all portfolio items or single item by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // If ID is provided, get single item
    if (id) {
      const item = await getPortfolioById(id);
      if (!item) {
        return NextResponse.json(
          { success: false, error: 'Portfolio item not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: item });
    }

    // Otherwise get all items
    const items = await getAllPortfolio();
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}

// POST /api/portfolio - Create new portfolio item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!body.category?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      );
    }

    if (!body.imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const item = await createPortfolio({
      title: body.title,
      description: body.description || '',
      clientName: body.clientName,
      projectUrl: body.projectUrl || '',
      imageUrl: body.imageUrl,
      technologies: body.technologies || [],
      category: body.category,
      featured: Boolean(body.featured),
      published: Boolean(body.published),
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    console.error('Error creating portfolio item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create portfolio item' },
      { status: 500 }
    );
  }
}

// PUT /api/portfolio - Update portfolio item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const item = await updatePortfolio(body.id, {
      title: body.title,
      description: body.description,
      clientName: body.clientName,
      projectUrl: body.projectUrl,
      imageUrl: body.imageUrl,
      beforeImageUrl: body.beforeImageUrl,
      technologies: body.technologies,
      category: body.category,
      featured: body.featured,
      published: body.published,
      order: body.order,
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    console.error('Error updating portfolio item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update portfolio item' },
      { status: 500 }
    );
  }
}

// DELETE /api/portfolio - Delete portfolio item
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

    await deletePortfolio(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting portfolio item:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete portfolio item' },
      { status: 500 }
    );
  }
}
