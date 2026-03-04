import { NextRequest, NextResponse } from 'next/server';
import { getBookingsForDate } from '@/lib/turso/bookings';
import { getOperatingHoursForDate, generateSlots, isDatePast, getCzechDayName } from '@/lib/booking-utils';
import type { TimeSlot, BookingSlotsResponse } from '@/types/booking';

/**
 * GET /api/bookings/slots?profileId=x&date=2026-03-15
 * or  /api/bookings/slots?businessId=x&date=2026-03-15
 *
 * Returns available time slots for a specific date.
 * Public endpoint — no authentication required.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const businessId = searchParams.get('businessId');
    const date = searchParams.get('date');

    const entityId = profileId || businessId;
    const entityType = profileId ? 'profile' : 'business';

    if (!entityId || !date) {
      return NextResponse.json<BookingSlotsResponse>(
        { success: false, date: date || '', day_name: '', slots: [], error: 'Missing profileId/businessId or date' },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json<BookingSlotsResponse>(
        { success: false, date, day_name: '', slots: [], error: 'Invalid date format (expected YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Past dates have no available slots
    if (isDatePast(date)) {
      return NextResponse.json<BookingSlotsResponse>({
        success: true,
        date,
        day_name: getCzechDayName(date),
        slots: [],
      });
    }

    // Get operating hours for this day
    const dayHours = getOperatingHoursForDate(date);

    if (!dayHours) {
      // Day is closed
      return NextResponse.json<BookingSlotsResponse>({
        success: true,
        date,
        day_name: getCzechDayName(date),
        slots: [],
      });
    }

    // Generate all possible slots
    const possibleSlots = generateSlots(dayHours);

    // Get existing bookings for this date
    const bookings = await getBookingsForDate(date, entityId, entityType as 'profile' | 'business');

    // Map slots with booking status
    const slots: TimeSlot[] = possibleSlots.map((slot) => {
      const booking = bookings.find((b) => b.start_time === slot.start);
      if (booking) {
        return {
          start_time: slot.start,
          end_time: slot.end,
          status: booking.status === 'BOOKED' ? 'booked' : 'reserved',
          booking_id: booking.id,
        };
      }
      return {
        start_time: slot.start,
        end_time: slot.end,
        status: 'available',
      };
    });

    return NextResponse.json<BookingSlotsResponse>({
      success: true,
      date,
      day_name: getCzechDayName(date),
      slots,
    });
  } catch (error: any) {
    console.error('❌ Booking slots error:', error);
    return NextResponse.json<BookingSlotsResponse>(
      { success: false, date: '', day_name: '', slots: [], error: 'Internal server error' },
      { status: 500 }
    );
  }
}
