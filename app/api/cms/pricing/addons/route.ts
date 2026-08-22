import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  getAllPricingAddons,
  createPricingAddon,
  updatePricingAddon,
  deletePricingAddon,
} from '@/lib/turso/cms';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';

export const runtime = 'nodejs';

/**
 * Tier ids are stored as a comma-separated list. An add-on offered nowhere is a
 * configuration error, not a wildcard — the whole point of the field is to stop
 * a package selling something it already includes.
 */
function parseAvailableTiers(value: unknown): string[] | null {
  const list = Array.isArray(value)
    ? value.map((v) => String(v).trim())
    : String(value ?? '')
        .split(',')
        .map((v) => v.trim());

  const tiers = list.filter(Boolean);
  return tiers.length > 0 ? tiers : null;
}

function revalidatePricing() {
  revalidatePath('/');
  revalidatePath('/nova');
}

export async function GET() {
  try {
    const data = await getAllPricingAddons();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching pricing addons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pricing addons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const hours = Number(body.hours);

    const price = Number(body.price);
    const availableTiers = parseAvailableTiers(body.availableTiers);

    if (!body.name || !Number.isFinite(hours) || hours <= 0) {
      return NextResponse.json(
        { success: false, error: 'Name and a valid hours estimate are required' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid price is required' },
        { status: 400 }
      );
    }

    if (!availableTiers) {
      return NextResponse.json(
        { success: false, error: 'Addon must be offered on at least one tier' },
        { status: 400 }
      );
    }

    const id = await createPricingAddon({
      name: body.name,
      hours,
      price,
      availableTiers,
      order: Number(body.order) || 0,
      enabled: body.enabled !== undefined ? Boolean(body.enabled) : true,
    });

    revalidatePricing();

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Error creating pricing addon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create pricing addon' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Addon ID is required' },
        { status: 400 }
      );
    }

    const updates: Parameters<typeof updatePricingAddon>[1] = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.order !== undefined) updates.order = Number(body.order);
    if (body.enabled !== undefined) updates.enabled = Boolean(body.enabled);

    if (body.hours !== undefined) {
      const hours = Number(body.hours);
      if (!Number.isFinite(hours) || hours <= 0) {
        return NextResponse.json(
          { success: false, error: 'Valid hours estimate is required' },
          { status: 400 }
        );
      }
      updates.hours = hours;
    }

    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json(
          { success: false, error: 'Valid price is required' },
          { status: 400 }
        );
      }
      updates.price = price;
    }

    if (body.availableTiers !== undefined) {
      const availableTiers = parseAvailableTiers(body.availableTiers);
      if (!availableTiers) {
        return NextResponse.json(
          { success: false, error: 'Addon must be offered on at least one tier' },
          { status: 400 }
        );
      }
      updates.availableTiers = availableTiers;
    }

    await updatePricingAddon(body.id, updates);

    revalidatePricing();

    return NextResponse.json({ success: true, data: { id: body.id } });
  } catch (error) {
    console.error('Error updating pricing addon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update pricing addon' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();

    const id = new URL(request.url).searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Addon ID is required' },
        { status: 400 }
      );
    }

    await deletePricingAddon(id);

    revalidatePricing();

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Error deleting pricing addon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete pricing addon' },
      { status: 500 }
    );
  }
}
