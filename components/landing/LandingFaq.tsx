import { Card, CardContent } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/JsonLd";

/**
 * Questions and answers, in the two forms that matter.
 *
 * On the page: a heading shaped like the question someone types, with the
 * answer in the paragraph directly beneath it. An engine extracting a quote
 * looks for exactly that pairing — a descriptive heading like "Proč to vadí"
 * gives it nothing to lift.
 *
 * In the markup: FAQPage, so the same pairing is machine-readable rather than
 * inferred from the layout.
 *
 * Answers are kept to a few sentences and are self-contained. One that opens
 * with "jak jsme psali výše" is useless the moment it is quoted on its own.
 */
export interface Faq {
  question: string;
  answer: string;
}

export function LandingFaq({
  items,
  heading = "Časté dotazy",
}: {
  items: Faq[];
  heading?: string;
}) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }}
      />

      <section className="px-4 py-14">
        <div className="container mx-auto max-w-3xl">
          <h2 className="mb-8 text-2xl font-bold md:text-3xl">{heading}</h2>
          <div className="space-y-3">
            {items.map((f) => (
              <Card key={f.question} className="border-border/60">
                <CardContent className="space-y-2 p-6">
                  <h3 className="font-bold">{f.question}</h3>
                  <p className="leading-relaxed text-muted-foreground">{f.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
