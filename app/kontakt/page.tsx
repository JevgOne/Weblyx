import type { Metadata } from "next";
import { Contact } from "@/components/home/contact";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateContactPageSchema, generateLocalBusinessSchema, BreadcrumbItem, generateWebPageSchema } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Kontakt – nezávazná konzultace zdarma",
  description: "Máte zájem o nový web, redesign nebo zrychlení webu? Napište nám pár detailů o projektu a my se vám do 24 hodin ozveme s návrhem řešení a orientační cenou. Nezávazná konzultace zdarma.",
  keywords: [
    "kontakt webová agentura",
    "tvorba webu Praha",
    "nezávazná konzultace",
    "poptávka webu",
    "web pro živnostníky",
  ],
  openGraph: {
    title: "Kontakt | Weblyx – nezávazná konzultace zdarma",
    description: "Máte zájem o nový web? Napište nám a my se vám ozveme do 24 hodin s návrhem řešení.",
    url: "https://weblyx.cz/kontakt",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Weblyx - Kontakt"
      }
    ],
  },
  alternates: {
    canonical: "https://weblyx.cz/kontakt"
  }
};

export default function ContactPage() {
  // Generate schemas
  const contactPageSchema = generateContactPageSchema();
  const localBusinessSchema = generateLocalBusinessSchema({
    name: 'Weblyx',
    url: 'https://weblyx.cz',
    description: 'Moderní webová agentura - tvorba webů, e-shopů a SEO optimalizace',
    email: 'weblyxinfo@gmail.com',
    addressLocality: 'Praha',
    addressCountry: 'CZ',
    priceRange: '10000-150000 CZK',
    openingHours: ['Mo-Fr 09:00-18:00'],
  });

  // Generate breadcrumb
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Domů', url: 'https://weblyx.cz' },
    { name: 'Kontakt', url: 'https://weblyx.cz/kontakt' },
  ];

  const webpageSchema = generateWebPageSchema({
    name: 'Kontakt',
    description: 'Kontaktujte Weblyx - moderní webovou agenturu',
    url: 'https://weblyx.cz/kontakt',
    breadcrumbs,
  });

  return (
    <>
      {/* Schema.org JSON-LD */}
      <JsonLd data={contactPageSchema} />
      <JsonLd data={localBusinessSchema} />
      <JsonLd data={webpageSchema} />

      <main className="min-h-screen pt-16">
        <Contact />
      </main>
    </>
  );
}
