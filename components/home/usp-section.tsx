import { Check, X } from "lucide-react";

export function USPSection() {
  const badPractices = [
    "Šablonové WordPress weby, které se načítají věčnost",
    "Skryté poplatky a doplatky \"za každou drobnost\"",
    "Dodací lhůty 4+ týdny",
    "Zmizelý dodavatel po spuštění webu",
  ];

  const goodPractices = [
    "⚡ Rychlá tvorba webu na míru – web do týdne (5–7 dní)",
    "🚀 Nejrychlejší weby v ČR – načítání pod 2 sekundy (PageSpeed 95+)",
    "💰 Webové stránky cena od 10 000 Kč – AKČNÍ SLEVA 7 990 Kč",
    "✅ Dlouhodobá podpora, údržba a modernizace webu",
    "🎯 Next.js a moderní frameworky místo zastaralého WordPressu",
  ];

  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Kolik stojí webové stránky?{" "}
            <span className="text-primary">Od 10 000 Kč!</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Na rozdíl od šablonových levných webů stavíme projekty na moderních technologiích (<strong>Next.js</strong> místo <strong>WordPressu</strong>), s důrazem na rychlost pod 2 sekundy a dlouhodobou udržitelnost. Rychlá tvorba webových stránek pro živnostníky a firmy.
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
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 dark:bg-primary/10 border border-primary/20 dark:border-primary/30">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
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
