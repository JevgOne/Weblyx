"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LeadButton } from "@/components/tracking/LeadButton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Zap, Clock, Tag, X, Shield, Wallet, RefreshCcw, Headphones } from "lucide-react";
import { useState } from "react";
import { PricingTier } from "@/types/cms";
import { useLocale, useTranslations } from 'next-intl';

interface PricingProps {
  serverTiers?: PricingTier[];
}

export function Pricing({ serverTiers }: PricingProps) {
  const locale = useLocale();
  const t = useTranslations('pricing');

  const [plans, setPlans] = useState<PricingTier[]>(serverTiers && serverTiers.length > 0 ? serverTiers : []);
  const [heading] = useState(t('title'));
  const [subheading] = useState(t('subtitle'));
  const [footerNote] = useState(t('pricingNote'));

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Currency conversion (CZK to EUR ~25:1)
  const convertPrice = (priceInCZK: number): number => {
    if (locale === 'de') {
      return Math.round(priceInCZK / 25);
    }
    return priceInCZK;
  };

  const getCurrencySymbol = (): string => {
    return locale === 'de' ? '€' : 'Kč';
  };

  // Tiers come from the CMS; there is no hardcoded fallback list any more.
  const displayPlans = plans;

  // Helper function to format price
  const formatPrice = (price: number, currency: string = 'CZK') => {
    // Convert to EUR if German locale
    const displayPrice = convertPrice(price);

    // Use appropriate locale format
    const localeFormat = locale === 'de' ? 'de-DE' : 'cs-CZ';
    return new Intl.NumberFormat(localeFormat).format(displayPrice);
  };

  // Calculate discounted price
  const calculateDiscountedPrice = (originalPrice: number) => {
    if (!appliedPromo) return originalPrice;

    let discount = 0;
    if (appliedPromo.discountType === 'percentage') {
      discount = Math.round((originalPrice * appliedPromo.discountValue) / 100);
      if (appliedPromo.maxDiscount && discount > appliedPromo.maxDiscount) {
        discount = appliedPromo.maxDiscount;
      }
    } else {
      discount = appliedPromo.discountValue;
      if (discount > originalPrice) {
        discount = originalPrice;
      }
    }

    return Math.max(0, originalPrice - discount);
  };

  // Validate promo code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError(t('enterPromoCode'));
      return;
    }

    setIsValidating(true);
    setPromoError('');

    try {
      // Use the first plan's price as reference for validation
      const referencePrice = plans[0]?.price || 10000;

      const response = await fetch('/api/promo-code/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, orderValue: referencePrice }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAppliedPromo(data.data);
        setPromoError('');
      } else {
        setPromoError(data.error || t('invalidPromoCode'));
        setAppliedPromo(null);
      }
    } catch (error) {
      setPromoError(t('promoCodeError'));
      setAppliedPromo(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
  };

  return (
    <section id="pricing" className="section px-4 scroll-mt-20">
      <div className="container mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="eyebrow">{t('fairPrices')}</p>
          <h2 className="display display-lg mt-5">{heading}</h2>
          <p className="lede mt-5">{subheading}</p>
        </div>

        {/* Promo Code Input */}
        <div className="max-w-md mt-10">
          <div className="rounded-xl border border-[hsl(var(--hairline))] bg-[hsl(var(--surface))] p-5">
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Tag className="h-4 w-4 text-primary" />
                  <span>{t('promoCodeLabel')}</span>
                </div>

                {!appliedPromo ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('promoCodePlaceholder')}
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                      className="text-center font-mono font-bold"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyPromo}
                      disabled={isValidating || !promoCode.trim()}
                      size="sm"
                    >
                      {isValidating ? t('validating') : t('applyButton')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary">
                        {appliedPromo.code}
                      </Badge>
                      <span className="text-sm font-medium text-primary">
                        {appliedPromo.discountType === 'percentage'
                          ? `-${appliedPromo.discountValue}%`
                          : `-${formatPrice(appliedPromo.discountValue, 'CZK')} ${getCurrencySymbol()}`}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePromo}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {promoError && (
                  <p className="text-xs text-destructive">{promoError}</p>
                )}
            </div>
          </div>
        </div>

        {displayPlans.length === 0 && (
          <p className="text-center text-sm text-muted-foreground mb-12">
            Ceník se právě aktualizuje. Napište nám a cenu vám rádi spočítáme.
          </p>
        )}

        {/* Horizontal scrollable carousel */}
        <div className="relative mb-12">
          {/* Scroll container */}
          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            <div className="flex gap-4 sm:gap-6 pb-8 px-4 lg:justify-center">
              {displayPlans.map((plan, index) => (
                <div
                  key={plan.id}
                  className="relative snap-center shrink-0 w-[280px] sm:w-[300px] md:w-[320px]"
                >
              <div
                className={`card-flat relative flex h-full flex-col p-6 ${
                  plan.highlighted ? 'border-primary/45' : 'card-flat-accent'
                }`}
              >
                {/* Highlighted badge - inside card at top */}
                {plan.highlighted && (
                  <span className="absolute top-6 right-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                    {t('popular')}
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-[13px] text-[hsl(var(--ink-faint))]">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mt-6 pb-6 border-b border-[hsl(var(--hairline))]">
                  {appliedPromo && plan.price !== calculateDiscountedPrice(plan.price) ? (
                    <>
                      <div className="numeral text-base font-medium text-[hsl(var(--ink-faint))] line-through">
                        {formatPrice(plan.price, plan.currency)} {getCurrencySymbol()}
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="numeral text-4xl font-bold text-foreground leading-none">
                          {formatPrice(calculateDiscountedPrice(plan.price), plan.currency)}
                        </span>
                        <span className="text-base font-medium text-[hsl(var(--ink-faint))]">
                          {getCurrencySymbol()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <span className="numeral text-4xl font-bold text-foreground leading-none">
                        {formatPrice(plan.price, plan.currency)}
                      </span>
                      <span className="text-base font-medium text-[hsl(var(--ink-faint))]">
                        {getCurrencySymbol()}
                      </span>
                    </div>
                  )}
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[hsl(var(--ink-faint))]">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{t('oneTime')}</span>
                  </div>
                </div>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.slice(0, 6).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span className="text-[13px] leading-relaxed text-[hsl(var(--ink-soft))]">
                        {feature}
                      </span>
                    </li>
                  ))}
                  {plan.features.length > 6 && (
                    <li className="pl-[26px] text-[13px] font-medium text-[hsl(var(--ink-faint))]">
                      {t('additionalFeatures', { count: plan.features.length - 6 })}
                    </li>
                  )}
                </ul>

                <LeadButton
                  href={plan.ctaLink}
                  size="sm"
                  className="mt-7 w-full h-11 rounded-xl font-semibold"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  showArrow={false}
                >
                  {plan.ctaText}
                </LeadButton>
              </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicators (dots) — mobile only; on desktop all cards are visible */}
          <div className="flex lg:hidden justify-center gap-1.5 mt-2">
            {displayPlans.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === 2 ? 'w-6 bg-primary' : 'w-1.5 bg-[hsl(var(--hairline-strong))]'
                }`}
              ></div>
            ))}
          </div>

          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-8 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none hidden md:block"></div>
          <div className="absolute right-0 top-0 bottom-8 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none hidden md:block"></div>
        </div>

        {/* Trust badges — risk reversal under price cards */}
        <div className="mt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="card-flat card-flat-accent flex flex-col gap-3 p-6">
              <div className="icon-mark h-10 w-10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <h4 className="font-semibold text-sm tracking-tight text-foreground">
                {locale === 'de' ? 'Bezahlung nach Lieferung' : 'Platba až po předání'}
              </h4>
              <p className="text-[13px] text-[hsl(var(--ink-soft))] leading-relaxed">
                {locale === 'de' ? 'Kein Vorschuss, Sie zahlen erst, wenn Sie zufrieden sind.' : 'Žádná záloha předem, platíte až jste spokojeni.'}
              </p>
            </div>

            <div className="card-flat card-flat-accent flex flex-col gap-3 p-6">
              <div className="icon-mark h-10 w-10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h4 className="font-semibold text-sm tracking-tight text-foreground">
                {locale === 'de' ? 'Keine versteckten Kosten' : 'Bez skrytých poplatků'}
              </h4>
              <p className="text-[13px] text-[hsl(var(--ink-soft))] leading-relaxed">
                {locale === 'de' ? 'Festpreis. Was Sie sehen, ist was Sie zahlen.' : 'Pevná cena. Co vidíte, to platíte.'}
              </p>
            </div>

            <div className="card-flat card-flat-accent flex flex-col gap-3 p-6">
              <div className="icon-mark h-10 w-10">
                <RefreshCcw className="h-5 w-5 text-primary" />
              </div>
              <h4 className="font-semibold text-sm tracking-tight text-foreground">
                {locale === 'de' ? 'Unbegrenzte Korrekturen' : 'Neomezené revize'}
              </h4>
              <p className="text-[13px] text-[hsl(var(--ink-soft))] leading-relaxed">
                {locale === 'de' ? 'Wir ändern alles, bis es perfekt passt.' : 'Upravujeme dokud nebudete 100% spokojeni.'}
              </p>
            </div>

            <div className="card-flat card-flat-accent flex flex-col gap-3 p-6">
              <div className="icon-mark h-10 w-10">
                <Headphones className="h-5 w-5 text-primary" />
              </div>
              <h4 className="font-semibold text-sm tracking-tight text-foreground">
                {locale === 'de' ? 'Support inklusive' : 'Podpora v ceně'}
              </h4>
              <p className="text-[13px] text-[hsl(var(--ink-soft))] leading-relaxed">
                {locale === 'de' ? '30 Tage kostenlose Betreuung nach Launch.' : '30 dní bezplatné podpory po spuštění.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[hsl(var(--hairline))] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-sm text-[hsl(var(--ink-faint))] max-w-2xl">
            {footerNote}
          </p>
          <p className="text-sm font-semibold text-primary shrink-0">
            {t('customSolutionCTA')}
          </p>
        </div>
      </div>

      <style jsx global>{`
        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
          scroll-behavior: smooth;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .delay-200 {
          animation-delay: 200ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </section>
  );
}
