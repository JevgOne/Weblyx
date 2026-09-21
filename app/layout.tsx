import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SiteChrome, CookieChrome } from "@/components/layout/site-chrome";
import { CookieConsent } from "@/components/cookie-consent";
import { OrderPauseModal } from "@/components/order-pause-modal";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { FacebookPixel } from "@/components/analytics/FacebookPixel";
import { WhatsAppChat } from "@/components/whatsapp-chat";
import { PWAProvider } from "@/components/pwa/PWAProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getSEOMetadata } from '@/lib/seo-metadata';
import { getBrandConfig } from '@/lib/brand';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

// Generate dynamic metadata based on domain
export async function generateMetadata(): Promise<Metadata> {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'weblyx.cz';
  const isSeitelyx = domain.includes('seitelyx.de');

  // Use seitelyx icon for seitelyx.de, otherwise use default weblyx icons
  const iconUrl = isSeitelyx ? "/seitelyx-icon.svg" : "/favicon.ico";
  const favicon16 = isSeitelyx ? "/seitelyx-icon.svg" : "/favicon-16x16.png";
  const favicon32 = isSeitelyx ? "/seitelyx-icon.svg" : "/favicon-32x32.png";

  return {
    ...getSEOMetadata(),
    icons: {
      icon: [
        { url: iconUrl },
        { url: favicon16, sizes: "16x16", type: isSeitelyx ? "image/svg+xml" : "image/png" },
        { url: favicon32, sizes: "32x32", type: isSeitelyx ? "image/svg+xml" : "image/png" },
      ],
      shortcut: iconUrl,
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        { rel: "icon", url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { rel: "icon", url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    manifest: "/site.webmanifest",
    // verification: { google: "ADD_YOUR_CODE_HERE" }, // Add Google Search Console verification code
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Brand and locale come from the build, not the request — see i18n/request.ts.
  const brand = getBrandConfig();
  const locale = brand.locale;

  // Imported directly rather than through `getMessages()`, which reads the
  // request locale header and would put this layout — and therefore every
  // route under it — back into dynamic rendering.
  const messages = (await import(`../messages/${locale}.json`)).default;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content={`${brand.name} Admin`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={brand.name} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content={brand.colors.primary} />
        <link rel="alternate" type="application/rss+xml" title={`${brand.name} Blog`} href="/feed.xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Analytics - placed in head for optimal tracking */}
        <GoogleAnalytics />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider locale={locale} timeZone="Europe/Prague" messages={messages}>
          <ThemeProvider>
            <PWAProvider>
              <SiteChrome>
                <Header />
              </SiteChrome>
              {children}
              <SiteChrome>
                <Footer />
                <OrderPauseModal />
                <WhatsAppChat />
              </SiteChrome>
              <CookieChrome>
                <CookieConsent />
              </CookieChrome>
              {/* Pixel stays on every route so tracking is never gated by chrome */}
              <FacebookPixel />
            </PWAProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
