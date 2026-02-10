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
  Search,
  TrendingUp,
  BarChart3,
  Globe,
  FileText,
  Link2,
  Zap,
  Target,
  Check,
  ArrowRight,
  LineChart,
  Settings,
} from "lucide-react";
import { generateWebPageSchema, BreadcrumbItem } from "@/lib/schema-org";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "SEO optimalizace | SEO služby pro vyšší návštěvnost | Od 5 000 Kč/měsíc | Weblyx",
  description:
    "⚡ Profesionální SEO optimalizace a SEO služby od 5 000 Kč/měsíc. Optimalizace pro vyhledávače, keyword research, technické SEO, linkbuilding. Garance měřitelných výsledků.",
  keywords: [
    "SEO optimalizace",
    "SEO služby",
    "optimalizace pro vyhledávače",
    "SEO audit",
    "SEO analýza",
    "on-page SEO",
    "off-page SEO",
    "technické SEO",
    "linkbuilding",
    "keyword research",
    "SEO Praha",
    "SEO agentura",
  ],
  openGraph: {
    title: "SEO optimalizace | SEO služby | Od 5 000 Kč/měsíc | Weblyx",
    description:
      "⚡ Profesionální SEO optimalizace od 5 000 Kč/měsíc. Optimalizace pro vyhledávače s garancí měřitelných výsledků.",
    url: "https://www.weblyx.cz/seo-optimalizace",
    type: "website",
    images: [{ url: "/images/og/og-homepage.png", width: 1200, height: 630, alt: "Weblyx - SEO optimalizace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO optimalizace | SEO služby | Od 5 000 Kč/měsíc | Weblyx",
    description:
      "⚡ Profesionální SEO optimalizace od 5 000 Kč/měsíc. Garance měřitelných výsledků.",
  },
  alternates: {
    canonical: "https://www.weblyx.cz/seo-optimalizace",
    languages: getAlternateLanguages("/seo-optimalizace"),
  },
};

const SEO_SERVICES = [
  {
    icon: Search,
    title: "Keyword research",
    description: "Najdeme klíčová slova, která vaši zákazníci skutečně hledají. Analýza objemu hledání, konkurence a příležitostí.",
  },
  {
    icon: FileText,
    title: "On-page SEO",
    description: "Optimalizace meta tagů, headingů, obsahu a struktury stránek. Každá stránka bude perfektně optimalizovaná.",
  },
  {
    icon: Settings,
    title: "Technické SEO",
    description: "Rychlost načítání, Core Web Vitals, crawlability, indexace. Technický základ pro vysoké pozice.",
  },
  {
    icon: Link2,
    title: "Linkbuilding",
    description: "Budování kvalitních zpětných odkazů z relevantních webů. Zvyšujeme autoritu vaší domény přirozeně.",
  },
  {
    icon: Globe,
    title: "Lokální SEO",
    description: "Optimalizace pro místní vyhledávání, Google Business profil a místní citace. Ideální pro lokální podnikání.",
  },
  {
    icon: BarChart3,
    title: "Analytika a reporting",
    description: "Měsíční reporty s přehledem pozic, návštěvnosti a konverzí. Transparentní měření výsledků.",
  },
];

const FAQS = [
  {
    question: "Jak dlouho trvá, než uvidím výsledky SEO optimalizace?",
    answer:
      "První výsledky SEO optimalizace jsou viditelné obvykle za 2–3 měsíce. Významný nárůst návštěvnosti a pozic přichází za 4–6 měsíců. SEO je dlouhodobá investice, která se vyplácí násobně — na rozdíl od PPC reklamy, kde výsledky zmizí po vypnutí kampaní.",
  },
  {
    question: "Kolik stojí SEO optimalizace?",
    answer:
      "SEO služby začínají od 5 000 Kč/měsíc pro základní optimalizaci. Pro konkurenčnější obory doporučujeme investici od 8 000–15 000 Kč/měsíc. Jednorázový SEO audit stojí od 3 000 Kč. Připravíme vám nabídku na míru vašim cílům a rozpočtu.",
  },
  {
    question: "Garantujete první pozice v Googlu?",
    answer:
      "Nikdo seriózní nemůže garantovat konkrétní pozice — Google má přes 200 rankingových faktorů. Co garantujeme, jsou měřitelné výsledky: nárůst organické návštěvnosti, zlepšení pozic na cílová klíčová slova a vyšší konverzní poměr. Výsledky pravidelně reportujeme.",
  },
  {
    question: "Potřebuji SEO, když mám PPC reklamu?",
    answer:
      "SEO a PPC se doplňují. PPC přináší okamžité výsledky, ale stojí peníze za každý klik. SEO je investice, která přináší organickou návštěvnost 'zdarma'. Weby s dobrým SEO platí za reklamu méně a mají vyšší konverze díky důvěryhodnosti organických výsledků.",
  },
];

export default function SeoOptimalizacePage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Domů", url: "https://www.weblyx.cz" },
    { name: "Služby", url: "https://www.weblyx.cz/sluzby" },
    { name: "SEO optimalizace", url: "https://www.weblyx.cz/seo-optimalizace" },
  ];

  const webpageSchema = generateWebPageSchema({
    name: "SEO optimalizace",
    description: "Profesionální SEO služby a optimalizace pro vyhledávače od 5 000 Kč/měsíc.",
    url: "https://www.weblyx.cz/seo-optimalizace",
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
        <Breadcrumbs items={[{ label: "Služby", href: "/sluzby" }, { label: "SEO optimalizace", href: "/seo-optimalizace" }]} />

        {/* HERO */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              SEO služby
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              SEO optimalizace —{" "}
              <span className="text-primary">dostaňte se na první stránku Googlu</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Profesionální <strong>SEO služby</strong> a <strong>optimalizace pro vyhledávače</strong>,
              které přinesou měřitelné výsledky. Více organické návštěvnosti, vyšší pozice,
              lepší konverze. Od <strong>5 000 Kč/měsíc</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <LeadButton href="/poptavka" size="lg" showArrow>
                Nezávazná poptávka SEO
              </LeadButton>
              <Button asChild variant="outline" size="lg">
                <Link href="/portfolio">Naše reference</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* PROČ SEO */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Proč investovat do <span className="text-primary">SEO optimalizace</span>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                <strong>93 % online zážitků</strong> začíná ve vyhledávači. Pokud váš web není na první stránce Googlu, jako byste neexistovali.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-3">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Organická návštěvnost</h3>
                  <p className="text-muted-foreground">
                    Návštěvníci z organického vyhledávání mají <strong>5.66× vyšší konverzní poměr</strong> než z placené reklamy. A neplatíte za každý klik.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-3">
                  <Target className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Cílení na zákazníky</h3>
                  <p className="text-muted-foreground">
                    SEO přivádí lidi, kteří <strong>aktivně hledají</strong> vaše produkty nebo služby. To je nejkvalitnější traffic, který můžete získat.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-3">
                  <LineChart className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Dlouhodobá investice</h3>
                  <p className="text-muted-foreground">
                    Na rozdíl od PPC reklamy, SEO přináší výsledky <strong>i měsíce po ukončení</strong> aktivní optimalizace. Investice se násobně vrátí.
                  </p>
                </CardContent>
              </Card>
            </div>

            <p className="text-center text-muted-foreground mt-8">
              Víte, že{" "}
              <Link href="/blog/analyzovali-jsme-50-ceskych-webu-prumerny-pagespeed-43" className="text-primary hover:underline">
                průměrný PageSpeed českých webů
              </Link>{" "}
              je pouhých 43 bodů? Rychlost webu je klíčový faktor pro SEO.
            </p>
          </div>
        </section>

        {/* SEO SLUŽBY */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline" className="mb-2">
                Kompletní SEO služby
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Co zahrnuje naše <span className="text-primary">SEO optimalizace</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Kompletní <strong>optimalizace pro vyhledávače</strong> — od analýzy klíčových slov po budování zpětných odkazů.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SEO_SERVICES.map((service) => (
                <Card key={service.title} className="transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-10">
              <p className="text-muted-foreground">
                Podívejte se na{" "}
                <Link href="/sluzby" className="text-primary hover:underline">
                  kompletní přehled služeb
                </Link>{" "}
                včetně tvorby webů a e-shopů.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ceník <span className="text-primary">SEO služeb</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="transition-all hover:shadow-lg">
                <CardHeader className="space-y-2">
                  <Search className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">SEO audit</h3>
                  <p className="text-3xl font-black text-primary">od 3 000 Kč</p>
                  <p className="text-sm text-muted-foreground">jednorázově</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {["Kompletní analýza webu", "Keyword research", "Technický audit", "Konkurenční analýza", "Akční plán s prioritami"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <LeadButton href="/poptavka" variant="outline" className="w-full">
                    Objednat audit
                  </LeadButton>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/60 shadow-xl transition-all hover:shadow-2xl">
                <CardHeader className="space-y-2">
                  <Badge className="w-fit">Nejoblíbenější</Badge>
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Měsíční SEO</h3>
                  <p className="text-3xl font-black text-primary">od 5 000 Kč</p>
                  <p className="text-sm text-muted-foreground">měsíčně</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {["Vše z SEO auditu", "On-page optimalizace", "Technické SEO", "Měsíční reporting", "Konzultace a podpora"].map((f) => (
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
                  <h3 className="text-xl font-bold">Premium SEO</h3>
                  <p className="text-3xl font-black text-primary">od 12 000 Kč</p>
                  <p className="text-sm text-muted-foreground">měsíčně</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {["Vše z měsíčního SEO", "Linkbuilding", "Content marketing", "Lokální SEO", "Dedikovaný SEO specialista"].map((f) => (
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
          </div>
        </section>

        {/* RELATED PAGES */}
        <section className="py-12 px-4 bg-muted/20">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold mb-6 text-center">
              SEO funguje nejlépe s kvalitním webem
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/redesign-webu" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Redesign webu</h3>
                    <p className="text-sm text-muted-foreground mt-1">Moderní web = lepší SEO výsledky</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/web-pro-zivnostniky" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Web pro živnostníky</h3>
                    <p className="text-sm text-muted-foreground mt-1">Cenově dostupný web se SEO v ceně</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/webnode-alternativa" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Webnode alternativa</h3>
                    <p className="text-sm text-muted-foreground mt-1">Proč Webnode omezuje vaše SEO</p>
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
                Časté dotazy k <span className="text-primary">SEO optimalizaci</span>
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
              Další otázky najdete v sekci{" "}
              <Link href="/faq" className="text-primary hover:underline">často kladené otázky</Link>{" "}
              nebo nás{" "}
              <Link href="/kontakt" className="text-primary hover:underline">kontaktujte</Link>.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Chcete <span className="text-primary">více zákazníků z Googlu</span>?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Vyplňte <Link href="/poptavka" className="text-primary hover:underline font-semibold">nezávaznou poptávku</Link> a dostanete zdarma základní SEO analýzu vašeho webu. Ukážeme vám, kde máte největší příležitosti.
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
