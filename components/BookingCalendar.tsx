"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CZECH_MONTH_NAMES, CZECH_DAY_NAMES_SHORT } from "@/lib/booking-utils";
import type { DaySummary, BookingMonthResponse } from "@/types/booking";
import { TimeSlotPicker } from "./TimeSlotPicker";

interface BookingCalendarProps {
  profileId?: string;
  businessId?: string;
  hourlyRate?: number;
}

export function BookingCalendar({ profileId, businessId, hourlyRate }: BookingCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [days, setDays] = useState<DaySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const entityParam = profileId
    ? `profileId=${profileId}`
    : `businessId=${businessId}`;

  const fetchMonth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/bookings/month?${entityParam}&year=${year}&month=${month}`
      );
      const data: BookingMonthResponse = await res.json();
      if (data.success) {
        setDays(data.days);
      }
    } catch (err) {
      console.error("Failed to fetch month data:", err);
    }
    setLoading(false);
  }, [entityParam, year, month]);

  useEffect(() => {
    fetchMonth();
  }, [fetchMonth]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDate(null);
  };

  // Build calendar grid (Monday-first)
  const firstDayOfMonth = new Date(year, month - 1, 1);
  // JS getDay: 0=Sun. We want 0=Mon.
  let startDayOffset = firstDayOfMonth.getDay() - 1;
  if (startDayOffset < 0) startDayOffset = 6;

  const daysInMonth = new Date(year, month, 0).getDate();

  // Header: Po Út St Čt Pá So Ne
  const weekHeaders = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

  const dayMap = new Map<string, DaySummary>();
  days.forEach((d) => dayMap.set(d.date, d));

  // Cannot go before current month
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth() + 1;

  // Status colors
  const statusColors: Record<string, string> = {
    available: "bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30 border-emerald-500/30",
    partial: "bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 border-amber-500/30",
    full: "bg-red-500/20 text-red-500 border-red-500/30",
    closed: "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600",
    past: "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600",
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              disabled={isCurrentMonth}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-lg">
              {CZECH_MONTH_NAMES[month - 1]} {year}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-emerald-500/40" /> Volno
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-amber-500/40" /> Částečně
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-red-500/40" /> Obsazeno
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-gray-300 dark:bg-gray-700" /> Zavřeno
            </span>
          </div>

          {/* Week headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekHeaders.map((h) => (
              <div
                key={h}
                className="text-center text-xs font-medium text-muted-foreground py-1"
              >
                {h}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells before first day */}
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${month.toString().padStart(2, "0")}-${dayNum
                  .toString()
                  .padStart(2, "0")}`;
                const daySummary = dayMap.get(dateStr);
                const status = daySummary?.status || "closed";
                const isClickable =
                  status === "available" || status === "partial";
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => isClickable && setSelectedDate(dateStr)}
                    disabled={!isClickable}
                    className={`
                      h-10 rounded border text-sm font-medium transition-colors
                      ${statusColors[status]}
                      ${isClickable ? "cursor-pointer" : "cursor-default"}
                      ${isSelected ? "ring-2 ring-teal-500 ring-offset-1" : ""}
                    `}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time slot picker for selected date */}
      {selectedDate && (
        <TimeSlotPicker
          date={selectedDate}
          profileId={profileId}
          businessId={businessId}
          hourlyRate={hourlyRate}
          onClose={() => setSelectedDate(null)}
          onReserved={() => {
            setSelectedDate(null);
            fetchMonth();
          }}
        />
      )}
    </div>
  );
}
