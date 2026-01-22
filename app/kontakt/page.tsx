import type { Metadata } from "next";
import { Contact } from "@/components/home/contact";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateContactPageSchema, BreadcrumbItem, generateWebPageSchema } from "@/lib/schema-org";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

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
    url: "https://www.weblyx.cz/kontakt",
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
    canonical: "https://www.weblyx.cz/kontakt"
  }
};

export default function ContactPage() {
  // Generate schemas
  const contactPageSchema = generateContactPageSchema();

  // Generate breadcrumb
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Domů', url: 'https://www.weblyx.cz' },
    { name: 'Kontakt', url: 'https://www.weblyx.cz/kontakt' },
  ];

  const webpageSchema = generateWebPageSchema({
    name: 'Kontakt',
    description: 'Kontaktujte Weblyx - moderní webovou agenturu',
    url: 'https://www.weblyx.cz/kontakt',
    breadcrumbs,
  });

  return (
    <>
      {/* Schema.org JSON-LD */}
      <JsonLd data={contactPageSchema} />
      <JsonLd data={webpageSchema} />

      <main className="min-h-screen pt-16">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Kontakt", href: "/kontakt" }
          ]}
        />
        <Contact isMainPage={true} />
      </main>
    </>
  );
}
