import type { Metadata } from "next";
import { Contact } from "@/components/home/contact";

// ISR: revalidate every hour
export const revalidate = 3600;
import { JsonLd } from "@/components/seo/JsonLd";
import { generateContactPageSchema, BreadcrumbItem, generateWebPageSchema } from "@/lib/schema-org";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

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

        {/* Static server-rendered contact info for SEO / crawlers */}
        <section className="py-12 md:py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">
              Kontaktujte nás
            </h1>
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-10">
              Máte zájem o nový web nebo potřebujete poradit? Ozvěte se nám a do 24 hodin vám odpovíme s návrhem řešení.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold mb-1">Email</h2>
                  <a href="mailto:info@weblyx.cz" className="text-muted-foreground hover:text-primary transition-colors">
                    info@weblyx.cz
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold mb-1">Telefon</h2>
                  <a href="tel:+420702110166" className="text-muted-foreground hover:text-primary transition-colors">
                    +420 702 110 166
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold mb-1">Adresa</h2>
                  <p className="text-muted-foreground">
                    Školská 660/3,<br />110 00 Praha
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold mb-1">Otevírací doba</h2>
                  <p className="text-muted-foreground text-sm">
                    Po–Pá: 9:00–18:00<br />
                    So–Ne: po domluvě
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Client-side contact form */}
        <Contact isMainPage={false} />
      </main>
    </>
  );
}
