import { Card, CardContent } from "@/components/ui/card";
import {
  Globe,
  ShoppingCart,
  TrendingUp,
  Palette,
  Zap,
  HeadphonesIcon,
} from "lucide-react";
import { adminDbInstance } from "@/lib/firebase-admin";
import { Service } from "@/types/homepage";

// Icon mapping
const iconMap: Record<string, any> = {
  Globe,
  ShoppingCart,
  TrendingUp,
  Palette,
  Zap,
  HeadphonesIcon,
};

async function getServices(): Promise<Service[]> {
  try {
    if (!adminDbInstance) {
      console.error('Firebase Admin not initialized');
      return [];
    }

    const snapshot = await adminDbInstance
      .collection('services')
      .orderBy('order')
      .get();

    if (snapshot.empty) {
      console.error('No services found');
      return [];
    }

    const services: Service[] = [];
    snapshot.docs.forEach((doc: any) => {
      const data = doc.data() as Service;
      if (data.isActive) {
        services.push(data);
      }
    });

    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export async function Services() {
  const servicesData = await getServices();

  // Fallback data if fetch fails
  const services = servicesData.length > 0 ? servicesData : [
    {
      id: 'fallback-1',
      icon: 'Globe',
      title: 'Webové stránky',
      description: 'Moderní, responzivní weby přizpůsobené vašim potřebám. Od jednoduchých prezentací po komplexní firemní weby.',
      order: 1,
      isActive: true,
    },
    {
      id: 'fallback-2',
      icon: 'TrendingUp',
      title: 'SEO optimalizace',
      description: 'Dostaňte se na přední pozice ve vyhledávačích. Komplexní on-page i off-page optimalizace pro lepší viditelnost.',
      order: 2,
      isActive: true,
    },
    {
      id: 'fallback-3',
      icon: 'ShoppingCart',
      title: 'E-shopy',
      description: 'Kompletní řešení pro online prodej. Propojení s platebními branami, správa skladu a expedice objednávek.',
      order: 3,
      isActive: true,
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
          {services.map((service) => {
            const IconComponent = iconMap[service.icon] || Globe;
            return (
              <Card
                key={service.id}
                className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
