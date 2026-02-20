import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";

/**
 * POST /api/push/subscribe
 * Save push subscription to database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, subscription, platform } = body;

    if (!userId || !subscription) {
      return NextResponse.json(
        { error: 'userId and subscription are required' },
        { status: 400 }
      );
    }

    // Save or update subscription in database
    await turso.execute({
      sql: `
        INSERT INTO push_subscriptions (user_id, subscription, platform, created_at, active)
        VALUES (?, ?, ?, datetime('now'), 1)
        ON CONFLICT(user_id) DO UPDATE SET
          subscription = excluded.subscription,
          platform = excluded.platform,
          created_at = datetime('now'),
          active = 1
      `,
      args: [userId, JSON.stringify(subscription), platform || 'unknown'],
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription saved successfully',
    });
  } catch (error: any) {
    console.error('Error saving push subscription:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to save subscription',
      },
      { status: 500 }
    );
  }
}
