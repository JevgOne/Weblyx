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
  UtensilsCrossed,
  CalendarCheck,
  MapPin,
  Camera,
  Clock,
  Star,
  Smartphone,
  Search,
  Zap,
  Check,
  Menu,
  MessageSquare,
} from "lucide-react";
import { generateWebPageSchema, BreadcrumbItem } from "@/lib/schema-org";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Web pro restaurace | Webové stránky pro restauraci od 7 990 Kč | Weblyx",
  description:
    "⚡ Profesionální web pro restaurace a kavárny od 7 990 Kč. Online jídelní lístek, rezervační systém, Google Mapy. Web pro restauraci dodaný za 5–7 dní.",
  keywords: [
    "web pro restaurace",
    "webové stránky pro restauraci",
    "web pro kavárnu",
    "web pro restauraci",
    "webové stránky restaurace",
    "webové stránky kavárna",
    "online jídelní lístek",
    "rezervace restaurace web",
    "web pro hospodu",
    "gastro web",
  ],
  openGraph: {
    title: "Web pro restaurace | Od 7 990 Kč | Weblyx",
    description:
      "⚡ Profesionální web pro restaurace a kavárny od 7 990 Kč. Online jídelní lístek a rezervace.",
    url: "https://www.weblyx.cz/web-pro-restaurace",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Weblyx - Web pro restaurace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web pro restaurace | Od 7 990 Kč | Weblyx",
    description: "⚡ Profesionální web pro restaurace a kavárny od 7 990 Kč.",
  },
  alternates: {
    canonical: "https://www.weblyx.cz/web-pro-restaurace",
    languages: getAlternateLanguages("/web-pro-restaurace"),
  },
};

const RESTAURANT_FEATURES = [
  {
    icon: Menu,
    title: "Online jídelní lístek",
    description: "Přehledný, snadno aktualizovatelný jídelní lístek s fotkami jídel. Hosté si prohlédnou nabídku ještě před návštěvou.",
  },
  {
    icon: CalendarCheck,
    title: "Rezervační systém",
    description: "Online rezervace stolů 24/7. Snížíte telefonáty a nepřijdete o hosty, kteří chtějí rezervovat mimo otevírací dobu.",
  },
  {
    icon: MapPin,
    title: "Google Mapy a navigace",
    description: "Interaktivní mapa s navigací přímo na web. Hosté vás snadno najdou, ať přijíždějí odkudkoli.",
  },
  {
    icon: Camera,
    title: "Fotogalerie interiéru",
    description: "Profesionální prezentace vašeho prostoru. Fotky interiéru, jídel a atmosféry, které nalákají nové hosty.",
  },
  {
    icon: Clock,
    title: "Otevírací doba a kontakt",
    description: "Přehledně zobrazená otevírací doba, telefonní číslo a adresa. Vše, co host potřebuje, najde okamžitě.",
  },
  {
    icon: Star,
    title: "Recenze a hodnocení",
    description: "Zobrazení recenzí z Googlu přímo na webu. Sociální důkaz, který přesvědčí nerozhodné hosty.",
  },
  {
    icon: Smartphone,
    title: "Mobilní optimalizace",
    description: "Přes 75 % hostů hledá restaurace z mobilu. Váš web bude perfektní na každém zařízení.",
  },
  {
    icon: MessageSquare,
    title: "Napojení na sociální sítě",
    description: "Propojení s Instagramem a Facebookem. Sdílejte novinky z jednoho místa.",
  },
];

const FAQS = [
  {
    question: "Kolik stojí web pro restauraci?",
    answer:
      "Webové stránky pro restauraci začínají od 7 990 Kč. V ceně je profesionální design, online jídelní lístek, kontaktní formulář, Google Mapy a SEO optimalizace. Rezervační systém je dostupný od 12 990 Kč.",
  },
  {
    question: "Můžu si sám aktualizovat jídelní lístek?",
    answer:
      "Ano! Váš web bude mít jednoduchý administrační panel, kde snadno přidáte nová jídla, změníte ceny nebo aktualizujete denní menu. Je to tak jednoduché jako psát zprávu na telefonu.",
  },
  {
    question: "Potřebuje restaurace opravdu vlastní web?",
    answer:
      "Rozhodně. Přes 90 % hostů hledá restaurace online. Profil na Googlu nestačí — vlastní web vám dá kontrolu nad tím, jak vaši restauraci vidí zákazníci, umožní online rezervace a zlepší pozice v místním vyhledávání.",
  },
  {
    question: "Jak rychle bude web pro restauraci hotový?",
    answer:
      "Základní web pro restauraci dodáváme za 5–7 pracovních dní. Web s rozšířeným rezervačním systémem a dalšími funkcemi za 2–3 týdny.",
  },
];

export default function WebProRestauracePage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Domů", url: "https://www.weblyx.cz" },
    { name: "Web pro restaurace", url: "https://www.weblyx.cz/web-pro-restaurace" },
  ];

  const webpageSchema = generateWebPageSchema({
    name: "Web pro restaurace",
    description: "Profesionální webové stránky pro restaurace a kavárny od 7 990 Kč.",
    url: "https://www.weblyx.cz/web-pro-restaurace",
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
        <Breadcrumbs items={[{ label: "Web pro restaurace", href: "/web-pro-restaurace" }]} />

        {/* HERO */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              Pro gastro provozovny
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Web pro restaurace —{" "}
              <span className="text-primary">přivedeme hosty ke stolu</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Profesionální <strong>webové stránky pro restauraci</strong> nebo <strong>kavárnu</strong> s online
              jídelním lístkem, rezervačním systémem a{" "}
              <Link href="/pagespeed-garance" className="text-primary hover:underline">
                garancí PageSpeed 90+
              </Link>. Od <strong>7 990 Kč</strong>.
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

        {/* PROČ WEB PRO RESTAURACI */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Proč vaše restaurace <span className="text-primary">potřebuje vlastní web</span>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Přes <strong>90 % hostů</strong> hledá restaurace online. Bez vlastního webu ztrácíte zákazníky každý den.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-3">
                  <UtensilsCrossed className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Jídelní lístek online</h3>
                  <p className="text-muted-foreground">
                    <strong>73 % hostů</strong> si prohlíží jídelní lístek před návštěvou. Ať ví, na co se těšit.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-3">
                  <CalendarCheck className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Rezervace 24/7</h3>
                  <p className="text-muted-foreground">
                    Online rezervace <strong>snižují telefonáty o 60 %</strong> a zachytí hosty, kteří rezervují večer nebo o víkendu.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-3">
                  <Search className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Lokální SEO</h3>
                  <p className="text-muted-foreground">
                    Vyskočte v Googlu na „<strong>restaurace v [vaše město]</strong>". Vlastní web výrazně pomáhá s místním SEO.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline" className="mb-2">
                Kompletní řešení
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Co obsahuje <span className="text-primary">web pro restauraci</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {RESTAURANT_FEATURES.map((feature) => (
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
                Kompletní seznam funkcí najdete v{" "}
                <Link href="/sluzby" className="text-primary hover:underline">kompletním přehledu služeb</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ceník <span className="text-primary">webu pro restaurace</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-10">
              <Card className="transition-all hover:shadow-lg">
                <CardHeader className="space-y-2 text-center">
                  <h3 className="text-xl font-bold">Základní web</h3>
                  <p className="text-3xl font-black text-primary">od 7 990 Kč</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-left">
                    {["Jídelní lístek online", "Kontakt a mapa", "Otevírací doba", "Fotogalerie", "SEO optimalizace", "Mobilní responzivita"].map((f) => (
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
                <CardHeader className="space-y-2 text-center">
                  <Badge className="w-fit mx-auto">Doporučujeme</Badge>
                  <h3 className="text-xl font-bold">Web s rezervacemi</h3>
                  <p className="text-3xl font-black text-primary">od 12 990 Kč</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-left">
                    {["Vše ze základního webu", "Online rezervace stolů", "Denní menu sekce", "Recenze z Googlu", "Napojení na soc. sítě", "Admin panel pro aktualizace"].map((f) => (
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
            </div>
          </div>
        </section>

        {/* RELATED */}
        <section className="py-12 px-4 bg-muted/20">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Weby pro další obory
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/web-pro-zivnostniky" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Web pro živnostníky</h3>
                    <p className="text-sm text-muted-foreground mt-1">Cenově dostupný web pro OSVČ</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/web-pro-pravniky" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Web pro právníky</h3>
                    <p className="text-sm text-muted-foreground mt-1">Profesionální web pro advokáty</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/seo-optimalizace" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">SEO optimalizace</h3>
                    <p className="text-sm text-muted-foreground mt-1">Dostaňte restauraci na první pozice</p>
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
                Časté dotazy — <span className="text-primary">web pro restaurace</span>
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
              Další odpovědi najdete v{" "}
              <Link href="/faq" className="text-primary hover:underline">často kladených otázkách</Link>{" "}
              nebo nás <Link href="/kontakt" className="text-primary hover:underline">kontaktujte</Link>.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Přiveďte <span className="text-primary">hosty k vám</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Vyplňte <Link href="/poptavka" className="text-primary hover:underline font-semibold">nezávaznou poptávku</Link> a do 24 hodin vám připravíme nabídku webu přímo pro vaši restauraci.
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
