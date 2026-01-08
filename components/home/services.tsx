import {
  Globe,
  ShoppingCart,
  TrendingUp,
  Palette,
  Zap,
  HeadphonesIcon,
  Rocket,
  FileText,
  Award,
} from "lucide-react";
import { getActiveServices } from "@/lib/turso/services";
import { getPageContent } from "@/lib/firestore-pages";
import { getTranslations } from 'next-intl/server';
import { LeadButton } from "@/components/tracking/LeadButton";
import { ServiceCard } from "./service-card";

// Icon mapping
const iconMap: Record<string, any> = {
  Globe,
  ShoppingCart,
  TrendingUp,
  Palette,
  Zap,
  HeadphonesIcon,
  Rocket,
  FileText,
  Award,
};

async function getServices() {
  try {
    // Fetch active services from Turso
    const services = await getActiveServices();
    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export async function Services() {
  const t = await getTranslations('services');
  const servicesData = await getServices();
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
              <ServiceCard
                key={service.id}
                service={service}
                IconComponent={IconComponent}
              />
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
