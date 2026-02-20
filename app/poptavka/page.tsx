import type { Metadata } from "next";
import { getAlternateLanguages } from "@/lib/seo-metadata";
import { QuoteForm } from "@/components/poptavka/QuoteForm";
import { getLocale } from "next-intl/server";

// ISR: revalidate every hour
export const revalidate = 3600;

const isSeitelyx = process.env.NEXT_PUBLIC_DOMAIN?.includes('seitelyx.de');

export const metadata: Metadata = isSeitelyx ? {
  title: "Unverbindliche Anfrage – Websites ab 320 € | Seitelyx",
  description: "Füllen Sie das Formular aus und wir melden uns innerhalb von 24 Stunden mit einem Angebot. Neue Website, Redesign, Online-Shop oder Landing Page.",
  keywords: [
    "Website Anfrage",
    "Website erstellen Preis",
    "unverbindliche Anfrage",
    "neue Website",
    "Website-Redesign",
    "Online-Shop erstellen",
    "Landing Page",
  ],
  openGraph: {
    title: "Unverbindliche Anfrage | Seitelyx – Websites ab 320 €",
    description: "Füllen Sie das Formular aus und wir senden Ihnen innerhalb von 24 Stunden ein Angebot. Unverbindlich.",
    url: "https://www.seitelyx.de/anfrage",
    type: "website",
    images: [{ url: "/images/og/og-poptavka.png", width: 1200, height: 630, alt: "Seitelyx - Anfrage" }],
  },
  alternates: {
    canonical: "https://www.seitelyx.de/anfrage",
    languages: getAlternateLanguages('/anfrage'),
  },
} : {
  title: "Nezávazná poptávka – webové stránky od 7 990 Kč | Weblyx",
  description: "Vyplňte nezávaznou poptávku na tvorbu webových stránek. Nový web, redesign, e-shop nebo landing page. Odpovíme do 24 hodin s návrhem řešení a cenou.",
  keywords: [
    "poptávka web",
    "tvorba webu cena",
    "nezávazná poptávka",
    "webové stránky Praha",
    "nový web",
    "redesign webu",
    "web na míru",
    "landing page",
  ],
  openGraph: {
    title: "Nezávazná poptávka | Weblyx – webové stránky od 7 990 Kč",
    description: "Vyplňte formulář a do 24 hodin vám pošleme návrh řešení s orientační cenou. Bez závazků.",
    url: "https://www.weblyx.cz/poptavka",
    type: "website",
    images: [{ url: "/images/og/og-poptavka.png", width: 1200, height: 630, alt: "Weblyx - Nezávazná poptávka" }],
  },
  alternates: {
    canonical: "https://www.weblyx.cz/poptavka",
    languages: getAlternateLanguages('/poptavka'),
  },
};

export default async function QuotePage() {
  const locale = await getLocale();
  const isDE = locale === 'de';

  return (
    <div className="min-h-screen py-16 px-4 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto max-w-2xl">
        {/* Static server-rendered content for SEO */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {isDE ? 'Unverbindliche Anfrage' : 'Nezávazná poptávka'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isDE
              ? 'Füllen Sie das Formular aus und wir melden uns innerhalb von 24 Stunden mit einem Angebot.'
              : 'Vyplňte formulář a my se vám ozveme do 24 hodin s návrhem řešení a orientační cenou.'}
          </p>
        </div>

        {/* Client-side interactive form */}
        <QuoteForm />

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {isDE ? (
            <>
              Haben Sie eine Frage? Schreiben Sie uns an{" "}
              <a href="mailto:kontakt@seitelyx.de" className="text-primary hover:underline">
                kontakt@seitelyx.de
              </a>
            </>
          ) : (
            <>
              Máte otázku? Napište nám na{" "}
              <a href="mailto:info@weblyx.cz" className="text-primary hover:underline">
                info@weblyx.cz
              </a>{" "}
              nebo volejte{" "}
              <a href="tel:+420702110166" className="text-primary hover:underline">
                +420 702 110 166
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
