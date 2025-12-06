import { ArrowRight, X, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const comparison = {
  before: {
    title: "WordPress web",
    subtitle: "Tradiční řešení",
    metrics: [
      { label: "Načítání", value: "4-8 sekund", icon: X, color: "text-red-600" },
      { label: "PageSpeed", value: "40-60/100", icon: X, color: "text-red-600" },
      { label: "Údržba", value: "Složitá, pravidelná", icon: X, color: "text-red-600" },
      { label: "Bezpečnost", value: "Časté zranitelnosti", icon: X, color: "text-red-600" },
      { label: "Cena", value: "15 000 - 30 000 Kč", icon: X, color: "text-red-600" },
    ],
    problems: [
      "Pomalé načítání (zákazníci odchází)",
      "Časté updaty a záplaty",
      "Komplikované pluginy",
      "Vysoké náklady na hosting"
    ]
  },
  after: {
    title: "Next.js web",
    subtitle: "Moderní technologie",
    metrics: [
      { label: "Načítání", value: "< 2 sekundy", icon: Check, color: "text-green-600" },
      { label: "PageSpeed", value: "90-100/100", icon: Check, color: "text-green-600" },
      { label: "Údržba", value: "Minimální", icon: Check, color: "text-green-600" },
      { label: "Bezpečnost", value: "Maximum zabezpečení", icon: Check, color: "text-green-600" },
      { label: "Cena", value: "7 990 - 14 990 Kč", icon: Check, color: "text-green-600" },
    ],
    benefits: [
      "Bleskové načítání (90+ PageSpeed)",
      "Automatické updaty",
      "Žádné pluginy, čistý kód",
      "Levný hosting (od 0 Kč)"
    ]
  }
};

export function BeforeAfter() {
  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-muted-foreground">WordPress</span> vs{" "}
            <span className="text-primary">Next.js</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Proč moderní technologie poráží tradiční CMS ve všech metrikách
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* BEFORE - WordPress */}
          <Card className="relative overflow-hidden border-2 border-red-200 dark:border-red-900/30">
            {/* Badge */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-semibold">
              PŘED
            </div>

            <CardContent className="p-8 space-y-6">
              {/* Title */}
              <div>
                <h3 className="text-2xl font-bold mb-1">{comparison.before.title}</h3>
                <p className="text-sm text-muted-foreground">{comparison.before.subtitle}</p>
              </div>

              {/* Metrics */}
              <div className="space-y-3">
                {comparison.before.metrics.map((metric, i) => {
                  const IconComponent = metric.icon;
                  return (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm font-medium">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{metric.value}</span>
                        <IconComponent className={`h-4 w-4 ${metric.color}`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Problems */}
              <div className="space-y-2 pt-4">
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Typické problémy:
                </div>
                <div className="space-y-2">
                  {comparison.before.problems.map((problem, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{problem}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AFTER - Next.js */}
          <Card className="relative overflow-hidden border-2 border-primary shadow-lg shadow-primary/10">
            {/* Badge */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              PO
            </div>

            <CardContent className="p-8 space-y-6">
              {/* Title */}
              <div>
                <h3 className="text-2xl font-bold mb-1">{comparison.after.title}</h3>
                <p className="text-sm text-muted-foreground">{comparison.after.subtitle}</p>
              </div>

              {/* Metrics */}
              <div className="space-y-3">
                {comparison.after.metrics.map((metric, i) => {
                  const IconComponent = metric.icon;
                  return (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm font-medium">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{metric.value}</span>
                        <IconComponent className={`h-4 w-4 ${metric.color}`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Benefits */}
              <div className="space-y-2 pt-4">
                <div className="text-sm font-semibold text-primary uppercase tracking-wide">
                  Výhody řešení:
                </div>
                <div className="space-y-2">
                  {comparison.after.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            {/* Decorative gradient */}
            <div className="absolute -z-10 inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          </Card>
        </div>

        {/* Arrow between cards (desktop only) */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-background border-2 border-primary rounded-full p-4 shadow-lg">
            <ArrowRight className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/20">
          <p className="text-lg font-semibold mb-2">
            💡 <span className="text-primary">Ušetřete až 50%</span> a získejte rychlejší web
          </p>
          <p className="text-sm text-muted-foreground">
            Moderní technologie = menší náklady, vyšší výkon, spokojení zákazníci
          </p>
        </div>
      </div>
    </section>
  );
}
