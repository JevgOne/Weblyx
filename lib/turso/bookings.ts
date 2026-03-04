/**
 * Turso Bookings Data Access Layer
 *
 * CRUD operations for the bookings table.
 * Follows the same DAL pattern as clients.ts.
 */

import { turso, transaction } from '../turso';
import type { Booking, BookingStatus, CreateBookingInput } from '@/types/booking';

// =====================================================
// TABLE INITIALIZATION
// =====================================================

/**
 * Initialize bookings table. Safe to call multiple times.
 */
export async function initBookingsTable(): Promise<void> {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      status TEXT NOT NULL DEFAULT 'RESERVED',
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      profile_id TEXT,
      business_id TEXT,
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_phone TEXT,
      gopay_payment_id TEXT,
      gopay_order_num TEXT,
      amount INTEGER,
      paid_at INTEGER,
      reserved_at INTEGER NOT NULL DEFAULT (unixepoch()),
      expires_at INTEGER NOT NULL,
      client_note TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_bookings_profile_date ON bookings(profile_id, date)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_bookings_business_date ON bookings(business_id, date)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_bookings_client_email ON bookings(client_email)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_bookings_expires_at ON bookings(expires_at)`);
}

// =====================================================
// ROW MAPPING
// =====================================================

function rowToBooking(row: Record<string, unknown>): Booking {
  return {
    id: row.id as string,
    status: row.status as BookingStatus,
    date: row.date as string,
    start_time: row.start_time as string,
    end_time: row.end_time as string,
    profile_id: (row.profile_id as string) || null,
    business_id: (row.business_id as string) || null,
    client_name: row.client_name as string,
    client_email: row.client_email as string,
    client_phone: (row.client_phone as string) || null,
    gopay_payment_id: (row.gopay_payment_id as string) || null,
    gopay_order_num: (row.gopay_order_num as string) || null,
    amount: (row.amount as number) || null,
    paid_at: (row.paid_at as number) || null,
    reserved_at: row.reserved_at as number,
    expires_at: row.expires_at as number,
    client_note: (row.client_note as string) || null,
    created_at: row.created_at as number,
    updated_at: row.updated_at as number,
  };
}

// =====================================================
// CREATE
// =====================================================

/**
 * Create a new booking with double-booking prevention using a transaction.
 * Throws if the slot is already taken (RESERVED or BOOKED).
 */
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  await initBookingsTable();

  const id = crypto.randomUUID().replace(/-/g, '');
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + 24 * 60 * 60; // +24 hours
  const amountHalere = input.amount ? Math.round(input.amount * 100) : null;

  // Build the WHERE clause for conflict check
  const entityField = input.profile_id ? 'profile_id' : 'business_id';
  const entityValue = input.profile_id || input.business_id;

  if (!entityValue) {
    throw new Error('Either profile_id or business_id is required');
  }

  await transaction(async (tx) => {
    // Check for existing active booking in same slot
    const existing = await tx.execute({
      sql: `SELECT id FROM bookings
            WHERE ${entityField} = ? AND date = ? AND start_time = ?
            AND status IN ('RESERVED', 'BOOKED')
            LIMIT 1`,
      args: [entityValue, input.date, input.start_time],
    });

    if (existing.rows.length > 0) {
      throw new Error('Termín je již obsazen');
    }

    await tx.execute({
      sql: `INSERT INTO bookings (
        id, status, date, start_time, end_time,
        profile_id, business_id,
        client_name, client_email, client_phone,
        amount, reserved_at, expires_at, client_note
      ) VALUES (?, 'RESERVED', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        input.date,
        input.start_time,
        input.end_time,
        input.profile_id || null,
        input.business_id || null,
        input.client_name,
        input.client_email,
        input.client_phone || null,
        amountHalere,
        now,
        expiresAt,
        input.client_note || null,
      ],
    });
  });

  return (await getBookingById(id))!;
}

// =====================================================
// READ
// =====================================================

/**
 * Get a single booking by ID.
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  await initBookingsTable();

  const result = await turso.execute({
    sql: 'SELECT * FROM bookings WHERE id = ?',
    args: [id],
  });

  if (result.rows.length === 0) return null;
  return rowToBooking(result.rows[0] as unknown as Record<string, unknown>);
}

/**
 * Get active bookings (RESERVED or BOOKED) for a specific date and entity.
 */
export async function getBookingsForDate(
  date: string,
  entityId: string,
  entityType: 'profile' | 'business' = 'profile'
): Promise<Booking[]> {
  await initBookingsTable();

  const field = entityType === 'profile' ? 'profile_id' : 'business_id';
  const result = await turso.execute({
    sql: `SELECT * FROM bookings
          WHERE ${field} = ? AND date = ?
          AND status IN ('RESERVED', 'BOOKED')
          ORDER BY start_time ASC`,
    args: [entityId, date],
  });

  return result.rows.map((row) => rowToBooking(row as unknown as Record<string, unknown>));
}

/**
 * Get active bookings for an entire month.
 */
export async function getBookingsForMonth(
  year: number,
  month: number,
  entityId: string,
  entityType: 'profile' | 'business' = 'profile'
): Promise<Booking[]> {
  await initBookingsTable();

  const field = entityType === 'profile' ? 'profile_id' : 'business_id';
  const monthStr = month.toString().padStart(2, '0');
  const pattern = `${year}-${monthStr}-%`;

  const result = await turso.execute({
    sql: `SELECT * FROM bookings
          WHERE ${field} = ? AND date LIKE ?
          AND status IN ('RESERVED', 'BOOKED')
          ORDER BY date ASC, start_time ASC`,
    args: [entityId, pattern],
  });

  return result.rows.map((row) => rowToBooking(row as unknown as Record<string, unknown>));
}

/**
 * Get all bookings with optional filters (for admin).
 */
export async function getAllBookings(filters?: {
  status?: BookingStatus;
  date_from?: string;
  date_to?: string;
  profile_id?: string;
  business_id?: string;
  client_email?: string;
  limit?: number;
  offset?: number;
}): Promise<{ bookings: Booking[]; total: number }> {
  await initBookingsTable();

  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (filters?.status) {
    conditions.push('status = ?');
    args.push(filters.status);
  }
  if (filters?.date_from) {
    conditions.push('date >= ?');
    args.push(filters.date_from);
  }
  if (filters?.date_to) {
    conditions.push('date <= ?');
    args.push(filters.date_to);
  }
  if (filters?.profile_id) {
    conditions.push('profile_id = ?');
    args.push(filters.profile_id);
  }
  if (filters?.business_id) {
    conditions.push('business_id = ?');
    args.push(filters.business_id);
  }
  if (filters?.client_email) {
    conditions.push('client_email LIKE ?');
    args.push(`%${filters.client_email}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count total
  const countResult = await turso.execute({
    sql: `SELECT COUNT(*) as count FROM bookings ${where}`,
    args,
  });
  const total = (countResult.rows[0] as unknown as Record<string, number>).count || 0;

  // Fetch rows
  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;
  const result = await turso.execute({
    sql: `SELECT * FROM bookings ${where}
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  });

  const bookings = result.rows.map((row) => rowToBooking(row as unknown as Record<string, unknown>));
  return { bookings, total };
}

// =====================================================
// UPDATE
// =====================================================

/**
 * Update booking status.
 */
export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  extra?: {
    gopay_payment_id?: string;
    gopay_order_num?: string;
    paid_at?: number;
  }
): Promise<Booking | null> {
  await initBookingsTable();

  const fields = ['status = ?', 'updated_at = unixepoch()'];
  const args: (string | number)[] = [status];

  if (extra?.gopay_payment_id) {
    fields.push('gopay_payment_id = ?');
    args.push(extra.gopay_payment_id);
  }
  if (extra?.gopay_order_num) {
    fields.push('gopay_order_num = ?');
    args.push(extra.gopay_order_num);
  }
  if (extra?.paid_at) {
    fields.push('paid_at = ?');
    args.push(extra.paid_at);
  }

  args.push(id);
  await turso.execute({
    sql: `UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`,
    args,
  });

  return getBookingById(id);
}

/**
 * Cancel a booking by client email (only own bookings).
 */
export async function cancelBooking(
  bookingId: string,
  clientEmail: string
): Promise<boolean> {
  await initBookingsTable();

  const result = await turso.execute({
    sql: `UPDATE bookings
          SET status = 'CANCELLED', updated_at = unixepoch()
          WHERE id = ? AND client_email = ? AND status IN ('RESERVED', 'BOOKED')`,
    args: [bookingId, clientEmail],
  });

  return (result.rowsAffected || 0) > 0;
}

/**
 * Admin cancel — no email check.
 */
export async function adminCancelBooking(bookingId: string): Promise<boolean> {
  await initBookingsTable();

  const result = await turso.execute({
    sql: `UPDATE bookings
          SET status = 'CANCELLED', updated_at = unixepoch()
          WHERE id = ? AND status IN ('RESERVED', 'BOOKED')`,
    args: [bookingId],
  });

  return (result.rowsAffected || 0) > 0;
}

/**
 * Mark booking as completed (admin).
 */
export async function completeBooking(bookingId: string): Promise<boolean> {
  await initBookingsTable();

  const result = await turso.execute({
    sql: `UPDATE bookings
          SET status = 'COMPLETED', updated_at = unixepoch()
          WHERE id = ? AND status = 'BOOKED'`,
    args: [bookingId],
  });

  return (result.rowsAffected || 0) > 0;
}

// =====================================================
// CRON: RELEASE EXPIRED
// =====================================================

/**
 * Release all RESERVED bookings where expiresAt < now.
 * Returns count of released bookings.
 */
export async function releaseExpiredBookings(): Promise<number> {
  await initBookingsTable();

  const now = Math.floor(Date.now() / 1000);

  const result = await turso.execute({
    sql: `UPDATE bookings
          SET status = 'EXPIRED', updated_at = unixepoch()
          WHERE status = 'RESERVED' AND expires_at < ?`,
    args: [now],
  });

  return result.rowsAffected || 0;
}

// =====================================================
// STATISTICS (Admin)
// =====================================================

/**
 * Get booking statistics for admin dashboard.
 */
export async function getBookingStats(): Promise<{
  total: number;
  reserved: number;
  booked: number;
  cancelled: number;
  expired: number;
  completed: number;
  total_revenue: number;
}> {
  await initBookingsTable();

  const result = await turso.execute(
    `SELECT
       COUNT(*) as total,
       SUM(CASE WHEN status = 'RESERVED' THEN 1 ELSE 0 END) as reserved,
       SUM(CASE WHEN status = 'BOOKED' THEN 1 ELSE 0 END) as booked,
       SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled,
       SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END) as expired,
       SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
       COALESCE(SUM(CASE WHEN status IN ('BOOKED', 'COMPLETED') THEN amount ELSE 0 END), 0) as total_revenue
     FROM bookings`
  );

  const row = result.rows[0] as unknown as Record<string, number>;
  return {
    total: row.total || 0,
    reserved: row.reserved || 0,
    booked: row.booked || 0,
    cancelled: row.cancelled || 0,
    expired: row.expired || 0,
    completed: row.completed || 0,
    total_revenue: row.total_revenue || 0,
  };
}
