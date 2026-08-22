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

  // Limit to top 10 for homepage
  faqs = faqs.slice(0, 10);

  if (!section || !section.enabled || faqs.length === 0) {
    return null;
  }

  // For DE locale, use translated heading/subheading instead of Czech DB values
  const heading = isDE ? tFaq('title') : section.heading;
  const subheading = isDE ? tFaq('subtitle') : section.subheading;

  return (
    <section className="section surface-sunken hairline-top px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="max-w-2xl">
          <p className="eyebrow">FAQ</p>
          <h2 className="display display-lg mt-5">{heading}</h2>
          <p className="lede mt-5">{subheading}</p>
        </div>

        {/* Questions as a single hairline-divided list — a stack of bordered
            boxes fragments the eye; one continuous list reads faster. */}
        <Accordion
          type="single"
          collapsible
          className="mt-12 border-t border-[hsl(var(--hairline))]"
        >
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id || ''}
              className="border-b border-[hsl(var(--hairline))]"
            >
              <AccordionTrigger className="text-left hover:no-underline py-5 gap-6 [&[data-state=open]>svg]:text-primary">
                <span className="text-base font-semibold tracking-tight text-foreground">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pr-8 text-[15px] leading-relaxed text-[hsl(var(--ink-soft))]">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* CTA and Link to full FAQ page */}
        <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
          <LeadButton
            href={t('ctaLink')}
            size="lg"
            className="h-12 px-7 text-base font-semibold rounded-xl"
          >
            {t('ctaButton')}
          </LeadButton>
          <a
            href={t('allFaqsHref')}
            className="inline-flex items-center text-sm font-medium text-[hsl(var(--ink-soft))] underline underline-offset-4 decoration-[hsl(var(--hairline-strong))] hover:text-primary hover:decoration-primary transition-colors duration-200"
          >
            {t('allFaqsLink')}
          </a>
        </div>
      </div>
    </section>
  );
}
