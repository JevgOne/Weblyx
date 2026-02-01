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
  Briefcase,
  Globe,
  Zap,
  Search,
  Smartphone,
  Shield,
  Clock,
  CreditCard,
  Check,
  ArrowRight,
  Users,
  Star,
} from "lucide-react";
import { generateWebPageSchema, BreadcrumbItem } from "@/lib/schema-org";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Web pro živnostníky | Webové stránky pro OSVČ od 7 990 Kč | Weblyx",
  description:
    "⚡ Profesionální web pro živnostníky a OSVČ od 7 990 Kč. Levný web pro podnikatele s garancí PageSpeed 90+, SEO v ceně, dodání za 5–7 dní. Bez měsíčních poplatků.",
  keywords: [
    "web pro živnostníky",
    "webové stránky pro OSVČ",
    "levný web pro podnikatele",
    "web pro malé firmy",
    "web pro živnostníka",
    "levné webové stránky",
    "web pro podnikatele",
    "firemní web",
    "prezentační web",
    "web pro řemeslníky",
  ],
  openGraph: {
    title: "Web pro živnostníky | Od 7 990 Kč | Weblyx",
    description:
      "⚡ Profesionální web pro živnostníky a OSVČ od 7 990 Kč. Dodání za 5–7 dní, SEO v ceně.",
    url: "https://www.weblyx.cz/web-pro-zivnostniky",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Weblyx - Web pro živnostníky" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web pro živnostníky | Od 7 990 Kč | Weblyx",
    description: "⚡ Profesionální web pro živnostníky a OSVČ od 7 990 Kč. Dodání za 5–7 dní.",
  },
  alternates: {
    canonical: "https://www.weblyx.cz/web-pro-zivnostniky",
    languages: getAlternateLanguages("/web-pro-zivnostniky"),
  },
};

const PAIN_POINTS = [
  {
    problem: "Nemám čas řešit web",
    solution: "Dodáme hotový web za 5–7 dní. Vy se staráte o podnikání, my o web.",
  },
  {
    problem: "Nemám na to rozpočet",
    solution: "Web pro živnostníky od 7 990 Kč jednorázově. Žádné měsíční poplatky.",
  },
  {
    problem: "Nevím, co na web dát",
    solution: "Pomůžeme vám s obsahem i strukturou. Poradíme, co funguje ve vašem oboru.",
  },
  {
    problem: "Bojím se, že to bude složité",
    solution: "Web spravujete přes jednoduchý admin panel. Nebo úpravy děláme za vás.",
  },
];

const FEATURES = [
  { icon: Globe, title: "Profesionální design", description: "Moderní web, který budí důvěru zákazníků" },
  { icon: Smartphone, title: "Mobilní responzivita", description: "Perfektní zobrazení na telefonu i tabletu" },
  { icon: Search, title: "SEO optimalizace", description: "Zákazníci vás najdou na Googlu" },
  { icon: Zap, title: "Rychlé načítání", description: "Pod 2 sekundy s garancí PageSpeed 90+" },
  { icon: Shield, title: "SSL certifikát", description: "Zabezpečený web s HTTPS protokolem" },
  { icon: CreditCard, title: "Bez měsíčních poplatků", description: "Jednorázová platba, web je váš navždy" },
];

const FAQS = [
  {
    question: "Kolik stojí web pro živnostníka?",
    answer:
      "Webové stránky pro OSVČ začínají od 7 990 Kč jednorázově. V ceně je profesionální design, SEO optimalizace, mobilní responzivita a SSL certifikát. Žádné měsíční poplatky za platformu — web je váš navždy.",
  },
  {
    question: "Potřebuji jako živnostník vůbec web?",
    answer:
      "V roce 2026 rozhodně ano. Přes 87 % zákazníků hledá služby na internetu. Bez webu přicházíte o zakázky. Profesionální web budí důvěru a odlišuje vás od konkurence, která má jen profil na sociálních sítích.",
  },
  {
    question: "Jak dlouho trvá vytvoření webu pro živnostníka?",
    answer:
      "Jednoduchý prezentační web pro živnostníka dodáváme za 5–7 pracovních dní. Stačí nám vaše podklady (texty, fotky, logo) a my se postaráme o zbytek.",
  },
  {
    question: "Můžu si web spravovat sám?",
    answer:
      "Ano, každý web dodáváme s jednoduchým administračním panelem, kde snadno upravíte texty, fotky i kontaktní údaje. Pokud nemáte čas, úpravy děláme za vás v rámci podpory.",
  },
];

export default function WebProZivnostnikyPage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Domů", url: "https://www.weblyx.cz" },
    { name: "Web pro živnostníky", url: "https://www.weblyx.cz/web-pro-zivnostniky" },
  ];

  const webpageSchema = generateWebPageSchema({
    name: "Web pro živnostníky",
    description: "Profesionální webové stránky pro OSVČ a živnostníky od 7 990 Kč.",
    url: "https://www.weblyx.cz/web-pro-zivnostniky",
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
        <Breadcrumbs items={[{ label: "Web pro živnostníky", href: "/web-pro-zivnostniky" }]} />

        {/* HERO */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              Pro živnostníky a OSVČ
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Web pro živnostníky —{" "}
              <span className="text-primary">profesionální web od 7 990 Kč</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Jako živnostník potřebujete <strong>web, který pracuje za vás</strong>. Žádné složitosti,
              žádné měsíční poplatky. <strong>Levný web pro podnikatele</strong> s{" "}
              <Link href="/pagespeed-garance" className="text-primary hover:underline">
                garancí PageSpeed 90+
              </Link>{" "}
              dodaný za 5–7 dní.
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

        {/* PAIN POINTS */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Znáte to? <span className="text-primary">Vyřešíme to za vás</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Jako <strong>OSVČ</strong> máte spoustu starostí. Web by neměl být jednou z nich.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {PAIN_POINTS.map((item, i) => (
                <Card key={i} className="transition-all hover:shadow-lg hover:border-primary/20">
                  <CardContent className="p-6">
                    <p className="text-lg font-bold text-red-500 dark:text-red-400 mb-2">❌ „{item.problem}"</p>
                    <p className="text-muted-foreground">
                      <span className="text-primary font-semibold">✓</span> {item.solution}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline" className="mb-2">
                Co dostanete
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Co obsahuje <span className="text-primary">web pro živnostníky</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Kompletní <strong>webové stránky pro OSVČ</strong> — vše, co potřebujete pro online prezentaci vašeho podnikání.
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
                Prohlédněte si{" "}
                <Link href="/sluzby" className="text-primary hover:underline">
                  kompletní přehled služeb
                </Link>{" "}
                a zjistěte, co všechno pro vás umíme udělat.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Transparentní <span className="text-primary">ceny bez háčků</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              <strong>Webové stránky pro OSVČ od 7 990 Kč</strong>. Jednorázová platba, žádné skryté poplatky.
            </p>

            <Card className="border-2 border-primary/40 shadow-xl max-w-lg mx-auto">
              <CardHeader className="space-y-2 text-center">
                <Badge className="w-fit mx-auto">Nejoblíbenější pro živnostníky</Badge>
                <Briefcase className="h-10 w-10 text-primary mx-auto" />
                <h3 className="text-2xl font-bold">Prezentační web</h3>
                <p className="text-4xl font-black text-primary">od 7 990 Kč</p>
                <p className="text-sm text-muted-foreground">jednorázově</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-left">
                  {[
                    "Moderní responzivní design",
                    "3–5 podstránek",
                    "Kontaktní formulář",
                    "Google Mapy",
                    "SEO optimalizace",
                    "SSL certifikát",
                    "PageSpeed 90+ garance",
                    "3 měsíce podpora zdarma",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <LeadButton href="/poptavka" className="w-full" showArrow>
                  Nezávazná poptávka
                </LeadButton>
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground mt-6">
              Potřebujete e-shop? Podívejte se na{" "}
              <Link href="/tvorba-eshopu" className="text-primary hover:underline">tvorbu e-shopu na míru</Link>.
              Nevíte si rady? Prohlédněte si{" "}
              <Link href="/faq" className="text-primary hover:underline">často kladené otázky</Link>.
            </p>
          </div>
        </section>

        {/* INDUSTRIES */}
        <section className="py-12 px-4 bg-muted/20">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Weby pro různé obory podnikání
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/web-pro-restaurace" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Web pro restaurace</h3>
                    <p className="text-sm text-muted-foreground mt-1">S online jídelním lístkem a rezervacemi</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/web-pro-pravniky" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Web pro právníky</h3>
                    <p className="text-sm text-muted-foreground mt-1">S klientským portálem a objednávkami</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/webnode-alternativa" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Webnode alternativa</h3>
                    <p className="text-sm text-muted-foreground mt-1">Proč si nepořizovat Webnode</p>
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
                Časté dotazy — <span className="text-primary">web pro živnostníky</span>
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
              Přečtěte si{" "}
              <Link href="/blog/predrazene-sablony-webovych-agentur-jak-je-poznat" className="text-primary hover:underline">
                jak poznat předraženou šablonu
              </Link>{" "}
              a ušetřete za web tisíce korun.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Pojďme vytvořit <span className="text-primary">váš profesionální web</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Za 5–7 dní budete mít web, na který budete pyšní. Vyplňte{" "}
                  <strong>nezávaznou poptávku</strong> a do 24 hodin se vám ozveme s nabídkou.
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
