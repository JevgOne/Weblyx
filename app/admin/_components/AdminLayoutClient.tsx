"use client";

import { usePathname } from "next/navigation";
import { AdminAuthProvider } from "./AdminAuthProvider";
import { QueryProvider } from "./QueryProvider";
import { AdminLanguageProvider } from "@/lib/admin-i18n";

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't wrap login/register pages with auth provider
  if (pathname === "/admin/login" || pathname === "/admin/register") {
    return (
      <AdminLanguageProvider>
        {children}
      </AdminLanguageProvider>
    );
  }

  return (
    <AdminLanguageProvider>
      <QueryProvider>
        <AdminAuthProvider>
          {children}
        </AdminAuthProvider>
      </QueryProvider>
    </AdminLanguageProvider>
  );
}
