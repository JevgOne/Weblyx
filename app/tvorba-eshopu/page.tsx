import type { Metadata } from "next";
import { getAlternateLanguages } from "@/lib/seo-metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { LeadButton } from "@/components/tracking/LeadButton";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  CreditCard,
  BarChart3,
  Shield,
  Truck,
  Search,
  Smartphone,
  Zap,
  Check,
  ArrowRight,
  Star,
  Package,
} from "lucide-react";
import { generateWebPageSchema, BreadcrumbItem } from "@/lib/schema-org";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tvorba e-shopu na míru | Od 14 990 Kč | Rychlý internetový obchod | Weblyx",
  description:
    "⚡ Profesionální tvorba e-shopu na míru od 14 990 Kč. Rychlý internetový obchod s garancí PageSpeed 90+, napojení na platební brány a dopravce. E-shop za 2–3 týdny.",
  keywords: [
    "tvorba e-shopu",
    "e-shop na míru",
    "tvorba internetového obchodu",
    "e-shop cena",
    "vlastní e-shop",
    "eshop na míru",
    "tvorba eshopu",
    "internetový obchod na míru",
    "profesionální e-shop",
    "rychlý e-shop",
  ],
  openGraph: {
    title: "Tvorba e-shopu na míru | Od 14 990 Kč | Weblyx",
    description:
      "⚡ Profesionální tvorba e-shopu na míru od 14 990 Kč. Rychlý internetový obchod s garancí PageSpeed 90+.",
    url: "https://www.weblyx.cz/tvorba-eshopu",
    type: "website",
    images: [{ url: "/images/og/og-tvorba-eshopu.png", width: 1200, height: 630, alt: "Weblyx - Tvorba e-shopu" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tvorba e-shopu na míru | Od 14 990 Kč | Weblyx",
    description:
      "⚡ Profesionální tvorba e-shopu na míru od 14 990 Kč. Rychlý internetový obchod s garancí PageSpeed 90+.",
  },
  alternates: {
    canonical: "https://www.weblyx.cz/tvorba-eshopu",
    languages: getAlternateLanguages("/tvorba-eshopu"),
  },
};

const FEATURES = [
  {
    icon: ShoppingCart,
    title: "Katalog produktů",
    description: "Přehledný katalog s filtry, variantami a kategoriemi. Zákazníci najdou, co hledají, do pár sekund.",
  },
  {
    icon: CreditCard,
    title: "Platební brány",
    description: "Napojení na GoPay, Comgate, Stripe i platbu kartou. Bezpečné platby jedním kliknutím.",
  },
  {
    icon: Truck,
    title: "Dopravci & sledování",
    description: "Integrace s Zásilkovnou, PPL, DPD a Českou poštou. Automatické sledování zásilek.",
  },
  {
    icon: BarChart3,
    title: "Analytika & reporting",
    description: "Přehled prodejů, konverzní poměry a chování zákazníků. Data pro lepší rozhodování.",
  },
  {
    icon: Shield,
    title: "Bezpečnost & GDPR",
    description: "SSL certifikát, zabezpečené platby a plný soulad s GDPR. Vaši zákazníci jsou v bezpečí.",
  },
  {
    icon: Search,
    title: "SEO optimalizace",
    description: "Strukturovaná data pro produkty, rychlé načítání a optimalizované URL. Google vás najde.",
  },
  {
    icon: Smartphone,
    title: "Mobilní responzivita",
    description: "Přes 70 % nákupů probíhá z mobilu. Váš e-shop bude perfektní na každém zařízení.",
  },
  {
    icon: Zap,
    title: "Bleskové načítání",
    description: "Next.js technologie zajistí načítání pod 2 sekundy. Žádné ztráty zákazníků kvůli pomalému webu.",
  },
];

const FAQS = [
  {
    question: "Kolik stojí tvorba e-shopu na míru?",
    answer:
      "Cena e-shopu na míru začíná od 14 990 Kč. Finální cena závisí na počtu produktů, požadovaných integrací (platební brány, dopravci) a dalších funkcích. Připravíme vám nezávaznou kalkulaci zdarma.",
  },
  {
    question: "Jak dlouho trvá vytvoření e-shopu?",
    answer:
      "Základní e-shop dodáváme za 2–3 týdny. Složitější projekty s vlastními integraci mohou trvat 4–6 týdnů. Vždy se dohodneme na přesném termínu předem.",
  },
  {
    question: "Jaké platební brány podporujete?",
    answer:
      "Napojíme váš e-shop na GoPay, Comgate, Stripe, PayPal i přímou platbu kartou. Podporujeme také platbu na dobírku a bankovním převodem.",
  },
  {
    question: "Proč nepoužíváte Shoptet nebo WooCommerce?",
    answer:
      "Šablonové e-shopy jsou pomalé a omezené. Náš e-shop na míru v Next.js načítá 3× rychleji, má lepší SEO a neplatíte měsíční poplatky za platformu. Přečtěte si, proč je WordPress mrtvý.",
  },
];

export default function TvorbaEshopuPage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Domů", url: "https://www.weblyx.cz" },
    { name: "Služby", url: "https://www.weblyx.cz/sluzby" },
    { name: "Tvorba e-shopu", url: "https://www.weblyx.cz/tvorba-eshopu" },
  ];

  const webpageSchema = generateWebPageSchema({
    name: "Tvorba e-shopu na míru",
    description:
      "Profesionální tvorba e-shopu na míru od 14 990 Kč. Rychlý internetový obchod s garancí PageSpeed 90+.",
    url: "https://www.weblyx.cz/tvorba-eshopu",
    breadcrumbs,
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={webpageSchema} />
      <JsonLd data={faqSchema} />

      <main className="min-h-screen">
        <Breadcrumbs items={[{ label: "Služby", href: "/sluzby" }, { label: "Tvorba e-shopu", href: "/tvorba-eshopu" }]} />

        {/* HERO */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              E-commerce řešení
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Tvorba e-shopu na míru —{" "}
              <span className="text-primary">internetový obchod, který prodává</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Vytvoříme vám <strong>rychlý e-shop</strong> postavený na moderních technologiích.
              Žádné šablony, žádné měsíční poplatky za platformu. Ceny od{" "}
              <strong>14 990 Kč</strong> s{" "}
              <Link href="/pagespeed-garance" className="text-primary hover:underline">
                garancí PageSpeed 90+
              </Link>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <LeadButton href="/poptavka" size="lg" showArrow>
                Nezávazná poptávka e-shopu
              </LeadButton>
              <Button asChild variant="outline" size="lg">
                <Link href="/portfolio">Naše reference</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* PROČ VLASTNÍ E-SHOP */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Proč <span className="text-primary">vlastní e-shop</span> místo šablony?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Šablonové e-shopy na Shoptetu či WooCommerce mají své limity. Podle naší analýzy{" "}
                <Link href="/blog/analyzovali-jsme-50-ceskych-webu-prumerny-pagespeed-43" className="text-primary hover:underline">
                  průměrný PageSpeed českých webů
                </Link>{" "}
                je pouhých 43 bodů. Náš <strong>e-shop na míru</strong> dosahuje skóre 90+.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-3">
                  <Zap className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">3× rychlejší načítání</h3>
                  <p className="text-muted-foreground">
                    Next.js e-shop načítá průměrně za <strong>0.8 sekundy</strong>. Shoptet a WooCommerce za 2–4 sekundy. Rychlost = vyšší konverze.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-3">
                  <CreditCard className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Žádné měsíční poplatky</h3>
                  <p className="text-muted-foreground">
                    Na Shoptetu platíte 500–5 000 Kč/měsíc. U nás zaplatíte jednorázově a <strong>e-shop je váš navždy</strong>.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-3">
                  <Star className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Bez limitů šablon</h3>
                  <p className="text-muted-foreground">
                    Naučte se{" "}
                    <Link href="/blog/predrazene-sablony-webovych-agentur-jak-je-poznat" className="text-primary hover:underline">
                      jak poznat předraženou šablonu
                    </Link>. Náš e-shop na míru nemá žádná omezení.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FUNKCE E-SHOPU */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline" className="mb-2">
                Kompletní řešení
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Co všechno váš <span className="text-primary">e-shop obsahuje</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Každý <strong>internetový obchod na míru</strong> od Weblyx zahrnuje kompletní sadu funkcí pro úspěšný online prodej.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature) => (
                <Card key={feature.title} className="transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-10">
              <p className="text-muted-foreground mb-4">
                Podívejte se na{" "}
                <Link href="/sluzby" className="text-primary hover:underline">
                  kompletní přehled služeb
                </Link>{" "}
                nebo si prohlédněte{" "}
                <Link href="/portfolio" className="text-primary hover:underline">
                  naše reference
                </Link>.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Kolik stojí <span className="text-primary">tvorba e-shopu</span>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transparentní ceny bez skrytých poplatků. <strong>E-shop na míru od 14 990 Kč</strong>.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="transition-all hover:shadow-lg">
                <CardHeader className="space-y-2">
                  <Package className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Základní e-shop</h3>
                  <p className="text-3xl font-black text-primary">14 990 Kč</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {["Do 50 produktů", "1 platební brána", "2 dopravci", "Responzivní design", "SEO optimalizace"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <LeadButton href="/poptavka" variant="outline" className="w-full">
                    Nezávazná poptávka
                  </LeadButton>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/60 shadow-xl transition-all hover:shadow-2xl">
                <CardHeader className="space-y-2">
                  <Badge className="w-fit">Nejoblíbenější</Badge>
                  <ShoppingCart className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Profesionální e-shop</h3>
                  <p className="text-3xl font-black text-primary">24 990 Kč</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {["Do 500 produktů", "Více platebních bran", "Všichni dopravci", "Admin panel", "Analytika", "Pokročilé SEO"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <LeadButton href="/poptavka" className="w-full">
                    Nezávazná poptávka
                  </LeadButton>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-lg">
                <CardHeader className="space-y-2">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Enterprise e-shop</h3>
                  <p className="text-3xl font-black text-primary">Na míru</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {["Neomezený počet produktů", "Vlastní integrace", "ERP/CRM napojení", "Multijazyčnost", "Dedikovaná podpora"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <LeadButton href="/poptavka" variant="outline" className="w-full">
                    Nezávazná poptávka
                  </LeadButton>
                </CardContent>
              </Card>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Nevíte, který balíček je pro vás? Podívejte se na{" "}
              <Link href="/faq" className="text-primary hover:underline">
                často kladené otázky
              </Link>{" "}
              nebo nám napište <Link href="/poptavka" className="text-primary hover:underline">nezávaznou poptávku</Link>.
            </p>
          </div>
        </section>

        {/* RELATED PAGES */}
        <section className="py-12 px-4 bg-muted/20">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Další služby, které vás mohou zajímat
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/redesign-webu" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Redesign webu</h3>
                    <p className="text-sm text-muted-foreground mt-1">Modernizace zastaralého webu nebo e-shopu</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/seo-optimalizace" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">SEO optimalizace</h3>
                    <p className="text-sm text-muted-foreground mt-1">Dostaňte svůj e-shop na přední pozice</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/wordpress-alternativa" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">WordPress alternativa</h3>
                    <p className="text-sm text-muted-foreground mt-1">Proč je Next.js lepší volba pro e-shop</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Časté dotazy k <span className="text-primary">tvorbě e-shopu</span>
              </h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Máte další otázky? Podívejte se na naše{" "}
              <Link href="/faq" className="text-primary hover:underline">
                často kladené otázky
              </Link>{" "}
              nebo nás{" "}
              <Link href="/kontakt" className="text-primary hover:underline">
                kontaktujte
              </Link>.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Chcete <span className="text-primary">e-shop, který vydělává</span>?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Vyplňte <strong>nezávaznou poptávku</strong> a do 24 hodin vám pošleme cenovou nabídku na míru. Bez závazků, bez skrytých poplatků.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <LeadButton href="/poptavka" size="lg" showArrow>
                    Nezávazná poptávka
                  </LeadButton>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/kontakt">Kontaktujte nás</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
