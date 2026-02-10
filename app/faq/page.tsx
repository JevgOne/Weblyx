import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getAllFAQItems, getFAQSection } from "@/lib/turso/cms";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateFAQSchema } from "@/lib/schema-org";
import { generateSpeakableSchema } from "@/lib/schema-generators";
import { getTranslations, getLocale } from 'next-intl/server';
import type { Metadata } from "next";
import { getAlternateLanguages } from "@/lib/seo-metadata";
import { FAQItem } from "@/types/cms";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('faqPage');

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      type: "website",
      images: [{ url: "/images/og/og-faq.png", width: 1200, height: 630, alt: "Weblyx - FAQ" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t('metaTitle'),
      description: t('metaDescription'),
    },
    alternates: {
      canonical: 'https://www.weblyx.cz/faq',
      languages: getAlternateLanguages('/faq'),
    },
  };
}

// Revalidate every hour
export const revalidate = 3600;

export default async function FAQPage() {
  const t = await getTranslations('faqPage');
  const tFaq = await getTranslations('faq');
  const locale = await getLocale();

  const [section, items] = await Promise.all([
    getFAQSection(),
    getAllFAQItems(locale),
  ]);

  // If DB returns no FAQs, use fallback from translations
  let enabledFaqs: FAQItem[] = items.filter((faq) => faq.enabled);

  if (enabledFaqs.length === 0) {
    // Fallback to translations - create FAQ items from messages (all 20 questions)
    enabledFaqs = Array.from({ length: 20 }, (_, i) => ({
      id: String(i + 1),
      question: tFaq(`q${i + 1}`),
      answer: tFaq(`a${i + 1}`),
      enabled: true,
      order: i + 1,
    }));
  }

  // Generate FAQ Schema.org
  const faqSchema = enabledFaqs.length > 0 ? generateFAQSchema(enabledFaqs) : null;

  // Generate Speakable Schema for Voice Search (Google Assistant, Alexa)
  const speakableSchema = generateSpeakableSchema({
    cssSelectors: ['h1', 'h2', '.faq-question', '.faq-answer'],
  });

  return (
    <>
      {/* Schema.org JSON-LD for FAQ */}
      {faqSchema && <JsonLd data={faqSchema} />}

      {/* Speakable Schema for Voice Search Optimization */}
      <JsonLd data={speakableSchema} />

      {/* Breadcrumb Schema */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: t('breadcrumbHome'),
              item: "https://www.weblyx.cz",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: t('breadcrumbFaq'),
              item: "https://www.weblyx.cz/faq",
            },
          ],
        }}
      />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-4 gradient-hero grid-pattern">
          <div className="container mx-auto max-w-4xl text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              {section?.heading || t('title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {section?.subheading || t('subtitle')}
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            {enabledFaqs.length > 0 ? (
              <>
                {/* Interactive accordion for users with JS */}
                <Accordion type="single" collapsible className="space-y-4">
                  {enabledFaqs.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id || ''}
                      id={faq.id}
                      className="bg-background rounded-lg px-6 border"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-6">
                        <span className="font-semibold text-lg faq-question">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-6 leading-relaxed faq-answer">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {/* Hidden FAQ content for crawlers/SEO — Radix Accordion doesn't render collapsed content in DOM */}
                <div className="sr-only" aria-hidden="true">
                  {enabledFaqs.map((faq) => (
                    <div key={`seo-${faq.id}`}>
                      <h3 className="faq-question">{faq.question}</h3>
                      <p className="faq-answer">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {t('noFaqs')}
                </p>
              </div>
            )}

            {/* CTA Section */}
            <div className="mt-16 text-center space-y-6 p-8 rounded-2xl bg-muted/50 border">
              <h2 className="text-2xl md:text-3xl font-bold">
                {t('ctaTitle')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('ctaDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={t('contactLink')}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-[hsl(var(--primary-hover))] h-10 px-8"
                >
                  {t('contactButton')}
                </a>
                <a
                  href={t('quoteLink')}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-8"
                >
                  {t('quoteButton')}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
