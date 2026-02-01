import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Target, Heart, Zap, Shield, TrendingUp } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateAboutPageSchema, BreadcrumbItem, generateWebPageSchema } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Über uns | Seitelyx – Deutsche Webagentur | Websites ab 320 €",
  description:
    "Seitelyx ist eine moderne Webagentur. Seit 2024 haben wir 15+ Projekte abgeschlossen. Website in 5–7 Tagen, Ladezeit unter 2s. Faire Preise, keine versteckten Kosten.",
  keywords: [
    "über uns Webagentur",
    "Webagentur Deutschland",
    "moderne Technologie",
    "Website erstellen",
    "Next.js React",
  ],
  openGraph: {
    title: "Über uns | Seitelyx – moderne Webagentur",
    description:
      "Moderne Webagentur für schnelle und qualitativ hochwertige Websites.",
    url: "https://www.seitelyx.de/uber-uns",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Seitelyx - Über uns",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Über uns | Seitelyx – moderne Webagentur",
    description:
      "Moderne Webagentur für schnelle und qualitativ hochwertige Websites.",
  },
  alternates: {
    canonical: "https://www.seitelyx.de/uber-uns",
  },
};

export default function UberUnsPage() {
  const values = [
    {
      icon: Zap,
      title: "Geschwindigkeit",
      description:
        "Dank moderner Tools und effizienter Prozesse liefern wir eine Basis-Website in 5–7 Tagen – ohne Kompromisse bei der Qualität.",
    },
    {
      icon: Heart,
      title: "Qualität",
      description:
        "Moderne Technologien, sauberer Code, SEO-Optimierung und schnelle Ladezeiten. Jedes Projekt wird auf allen Geräten getestet.",
    },
    {
      icon: Target,
      title: "Transparenz",
      description:
        "Klare Preise, keine versteckten Kosten. Wir informieren Sie regelmäßig über den Projektfortschritt. Sie wissen immer, was passiert.",
    },
    {
      icon: Shield,
      title: "Zuverlässigkeit",
      description:
        "Wir halten Termine und versprochene Funktionen ein. Wir bieten Garantie und anschließenden Support. Wir sind auch nach dem Launch für Sie da.",
    },
  ];

  const stats = [
    { value: "Februar 2024", label: "Gründungsjahr" },
    { value: "15+", label: "Abgeschlossene Projekte" },
    { value: "5.0 ★", label: "Google-Bewertung" },
    { value: "< 2s", label: "Durchschnittliche Ladezeit" },
  ];

  // Generate schemas
  const aboutPageSchema = generateAboutPageSchema();

  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Startseite", url: "https://www.seitelyx.de" },
    { name: "Über uns", url: "https://www.seitelyx.de/uber-uns" },
  ];

  const webpageSchema = generateWebPageSchema({
    name: "Über uns – Seitelyx",
    description:
      "Moderne Webagentur. Seit Februar 2024 haben wir 15+ Projekte abgeschlossen. Website in 5–7 Tagen, faire Preise.",
    url: "https://www.seitelyx.de/uber-uns",
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
              Moderne <span className="text-primary">Webagentur</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Wir erstellen schnelle und moderne Websites für Selbstständige und
              Unternehmen. Faire Preise, Lieferung in 5–7 Tagen, keine
              versteckten Kosten.
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
                <h2 className="text-3xl md:text-4xl font-bold">
                  Unsere Geschichte
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                  <p>
                    Die Idee zu Seitelyx entstand im Februar 2024. Wir brauchten
                    eine eigene Website – modern, schnell und genau auf uns
                    zugeschnitten. Wir haben Studios, Freelancer und
                    „günstige Websites" kontaktiert und überall das Gleiche
                    gehört: Template-WordPress-Lösungen, lange Lieferzeiten und
                    jede Menge Kompromisse.
                  </p>
                  <p>
                    Irgendwann war unsere Geduld am Ende und wir sagten uns
                    einfach: „OK, dann machen wir es lieber selbst." Es folgten
                    Abende und Nächte mit Tutorials, Kursen und Code – Next.js,
                    React, SEO, Ladezeiten, UX, KI-Tools. Die erste Website
                    haben wir für uns selbst gebaut. Sie war nicht perfekt, aber
                    sie war unsere. Schnell, modern und genau so, wie wir sie
                    von Anfang an wollten.
                  </p>
                  <p>
                    Dann kam ein Freund, der eine Website brauchte. Dann noch
                    einer. Empfehlungen begannen sich zu häufen und aus einem
                    „machen wir es selbst" wurde nach und nach ein
                    vollwertiges Projekt. Aus einem Hobby entstand die Marke
                    Seitelyx 🚀
                  </p>
                  <p>
                    Heute helfen wir Unternehmen, die in der gleichen Situation
                    waren wie wir: Sie wollen eine Website, die Sinn macht,
                    professionell aussieht und schnell funktioniert – aber sie
                    wollen nicht Hunderttausende bezahlen oder monatelang
                    warten. Jedes neue Webprojekt nehmen wir ein bisschen
                    persönlich, weil wir genau wissen, wie frustrierend es ist,
                    jemanden zu suchen, der einem wirklich zuhört.
                  </p>
                  <p>
                    Deshalb bauen wir Websites so, wie wir es uns damals für
                    unsere eigene gewünscht hätten – maßgeschneidert,
                    verständlich, ohne Bullshit, mit Fokus auf Ergebnisse und
                    Geschwindigkeit. Dank moderner Technologien und effizienter
                    Prozesse können wir schnell entwickeln, faire Preise halten
                    und Websites erstellen, die in unter 2 Sekunden laden und
                    bereit sind, mit Ihrem Business zu wachsen. ❤️‍🔥
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
                  <h3 className="text-2xl font-bold">Unsere Mission</h3>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      Unsere Mission ist es, moderne Websites zugänglich zu
                      machen – sowohl preislich als auch in der
                      Liefergeschwindigkeit.
                    </p>
                    <p>
                      Wir möchten, dass jeder Selbstständige, jedes kleine
                      Unternehmen oder Startup eine Website haben kann, die:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>schnell ist (Ladezeit unter 2 Sekunden),</li>
                      <li>
                        verständlich ist (klare Struktur, logischer Inhalt),
                      </li>
                      <li>
                        auf das konkrete Geschäft zugeschnitten ist, nicht nur
                        ein Template,
                      </li>
                      <li>
                        und weiterentwickelt werden kann, statt bei der ersten
                        Änderung weggeworfen zu werden.
                      </li>
                    </ul>
                    <p>
                      Wir wollen nicht nur eine weitere Agentur sein, die
                      „eine Website verkauft und verschwindet". Unser Ziel
                      ist es, ein Partner zu sein, zu dem Sie jederzeit kommen
                      können, wenn Sie etwas verbessern, beschleunigen,
                      anbinden oder erweitern möchten. 🚀
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Unsere Vision</h3>
                  <div className="text-muted-foreground space-y-3">
                    <p>
                      Unsere Vision ist es, eine Marke aufzubauen, die
                      wahrgenommen wird als:
                    </p>
                    <p className="font-semibold">
                      „Die, die die schnellsten und vernünftigsten Websites zu
                      normalen Preisen machen."
                    </p>
                    <p>
                      Wir möchten, dass jeder, der über eine neue Website
                      nachdenkt, drei Dinge mit uns verbindet:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>
                        Seitelyx = Geschwindigkeit – Lieferung in 5–7 Tagen und
                        eine Website, die nicht ruckelt.
                      </li>
                      <li>
                        Seitelyx = Fairness – klare Preisliste, keine
                        Sternchen und versteckten Posten.
                      </li>
                      <li>
                        Seitelyx = Qualität – moderne Technologien, schnelle
                        Ladezeiten, zufriedene Kunden.
                      </li>
                    </ul>
                    <p>
                      Langfristig wollen wir nicht nur einzelne Websites
                      erstellen, sondern langfristige Beziehungen aufbauen –
                      ein Team sein, das Ihr Business kennt, Ihre Ziele
                      versteht und Ihnen hilft, diese online zu erreichen. Ob
                      Sie am Anfang stehen oder skalieren. 🌱📈
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
              <h2 className="text-3xl md:text-4xl font-bold">Unsere Werte</h2>
              <p className="text-lg text-muted-foreground">
                Prinzipien, die uns jeden Tag leiten
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-elegant transition-all"
                >
                  <CardContent className="p-8 space-y-4">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <value.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">{value.title}</h3>
                    <p className="text-muted-foreground">
                      {value.description}
                    </p>
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
                Lassen Sie uns zusammenarbeiten
              </h2>
              <p className="text-lg text-muted-foreground">
                Sind Sie bereit, Ihr Business auf die nächste Stufe zu heben?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/anfrage">Projekt starten</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/kontakt">Kontakt aufnehmen</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
