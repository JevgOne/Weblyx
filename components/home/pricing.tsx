import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { adminDbInstance } from "@/lib/firebase-admin";
import { PricingTier } from "@/types/homepage";

async function getPricingTiers(): Promise<PricingTier[]> {
  try {
    if (!adminDbInstance) {
      console.error('Firebase Admin not initialized');
      return [];
    }

    const snapshot = await adminDbInstance
      .collection('pricing_tiers')
      .orderBy('order')
      .get();

    if (snapshot.empty) {
      console.error('No pricing tiers found');
      return [];
    }

    const tiers: PricingTier[] = [];
    snapshot.docs.forEach((doc: any) => {
      tiers.push(doc.data() as PricingTier);
    });

    return tiers;
  } catch (error) {
    console.error('Error fetching pricing tiers:', error);
    return [];
  }
}

export async function Pricing() {
  const pricingData = await getPricingTiers();

  // Fallback data if fetch fails
  const plans = pricingData.length > 0 ? pricingData : [
    {
      id: 'fallback-1',
      name: 'Jednoduchý Web',
      price: '10 000',
      duration: '5-7 dní',
      description: 'Ideální pro malé firmy a živnostníky',
      popular: false,
      order: 1,
      features: [
        'Až 5 podstránek',
        'Responzivní design',
        'Základní SEO',
        'Kontaktní formulář',
        'Google Analytics',
        '1 měsíc podpora zdarma',
      ],
    },
    {
      id: 'fallback-2',
      name: 'Standardní Web',
      price: '25 000',
      duration: '10-14 dní',
      description: 'Pro rostoucí firmy s většími požadavky',
      popular: true,
      order: 2,
      features: [
        'Až 15 podstránek',
        'Pokročilý design',
        'Pokročilé SEO',
        'Blog/Aktuality',
        'Animace a efekty',
        'Galerie obrázků',
        '3 měsíce podpora zdarma',
        'Úpravy po spuštění',
      ],
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Cenové balíčky
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparentní ceny bez skrytých poplatků
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden ${
                plan.popular
                  ? "border-primary shadow-elegant scale-105"
                  : "hover:shadow-lg"
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg">
                    Nejpopulárnější
                  </Badge>
                </div>
              )}

              <CardHeader className="space-y-4 pb-8 pt-8">
                <div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.description}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">Kč</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dodání: {plan.duration}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href="/poptavka">Začít projekt</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Ceny jsou orientační. Finální cena závisí na rozsahu a složitosti projektu.
        </p>
      </div>
    </section>
  );
}
