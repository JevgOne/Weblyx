"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";

interface AdminAuthContextType {
  user: User | null;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  loading: true,
});

export const useAdminAuth = () => useContext(AdminAuthContext);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser: any) => {
      if (!currentUser) {
        router.push("/admin/login");
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Načítání...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={{ user, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
