/**
 * Cron API Endpoint: Release Expired Bookings
 *
 * Runs every 15 minutes via Vercel Cron.
 * Marks RESERVED bookings as EXPIRED if expiresAt < now.
 */

import { NextRequest, NextResponse } from 'next/server';
import { releaseExpiredBookings } from '@/lib/turso/bookings';

function verifyCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET is not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const released = await releaseExpiredBookings();

    return NextResponse.json({
      success: true,
      released,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Release expired bookings cron failed:', error);
    return NextResponse.json(
      { success: false, error: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

export const POST = GET;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
