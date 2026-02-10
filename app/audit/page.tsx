import type { Metadata } from "next";
import { getAlternateLanguages } from "@/lib/seo-metadata";
import { AuditForm } from "@/components/audit/AuditForm";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Zdarma audit vašeho webu | PageSpeed, SEO, bezpečnost | Weblyx",
  description: "Získejte zdarma profesionální audit vašeho webu. Zanalyzujeme rychlost, SEO, bezpečnost a UX. Výsledky do 48 hodin na email.",
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
    description: "Profesionální audit rychlosti, SEO a bezpečnosti vašeho webu. Zdarma, do 48 hodin.",
    url: "https://www.weblyx.cz/audit",
    type: "website",
    images: [{ url: "/images/og/og-homepage.png", width: 1200, height: 630, alt: "Weblyx - Audit webu zdarma" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zdarma audit vašeho webu | Weblyx",
    description: "Profesionální audit rychlosti, SEO a bezpečnosti vašeho webu. Zdarma, do 48 hodin.",
  },
  alternates: {
    canonical: "https://www.weblyx.cz/audit",
    languages: getAlternateLanguages('/audit'),
  },
};

export default function AuditPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Co je v auditu webu zdarma?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Audit zahrnuje PageSpeed analýzu (mobilní i desktopovou rychlost), SEO check (meta tagy, nadpisy, strukturovaná data), analýzu Core Web Vitals a bezpečnostní kontrolu (HTTPS, hlavičky, GDPR)."
        }
      },
      {
        "@type": "Question",
        "name": "Jak dlouho trvá audit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Výsledky auditu vám pošleme na email do 48 hodin od odeslání formuláře."
        }
      },
      {
        "@type": "Question",
        "name": "Je audit opravdu zdarma?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ano, audit je kompletně zdarma a nezávazný. Žádné skryté poplatky."
        }
      }
    ]
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
              Zjistěte jak si váš web vede v rychlosti, SEO a bezpečnosti.
              Pošleme vám detailní report na email do 48 hodin.
            </p>
          </div>
        </section>

        {/* Form section */}
        <section className="pb-20 md:pb-28 px-4">
          <div className="container mx-auto max-w-2xl">
            <AuditForm />
          </div>
        </section>
      </main>
    </>
  );
}
