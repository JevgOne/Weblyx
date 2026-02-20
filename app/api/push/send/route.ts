import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { turso } from "@/lib/turso";

/**
 * POST /api/push/send
 * Send Web Push notification to all admin subscriptions
 */
export async function POST(request: NextRequest) {
  try {
    // Configure web-push with VAPID keys (lazy initialization)
    if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        'mailto:info@weblyx.cz',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    } else {
      return NextResponse.json(
        { error: 'VAPID keys not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { notification } = body;

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification payload is required' },
        { status: 400 }
      );
    }

    // Get all push subscriptions from database
    const result = await turso.execute(
      'SELECT subscription FROM push_subscriptions WHERE active = 1'
    );

    const subscriptions = result.rows.map((row) =>
      JSON.parse(row.subscription as string)
    );

    if (subscriptions.length === 0) {
      console.warn('No active push subscriptions found');
      return NextResponse.json({
        success: true,
        sent: 0,
        failed: 0,
        message: 'No active subscriptions',
      });
    }

    // Send notification to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map((subscription) =>
        webpush.sendNotification(subscription, JSON.stringify(notification))
      )
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
    });
  } catch (error: any) {
    console.error('Error sending push notification:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send notification',
      },
      { status: 500 }
    );
  }
}
