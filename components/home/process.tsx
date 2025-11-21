import { MessageSquare, Palette, Code, TestTube, Rocket, HeadphonesIcon } from "lucide-react";

const mockSteps = [
  {
    id: "1",
    number: 1,
    title: "Konzultace",
    description: "Nezávazná konzultace zdarma, kde si vyslechneme vaše požadavky a cíle.",
    icon: "MessageSquare",
    enabled: true,
  },
  {
    id: "2",
    number: 2,
    title: "Návrh designu",
    description: "Vytvoříme designový návrh, který odpovídá vaší značce a cílům.",
    icon: "Palette",
    enabled: true,
  },
  {
    id: "3",
    number: 3,
    title: "Vývoj",
    description: "Vyvíjíme moderní web s důrazem na rychlost a uživatelskou zkušenost.",
    icon: "Code",
    enabled: true,
  },
  {
    id: "4",
    number: 4,
    title: "Testování",
    description: "Důkladně otestujeme na všech zařízeních a prohlížečích.",
    icon: "TestTube",
    enabled: true,
  },
  {
    id: "5",
    number: 5,
    title: "Spuštění",
    description: "Nasadíme web na produkci a zajistíme bezproblémový start.",
    icon: "Rocket",
    enabled: true,
  },
  {
    id: "6",
    number: 6,
    title: "Podpora",
    description: "Poskytujeme technickou podporu a pomůžeme s dalším rozvojem.",
    icon: "HeadphonesIcon",
    enabled: true,
  },
];

const iconMap: Record<string, any> = {
  MessageSquare,
  Palette,
  Code,
  TestTube,
  Rocket,
  HeadphonesIcon,
};

export function Process() {
  const section = {
    enabled: true,
    heading: "Jak to funguje",
    subheading: "Náš proces je jednoduchý, transparentní a efektivní",
  };

  if (!section.enabled) return null;

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{section.heading}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {section.subheading}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {mockSteps.filter(step => step.enabled).map((step) => {
            const IconComponent = iconMap[step.icon];
            return (
              <div
                key={step.id}
                className="relative p-6 rounded-xl bg-card border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
                  {step.number}
                </div>

                <div className="pt-4">
                  <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10">
                    {IconComponent && <IconComponent className="h-6 w-6 text-primary" />}
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
