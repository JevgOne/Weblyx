import { NextRequest, NextResponse } from 'next/server';
import { getBookingsForMonth } from '@/lib/turso/bookings';
import {
  getOperatingHoursForDate,
  generateSlots,
  isDatePast,
  getMonthDates,
} from '@/lib/booking-utils';
import type { DaySummary, BookingMonthResponse } from '@/types/booking';

/**
 * GET /api/bookings/month?profileId=x&year=2026&month=3
 * or  /api/bookings/month?businessId=x&year=2026&month=3
 *
 * Returns day-by-day summary for a month (for calendar color coding).
 * Public endpoint — no authentication required.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const businessId = searchParams.get('businessId');
    const yearStr = searchParams.get('year');
    const monthStr = searchParams.get('month');

    const entityId = profileId || businessId;
    const entityType = profileId ? 'profile' : 'business';

    if (!entityId || !yearStr || !monthStr) {
      return NextResponse.json<BookingMonthResponse>(
        { success: false, year: 0, month: 0, days: [], error: 'Missing required params' },
        { status: 400 }
      );
    }

    const year = parseInt(yearStr);
    const month = parseInt(monthStr);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json<BookingMonthResponse>(
        { success: false, year, month, days: [], error: 'Invalid year or month' },
        { status: 400 }
      );
    }

    // Get all bookings for the month
    const bookings = await getBookingsForMonth(year, month, entityId, entityType as 'profile' | 'business');

    // Group bookings by date
    const bookingsByDate = new Map<string, number>();
    for (const b of bookings) {
      bookingsByDate.set(b.date, (bookingsByDate.get(b.date) || 0) + 1);
    }

    // Build day summaries
    const dates = getMonthDates(year, month);
    const days: DaySummary[] = dates.map((dateStr) => {
      // Past days
      if (isDatePast(dateStr)) {
        return {
          date: dateStr,
          total_slots: 0,
          available: 0,
          reserved: 0,
          booked: 0,
          status: 'past' as const,
        };
      }

      // Check operating hours
      const dayHours = getOperatingHoursForDate(dateStr);
      if (!dayHours) {
        return {
          date: dateStr,
          total_slots: 0,
          available: 0,
          reserved: 0,
          booked: 0,
          status: 'closed' as const,
        };
      }

      const totalSlots = generateSlots(dayHours).length;
      const occupiedCount = bookingsByDate.get(dateStr) || 0;
      const available = Math.max(0, totalSlots - occupiedCount);

      // Count reserved vs booked for this date
      const dayBookings = bookings.filter((b) => b.date === dateStr);
      const reservedCount = dayBookings.filter((b) => b.status === 'RESERVED').length;
      const bookedCount = dayBookings.filter((b) => b.status === 'BOOKED').length;

      let status: DaySummary['status'];
      if (available === 0) {
        status = 'full';
      } else if (occupiedCount > 0) {
        status = 'partial';
      } else {
        status = 'available';
      }

      return {
        date: dateStr,
        total_slots: totalSlots,
        available,
        reserved: reservedCount,
        booked: bookedCount,
        status,
      };
    });

    return NextResponse.json<BookingMonthResponse>({
      success: true,
      year,
      month,
      days,
    });
  } catch (error: any) {
    console.error('❌ Booking month error:', error);
    return NextResponse.json<BookingMonthResponse>(
      { success: false, year: 0, month: 0, days: [], error: 'Internal server error' },
      { status: 500 }
    );
  }
}
