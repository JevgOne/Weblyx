import { NextRequest, NextResponse } from 'next/server';
import { getAllPricingTiers, createPricingTier, updatePricingTier, deletePricingTier } from '@/lib/turso/cms';
import { revalidatePath } from 'next/cache';
import { PricingTier } from '@/types/cms';

export const runtime = 'nodejs';

// GET /api/cms/pricing - Get all pricing tiers
export async function GET(request: NextRequest) {
  try {
    const data = await getAllPricingTiers();
    return NextResponse.json({
      success: true,
      data: data || []
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error('Error fetching pricing tiers:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch pricing tiers' },
      { status: 500 }
    );
  }
}

// POST /api/cms/pricing - Create new pricing tier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      );
    }

    if (body.price === undefined || body.price < 0) {
      return NextResponse.json(
        { success: false, error: 'Valid price is required' },
        { status: 400 }
      );
    }

    if (!body.ctaText || !body.ctaLink) {
      return NextResponse.json(
        { success: false, error: 'CTA text and link are required' },
        { status: 400 }
      );
    }

    // Ensure features is an array
    if (!Array.isArray(body.features) || body.features.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one feature is required' },
        { status: 400 }
      );
    }

    const tierData: Omit<PricingTier, 'id' | 'createdAt' | 'updatedAt'> = {
      name: body.name,
      description: body.description,
      price: Number(body.price),
      currency: body.currency || 'CZK',
      interval: body.interval || 'month',
      features: body.features,
      highlighted: Boolean(body.highlighted),
      ctaText: body.ctaText,
      ctaLink: body.ctaLink,
      order: Number(body.order) || 0,
      enabled: body.enabled !== undefined ? Boolean(body.enabled) : true,
    };

    const id = await createPricingTier(tierData);

    // Revalidate pricing page
    revalidatePath('/');
    revalidatePath('/pricing');

    return NextResponse.json({
      success: true,
      data: { id }
    });
  } catch (error: any) {
    console.error('Error creating pricing tier:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create pricing tier' },
      { status: 500 }
    );
  }
}

// PUT /api/cms/pricing - Update existing pricing tier
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Pricing tier ID is required' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: Partial<PricingTier> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.price !== undefined) updates.price = Number(body.price);
    if (body.currency !== undefined) updates.currency = body.currency;
    if (body.interval !== undefined) updates.interval = body.interval;
    if (body.features !== undefined) updates.features = body.features;
    if (body.highlighted !== undefined) updates.highlighted = Boolean(body.highlighted);
    if (body.ctaText !== undefined) updates.ctaText = body.ctaText;
    if (body.ctaLink !== undefined) updates.ctaLink = body.ctaLink;
    if (body.order !== undefined) updates.order = Number(body.order);
    if (body.enabled !== undefined) updates.enabled = Boolean(body.enabled);

    await updatePricingTier(body.id, updates);

    // Revalidate pricing page
    revalidatePath('/');
    revalidatePath('/pricing');

    return NextResponse.json({
      success: true,
      data: { id: body.id }
    });
  } catch (error: any) {
    console.error('Error updating pricing tier:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update pricing tier' },
      { status: 500 }
    );
  }
}

// DELETE /api/cms/pricing - Delete pricing tier
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Pricing tier ID is required' },
        { status: 400 }
      );
    }

    await deletePricingTier(id);

    // Revalidate pricing page
    revalidatePath('/');
    revalidatePath('/pricing');

    return NextResponse.json({
      success: true,
      data: { id }
    });
  } catch (error: any) {
    console.error('Error deleting pricing tier:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete pricing tier' },
      { status: 500 }
    );
  }
}
