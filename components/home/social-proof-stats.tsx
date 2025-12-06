import { TrendingUp, Users, Zap, Award } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "15+",
    label: "Dokončených projektů",
    description: "Od živnostníků po firmy"
  },
  {
    icon: Users,
    value: "98%",
    label: "Spokojených klientů",
    description: "Vrací se k nám pro další projekty"
  },
  {
    icon: Zap,
    value: "< 2s",
    label: "Průměrná rychlost",
    description: "PageSpeed 90+ garantováno"
  },
  {
    icon: Award,
    value: "7 dní",
    label: "Průměrná doba dodání",
    description: "Od poptávky po spuštění"
  }
];

export function SocialProofStats() {
  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Důvěřují nám <span className="text-primary">desítky klientů</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Naše čísla mluví za nás - rychlost, kvalita a spokojenost
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Icon */}
                  <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>

                  {/* Value */}
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                    {stat.value}
                  </div>

                  {/* Label */}
                  <div className="space-y-1">
                    <div className="text-base font-semibold">
                      {stat.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.description}
                    </div>
                  </div>
                </div>

                {/* Decorative gradient */}
                <div className="absolute -z-10 inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
