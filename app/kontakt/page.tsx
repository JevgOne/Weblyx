import type { Metadata } from "next";
import { getAlternateLanguages } from "@/lib/seo-metadata";
import { Contact } from "@/components/home/contact";

// ISR: revalidate every hour
export const revalidate = 3600;
import { JsonLd } from "@/components/seo/JsonLd";
import { generateContactPageSchema, BreadcrumbItem, generateWebPageSchema } from "@/lib/schema-org";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Mail, Phone, MapPin, Clock, Navigation } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontakt – nezávazná konzultace zdarma",
  description: "Máte zájem o nový web nebo redesign? Napište nám a do 24 hodin se ozveme s návrhem řešení a orientační cenou. Konzultace zdarma.",
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
    canonical: "https://www.weblyx.cz/kontakt",
    languages: getAlternateLanguages('/kontakt')
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
                    Revoluční 8,<br />Praha 1, 110 00
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

        {/* Google Maps Section */}
        <section className="py-12 md:py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">
                Kde nás najdete
              </h2>
              <p className="text-muted-foreground">
                Revoluční 8, Praha 1, 110 00
              </p>
            </div>

            <div className="rounded-xl overflow-hidden border border-border shadow-lg">
              <iframe
                src="https://www.google.com/maps?q=Revoluční+8,+Praha+1,+110+00,+Czech+Republic&output=embed"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Weblyx - Revoluční 8, Praha 1"
                className="w-full h-[300px] md:h-[400px]"
              />
            </div>

            <div className="flex justify-center mt-6">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Revoluční+8,+Praha+1,+110+00,+Czech+Republic"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-md"
              >
                <Navigation className="h-5 w-5" />
                Navigovat
              </a>
            </div>
          </div>
        </section>

        {/* Client-side contact form */}
        <Contact isMainPage={false} />
      </main>
    </>
  );
}
