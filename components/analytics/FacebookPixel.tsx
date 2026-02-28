'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import Cookies from 'js-cookie';

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '883179307835842';

export function FacebookPixel() {
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      const consent = Cookies.get('cookie-consent');
      if (consent) {
        try {
          const parsed = JSON.parse(consent);
          setMarketingConsent(parsed.marketing === true);
        } catch {
          setMarketingConsent(false);
        }
      }
    };

    checkConsent();

    // Re-check when cookie changes (user accepts cookies)
    const interval = setInterval(checkConsent, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!FB_PIXEL_ID || !marketingConsent) return null;

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
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

/**
 * Helper function to track Facebook Pixel events
 * Usage: trackLeadEvent() when user clicks CTA button
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
