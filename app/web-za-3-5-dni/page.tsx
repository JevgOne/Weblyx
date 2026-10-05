import type { Metadata } from "next";
import { LandingFaq, type Faq } from "@/components/landing/LandingFaq";
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
  title: "Hotový web za 3–5 dní — od 7 990 Kč",
  description:
    "Web hotový za 3–5 pracovních dní od 7 990 Kč. Co k tomu potřebujeme, jak jde den po dni a od čeho termín běží. Rezervace termínu do 24 hodin.",
  alternates: { canonical: "https://www.weblyx.cz/web-za-3-5-dni" },
  openGraph: { images: [{ url: "/images/og/og-web-za-3-5-dni.png", width: 1200, height: 630 }] },
};

/**
 * The timeline is the offer here, so it is the page.
 *
 * Every step says who is doing what, because the usual reason a three-day
 * build turns into three weeks is that nobody said out loud whose turn it is.
 */
const TIMELINE = [
  { day: "Den 0", who: "Vy", title: "Zadání a podklady", body: "Řeknete, co web má umět, a pošlete texty, logo a fotky. Co nemáte, řekneme dopředu." },
  { day: "Den 0", who: "My", title: "Nabídka s pevnou cenou", body: "Do 24 hodin dostanete rozsah a cenu písemně. Cena platí pro ten rozsah." },
  { day: "Den 1", who: "Vy", title: "Schválení a záloha", body: "Po schválení návrhu hradíte zálohu 50 %. Teprve tímto dnem začíná běžet termín." },
  { day: "Den 1–2", who: "My", title: "Návrh designu", body: "Uvidíte, jak bude web vypadat. V ceně jsou dvě kola úprav." },
  { day: "Den 2–4", who: "My", title: "Stavba a testování", body: "Stavíme na Next.js, testujeme na mobilu i desktopu, měříme rychlost." },
  { day: "Den 3–5", who: "My", title: "Spuštění", body: "Doplatek před předáním, pak web jde ven. Podpora 1–3 měsíce podle balíčku." },
];

const NEEDED = [
  "Texty, nebo alespoň body, o čem mají stránky být",
  "Logo, ideálně ve vektoru (SVG, AI, EPS)",
  "Fotky — vaše vlastní fungují líp než fotobanka",
  "Přístup k doméně, pokud ji už máte",
  "Kontaktní údaje a otevírací dobu",
];

const RYCHLOST_FAQ: Faq[] = [
  {
    question: "Je web za tři dny vůbec kvalitní?",
    answer:
      "Jednostránková vizitka se třemi až pěti sekcemi je práce zhruba na šestnáct hodin. Za tři až pět dní se stihne proto, že je rozsah jasně vymezený, ne proto, že by se odbývala. Rozsáhlejší weby trvají 5 až 10 dní.",
  },
  {
    question: "Od kdy se termín počítá?",
    answer:
      "Od chvíle, kdy je uhrazená záloha 50 % a zároveň máme všechny podklady — texty, logo, fotky a potřebné přístupy. Ne od prvního e-mailu a ne od odeslání poptávky. Lhůta se staví po dobu, kdy čekáme na doplnění.",
  },
  {
    question: "Co se stane, když termín nedodržíte?",
    answer:
      "Snižuje se celková cena zakázky na 50 %. Uhrazená záloha se pak považuje za úhradu celé zakázky a doplatek neplatíte. Je to psané v obchodních podmínkách, ne jen v marketingu.",
  },
  {
    question: "Kolik kol úprav je v ceně?",
    answer:
      "Dvě kola revizí designu. Pokud ani po nich nejste spokojeni, vracíme zálohu.",
  },
  {
    question: "Co když nemám texty připravené?",
    answer:
      "Řekneme to na začátku a domluvíme se na copywritingu zvlášť. Čekání na podklady je jediná věc, která termín reálně posouvá.",
  },
];

const OFFER_TIERS = [
  { name: "Landing Page", price: 7990, deliveryDays: "3–5", description: "Jednostránkový web o 3–5 sekcích s kontaktním formulářem a základním SEO." },
  { name: "Základní Web", price: 9990, deliveryDays: "5–7", description: "Web o 3–5 podstránkách s blogem, CMS editorem a garancí PageSpeed 90+." },
  { name: "Standardní Web", price: 24900, deliveryDays: "7–10", description: "Web o 10+ podstránkách s plnou správou obsahu a rezervačním systémem." },
];

export default function WebZa35DniPage() {
  const breadcrumbs = [
    { name: "Domů", url: "https://www.weblyx.cz" },
    { name: "Web za 3–5 dní", url: "https://www.weblyx.cz/web-za-3-5-dni" },
  ];

  return (
    <>
      <JsonLd
        data={generateWebPageSchema({
          name: "Hotový web za 3–5 dní",
          description: "Web hotový za 3–5 pracovních dní od 7 990 Kč.",
          url: "https://www.weblyx.cz/web-za-3-5-dni",
          breadcrumbs,
          dateModified: LAST_UPDATED,
        })}
      />
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
      <JsonLd data={generateOrganizationSchema({ locale: "cs" })} />
      <JsonLd data={generatePricedOffersSchema(OFFER_TIERS, "https://www.weblyx.cz/web-za-3-5-dni")} />

      <main className="min-h-screen pb-24 md:pb-0">
        <Breadcrumbs items={[{ label: "Web za 3–5 dní", href: "/web-za-3-5-dni" }]} />

        <section className="px-4 pt-10 pb-12 text-center md:pt-16">
          <div className="container mx-auto max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Hotový web za <span className="text-primary">3–5 dní</span>
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Od 7 990 Kč, pevná cena bez měsíčních poplatků. {DEPOSIT_SHORT}{" "}
              <strong>Termín běží od zálohy a od chvíle, kdy máme podklady</strong> —
              ne od prvního e-mailu.
            </p>
          </div>
        </section>

        <section className="px-4 pb-14">
          <div className="container mx-auto max-w-3xl">
            <h2 className="mb-8 text-2xl font-bold md:text-3xl">Jak může být web hotový za tři dny?</h2>
            <ol className="space-y-3">
              {TIMELINE.map((s, i) => (
                <li key={i}>
                  <Card className="border-border/60">
                    <CardContent className="flex gap-4 p-5">
                      <div className="w-20 shrink-0">
                        <p className="text-sm font-bold text-primary">{s.day}</p>
                        <p className="text-xs text-muted-foreground">{s.who}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold">{s.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-y bg-muted/30 px-4 py-14">
          <div className="container mx-auto max-w-3xl">
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">Co musím dodat, aby se termín stihl?</h2>
            <p className="mb-6 text-muted-foreground">
              Tohle je jediná věc, která termín reálně posouvá. Lhůta se staví po dobu,
              kdy čekáme na podklady.
            </p>
            <ul className="space-y-2.5">
              {NEEDED.map((n) => (
                <li key={n} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-4 py-14">
          <div className="container mx-auto max-w-2xl" id="poptavka">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold md:text-3xl">Jak si zarezervuji termín?</h2>
              <p className="mt-2 flex flex-wrap items-center justify-center gap-x-2 text-muted-foreground">
                <Clock className="h-4 w-4" /> Ozveme se do 24 hodin. Nebo volejte{" "}
                <CallLink className="font-semibold text-primary hover:underline" />.
              </p>
            </div>
            <LandingForm source="/web-za-3-5-dni" heading="Nezávazná poptávka" />
          </div>
        </section>
        <LandingFaq items={RYCHLOST_FAQ} />
      </main>

      <StickyCta />
    </>
  );
}
