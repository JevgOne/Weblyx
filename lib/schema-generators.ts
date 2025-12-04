/**
 * Enhanced Schema.org Generators for Weblyx
 *
 * Research shows: 20-40% traffic lift, 30% higher CTR with proper structured data
 * Competitors (Eshop-rychle, Shoptet, Webnode) DON'T have these schemas
 *
 * Priority schemas for 2025/2026:
 * 1. HowTo - For tutorial blog posts
 * 2. VideoObject - For YouTube embeds
 * 3. AggregateRating - For service ratings
 * 4. Review - For individual testimonials
 * 5. Service - For each service offered
 * 6. Speakable - For voice search optimization
 */

// ============================================================================
// HOW-TO SCHEMA - For Tutorial Blog Posts
// ============================================================================

export interface HowToStep {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

export interface HowToSchemaData {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string; // ISO 8601 duration format (e.g., "PT20M" = 20 minutes)
  estimatedCost?: {
    currency: string;
    value: string;
  };
  image?: string;
}

export function generateHowToSchema(data: HowToSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.name,
    description: data.description,
    ...(data.image && { image: data.image }),
    ...(data.totalTime && { totalTime: data.totalTime }),
    ...(data.estimatedCost && {
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: data.estimatedCost.currency,
        value: data.estimatedCost.value,
      }
    }),
    step: data.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
      ...(step.url && { url: step.url }),
    })),
  };
}

// ============================================================================
// VIDEO SCHEMA - For YouTube Embeds
// ============================================================================

export interface VideoSchemaData {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string; // ISO 8601 date format (e.g., "2025-01-20")
  duration: string; // ISO 8601 duration format (e.g., "PT5M30S" = 5 minutes 30 seconds)
  contentUrl: string;
  embedUrl?: string;
  interactionStatistic?: {
    interactionType: string; // "https://schema.org/WatchAction"
    userInteractionCount: number;
  };
}

export function generateVideoSchema(data: VideoSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: data.name,
    description: data.description,
    thumbnailUrl: data.thumbnailUrl,
    uploadDate: data.uploadDate,
    duration: data.duration,
    contentUrl: data.contentUrl,
    embedUrl: data.embedUrl || data.contentUrl,
    ...(data.interactionStatistic && {
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: data.interactionStatistic.interactionType,
        userInteractionCount: data.interactionStatistic.userInteractionCount,
      },
    }),
  };
}

// ============================================================================
// AGGREGATE RATING SCHEMA - For Service Ratings
// ============================================================================

export interface AggregateRatingSchemaData {
  itemName: string;
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export function generateAggregateRatingSchema(data: AggregateRatingSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: data.itemName,
    provider: {
      '@type': 'Organization',
      name: 'Weblyx',
      url: 'https://weblyx.cz',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: data.ratingValue,
      reviewCount: data.reviewCount,
      bestRating: data.bestRating || 5,
      worstRating: data.worstRating || 1,
    },
  };
}

// ============================================================================
// REVIEW SCHEMA - For Individual Testimonials
// ============================================================================

export interface ReviewSchemaData {
  reviewBody: string;
  authorName: string;
  authorImage?: string;
  ratingValue: number;
  datePublished: string; // ISO 8601 date format
  itemReviewed?: {
    name: string;
    description?: string;
  };
}

export function generateReviewSchema(data: ReviewSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Service',
      name: data.itemReviewed?.name || 'Web Development Services',
      description: data.itemReviewed?.description || 'Professional web development services',
      provider: {
        '@type': 'Organization',
        name: 'Weblyx',
        url: 'https://weblyx.cz',
      },
    },
    author: {
      '@type': 'Person',
      name: data.authorName,
      ...(data.authorImage && { image: data.authorImage }),
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: data.ratingValue,
      bestRating: 5,
      worstRating: 1,
    },
    datePublished: data.datePublished,
    reviewBody: data.reviewBody,
  };
}

// ============================================================================
// SERVICE SCHEMA - For Each Service Offered
// ============================================================================

export interface ServiceSchemaData {
  serviceName: string;
  description: string;
  serviceType: string;
  areaServed: string; // e.g., "Czech Republic" or "Česká republika"
  provider?: string;
  offers?: {
    priceCurrency: string;
    price?: string;
    priceRange?: string; // e.g., "7990-14990"
  };
  image?: string;
}

export function generateServiceSchema(data: ServiceSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: data.serviceType,
    name: data.serviceName,
    description: data.description,
    ...(data.image && { image: data.image }),
    provider: {
      '@type': 'LocalBusiness',
      name: data.provider || 'Weblyx',
      url: 'https://weblyx.cz',
    },
    areaServed: {
      '@type': 'Country',
      name: data.areaServed,
    },
    ...(data.offers && {
      offers: {
        '@type': 'Offer',
        priceCurrency: data.offers.priceCurrency,
        ...(data.offers.price && { price: data.offers.price }),
        ...(data.offers.priceRange && { priceRange: data.offers.priceRange }),
      },
    }),
  };
}

// ============================================================================
// SPEAKABLE SCHEMA - For Voice Search Optimization
// ============================================================================

export interface SpeakableSchemaData {
  cssSelectors: string[]; // e.g., ['.summary', '.key-points', 'h1']
  xpaths?: string[]; // Alternative to CSS selectors
}

export function generateSpeakableSchema(data: SpeakableSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      ...(data.cssSelectors.length > 0 && { cssSelector: data.cssSelectors }),
      ...(data.xpaths && data.xpaths.length > 0 && { xpath: data.xpaths }),
    },
  };
}

// ============================================================================
// BREADCRUMB SCHEMA - For Navigation
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
// SPECIAL ANNOUNCEMENT SCHEMA - For Promotions/Events
// ============================================================================

export interface SpecialAnnouncementSchemaData {
  name: string;
  text: string;
  datePosted: string; // ISO 8601 date
  expires?: string; // ISO 8601 date
  category?: string; // URL to category (e.g., https://www.wikidata.org/wiki/Q27173)
  spatialCoverage?: string; // e.g., "Czech Republic"
}

export function generateSpecialAnnouncementSchema(data: SpecialAnnouncementSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SpecialAnnouncement',
    name: data.name,
    text: data.text,
    datePosted: data.datePosted,
    ...(data.expires && { expires: data.expires }),
    ...(data.category && { category: data.category }),
    ...(data.spatialCoverage && {
      spatialCoverage: {
        '@type': 'Country',
        name: data.spatialCoverage,
      },
    }),
  };
}

// ============================================================================
// EVENT SCHEMA - For Webinars/Workshops
// ============================================================================

export interface EventSchemaData {
  name: string;
  description?: string;
  startDate: string; // ISO 8601 date-time (e.g., "2025-07-15T18:00")
  endDate: string;
  eventAttendanceMode: 'OnlineEventAttendanceMode' | 'OfflineEventAttendanceMode' | 'MixedEventAttendanceMode';
  eventStatus: 'EventScheduled' | 'EventPostponed' | 'EventCancelled';
  location: {
    type: 'VirtualLocation' | 'Place';
    url?: string;
    name?: string;
    address?: string;
  };
  offers?: {
    price: string;
    priceCurrency: string;
    availability?: string;
  };
  image?: string;
}

export function generateEventSchema(data: EventSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: data.name,
    ...(data.description && { description: data.description }),
    startDate: data.startDate,
    endDate: data.endDate,
    eventAttendanceMode: `https://schema.org/${data.eventAttendanceMode}`,
    eventStatus: `https://schema.org/${data.eventStatus}`,
    ...(data.image && { image: data.image }),
    location: data.location.type === 'VirtualLocation'
      ? {
          '@type': 'VirtualLocation',
          url: data.location.url,
        }
      : {
          '@type': 'Place',
          name: data.location.name,
          address: data.location.address,
        },
    organizer: {
      '@type': 'Organization',
      name: 'Weblyx',
      url: 'https://weblyx.cz',
    },
    ...(data.offers && {
      offers: {
        '@type': 'Offer',
        price: data.offers.price,
        priceCurrency: data.offers.priceCurrency,
        availability: data.offers.availability || 'https://schema.org/InStock',
      },
    }),
  };
}

// ============================================================================
// COURSE SCHEMA - For Tutorials/Educational Content
// ============================================================================

export interface CourseSchemaData {
  name: string;
  description: string;
  provider: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
  courseMode?: string; // e.g., "online", "onsite", "blended"
  courseWorkload?: string; // ISO 8601 duration (e.g., "PT10H" = 10 hours)
}

export function generateCourseSchema(data: CourseSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: data.name,
    description: data.description,
    provider: {
      '@type': 'Organization',
      name: data.provider,
      url: 'https://weblyx.cz',
    },
    ...(data.offers && {
      offers: {
        '@type': 'Offer',
        price: data.offers.price,
        priceCurrency: data.offers.priceCurrency,
      },
    }),
    ...(data.courseMode && {
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: data.courseMode,
        ...(data.courseWorkload && { courseWorkload: data.courseWorkload }),
      },
    }),
  };
}

// ============================================================================
// UTILITY FUNCTION - Inject Schema into Page
// ============================================================================

/**
 * To inject schema into your page, use this pattern in your .tsx file:
 *
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
 * />
 *
 * Example:
 * const schema = generateHowToSchema({...});
 * return (
 *   <>
 *     <script
 *       type="application/ld+json"
 *       dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
 *     />
 *     <main>...</main>
 *   </>
 * );
 */

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*
// Example 1: HowTo Schema for Blog Post
const howToSchema = generateHowToSchema({
  name: "Jak vytvořit web za 5 dní",
  description: "Kompletní průvodce rychlou tvorbou profesionálních webových stránek",
  totalTime: "PT5D", // 5 days
  steps: [
    { name: "Krok 1: Plánování", text: "Definujte cíle a požadavky webu" },
    { name: "Krok 2: Design", text: "Vytvořte wireframes a mockupy" },
    { name: "Krok 3: Vývoj", text: "Implementujte design pomocí Next.js" },
    { name: "Krok 4: Testování", text: "Otestujte všechny funkce" },
    { name: "Krok 5: Spuštění", text: "Nasaďte web na production" },
  ],
});

// Example 2: AggregateRating Schema for Homepage
const ratingSchema = generateAggregateRatingSchema({
  itemName: "Tvorba webových stránek",
  ratingValue: 4.9,
  reviewCount: 150,
});

// Example 3: Service Schema for Services Page
const serviceSchema = generateServiceSchema({
  serviceName: "Tvorba webu na míru",
  description: "Profesionální vývoj webových stránek pomocí Next.js",
  serviceType: "Web Development",
  areaServed: "Česká republika",
  offers: {
    priceCurrency: "CZK",
    priceRange: "7990-14990",
  },
});

// To inject schemas into your page, use this pattern in your .tsx file:
//
// <script
//   type="application/ld+json"
//   dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
// />
// <script
//   type="application/ld+json"
//   dangerouslySetInnerHTML={{ __html: JSON.stringify(ratingSchema) }}
// />
// <script
//   type="application/ld+json"
//   dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
// />
//
// See QUICK_START_GUIDE.md for complete implementation examples.
*/
