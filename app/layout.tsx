import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieConsent } from "@/components/cookie-consent";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { FacebookPixel } from "@/components/analytics/FacebookPixel";
import { WhatsAppChat } from "@/components/whatsapp-chat";
import { PWAProvider } from "@/components/pwa/PWAProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { getSEOMetadata } from '@/lib/seo-metadata';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Generate dynamic metadata based on domain
export const metadata: Metadata = {
  ...getSEOMetadata(),
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  verification: {
    google: "google-site-verification-code", // TODO: Add actual verification code
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get messages for i18n
  const messages = await getMessages();

  // Detect locale from middleware header
  const locale = 'cs'; // Default to Czech for now (middleware will handle domain detection)

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Weblyx Admin" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Weblyx" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#14B8A6" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <GoogleAnalytics />
          <FacebookPixel />
          <PWAProvider>
            <Header />
            {children}
            <Footer />
            <CookieConsent />
            <WhatsAppChat />
          </PWAProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
