import type { Metadata } from "next";
import { DEPOSIT_SHORT } from "@/lib/deposit";
import Link from "next/link";
import { getAlternateLanguages } from "@/lib/seo-metadata";
import { AuditForm } from "@/components/audit/AuditForm";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Audit webu zdarma | PageSpeed, SEO, bezpečnost",
  description: "Zdarma zanalyzujeme rychlost, SEO a bezpečnost vašeho webu. Skóre uvidíte hned na stránce, detailní rozpis s doporučeními přijde na e-mail.",
  keywords: [
    "audit webu zdarma",
    "analýza webu",
    "PageSpeed test",
    "SEO audit",
    "kontrola webu",
    "rychlost webu",
    "web audit",
  ],
  openGraph: {
    title: "Zdarma audit vašeho webu | Weblyx",
    description: "Profesionální audit rychlosti, SEO a bezpečnosti. Zdarma a s výsledkem hned.",
    url: "https://www.weblyx.cz/audit",
    type: "website",
    images: [{ url: "/images/og/og-audit.png", width: 1200, height: 630, alt: "Weblyx - Audit webu zdarma" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zdarma audit vašeho webu | Weblyx",
    description: "Profesionální audit rychlosti, SEO a bezpečnosti. Zdarma a s výsledkem hned.",
  },
  alternates: {
    canonical: "https://www.weblyx.cz/audit",
    languages: getAlternateLanguages('/audit'),
  },
};

/**
 * The five questions the page answers, in the order it answers them.
 *
 * `plain` is the answer stripped of links — structured data takes text, and a
 * quote lifted into an AI answer has to stand on its own anyway.
 */
const SECTIONS = [
  {
    question: "Co audit kontroluje?",
    plain:
      "Audit projde šest oblastí a každou oboduje zvlášť. Rychlost načítání měří, jak dlouho návštěvník čeká, než se stránka ukáže. SEO kontroluje titulky, popisky, strukturu nadpisů, sitemap a strukturovaná data. Bezpečnost ověřuje HTTPS, hlavičky a nezabezpečený obsah. Dál se díváme na přístupnost, na nastavení pro sdílení na sociálních sítích a na připravenost pro AI vyhledávání.",
  },
  {
    question: "Co znamená výsledné skóre?",
    plain:
      "Výsledek zasazujeme proti vlastnímu měření: změřili jsme padesát českých firemních webů a průměr byl 43 ze 100. Skóre 90 a výš znamená, že web patří do nejlepších procent českého trhu. Mezi 50 a 89 web funguje, ale konkurence s lepším skóre ho předbíhá. Pod 50 návštěvníci odcházejí dřív, než se stránka načte.",
  },
  {
    question: "Jak dlouho audit trvá?",
    plain:
      "Celkové skóre a šest dílčích hodnocení se zobrazí během několika sekund přímo na stránce. Detailní rozpis s konkrétními doporučeními přijde na e-mail. Nic neplatíte a k ničemu se nezavazujete.",
  },
  {
    question: "Je audit opravdu zdarma?",
    plain:
      "Ano, bez podmínek a bez skrytých poplatků. Z nálezů je obvykle vidět, jestli stačí pár oprav, nebo se vyplatí web předělat. Ceny webů začínají na 7 990 Kč a po schválení návrhu se hradí záloha 50 %.",
  },
  {
    question: "Můžu si web změřit sám?",
    plain:
      "Rychlost ano — Google nabízí PageSpeed Insights zdarma a doporučujeme si tím projít i weby agentur, které zvažujete. Náš audit přidává to, co PageSpeed neměří: strukturovaná data, hierarchii nadpisů, chybějící alternativní texty, nastavení pro sdílení a připravenost pro AI vyhledávání.",
  },
];

export default function AuditPage() {
  /**
   * The questions and their answers, declared once.
   *
   * The page carried five questions as headings and a FAQPage listing three,
   * only two of which matched — one of them asked something the page never
   * said. An engine that finds schema describing content it cannot see has
   * reason to ignore the schema entirely, which is the opposite of the point.
   * Both the markup and the structured data now read from this.
   */
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SECTIONS.map((s) => ({
      "@type": "Question",
      name: s.question,
      acceptedAnswer: { "@type": "Answer", text: s.plain },
    })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      <main className="min-h-screen">
        <Breadcrumbs items={[{ label: "Audit webu zdarma", href: "/audit" }]} />

        {/* Hero */}
        <section className="pt-16 pb-8 md:pt-24 md:pb-12 px-4">
          <div className="container mx-auto max-w-3xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
              🔍 100% zdarma
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Audit vašeho webu <span className="text-primary">zdarma</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Zjistěte, jak si váš web vede v rychlosti, SEO a bezpečnosti.
              Skóre uvidíte hned, detailní rozpis s doporučeními vám pošleme na e-mail.
            </p>
          </div>
        </section>

        {/* Form section */}
        <section className="pb-16 px-4">
          <div className="container mx-auto max-w-2xl">
            <AuditForm />
          </div>
        </section>

        {/*
          The page used to be a hero and a form — 86 words, no headings at all,
          while the FAQ existed only in the structured data. Schema is supposed
          to describe what is on the page, and a lead magnet nobody can find is
          not a lead magnet.
        */}
        <section className="border-t px-4 py-14">
          <div className="container mx-auto max-w-3xl space-y-10">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold md:text-3xl">{SECTIONS[0].question}</h2>
              <p className="leading-relaxed text-muted-foreground">
                Audit projde šest oblastí a každou oboduje zvlášť, takže uvidíte, kde
                přesně web ztrácí. <strong>Rychlost načítání</strong> měří, jak dlouho
                návštěvník čeká, než se stránka ukáže.{" "}
                <strong>SEO</strong> kontroluje titulky, popisky, strukturu nadpisů,
                sitemap a strukturovaná data — tedy to, podle čeho Google stránce
                rozumí. <strong>Bezpečnost</strong> ověřuje HTTPS, hlavičky a to, jestli
                web někde nenačítá nezabezpečený obsah.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Dál se díváme na <strong>přístupnost</strong> (alternativní texty u
                obrázků, popsaná tlačítka a odkazy), na{" "}
                <strong>sociální sítě</strong> (jak se web zobrazí, když ho někdo sdílí)
                a na <strong>připravenost pro AI vyhledávání</strong> — jestli má web
                strukturovaná data, ze kterých si asistenti jako ChatGPT nebo Perplexity
                umí vzít odpověď.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold md:text-3xl">{SECTIONS[1].question}</h2>
              <p className="leading-relaxed text-muted-foreground">
                Číslo samo o sobě neříká nic, dokud nevíte, s čím ho srovnat. Proto
                výsledek zasazujeme proti vlastnímu měření:{" "}
                <Link href="/blog/analyzovali-jsme-50-ceskych-webu-prumerny-pagespeed-43" className="text-primary hover:underline">
                  změřili jsme padesát českých firemních webů a průměr byl 43 ze 100
                </Link>
                .
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">90 a výš</strong> — web je v nejlepších procentech českého trhu.</li>
                <li><strong className="text-foreground">50 až 89</strong> — funguje, ale konkurence s lepším skóre vás předbíhá.</li>
                <li><strong className="text-foreground">Pod 50</strong> — návštěvníci odcházejí dřív, než se stránka načte, a vy se to z analytiky nedozvíte.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold md:text-3xl">{SECTIONS[2].question}</h2>
              <p className="leading-relaxed text-muted-foreground">
                Celkové skóre a šest dílčích hodnocení se zobrazí{" "}
                <strong>během několika sekund</strong> přímo na téhle stránce. Detailní
                rozpis s konkrétními doporučeními — tedy co s každým nálezem dělat —
                přijde na e-mail. Nic neplatíte a k ničemu se nezavazujete.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold md:text-3xl">{SECTIONS[3].question}</h2>
              <p className="leading-relaxed text-muted-foreground">
                Ano, bez podmínek a bez skrytých poplatků. Děláme ho proto, že většina
                lidí netuší, jak si jejich web stojí, a protože z nálezů je obvykle
                vidět, jestli stačí pár oprav, nebo se vyplatí{" "}
                <Link href="/redesign-webu" className="text-primary hover:underline">
                  web předělat
                </Link>
                . Pokud se rozhodnete pro druhou variantu, najdete ceny v{" "}
                <Link href="/cenik-webu" className="text-primary hover:underline">
                  ceníku
                </Link>{" "}
                — od 7 990 Kč, {DEPOSIT_SHORT.toLowerCase()}
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold md:text-3xl">{SECTIONS[4].question}</h2>
              <p className="leading-relaxed text-muted-foreground">
                Rychlost ano — Google nabízí PageSpeed Insights zdarma a doporučujeme
                si tím projít i weby agentur, které zvažujete. Náš audit přidává to,
                co PageSpeed neměří: strukturovaná data, hierarchii nadpisů, chybějící
                alternativní texty, nastavení pro sdílení a připravenost pro AI
                vyhledávání. A hlavně vám řekne, co s tím.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
