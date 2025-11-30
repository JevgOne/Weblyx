"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { requestNotificationPermission, savePushSubscription, subscribeToPushNotifications } from "@/lib/push-notifications/fcm-client";

export function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check current permission status
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Subscribe to foreground messages
    const unsubscribe = subscribeToPushNotifications((payload) => {
      console.log('Notification received in foreground:', payload);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleEnableNotifications = async () => {
    setLoading(true);

    try {
      const subscription = await requestNotificationPermission();

      if (subscription) {
        setToken(subscription.endpoint);
        setPermission('granted');

        // Save subscription to database (use current user ID)
        // In real app, get user ID from auth context
        const userId = 'admin-' + Math.random().toString(36).substring(7);
        await savePushSubscription(userId, subscription);

        console.log('✅ Push notifications enabled');
      } else {
        setPermission(Notification.permission);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (permission === 'granted' && token) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm">
        <Check className="h-4 w-4 text-green-600" />
        <span className="text-green-900 font-medium">
          Push notifikace zapnuty
        </span>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm">
        <BellOff className="h-4 w-4 text-red-600" />
        <span className="text-red-900">
          Notifikace blokované - povolte je v nastavení prohlížeče
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={handleEnableNotifications}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm font-medium"
    >
      <Bell className="h-4 w-4" />
      {loading ? 'Nastavuji...' : 'Zapnout push notifikace'}
    </button>
  );
}
