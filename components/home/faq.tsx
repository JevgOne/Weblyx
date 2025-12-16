import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQSection, FAQItem } from "@/types/cms";
import { getFAQSection, getAllFAQItems } from "@/lib/turso/cms";
import { LeadButton } from "@/components/tracking/LeadButton";

async function getFAQData(): Promise<{ section: FAQSection | null; items: FAQItem[] }> {
  try {
    const [section, items] = await Promise.all([
      getFAQSection(),
      getAllFAQItems()
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
  const { section, items: faqData } = await getFAQData();

  // Filter only enabled FAQs and limit to top 5 for homepage
  const faqs = faqData.filter((faq) => faq.enabled).slice(0, 5);

  if (!section || !section.enabled || faqs.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 px-4 bg-muted/50">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            {section.heading}
          </h2>
          <p className="text-lg text-muted-foreground">
            {section.subheading}
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
          <LeadButton href="/poptavka" size="lg">
            Máte dotaz? Napište nám
          </LeadButton>
          <div>
            <a
              href="/faq"
              className="inline-flex items-center text-primary hover:underline font-medium text-sm"
            >
              Zobrazit všechny otázky →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
