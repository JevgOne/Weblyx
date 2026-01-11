import type { Metadata } from "next";
import { AdminLayoutClient } from "./_components/AdminLayoutClient";

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
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
