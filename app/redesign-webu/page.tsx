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
  RefreshCw,
  Zap,
  Palette,
  TrendingUp,
  Shield,
  Smartphone,
  Search,
  BarChart3,
  Check,
  ArrowRight,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { generateWebPageSchema, BreadcrumbItem } from "@/lib/schema-org";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Redesign webu | Modernizace webových stránek | Od 15 000 Kč | Weblyx",
  description:
    "⚡ Profesionální redesign webu a modernizace webových stránek od 15 000 Kč. Nový moderní design, rychlejší načítání, lepší SEO. Předělání webových stránek za 2–3 týdny.",
  keywords: [
    "redesign webu",
    "modernizace webu",
    "předělání webových stránek",
    "redesign webových stránek",
    "modernizace webových stránek",
    "nový web",
    "přepracování webu",
    "redesign e-shopu",
    "nový design webu",
    "upgrade webu",
  ],
  openGraph: {
    title: "Redesign webu | Modernizace webových stránek | Weblyx",
    description:
      "⚡ Profesionální redesign webu od 15 000 Kč. Nový moderní design, rychlejší načítání, lepší SEO.",
    url: "https://www.weblyx.cz/redesign-webu",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Weblyx - Redesign webu" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Redesign webu | Modernizace webových stránek | Weblyx",
    description:
      "⚡ Profesionální redesign webu od 15 000 Kč. Nový moderní design, rychlejší načítání, lepší SEO.",
  },
  alternates: {
    canonical: "https://www.weblyx.cz/redesign-webu",
    languages: getAlternateLanguages("/redesign-webu"),
  },
};

const WARNING_SIGNS = [
  { icon: Clock, text: "Web načítá déle než 3 sekundy" },
  { icon: Smartphone, text: "Nefunguje správně na mobilu" },
  { icon: TrendingUp, text: "Klesá návštěvnost z Googlu" },
  { icon: AlertTriangle, text: "Design vypadá zastarale (starší než 3 roky)" },
  { icon: Shield, text: "Web běží na zastaralém WordPressu" },
  { icon: Search, text: "Konkurence vás předběhla ve vyhledávání" },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Audit současného webu",
    description: "Kompletní analýza výkonu, UX, SEO a technického stavu. Identifikujeme všechny problémy a příležitosti.",
  },
  {
    step: "02",
    title: "Návrh nového designu",
    description: "Moderní design respektující vaši značku. Wireframy a prototypy ke schválení před realizací.",
  },
  {
    step: "03",
    title: "Vývoj a migrace",
    description: "Implementace nového webu v Next.js. Migrace obsahu a nastavení SEO přesměrování (301 redirecty).",
  },
  {
    step: "04",
    title: "Testování a spuštění",
    description: "Důkladné testování na všech zařízeních. Plynulý přechod bez výpadku a ztráty pozic v Googlu.",
  },
];

const FAQS = [
  {
    question: "Ztratím po redesignu pozice v Googlu?",
    answer:
      "Ne, pokud je redesign proveden správně. Nastavíme 301 přesměrování ze starých URL na nové, zachováme strukturu obsahu a zajistíme, že Google přechod zaznamená hladce. Většina našich klientů po redesignu pozice naopak zlepší díky rychlejšímu načítání a lepšímu SEO.",
  },
  {
    question: "Jak dlouho trvá redesign webu?",
    answer:
      "Typický redesign trvá 2–4 týdny v závislosti na rozsahu. Jednoduchý prezentační web zvládneme za 2 týdny, složitější web s e-shopem za 4–6 týdnů. Přesný harmonogram dohodneme předem.",
  },
  {
    question: "Kolik stojí redesign webu?",
    answer:
      "Ceny redesignu začínají od 15 000 Kč pro jednoduchý prezentační web. Cena závisí na rozsahu změn, počtu stránek a požadovaných funkcích. Připravíme vám nezávaznou kalkulaci zdarma.",
  },
  {
    question: "Můžete převést web z WordPressu do Next.js?",
    answer:
      "Ano, specializujeme se na migraci z WordPressu do Next.js. Přečtěte si náš článek o tom, proč je WordPress mrtvý, a jaké výhody přechod přinese pro rychlost, bezpečnost i SEO vašeho webu.",
  },
];

export default function RedesignWebuPage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Domů", url: "https://www.weblyx.cz" },
    { name: "Služby", url: "https://www.weblyx.cz/sluzby" },
    { name: "Redesign webu", url: "https://www.weblyx.cz/redesign-webu" },
  ];

  const webpageSchema = generateWebPageSchema({
    name: "Redesign webu",
    description:
      "Profesionální redesign a modernizace webových stránek od 15 000 Kč.",
    url: "https://www.weblyx.cz/redesign-webu",
    breadcrumbs,
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <JsonLd data={webpageSchema} />
      <JsonLd data={faqSchema} />

      <main className="min-h-screen">
        <Breadcrumbs items={[{ label: "Služby", href: "/sluzby" }, { label: "Redesign webu", href: "/redesign-webu" }]} />

        {/* HERO */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              Modernizace webu
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Redesign webu —{" "}
              <span className="text-primary">dejte svému webu nový život</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              <strong>Modernizace webových stránek</strong> zvýší návštěvnost, konverze i důvěru zákazníků.
              Předěláme váš zastaralý web do moderní podoby s{" "}
              <Link href="/pagespeed-garance" className="text-primary hover:underline">
                garancí PageSpeed 90+
              </Link>. Ceny od <strong>15 000 Kč</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <LeadButton href="/poptavka" size="lg" showArrow>
                Nezávazná poptávka
              </LeadButton>
              <Button asChild variant="outline" size="lg">
                <Link href="/portfolio">Naše reference</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* VAROVNÉ SIGNÁLY */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Kdy je čas na <span className="text-primary">předělání webových stránek</span>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Podle naší analýzy má{" "}
                <Link href="/blog/analyzovali-jsme-50-ceskych-webu-prumerny-pagespeed-43" className="text-primary hover:underline">
                  průměrný PageSpeed českých webů
                </Link>{" "}
                pouhých 43 bodů. Pozná se to na těchto příznacích:
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {WARNING_SIGNS.map((sign, i) => (
                <Card key={i} className="border-orange-200 dark:border-orange-800/30 bg-orange-50/50 dark:bg-orange-950/10">
                  <CardContent className="p-5 flex items-start gap-3">
                    <sign.icon className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                    <p className="font-medium">{sign.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-center text-muted-foreground mt-8">
              Poznáváte svůj web? Je čas na změnu. Zjistěte{" "}
              <Link href="/blog/predrazene-sablony-webovych-agentur-jak-je-poznat" className="text-primary hover:underline">
                jak poznat předraženou šablonu
              </Link>{" "}
              a co s tím dělat.
            </p>
          </div>
        </section>

        {/* PROCES */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline" className="mb-2">
                Jak to funguje
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Jak probíhá <span className="text-primary">redesign webu</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {PROCESS_STEPS.map((step) => (
                <Card key={step.step} className="transition-all hover:shadow-lg hover:border-primary/20">
                  <CardContent className="p-6 space-y-3">
                    <span className="text-4xl font-black text-primary/20">{step.step}</span>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CO ZÍSKÁTE */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Co získáte <span className="text-primary">po redesignu</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" /> Rychlost a výkon
                </h3>
                <ul className="space-y-2">
                  {[
                    "PageSpeed skóre 90+ (garancováno)",
                    "Načítání pod 2 sekundy",
                    "Optimalizované obrázky a média",
                    "Core Web Vitals v zeleném",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" /> Design a UX
                </h3>
                <ul className="space-y-2">
                  {[
                    "Moderní, profesionální design",
                    "Perfektní responzivita na mobilu",
                    "Lepší uživatelská zkušenost",
                    "Vyšší konverzní poměr",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" /> SEO a viditelnost
                </h3>
                <ul className="space-y-2">
                  {[
                    "Kompletní on-page SEO",
                    "Správné 301 přesměrování",
                    "Strukturovaná data (Schema.org)",
                    "Lepší pozice ve vyhledávačích",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> Bezpečnost
                </h3>
                <ul className="space-y-2">
                  {[
                    "Moderní technologie (Next.js)",
                    "Žádné zranitelné pluginy",
                    "SSL certifikát v ceně",
                    "GDPR soulad",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-center text-muted-foreground mt-10">
              Zajímá vás{" "}
              <Link href="/blog/wordpress-vs-nextjs-srovnani-2026" className="text-primary hover:underline">
                proč je WordPress mrtvý
              </Link>? Přečtěte si naše srovnání technologií.
            </p>
          </div>
        </section>

        {/* RELATED PAGES */}
        <section className="py-12 px-4 bg-muted/20">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Související služby
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/seo-optimalizace" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">SEO optimalizace</h3>
                    <p className="text-sm text-muted-foreground mt-1">Dostaňte se na přední pozice po redesignu</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/wordpress-alternativa" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">WordPress alternativa</h3>
                    <p className="text-sm text-muted-foreground mt-1">Přechod z WordPressu na moderní technologii</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/tvorba-eshopu" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Tvorba e-shopu</h3>
                    <p className="text-sm text-muted-foreground mt-1">Kompletní redesign e-shopu na míru</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                Časté dotazy k <span className="text-primary">redesignu webu</span>
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
              Více odpovědí najdete na stránce{" "}
              <Link href="/faq" className="text-primary hover:underline">často kladené otázky</Link>.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Připraveni na <span className="text-primary">modernizaci webu</span>?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Pošlete nám <strong>nezávaznou poptávku</strong> a do 24 hodin dostanete zdarma audit vašeho současného webu a cenovou nabídku redesignu.
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
