'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriceResult, CalculatorData } from '@/lib/calculator/types';
import { Check, Phone, ArrowRight, Clock, Zap, Shield } from 'lucide-react';
import Link from 'next/link';

interface StepResultProps {
  priceResult: PriceResult;
  data: CalculatorData;
}

export function StepResult({ priceResult, data }: StepResultProps) {
  const confettiTriggered = useRef(false);

  useEffect(() => {
    if (confettiTriggered.current) return;
    confettiTriggered.current = true;

    // Dynamic import to avoid bundle bloat
    import('canvas-confetti').then((confettiModule) => {
      const confetti = confettiModule.default;
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14B8A6', '#0D9488', '#5EEAD4', '#2DD4BF'],
      });
    }).catch(() => {
      // Confetti not critical
    });
  }, []);

  const formatPrice = (price: number) => price.toLocaleString('cs-CZ');

  // Build query params for poptavka link
  const poptavkaParams = new URLSearchParams({
    ref: 'calculator',
    type: data.projectType,
    budget: `${priceResult.totalMin}-${priceResult.totalMax}`,
  });

  return (
    <div className="text-center">
      {/* Price badge */}
      <Badge variant="secondary" className="mb-4">
        {priceResult.recommendedPackage}
      </Badge>

      {/* Main price */}
      <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-1">
        {formatPrice(priceResult.totalMin)} – {formatPrice(priceResult.totalMax)} Kč
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Jednorázová platba &bull; bez měsíčních poplatků
      </p>

      {/* Breakdown */}
      <div className="bg-muted/50 rounded-xl p-4 mb-5 text-left">
        <h3 className="text-sm font-semibold text-foreground mb-3">Rozpad ceny</h3>
        <div className="space-y-2">
          {priceResult.breakdown.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className={`${item.type === 'base' ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                {item.type !== 'base' && item.amount >= 0 ? '+ ' : ''}
                {item.label}
              </span>
              <span className={`font-medium whitespace-nowrap ${item.amount < 0 ? 'text-green-600' : 'text-foreground'}`}>
                {item.type !== 'base' && item.amount > 0 ? '+' : ''}
                {formatPrice(item.amount)} Kč
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Included features */}
      <div className="text-left mb-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">V ceně zahrnuto</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {priceResult.includedFeatures.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery & trust */}
      <div className="flex flex-wrap justify-center gap-4 mb-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>Dodání za {priceResult.estimatedDays.min}–{priceResult.estimatedDays.max} dní</span>
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
        Detailní kalkulaci jsme odeslali na <strong>{data.email}</strong>
      </p>
    </div>
  );
}
