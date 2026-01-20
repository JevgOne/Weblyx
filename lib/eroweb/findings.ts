// EroWeb Findings Generator
// Generates actionable findings based on analysis details with i18n support

import type { AnalysisDetails, Finding, FindingType, BusinessType } from '@/types/eroweb';
import {
  FindingLocale,
  SPEED_FINDINGS,
  MOBILE_FINDINGS,
  SECURITY_FINDINGS,
  SEO_FINDINGS,
  GEO_FINDINGS,
  DESIGN_FINDINGS,
  BUSINESS_TYPE_LABELS_I18N,
} from './finding-translations';

let findingIdCounter = 0;

function createFinding(
  type: FindingType,
  category: Finding['category'],
  title: string,
  description: string,
  impact: string,
  priority: number
): Finding {
  return {
    id: `finding-${++findingIdCounter}`,
    type,
    category,
    title,
    description,
    impact,
    priority,
  };
}

/**
 * Generate speed-related findings
 */
function generateSpeedFindings(details: AnalysisDetails, lang: FindingLocale): Finding[] {
  const findings: Finding[] = [];

  // LCP issues
  if (details.lcp > 6000) {
    const t = SPEED_FINDINGS.lcp_critical[lang];
    findings.push(createFinding(
      'critical',
      'speed',
      t.title,
      t.description(details.lcp),
      t.impact,
      10
    ));
  } else if (details.lcp > 4000) {
    const t = SPEED_FINDINGS.lcp_warning[lang];
    findings.push(createFinding(
      'warning',
      'speed',
      t.title,
      t.description(details.lcp),
      t.impact,
      7
    ));
  }

  // TTFB issues
  if (details.ttfb > 1800) {
    const t = SPEED_FINDINGS.ttfb_slow[lang];
    findings.push(createFinding(
      'warning',
      'speed',
      t.title,
      t.description(details.ttfb),
      t.impact,
      6
    ));
  }

  // PageSpeed score
  if (details.pageSpeedScore < 50) {
    const t = SPEED_FINDINGS.pagespeed_critical[lang];
    findings.push(createFinding(
      'critical',
      'speed',
      t.title(details.pageSpeedScore),
      t.description,
      t.impact,
      9
    ));
  } else if (details.pageSpeedScore < 70) {
    const t = SPEED_FINDINGS.pagespeed_warning[lang];
    findings.push(createFinding(
      'warning',
      'speed',
      t.title(details.pageSpeedScore),
      t.description,
      t.impact,
      5
    ));
  }

  return findings;
}

/**
 * Generate mobile-related findings
 */
function generateMobileFindings(details: AnalysisDetails, lang: FindingLocale): Finding[] {
  const findings: Finding[] = [];

  if (!details.hasViewportMeta) {
    const t = MOBILE_FINDINGS.no_viewport[lang];
    findings.push(createFinding(
      'critical',
      'mobile',
      t.title,
      t.description,
      t.impact,
      10
    ));
  }

  if (details.hasHorizontalScroll) {
    const t = MOBILE_FINDINGS.horizontal_scroll[lang];
    findings.push(createFinding(
      'warning',
      'mobile',
      t.title,
      t.description,
      t.impact,
      6
    ));
  }

  if (!details.touchTargetsOk) {
    const t = MOBILE_FINDINGS.small_touch_targets[lang];
    findings.push(createFinding(
      'warning',
      'mobile',
      t.title,
      t.description,
      t.impact,
      5
    ));
  }

  if (!details.textReadable) {
    const t = MOBILE_FINDINGS.text_not_readable[lang];
    findings.push(createFinding(
      'warning',
      'mobile',
      t.title,
      t.description,
      t.impact,
      4
    ));
  }

  return findings;
}

/**
 * Generate security-related findings
 */
function generateSecurityFindings(details: AnalysisDetails, lang: FindingLocale): Finding[] {
  const findings: Finding[] = [];

  if (!details.hasHttps) {
    const t = SECURITY_FINDINGS.no_https[lang];
    findings.push(createFinding(
      'critical',
      'security',
      t.title,
      t.description,
      t.impact,
      10
    ));
  }

  if (details.hasMixedContent) {
    const t = SECURITY_FINDINGS.mixed_content[lang];
    findings.push(createFinding(
      'warning',
      'security',
      t.title,
      t.description,
      t.impact,
      5
    ));
  }

  if (!details.hasSecurityHeaders && details.hasHttps) {
    const t = SECURITY_FINDINGS.no_security_headers[lang];
    findings.push(createFinding(
      'opportunity',
      'security',
      t.title,
      t.description,
      t.impact,
      3
    ));
  }

  return findings;
}

/**
 * Generate SEO-related findings
 */
function generateSeoFindings(details: AnalysisDetails, lang: FindingLocale): Finding[] {
  const findings: Finding[] = [];

  if (!details.title) {
    const t = SEO_FINDINGS.no_title[lang];
    findings.push(createFinding(
      'critical',
      'seo',
      t.title,
      t.description,
      t.impact,
      10
    ));
  } else if (details.titleLength > 70) {
    const t = SEO_FINDINGS.title_too_long[lang];
    findings.push(createFinding(
      'warning',
      'seo',
      t.title(details.titleLength),
      t.description,
      t.impact,
      4
    ));
  } else if (details.titleLength < 30) {
    const t = SEO_FINDINGS.title_too_short[lang];
    findings.push(createFinding(
      'warning',
      'seo',
      t.title(details.titleLength),
      t.description,
      t.impact,
      3
    ));
  }

  if (!details.metaDescription) {
    const t = SEO_FINDINGS.no_meta_description[lang];
    findings.push(createFinding(
      'critical',
      'seo',
      t.title,
      t.description,
      t.impact,
      9
    ));
  }

  if (!details.h1 || details.h1Count === 0) {
    const t = SEO_FINDINGS.no_h1[lang];
    findings.push(createFinding(
      'warning',
      'seo',
      t.title,
      t.description,
      t.impact,
      6
    ));
  } else if (details.h1Count > 1) {
    const t = SEO_FINDINGS.multiple_h1[lang];
    findings.push(createFinding(
      'warning',
      'seo',
      t.title(details.h1Count),
      t.description,
      t.impact,
      4
    ));
  }

  if (details.totalImages > 0) {
    const altRatio = details.imagesWithAlt / details.totalImages;
    const missingAlt = details.totalImages - details.imagesWithAlt;
    if (altRatio < 0.5) {
      const t = SEO_FINDINGS.images_no_alt_critical[lang];
      findings.push(createFinding(
        'critical',
        'seo',
        t.title(Math.round((1 - altRatio) * 100)),
        t.description(missingAlt, details.totalImages),
        t.impact,
        8
      ));
    } else if (altRatio < 0.9) {
      const t = SEO_FINDINGS.images_no_alt_warning[lang];
      findings.push(createFinding(
        'warning',
        'seo',
        t.title,
        t.description(missingAlt),
        t.impact,
        4
      ));
    }
  }

  if (!details.hasSitemap) {
    const t = SEO_FINDINGS.no_sitemap[lang];
    findings.push(createFinding(
      'warning',
      'seo',
      t.title,
      t.description,
      t.impact,
      5
    ));
  }

  if (!details.hasStructuredData) {
    const t = SEO_FINDINGS.no_structured_data[lang];
    findings.push(createFinding(
      'opportunity',
      'seo',
      t.title,
      t.description,
      t.impact,
      6
    ));
  }

  return findings;
}

/**
 * Generate GEO-related findings (AI Engine Optimization)
 */
function generateGeoFindings(details: AnalysisDetails, businessType: BusinessType, lang: FindingLocale): Finding[] {
  const findings: Finding[] = [];
  const businessLabel = BUSINESS_TYPE_LABELS_I18N[lang][businessType];

  if (!details.hasFaqSection && !details.hasQaFormat) {
    const t = GEO_FINDINGS.no_faq[lang];
    findings.push(createFinding(
      'warning',
      'geo',
      t.title,
      t.description,
      t.impact,
      7
    ));
  }

  if (!details.hasLocalBusinessSchema) {
    const t = GEO_FINDINGS.no_local_business_schema[lang];
    findings.push(createFinding(
      'warning',
      'geo',
      t.title,
      t.description,
      t.impact,
      6
    ));
  }

  if (!details.hasAddress && !details.hasOpeningHours) {
    const t = GEO_FINDINGS.no_business_info[lang];
    findings.push(createFinding(
      'warning',
      'geo',
      t.title,
      t.description,
      t.impact,
      5
    ));
  }

  if (!details.hasPricing) {
    const t = GEO_FINDINGS.no_pricing[lang];
    findings.push(createFinding(
      'opportunity',
      'geo',
      t.title,
      t.description,
      t.impact(businessLabel),
      4
    ));
  }

  const currentYear = new Date().getFullYear();
  if (details.contentYear < currentYear - 2) {
    const t = GEO_FINDINGS.outdated_content[lang];
    findings.push(createFinding(
      'warning',
      'geo',
      t.title,
      t.description(details.contentYear),
      t.impact,
      4
    ));
  }

  // Always add GEO opportunity for adult industry
  if (!details.hasLocalBusinessSchema || !details.hasFaqSection) {
    const t = GEO_FINDINGS.geo_opportunity[lang];
    findings.push(createFinding(
      'opportunity',
      'geo',
      t.title,
      t.description,
      t.impact,
      8
    ));
  }

  return findings;
}

/**
 * Generate design-related findings
 */
function generateDesignFindings(details: AnalysisDetails, businessType: BusinessType, lang: FindingLocale): Finding[] {
  const findings: Finding[] = [];
  const currentYear = new Date().getFullYear();

  if (details.copyrightYear && details.copyrightYear < currentYear - 5) {
    const t = DESIGN_FINDINGS.design_outdated_critical[lang];
    findings.push(createFinding(
      'critical',
      'design',
      t.title(details.copyrightYear),
      t.description,
      t.impact,
      9
    ));
  } else if (details.copyrightYear && details.copyrightYear < currentYear - 3) {
    const t = DESIGN_FINDINGS.design_outdated_warning[lang];
    findings.push(createFinding(
      'warning',
      'design',
      t.title,
      t.description,
      t.impact,
      5
    ));
  }

  if (!details.hasBookingSystem) {
    const t = DESIGN_FINDINGS.no_booking[lang];
    findings.push(createFinding(
      'warning',
      'design',
      t.title,
      t.description,
      t.impact,
      7
    ));
  }

  if (!details.hasWhatsApp && !details.hasPhone) {
    const t = DESIGN_FINDINGS.no_contact[lang];
    findings.push(createFinding(
      'critical',
      'design',
      t.title,
      t.description,
      t.impact,
      10
    ));
  } else if (!details.hasWhatsApp) {
    const t = DESIGN_FINDINGS.no_whatsapp[lang];
    findings.push(createFinding(
      'opportunity',
      'design',
      t.title,
      t.description,
      t.impact,
      5
    ));
  }

  if (!details.hasPricing) {
    const t = DESIGN_FINDINGS.pricing_unclear[lang];
    findings.push(createFinding(
      'warning',
      'design',
      t.title,
      t.description,
      t.impact,
      6
    ));
  }

  // CMS detection
  if (details.cmsDetected === 'wordpress') {
    const t = DESIGN_FINDINGS.wordpress_detected[lang];
    findings.push(createFinding(
      'opportunity',
      'design',
      t.title,
      t.description,
      t.impact,
      4
    ));
  }

  return findings;
}

/**
 * Generate all findings for an analysis
 */
export function generateFindings(
  details: AnalysisDetails,
  businessType: BusinessType,
  language: FindingLocale = 'cs'
): Finding[] {
  // Reset counter for each analysis
  findingIdCounter = 0;

  const allFindings: Finding[] = [
    ...generateSpeedFindings(details, language),
    ...generateMobileFindings(details, language),
    ...generateSecurityFindings(details, language),
    ...generateSeoFindings(details, language),
    ...generateGeoFindings(details, businessType, language),
    ...generateDesignFindings(details, businessType, language),
  ];

  // Sort by priority (highest first)
  return allFindings.sort((a, b) => b.priority - a.priority);
}

/**
 * Get findings by type
 */
export function getFindingsByType(findings: Finding[], type: FindingType): Finding[] {
  return findings.filter(f => f.type === type);
}

/**
 * Get top N findings
 */
export function getTopFindings(findings: Finding[], count: number = 5): Finding[] {
  return findings.slice(0, count);
}

/**
 * Count findings by type
 */
export function countFindings(findings: Finding[]): Record<FindingType, number> {
  return {
    critical: findings.filter(f => f.type === 'critical').length,
    warning: findings.filter(f => f.type === 'warning').length,
    opportunity: findings.filter(f => f.type === 'opportunity').length,
  };
}
