"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Calculator, Sparkles, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

interface PricingOption {
  id: string;
  label: string;
  description: string;
  price: number;
  popular?: boolean;
}

interface AddOn {
  id: string;
  label: string;
  description: string;
  price: number;
  category: string;
}

const baseOptions: PricingOption[] = [
  {
    id: "landing",
    label: "Landing Page",
    description: "Jedna stránka s 3-5 sekcemi",
    price: 7990,
  },
  {
    id: "basic",
    label: "Základní Web",
    description: "3-5 podstránek s moderním designem",
    price: 9990,
    popular: true,
  },
  {
    id: "standard",
    label: "Standardní Web",
    description: "10+ podstránek, premium design",
    price: 24990,
  },
  {
    id: "eshop",
    label: "Mini E-shop",
    description: "Plný e-shop s platební bránou",
    price: 49990,
  },
];

const addOns: AddOn[] = [
  {
    id: "blog",
    label: "Blog s CMS",
    description: "Správa článků, kategorie, tagy",
    price: 3000,
    category: "Obsah",
  },
  {
    id: "booking",
    label: "Rezervační systém",
    description: "Online rezervace, kalendář",
    price: 5000,
    category: "Funkce",
  },
  {
    id: "newsletter",
    label: "Newsletter integrace",
    description: "Email marketing, automatizace",
    price: 2000,
    category: "Marketing",
  },
  {
    id: "advanced-seo",
    label: "Pokročilé SEO",
    description: "Schema.org, sitemap, analytics",
    price: 3000,
    category: "Marketing",
  },
  {
    id: "multilang",
    label: "Vícejazyčnost",
    description: "2+ jazykové verze",
    price: 4000,
    category: "Funkce",
  },
  {
    id: "animations",
    label: "Pokročilé animace",
    description: "Scroll animace, interaktivita",
    price: 3500,
    category: "Design",
  },
  {
    id: "custom-cms",
    label: "Custom CMS",
    description: "Správa obsahu na míru",
    price: 5000,
    category: "Funkce",
  },
  {
    id: "payment",
    label: "Platební brána",
    description: "Stripe, GoPay integrace",
    price: 4000,
    category: "E-commerce",
  },
];

export function PricingCalculator() {
  const [selectedBase, setSelectedBase] = useState<string>("basic");
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());

  const totalPrice = useMemo(() => {
    const basePrice = baseOptions.find((opt) => opt.id === selectedBase)?.price || 0;
    const addOnsPrice = Array.from(selectedAddOns).reduce((sum, addonId) => {
      const addon = addOns.find((a) => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0);
    return basePrice + addOnsPrice;
  }, [selectedBase, selectedAddOns]);

  const toggleAddOn = (addonId: string) => {
    const newSet = new Set(selectedAddOns);
    if (newSet.has(addonId)) {
      newSet.delete(addonId);
    } else {
      newSet.add(addonId);
    }
    setSelectedAddOns(newSet);
  };

  const selectedItems = useMemo(() => {
    const base = baseOptions.find((opt) => opt.id === selectedBase);
    const addons = addOns.filter((addon) => selectedAddOns.has(addon.id));
    return {
      base: base?.label || "",
      addons: addons.map((a) => a.label),
    };
  }, [selectedBase, selectedAddOns]);

  // Group addons by category
  const groupedAddOns = useMemo(() => {
    const grouped: Record<string, AddOn[]> = {};
    addOns.forEach((addon) => {
      if (!grouped[addon.category]) {
        grouped[addon.category] = [];
      }
      grouped[addon.category].push(addon);
    });
    return grouped;
  }, []);

  return (
    <section id="pricing-calculator" className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Calculator className="h-3 w-3 mr-1" />
            Interaktivní kalkulačka
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Kolik bude stát váš web?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Vyberte si základní balíček a přidejte funkce podle potřeby. Cena se vypočítá automaticky.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left: Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Base Options */}
            <Card>
              <CardHeader>
                <CardTitle>1. Vyberte základní balíček</CardTitle>
                <CardDescription>Co je základ vašeho projektu?</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedBase} onValueChange={setSelectedBase}>
                  <div className="grid md:grid-cols-2 gap-4">
                    {baseOptions.map((option) => (
                      <div key={option.id} className="relative">
                        <Label
                          htmlFor={option.id}
                          className={`
                            flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                            ${selectedBase === option.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                            }
                          `}
                        >
                          <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{option.label}</span>
                              {option.popular && (
                                <Badge variant="secondary" className="text-xs">
                                  Oblíbené
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {option.description}
                            </p>
                            <p className="text-lg font-bold text-primary">
                              {option.price.toLocaleString("cs-CZ")} Kč
                            </p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Add-ons */}
            <Card>
              <CardHeader>
                <CardTitle>2. Přidejte funkce navíc (volitelné)</CardTitle>
                <CardDescription>Rozšiřte váš projekt o další možnosti</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(groupedAddOns).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                      {category}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {items.map((addon) => (
                        <Label
                          key={addon.id}
                          htmlFor={addon.id}
                          className={`
                            flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all
                            ${selectedAddOns.has(addon.id)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                            }
                          `}
                        >
                          <Checkbox
                            id={addon.id}
                            checked={selectedAddOns.has(addon.id)}
                            onCheckedChange={() => toggleAddOn(addon.id)}
                          />
                          <div className="flex-1">
                            <div className="font-medium mb-1">{addon.label}</div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {addon.description}
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              +{addon.price.toLocaleString("cs-CZ")} Kč
                            </p>
                          </div>
                        </Label>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-2 border-primary/20">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Shrnutí projektu
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Selected items */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{selectedItems.base}</div>
                      <div className="text-sm text-muted-foreground">Základní balíček</div>
                    </div>
                  </div>

                  {selectedItems.addons.map((addon, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm">{addon}</div>
                      </div>
                    </div>
                  ))}

                  {selectedItems.addons.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      Žádné přídavné funkce
                    </p>
                  )}
                </div>

                {/* Total Price */}
                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-1">Celková cena</div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    {totalPrice.toLocaleString("cs-CZ")} Kč
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Jednorázová platba, bez měsíčních poplatků
                  </p>
                </div>

                {/* CTA */}
                <Link
                  href={`/poptavka?package=${selectedBase}&addons=${Array.from(selectedAddOns).join(",")}&price=${totalPrice}`}
                  className="block"
                >
                  <Button size="lg" className="w-full gap-2">
                    Pokračovat na poptávku
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                {/* Trust */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">Garance rychlosti pod 2s</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">Dodání během 1-2 týdnů</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">Nezávazná konzultace zdarma</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info note */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="bg-muted/50 border-0">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground text-center">
                💡 <strong>Ceny jsou orientační.</strong> Finální cena může být nižší při využití AI nástrojů a automatizace.
                Kontaktujte nás pro přesnou cenovou nabídku na míru.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
