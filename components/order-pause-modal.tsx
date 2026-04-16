"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarClock, Sparkles, X } from "lucide-react";

const PAUSE_START_MS = Date.parse("2026-04-16T00:00:00+02:00");
const PAUSE_END_MS = Date.parse("2026-05-16T23:59:59+02:00");
const DISMISS_KEY = "order-pause-dismissed";

function readDismissed(): number {
  if (typeof document === "undefined") return 0;
  const match = document.cookie.match(/(?:^|;\s*)order-pause-dismissed=(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function writeDismissed() {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${DISMISS_KEY}=${Date.now()}; expires=${expires}; path=/; SameSite=Lax`;
}

export function OrderPauseModal() {
  const [shouldShow, setShouldShow] = useState(() => {
    const now = Date.now();
    return now >= PAUSE_START_MS && now <= PAUSE_END_MS;
  });
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (readDismissed()) setShouldShow(false);
  }, []);

  const isVisible = shouldShow && !isClosing;

  useEffect(() => {
    if (!isVisible) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isVisible]);

  const close = () => {
    setIsClosing(true);
    writeDismissed();
    setTimeout(() => {
      setShouldShow(false);
      setIsClosing(false);
    }, 200);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/70 backdrop-blur-md transition-opacity duration-200 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-pause-title"
      onClick={close}
    >
      <div
        className={`relative w-full max-w-lg transition-all duration-300 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        style={{ animation: isClosing ? undefined : "fadeInUp 0.4s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative glow behind card */}
        <div className="absolute -top-8 -left-8 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div
          className="absolute -bottom-8 -right-8 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative rounded-3xl border border-primary/20 bg-background/95 backdrop-blur-lg shadow-2xl shadow-primary/20 overflow-hidden">
          {/* Top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-secondary" />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_90%)] opacity-20 pointer-events-none" />

          <button
            type="button"
            onClick={close}
            aria-label="Zavřít"
            className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative p-8 sm:p-10 text-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent text-primary text-xs font-medium border border-primary/20 shadow-lg shadow-primary/5 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Důležité oznámení</span>
            </div>

            {/* Icon */}
            <div className="mx-auto relative w-16 h-16">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <CalendarClock className="h-8 w-8 text-primary" />
              </div>
            </div>

            {/* Heading */}
            <h2
              id="order-pause-title"
              className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight"
            >
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Dočasně nepřijímáme
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                nové objednávky
              </span>
            </h2>

            {/* Body */}
            <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
              Omlouváme se, ale z důvodu velkého počtu objednávek
              pozastavujeme příjem nových zakázek v termínu{" "}
              <strong className="text-foreground whitespace-nowrap">
                16.&nbsp;4.&nbsp;– 16.&nbsp;5.&nbsp;2026
              </strong>
              , abychom stávajícím klientům dodrželi sjednané termíny.
            </p>

            {/* Date card */}
            <div className="mx-auto max-w-sm p-4 rounded-2xl bg-gradient-to-br from-card to-muted/30 border border-border/50">
              <div className="flex items-center justify-center gap-3 text-sm">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">Pauza od</span>
                  <span className="font-semibold">16.&nbsp;4.&nbsp;2026</span>
                </div>
                <div className="h-px w-8 bg-gradient-to-r from-primary/40 to-primary/40" />
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">Znovu od</span>
                  <span className="font-semibold text-primary">17.&nbsp;5.&nbsp;2026</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Děkujeme za pochopení. Pro nezávazné konzultace nás samozřejmě
              můžete kontaktovat i v tomto období.
            </p>

            {/* CTA */}
            <div className="pt-2">
              <Button
                onClick={close}
                size="lg"
                className="w-full sm:w-auto sm:px-10 shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-primary/90"
              >
                Rozumím, děkuji
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
