"use client";

import { usePathname } from "next/navigation";
import { AdminAuthProvider } from "./_components/AdminAuthProvider";
import { QueryProvider } from "./_components/QueryProvider";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";

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

  return (
    <QueryProvider>
      <AdminAuthProvider>
        {children}
        {/* <PWAInstallPrompt /> TEMP DISABLED */}
      </AdminAuthProvider>
    </QueryProvider>
  );
}
