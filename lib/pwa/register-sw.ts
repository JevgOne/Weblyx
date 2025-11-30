/**
 * Register service worker for PWA functionality
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        // Skip in production for now due to issues
        if (window.location.hostname === 'weblyx.cz' || window.location.hostname === 'www.weblyx.cz') {
          console.log('⚠️ Service Worker disabled in production');
          return;
        }

        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('✅ Service Worker registered:', registration);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available, prompt user to refresh
              console.log('🔄 New version available! Please refresh.');

              // Optional: Show update notification
              if (confirm('Nová verze aplikace je k dispozici. Obnovit stránku?')) {
                window.location.reload();
              }
            }
          });
        });

        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    });
  }
}

/**
 * Unregister service worker (for debugging)
 */
export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('Service Worker unregistered');
    }
  }
}
