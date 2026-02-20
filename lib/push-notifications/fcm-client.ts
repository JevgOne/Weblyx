/**
 * Request notification permission and get Push subscription
 */
export async function requestNotificationPermission(): Promise<PushSubscription | null> {
  try {
    // Check if notifications are supported
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('This browser does not support push notifications');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      return null;
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
      ),
    });

    return subscription;
  } catch (error) {
    console.error('Error getting push subscription:', error);
    return null;
  }
}

/**
 * Subscribe to foreground messages (Web Push)
 */
export function subscribeToPushNotifications(callback: (payload: any) => void) {
  try {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return () => {};
    }

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'NOTIFICATION_RECEIVED') {
        callback(event.data.payload);
      }
    });

    return () => {
      // Cleanup if needed
    };
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return () => {};
  }
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray as BufferSource;
}

/**
 * Save push subscription to database
 */
export async function savePushSubscription(
  userId: string,
  subscription: PushSubscription
) {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        subscription: subscription.toJSON(),
        platform: navigator.userAgent,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save subscription');
    }
  } catch (error) {
    console.error('Error saving push subscription:', error);
  }
}

/**
 * Get all push subscriptions for admin users
 */
export async function getAdminPushSubscriptions(): Promise<any[]> {
  try {
    const response = await fetch('/api/push/subscriptions');
    const result = await response.json();

    if (result.success) {
      return result.subscriptions || [];
    }

    return [];
  } catch (error) {
    console.error('Error getting push subscriptions:', error);
    return [];
  }
}
