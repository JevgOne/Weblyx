"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { PricingTier } from "@/types/cms";

export function Pricing() {
  const [plans, setPlans] = useState<PricingTier[]>([]);
  const [heading, setHeading] = useState('Cenové balíčky');
  const [subheading, setSubheading] = useState('Transparentní ceny bez skrytých poplatků');
  const [footerNote, setFooterNote] = useState('Ceny jsou orientační. Finální cena závisí na rozsahu a složitosti projektu.');

  useEffect(() => {
    // In development with mock data, we use fallback data
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

    setPlans(mockPlans);
  }, []);

  // Helper function to format price
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('cs-CZ').format(price);
  };

  return (
    <section className="relative py-16 md:py-24 px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center space-y-4 mb-16">
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

        {/* Horizontal scrollable carousel */}
        <div className="relative mb-12">
          {/* Scroll container */}
          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            <div className="flex gap-6 pb-8 px-4 min-w-min">
              {plans.map((plan, index) => (
                <div
                  key={plan.id}
                  className={`group relative animate-fade-in-up snap-center shrink-0 w-[340px] md:w-[380px] ${
                    plan.highlighted ? 'md:scale-105 md:-mt-4' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
              {/* Glow effect for highlighted plan */}
              {plan.highlighted && (
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-cyan-500 to-primary rounded-2xl opacity-75 blur-sm group-hover:opacity-100 transition duration-500 animate-pulse-slow"></div>
              )}

              <Card
                className={`relative h-full overflow-hidden border-2 transition-all duration-500 ${
                  plan.highlighted
                    ? 'border-primary shadow-2xl bg-gradient-to-b from-background to-primary/5'
                    : 'border-border hover:border-primary/50 hover:shadow-xl bg-background/50 backdrop-blur'
                } group-hover:scale-105 group-hover:-translate-y-2`}
              >
                {/* Highlighted badge with animation */}
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer"></div>
                )}

                {plan.highlighted && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-primary to-cyan-500 text-white border-0 shadow-lg animate-bounce-slow px-4 py-1.5 text-sm font-bold">
                      <Zap className="h-3.5 w-3.5 mr-1 inline" />
                      Nejoblíbenější
                    </Badge>
                  </div>
                )}

                <CardHeader className="space-y-6 pb-6 pt-8 relative">
                  {/* Decorative corner gradient */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-br-full opacity-50"></div>

                  <div className="relative z-10">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price with animated underline */}
                  <div className="space-y-3 relative">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl md:text-6xl font-black bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">
                        {formatPrice(plan.price, plan.currency)}
                      </span>
                      <span className="text-2xl text-muted-foreground font-semibold">Kč</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Jednorázová platba</span>
                    </div>
                    {/* Animated line */}
                    <div className="h-0.5 w-20 bg-gradient-to-r from-primary to-transparent group-hover:w-full transition-all duration-500"></div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pb-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 group/item"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-primary/20 transition-colors">
                          <Check className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm leading-relaxed group-hover/item:text-foreground transition-colors">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`w-full font-semibold text-base py-6 transition-all duration-300 ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-primary to-cyan-600 hover:from-primary/90 hover:to-cyan-600/90 shadow-lg hover:shadow-xl'
                        : 'hover:bg-primary/90'
                    }`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    <Link href={plan.ctaLink} className="flex items-center justify-center gap-2">
                      {plan.ctaText}
                      <Zap className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>

                {/* Bottom accent line for highlighted */}
                {plan.highlighted && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                )}
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
