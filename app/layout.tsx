import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieConsent } from "@/components/cookie-consent";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://weblyx.cz"),
  title: {
    default: "Tvorba webových stránek od 10 000 Kč | Web za týden | Weblyx",
    template: "%s | Weblyx",
  },
  description: "⚡ Rychlá tvorba webových stránek od 10 000 Kč (AKCE 7 990 Kč). Web do týdne (5–7 dní), nejrychlejší načítání pod 2 sekundy, SEO zdarma. Kolik stojí webové stránky? Od 10K! Nezávazná konzultace zdarma.",
  keywords: [
    "tvorba webových stránek",
    "tvorba webu",
    "webové stránky cena",
    "kolik stojí webové stránky",
    "levné webové stránky",
    "rychlá tvorba webu",
    "web za týden",
    "web do týdne",
    "web od 10 000 Kč",
    "nejrychlejší webové stránky",
    "web pod 2 sekundy",
    "Next.js web",
    "web pro živnostníky",
    "e-shop na míru",
    "SEO optimalizace",
    "webdesign",
  ],
  authors: [{ name: "Weblyx", url: "https://weblyx.cz" }],
  creator: "Weblyx",
  publisher: "Weblyx",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: "https://weblyx.cz",
    title: "Tvorba webových stránek od 10 000 Kč | Web za týden",
    description: "⚡ Rychlá tvorba webových stránek od 10 000 Kč (AKCE 7 990 Kč). Web do týdne, nejrychlejší načítání pod 2 sekundy, SEO zdarma.",
    siteName: "Weblyx",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Weblyx - Tvorba webových stránek od 8 990 Kč",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tvorba webových stránek od 10 000 Kč | Web za týden",
    description: "⚡ Rychlá tvorba webových stránek od 10 000 Kč (AKCE 7 990 Kč). Web do týdne, nejrychlejší načítání pod 2 sekundy.",
    images: ["/og-image.jpg"],
    creator: "@weblyx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://weblyx.cz",
  },
  verification: {
    google: "google-site-verification-code", // TODO: Add actual verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <GoogleAnalytics />
      <body className={`${inter.variable} font-sans antialiased`}>
        <Header />
        {children}
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
