/**
 * Schema.org Structured Data Generators
 * Generates JSON-LD markup for SEO and rich snippets
 */

import { Service, FAQItem, PricingTier } from '@/types/cms';

// Base URL for the website
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.weblyx.cz';

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
}

export function generateOrganizationSchema(data?: OrganizationData) {
  const {
    name = 'Weblyx',
    url = BASE_URL,
    logo = `${BASE_URL}/logo.png`,
    description = 'Moderní webová agentura zaměřená na tvorbu kvalitních webových stránek a e-shopů s využitím AI technologií',
    email = 'info@weblyx.cz',
    phone = '+420702110166',
    addressLocality = 'Praha',
    addressCountry = 'CZ',
    streetAddress = 'Praha',
    foundingDate = '2024-02',
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
      availableLanguage: ['cs', 'Czech'],
    },
    foundingDate,
    areaServed: {
      '@type': 'Country',
      name: 'Czech Republic',
    },
    sameAs: [
      'https://www.instagram.com/weblyx.cz/',
      'https://www.facebook.com/profile.php?id=61583944536147',
      'https://share.google/cZIQkYTq2bVmkRAAP',
    ],
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
}

export function generateLocalBusinessSchema(data?: LocalBusinessData) {
  const {
    name = 'Weblyx',
    url = BASE_URL,
    description = 'Moderní webová agentura - tvorba webů, e-shopů a SEO optimalizace',
    email = 'info@weblyx.cz',
    phone = '+420702110166',
    addressLocality = 'Praha',
    addressCountry = 'CZ',
    streetAddress = 'Praha',
    priceRange = '10000 Kč - 50000 Kč',
    openingHours = ['Mo-Fr 09:00-18:00'],
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
      addressCountry,
    },
    telephone: phone,
    email,
    priceRange,
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
      name: 'Czech Republic',
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
