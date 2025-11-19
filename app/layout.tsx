import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Weblyx | Tvorba webů od 10 000 Kč | Dodání za 5-7 dní",
  description: "Profesionální webové stránky za skvělé ceny. Dodání za 5-7 dní. Moderní design, SEO optimalizace a rychlé načítání. Nezávazná konzultace zdarma.",
  keywords: ["tvorba webů", "webové stránky", "levné weby", "e-shop", "SEO", "webová agentura"],
  authors: [{ name: "Weblyx" }],
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: "https://weblyx.cz",
    title: "Weblyx | Tvorba webů od 10 000 Kč",
    description: "Profesionální webové stránky za skvělé ceny. Dodání za 5-7 dní.",
    siteName: "Weblyx",
  },
  robots: {
    index: true,
    follow: true,
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
      </body>
    </html>
  );
}
