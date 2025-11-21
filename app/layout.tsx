import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieConsent } from "@/components/cookie-consent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://weblyx.cz"),
  title: {
    default: "Tvorba webových stránek od 8 990 Kč | Web do 7 dní | Weblyx",
    template: "%s | Weblyx",
  },
  description: "Moderní a rychlá tvorba webových stránek od 8 990 Kč. Web do 5–7 dní, načítání pod 2 sekundy, SEO v ceně a transparentní balíčky STARTER, BUSINESS a ENTERPRISE. Nezávazná konzultace zdarma.",
  keywords: [
    "tvorba webů",
    "webové stránky",
    "levné weby",
    "e-shop",
    "SEO optimalizace",
    "webová agentura",
    "tvorba e-shopů",
    "redesign webu",
    "rychlé weby",
    "responzivní design",
    "webdesign",
    "vývojář webů",
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
    title: "Tvorba webových stránek od 8 990 Kč | Web do 7 dní",
    description: "Moderní a rychlá tvorba webových stránek od 8 990 Kč. Web do 5–7 dní, načítání pod 2 sekundy, SEO v ceně.",
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
    title: "Tvorba webových stránek od 8 990 Kč | Web do 7 dní",
    description: "Moderní a rychlá tvorba webových stránek od 8 990 Kč. Web do 5–7 dní, načítání pod 2 sekundy.",
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
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <Header />
        {children}
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
