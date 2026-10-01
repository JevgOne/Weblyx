import type { Metadata } from "next";
import { LandingFaq, type Faq } from "@/components/landing/LandingFaq";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Clock } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateWebPageSchema, generateBreadcrumbSchema, generateOrganizationSchema, generatePricedOffersSchema } from "@/lib/schema-org";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { LandingForm } from "@/components/landing/LandingForm";
import { StickyCta } from "@/components/landing/StickyCta";
import { CallLink } from "@/components/landing/CallLink";
import { DEPOSIT_SHORT } from "@/lib/deposit";

/** Bumped when the page is edited, not on every build. */
const LAST_UPDATED = "2026-10-01";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Ceník tvorby webu — od 7 990 Kč, pevná cena",
  description:
    "Kolik stojí web v roce 2026. Tři balíčky s pevnou cenou od 7 990 Kč, bez měsíčních poplatků. Srovnání s agenturou a stavebnicí, kalkulace do 24 hodin.",
  alternates: { canonical: "https://www.weblyx.cz/cenik-webu" },
};

/** Mirrors pricing_tiers. Prices and delivery windows live in one place. */
const TIERS = [
  {
    name: "Landing Page",
    price: "7 990 Kč",
    time: "3–5 pracovních dní",
    summary: "Jedna stránka. Vizitka, nic víc.",
    features: ["1 stránka, 3–5 sekcí", "Responzivní design", "Kontaktní formulář", "SEO základy", "Google Analytics", "1 měsíc podpory"],
  },
  {
    name: "Základní Web",
    price: "14 900 Kč",
    time: "5–7 pracovních dní",
    summary: "Web o několika podstránkách, který si sami plníte.",
    features: ["3–5 podstránek", "Moderní design", "Pokročilé SEO", "Blog s CMS editorem", "Napojení na sociální sítě", "2 měsíce podpory", "Garance PageSpeed 90+"],
    highlight: true,
  },
  {
    name: "Standardní Web",
    price: "29 900 Kč",
    time: "7–10 pracovních dní",
    summary: "Plnohodnotný firemní web se správou obsahu.",
    features: ["10+ podstránek", "Premium design na míru", "Full CMS", "Rezervační systém", "Newsletter", "3 měsíce podpory", "Drobné úpravy 2 h zdarma"],
  },
];

/**
 * Three ways to get a website, with what each really costs over time.
 *
 * The monthly-fee column is the one that decides it: a subscription looks
 * cheaper on the day you sign and stops looking cheaper somewhere in year two.
 */
const COMPARISON = [
  { who: "Weblyx", price: "7 990 – 29 900 Kč jednorázově", monthly: "0 Kč", time: "3–10 dní", own: "Web i doména jsou vaše" },
  { who: "Zakázková agentura", price: "od 25 000 Kč, běžně 50–400 tis.", monthly: "500 – 4 000 Kč", time: "3 týdny – 4 měsíce", own: "Podle smlouvy" },
  { who: "Stavebnice (Webnode, Wix)", price: "0 Kč na začátku", monthly: "250 – 550 Kč", time: "Podle vás", own: "Web žije jen s předplatným" },
];

const CENIK_FAQ: Faq[] = [
  {
    question: "Kolik stojí web v roce 2026?",
    answer:
      "Jednostránkový web od 7 990 Kč, firemní web o třech až pěti podstránkách od 14 900 Kč a rozsáhlejší web s plnou správou obsahu od 29 900 Kč. Cena je jednorázová a pevná pro dohodnutý rozsah.",
  },
  {
    question: "Jsou v ceně nějaké měsíční poplatky?",
    answer:
      "Ne. Platíte jednou a web je váš, včetně domény. Konkurence si za správu běžně účtuje 500 až 1 200 Kč měsíčně a za SEO od 2 000 Kč měsíčně, což za tři roky udělá 18 až 43 tisíc navíc.",
  },
  {
    question: "Co se stane po schválení nabídky?",
    answer:
      "Hradíte zálohu 50 % a od jejího uhrazení — a od dodání podkladů — začíná běžet termín. Doplatek je splatný před předáním.",
  },
  {
    question: "Je levnější stavebnice jako Webnode nebo Wix?",
    answer:
      "Na začátku ano, dlouhodobě ne. Stavebnice vyjdou na 2 000 až 5 000 Kč ročně, takže jednostránkový web za 7 990 Kč se proti nim zaplatí zhruba za rok a půl — a to bez započtení času, který nad ním strávíte. Web navíc žije jen po dobu předplatného.",
  },
  {
    question: "Je v ceně SEO?",
    answer:
      "Ano. Technické SEO — struktura nadpisů, titulky, popisky, sitemap, rychlost a strukturovaná data — děláme při stavbě, ne jako příplatek po ní. Dodělávat ho zpětně stojí víc než ho udělat rovnou.",
  },
];

const OFFER_TIERS = [
  { name: "Landing Page", price: 7990, deliveryDays: "3–5", description: "Jednostránkový web o 3–5 sekcích s kontaktním formulářem a základním SEO." },
  { name: "Základní Web", price: 14900, deliveryDays: "5–7", description: "Web o 3–5 podstránkách s blogem, CMS editorem a garancí PageSpeed 90+." },
  { name: "Standardní Web", price: 29900, deliveryDays: "7–10", description: "Web o 10+ podstránkách s plnou správou obsahu a rezervačním systémem." },
];

export default function CenikWebuPage() {
  const breadcrumbs = [
    { name: "Domů", url: "https://www.weblyx.cz" },
    { name: "Ceník webu", url: "https://www.weblyx.cz/cenik-webu" },
  ];

  return (
    <>
      <JsonLd
        data={generateWebPageSchema({
          name: "Ceník tvorby webu",
          description: "Tři balíčky s pevnou cenou od 7 990 Kč, bez měsíčních poplatků.",
          url: "https://www.weblyx.cz/cenik-webu",
          breadcrumbs,
          dateModified: LAST_UPDATED,
        })}
      />
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
      <JsonLd data={generateOrganizationSchema({ locale: "cs" })} />
      <JsonLd data={generatePricedOffersSchema(OFFER_TIERS, "https://www.weblyx.cz/cenik-webu")} />

      <main className="min-h-screen pb-24 md:pb-0">
        <Breadcrumbs items={[{ label: "Ceník webu", href: "/cenik-webu" }]} />

        <section className="px-4 pt-10 pb-12 text-center md:pt-16">
          <div className="container mx-auto max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Web za 3–5 dní od <span className="text-primary">7 990 Kč</span>
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Pevná cena za vyjmenovaný rozsah. Bez měsíčních poplatků, bez skrytých
              nákladů. {DEPOSIT_SHORT}
            </p>
          </div>
        </section>

        <section className="px-4 pb-14">
          <div className="container mx-auto max-w-5xl">
            <div className="grid gap-5 md:grid-cols-3">
              {TIERS.map((t) => (
                <Card key={t.name} className={t.highlight ? "border-primary/40 shadow-sm" : "border-border/60"}>
                  <CardContent className="space-y-3 p-6">
                    <h3 className="text-lg font-bold">{t.name}</h3>
                    <p className="text-3xl font-bold text-primary">{t.price}</p>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" /> {t.time}
                    </p>
                    <p className="text-sm text-muted-foreground">{t.summary}</p>
                    <ul className="space-y-1.5 pt-2">
                      {t.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/30 px-4 py-14">
          <div className="container mx-auto max-w-5xl">
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">Co se vyplatí víc — agentura, nebo stavebnice?</h2>
            <p className="mb-8 text-muted-foreground">
              Rozhoduje sloupec s měsíčním poplatkem. Předplatné vypadá levněji v den
              podpisu a přestává někdy ve druhém roce.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 pr-4 text-left font-semibold">Řešení</th>
                    <th className="py-3 pr-4 text-left font-semibold">Pořízení</th>
                    <th className="py-3 pr-4 text-left font-semibold">Měsíčně</th>
                    <th className="py-3 pr-4 text-left font-semibold">Dodání</th>
                    <th className="py-3 text-left font-semibold">Vlastnictví</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((r, i) => (
                    <tr key={r.who} className={`border-b border-border/50 ${i === 0 ? "bg-primary/5 font-medium" : ""}`}>
                      <td className="py-3 pr-4">{r.who}</td>
                      <td className="py-3 pr-4">{r.price}</td>
                      <td className="py-3 pr-4">{r.monthly}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{r.time}</td>
                      <td className="py-3 text-muted-foreground">{r.own}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Ceny konkurence pocházejí z veřejných ceníků pražských dodavatelů, stav
              září 2026. Nejsme nejlevnější: za 9 900 Kč bez DPH dostanete jinde web
              do 48 hodin, ale na připravené oborové šabloně.
            </p>
          </div>
        </section>

        <section className="px-4 py-14">
          <div className="container mx-auto max-w-2xl" id="poptavka">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold md:text-3xl">Jak zjistím přesnou cenu pro svůj web?</h2>
              <p className="mt-2 text-muted-foreground">
                Napište, co potřebujete, a pošleme pevnou cenu. Nebo volejte{" "}
                <CallLink className="font-semibold text-primary hover:underline" />.
              </p>
            </div>
            <LandingForm source="/cenik-webu" heading="Nezávazná kalkulace" />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Potřebujete e-shop? Podívejte se na{" "}
              <Link href="/tvorba-eshopu" className="text-primary hover:underline">
                tvorbu e-shopu
              </Link>.
            </p>
          </div>
        </section>
        <LandingFaq items={CENIK_FAQ} />
      </main>

      <StickyCta />
    </>
  );
}
