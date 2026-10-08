import type { Metadata } from "next";
import { LandingFaq, type Faq } from "@/components/landing/LandingFaq";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Clock, MapPin, Star, Zap } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateLocalBusinessSchema, generatePricedOffersSchema } from "@/lib/schema-org";
import { LandingForm } from "@/components/landing/LandingForm";
import { StickyCta } from "@/components/landing/StickyCta";
import { CallLink } from "@/components/landing/CallLink";
import { DEPOSIT_SHORT } from "@/lib/deposit";
import { countPublishedProjects, getRatingStat, completedProjects } from "@/lib/site-stats";

export const revalidate = 3600;

/**
 * The landing page Google Ads sends clicks to.
 *
 * Deliberately not the same page as /tvorba-webu-praha. That one earns organic
 * position on "tvorba webových stránek Praha" with two thousand words; this one
 * has a single job — turn a paid click into an enquiry — and every link that is
 * not the form is a way to lose it. Keeping them apart means the ad page can be
 * rewritten for whatever campaign is running without touching the ranking one.
 *
 * `noindex` rather than a robots.txt disallow: Google Ads has to be able to
 * crawl the destination to check it, and a disallow would block that too.
 */
export const metadata: Metadata = {
  title: "Web za 3–5 dní od 7 990 Kč — pražské studio",
  description:
    "Pražské webové studio. Web na Next.js za 3–5 dní od 7 990 Kč, pevná cena bez měsíčních poplatků, SEO v ceně. Ozveme se do 24 hodin.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://www.weblyx.cz/web-praha-nabidka" },
};

const BENEFITS = [
  { icon: Clock, title: "Za 3–5 pracovních dní", body: "Pražské agentury běžně uvádějí 3–6 týdnů. Lhůta běží od zálohy a dodání podkladů." },
  { icon: Check, title: "Pevná cena od 7 990 Kč", body: "Cena platí pro dohodnutý rozsah. Žádné měsíční poplatky za hosting ani povinná správa." },
  { icon: Zap, title: "Garance PageSpeed 90+", body: "Od balíčku Základní Web garantujeme skóre 90+, jinak vracíme peníze. Změřte si to sami." },
  { icon: MapPin, title: "Sídlíme na Praze 1", body: "Školská 660/3. Můžeme se potkat osobně, nebo přijedeme za vámi." },
];

const PRAHA_FAQ: Faq[] = [
  {
    question: "Kolik stojí tvorba webu v Praze?",
    answer:
      "U nás od 7 990 Kč za jednostránkovou vizitku, 9 990 Kč za web o třech až pěti podstránkách a 24 900 Kč za web o deseti a více podstránkách s plnou správou obsahu. Cena je pevná pro dohodnutý rozsah. Na pražském trhu se běžné firemní weby pohybují od 9 900 Kč u nejlevnějších dodavatelů po 120 000 až 400 000 Kč u velkých studií.",
  },
  {
    question: "Jak dlouho trvá vytvoření webu?",
    answer:
      "Jednostránkovou vizitku dodáme za 3 až 5 pracovních dní, web o několika podstránkách za 5 až 7 a rozsáhlejší firemní web za 7 až 10. Lhůta začíná běžet, až je uhrazená záloha a zároveň máme všechny podklady — texty, logo a fotky. Pokud termín nedodržíme, platíte jen polovinu ceny.",
  },
  {
    question: "Kdy se platí a kolik dopředu?",
    answer:
      "Po schválení cenové nabídky hradíte zálohu 50 %, doplatek je splatný před předáním hotového webu. Žádné měsíční poplatky za hosting ani povinná správa po spuštění.",
  },
  {
    question: "Můžeme se sejít osobně v Praze?",
    answer:
      "Ano. Sídlíme na adrese Školská 660/3, Praha 1, kousek od Národní třídy. Schůzku si můžete domluvit u nás, nebo přijedeme za vámi.",
  },
  {
    question: "Co když nemám texty ani fotky?",
    answer:
      "Řekneme to hned na začátku a domluvíme se na copywritingu zvlášť, aby vám nečekáním na podklady neutekl termín. Struktuře stránek a tomu, co kam patří, pomůžeme vždy.",
  },
];

const OFFER_TIERS = [
  { name: "Landing Page", price: 7990, deliveryDays: "3–5", description: "Jednostránkový web o 3–5 sekcích s kontaktním formulářem a základním SEO." },
  { name: "Základní Web", price: 9990, deliveryDays: "5–7", description: "Web o 3–5 podstránkách s blogem, CMS editorem a garancí PageSpeed 90+." },
  { name: "Standardní Web", price: 24900, deliveryDays: "7–10", description: "Web o 10+ podstránkách s plnou správou obsahu a rezervačním systémem." },
];

export default async function WebPrahaNabidkaPage() {
  const projects = await completedProjects("cs");
  const rating = await getRatingStat("cs");

  return (
    <div className="wbx-landing">
      <JsonLd
        data={generateLocalBusinessSchema({
          name: "Weblyx — tvorba webových stránek Praha",
          url: "https://www.weblyx.cz/web-praha-nabidka",
          description: "Web na míru za 3–5 dní od 7 990 Kč. Pražské studio na Praze 1.",
          addressLocality: "Praha",
          streetAddress: "Školská 660/3, Praha 1",
          postalCode: "110 00",
          areaServedCities: ["Praha"],
          locale: "cs",
        })}
      />
      <JsonLd data={generatePricedOffersSchema(OFFER_TIERS, "https://www.weblyx.cz/web-praha-nabidka")} />

      <main className="min-h-screen pb-24 md:pb-0">
        {/* HERO — the price and the timeframe are the offer, so they lead. */}
        <section className="border-b px-4 py-12 md:py-20">
          <div className="container mx-auto max-w-5xl">
            <div className="grid gap-10 md:grid-cols-2 md:items-start">
              <div className="space-y-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <MapPin className="h-3.5 w-3.5" /> Praha 1, Školská 660/3
                </span>
                <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                  Web za 3–5 dní od{" "}
                  <span className="text-primary">7 990 Kč</span>
                </h1>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Pražské studio stavějící na Next.js. Pevná cena, SEO v ceně,
                  žádné měsíční poplatky. <strong>Ozveme se do 24 hodin.</strong>
                </p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  {rating && (
                    <span className="flex items-center gap-1.5 font-medium">
                      <Star className="h-4 w-4 fill-current text-amber-500" />
                      {rating.value} · {rating.label}
                    </span>
                  )}
                  <span className="text-muted-foreground">{projects} dokončených projektů</span>
                  <CallLink className="font-semibold text-primary hover:underline" />
                </div>

                <p className="text-sm text-muted-foreground">{DEPOSIT_SHORT}</p>
              </div>

              <div id="poptavka" className="scroll-mt-6">
                <LandingForm
                  source="/web-praha-nabidka"
                  heading="Nezávazná nabídka do 24 hodin"
                  note="K tomu zdarma PageSpeed audit vašeho stávajícího webu."
                />
              </div>
            </div>
          </div>
        </section>

        {/* WHY */}
        <section className="px-4 py-14">
          <div className="container mx-auto max-w-5xl">
            <div className="grid gap-5 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <Card key={b.title} className="border-border/60">
                  <CardContent className="flex gap-4 p-6">
                    <b.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="space-y-1.5">
                      <h3 className="font-bold">{b.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{b.body}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* PRICES — the whole list, so the entry price is not a bait number. */}
        <section className="border-y bg-muted/30 px-4 py-14">
          <div className="container mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">Kolik stojí web v Praze?</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                { name: "Landing Page", price: "7 990 Kč", time: "3–5 dní", what: "Jedna stránka, 3–5 sekcí" },
                { name: "Základní Web", price: "9 990 Kč", time: "5–7 dní", what: "3–5 podstránek, blog s editorem" },
                { name: "Standardní Web", price: "24 900 Kč", time: "7–10 dní", what: "10+ podstránek, plné CMS" },
              ].map((p) => (
                <Card key={p.name} className="border-border/60">
                  <CardContent className="space-y-1.5 p-6">
                    <h3 className="font-bold">{p.name}</h3>
                    <p className="text-2xl font-bold text-primary">{p.price}</p>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {p.time}
                    </p>
                    <p className="text-sm text-muted-foreground">{p.what}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {DEPOSIT_SHORT} Doplatek před předáním. Bez měsíčních poplatků.
            </p>
          </div>
        </section>

        {/* REFERENCES — named only where the client's own site confirms it. */}
        <section className="px-4 py-14">
          <div className="container mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">Jaké weby jste v Praze udělali?</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                { name: "AK Barbers", note: "Barbershop se čtyřmi pražskými pobočkami — Praha 1, 3, 5 a 6.", url: "https://www.akbarber.com" },
                { name: "AK Barbers Academy", note: "Web barberské akademie s přihlašováním na kurzy.", url: "https://www.barber-kurzy.com" },
                { name: "KAJO Studio 360", note: "360° video booth pro svatby a firemní akce, působí v Praze.", url: "http://www.kajostudio360.cz" },
              ].map((r) => (
                <Card key={r.name} className="border-border/60">
                  <CardContent className="space-y-2 p-6">
                    <h3 className="font-bold">{r.name}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{r.note}</p>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Otevřít web →
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CLOSE */}
        <section className="border-t bg-muted/30 px-4 py-14">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">Jak rychle dostanu cenovou nabídku?</h2>
            <p className="mb-8 text-muted-foreground">
              Nezávazně a zdarma. Nebo rovnou volejte{" "}
              <CallLink className="font-semibold text-primary hover:underline" />.
            </p>
            <div className="mx-auto max-w-lg text-left">
              <LandingForm source="/web-praha-nabidka (spodní)" heading="Napište nám" />
            </div>
            <p className="mt-8 text-xs text-muted-foreground">
              Weblyx · Altro Servis Group s.r.o. · Školská 660/3, Praha 1 ·{" "}
              <Link href="/obchodni-podminky" className="underline">
                obchodní podmínky
              </Link>
            </p>
          </div>
        </section>
        <LandingFaq items={PRAHA_FAQ} />
      </main>

      <StickyCta />
    </div>
  );
}
