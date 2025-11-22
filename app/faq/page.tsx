import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getAllFAQItems, getFAQSection } from "@/lib/turso/cms";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateFAQSchema } from "@/lib/schema-org";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Časté otázky (FAQ) – Tvorba webových stránek | Weblyx",
  description: "Odpovědi na nejčastější otázky o tvorbě webů, cenách, dodacích lhůtách a službách. Zjistěte vše o našich webových řešeních.",
  keywords: [
    "FAQ webové stránky",
    "časté otázky tvorba webu",
    "kolik stojí web",
    "jak dlouho trvá web",
    "podpora webu",
    "hosting doména",
  ],
  openGraph: {
    title: "Časté otázky o tvorbě webů | Weblyx",
    description: "Kompletní odpovědi na všechny vaše dotazy ohledně tvorby webových stránek, cen a služeb.",
    url: "https://weblyx.cz/faq",
    type: "website",
  },
};

// Revalidate every hour
export const revalidate = 3600;

export default async function FAQPage() {
  const [section, items] = await Promise.all([
    getFAQSection(),
    getAllFAQItems(),
  ]);

  // Filter only enabled FAQs
  const enabledFaqs = items.filter((faq) => faq.enabled);

  // Generate FAQ Schema.org
  const faqSchema = enabledFaqs.length > 0 ? generateFAQSchema(enabledFaqs) : null;

  return (
    <>
      {/* Schema.org JSON-LD for FAQ */}
      {faqSchema && <JsonLd data={faqSchema} />}

      {/* Breadcrumb Schema */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Domů",
              item: "https://weblyx.cz",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "FAQ",
              item: "https://weblyx.cz/faq",
            },
          ],
        }}
      />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-4 gradient-hero grid-pattern">
          <div className="container mx-auto max-w-4xl text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              {section?.heading || "Často kladené otázky"}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {section?.subheading || "Najděte odpovědi na všechny vaše otázky o tvorbě webových stránek"}
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            {enabledFaqs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-4">
                {enabledFaqs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id || ''}
                    id={faq.id}
                    className="bg-background rounded-lg px-6 border"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-6">
                      <span className="font-semibold text-lg">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Zatím nejsou k dispozici žádné FAQ. Brzy je doplníme.
                </p>
              </div>
            )}

            {/* CTA Section */}
            <div className="mt-16 text-center space-y-6 p-8 rounded-2xl bg-muted/50 border">
              <h2 className="text-2xl md:text-3xl font-bold">
                Nenašli jste odpověď?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Kontaktujte nás a rádi vám poradíme s čímkoliv ohledně tvorby webových stránek.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/kontakt"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-[hsl(var(--primary-hover))] h-10 px-8"
                >
                  Kontaktujte nás
                </a>
                <a
                  href="/poptavka"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-8"
                >
                  Nezávazná poptávka
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
