import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";

/**
 * GET /api/push/subscriptions
 * Get all active push subscriptions
 */
export async function GET(request: NextRequest) {
  try {
    const result = await turso.execute(
      'SELECT user_id, subscription, platform, created_at FROM push_subscriptions WHERE active = 1'
    );

    const subscriptions = result.rows
      .map((row) => {
        try {
          return {
            userId: row.user_id,
            subscription: JSON.parse(row.subscription as string),
            platform: row.platform,
            createdAt: row.created_at,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      subscriptions,
    });
  } catch (error: any) {
    console.error('❌ Error getting push subscriptions:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get subscriptions',
      },
      { status: 500 }
    );
  }
}
