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
  Palette,
  Search,
  Smartphone,
  Check,
  X,
  ArrowRight,
  BarChart3,
  Globe,
  Lock,
} from "lucide-react";
import { generateWebPageSchema, BreadcrumbItem } from "@/lib/schema-org";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Webnode alternativa 2026 | Vlastní web vs Webnode | Weblyx",
  description:
    "⚡ Hledáte alternativu k Webnode? Srovnání Webnode vs vlastní web na míru. Bez měsíčních poplatků, 3× rychlejší načítání, plná kontrola nad designem i SEO. Od 7 990 Kč.",
  keywords: [
    "webnode alternativa",
    "webnode vs vlastní web",
    "alternativa k webnode",
    "webnode nevýhody",
    "webnode recenze",
    "vlastní web na míru",
    "webnode vs weblyx",
    "lepší web než webnode",
    "webnode omezení",
    "webové stránky bez webnode",
  ],
  openGraph: {
    title: "Webnode alternativa 2026 | Vlastní web vs Webnode | Weblyx",
    description:
      "⚡ Hledáte alternativu k Webnode? Srovnání Webnode vs vlastní web na míru. Bez měsíčních poplatků, 3× rychlejší.",
    url: "https://www.weblyx.cz/webnode-alternativa",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Weblyx - Webnode alternativa" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Webnode alternativa 2026 | Vlastní web vs Webnode | Weblyx",
    description:
      "⚡ Hledáte alternativu k Webnode? Srovnání Webnode vs vlastní web na míru. Bez měsíčních poplatků.",
  },
  alternates: {
    canonical: "https://www.weblyx.cz/webnode-alternativa",
    languages: getAlternateLanguages("/webnode-alternativa"),
  },
};

const COMPARISON = [
  { feature: "PageSpeed skóre", webnode: "45–65 bodů", weblyx: "90–100 bodů", winner: "weblyx" },
  { feature: "Měsíční poplatky", webnode: "199–699 Kč/měs.", weblyx: "0 Kč (jednorázová platba)", winner: "weblyx" },
  { feature: "Vlastní doména", webnode: "Od tarifu Standard", weblyx: "Vždy v ceně", winner: "weblyx" },
  { feature: "SEO možnosti", webnode: "Základní meta tagy", weblyx: "Plné SEO vč. strukturovaných dat", winner: "weblyx" },
  { feature: "Vlastní kód", webnode: "Nelze upravit", weblyx: "Plný přístup ke zdrojovému kódu", winner: "weblyx" },
  { feature: "Design na míru", webnode: "Omezené šablony", weblyx: "100% unikátní design", winner: "weblyx" },
  { feature: "Rychlost nasazení", webnode: "Do hodiny (šablona)", weblyx: "5–10 dní (na míru)", winner: "webnode" },
  { feature: "Bez technických znalostí", webnode: "Ano, drag & drop", weblyx: "Vše dodáme hotové", winner: "draw" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "3× rychlejší načítání",
    description: "Webnode šablony mají průměrný PageSpeed 45–65. Naše weby dosahují 90–100 díky Next.js a serverovému renderování.",
  },
  {
    icon: Palette,
    title: "Design bez omezení",
    description: "Žádné šablonové limity. Váš web bude vypadat přesně tak, jak chcete — pixel perfect design na míru.",
  },
  {
    icon: Search,
    title: "Plnohodnotné SEO",
    description: "Strukturovaná data, Open Graph, sitemapy, kanonické URL. Vše, co Webnode neumožňuje nastavit.",
  },
  {
    icon: Code2,
    title: "Vlastní zdrojový kód",
    description: "Web je 100% váš. Žádný vendor lock-in, žádná závislost na platformě. Přenesete kamkoli.",
  },
  {
    icon: Shield,
    title: "Bezpečnost na prvním místě",
    description: "Žádné pluginy, žádné zranitelnosti. Next.js má minimální útočný povrch oproti stavebnicím.",
  },
  {
    icon: Globe,
    title: "Neomezená škálovatelnost",
    description: "Webnode vás omezuje tarifem. Vlastní web roste s vámi — bez limitu na stránky, produkty či návštěvnost.",
  },
];

const FAQS = [
  {
    question: "Proč bych měl opustit Webnode?",
    answer:
      "Webnode je skvělý pro první web za pár minut, ale má omezení: pomalé načítání (PageSpeed 45–65), omezené SEO, nemožnost upravit kód, měsíční poplatky a závislost na platformě. Pokud chcete web, který prodává a roste s vámi, potřebujete řešení na míru.",
  },
  {
    question: "Kolik stojí přechod z Webnode na vlastní web?",
    answer:
      "Webové stránky na míru od Weblyx začínají na 7 990 Kč jednorázově. Na rozdíl od Webnode neplatíte žádné měsíční poplatky. Za 2 roky provozu tak ušetříte tisíce korun.",
  },
  {
    question: "Jak dlouho trvá vytvoření webu na míru?",
    answer:
      "Standardní web dodáváme za 5–10 pracovních dní. Složitější projekty jako e-shopy 2–3 týdny. Přesný termín stanovíme po úvodní konzultaci.",
  },
  {
    question: "Mohu si web spravovat sám jako na Webnode?",
    answer:
      "Ano. Dodáváme přehledný admin panel, kde snadno aktualizujete texty, obrázky i články na blogu. Nepotřebujete žádné technické znalosti — stejně jednoduché jako Webnode, ale bez omezení.",
  },
];

export default function WebnodeAlternativaPage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Domů", url: "https://www.weblyx.cz" },
    { name: "Webnode alternativa", url: "https://www.weblyx.cz/webnode-alternativa" },
  ];

  const webpageSchema = generateWebPageSchema({
    name: "Webnode alternativa 2026",
    description: "Srovnání Webnode vs vlastní web na míru. Bez měsíčních poplatků, 3× rychlejší načítání.",
    url: "https://www.weblyx.cz/webnode-alternativa",
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
        <Breadcrumbs items={[{ label: "Webnode alternativa", href: "/webnode-alternativa" }]} />

        {/* HERO */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              Srovnání platforem
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Webnode alternativa —{" "}
              <span className="text-primary">vlastní web bez kompromisů</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Webnode je fajn na první pokus, ale <strong>omezuje váš růst</strong>. Pomalé načítání,
              slabé SEO, měsíční poplatky. Přejděte na <strong>web na míru od 7 990 Kč</strong> s{" "}
              <Link href="/pagespeed-garance" className="text-primary hover:underline">
                garancí PageSpeed 90+
              </Link>{" "}
              — jednorázově a navždy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <LeadButton href="/poptavka" size="lg" showArrow>
                Chci web bez omezení
              </LeadButton>
              <Button asChild variant="outline" size="lg">
                <Link href="/portfolio">Ukázky našich webů</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="text-primary">Webnode vs Weblyx</span> — přímé srovnání
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Objektivní porovnání stavebnice Webnode s <strong>webem na míru</strong>. Data vychází z naší{" "}
                <Link href="/blog/analyzovali-jsme-50-ceskych-webu-prumerny-pagespeed-43" className="text-primary hover:underline">
                  analýzy 50 českých webů
                </Link>.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-primary/20">
                    <th className="text-left py-4 px-4 font-bold">Funkce</th>
                    <th className="text-center py-4 px-4 font-bold text-muted-foreground">Webnode</th>
                    <th className="text-center py-4 px-4 font-bold text-primary">Weblyx</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={i} className="border-b border-muted hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4 font-medium">{row.feature}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={row.winner === "webnode" ? "text-primary font-semibold" : "text-muted-foreground"}>
                          {row.webnode}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={row.winner === "weblyx" ? "text-primary font-semibold" : "text-muted-foreground"}>
                          {row.weblyx}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Zajímá vás také srovnání s WordPress?{" "}
              <Link href="/wordpress-alternativa" className="text-primary hover:underline">
                WordPress vs Next.js — kompletní srovnání 2026
              </Link>
            </p>
          </div>
        </section>

        {/* WHEN WEBNODE IS OK / WHEN YOU NEED CUSTOM */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Kdy stačí Webnode a kdy potřebujete <span className="text-primary">web na míru</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-muted-foreground/20">
                <CardHeader>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Check className="h-6 w-6 text-green-500" /> Webnode stačí, když…
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-3">
                    {[
                      "Potřebujete jednoduchý osobní web / vizitku",
                      "Nezáleží vám na rychlosti a SEO",
                      "Nevadí vám reklamy Webnode na bezplatném tarifu",
                      "Web nepotřebujete pro podnikání",
                      "Nechcete investovat do profesionálního řešení",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ArrowRight className="h-4 w-4 mt-0.5 text-muted-foreground/60 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Zap className="h-6 w-6 text-primary" /> Vlastní web potřebujete, když…
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-3">
                    {[
                      "Web je klíčový pro vaše podnikání a příjmy",
                      "Potřebujete rychlé načítání a výborné SEO",
                      "Chcete unikátní design, ne šablonu",
                      "Plánujete e-shop nebo složitější funkce",
                      "Nechcete platit měsíční poplatky navždy",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        <strong>{item}</strong>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline" className="mb-2">
                Proč přejít z Webnode
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Co získáte s <span className="text-primary">webem na míru</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Zjistěte, proč si firmy vybírají <strong>Weblyx jako alternativu k Webnode</strong> — a proč se nevracejí.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <p className="text-muted-foreground">
                Podívejte se na{" "}
                <Link href="/sluzby" className="text-primary hover:underline">kompletní přehled našich služeb</Link>{" "}
                nebo si přečtěte, proč jsou{" "}
                <Link href="/blog/predrazene-sablony-webovych-agentur-jak-je-poznat" className="text-primary hover:underline">
                  předražené šablony webových agentur past
                </Link>.
              </p>
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
              <Link href="/wordpress-alternativa" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">WordPress alternativa</h3>
                    <p className="text-sm text-muted-foreground mt-1">WordPress vs Next.js — kompletní srovnání</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/tvorba-eshopu" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Tvorba e-shopu na míru</h3>
                    <p className="text-sm text-muted-foreground mt-1">Internetový obchod od 14 990 Kč</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/web-pro-zivnostniky" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Web pro živnostníky</h3>
                    <p className="text-sm text-muted-foreground mt-1">Cenově dostupný web pro OSVČ</p>
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
                Časté dotazy — <span className="text-primary">Webnode alternativa</span>
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
              Další otázky zodpovíme na stránce{" "}
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
                  Přestaňte platit za <span className="text-primary">omezení Webnode</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Vyplňte <strong>nezávaznou poptávku</strong> a do 24 hodin vám pošleme nabídku na web, který Webnode nikdy nedohoní. Přechod z Webnode zvládneme bez výpadku.
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
