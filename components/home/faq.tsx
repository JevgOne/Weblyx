import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQSection, FAQItem } from "@/types/cms";
import { getFAQSection, getAllFAQItems } from "@/lib/turso/cms";
import { LeadButton } from "@/components/tracking/LeadButton";
import { getTranslations, getLocale } from 'next-intl/server';

async function getFAQData(): Promise<{ section: FAQSection | null; items: FAQItem[] }> {
  try {
    const locale = await getLocale();
    const [section, items] = await Promise.all([
      getFAQSection(),
      getAllFAQItems(locale)
    ]);

    return {
      section,
      items: items || []
    };
  } catch (error) {
    console.error('Error fetching FAQ data:', error);
    return { section: null, items: [] };
  }
}

export async function FAQ() {
  const t = await getTranslations('faqComponent');
  const tFaq = await getTranslations('faq');
  const locale = await getLocale();
  const isDE = locale === 'de';
  const { section, items: faqData } = await getFAQData();

  // Filter only enabled FAQs
  let faqs = faqData.filter((faq) => faq.enabled);

  // If DB returns no FAQs, use fallback from translations (first 5)
  if (faqs.length === 0) {
    faqs = [
      { id: '1', question: tFaq('q1'), answer: tFaq('a1'), enabled: true, order: 1 },
      { id: '2', question: tFaq('q2'), answer: tFaq('a2'), enabled: true, order: 2 },
      { id: '3', question: tFaq('q3'), answer: tFaq('a3'), enabled: true, order: 3 },
      { id: '4', question: tFaq('q4'), answer: tFaq('a4'), enabled: true, order: 4 },
      { id: '5', question: tFaq('q5'), answer: tFaq('a5'), enabled: true, order: 5 },
    ];
  }

  // Limit to top 5 for homepage
  faqs = faqs.slice(0, 5);

  if (!section || !section.enabled || faqs.length === 0) {
    return null;
  }

  // For DE locale, use translated heading/subheading instead of Czech DB values
  const heading = isDE ? tFaq('title') : section.heading;
  const subheading = isDE ? tFaq('subtitle') : section.subheading;

  return (
    <section className="py-16 md:py-24 px-4 bg-muted/50">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            {heading}
          </h2>
          <p className="text-lg text-muted-foreground">
            {subheading}
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id || ''}
              className="bg-background rounded-lg px-6 border"
            >
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <span className="font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* CTA and Link to full FAQ page */}
        <div className="text-center mt-8 space-y-4">
          <LeadButton href={t('ctaLink')} size="lg">
            {t('ctaButton')}
          </LeadButton>
          <div>
            <a
              href={t('allFaqsHref')}
              className="inline-flex items-center text-primary hover:underline font-medium text-sm"
            >
              {t('allFaqsLink')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
