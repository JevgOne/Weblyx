"use client";

import { useState } from "react";
import { Calendar, Clock, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TimeSlot, BookingReserveResponse, BookingPayResponse } from "@/types/booking";

interface BookingModalProps {
  date: string;
  slot: TimeSlot;
  profileId?: string;
  businessId?: string;
  hourlyRate?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingModal({
  date,
  slot,
  profileId,
  businessId,
  hourlyRate,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Format date for display
  const [y, m, d] = date.split("-");
  const monthNames = [
    "ledna", "února", "března", "dubna", "května", "června",
    "července", "srpna", "září", "října", "listopadu", "prosince",
  ];
  const displayDate = `${parseInt(d)}. ${monthNames[parseInt(m) - 1]} ${y}`;

  const handleSubmit = async () => {
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Vyplňte jméno a e-mail");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Neplatný e-mail");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Reserve the slot
      const reserveRes = await fetch("/api/bookings/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          profile_id: profileId,
          business_id: businessId,
          client_name: name.trim(),
          client_email: email.trim(),
          client_phone: phone.trim() || undefined,
          amount: hourlyRate,
          client_note: note.trim() || undefined,
        }),
      });

      const reserveData: BookingReserveResponse = await reserveRes.json();

      if (!reserveData.success || !reserveData.booking) {
        setError(reserveData.error || "Nepodařilo se vytvořit rezervaci");
        setLoading(false);
        return;
      }

      // Step 2: If there's a price, initiate GoPay payment
      if (hourlyRate && hourlyRate > 0) {
        const payRes = await fetch("/api/bookings/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ booking_id: reserveData.booking.id }),
        });

        const payData: BookingPayResponse = await payRes.json();

        if (payData.success && payData.gw_url) {
          // Redirect to GoPay gateway
          window.location.href = payData.gw_url;
          return;
        }

        // Payment initiation failed — booking is still RESERVED
        setError(payData.error || "Nepodařilo se zahájit platbu. Rezervace vytvořena, zaplaťte do 24h.");
        setLoading(false);
        onSuccess();
        return;
      }

      // No price — just reserved
      onSuccess();
    } catch (err) {
      console.error("Booking error:", err);
      setError("Nastala chyba. Zkuste to prosím znovu.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Potvrdit rezervaci</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{displayDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {slot.start_time} — {slot.end_time}
              </span>
            </div>
            {hourlyRate && (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{hourlyRate} Kč</span>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="booking-name">Jméno *</Label>
              <Input
                id="booking-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jan Novák"
              />
            </div>
            <div>
              <Label htmlFor="booking-email">E-mail *</Label>
              <Input
                id="booking-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jan@example.com"
              />
            </div>
            <div>
              <Label htmlFor="booking-phone">Telefon</Label>
              <Input
                id="booking-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+420 123 456 789"
              />
            </div>
            <div>
              <Label htmlFor="booking-note">Poznámka</Label>
              <Textarea
                id="booking-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Volitelná poznámka..."
                rows={2}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-2 rounded">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
              Zrušit
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Zpracovávám...
                </>
              ) : hourlyRate ? (
                "Rezervovat a zaplatit"
              ) : (
                "Rezervovat"
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {hourlyRate
              ? "Po kliknutí budete přesměrováni na platební bránu GoPay. Rezervace platí 24 hodin."
              : "Rezervace bude potvrzena ihned."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
