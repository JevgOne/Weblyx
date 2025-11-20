import type { Metadata } from "next";
import { Contact } from "@/components/home/contact";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateContactPageSchema, generateLocalBusinessSchema, BreadcrumbItem, generateWebPageSchema } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Kontakt | Weblyx - Napište nám",
  description: "Máte dotaz nebo zájem o spolupráci? Napište nám a my se vám ozveme do 24 hodin.",
};

export default function ContactPage() {
  // Generate schemas
  const contactPageSchema = generateContactPageSchema();
  const localBusinessSchema = generateLocalBusinessSchema({
    name: 'Weblyx',
    url: 'https://weblyx.cz',
    description: 'Moderní webová agentura - tvorba webů, e-shopů a SEO optimalizace',
    email: 'info@weblyx.cz',
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
