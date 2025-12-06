import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, Rocket } from "lucide-react";

export function TargetAudience() {
  const audiences = [
    {
      icon: Users,
      title: "Web pro živnostníky",
      description: "Kadeřnictví, autoservisy, fotografové, účetní. Rychlý web s kontaktem, ceníkem a galerií prací – bez měsíčních poplatků za WordPress.",
    },
    {
      icon: Briefcase,
      title: "Web pro malé firmy",
      description: "Stavební firmy, poradenství, výroba. Web s referencemi, týmem a poptávkovým formulářem, který generuje zákazníky 24/7.",
    },
    {
      icon: Rocket,
      title: "E-shopy a start-upy",
      description: "Růst z 100 na 10 000 návštěv měsíčně? Náš web to zvládne. Rychlost, SEO a škálovatelnost – bez drahých redesignů.",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Pro koho tvoříme weby
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pomáháme hlavně těm, kteří potřebují rychlou, moderní a cenově dostupnou tvorbu webu – bez zbytečné byrokracie a čekání.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {audiences.map((audience, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <audience.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{audience.title}</h3>
                <p className="text-muted-foreground">{audience.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
