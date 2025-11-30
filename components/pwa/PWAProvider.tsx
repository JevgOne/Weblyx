"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/pwa/register-sw";

/**
 * PWA Provider - registers service worker and handles PWA lifecycle
 */
export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Detect if running as PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true;

    if (isPWA) {
      console.log('🚀 Running as PWA');
      document.documentElement.classList.add('pwa-mode');
    }

    // Handle online/offline status
    const updateOnlineStatus = () => {
      if (navigator.onLine) {
        console.log('✅ Back online');
        document.body.classList.remove('offline');
      } else {
        console.log('❌ Offline');
        document.body.classList.add('offline');
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return <>{children}</>;
}
