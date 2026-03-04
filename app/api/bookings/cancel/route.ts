import { NextRequest, NextResponse } from 'next/server';
import { cancelBooking } from '@/lib/turso/bookings';

/**
 * POST /api/bookings/cancel
 *
 * Cancel own booking by ID + client email.
 *
 * Body:
 * - booking_id: string
 * - client_email: string
 */
export async function POST(request: NextRequest) {
  try {
    const { booking_id, client_email } = await request.json();

    if (!booking_id || !client_email) {
      return NextResponse.json(
        { success: false, error: 'Chybí booking_id nebo client_email' },
        { status: 400 }
      );
    }

    const cancelled = await cancelBooking(booking_id, client_email);

    if (!cancelled) {
      return NextResponse.json(
        { success: false, error: 'Rezervace nebyla nalezena nebo ji nelze zrušit' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Cancel booking error:', error);
    return NextResponse.json(
      { success: false, error: 'Nepodařilo se zrušit rezervaci' },
      { status: 500 }
    );
  }
}
