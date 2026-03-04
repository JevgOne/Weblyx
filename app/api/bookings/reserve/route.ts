import { NextRequest, NextResponse } from 'next/server';
import { createBooking } from '@/lib/turso/bookings';
import type { CreateBookingInput, BookingReserveResponse } from '@/types/booking';

/**
 * POST /api/bookings/reserve
 *
 * Create a RESERVED booking (24h to pay).
 * Uses transaction to prevent double-booking.
 *
 * Body:
 * - date: "2026-03-15"
 * - start_time: "18:00"
 * - end_time: "19:00"
 * - profile_id or business_id: string
 * - client_name: string
 * - client_email: string
 * - client_phone?: string
 * - amount?: number (CZK)
 * - client_note?: string
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingInput = await request.json();

    // Validate required fields
    if (!body.date || !body.start_time || !body.end_time) {
      return NextResponse.json<BookingReserveResponse>(
        { success: false, error: 'Chybí datum nebo čas' },
        { status: 400 }
      );
    }

    if (!body.profile_id && !body.business_id) {
      return NextResponse.json<BookingReserveResponse>(
        { success: false, error: 'Chybí profile_id nebo business_id' },
        { status: 400 }
      );
    }

    if (!body.client_name || !body.client_email) {
      return NextResponse.json<BookingReserveResponse>(
        { success: false, error: 'Chybí jméno nebo e-mail klienta' },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.client_email)) {
      return NextResponse.json<BookingReserveResponse>(
        { success: false, error: 'Neplatný e-mail' },
        { status: 400 }
      );
    }

    const booking = await createBooking(body);

    return NextResponse.json<BookingReserveResponse>({
      success: true,
      booking,
    });
  } catch (error: any) {
    // Handle double-booking error
    if (error.message === 'Termín je již obsazen') {
      return NextResponse.json<BookingReserveResponse>(
        { success: false, error: 'Termín je již obsazen' },
        { status: 409 }
      );
    }

    console.error('❌ Reserve booking error:', error);
    return NextResponse.json<BookingReserveResponse>(
      { success: false, error: 'Nepodařilo se vytvořit rezervaci' },
      { status: 500 }
    );
  }
}
