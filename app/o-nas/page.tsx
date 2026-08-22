import type { Metadata } from "next";
import { getAlternateLanguages } from "@/lib/seo-metadata";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Target, Heart, Zap, Shield, Users, TrendingUp } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateAboutPageSchema, BreadcrumbItem, generateWebPageSchema } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "O nás | Česká webová agentura od 8 000 Kč",
  description: "Weblyx je česká webová agentura. Od 2024 jsme dokončili 15+ projektů. Web za 5–7 dní, načítání pod 2s. Férové ceny, žádné skryté poplatky.",
  keywords: [
    "o nás webová agentura",
    "webová agentura Praha",
    "moderní technologie",
    "tvorba webu Praha",
    "Next.js React"
  ],
  openGraph: {
    title: "O nás | Weblyx – moderní webová agentura",
    description: "Moderní webová agentura z Prahy zaměřená na rychlé a kvalitní webové stránky.",
    url: "https://www.weblyx.cz/o-nas",
    type: "website",
    images: [
      {
        url: "/images/og/og-o-nas.png",
        width: 1200,
        height: 630,
        alt: "Weblyx - O nás"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "O nás | Weblyx – moderní webová agentura",
    description: "Moderní webová agentura z Prahy zaměřená na rychlé a kvalitní webové stránky.",
  },
  alternates: {
    canonical: "https://www.weblyx.cz/o-nas",
    languages: getAlternateLanguages('/o-nas')
  }
};

export default function AboutPage() {
  const values = [
    {
      icon: Zap,
      title: "Rychlost",
      description: "Díky moderním nástrojům a efektivním procesům dodáváme základní web za 5-7 dní, bez kompromisů v kvalitě.",
    },
    {
      icon: Heart,
      title: "Kvalita",
      description: "Moderní technologie, clean code, SEO optimalizace a rychlé načítání. Každý projekt testujeme na všech zařízeních.",
    },
    {
      icon: Target,
      title: "Transparentnost",
      description: "Jasné ceny, žádné skryté poplatky. Pravidelně vás informujeme o průběhu projektu. Víte vždy, co se děje.",
    },
    {
      icon: Shield,
      title: "Důvěryhodnost",
      description: "Dodržujeme termíny a slíbené funkce. Poskytujeme záruku a následnou podporu. Jsme tu pro vás i po spuštění.",
    },
  ];

  const stats = [
    { value: "Únor 2024", label: "Rok založení" },
    { value: "15+", label: "Projektů dokončeno" },
    { value: "5.0 ★", label: "Google hodnocení" },
    { value: "< 2s", label: "Průměrná rychlost" },
  ];

  // Generate schemas
  const aboutPageSchema = generateAboutPageSchema();

  // Generate breadcrumb
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Domů', url: 'https://www.weblyx.cz' },
    { name: 'O nás', url: 'https://www.weblyx.cz/o-nas' },
  ];

  const webpageSchema = generateWebPageSchema({
    name: 'O nás – Weblyx',
    description: 'Česká webová agentura. Od února 2024 jsme dokončili 15+ projektů. Web za 5-7 dní, férové ceny.',
    url: 'https://www.weblyx.cz/o-nas',
    breadcrumbs,
  });

  return (
    <>
      {/* Schema.org JSON-LD */}
      <JsonLd data={aboutPageSchema} />
      <JsonLd data={webpageSchema} />

      <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4 gradient-hero grid-pattern">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            Česká <span className="text-primary">webová agentura</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Tvoříme rychlé a moderní weby pro živnostníky a firmy.
            Férové ceny, dodání za 5-7 dní, žádné skryté poplatky.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Náš příběh</h2>
              <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                <p>
                  Myšlenka na Weblyx se zrodila v únoru 2024. Potřebovali jsme vlastní web – moderní, rychlý a přizpůsobený tomu, kdo jsme a jak chceme působit. Obcházeli jsme studia, freelancery i 'levné weby' a všude slyšeli to samé: šablonové WordPress řešení, dlouhé dodací lhůty a spoustu kompromisů.
                </p>
                <p>
                  V jednu chvíli nám došla trpělivost a řekli jsme si jednoduché: 'OK, tak si to radši uděláme sami.' Začaly večery a noci strávené u tutoriálů, kurzů a kódu – Next.js, React, SEO, rychlost načítání, UX, AI nástroje. První web jsme postavili pro sebe. Nebyl dokonalý, ale byl náš. Rychlý, moderní a přesně takový, jaký jsme chtěli od začátku.
                </p>
                <p>
                  Pak přišel kamarád, který potřeboval web. Potom další. Doporučení se začala nabalovat a z jednoho 'uděláme si to sami' se postupně stal plnohodnotný projekt. Z koníčku vznikla značka Weblyx 🚀
                </p>
                <p>
                  Dnes pomáháme firmám, které jsou ve stejné situaci, jako jsme byli my: chtějí web, který dává smysl, vypadá profesionálně a funguje rychle – ale nechtějí platit statisíce nebo čekat měsíce. Každý nový web bereme trochu osobně, protože moc dobře víme, jak frustrující je hledat někoho, kdo vás opravdu poslouchá.
                </p>
                <p>
                  Proto stavíme weby tak, jak bychom tehdy chtěli, aby někdo postavil ten náš – na míru, srozumitelně, bez bullshitu, s důrazem na výsledky a rychlost. Díky moderním technologiím a efektivním procesům dokážeme vyvíjet rychle, držet férové ceny a tvořit weby, které se načítají pod 2 sekundy a jsou připravené růst spolu s vaším byznysem. ❤️‍🔥
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24 px-4 bg-muted/50">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12">
            <Card>
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Naše mise</h3>
                <div className="text-muted-foreground space-y-3">
                  <p>
                    Naší misí je dělat moderní weby dostupné – jak cenou, tak rychlostí dodání.
                  </p>
                  <p>
                    Chceme, aby každý živnostník, malá firma nebo rozjíždějící se projekt mohl mít web, který:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>je rychlý (načítání pod 2 sekundy),</li>
                    <li>je srozumitelný (jasná struktura, logický obsah),</li>
                    <li>je přizpůsobený konkrétnímu byznysu, ne jen univerzální šabloně,</li>
                    <li>a dá se dál rozvíjet, ne rovnou zahodit při první změně.</li>
                  </ul>
                  <p>
                    Nechceme být další agentura, která 'prodá web a zmizí'. Naším cílem je být partner, za kterým můžete kdykoliv přijít s tím, že chcete něco zlepšit, zrychlit, napojit nebo rozšířit. 🚀
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Naše vize</h3>
                <div className="text-muted-foreground space-y-3">
                  <p>
                    Naší vizí je vybudovat značku, která bude v Česku vnímaná jako:
                  </p>
                  <p className="font-semibold">
                    'Ti, co dělají nejrychlejší a nejrozumnější weby za normální peníze.'
                  </p>
                  <p>
                    Chceme, aby si každý, kdo uvažuje o novém webu, vybavil tři věci:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Weblyx = rychlost – dodání do 5–7 dní a web, který se neseká.</li>
                    <li>Weblyx = férovost – jasný ceník, žádné hvězdičky a skryté položky.</li>
                    <li>Weblyx = kvalita – moderní technologie, rychlé načítání, spokojení zákazníci.</li>
                  </ul>
                  <p>
                    Dlouhodobě chceme tvořit nejen jednotlivé weby, ale i dlouhodobé vztahy – být tým, který zná váš byznys, rozumí vašim cílům a pomáhá vám je online plnit. Ať už jste na začátku, nebo škálujete. 🌱📈
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Naše hodnoty</h2>
            <p className="text-lg text-muted-foreground">
              Principy, které nás vedou každý den
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="group hover:shadow-elegant transition-all">
                <CardContent className="p-8 space-y-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Pojďme spolupracovat
            </h2>
            <p className="text-lg text-muted-foreground">
              Jste připraveni posunout váš byznys na další úroveň?
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/poptavka">Začít projekt</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/kontakt">Kontaktovat nás</Link>
            </Button>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
