// EroWeb HTML Parser
// Parses HTML content and extracts analysis data

import * as cheerio from 'cheerio';
import type { AnalysisDetails } from '@/types/eroweb';
import { getDefaultAnalysisDetails } from './scoring';

export interface ParsedHtmlData {
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  descriptionLength: number;
  h1: string | null;
  h1Count: number;
  hasProperHeadingStructure: boolean;
  images: { src: string; alt: string | null }[];
  imagesWithAlt: number;
  totalImages: number;
  hasViewportMeta: boolean;
  hasCanonical: boolean;
  structuredData: object[];
  structuredDataTypes: string[];
  copyrightYear: number | null;
  hasContactForm: boolean;
  hasPhone: boolean;
  hasEmail: boolean;
  hasWhatsApp: boolean;
  hasFaqSection: boolean;
  hasQaFormat: boolean;
  hasAddress: boolean;
  hasPricing: boolean;
  hasOpeningHours: boolean;
  hasBookingSystem: boolean;
  usesFlexbox: boolean;
  usesGrid: boolean;
  usesWebfonts: boolean;
  cmsDetected: string | null;
  hasAboutPage: boolean;
  hasContactPage: boolean;
}

/**
 * Parse HTML and extract analysis data
 */
export function parseHtml(html: string, baseUrl: string): ParsedHtmlData {
  const $ = cheerio.load(html);
  const bodyText = $('body').text();
  const lowerHtml = html.toLowerCase();

  // Title
  const title = $('title').text().trim() || null;
  const titleLength = title?.length || 0;

  // Meta description
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || null;
  const descriptionLength = metaDescription?.length || 0;

  // H1
  const h1Elements = $('h1');
  const h1 = h1Elements.first().text().trim() || null;
  const h1Count = h1Elements.length;

  // Heading structure check
  const headings: number[] = [];
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const level = parseInt(el.tagName[1]);
    headings.push(level);
  });

  // Check if headings follow proper hierarchy (no skipping levels)
  let hasProperHeadingStructure = true;
  if (headings.length > 0 && headings[0] !== 1) {
    hasProperHeadingStructure = false;
  }
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] > headings[i - 1] + 1) {
      hasProperHeadingStructure = false;
      break;
    }
  }

  // Images
  const images: { src: string; alt: string | null }[] = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src') || '';
    const alt = $(el).attr('alt') || null;
    images.push({ src, alt });
  });
  const imagesWithAlt = images.filter(img => img.alt && img.alt.trim().length > 0).length;
  const totalImages = images.length;

  // Viewport meta
  const hasViewportMeta = $('meta[name="viewport"]').length > 0;

  // Canonical
  const hasCanonical = $('link[rel="canonical"]').length > 0;

  // Structured data
  const structuredData: object[] = [];
  const structuredDataTypes: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '');
      structuredData.push(data);

      // Extract @type
      if (data['@type']) {
        structuredDataTypes.push(data['@type']);
      }
      if (Array.isArray(data['@graph'])) {
        data['@graph'].forEach((item: any) => {
          if (item['@type']) {
            structuredDataTypes.push(item['@type']);
          }
        });
      }
    } catch {
      // Invalid JSON-LD
    }
  });

  // Copyright year
  const copyrightMatch = bodyText.match(/©\s*(\d{4})|copyright\s*(\d{4})|&copy;\s*(\d{4})/i);
  const copyrightYear = copyrightMatch
    ? parseInt(copyrightMatch[1] || copyrightMatch[2] || copyrightMatch[3])
    : null;

  // Contact form detection
  const hasContactForm = $('form').length > 0 ||
    lowerHtml.includes('contact-form') ||
    lowerHtml.includes('kontaktní formulář');

  // Phone detection (Czech format)
  const hasPhone = /(\+420|00420)?\s*\d{3}\s*\d{3}\s*\d{3}/.test(bodyText) ||
    $('a[href^="tel:"]').length > 0;

  // Email detection
  const hasEmail = $('a[href^="mailto:"]').length > 0 ||
    /[\w.-]+@[\w.-]+\.\w{2,}/.test(bodyText);

  // WhatsApp detection
  const hasWhatsApp = /whatsapp|wa\.me/i.test(lowerHtml) ||
    $('a[href*="wa.me"]').length > 0 ||
    $('a[href*="whatsapp"]').length > 0;

  // FAQ detection
  const hasFaqSection = /faq|často\s*kladené|dotazy|otázky\s*a\s*odpovědi/i.test(bodyText) ||
    $('[itemtype*="FAQPage"]').length > 0 ||
    $('.faq, #faq, .accordion').length > 0;

  // Q&A format detection (question-answer pattern)
  const hasQaFormat = $('details, summary').length > 0 ||
    $('[data-accordion]').length > 0;

  // Address detection
  const hasAddress = /Praha|Brno|Ostrava|Plzeň|Liberec|Olomouc|\d{3}\s*\d{2}/.test(bodyText) ||
    $('[itemtype*="PostalAddress"]').length > 0 ||
    lowerHtml.includes('street-address') ||
    lowerHtml.includes('adresa');

  // Pricing detection
  const hasPricing = /ceník|ceny|kč|czk|\d+\s*,-|\d+\s*Kč/i.test(bodyText) ||
    lowerHtml.includes('price') ||
    lowerHtml.includes('pricing');

  // Opening hours detection
  const hasOpeningHours = /otevírací\s*doba|provozní\s*doba|opening\s*hours|\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/i.test(bodyText) ||
    $('[itemtype*="OpeningHoursSpecification"]').length > 0;

  // Booking system detection
  const hasBookingSystem = /rezervace|booking|objednat|zarezervovat|book\s*now/i.test(bodyText) ||
    lowerHtml.includes('booking') ||
    lowerHtml.includes('reservation') ||
    $('input[type="date"], input[type="datetime-local"]').length > 0 ||
    $('.booking, #booking, .reservation').length > 0;

  // CSS feature detection (check inline styles and stylesheets)
  const usesFlexbox = /display:\s*flex|display:flex/i.test(html);
  const usesGrid = /display:\s*grid|display:grid/i.test(html);

  // Webfonts detection
  const usesWebfonts = lowerHtml.includes('fonts.googleapis.com') ||
    lowerHtml.includes('fonts.gstatic.com') ||
    lowerHtml.includes('@font-face') ||
    lowerHtml.includes('typekit') ||
    lowerHtml.includes('use.fontawesome');

  // CMS detection
  let cmsDetected: string | null = null;
  if (lowerHtml.includes('wp-content') || lowerHtml.includes('wordpress')) {
    cmsDetected = 'wordpress';
  } else if (lowerHtml.includes('wix.com')) {
    cmsDetected = 'wix';
  } else if (lowerHtml.includes('squarespace')) {
    cmsDetected = 'squarespace';
  } else if (lowerHtml.includes('shopify')) {
    cmsDetected = 'shopify';
  } else if (lowerHtml.includes('webflow')) {
    cmsDetected = 'webflow';
  } else if (lowerHtml.includes('_next/static') || lowerHtml.includes('__next')) {
    cmsDetected = 'nextjs';
  }

  // About/Contact page detection (check links)
  const allLinks = $('a').map((_, el) => $(el).attr('href') || '').get();
  const hasAboutPage = allLinks.some(link =>
    /o-nas|about|uber-uns|o-salonu|o-mne/i.test(link)
  );
  const hasContactPage = allLinks.some(link =>
    /kontakt|contact|kontakte/i.test(link)
  );

  return {
    title,
    titleLength,
    metaDescription,
    descriptionLength,
    h1,
    h1Count,
    hasProperHeadingStructure,
    images,
    imagesWithAlt,
    totalImages,
    hasViewportMeta,
    hasCanonical,
    structuredData,
    structuredDataTypes,
    copyrightYear,
    hasContactForm,
    hasPhone,
    hasEmail,
    hasWhatsApp,
    hasFaqSection,
    hasQaFormat,
    hasAddress,
    hasPricing,
    hasOpeningHours,
    hasBookingSystem,
    usesFlexbox,
    usesGrid,
    usesWebfonts,
    cmsDetected,
    hasAboutPage,
    hasContactPage,
  };
}

/**
 * Build full AnalysisDetails from parsed HTML and other data
 */
export function buildAnalysisDetails(
  parsedHtml: ParsedHtmlData,
  pageSpeedMetrics: {
    lcp: number;
    fcp: number;
    ttfb: number;
    cls: number;
    tbt: number;
    performanceScore: number;
  },
  securityData: {
    hasHttps: boolean;
    hasMixedContent: boolean;
    hasSecurityHeaders: boolean;
    validCertificate: boolean;
  },
  hasSitemap: boolean,
  hasRobotsTxt: boolean
): AnalysisDetails {
  const currentYear = new Date().getFullYear();

  // Estimate image quality based on images found
  // This is a rough heuristic - real implementation would analyze actual images
  let imageQuality: 'high' | 'medium' | 'low' | 'unknown' = 'unknown';
  if (parsedHtml.totalImages > 0) {
    // If most images have proper alt text, assume decent quality
    const altRatio = parsedHtml.imagesWithAlt / parsedHtml.totalImages;
    if (altRatio > 0.8) {
      imageQuality = 'medium';
    } else {
      imageQuality = 'low';
    }
  }

  // Check for LocalBusiness schema
  const hasLocalBusinessSchema = parsedHtml.structuredDataTypes.some(type =>
    /LocalBusiness|MassageEstablishment|HealthAndBeautyBusiness/i.test(type)
  );
  const hasAnySchema = parsedHtml.structuredData.length > 0;

  // Estimate content year from copyright or default to previous year
  const contentYear = parsedHtml.copyrightYear || (currentYear - 2);

  // Natural language score (heuristic - based on presence of structured content)
  const naturalLanguageScore =
    (parsedHtml.hasFaqSection ? 0.3 : 0) +
    (parsedHtml.metaDescription ? 0.2 : 0) +
    (parsedHtml.h1 ? 0.2 : 0) +
    (parsedHtml.totalImages > 5 ? 0.15 : 0) +
    (parsedHtml.hasContactForm ? 0.15 : 0);

  // Estimate text readability and touch targets (defaults based on viewport meta)
  const textReadable = parsedHtml.hasViewportMeta;
  const touchTargetsOk = parsedHtml.hasViewportMeta;
  const hasHorizontalScroll = !parsedHtml.hasViewportMeta;
  const hasResponsiveImages = parsedHtml.hasViewportMeta && parsedHtml.totalImages > 0;

  // Statistics detection (look for numbers in content)
  const hasStatistics = parsedHtml.hasPricing || parsedHtml.hasOpeningHours;

  return {
    // Speed metrics
    lcp: pageSpeedMetrics.lcp,
    fcp: pageSpeedMetrics.fcp,
    ttfb: pageSpeedMetrics.ttfb,
    cls: pageSpeedMetrics.cls,
    tbt: pageSpeedMetrics.tbt,
    pageSpeedScore: pageSpeedMetrics.performanceScore,

    // Mobile
    hasViewportMeta: parsedHtml.hasViewportMeta,
    hasResponsiveImages,
    touchTargetsOk,
    hasHorizontalScroll,
    textReadable,

    // Security
    hasHttps: securityData.hasHttps,
    hasMixedContent: securityData.hasMixedContent,
    hasSecurityHeaders: securityData.hasSecurityHeaders,
    validCertificate: securityData.validCertificate,

    // SEO
    title: parsedHtml.title,
    titleLength: parsedHtml.titleLength,
    metaDescription: parsedHtml.metaDescription,
    descriptionLength: parsedHtml.descriptionLength,
    h1: parsedHtml.h1,
    h1Count: parsedHtml.h1Count,
    hasProperHeadingStructure: parsedHtml.hasProperHeadingStructure,
    imagesWithAlt: parsedHtml.imagesWithAlt,
    totalImages: parsedHtml.totalImages,
    hasSitemap,
    hasRobotsTxt,
    hasCanonical: parsedHtml.hasCanonical,
    hasStructuredData: hasAnySchema,
    structuredDataTypes: parsedHtml.structuredDataTypes,

    // GEO
    hasFaqSection: parsedHtml.hasFaqSection,
    hasQaFormat: parsedHtml.hasQaFormat,
    hasLocalBusinessSchema,
    hasAnySchema,
    hasAddress: parsedHtml.hasAddress,
    hasOpeningHours: parsedHtml.hasOpeningHours,
    hasPricing: parsedHtml.hasPricing,
    hasStatistics,
    contentYear,
    hasAboutPage: parsedHtml.hasAboutPage,
    hasContactPage: parsedHtml.hasContactPage,
    naturalLanguageScore,

    // Design
    copyrightYear: parsedHtml.copyrightYear,
    usesFlexbox: parsedHtml.usesFlexbox,
    usesGrid: parsedHtml.usesGrid,
    usesWebfonts: parsedHtml.usesWebfonts,
    imageQuality,
    hasBookingSystem: parsedHtml.hasBookingSystem,
    hasPhone: parsedHtml.hasPhone,
    hasWhatsApp: parsedHtml.hasWhatsApp,
    hasContactForm: parsedHtml.hasContactForm,
    hasEmail: parsedHtml.hasEmail,
    cmsDetected: parsedHtml.cmsDetected,
  };
}
