import type { Metadata } from "next";
import { LandingFaq, type Faq } from "@/components/landing/LandingFaq";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateWebPageSchema, generateBreadcrumbSchema, generateOrganizationSchema, generatePricedOffersSchema } from "@/lib/schema-org";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { LandingForm } from "@/components/landing/LandingForm";
import { StickyCta } from "@/components/landing/StickyCta";
import { CallLink } from "@/components/landing/CallLink";
import { DEPOSIT_SHORT } from "@/lib/deposit";
import { countPublishedProjects, getRatingStat, completedProjects } from "@/lib/site-stats";

/** Bumped when the page is edited, not on every build. */
const LAST_UPDATED = "2026-10-01";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Firemní web, který přivádí poptávky — od 7 990 Kč",
  description:
    "Průměrný český firemní web má PageSpeed 43 ze 100 — měřili jsme jich padesát. Web na Next.js za 3–5 dní od 7 990 Kč, PageSpeed 90+ garantovaně.",
  alternates: { canonical: "https://www.weblyx.cz/web-pro-male-firmy" },
  openGraph: { images: [{ url: "/images/og/og-web-pro-male-firmy.png", width: 1200, height: 630 }] },
};

/**
 * This page argues from our own measurement rather than adjectives.
 *
 * "Pomalý web stojí zákazníky" is what every agency says. "We measured fifty
 * Czech company sites and the average was 43 out of 100" is checkable, and it
 * is ours — which is the only reason a reader has to believe the rest.
 */
const BENCHMARK_URL = "/blog/analyzovali-jsme-50-ceskych-webu-prumerny-pagespeed-43";

const STEPS = [
  { n: "1", title: "Audit zdarma", body: "Změříme váš stávající web — rychlost, SEO, bezpečnost. Výsledek uvidíte hned." },
  { n: "2", title: "Nabídka do 24 hodin", body: "Pevná cena za vyjmenovaný rozsah. Po schválení návrhu záloha 50 %." },
  { n: "3", title: "Web za 3–5 dní", body: "Termín běží od zálohy a od dodání podkladů. Když ho nedodržíme, platíte polovinu." },
];

const FIRMY_FAQ: Faq[] = [
  {
    question: "Jak poznám, že je můj web pomalý?",
    answer:
      "Změřte si ho v PageSpeed Insights od Googlu, je to zdarma. My jsme změřili padesát českých firemních webů a průměrné skóre bylo 43 ze 100. Nad 90 je dobře, pod 50 přichází firma o návštěvníky, kteří odejdou dřív, než se stránka načte.",
  },
  {
    question: "Proč Next.js místo WordPressu?",
    answer:
      "Weby na Next.js se načítají rychleji, nepotřebují drahý hosting ani měsíční správu a nejsou terčem automatizovaných útoků na pluginy. Od balíčku Základní Web garantujeme PageSpeed 90+, jinak vracíme peníze.",
  },
  {
    question: "Kolik stojí web pro malou firmu?",
    answer:
      "Od 7 990 Kč za jednostránkovou prezentaci, 9 990 Kč za web o třech až pěti podstránkách s blogem a 24 900 Kč za rozsáhlejší web s plnou správou obsahu. Jednorázově, bez měsíčních poplatků.",
  },
  {
    question: "Jak dlouho to trvá a kdy se platí?",
    answer:
      "Tři až deset pracovních dní podle rozsahu. Po schválení nabídky hradíte zálohu 50 %, doplatek před předáním. Termín běží od zálohy a od dodání podkladů.",
  },
  {
    question: "Můžu si web pak spravovat sám?",
    answer:
      "Od balíčku Základní Web ano — dostanete editor, ve kterém měníte texty, obrázky i články bez zásahu vývojáře. U rozsáhlejších webů je to plná správa obsahu včetně podstránek.",
  },
];

const OFFER_TIERS = [
  { name: "Landing Page", price: 7990, deliveryDays: "3–5", description: "Jednostránkový web o 3–5 sekcích s kontaktním formulářem a základním SEO." },
  { name: "Základní Web", price: 9990, deliveryDays: "5–7", description: "Web o 3–5 podstránkách s blogem, CMS editorem a garancí PageSpeed 90+." },
  { name: "Standardní Web", price: 24900, deliveryDays: "7–10", description: "Web o 10+ podstránkách s plnou správou obsahu a rezervačním systémem." },
];

export default async function WebProMaleFirmyPage() {
  const projects = await completedProjects("cs");
  const rating = await getRatingStat("cs");

  const breadcrumbs = [
    { name: "Domů", url: "https://www.weblyx.cz" },
    { name: "Web pro malé firmy", url: "https://www.weblyx.cz/web-pro-male-firmy" },
  ];

  return (
    <>
      <JsonLd
        data={generateWebPageSchema({
          name: "Firemní web, který přivádí poptávky",
          description: "Web na Next.js pro malé firmy od 7 990 Kč, PageSpeed 90+ garantovaně.",
          url: "https://www.weblyx.cz/web-pro-male-firmy",
          breadcrumbs,
          dateModified: LAST_UPDATED,
        })}
      />
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
      <JsonLd data={generateOrganizationSchema({ locale: "cs" })} />
      <JsonLd data={generatePricedOffersSchema(OFFER_TIERS, "https://www.weblyx.cz/web-pro-male-firmy")} />

      <main className="min-h-screen pb-24 md:pb-0">
        <Breadcrumbs items={[{ label: "Web pro malé firmy", href: "/web-pro-male-firmy" }]} />

        <section className="px-4 pt-10 pb-12 md:pt-16">
          <div className="container mx-auto max-w-3xl space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Firemní web, který přivádí poptávky, od{" "}
              <span className="text-primary">7 990 Kč</span>
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Změřili jsme padesát českých firemních webů. Průměrné skóre rychlosti
              bylo <strong>43 ze 100</strong>. Váš web nemusí být jedním z nich.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              {rating && (
                <span className="flex items-center gap-1.5 font-medium">
                  <Star className="h-4 w-4 fill-current text-amber-500" />
                  {rating.value} · {rating.label}
                </span>
              )}
              <span className="text-muted-foreground">{projects} dokončených projektů</span>
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/30 px-4 py-14">
          <div className="container mx-auto max-w-3xl">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">Proč pomalý web stojí firmu zákazníky?</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Pomalý web neodradí návštěvníka tím, že by si stěžoval. Odejde a vy se to
              nedozvíte — v analytice to vypadá jen jako méně poptávek. Čísla z naší
              analýzy padesáti webů jsou{" "}
              <Link href={BENCHMARK_URL} className="text-primary hover:underline">
                popsaná i s metodikou
              </Link>
              .
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Stavíme na Next.js místo WordPressu, takže weby nepotřebují drahý hosting
              ani měsíční správu. <strong>Od balíčku Základní Web garantujeme PageSpeed
              90+, jinak vracíme peníze.</strong> Změřte si to sami — na našich
              referencích i u kohokoli, koho zvažujete.
            </p>
          </div>
        </section>

        <section className="px-4 py-14">
          <div className="container mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">Jak probíhá tvorba webu pro malou firmu?</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {STEPS.map((s) => (
                <Card key={s.n} className="border-border/60">
                  <CardContent className="space-y-2.5 p-6">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {s.n}
                    </span>
                    <h3 className="font-bold">{s.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">{DEPOSIT_SHORT}</p>
          </div>
        </section>

        <section className="border-t bg-muted/30 px-4 py-14">
          <div className="container mx-auto max-w-2xl" id="poptavka">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold md:text-3xl">Jak zjistím, co je na mém webu špatně?</h2>
              <p className="mt-2 text-muted-foreground">
                Změříme váš web a řekneme, co zlepšit. Nezávazně. Nebo volejte{" "}
                <CallLink className="font-semibold text-primary hover:underline" />.
              </p>
            </div>
            <LandingForm
              source="/web-pro-male-firmy"
              heading="Chci audit a nabídku"
              note="Ozveme se do 24 hodin s výsledkem měření a cenou."
            />
            <ul className="mx-auto mt-8 max-w-md space-y-2 text-sm text-muted-foreground">
              {["Pevná cena bez měsíčních poplatků", "SEO v ceně, ne příplatek", "Web i doména zůstávají vaše"].map((x) => (
                <li key={x} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <LandingFaq items={FIRMY_FAQ} />
      </main>

      <StickyCta />
    </>
  );
}
