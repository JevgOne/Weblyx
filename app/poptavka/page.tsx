import type { Metadata } from "next";
import { QuoteForm } from "@/components/poptavka/QuoteForm";

// ISR: revalidate every hour
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Nezávazná poptávka – webové stránky od 7 990 Kč | Weblyx",
  description:
    "Vyplňte nezávaznou poptávku na tvorbu webových stránek. Nový web, redesign, e-shop nebo landing page. Odpovíme do 24 hodin s návrhem řešení a cenou.",
  keywords: [
    "poptávka web",
    "tvorba webu cena",
    "nezávazná poptávka",
    "webové stránky Praha",
    "nový web",
    "redesign webu",
    "e-shop na míru",
    "landing page",
  ],
  openGraph: {
    title: "Nezávazná poptávka | Weblyx – webové stránky od 7 990 Kč",
    description:
      "Vyplňte formulář a do 24 hodin vám pošleme návrh řešení s orientační cenou. Bez závazků.",
    url: "https://www.weblyx.cz/poptavka",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Weblyx - Nezávazná poptávka",
      },
    ],
  },
  alternates: {
    canonical: "https://www.weblyx.cz/poptavka",
  },
};

export default function QuotePage() {
  return (
    <div className="min-h-screen py-16 px-4 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto max-w-2xl">
        {/* Static server-rendered content for SEO */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Nezávazná poptávka
          </h1>
          <p className="text-muted-foreground text-lg">
            Vyplňte formulář a my se vám ozveme do 24 hodin s návrhem řešení a orientační cenou.
          </p>
        </div>

        {/* Client-side interactive form */}
        <QuoteForm />

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Máte otázku? Napište nám na{" "}
          <a href="mailto:info@weblyx.cz" className="text-primary hover:underline">
            info@weblyx.cz
          </a>{" "}
          nebo volejte{" "}
          <a href="tel:+420702110166" className="text-primary hover:underline">
            +420 702 110 166
          </a>
        </div>
      </div>
    </div>
  );
}
