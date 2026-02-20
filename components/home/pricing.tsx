"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LeadButton } from "@/components/tracking/LeadButton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Sparkles, Zap, Clock, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PricingTier } from "@/types/cms";
import { useLocale, useTranslations } from 'next-intl';

export function Pricing() {
  const locale = useLocale();
  const t = useTranslations('pricing');

  const [plans, setPlans] = useState<PricingTier[]>([]);
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

  // Fallback mock data (localized based on current locale)
  // Using translation keys for German compatibility
  const getMockPlans = (): PricingTier[] => {
    const isGerman = locale === 'de';
    const ctaLink = isGerman ? '/anfrage' : '/poptavka';
    const ctaText = isGerman ? 'Paket auswählen' : 'Objednat';

    return [
      {
        id: 'tier-1',
        name: 'Landing Page',
        price: 7990,
        currency: 'CZK',
        interval: 'one-time' as const,
        description: isGerman
          ? 'Günstiger als WordPress, schneller als die Konkurrenz'
          : 'Levnější než WordPress, rychlejší než konkurence',
        highlighted: false,
        ctaText,
        ctaLink,
        order: 1,
        enabled: true,
        features: isGerman ? [
          '1 Seite, 3-5 Abschnitte',
          'Responsive Design',
          'Kontaktformular',
          'Basis-SEO',
          'Google Analytics',
          'Lieferung in 3-5 Tagen',
          '1 Monat Support',
        ] : [
          '1 stránka, 3–5 sekcí',
          'Responzivní design',
          'Kontaktní formulář',
          'SEO základy',
          'Google Analytics',
          'Dodání za 3–5 dní',
          '1 měsíc podpora',
        ],
      },
      {
        id: 'tier-2',
        name: isGerman ? 'Basis Website' : 'Základní Web',
        price: 9990,
        currency: 'CZK',
        interval: 'one-time' as const,
        description: isGerman
          ? 'Moderne Website ohne Schnickschnack'
          : 'Moderní web bez zbytečností',
        highlighted: false,
        ctaText,
        ctaLink,
        order: 2,
        enabled: true,
        features: isGerman ? [
          '3-5 Unterseiten',
          'Modernes Design',
          'Fortgeschrittenes SEO',
          'Blog mit CMS-Editor',
          'Kontaktformular',
          'Social-Media-Integration',
          'Lieferung in 5-7 Tagen',
          '2 Monate Support',
        ] : [
          '3–5 podstránek',
          'Moderní design',
          'Pokročilé SEO',
          'Blog s CMS editorem',
          'Kontaktní formulář',
          'Napojení na sociální sítě',
          'Dodání za 5–7 dní',
          '2 měsíce podpora',
        ],
      },
      {
        id: 'tier-3',
        name: isGerman ? 'Standard Website' : 'Standardní Web',
        price: 24990,
        currency: 'CZK',
        interval: 'one-time' as const,
        description: isGerman
          ? 'Was die Konkurrenz in einem Monat für 1.000€ macht, schaffen wir in einer Woche'
          : 'Co konkurence dělá za 40k a měsíc, my za 25k a týden',
        highlighted: true,
        ctaText: isGerman ? 'Bestes Paket wählen' : 'Objednat nejlepší',
        ctaLink,
        order: 3,
        enabled: true,
        features: isGerman ? [
          '10+ Unterseiten',
          'Premium-Design nach Maß',
          'Erweiterte Animationen',
          'Vollständiges CMS zur Inhaltsverwaltung',
          'Buchungssystem',
          'Newsletter-Integration',
          'Fortgeschrittenes SEO und Analytics',
          'Lieferung in 7-10 Tagen',
          '3 Monate Support',
          'Kostenlose kleine Anpassungen (2h)',
        ] : [
          '10+ podstránek',
          'Premium design na míru',
          'Pokročilé animace',
          'Full CMS pro správu obsahu',
          'Rezervační systém',
          'Newsletter integrace',
          'Pokročilé SEO a Analytics',
          'Dodání za 7–10 dní',
          '3 měsíce podpora',
          'Bezplatné drobné úpravy (2h)',
        ],
      },
    ];
  };

  useEffect(() => {
    // Fetch pricing tiers from API
    async function loadPricingTiers() {
      try {
        const res = await fetch('/api/cms/pricing');
        const json = await res.json();

        if (json.success && json.data) {
          setPlans(json.data.filter((tier: PricingTier) => tier.enabled));
          return;
        }
      } catch (error) {
        console.error('Error loading pricing tiers:', error);
      }

      // Fallback to localized mock data if API fails
      setPlans(getMockPlans());
    }

    loadPricingTiers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array - only run once on mount

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
    <section className="relative py-16 md:py-24 px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span>{t('fairPrices')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold animate-fade-in">
            {heading}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in delay-200">
            {subheading}
          </p>
        </div>

        {/* Promo Code Input */}
        <div className="max-w-md mx-auto mb-12">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
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
            </CardContent>
          </Card>
        </div>

        {/* Horizontal scrollable carousel */}
        <div className="relative mb-12">
          {/* Scroll container */}
          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            <div className="flex gap-6 pb-8 px-4">
              {plans.map((plan, index) => (
                <div
                  key={plan.id}
                  className="group relative animate-fade-in-up snap-center shrink-0 w-[300px] md:w-[320px]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
              <Card
                className={`relative h-full overflow-hidden transition-all duration-300 ${
                  plan.highlighted
                    ? 'border-2 border-primary shadow-lg bg-background'
                    : 'border border-border hover:border-primary/30 hover:shadow-md bg-background'
                } group-hover:shadow-xl`}
              >
                {/* Highlighted badge - inside card at top */}
                {plan.highlighted && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-primary text-primary-foreground border-0 shadow-lg px-3 py-1.5 text-xs font-bold">
                      {t('popular')}
                    </Badge>
                  </div>
                )}

                <CardHeader className={`space-y-4 pb-4 relative pt-6`}>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="space-y-1 relative">
                    {appliedPromo && plan.price !== calculateDiscountedPrice(plan.price) ? (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-muted-foreground line-through">
                            {formatPrice(plan.price, plan.currency)}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl md:text-4xl font-black text-primary">
                            {formatPrice(calculateDiscountedPrice(plan.price), plan.currency)}
                          </span>
                          <span className="text-lg text-muted-foreground font-medium">{getCurrencySymbol()}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl md:text-4xl font-black text-primary">
                          {formatPrice(plan.price, plan.currency)}
                        </span>
                        <span className="text-lg text-muted-foreground font-medium">{getCurrencySymbol()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{t('oneTime')}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pb-6">
                  <ul className="space-y-2">
                    {plan.features.slice(0, 6).map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2"
                      >
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-xs text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                    {plan.features.length > 6 && (
                      <li className="text-xs text-primary font-medium pl-6">
                        {t('additionalFeatures').replace('{count}', String(plan.features.length - 6))}
                      </li>
                    )}
                  </ul>

                  <LeadButton
                    href={plan.ctaLink}
                    size="sm"
                    className="w-full"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    showArrow={false}
                  >
                    {plan.ctaText}
                  </LeadButton>
                </CardContent>
              </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicators (dots) */}
          <div className="flex justify-center gap-2 mt-6">
            {plans.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === 2 ? 'w-8 bg-primary' : 'w-2 bg-primary/30'
                }`}
              ></div>
            ))}
          </div>

          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-8 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none hidden md:block"></div>
          <div className="absolute right-0 top-0 bottom-8 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none hidden md:block"></div>
        </div>

        <div className="text-center space-y-4 animate-fade-in delay-1000">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            {footerNote}
          </p>
          <p className="text-sm font-medium text-primary">
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
