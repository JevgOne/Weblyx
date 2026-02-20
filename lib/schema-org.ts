/**
 * Schema.org Structured Data Generators
 * Generates JSON-LD markup for SEO and rich snippets
 */

import { Service, FAQItem, PricingTier } from '@/types/cms';

export type Locale = 'cs' | 'de';

// Base URL for the website - dynamic based on domain
const BASE_URL = process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de' ? 'https://seitelyx.de' : 'https://www.weblyx.cz';

// ============================================================================
// ORGANIZATION SCHEMA
// ============================================================================

export interface OrganizationData {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  email?: string;
  phone?: string;
  addressLocality?: string;
  addressCountry?: string;
  streetAddress?: string;
  foundingDate?: string;
  locale?: Locale;
}

export function generateOrganizationSchema(data?: OrganizationData) {
  const locale = data?.locale || (process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de' ? 'de' : 'cs');

  const defaults = {
    cs: {
      name: 'Weblyx',
      url: 'https://www.weblyx.cz',
      logo: 'https://www.weblyx.cz/logo.png',
      description: 'Moderní webová agentura zaměřená na tvorbu kvalitních webových stránek s využitím AI technologií',
      email: 'info@weblyx.cz',
      phone: '+420702110166',
      addressLocality: 'Praha',
      addressCountry: 'CZ',
      streetAddress: 'Revoluční 8, Praha 1',
      foundingDate: '2024-02',
      areaServedName: 'Czech Republic',
      availableLanguage: ['cs', 'Czech'],
    },
    de: {
      name: 'Seitelyx',
      url: 'https://seitelyx.de',
      logo: 'https://seitelyx.de/logo.png',
      description: 'Moderne Webagentur für professionelle Websites ohne WordPress. Next.js Entwicklung für maximale Performance und Sicherheit.',
      email: 'kontakt@seitelyx.de',
      phone: '+420702110166',
      addressLocality: 'Prag',
      addressCountry: 'DE',
      streetAddress: 'Revoluční 8, Prag 1',
      foundingDate: '2024-02',
      areaServedName: 'Germany, Austria, Switzerland',
      availableLanguage: ['de', 'German'],
    },
  };

  const config = defaults[locale];

  const {
    name = config.name,
    url = config.url,
    logo = config.logo,
    description = config.description,
    email = config.email,
    phone = config.phone,
    addressLocality = config.addressLocality,
    addressCountry = config.addressCountry,
    streetAddress = config.streetAddress,
    foundingDate = config.foundingDate,
  } = data || {};

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo: {
      '@type': 'ImageObject',
      url: logo,
    },
    description,
    address: {
      '@type': 'PostalAddress',
      streetAddress,
      addressLocality,
      addressCountry,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email,
      telephone: phone,
      contactType: 'customer service',
      availableLanguage: config.availableLanguage,
    },
    foundingDate,
    areaServed: {
      '@type': 'Country',
      name: config.areaServedName,
    },
    sameAs: locale === 'cs' ? [
      'https://www.instagram.com/weblyx.cz/',
      'https://www.facebook.com/profile.php?id=61583944536147',
      'https://share.google/cZIQkYTq2bVmkRAAP',
    ] : [],
  };
}

// ============================================================================
// WEBSITE SCHEMA
// ============================================================================

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Weblyx',
    url: BASE_URL,
    description: 'Moderní webová agentura - tvorba webů, e-shopů a SEO optimalizace',
    inLanguage: 'cs',
    publisher: {
      '@type': 'Organization',
      name: 'Weblyx',
    },
  };
}

// ============================================================================
// LOCAL BUSINESS SCHEMA
// ============================================================================

export interface LocalBusinessData extends OrganizationData {
  priceRange?: string;
  openingHours?: string[];
  streetAddress?: string;
  postalCode?: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}

export function generateLocalBusinessSchema(data?: LocalBusinessData) {
  const locale = data?.locale || (process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de' ? 'de' : 'cs');

  const defaults = {
    cs: {
      name: 'Weblyx',
      url: 'https://www.weblyx.cz',
      description: 'Moderní webová agentura - tvorba webů, e-shopů a SEO optimalizace',
      email: 'info@weblyx.cz',
      phone: '+420702110166',
      addressLocality: 'Praha',
      addressCountry: 'CZ',
      streetAddress: 'Revoluční 8, Praha 1',
      postalCode: '110 00',
      priceRange: '10000 Kč - 50000 Kč',
      openingHours: ['Mo-Fr 08:00-18:00'],
      areaServedName: 'Czech Republic',
    },
    de: {
      name: 'Seitelyx',
      url: 'https://seitelyx.de',
      description: 'Moderne Webagentur für professionelle Websites, E-Commerce und SEO-Optimierung',
      email: 'kontakt@seitelyx.de',
      phone: '+420702110166',
      addressLocality: 'Prag',
      addressCountry: 'DE',
      streetAddress: 'Revoluční 8, Prag 1',
      postalCode: '110 00',
      priceRange: '349€ - 1299€',
      openingHours: ['Mo-Fr 08:00-18:00'],
      areaServedName: 'Germany, Austria, Switzerland',
    },
  };

  const config = defaults[locale];

  const {
    name = config.name,
    url = config.url,
    description = config.description,
    email = config.email,
    phone = config.phone,
    addressLocality = config.addressLocality,
    addressCountry = config.addressCountry,
    streetAddress = config.streetAddress,
    postalCode = config.postalCode,
    priceRange = config.priceRange,
    openingHours = config.openingHours,
    aggregateRating,
  } = data || {};

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    url,
    description,
    address: {
      '@type': 'PostalAddress',
      streetAddress,
      addressLocality,
      postalCode,
      addressCountry,
    },
    telephone: phone,
    email,
    priceRange,
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount,
        bestRating: aggregateRating.bestRating || 5,
        worstRating: aggregateRating.worstRating || 1,
      },
    }),
    openingHoursSpecification: openingHours.map((hours) => {
      const [days, time] = hours.split(' ');
      const [opens, closes] = time.split('-');
      const dayMap: { [key: string]: string } = {
        'Mo': 'Monday',
        'Tu': 'Tuesday',
        'We': 'Wednesday',
        'Th': 'Thursday',
        'Fr': 'Friday',
        'Sa': 'Saturday',
        'Su': 'Sunday',
      };

      const dayRange = days.split('-');
      const daysOfWeek = dayRange.length === 2
        ? Object.keys(dayMap)
            .slice(
              Object.keys(dayMap).indexOf(dayRange[0]),
              Object.keys(dayMap).indexOf(dayRange[1]) + 1
            )
            .map(d => dayMap[d])
        : [dayMap[days]];

      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: daysOfWeek,
        opens,
        closes,
      };
    }),
    areaServed: {
      '@type': 'Country',
      name: config.areaServedName,
    },
  };
}

// ============================================================================
// SERVICE SCHEMA
// ============================================================================

export function generateServiceSchema(service: Service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: 'Weblyx',
      url: BASE_URL,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Czech Republic',
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${BASE_URL}/sluzby#${service.id}`,
    },
  };
}

export function generateServicesSchema(services: Service[]) {
  return services.map(service => generateServiceSchema(service));
}

// ============================================================================
// FAQ SCHEMA
// ============================================================================

export function generateFAQSchema(faqs: FAQItem[]) {
  if (!faqs || faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// ============================================================================
// BREADCRUMB SCHEMA
// ============================================================================

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ============================================================================
// OFFER/PRICING SCHEMA
// ============================================================================

export function generateOfferSchema(pricing: PricingTier) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: pricing.name,
    description: pricing.description,
    price: pricing.price.toString(),
    priceCurrency: 'CZK',
    availability: 'https://schema.org/InStock',
    url: `${BASE_URL}/#pricing`,
    itemOffered: {
      '@type': 'Service',
      name: pricing.name,
      description: pricing.description,
    },
    seller: {
      '@type': 'Organization',
      name: 'Weblyx',
    },
  };
}

export function generateOffersSchema(pricingTiers: PricingTier[]) {
  return pricingTiers.map(tier => generateOfferSchema(tier));
}

// ============================================================================
// WEBPAGE SCHEMA
// ============================================================================

export interface WebPageData {
  name: string;
  description: string;
  url: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function generateWebPageSchema(data: WebPageData) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.name,
    description: data.description,
    url: data.url,
    inLanguage: 'cs',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Weblyx',
      url: BASE_URL,
    },
  };

  if (data.breadcrumbs && data.breadcrumbs.length > 0) {
    schema.breadcrumb = generateBreadcrumbSchema(data.breadcrumbs);
  }

  return schema;
}

// ============================================================================
// ABOUT PAGE SCHEMA
// ============================================================================

export interface AboutPageData {
  name?: string;
  description?: string;
  url?: string;
}

export function generateAboutPageSchema(data?: AboutPageData) {
  const {
    name = 'O nás',
    description = 'Jsme moderní webová agentura zaměřená na tvorbu kvalitních webových stránek s využitím AI technologií',
    url = `${BASE_URL}/o-nas`,
  } = data || {};

  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name,
    description,
    url,
    inLanguage: 'cs',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Weblyx',
      url: BASE_URL,
    },
    about: {
      '@type': 'Organization',
      name: 'Weblyx',
    },
  };
}

// ============================================================================
// CONTACT PAGE SCHEMA
// ============================================================================

export function generateContactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Kontakt',
    description: 'Kontaktujte Weblyx - moderní webovou agenturu',
    url: `${BASE_URL}/kontakt`,
    inLanguage: 'cs',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Weblyx',
      url: BASE_URL,
    },
  };
}

// ============================================================================
// CREATIVE WORK SCHEMA (for Portfolio)
// ============================================================================

export interface PortfolioItem {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  url?: string;
  tags?: string[];
  dateCreated?: Date;
}

export function generateCreativeWorkSchema(item: PortfolioItem) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: item.title,
    description: item.description,
    ...(item.imageUrl && { image: item.imageUrl }),
    ...(item.url && { url: item.url }),
    creator: {
      '@type': 'Organization',
      name: 'Weblyx',
      url: BASE_URL,
    },
    ...(item.dateCreated && { dateCreated: item.dateCreated.toISOString() }),
    ...(item.tags && item.tags.length > 0 && { keywords: item.tags.join(', ') }),
  };
}

export function generatePortfolioSchema(items: PortfolioItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Portfolio',
    description: 'Naše realizované projekty a ukázky práce',
    url: `${BASE_URL}/portfolio`,
    inLanguage: 'cs',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Weblyx',
      url: BASE_URL,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: generateCreativeWorkSchema(item),
      })),
    },
  };
}
