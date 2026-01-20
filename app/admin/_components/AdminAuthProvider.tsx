"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { UserRole, Permission } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/permissions";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  can: (permission: Permission) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  loading: true,
  can: () => false,
});

export const useAdminAuth = () => useContext(AdminAuthContext);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth status via API
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Not authenticated, redirect to login
          router.push("/admin/login");
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading state briefly
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Načítání...</p>
        </div>
      </div>
    );
  }

  // SECURITY: If not authenticated after loading, don't render children
  // Redirect already happened in checkAuth(), just block rendering
  if (!user) {
    return null;
  }

  // Helper function to check if user has permission
  const can = (permission: Permission): boolean => {
    return hasPermission(user?.role, permission);
  };

  return (
    <AdminAuthContext.Provider value={{ user, loading, can }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
