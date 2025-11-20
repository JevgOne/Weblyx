import { Check, X } from "lucide-react";

export function USPSection() {
  const badPractices = [
    "Šablonové WordPress weby, které se načítají věčnost",
    "Skryté poplatky a doplatky \"za každou drobnost\"",
    "Dodací lhůty 4+ týdny",
    "Zmizelý dodavatel po spuštění webu",
  ];

  const goodPractices = [
    "Tvorba webu na míru s dodáním do 5–7 dní",
    "Web pod 2 sekundy – optimalizovaný pro Core Web Vitals",
    "Přehledné balíčky od 8 990 Kč",
    "Dlouhodobá podpora, údržba a modernizace",
    "AI a moderní frameworky místo zastaralých technologií",
  ];

  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Proč si vybrat Weblyx místo{" "}
            <span className="text-primary">levného WordPressu</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Na rozdíl od šablonových „levných webů" stavíme projekty na moderních technologiích (Next.js, React), s důrazem na rychlost a dlouhodobou udržitelnost.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Co u nás nezažijete */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold mb-6">Co u nás nezažijete:</h3>
            <div className="space-y-3">
              {badPractices.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                  <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Co děláme jinak */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold mb-6">Co děláme jinak:</h3>
            <div className="space-y-3">
              {goodPractices.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
