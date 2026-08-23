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
import { safeRead } from '@/lib/safe-read';

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
  const sectionContent = await safeRead(
    () => getPageContent('homepage-services'),
    null,
    'homepage-services section'
  );

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
    <section className="section surface-sunken hairline-top hairline-bottom px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header — left-aligned on desktop so it reads as editorial, not a pitch deck */}
        <div className="max-w-2xl">
          <p className="eyebrow">{t('title')}</p>
          <h2 className="display display-lg mt-5">{heading}</h2>
          <p className="lede mt-5">{subheading}</p>
        </div>

        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => {
            const IconComponent = (service.icon && iconMap[service.icon as keyof typeof iconMap]) || Globe;
            return (
              <div key={service.id} className="card-flat card-flat-accent p-7">
                <span className="icon-mark">
                  <IconComponent className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-foreground">
                  {service.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-[hsl(var(--ink-soft))]">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="mt-12">
          <LeadButton
            href={t('ctaLink')}
            size="lg"
            className="h-12 px-7 text-base font-semibold rounded-xl"
          >
            {t('ctaText')}
          </LeadButton>
        </div>
      </div>
    </section>
  );
}
