import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Target, Heart, Zap, Shield, Users, TrendingUp } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateAboutPageSchema, generateOrganizationSchema, BreadcrumbItem, generateWebPageSchema } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "O nás | Weblyx - Moderní webová agentura",
  description: "Jsme moderní webová agentura zaměřená na tvorbu kvalitních webových stránek s využitím AI technologií pro rychlejší a efektivnější vývoj.",
};

export default function AboutPage() {
  const values = [
    {
      icon: Zap,
      title: "Rychlost",
      description: "Využíváme AI technologie pro zrychlení vývoje. Jednoduchý web dodáme za 5-7 dní, bez kompromisů v kvalitě.",
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
    { value: "2025", label: "Rok založení" },
    { value: "10+", label: "Projektů dokončeno" },
    { value: "100%", label: "Spokojenost klientů" },
    { value: "< 2s", label: "Průměrná rychlost" },
  ];

  // Generate schemas
  const aboutPageSchema = generateAboutPageSchema();
  const organizationSchema = generateOrganizationSchema({
    foundingDate: '2025',
  });

  // Generate breadcrumb
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Domů', url: 'https://weblyx.cz' },
    { name: 'O nás', url: 'https://weblyx.cz/o-nas' },
  ];

  const webpageSchema = generateWebPageSchema({
    name: 'O nás',
    description: 'Jsme moderní webová agentura zaměřená na tvorbu kvalitních webových stránek s využitím AI technologií',
    url: 'https://weblyx.cz/o-nas',
    breadcrumbs,
  });

  return (
    <>
      {/* Schema.org JSON-LD */}
      <JsonLd data={aboutPageSchema} />
      <JsonLd data={organizationSchema} />
      <JsonLd data={webpageSchema} />

      <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4 gradient-hero grid-pattern">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            Jsme moderní <span className="text-primary">webová agentura</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Zaměřujeme se na tvorbu kvalitních webových stránek za konkurenceschopné ceny
            s využitím AI technologií pro efektivnější vývoj.
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
                  Weblyx vznikl v roce 2025 s jasnou vizí: zpřístupnit kvalitní webové stránky
                  malým a středním firmám za dostupné ceny. Věříme, že každá firma si zaslouží
                  profesionální online prezentaci, která jí pomůže růst.
                </p>
                <p>
                  Díky využití moderních AI technologií jsme schopni zkrátit dobu vývoje bez
                  kompromisů v kvalitě. To nám umožňuje nabídnout konkurenceschopné ceny a rychlé
                  dodání. Náš tým má dlouholeté zkušenosti s vývojem webových aplikací a e-shopů.
                </p>
                <p>
                  Nesnažíme se být největší agentura na trhu. Chceme být ti nejlepší pro naše
                  klienty. Proto klademe důraz na osobní přístup, transparentní komunikaci a
                  dlouhodobou spolupráci.
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
                <p className="text-muted-foreground">
                  Pomáhat firmám růst prostřednictvím kvalitních webových řešení. Zpřístupnit
                  moderní technologie i menším firmám za dostupné ceny. Být partnerem, na kterého
                  se můžete spolehnout.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Naše vize</h3>
                <p className="text-muted-foreground">
                  Stát se přední AI-powered webovou agenturou v České republice. Neustále
                  inovovat a přinášet nejnovější technologie našim klientům. Budovat dlouhodobé
                  vztahy založené na důvěře a výsledcích.
                </p>
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
