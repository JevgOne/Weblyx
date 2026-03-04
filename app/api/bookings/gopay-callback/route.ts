import { NextRequest, NextResponse } from 'next/server';
import { getBookingById, updateBookingStatus } from '@/lib/turso/bookings';
import { GoPay } from '@/lib/gopay';

/**
 * GET /api/bookings/gopay-callback?bookingId=x&id=y
 *
 * GoPay redirects here after payment.
 * - Verifies payment status with GoPay API
 * - Updates booking to BOOKED if paid
 * - Redirects to confirmation page
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const goPayId = searchParams.get('id');

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.weblyx.cz';

    if (!bookingId) {
      return NextResponse.redirect(`${siteUrl}/booking/confirmation?status=error&message=missing_booking`);
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return NextResponse.redirect(`${siteUrl}/booking/confirmation?status=error&message=not_found`);
    }

    // Get GoPay payment ID (from query param or booking record)
    const paymentId = goPayId || booking.gopay_payment_id;

    if (!paymentId) {
      return NextResponse.redirect(
        `${siteUrl}/booking/confirmation?status=error&message=no_payment&bookingId=${bookingId}`
      );
    }

    // Verify payment status with GoPay
    const paymentStatus = await GoPay.getPaymentStatus(parseInt(paymentId));

    if (paymentStatus.state === 'PAID') {
      // Update booking to BOOKED
      await updateBookingStatus(bookingId, 'BOOKED', {
        paid_at: Math.floor(Date.now() / 1000),
      });

      return NextResponse.redirect(
        `${siteUrl}/booking/confirmation?status=success&bookingId=${bookingId}`
      );
    }

    if (paymentStatus.state === 'CANCELED' || paymentStatus.state === 'TIMEOUTED') {
      return NextResponse.redirect(
        `${siteUrl}/booking/confirmation?status=cancelled&bookingId=${bookingId}`
      );
    }

    // Payment still pending
    return NextResponse.redirect(
      `${siteUrl}/booking/confirmation?status=pending&bookingId=${bookingId}`
    );
  } catch (error: any) {
    console.error('❌ GoPay callback error:', error);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.weblyx.cz';
    return NextResponse.redirect(`${siteUrl}/booking/confirmation?status=error`);
  }
}

/**
 * POST /api/bookings/gopay-callback
 *
 * GoPay notification webhook (server-to-server).
 * Same logic as GET but returns JSON.
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Missing bookingId' }, { status: 400 });
    }

    const booking = await getBookingById(bookingId);
    if (!booking || !booking.gopay_payment_id) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // Verify payment status with GoPay
    const paymentStatus = await GoPay.getPaymentStatus(parseInt(booking.gopay_payment_id));

    if (paymentStatus.state === 'PAID' && booking.status === 'RESERVED') {
      await updateBookingStatus(bookingId, 'BOOKED', {
        paid_at: Math.floor(Date.now() / 1000),
      });
    }

    return NextResponse.json({ success: true, status: paymentStatus.state });
  } catch (error: any) {
    console.error('❌ GoPay notification error:', error);
    // Return 200 to prevent GoPay from retrying
    return NextResponse.json({ success: false, error: 'Internal error' });
  }
}
