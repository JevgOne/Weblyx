"use client";

import { useState, useEffect } from "react";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getCzechDayName } from "@/lib/booking-utils";
import type { TimeSlot, BookingSlotsResponse } from "@/types/booking";
import { BookingModal } from "./BookingModal";

interface TimeSlotPickerProps {
  date: string;
  profileId?: string;
  businessId?: string;
  hourlyRate?: number;
  onClose: () => void;
  onReserved: () => void;
}

export function TimeSlotPicker({
  date,
  profileId,
  businessId,
  hourlyRate,
  onClose,
  onReserved,
}: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayName, setDayName] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const entityParam = profileId
    ? `profileId=${profileId}`
    : `businessId=${businessId}`;

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/bookings/slots?${entityParam}&date=${date}`
        );
        const data: BookingSlotsResponse = await res.json();
        if (data.success) {
          setSlots(data.slots);
          setDayName(data.day_name);
        }
      } catch (err) {
        console.error("Failed to fetch slots:", err);
      }
      setLoading(false);
    };
    fetchSlots();
  }, [entityParam, date]);

  // Format date for display: "15. března 2026"
  const [y, m, d] = date.split("-");
  const monthNames = [
    "ledna", "února", "března", "dubna", "května", "června",
    "července", "srpna", "září", "října", "listopadu", "prosince",
  ];
  const displayDate = `${parseInt(d)}. ${monthNames[parseInt(m) - 1]} ${y}`;

  const statusConfig = {
    available: {
      color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700",
      badge: "Volno",
      badgeVariant: "outline" as const,
    },
    reserved: {
      color: "bg-amber-500/10 border-amber-500/30 text-amber-700",
      badge: "Rezervováno",
      badgeVariant: "secondary" as const,
    },
    booked: {
      color: "bg-red-500/10 border-red-500/30 text-red-600",
      badge: "Obsazeno",
      badgeVariant: "destructive" as const,
    },
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {dayName} {displayDate}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Žádné dostupné termíny
            </p>
          ) : (
            <div className="space-y-2">
              {slots.map((slot) => {
                const config = statusConfig[slot.status];
                return (
                  <div
                    key={slot.start_time}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border
                      ${config.color}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm">
                        {slot.start_time} — {slot.end_time}
                      </span>
                      <Badge variant={config.badgeVariant} className="text-xs">
                        {config.badge}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      {slot.status === "available" && hourlyRate && (
                        <span className="text-sm text-muted-foreground">
                          {hourlyRate} Kč
                        </span>
                      )}
                      {slot.status === "available" && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedSlot(slot)}
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          Rezervovat
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking modal */}
      {selectedSlot && (
        <BookingModal
          date={date}
          slot={selectedSlot}
          profileId={profileId}
          businessId={businessId}
          hourlyRate={hourlyRate}
          onClose={() => setSelectedSlot(null)}
          onSuccess={onReserved}
        />
      )}
    </>
  );
}
