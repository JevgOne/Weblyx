import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';
import { getAllBookings, getBookingStats, adminCancelBooking, completeBooking } from '@/lib/turso/bookings';
import type { BookingStatus } from '@/types/booking';

/**
 * GET /api/admin/bookings?status=x&date_from=x&date_to=x&limit=50&offset=0
 *
 * List all bookings with filters. Admin only.
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      status: (searchParams.get('status') as BookingStatus) || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      profile_id: searchParams.get('profile_id') || undefined,
      business_id: searchParams.get('business_id') || undefined,
      client_email: searchParams.get('client_email') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const [result, stats] = await Promise.all([
      getAllBookings(filters),
      getBookingStats(),
    ]);

    return NextResponse.json({
      success: true,
      ...result,
      stats,
    });
  } catch (error: any) {
    console.error('❌ Admin bookings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/bookings
 *
 * Admin actions: cancel or complete a booking.
 *
 * Body:
 * - action: "cancel" | "complete"
 * - booking_id: string
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorizedResponse();

  try {
    const { action, booking_id } = await request.json();

    if (!booking_id || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing action or booking_id' },
        { status: 400 }
      );
    }

    let success = false;

    if (action === 'cancel') {
      success = await adminCancelBooking(booking_id);
    } else if (action === 'complete') {
      success = await completeBooking(booking_id);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Action failed — booking not found or wrong status' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Admin booking action error:', error);
    return NextResponse.json(
      { success: false, error: 'Action failed' },
      { status: 500 }
    );
  }
}
