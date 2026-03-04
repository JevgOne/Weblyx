"use client";

import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { AdminBookings } from "@/components/AdminBookings";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminBookingsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Rezervace</h1>
            <p className="text-sm text-muted-foreground">
              Správa rezervací a kalendáře
            </p>
          </div>
        </div>

        <AdminBookings />
      </div>
    </div>
  );
}
