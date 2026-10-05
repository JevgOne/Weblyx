import Script from 'next/script';
import { LoadOnInteraction } from './LoadOnInteraction';

// Google Ads tag ID. It is not the account number: 829-183-7393 is the
// customer id and was used here for months, so the Ads tag never loaded and no
// conversion or remarketing audience ever reached the account. The tag's own id
// comes from the account's conversion actions (send_to of 'Submit lead form').
const GOOGLE_ADS_ID = 'AW-17746246958';

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

      {/* The library itself waits for the first interaction; gtag() calls
          queue in dataLayer until then. See LoadOnInteraction. */}
      <LoadOnInteraction srcs={[`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`]} />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            'anonymize_ip': true
          });
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}
