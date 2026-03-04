/**
 * Booking System TypeScript Types
 */

// =====================================================
// BOOKING STATUS
// =====================================================

export type BookingStatus =
  | 'RESERVED'    // Čeká na platbu (24h)
  | 'BOOKED'      // Zaplaceno
  | 'CANCELLED'   // Zrušeno
  | 'EXPIRED'     // Automaticky uvolněno (nezaplaceno)
  | 'COMPLETED';  // Dokončeno

export type SlotStatus = 'available' | 'reserved' | 'booked';

// =====================================================
// BOOKING
// =====================================================

export interface Booking {
  id: string;
  status: BookingStatus;
  date: string;           // "2026-03-15"
  start_time: string;     // "18:00"
  end_time: string;       // "19:00"
  profile_id: string | null;
  business_id: string | null;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  gopay_payment_id: string | null;
  gopay_order_num: string | null;
  amount: number | null;  // CZK in haléře
  paid_at: number | null; // Unix timestamp
  reserved_at: number;    // Unix timestamp
  expires_at: number;     // Unix timestamp (reserved_at + 24h)
  client_note: string | null;
  created_at: number;
  updated_at: number;
}

export interface CreateBookingInput {
  date: string;
  start_time: string;
  end_time: string;
  profile_id?: string;
  business_id?: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  amount?: number;        // CZK (will be converted to haléře)
  client_note?: string;
}

// =====================================================
// SLOT & DAY SUMMARY
// =====================================================

export interface TimeSlot {
  start_time: string;     // "18:00"
  end_time: string;       // "19:00"
  status: SlotStatus;
  booking_id?: string;
}

export interface DaySummary {
  date: string;           // "2026-03-15"
  total_slots: number;
  available: number;
  reserved: number;
  booked: number;
  status: 'available' | 'partial' | 'full' | 'closed' | 'past';
}

// =====================================================
// OPERATING HOURS
// =====================================================

export interface DayHours {
  open: string;   // "18:00"
  close: string;  // "22:00"
}

export type OperatingHours = Record<string, DayHours | null>;

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface BookingSlotsResponse {
  success: boolean;
  date: string;
  day_name: string;
  slots: TimeSlot[];
  error?: string;
}

export interface BookingMonthResponse {
  success: boolean;
  year: number;
  month: number;
  days: DaySummary[];
  error?: string;
}

export interface BookingReserveResponse {
  success: boolean;
  booking?: Booking;
  error?: string;
}

export interface BookingPayResponse {
  success: boolean;
  gw_url?: string;
  booking_id?: string;
  error?: string;
}
