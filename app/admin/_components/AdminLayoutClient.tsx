"use client";

import { usePathname } from "next/navigation";
import { AdminAuthProvider } from "./AdminAuthProvider";
import { QueryProvider } from "./QueryProvider";
import { AdminLanguageProvider } from "@/lib/admin-i18n";
import { AdminShell } from "./AdminShell";

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
          {/* Shell sits inside the auth provider so navigation can be filtered
              by the signed-in user's permissions. */}
          <AdminShell>{children}</AdminShell>
        </AdminAuthProvider>
      </QueryProvider>
    </AdminLanguageProvider>
  );
}
