import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import "./nova/nova.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieChrome } from "@/components/layout/site-chrome";
import { NovaHeader } from "@/components/nova/header";
import { NovaFooter } from "@/components/nova/footer";
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

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

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
  const isCzech = locale === "cs";

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
      <body className={`${inter.variable} ${manrope.variable} font-sans antialiased${isCzech ? " nova" : ""}`}>
        <NextIntlClientProvider locale={locale} timeZone="Europe/Prague" messages={messages}>
          <ThemeProvider>
            <PWAProvider>
              {/* The chrome is chosen here, on the server, because the locale
                  is a build-time constant and the route is not: a client
                  component deciding this from usePathname() renders the wrong
                  answer into prerendered HTML, which is how the Czech homepage
                  ended up with two headers and two footers. */}
              {isCzech ? <NovaHeader /> : <Header />}
              {children}
              {isCzech ? (
                <NovaFooter />
              ) : (
                <>
                  <Footer />
                  <OrderPauseModal />
                  <WhatsAppChat />
                </>
              )}
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
