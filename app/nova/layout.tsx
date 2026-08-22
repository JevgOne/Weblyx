import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./nova.css";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"], // latin-ext carries ě/š/č/ř/ž/ů
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Weblyx — profesionální web za týden",
  description:
    "Tvoříme rychlé a moderní weby pro živnostníky a malé firmy. Základní web za 5–7 pracovních dní, načítání pod 2 sekundy, SEO v ceně. Od 8 000 Kč jednorázově.",
  // Preview route: kept out of the index so it cannot compete with the live
  // homepage for the same queries while both are published.
  robots: { index: false, follow: false },
};

export default function NovaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`nova ${manrope.variable}`}>{children}</div>;
}
