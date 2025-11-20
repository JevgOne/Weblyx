import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getServerFAQSection, getServerFAQItems } from "@/lib/firestore-server";

export async function FAQ() {
  const [section, faqData] = await Promise.all([
    getServerFAQSection(),
    getServerFAQItems(),
  ]);

  // Filter only enabled FAQs
  const faqs = faqData.filter((faq) => faq.enabled);

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
      </div>
    </section>
  );
}
