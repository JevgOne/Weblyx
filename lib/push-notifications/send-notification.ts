interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
  data?: Record<string, any>;
}

/**
 * Send push notification to all admin users
 * Uses Web Push API (no Firebase required)
 */
export async function sendPushNotificationToAdmins(payload: PushNotificationPayload) {
  try {
    console.log(`📤 Sending push notification to admins`);

    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notification: {
          title: payload.title,
          body: payload.body,
          icon: payload.icon || '/android-chrome-192x192.png',
          badge: '/android-chrome-192x192.png',
          tag: payload.tag || 'default',
          data: {
            url: payload.url || '/admin/leads',
            ...payload.data,
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send notification');
    }

    const result = await response.json();

    console.log(`✅ Push notifications sent: ${result.sent} successful, ${result.failed} failed`);

    return {
      success: true,
      sent: result.sent || 0,
      failed: result.failed || 0,
    };
  } catch (error: any) {
    console.error('❌ Error sending push notifications:', error);
    return {
      success: false,
      error: error.message || 'Failed to send notifications',
      sent: 0,
      failed: 0,
    };
  }
}
