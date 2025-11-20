"use client";

import { usePathname } from "next/navigation";
import { AdminAuthProvider } from "./_components/AdminAuthProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't wrap login page with auth provider
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
