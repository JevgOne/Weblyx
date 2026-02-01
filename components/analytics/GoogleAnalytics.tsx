import Script from 'next/script';

export function GoogleAnalytics() {
  // Dynamic GA4 ID based on domain
  const isGermanSite = process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de';
  const GA_MEASUREMENT_ID = isGermanSite
    ? process.env.NEXT_PUBLIC_GA4_ID_DE || 'G-XXXXXXXXXX' // Seitelyx.de (German)
    : process.env.NEXT_PUBLIC_GA4_ID_CS || 'G-Q08S39LQVK';  // Weblyx.cz (Czech)

  return (
    <>
      {/* Google Consent Mode v2 - Default to DENIED (GDPR compliant) */}
      <Script id="google-consent-mode" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}

          gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'wait_for_update': 500
          });
        `}
      </Script>

      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            'anonymize_ip': true
          });
        `}
      </Script>
    </>
  );
}
