import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "../nova/nova.css";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Archiv změn | Weblyx",
  description:
    "Chronologický přehled změn na webu Weblyx — nové projekty, recenze a úpravy obsahu.",
};

export default function ArchivLayout({ children }: { children: React.ReactNode }) {
  return <div className={`nova ${manrope.variable}`}>{children}</div>;
}
