// EroWeb Scoring Algorithms
// Based on specification v1.1

import type { AnalysisDetails, AnalysisScores, PageSpeedMetrics } from '@/types/eroweb';

/**
 * Calculate Speed & Performance score (max 20 points)
 */
export function calculateSpeedScore(metrics: PageSpeedMetrics): number {
  let score = 0;

  // LCP - Largest Contentful Paint (max 8 points)
  if (metrics.lcp < 2500) score += 8;
  else if (metrics.lcp < 4000) score += 5;
  else if (metrics.lcp < 6000) score += 2;

  // FCP - First Contentful Paint (max 5 points)
  if (metrics.fcp < 1800) score += 5;
  else if (metrics.fcp < 3000) score += 3;
  else if (metrics.fcp < 5000) score += 1;

  // TTFB - Time to First Byte (max 4 points)
  if (metrics.ttfb < 800) score += 4;
  else if (metrics.ttfb < 1800) score += 2;

  // CLS - Cumulative Layout Shift (max 3 points)
  if (metrics.cls < 0.1) score += 3;
  else if (metrics.cls < 0.25) score += 1;

  return Math.min(score, 20);
}

/**
 * Calculate Mobile Optimization score (max 15 points)
 */
export function calculateMobileScore(details: AnalysisDetails): number {
  let score = 0;

  // Viewport meta tag (4 points)
  if (details.hasViewportMeta) score += 4;

  // Responsive images (3 points)
  if (details.hasResponsiveImages) score += 3;

  // Touch targets OK (3 points)
  if (details.touchTargetsOk) score += 3;

  // No horizontal scroll (3 points)
  if (!details.hasHorizontalScroll) score += 3;

  // Text readable without zoom (2 points)
  if (details.textReadable) score += 2;

  return Math.min(score, 15);
}

/**
 * Calculate Security score (max 10 points)
 */
export function calculateSecurityScore(details: AnalysisDetails): number {
  let score = 0;

  // HTTPS (5 points - critical)
  if (details.hasHttps) score += 5;

  // No mixed content (2 points)
  if (!details.hasMixedContent) score += 2;

  // Security headers (2 points)
  if (details.hasSecurityHeaders) score += 2;

  // Valid certificate (1 point)
  if (details.validCertificate) score += 1;

  return Math.min(score, 10);
}

/**
 * Calculate SEO score (max 20 points)
 */
export function calculateSeoScore(details: AnalysisDetails): number {
  let score = 0;

  // Title tag (3 points)
  if (details.title) {
    score += 1;
    if (details.titleLength >= 50 && details.titleLength <= 60) score += 2;
    else if (details.titleLength >= 30 && details.titleLength <= 70) score += 1;
  }

  // Meta description (3 points)
  if (details.metaDescription) {
    score += 1;
    if (details.descriptionLength >= 150 && details.descriptionLength <= 160) score += 2;
    else if (details.descriptionLength >= 100 && details.descriptionLength <= 200) score += 1;
  }

  // H1 (2 points)
  if (details.h1) score += 1;
  if (details.h1Count === 1) score += 1; // Only one H1

  // Heading structure (2 points)
  if (details.hasProperHeadingStructure) score += 2;

  // Alt texts (2 points)
  if (details.totalImages > 0) {
    const altRatio = details.imagesWithAlt / details.totalImages;
    if (altRatio >= 0.9) score += 2;
    else if (altRatio >= 0.5) score += 1;
  } else {
    score += 2; // No images = no alt problem
  }

  // Sitemap (2 points)
  if (details.hasSitemap) score += 2;

  // Robots.txt (1 point)
  if (details.hasRobotsTxt) score += 1;

  // Canonical URL (2 points)
  if (details.hasCanonical) score += 2;

  // Structured data (3 points)
  if (details.hasStructuredData) score += 3;

  return Math.min(score, 20);
}

/**
 * Calculate GEO (Generative Engine Optimization) score (max 15 points)
 * For AI search engines: ChatGPT, Perplexity, Google AI Overviews
 */
export function calculateGeoScore(details: AnalysisDetails): number {
  let score = 0;

  // FAQ section or Q&A format (3 points)
  if (details.hasFaqSection) score += 3;
  else if (details.hasQaFormat) score += 1;

  // Structured data (2 points)
  if (details.hasLocalBusinessSchema) score += 2;
  else if (details.hasAnySchema) score += 1;

  // Concrete information (3 points)
  if (details.hasAddress) score += 1;
  if (details.hasOpeningHours) score += 1;
  if (details.hasPricing) score += 1;

  // Statistics and numbers in content (2 points)
  if (details.hasStatistics) score += 2;

  // Content freshness - copyright year or date (2 points)
  const currentYear = new Date().getFullYear();
  if (details.contentYear >= currentYear - 1) score += 2;
  else if (details.contentYear >= currentYear - 2) score += 1;

  // About/Contact page (2 points)
  if (details.hasAboutPage) score += 1;
  if (details.hasContactPage) score += 1;

  // Natural language vs keyword stuffing (1 point)
  if (details.naturalLanguageScore > 0.7) score += 1;

  return Math.min(score, 15);
}

/**
 * Calculate Design & UX score (max 20 points)
 */
export function calculateDesignScore(details: AnalysisDetails): number {
  let score = 0;

  // Visual age based on copyright year (4 points)
  const currentYear = new Date().getFullYear();
  if (details.copyrightYear) {
    if (details.copyrightYear >= currentYear - 1) score += 4;
    else if (details.copyrightYear >= currentYear - 3) score += 2;
    else if (details.copyrightYear >= currentYear - 5) score += 1;
  }

  // Modern CSS (2 points)
  if (details.usesFlexbox || details.usesGrid) score += 2;

  // Webfonts (2 points)
  if (details.usesWebfonts) score += 2;

  // Image quality (6 points)
  switch (details.imageQuality) {
    case 'high': score += 6; break;
    case 'medium': score += 3; break;
    case 'low': score += 1; break;
  }

  // Booking system (2 points)
  if (details.hasBookingSystem) score += 2;

  // Contact options (2 points)
  if (details.hasPhone) score += 0.5;
  if (details.hasWhatsApp) score += 0.5;
  if (details.hasContactForm) score += 0.5;
  if (details.hasEmail) score += 0.5;

  // Clear pricing (2 points)
  if (details.hasPricing) score += 2;

  return Math.min(Math.round(score), 20);
}

/**
 * Calculate all scores from analysis details
 */
export function calculateAllScores(details: AnalysisDetails): AnalysisScores {
  const metrics: PageSpeedMetrics = {
    lcp: details.lcp,
    fcp: details.fcp,
    ttfb: details.ttfb,
    cls: details.cls,
    tbt: details.tbt,
    performanceScore: details.pageSpeedScore,
  };

  const speed = calculateSpeedScore(metrics);
  const mobile = calculateMobileScore(details);
  const security = calculateSecurityScore(details);
  const seo = calculateSeoScore(details);
  const geo = calculateGeoScore(details);
  const design = calculateDesignScore(details);

  return {
    speed,
    mobile,
    security,
    seo,
    geo,
    design,
    total: speed + mobile + security + seo + geo + design,
  };
}

/**
 * Get default/empty analysis details
 */
export function getDefaultAnalysisDetails(): AnalysisDetails {
  return {
    // Speed
    lcp: 0,
    fcp: 0,
    ttfb: 0,
    cls: 0,
    tbt: 0,
    pageSpeedScore: 0,

    // Mobile
    hasViewportMeta: false,
    hasResponsiveImages: false,
    touchTargetsOk: false,
    hasHorizontalScroll: false,
    textReadable: false,

    // Security
    hasHttps: false,
    hasMixedContent: false,
    hasSecurityHeaders: false,
    validCertificate: false,

    // SEO
    title: null,
    titleLength: 0,
    metaDescription: null,
    descriptionLength: 0,
    h1: null,
    h1Count: 0,
    hasProperHeadingStructure: false,
    imagesWithAlt: 0,
    totalImages: 0,
    hasSitemap: false,
    hasRobotsTxt: false,
    hasCanonical: false,
    hasStructuredData: false,
    structuredDataTypes: [],

    // GEO
    hasFaqSection: false,
    hasQaFormat: false,
    hasLocalBusinessSchema: false,
    hasAnySchema: false,
    hasAddress: false,
    hasOpeningHours: false,
    hasPricing: false,
    hasStatistics: false,
    contentYear: 0,
    hasAboutPage: false,
    hasContactPage: false,
    naturalLanguageScore: 0,

    // Design
    copyrightYear: null,
    usesFlexbox: false,
    usesGrid: false,
    usesWebfonts: false,
    imageQuality: 'unknown',
    hasBookingSystem: false,
    hasPhone: false,
    hasWhatsApp: false,
    hasContactForm: false,
    hasEmail: false,
    cmsDetected: null,
  };
}
