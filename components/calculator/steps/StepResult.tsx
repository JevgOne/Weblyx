'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PackageResult, CalculatorData } from '@/lib/calculator/types';
import { Check, Phone, ArrowRight, Clock, Zap, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface StepResultProps {
  priceResult: PackageResult;
  data: CalculatorData;
}

export function StepResult({ priceResult, data }: StepResultProps) {
  const confettiTriggered = useRef(false);

  useEffect(() => {
    if (confettiTriggered.current) return;
    confettiTriggered.current = true;

    import('canvas-confetti').then((confettiModule) => {
      const confetti = confettiModule.default;
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14B8A6', '#0D9488', '#5EEAD4', '#2DD4BF'],
      });
    }).catch(() => {});
  }, []);

  const formatPrice = (price: number) => price.toLocaleString('cs-CZ');

  const poptavkaParams = new URLSearchParams({
    ref: 'calculator',
    type: data.projectType,
    budget: String(priceResult.price),
  });

  return (
    <div className="text-center">
      {/* Package badge */}
      <Badge variant="secondary" className="mb-4">
        {priceResult.packageName}
      </Badge>

      {/* Main price */}
      <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-1">
        {formatPrice(priceResult.price)} Kč
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Jednorázová platba &bull; bez měsíčních poplatků
      </p>

      {/* Included features */}
      <div className="text-left mb-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">V ceně zahrnuto</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {priceResult.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected addons */}
      {priceResult.addons.length > 0 && (
        <div className="text-left mb-5 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Doplňkové služby</h3>
          </div>
          <div className="space-y-1">
            {priceResult.addons.map((addon) => (
              <div key={addon.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{addon.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Individuální nabídku na tyto služby vám připravíme při konzultaci.
          </p>
        </div>
      )}

      {/* Delivery & trust */}
      <div className="flex flex-wrap justify-center gap-4 mb-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>Dodání za {priceResult.deliveryDays.min}–{priceResult.deliveryDays.max} dní</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span>Garance rychlosti</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span>Konzultace zdarma</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        <Button asChild size="lg" className="w-full gap-2">
          <Link href={`/poptavka?${poptavkaParams.toString()}`}>
            Domluvit konzultaci zdarma
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full gap-2">
          <a href="tel:+420702110166">
            <Phone className="w-4 h-4" />
            Zavolat +420 702 110 166
          </a>
        </Button>
      </div>

      {/* Email confirmation */}
      <p className="text-xs text-muted-foreground mt-4">
        Shrnutí jsme odeslali na <strong>{data.email}</strong>
      </p>
    </div>
  );
}
