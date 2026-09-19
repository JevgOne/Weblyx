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
  Zap,
  Shield,
  Code2,
  Search,
  Lock,
  BarChart3,
  Server,
  DollarSign,
  Check,
  X,
  ArrowRight,
  AlertTriangle,
  Gauge,
} from "lucide-react";
import { generateWebPageSchema, BreadcrumbItem } from "@/lib/schema-org";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "WordPress alternativa 2026 | WordPress vs Next.js srovnání | Weblyx",
  description:
    "⚡ WordPress je pomalý, zranitelný a předražený. Srovnání WordPress vs Next.js: PageSpeed, bezpečnost, náklady. Moderní alternativa WordPress od 7 990 Kč bez měsíčních poplatků.",
  keywords: [
    "wordpress alternativa",
    "wordpress vs next.js",
    "wordpress vs nextjs",
    "alternativa k wordpress",
    "wordpress nevýhody",
    "proč nepoužívat wordpress",
    "wordpress je mrtvý",
    "next.js web",
    "moderní web bez wordpress",
    "wordpress pomalý",
  ],
  openGraph: {
    title: "WordPress alternativa 2026 | WordPress vs Next.js | Weblyx",
    description:
      "⚡ WordPress je pomalý, zranitelný a předražený. Srovnání WordPress vs Next.js: PageSpeed, bezpečnost, náklady.",
    url: "https://www.weblyx.cz/wordpress-alternativa",
    type: "website",
    images: [{ url: "/images/og/og-wordpress-alternativa.png", width: 1200, height: 630, alt: "Weblyx - WordPress alternativa" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "WordPress alternativa 2026 | WordPress vs Next.js | Weblyx",
    description:
      "⚡ WordPress je pomalý, zranitelný a předražený. Moderní alternativa od 7 990 Kč.",
  },
  alternates: {
    canonical: "https://www.weblyx.cz/wordpress-alternativa",
    languages: getAlternateLanguages("/wordpress-alternativa"),
  },
};

const PAGESPEED_COMPARISON = [
  { metric: "PageSpeed skóre (mobil)", wordpress: "28–55", nextjs: "90–100", unit: "bodů" },
  { metric: "First Contentful Paint", wordpress: "2.8–4.5 s", nextjs: "0.4–0.8 s", unit: "" },
  { metric: "Largest Contentful Paint", wordpress: "4.2–8.0 s", nextjs: "0.8–1.5 s", unit: "" },
  { metric: "Time to Interactive", wordpress: "5.0–12.0 s", nextjs: "0.6–1.2 s", unit: "" },
  { metric: "Cumulative Layout Shift", wordpress: "0.15–0.45", nextjs: "0.00–0.05", unit: "" },
  { metric: "Velikost stránky", wordpress: "2–8 MB", nextjs: "0.3–1 MB", unit: "" },
];

const SECURITY_COMPARISON = [
  { aspect: "Známé zranitelnosti (CVE)", wordpress: "2 000+ ročně (pluginy)", nextjs: "Minimální útočný povrch" },
  { aspect: "Útoky brute force", wordpress: "wp-login.php je hlavní cíl", nextjs: "Žádný veřejný login endpoint" },
  { aspect: "SQL Injection", wordpress: "Vysoké riziko (pluginy)", nextjs: "Nulové (žádná SQL databáze)" },
  { aspect: "Aktualizace", wordpress: "Nutné neustále (WP + pluginy)", nextjs: "Statický build, žádné závislosti" },
  { aspect: "DDoS odolnost", wordpress: "Slabá (PHP server)", nextjs: "Vysoká (CDN + edge)" },
];

const COST_COMPARISON = [
  { item: "Licence / platforma", wordpress: "Zdarma (ale pluginy 50–500 $/rok)", nextjs: "Zdarma (open-source)" },
  { item: "Hosting", wordpress: "3 000–15 000 Kč/rok", nextjs: "0 Kč (Vercel free tier)", },
  { item: "Zabezpečení (SSL, WAF)", wordpress: "2 000–8 000 Kč/rok", nextjs: "0 Kč (v ceně Vercel)" },
  { item: "Údržba a aktualizace", wordpress: "5 000–20 000 Kč/rok", nextjs: "0 Kč (statický build)" },
  { item: "Celkové roční náklady", wordpress: "10 000–43 000 Kč", nextjs: "0–2 000 Kč" },
];

const FAQS = [
  {
    question: "Je Next.js skutečně lepší než WordPress?",
    answer:
      "Pro výkon, bezpečnost a SEO — jednoznačně ano. Next.js dosahuje PageSpeed 90–100 (WordPress průměrně 35–55), nemá žádné známé zranitelnosti pluginů a nepotřebuje hosting za tisíce korun měsíčně. Pro jednoduché blogy s desítkami tisíc příspěvků může být WordPress stále vhodný, ale pro firemní weby a e-shopy je Next.js jasná volba.",
  },
  {
    question: "Mohu na Next.js webu mít blog a admin panel?",
    answer:
      "Samozřejmě. Dodáváme přehledný admin panel s WYSIWYG editorem pro správu článků, stránek i produktů. Funguje to stejně intuitivně jako WordPress, ale bez pomalého načítání a bezpečnostních rizik.",
  },
  {
    question: "Kolik stojí přechod z WordPress na Next.js?",
    answer:
      "Migrace z WordPress na Next.js web začíná od 7 990 Kč. V ceně je přenos obsahu, nový design, SEO nastavení a přesměrování starých URL (301). Garantujeme nulový výpadek v indexaci.",
  },
  {
    question: "Co moje WordPress pluginy? Najdu je i v Next.js?",
    answer:
      "Většinu funkcí WordPress pluginů (kontaktní formuláře, SEO, galerie, e-shop) nahradíme nativním kódem, který je rychlejší a bezpečnější. Na rozdíl od pluginů to nevyžaduje pravidelné aktualizace.",
  },
];

export default function WordpressAlternativaPage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Domů", url: "https://www.weblyx.cz" },
    { name: "WordPress alternativa", url: "https://www.weblyx.cz/wordpress-alternativa" },
  ];

  const webpageSchema = generateWebPageSchema({
    name: "WordPress alternativa 2026",
    description: "Srovnání WordPress vs Next.js: PageSpeed, bezpečnost, náklady. Moderní alternativa od 7 990 Kč.",
    url: "https://www.weblyx.cz/wordpress-alternativa",
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
        <Breadcrumbs items={[{ label: "WordPress alternativa", href: "/wordpress-alternativa" }]} />

        {/* HERO */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              WordPress vs Next.js
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              WordPress alternativa —{" "}
              <span className="text-primary">rychlejší, bezpečnější, levnější</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              WordPress pohání 40 % internetu — a <strong>většina z nich má PageSpeed pod 50</strong>.
              Naše weby v Next.js dosahují <strong>skóre 90–100</strong> za cenu od{" "}
              <strong>7 990 Kč</strong>. Přečtěte si{" "}
              <Link href="/blog/wordpress-vs-nextjs-srovnani-2026" className="text-primary hover:underline">
                kompletní srovnání WordPress vs Next.js
              </Link>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <LeadButton href="/poptavka" size="lg" showArrow>
                Chci web bez WordPress
              </LeadButton>
              <Button asChild variant="outline" size="lg">
                <Link href="/portfolio">Naše reference</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* PAGESPEED COMPARISON */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline" className="mb-2">
                <Gauge className="h-4 w-4 mr-1" /> Data-driven srovnání
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="text-primary">PageSpeed</span>: WordPress vs Next.js
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Reálná data z{" "}
                <Link href="/blog/analyzovali-jsme-50-ceskych-webu-prumerny-pagespeed-43" className="text-primary hover:underline">
                  naší analýzy 50 českých webů
                </Link>. Průměrný WordPress web má PageSpeed <strong>43 bodů</strong>.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-primary/20">
                    <th className="text-left py-4 px-4 font-bold">Metrika</th>
                    <th className="text-center py-4 px-4 font-bold text-red-500">WordPress</th>
                    <th className="text-center py-4 px-4 font-bold text-primary">Next.js (Weblyx)</th>
                  </tr>
                </thead>
                <tbody>
                  {PAGESPEED_COMPARISON.map((row, i) => (
                    <tr key={i} className="border-b border-muted hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4 font-medium">{row.metric}</td>
                      <td className="py-4 px-4 text-center text-red-500/80">{row.wordpress}</td>
                      <td className="py-4 px-4 text-center text-primary font-semibold">{row.nextjs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Garantujeme{" "}
              <Link href="/pagespeed-garance" className="text-primary hover:underline">
                PageSpeed skóre 90+ pro každý web
              </Link>.
            </p>
          </div>
        </section>

        {/* SECURITY */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Bezpečnost: <span className="text-primary">WordPress je noční můra</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                <strong>WordPress pluginy</strong> jsou zodpovědné za více než 90 % napadených webů.
                Next.js nemá pluginy, nemá databázi, nemá co napadnout.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-primary/20">
                    <th className="text-left py-4 px-4 font-bold">Bezpečnostní aspekt</th>
                    <th className="text-center py-4 px-4 font-bold text-red-500">
                      <AlertTriangle className="h-4 w-4 inline mr-1" />WordPress
                    </th>
                    <th className="text-center py-4 px-4 font-bold text-primary">
                      <Shield className="h-4 w-4 inline mr-1" />Next.js
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SECURITY_COMPARISON.map((row, i) => (
                    <tr key={i} className="border-b border-muted hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4 font-medium">{row.aspect}</td>
                      <td className="py-4 px-4 text-center text-red-500/80 text-sm">{row.wordpress}</td>
                      <td className="py-4 px-4 text-center text-primary text-sm font-medium">{row.nextjs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* COST COMPARISON */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Roční náklady: <span className="text-primary">WordPress vs Next.js</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                WordPress je &quot;zdarma&quot;, ale <strong>skutečné náklady na provoz</strong> jsou překvapivě vysoké.
                Naučte se{" "}
                <Link href="/blog/predrazene-sablony-webovych-agentur-jak-je-poznat" className="text-primary hover:underline">
                  rozpoznat předražené webové agentury
                </Link>.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-primary/20">
                    <th className="text-left py-4 px-4 font-bold">Položka</th>
                    <th className="text-center py-4 px-4 font-bold text-red-500">WordPress</th>
                    <th className="text-center py-4 px-4 font-bold text-primary">Next.js (Weblyx)</th>
                  </tr>
                </thead>
                <tbody>
                  {COST_COMPARISON.map((row, i) => (
                    <tr key={i} className={`border-b border-muted hover:bg-muted/30 transition-colors ${i === COST_COMPARISON.length - 1 ? "font-bold bg-muted/20" : ""}`}>
                      <td className="py-4 px-4">{row.item}</td>
                      <td className="py-4 px-4 text-center text-red-500/80">{row.wordpress}</td>
                      <td className="py-4 px-4 text-center text-primary">{row.nextjs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* RELATED PAGES */}
        <section className="py-12 px-4 bg-muted/20">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Další srovnání a služby
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/webnode-alternativa" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Webnode alternativa</h3>
                    <p className="text-sm text-muted-foreground mt-1">Webnode vs vlastní web na míru</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/seo-optimalizace" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">SEO optimalizace</h3>
                    <p className="text-sm text-muted-foreground mt-1">Dostaňte se na první pozice v Google</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/redesign-webu" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Redesign webu</h3>
                    <p className="text-sm text-muted-foreground mt-1">Migrace z WordPress na Next.js</p>
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
                Časté dotazy — <span className="text-primary">WordPress alternativa</span>
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
              Přečtěte si náš blog post{" "}
              <Link href="/blog/wordpress-vs-nextjs-srovnani-2026" className="text-primary hover:underline">
                WordPress vs Next.js — kompletní srovnání 2026
              </Link>{" "}
              nebo se podívejte na{" "}
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
                  Odejděte od <span className="text-primary">WordPress ještě dnes</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Vyplňte <strong>nezávaznou poptávku</strong> a do 24 hodin vám připravíme nabídku na migraci z WordPress.
                  Nulový výpadek, přenos SEO, moderní design.
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
