'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import Cookies from 'js-cookie';

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '883179307835842';

export function FacebookPixel() {
  useEffect(() => {
    const checkAndUpdateConsent = () => {
      if (typeof window === 'undefined' || !window.fbq) return;

      const consent = Cookies.get('cookie-consent');
      if (consent) {
        try {
          const parsed = JSON.parse(consent);
          if (parsed.marketing === true) {
            window.fbq('consent', 'grant');
          }
        } catch {
          // Invalid cookie, keep revoked
        }
      }
    };

    // Check immediately and on cookie changes
    checkAndUpdateConsent();
    const interval = setInterval(checkAndUpdateConsent, 2000);

    // Stop polling once consent is granted
    const stopWhenGranted = setInterval(() => {
      const consent = Cookies.get('cookie-consent');
      if (consent) {
        try {
          const parsed = JSON.parse(consent);
          if (parsed.marketing === true) {
            clearInterval(interval);
            clearInterval(stopWhenGranted);
          }
        } catch {
          // keep polling
        }
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(stopWhenGranted);
    };
  }, []);

  if (!FB_PIXEL_ID) return null;

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('consent', 'revoke');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
    </>
  );
}

/**
 * Helper function to track Facebook Pixel events
 */
export function trackLeadEvent() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead');
  }
}

declare global {
  interface Window {
    fbq: any;
  }
}
