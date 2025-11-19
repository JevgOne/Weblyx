import { Card, CardContent } from "@/components/ui/card";
import {
  Globe,
  ShoppingCart,
  TrendingUp,
  Palette,
  Zap,
  HeadphonesIcon,
} from "lucide-react";

export function Services() {
  const services = [
    {
      icon: Globe,
      title: "Webové stránky",
      description:
        "Moderní, responzivní weby přizpůsobené vašim potřebám. Od jednoduchých prezentací po komplexní firemní weby.",
    },
    {
      icon: TrendingUp,
      title: "SEO optimalizace",
      description:
        "Dostaňte se na přední pozice ve vyhledávačích. Komplexní on-page i off-page optimalizace pro lepší viditelnost.",
    },
    {
      icon: ShoppingCart,
      title: "E-shopy",
      description:
        "Kompletní řešení pro online prodej. Propojení s platebními branami, správa skladu a expedice objednávek.",
    },
    {
      icon: Palette,
      title: "Redesign",
      description:
        "Modernizace zastaralých webů. Nový design, lepší UX a vyšší konverze při zachování vaší značky.",
    },
    {
      icon: Zap,
      title: "Rychlost načítání",
      description:
        "Optimalizace výkonu pro bleskově rychlé načítání. Méně než 2 sekundy pro lepší SEO a uživatelskou zkušenost.",
    },
    {
      icon: HeadphonesIcon,
      title: "Údržba a podpora",
      description:
        "Pravidelné aktualizace, zálohy a technická podpora. Váš web bude vždy funkční a bezpečný.",
    },
  ];

  return (
    <section className="py-16 md:py-24 px-4 bg-muted/50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Naše služby
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Komplexní řešení pro vaši online přítomnost
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
