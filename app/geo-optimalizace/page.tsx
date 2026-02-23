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
  Zap,
  Target,
  Check,
  ArrowRight,
  Bot,
  Database,
  Code,
  Building2,
  Quote,
  Activity,
} from "lucide-react";
import { generateWebPageSchema, BreadcrumbItem } from "@/lib/schema-org";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "GEO optimalizace | Optimalizace pro AI vyhledávání",
  description:
    "Připravte web na AI vyhledávání (ChatGPT, Perplexity, Google AI). GEO optimalizace od 5 000 Kč/měsíc. Schema.org audit, strukturovaná data, AI-ready obsah.",
  keywords: [
    "GEO optimalizace",
    "AI vyhledávání",
    "Schema.org audit",
    "strukturovaná data",
    "ChatGPT optimalizace",
    "Perplexity optimalizace",
    "Google AI Overviews",
    "generative engine optimization",
    "AI search optimization",
    "GEO služby",
  ],
  openGraph: {
    title: "GEO optimalizace | Optimalizace pro AI vyhledávání | Weblyx",
    description:
      "Připravte web na AI vyhledávání (ChatGPT, Perplexity, Google AI). GEO optimalizace od 5 000 Kč/měsíc.",
    url: "https://www.weblyx.cz/geo-optimalizace",
    type: "website",
    images: [{ url: "/images/og/og-geo-optimalizace.png", width: 1200, height: 630, alt: "Weblyx - GEO optimalizace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GEO optimalizace | Optimalizace pro AI vyhledávání | Weblyx",
    description:
      "Připravte web na AI vyhledávání. GEO optimalizace od 5 000 Kč/měsíc.",
  },
  alternates: {
    canonical: "https://www.weblyx.cz/geo-optimalizace",
    languages: getAlternateLanguages("/geo-optimalizace"),
  },
};

const GEO_SERVICES = [
  {
    icon: Database,
    title: "Schema.org audit",
    description: "Kompletní analýza strukturovaných dat na vašem webu. Identifikujeme chybějící schémata, která AI modely potřebují k pochopení vašeho obsahu.",
  },
  {
    icon: Code,
    title: "Strukturovaná data",
    description: "Implementace JSON-LD schémat — Organization, Product, FAQ, HowTo, LocalBusiness. Váš web mluví jazykem, kterému AI rozumí.",
  },
  {
    icon: FileText,
    title: "AI-ready obsah",
    description: "Optimalizace textů pro AI vyhledávače. Jasné odpovědi na otázky, strukturované informace a kontextové propojení obsahu.",
  },
  {
    icon: Building2,
    title: "Entity building",
    description: "Budování digitální identity vaší firmy. Propojení webu, Google Business, sociálních sítí a oborových katalogů do jedné entity.",
  },
  {
    icon: Quote,
    title: "Citation signály",
    description: "Získání citací a referencí na autoritativních zdrojích. AI modely preferují informace z důvěryhodných a ověřitelných zdrojů.",
  },
  {
    icon: Activity,
    title: "Monitoring AI visibility",
    description: "Sledování, jak často a v jakém kontextu AI vyhledávače zmiňují vaši firmu. Měření viditelnosti v ChatGPT, Perplexity a Google AI.",
  },
];

const FAQS = [
  {
    question: "Co je GEO optimalizace?",
    answer:
      "GEO (Generative Engine Optimization) je optimalizace webu pro AI vyhledávače jako ChatGPT, Perplexity nebo Google AI Overviews. Na rozdíl od klasického SEO, které cílí na pozice v Google, GEO zajistí, že AI modely vaši firmu znají, citují a doporučují uživatelům.",
  },
  {
    question: "Jaký je rozdíl mezi SEO a GEO?",
    answer:
      "SEO optimalizuje web pro tradiční vyhledávače (Google, Seznam) a cílí na vyšší pozice ve výsledcích. GEO optimalizuje pro AI vyhledávače (ChatGPT, Perplexity) a cílí na to, aby AI modely vaši firmu citovaly jako autoritu. Obě strategie se doplňují — dobrý základ SEO pomáhá i GEO.",
  },
  {
    question: "Potřebuji GEO optimalizaci?",
    answer:
      "Pokud vaši potenciální zákazníci používají AI nástroje (a 37 % spotřebitelů už je používá místo Google), pak ano. GEO je obzvlášť důležité pro B2B firmy, profesionální služby a e-shopy, kde zákazníci hledají doporučení a srovnání přes AI.",
  },
  {
    question: "Kdy uvidím výsledky GEO optimalizace?",
    answer:
      "První změny v AI odpovědích se projeví do 2–4 týdnů po implementaci strukturovaných dat. Budování entity a citačních signálů je dlouhodobý proces — výrazné zlepšení viditelnosti v AI vyhledávačích očekávejte za 2–3 měsíce.",
  },
];

export default function GeoOptimalizacePage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Domů", url: "https://www.weblyx.cz" },
    { name: "Služby", url: "https://www.weblyx.cz/sluzby" },
    { name: "GEO optimalizace", url: "https://www.weblyx.cz/geo-optimalizace" },
  ];

  const webpageSchema = generateWebPageSchema({
    name: "GEO optimalizace",
    description: "Optimalizace webu pro AI vyhledávání — ChatGPT, Perplexity, Google AI. Od 5 000 Kč/měsíc.",
    url: "https://www.weblyx.cz/geo-optimalizace",
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
        <Breadcrumbs items={[{ label: "Služby", href: "/sluzby" }, { label: "GEO optimalizace", href: "/geo-optimalizace" }]} />

        {/* HERO */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              GEO služby
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              GEO optimalizace —{" "}
              <span className="text-primary">připravte web na AI vyhledávání</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              <strong>37 % spotřebitelů</strong> už hledá přes AI místo Googlu.{" "}
              <strong>93 % odpovědí</strong> v AI vyhledávačích je bez kliknutí na web.
              Připravte se na budoucnost vyhledávání s <strong>GEO optimalizací od 5 000 Kč/měsíc</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <LeadButton href="/poptavka" size="lg" showArrow>
                Nezávazná poptávka GEO
              </LeadButton>
              <Button asChild variant="outline" size="lg">
                <Link href="/blog/ai-vyhledavani-nahrazuje-google-geo-optimalizace">Přečtěte si článek</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* PROČ GEO */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Proč investovat do <span className="text-primary">GEO optimalizace</span>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                AI mění způsob, jakým lidé hledají informace. Kdo se nepřizpůsobí, ztratí zákazníky.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-3">
                  <Bot className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">AI mění vyhledávání</h3>
                  <p className="text-muted-foreground">
                    <strong>37 % spotřebitelů</strong> používá AI nástroje jako ChatGPT nebo Perplexity místo klasického Googlu. Tento trend roste každý měsíc.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-3">
                  <Target className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Zero-click éra</h3>
                  <p className="text-muted-foreground">
                    <strong>93 % odpovědí</strong> v AI vyhledávačích je bez kliknutí na web. AI dá odpověď přímo — a buď zmíní vaši firmu, nebo konkurenci.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-3">
                  <Zap className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Budoucnost je teď</h3>
                  <p className="text-muted-foreground">
                    Google AI Overviews se rozšiřují globálně. Firmy, které začnou s GEO optimalizací dnes, budou mít <strong>náskok před konkurencí</strong>.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* GEO SLUŽBY */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline" className="mb-2">
                Kompletní GEO služby
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Co zahrnuje naše <span className="text-primary">GEO optimalizace</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Kompletní optimalizace pro AI vyhledávače — od Schema.org auditu po monitoring AI viditelnosti.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {GEO_SERVICES.map((service) => (
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
          </div>
        </section>

        {/* PRICING */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ceník <span className="text-primary">GEO služeb</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="transition-all hover:shadow-lg">
                <CardHeader className="space-y-2">
                  <Search className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">GEO audit</h3>
                  <p className="text-3xl font-black text-primary">od 3 000 Kč</p>
                  <p className="text-sm text-muted-foreground">jednorázově</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {["Schema.org analýza", "Kontrola strukturovaných dat", "AI viditelnost check", "Konkurenční srovnání", "Akční plán s prioritami"].map((f) => (
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
                  <h3 className="text-xl font-bold">Měsíční GEO</h3>
                  <p className="text-3xl font-black text-primary">od 5 000 Kč</p>
                  <p className="text-sm text-muted-foreground">měsíčně</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {["Vše z GEO auditu", "Implementace Schema.org", "AI-ready optimalizace obsahu", "Entity building", "Měsíční monitoring a reporting"].map((f) => (
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
                  <h3 className="text-xl font-bold">Premium GEO + SEO</h3>
                  <p className="text-3xl font-black text-primary">od 10 000 Kč</p>
                  <p className="text-sm text-muted-foreground">měsíčně</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {["Vše z měsíčního GEO", "Kompletní SEO optimalizace", "Content marketing", "Citation building", "Dedikovaný GEO + SEO specialista"].map((f) => (
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
              GEO funguje nejlépe v kombinaci s dalšími službami
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/seo-optimalizace" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">SEO optimalizace</h3>
                    <p className="text-sm text-muted-foreground mt-1">Klasické SEO jako základ pro GEO</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/redesign-webu" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Redesign webu</h3>
                    <p className="text-sm text-muted-foreground mt-1">Moderní web = lepší AI viditelnost</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/tvorba-webu-praha" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Tvorba webu Praha</h3>
                    <p className="text-sm text-muted-foreground mt-1">Web optimalizovaný pro AI od začátku</p>
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
                Časté dotazy ke <span className="text-primary">GEO optimalizaci</span>
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
                  Chcete být viditelní v <span className="text-primary">AI vyhledávání</span>?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Vyplňte <Link href="/poptavka" className="text-primary hover:underline font-semibold">nezávaznou poptávku</Link> a dostanete zdarma základní GEO audit vašeho webu. Ukážeme vám, jak jste na tom v AI vyhledávačích.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <LeadButton href="/poptavka" size="lg" showArrow>
                    Nezávazná poptávka GEO
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
