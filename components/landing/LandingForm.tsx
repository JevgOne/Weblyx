"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { HoneypotInput } from "@/components/security/HoneypotInput";
import { captureAttribution } from "@/components/tracking/AttributionFields";

/**
 * The enquiry form the landing pages carry.
 *
 * It posts to /api/contact, which is already whitelisted in middleware — a new
 * endpoint would mean editing the exact-match list there and the test that
 * pins it, for no gain.
 *
 * That endpoint requires five fields. A landing page that asks for five is a
 * landing page nobody fills in, so the form asks for four and derives the
 * fifth: `description` is composed from what was actually entered. Nothing is
 * invented — it records the choice the visitor made.
 *
 * GA4: `form_submit` fires on every submission and `generate_lead` only when
 * the server confirms, so a failed request cannot be counted as a lead. Both
 * are gated by Consent Mode, which defaults to denied until the cookie bar is
 * answered — a visitor who ignores it is not measured.
 */
const PROJECT_TYPES = [
  { value: "new-web", label: "Nový web" },
  { value: "redesign", label: "Redesign stávajícího" },
  { value: "eshop", label: "E-shop" },
  { value: "other", label: "Něco jiného" },
] as const;

function track(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
  gtag?.("event", event, params);
}

export function LandingForm({
  heading = "Nezávazná poptávka",
  note,
  source,
}: {
  heading?: string;
  note?: string;
  /** Which landing page this came from — lands in the enquiry text. */
  source: string;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "new-web",
    companyName: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim()) {
      setError("Vyplňte prosím jméno a e-mail.");
      return;
    }

    setSending(true);
    track("form_submit", { form_id: source });

    const typeLabel =
      PROJECT_TYPES.find((t) => t.value === form.projectType)?.label ?? form.projectType;

    try {
      // The honeypot fields live in the form element, not in state.
      const el = e.currentTarget;
      const hidden: Record<string, string> = {};
      new FormData(el).forEach((value, key) => {
        if (key.startsWith("_") || key === "__form_timestamp") hidden[key] = String(value);
      });

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          projectType: form.projectType,
          // Required by the endpoint; a landing page does not ask for it.
          companyName: form.companyName.trim() || form.name.trim(),
          description: `Poptávka ze stránky ${source}. Zájem o: ${typeLabel}.`,
          ...hidden,
          ...captureAttribution(),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Odeslání selhalo");

      setSent(true);
      // Only after the server confirmed — a failed request is not a lead.
      track("generate_lead", { currency: "CZK", value: 10000, form_id: source });
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Něco se pokazilo. Zkuste to znovu nebo volejte +420 702 110 166."
      );
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-8 text-center space-y-3">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
          <h3 className="text-xl font-bold">Máme to, děkujeme.</h3>
          <p className="text-muted-foreground">
            Ozveme se do 24 hodin na <strong>{form.email}</strong>. Spěchá to?
            Zavolejte na{" "}
            <a href="tel:+420702110166" className="text-primary hover:underline">
              +420 702 110 166
            </a>.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-1 text-xl font-bold">{heading}</h2>
        {note && <p className="mb-4 text-sm text-muted-foreground">{note}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <HoneypotInput />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lf-name">Jméno *</Label>
              <Input
                id="lf-name"
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Jan Novák"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lf-email">E-mail *</Label>
              <Input
                id="lf-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="jan@firma.cz"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lf-phone">Telefon</Label>
              <Input
                id="lf-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+420 …"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lf-type">Co potřebujete</Label>
              <select
                id="lf-type"
                value={form.projectType}
                onChange={(e) => setForm((p) => ({ ...p, projectType: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Odesílám…
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Chci nezávaznou nabídku
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Odpovíme do 24 hodin. Nezávazné a zdarma.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
