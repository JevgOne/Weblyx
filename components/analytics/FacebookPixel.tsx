import Script from 'next/script';

export function FacebookPixel() {
  // Facebook Pixel ID from environment variable
  const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '';

  if (!FB_PIXEL_ID) {
    console.warn('Facebook Pixel ID not configured. Set NEXT_PUBLIC_FB_PIXEL_ID in your .env file.');
    return null;
  }

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
      {/* Facebook Pixel noscript fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
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
  // @ts-ignore
  if (typeof window !== 'undefined' && window.fbq) {
    // @ts-ignore
    window.fbq('track', 'Lead');
    console.log('✅ Facebook Pixel: Lead event tracked');
  }
}

/**
 * Helper to declare fbq type for TypeScript
 */
declare global {
  interface Window {
    fbq: any;
  }
}
