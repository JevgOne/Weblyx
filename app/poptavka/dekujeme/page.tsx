"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Mail, Phone, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

export default function ThankYouPage() {
  useEffect(() => {
    // 🎯 CONVERSION TRACKING - Fire once on page load
    // Facebook Pixel - Track conversion
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead');
      (window as any).fbq('track', 'SubmitApplication');
    }

    // Google Analytics GA4 - Track conversion
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        'event_category': 'Lead',
        'event_label': 'Quote Form Submitted',
        'value': 1
      });
      (window as any).gtag('event', 'generate_lead', {
        'currency': 'CZK',
        'value': 10000 // Estimated project value
      });
      // Google Ads conversion tracking (Submit Lead Form)
      (window as any).gtag('event', 'conversion', {
        'send_to': 'AW-8291837393',
        'value': 10000,
        'currency': 'CZK'
      });
    }

    // Konfety při načtení stránky
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardContent className="pt-12 pb-12 text-center space-y-8">
            {/* Success Icon */}
            <div className="mx-auto h-20 w-20 rounded-full bg-cyan-100 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-cyan-600" />
            </div>

            {/* Title */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold">
                Děkujeme za vaši poptávku! 🎉
              </h1>
              <p className="text-lg text-muted-foreground">
                Vaše poptávka byla úspěšně odeslána
              </p>
            </div>

            {/* Info */}
            <div className="space-y-4 text-left max-w-md mx-auto">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Co bude dál?</p>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Obdrželi jsme vaši poptávku</li>
                  <li>Projdeme zadání a připravíme kalkulaci</li>
                  <li>Ozveme se vám do 24 hodin</li>
                  <li>Domluvíme detaily a zahájíme projekt</li>
                </ol>
              </div>

              <div className="p-4 border-2 border-primary/20 rounded-lg space-y-3">
                <p className="text-sm font-medium text-primary">
                  ✅ Potvrzení jsme vám zaslali na email
                </p>
                <p className="text-sm text-muted-foreground">
                  Zkontrolujte prosím spam složku, pokud email nevidíte
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 max-w-md mx-auto">
              <p className="text-sm font-medium">Máte dotaz? Kontaktujte nás:</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="mailto:info@weblyx.cz"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  info@weblyx.cz
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button asChild size="lg">
                <Link href="/" className="gap-2">
                  Zpět na hlavní stránku
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link href="/blog">
                  Prozkoumejte náš blog
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Ozveme se vám <strong>do 24 hodin</strong>
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Hodnocení 5.0 na Google</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Bez měsíčních poplatků</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Načítání pod 2 sekundy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
