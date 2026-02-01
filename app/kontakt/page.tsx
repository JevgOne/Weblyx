import type { Metadata } from "next";
import { getAlternateLanguages } from "@/lib/seo-metadata";
import { Contact } from "@/components/home/contact";

// ISR: revalidate every hour
export const revalidate = 3600;
import { JsonLd } from "@/components/seo/JsonLd";
import { generateContactPageSchema, BreadcrumbItem, generateWebPageSchema } from "@/lib/schema-org";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Mail, Phone, MapPin, Clock, Navigation } from "lucide-react";
import { getLocale } from "next-intl/server";

const isSeitelyx = process.env.NEXT_PUBLIC_DOMAIN?.includes('seitelyx.de');

export const metadata: Metadata = isSeitelyx ? {
  title: "Kontakt – kostenlose unverbindliche Beratung",
  description: "Interesse an einer neuen Website oder einem Redesign? Schreiben Sie uns und wir melden uns innerhalb von 24 Stunden mit einem Angebot. Beratung kostenlos.",
  keywords: [
    "Kontakt Webagentur",
    "Website erstellen",
    "kostenlose Beratung",
    "Website-Anfrage",
    "Website für Unternehmen",
  ],
  openGraph: {
    title: "Kontakt | Seitelyx – kostenlose Beratung",
    description: "Interesse an einer neuen Website? Schreiben Sie uns und wir melden uns innerhalb von 24 Stunden.",
    url: "https://www.seitelyx.de/kontakt",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Seitelyx - Kontakt" }],
  },
  alternates: {
    canonical: "https://www.seitelyx.de/kontakt",
    languages: getAlternateLanguages('/kontakt')
  }
} : {
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
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Weblyx - Kontakt" }],
  },
  alternates: {
    canonical: "https://www.weblyx.cz/kontakt",
    languages: getAlternateLanguages('/kontakt')
  }
};

export default async function ContactPage() {
  const locale = await getLocale();
  const isDE = locale === 'de';
  const baseUrl = isDE ? 'https://www.seitelyx.de' : 'https://www.weblyx.cz';
  const brandName = isDE ? 'Seitelyx' : 'Weblyx';

  // Generate schemas
  const contactPageSchema = generateContactPageSchema();

  // Generate breadcrumb
  const breadcrumbs: BreadcrumbItem[] = [
    { name: isDE ? 'Startseite' : 'Domů', url: baseUrl },
    { name: 'Kontakt', url: `${baseUrl}/kontakt` },
  ];

  const webpageSchema = generateWebPageSchema({
    name: 'Kontakt',
    description: isDE ? `Kontaktieren Sie ${brandName} - moderne Webagentur` : `Kontaktujte ${brandName} - moderní webovou agenturu`,
    url: `${baseUrl}/kontakt`,
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
              {isDE ? 'Kontaktieren Sie uns' : 'Kontaktujte nás'}
            </h1>
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-10">
              {isDE
                ? 'Interesse an einer neuen Website oder Beratung? Schreiben Sie uns und wir antworten innerhalb von 24 Stunden.'
                : 'Máte zájem o nový web nebo potřebujete poradit? Ozvěte se nám a do 24 hodin vám odpovíme s návrhem řešení.'}
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold mb-1">E-Mail</h2>
                  <a href={isDE ? "mailto:kontakt@seitelyx.de" : "mailto:info@weblyx.cz"} className="text-muted-foreground hover:text-primary transition-colors">
                    {isDE ? 'kontakt@seitelyx.de' : 'info@weblyx.cz'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold mb-1">{isDE ? 'Telefon' : 'Telefon'}</h2>
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
                  <h2 className="font-semibold mb-1">{isDE ? 'Adresse' : 'Adresa'}</h2>
                  <p className="text-muted-foreground">
                    Revoluční 8,<br />{isDE ? 'Prag 1, 110 00' : 'Praha 1, 110 00'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold mb-1">{isDE ? 'Erreichbarkeit' : 'Otevírací doba'}</h2>
                  <p className="text-muted-foreground text-sm">
                    {isDE ? 'Mo–Fr: 8:00–18:00' : 'Po–Pá: 8:00–18:00'}<br />
                    {isDE ? 'Sa–So: nach Vereinbarung' : 'So–Ne: po domluvě'}
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
                {isDE ? 'So finden Sie uns' : 'Kde nás najdete'}
              </h2>
              <p className="text-muted-foreground">
                Revoluční 8, {isDE ? 'Prag 1' : 'Praha 1'}, 110 00
              </p>
            </div>

            <div className="rounded-xl overflow-hidden border border-border shadow-lg">
              <iframe
                src="https://maps.google.com/maps?q=Revolučn%C3%AD%208%2C%20Praha%201%2C%20110%2000%2C%20Czech%20Republic&t=&z=16&ie=UTF8&iwloc=B&output=embed"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${brandName} - Revoluční 8, ${isDE ? 'Prag 1' : 'Praha 1'}`}
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
                {isDE ? 'Route planen' : 'Navigovat'}
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
