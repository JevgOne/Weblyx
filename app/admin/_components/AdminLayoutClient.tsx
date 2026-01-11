"use client";

import { usePathname } from "next/navigation";
import { AdminAuthProvider } from "./AdminAuthProvider";
import { QueryProvider } from "./QueryProvider";

export function AdminLayoutClient({
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
      </AdminAuthProvider>
    </QueryProvider>
  );
}
