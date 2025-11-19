import { MessageSquare, Palette, Code, TestTube, Rocket, Wrench } from "lucide-react";

export function Process() {
  const steps = [
    {
      number: "01",
      icon: MessageSquare,
      title: "Konzultace",
      description: "Nezávazná konzultace zdarma, kde si vyslechneme vaše požadavky a cíle.",
    },
    {
      number: "02",
      icon: Palette,
      title: "Návrh designu",
      description: "Vytvoříme moderní design odpovídající vaší značce a cílové skupině.",
    },
    {
      number: "03",
      icon: Code,
      title: "Vývoj",
      description: "Naprogramujeme web s využitím nejnovějších technologií a best practices.",
    },
    {
      number: "04",
      icon: TestTube,
      title: "Testování",
      description: "Důkladně otestujeme všechny funkce, responzivitu a rychlost načítání.",
    },
    {
      number: "05",
      icon: Rocket,
      title: "Spuštění",
      description: "Zveřejníme váš web na internetu a zajistíme bezproblémový start.",
    },
    {
      number: "06",
      icon: Wrench,
      title: "Podpora",
      description: "Poskytujeme následnou podporu, aktualizace a údržbu vašeho webu.",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Jak to funguje
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Náš proces je jednoduchý, transparentní a efektivní
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connector Line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-border -z-10">
                  <div className="h-full w-0 bg-primary group-hover:w-full transition-all duration-500"></div>
                </div>
              )}

              <div className="space-y-4">
                {/* Icon & Number */}
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
