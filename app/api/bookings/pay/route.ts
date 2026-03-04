import { NextRequest, NextResponse } from 'next/server';
import { getBookingById, updateBookingStatus } from '@/lib/turso/bookings';
import { GoPay } from '@/lib/gopay';
import type { BookingPayResponse } from '@/types/booking';

/**
 * POST /api/bookings/pay
 *
 * Initiate GoPay payment for a RESERVED booking.
 *
 * Body:
 * - booking_id: string
 */
export async function POST(request: NextRequest) {
  try {
    const { booking_id } = await request.json();

    if (!booking_id) {
      return NextResponse.json<BookingPayResponse>(
        { success: false, error: 'Chybí booking_id' },
        { status: 400 }
      );
    }

    // Get booking
    const booking = await getBookingById(booking_id);

    if (!booking) {
      return NextResponse.json<BookingPayResponse>(
        { success: false, error: 'Rezervace nebyla nalezena' },
        { status: 404 }
      );
    }

    if (booking.status !== 'RESERVED') {
      return NextResponse.json<BookingPayResponse>(
        { success: false, error: 'Rezervaci nelze zaplatit (stav: ' + booking.status + ')' },
        { status: 400 }
      );
    }

    // Check if booking is expired
    const now = Math.floor(Date.now() / 1000);
    if (booking.expires_at < now) {
      return NextResponse.json<BookingPayResponse>(
        { success: false, error: 'Rezervace vypršela' },
        { status: 410 }
      );
    }

    if (!GoPay.isConfigured()) {
      return NextResponse.json<BookingPayResponse>(
        { success: false, error: 'Platební brána není nakonfigurována' },
        { status: 500 }
      );
    }

    const amount = booking.amount || 0;
    if (amount <= 0) {
      return NextResponse.json<BookingPayResponse>(
        { success: false, error: 'Částka k platbě není nastavena' },
        { status: 400 }
      );
    }

    const orderNumber = GoPay.generateVariableSymbol();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.weblyx.cz';

    // Create GoPay payment
    const goPayResponse = await GoPay.createPayment({
      amount, // already in haléře from DB
      currency: 'CZK',
      order_number: orderNumber,
      order_description: `Rezervace ${booking.date} ${booking.start_time}-${booking.end_time}`,
      lang: 'cs',
      payer: {
        contact: {
          email: booking.client_email,
          first_name: booking.client_name.split(' ')[0],
          last_name: booking.client_name.split(' ').slice(1).join(' ') || undefined,
        },
      },
      callback: {
        return_url: `${siteUrl}/api/bookings/gopay-callback?bookingId=${booking.id}`,
        notification_url: `${siteUrl}/api/bookings/gopay-callback?bookingId=${booking.id}`,
      },
    });

    // Store GoPay info on booking
    await updateBookingStatus(booking.id, 'RESERVED', {
      gopay_payment_id: goPayResponse.id.toString(),
      gopay_order_num: orderNumber,
    });

    return NextResponse.json<BookingPayResponse>({
      success: true,
      gw_url: goPayResponse.gw_url,
      booking_id: booking.id,
    });
  } catch (error: any) {
    console.error('❌ Booking pay error:', error);
    return NextResponse.json<BookingPayResponse>(
      { success: false, error: 'Nepodařilo se zahájit platbu' },
      { status: 500 }
    );
  }
}
