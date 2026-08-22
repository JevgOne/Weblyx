import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { AdminLayoutClient } from "./_components/AdminLayoutClient";
import "./admin.css";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

// Noindex for entire admin panel - prevent search engines from indexing
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  title: {
    template: '%s | Admin Panel',
    default: 'Admin Panel',
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`wbx-admin ${manrope.variable}`}>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </div>
  );
}
