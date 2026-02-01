import { Card, CardContent } from "@/components/ui/card";
import {
  Globe,
  ShoppingCart,
  TrendingUp,
  Palette,
  Zap,
  HeadphonesIcon,
} from "lucide-react";
import { getActiveServices } from "@/lib/turso/services";
import { getPageContent } from "@/lib/firestore-pages";
import { getTranslations, getLocale } from 'next-intl/server';
import { LeadButton } from "@/components/tracking/LeadButton";

// Icon mapping
const iconMap: Record<string, any> = {
  Globe,
  ShoppingCart,
  TrendingUp,
  Palette,
  Zap,
  HeadphonesIcon,
};

async function getServices(locale?: string) {
  try {
    // Fetch active services from Turso (locale-aware)
    const services = await getActiveServices(locale);
    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export async function Services() {
  const t = await getTranslations('services');
  const locale = await getLocale();
  const servicesData = await getServices(locale);
  const sectionContent = await getPageContent('homepage-services');

  // Fallback data if fetch fails
  const services = servicesData.length > 0 ? servicesData : [
    {
      id: 'fallback-1',
      icon: 'Globe',
      title: t('service1.title'),
      description: t('service1.description'),
      order: 1,
      isActive: true,
    },
    {
      id: 'fallback-2',
      icon: 'TrendingUp',
      title: t('service2.title'),
      description: t('service2.description'),
      order: 2,
      isActive: true,
    },
    {
      id: 'fallback-3',
      icon: 'ShoppingCart',
      title: t('service3.title'),
      description: t('service3.description'),
      order: 3,
      isActive: true,
    },
  ];

  // Use content from page_content collection or fallback
  const heading = sectionContent?.content?.heading || t('title');
  const subheading = sectionContent?.content?.subheading || t('subtitle');

  return (
    <section className="py-16 md:py-24 px-4 bg-muted/50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            {heading}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subheading}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const IconComponent = (service.icon && iconMap[service.icon as keyof typeof iconMap]) || Globe;
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

        {/* CTA Button */}
        <div className="text-center mt-12">
          <LeadButton href={t('ctaLink')} size="lg">
            {t('ctaText')}
          </LeadButton>
        </div>
      </div>
    </section>
  );
}
