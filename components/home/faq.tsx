import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  const faqs = [
    {
      question: "Jak dlouho trvá vytvoření webu?",
      answer:
        "Jednoduché webové stránky dodáme za 5-7 dní. Standardní weby s rozšířenými funkcemi obvykle trvají 10-14 dní. E-shopy a složitější projekty jsou individuální a závisí na rozsahu funkcí. Po úvodní konzultaci vám poskytneme přesný časový odhad.",
    },
    {
      question: "Kolik stojí webové stránky?",
      answer:
        "Startovací cena je 10 000 Kč pro jednoduchý web s až 5 podstránkami. Standardní weby začínají na 25 000 Kč a e-shopy od 85 000 Kč. Finální cena závisí na počtu stránek, funkcích a designové složitosti. Po vyplnění dotazníku vám připravíme konkrétní nabídku.",
    },
    {
      question: "Poskytujete i doménu a hosting?",
      answer:
        "Ano, můžeme zajistit doménu i hosting, nebo vám pomůžeme s nastavením, pokud už je máte. Doporučujeme kvalitní hosting pro optimální rychlost a bezpečnost vašeho webu. Cena hostingu začína na cca 100-300 Kč měsíčně podle typu webu.",
    },
    {
      question: "Mohu si web spravovat sám?",
      answer:
        "Samozřejmě! Pokud chcete, implementujeme jednoduché CMS (Content Management System), které vám umožní měnit texty, přidávat fotky a publikovat články bez znalosti programování. Poskytneme vám také školení nebo video návod.",
    },
    {
      question: "Děláte i e-shopy?",
      answer:
        "Ano, vytváříme plně funkční e-shopy s propojením na platební brány (GoPay, Stripe, PayPal), správou produktů, skladu a objednávek. E-shopy začínají na 85 000 Kč a zahrnují vše potřebné pro online prodej.",
    },
    {
      question: "Nabízíte následnou podporu?",
      answer:
        "Ano, k jednoduchému webu poskytujeme 1 měsíc podpory zdarma, ke standardnímu 3 měsíce a k e-shopu 6 měsíců. Po této době můžete využít naše servisní balíčky nebo jednorázové úpravy podle potřeby.",
    },
    {
      question: "Jaké technologie používáte?",
      answer:
        "Používáme moderní technologie jako Next.js, React a TypeScript pro maximální výkon a bezpečnost. Pro styling používáme Tailwind CSS. Backend řešíme přes Supabase nebo vlastní API. Všechny weby jsou responzivní a SEO optimalizované.",
    },
    {
      question: "Jak probíhá platba?",
      answer:
        "Standardně vyžadujeme zálohu 50% před zahájením prací a zbytek před předáním hotového webu. U větších projektů můžeme dohodnout rozložení na více splátek. Platbu můžete provést fakturou s QR kódem nebo bankovním převodem.",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 bg-muted/50">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Často kladené otázky
          </h2>
          <p className="text-lg text-muted-foreground">
            Odpovědi na nejčastější dotazy
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
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
