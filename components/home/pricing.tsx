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

export function Pricing() {
  const [plans, setPlans] = useState<PricingTier[]>([]);
  const [heading, setHeading] = useState('Cenové balíčky');
  const [subheading, setSubheading] = useState('Transparentní ceny bez skrytých poplatků');
  const [footerNote, setFooterNote] = useState('Ceny jsou orientační. Finální cena závisí na rozsahu a složitosti projektu.');

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Fallback mock data (used only if API fails)
  const mockPlans: PricingTier[] = [
      {
        id: 'tier-1',
        name: 'Landing Page',
        price: 7990,
        currency: 'CZK',
        interval: 'one-time' as const,
        description: 'Levnější než WordPress, rychlejší než konkurence',
        highlighted: false,
        ctaText: 'Objednat',
        ctaLink: '/poptavka',
        order: 1,
        enabled: true,
        features: [
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
        name: 'Základní Web',
        price: 9990,
        currency: 'CZK',
        interval: 'one-time' as const,
        description: 'Moderní web bez zbytečností',
        highlighted: false,
        ctaText: 'Objednat',
        ctaLink: '/poptavka',
        order: 2,
        enabled: true,
        features: [
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
        name: 'Standardní Web',
        price: 24990,
        currency: 'CZK',
        interval: 'one-time' as const,
        description: 'Co konkurence dělá za 40k a měsíc, my za 25k a týden',
        highlighted: true,
        ctaText: 'Objednat nejlepší',
        ctaLink: '/poptavka',
        order: 3,
        enabled: true,
        features: [
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
      {
        id: 'tier-4',
        name: 'Mini E-shop',
        price: 49990,
        currency: 'CZK',
        interval: 'one-time' as const,
        description: 'Moderní e-shop bez WordPress limitů',
        highlighted: false,
        ctaText: 'Objednat',
        ctaLink: '/poptavka',
        order: 4,
        enabled: true,
        features: [
          'Do 50 produktů',
          'Platební brána',
          'Správa objednávek',
          'Kategorie a filtry',
          'Wishlist, košík, checkout',
          'Email notifikace',
          'SEO optimalizace',
          'Dodání za 14 dní',
          '6 měsíců podpora',
        ],
      },
      {
        id: 'tier-5',
        name: 'Premium E-shop',
        price: 89990,
        currency: 'CZK',
        interval: 'one-time' as const,
        description: 'Enterprise řešení za poloviční cenu',
        highlighted: false,
        ctaText: 'Objednat',
        ctaLink: '/poptavka',
        order: 5,
        enabled: true,
        features: [
          'Neomezený počet produktů',
          'Více platebních bran',
          'Propojení s kurýry',
          'Pokročilé filtry a vyhledávání',
          'Uživatelské účty',
          'Kupóny a slevy',
          'Hodnocení produktů',
          'Multi-jazyk podpora',
          'Propojení s účetnictvím',
          'Dodání za 21–28 dní',
          '12 měsíců premium podpora',
        ],
      },
    ];

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

      // Fallback to mock data if API fails
      setPlans(mockPlans);
    }

    loadPricingTiers();
  }, [mockPlans]);

  // Helper function to format price
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('cs-CZ').format(price);
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
      setPromoError('Zadejte promo kód');
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
        setPromoError(data.error || 'Neplatný promo kód');
        setAppliedPromo(null);
      }
    } catch (error) {
      setPromoError('Chyba při ověřování kódu');
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
            <span>Férové ceny bez skrytých poplatků</span>
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
                  <span>Máte promo kód?</span>
                </div>

                {!appliedPromo ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Zadejte kód..."
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
                      {isValidating ? 'Ověřuji...' : 'Použít'}
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
                          : `-${formatPrice(appliedPromo.discountValue, 'CZK')} Kč`}
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
            <div className="flex gap-6 pb-8 px-4 min-w-min">
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
                      Nejoblíbenější
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
                          <span className="text-lg text-muted-foreground font-medium">Kč</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl md:text-4xl font-black text-primary">
                          {formatPrice(plan.price, plan.currency)}
                        </span>
                        <span className="text-lg text-muted-foreground font-medium">Kč</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Jednorázová platba</span>
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
                        + {plan.features.length - 6} dalších
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
            💬 Potřebujete individuální řešení? Kontaktujte nás pro osobní nabídku
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
