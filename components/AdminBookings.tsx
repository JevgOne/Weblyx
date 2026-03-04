"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Filter,
  RefreshCw,
  XCircle,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Booking, BookingStatus } from "@/types/booking";

interface BookingStats {
  total: number;
  reserved: number;
  booked: number;
  cancelled: number;
  expired: number;
  completed: number;
  total_revenue: number;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  RESERVED: "Čeká na platbu",
  BOOKED: "Zaplaceno",
  CANCELLED: "Zrušeno",
  EXPIRED: "Vypršelo",
  COMPLETED: "Dokončeno",
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  RESERVED: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  BOOKED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  EXPIRED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

export function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [emailFilter, setEmailFilter] = useState("");

  const LIMIT = 20;

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: (page * LIMIT).toString(),
      });
      if (statusFilter) params.set("status", statusFilter);
      if (emailFilter) params.set("client_email", emailFilter);

      const res = await fetch(`/api/admin/bookings?${params}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setBookings(data.bookings);
        setTotal(data.total);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
    setLoading(false);
  }, [page, statusFilter, emailFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleAction = async (bookingId: string, action: "cancel" | "complete") => {
    setActionLoading(bookingId);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action, booking_id: bookingId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchBookings();
      }
    } catch (err) {
      console.error("Action failed:", err);
    }
    setActionLoading(null);
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-");
    return `${d}.${m}.${y}`;
  };

  const formatRevenue = (halere: number) => {
    return new Intl.NumberFormat("cs-CZ").format(halere / 100) + " Kč";
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Celkem</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.reserved}</p>
              <p className="text-xs text-muted-foreground">Čeká na platbu</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats.booked}</p>
              <p className="text-xs text-muted-foreground">Zaplaceno</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Dokončeno</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.expired}</p>
              <p className="text-xs text-muted-foreground">Vypršelo</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-teal-600">{formatRevenue(stats.total_revenue)}</p>
              <p className="text-xs text-muted-foreground">Tržby</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtry
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchBookings}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Obnovit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="border rounded-md px-3 py-2 text-sm bg-background"
            >
              <option value="">Všechny stavy</option>
              <option value="RESERVED">Čeká na platbu</option>
              <option value="BOOKED">Zaplaceno</option>
              <option value="CANCELLED">Zrušeno</option>
              <option value="EXPIRED">Vypršelo</option>
              <option value="COMPLETED">Dokončeno</option>
            </select>

            <Input
              placeholder="Hledat e-mail..."
              value={emailFilter}
              onChange={(e) => {
                setEmailFilter(e.target.value);
                setPage(0);
              }}
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Rezervace ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Žádné rezervace
            </p>
          ) : (
            <div className="space-y-2">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {booking.client_name}
                      </span>
                      <Badge
                        className={`text-xs ${STATUS_COLORS[booking.status]}`}
                      >
                        {STATUS_LABELS[booking.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(booking.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {booking.start_time}—{booking.end_time}
                      </span>
                      <span>{booking.client_email}</span>
                      {booking.amount && (
                        <span className="font-medium">
                          {formatRevenue(booking.amount)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {(booking.status === "RESERVED" || booking.status === "BOOKED") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleAction(booking.id, "cancel")}
                        disabled={actionLoading === booking.id}
                      >
                        {actionLoading === booking.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        Zrušit
                      </Button>
                    )}
                    {booking.status === "BOOKED" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleAction(booking.id, "complete")}
                        disabled={actionLoading === booking.id}
                      >
                        {actionLoading === booking.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Dokončit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Předchozí
              </Button>
              <span className="text-sm text-muted-foreground">
                Strana {page + 1} z {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                Další
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
