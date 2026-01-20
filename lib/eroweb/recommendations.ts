// EroWeb Recommendation Generator
// Generates personalized recommendations based on analysis results with i18n support

import type {
  AnalysisScores,
  AnalysisDetails,
  BusinessType,
  PackageType,
  EroWebPackage
} from '@/types/eroweb';
import {
  getScoreCategory,
  EROWEB_PACKAGES,
  formatPriceRange
} from '@/types/eroweb';
import {
  RecommendationLocale,
  SCORE_DESCRIPTIONS_I18N,
  WEAK_AREA_LABELS_I18N,
  RECOMMENDATION_TEXTS_I18N,
  PACKAGE_NAMES_I18N,
  PACKAGE_FEATURES_I18N,
  COMPARISON_TABLE_I18N,
} from './recommendation-translations';
import { BUSINESS_TYPE_LABELS_I18N } from './finding-translations';

/**
 * Generate recommendation text based on analysis
 */
export function generateRecommendation(
  scores: AnalysisScores,
  businessType: BusinessType,
  recommendedPackage: PackageType,
  language: RecommendationLocale = 'cs'
): string {
  const category = getScoreCategory(scores.total);
  const baseDescription = SCORE_DESCRIPTIONS_I18N[language][category];
  const businessLabel = BUSINESS_TYPE_LABELS_I18N[language][businessType];
  const t = RECOMMENDATION_TEXTS_I18N[language];
  const weakLabels = WEAK_AREA_LABELS_I18N[language];

  let recommendation = baseDescription + '\n\n';

  // Add specific recommendations based on weak areas
  const weakAreas: string[] = [];

  if (scores.speed < 10) weakAreas.push(weakLabels.speed);
  if (scores.mobile < 8) weakAreas.push(weakLabels.mobile);
  if (scores.security < 5) weakAreas.push(weakLabels.security);
  if (scores.seo < 10) weakAreas.push(weakLabels.seo);
  if (scores.geo < 8) weakAreas.push(weakLabels.geo);
  if (scores.design < 10) weakAreas.push(weakLabels.design);

  if (weakAreas.length > 0) {
    recommendation += `${t.mainAreasToImprove}: ${weakAreas.join(', ')}.\n\n`;
  }

  // Individual pricing approach (no specific packages)
  recommendation += `${t.pricingIndividual} (${businessLabel}) ${t.customOffer}`;

  return recommendation;
}

/**
 * Generate package recommendation text for email/PDF
 */
export function generatePackageRecommendationText(
  recommendedPackage: PackageType,
  scores: AnalysisScores,
  businessType: BusinessType,
  language: RecommendationLocale = 'cs'
): string {
  const pkg = EROWEB_PACKAGES[recommendedPackage];
  const pkgName = PACKAGE_NAMES_I18N[language][recommendedPackage];
  const features = PACKAGE_FEATURES_I18N[recommendedPackage][language];
  const t = RECOMMENDATION_TEXTS_I18N[language];

  const header = `${t.ourRecommendation}: ${pkgName}`;
  const divider = '━'.repeat(42);

  let text = `${header}\n\n`;

  if (recommendedPackage === 'basic') {
    text += `${t.basicIntro}
${pkgName}.

${divider}
${t.price}: ${formatPriceRange(pkg.priceMin, pkg.priceMax)} (${t.oneTime})
${t.delivery}: ${pkg.deliveryTime}
${divider}

${t.whatYouGet}:
${features.map(f => `• ${f}`).join('\n')}

${t.whyInvest}:
${divider}
${t.basicWhyInvest}

${t.comparisonWithCompetition}:
• ${t.regularAgency}: 40 000 - 80 000 Kč
• Weblyx: ${formatPriceRange(pkg.priceMin, pkg.priceMax)}
• ${t.savings}: 70%

${t.tip}: ${t.basicTip}`;

  } else if (recommendedPackage === 'premium') {
    text += `${t.premiumIntro}
${pkgName} ${t.premiumSuffix}

${divider}
${t.price}: ${formatPriceRange(pkg.priceMin, pkg.priceMax)} (${t.oneTime})
${t.delivery}: ${pkg.deliveryTime}
${divider}

${t.whatYouGetExtra}:
${features.slice(0, 12).map(f => `• ✅ ${f}`).join('\n')}

${t.whyInvest}:
${divider}
${t.premiumWhyInvest}

${t.premiumGeo}

${t.comparisonWithCompetition}:
• ${t.regularAgency}: 80 000 - 150 000 Kč
• Weblyx: ${formatPriceRange(pkg.priceMin, pkg.priceMax)}
• ${t.savings}: 60%

${t.roi}:
${divider}
${t.premiumRoi}`;

  } else if (recommendedPackage === 'enterprise') {
    text += `${t.enterpriseIntro}
${pkgName} ${t.enterpriseSuffix}

${divider}
${t.price}: ${formatPriceRange(pkg.priceMin, pkg.priceMax)} (${t.oneTime})
${t.delivery}: ${pkg.deliveryTime}
${divider}

${t.whatYouGet}:
${features.map(f => `• ✅ ${f}`).join('\n')}

${t.whyInvest}:
${divider}
${t.enterpriseWhyInvest}:
• ${t.enterpriseFeature1}
• ${t.enterpriseFeature2}
• ${t.enterpriseFeature3}
• ${t.enterpriseFeature4}

${t.enterpriseScaling}

${t.comparisonWithCompetition}:
• ${t.enterpriseCustomDev}: 300 000 - 500 000 Kč
• Weblyx ENTERPRISE: ${formatPriceRange(pkg.priceMin, pkg.priceMax)}
• ${t.savings}: 70%

${t.roi}:
${divider}
${t.enterpriseRoi}`;
  }

  return text;
}

/**
 * Generate comparison table text
 */
export function generateComparisonTable(language: RecommendationLocale = 'cs'): string {
  const basic = EROWEB_PACKAGES.basic;
  const premium = EROWEB_PACKAGES.premium;
  const enterprise = EROWEB_PACKAGES.enterprise;
  const t = COMPARISON_TABLE_I18N[language];

  return `
${t.title}
${'━'.repeat(60)}

| ${t.feature}                    | BASIC      | PREMIUM    | ENTERPRISE |
|---------------------------|------------|------------|------------|
| ${t.price}                      | od ${(basic.priceMin/1000).toFixed(0)}k Kč  | od ${(premium.priceMin/1000).toFixed(0)}k Kč  | od ${(enterprise.priceMin/1000).toFixed(0)}k Kč |
| ${t.pagesCount}             | 5-7        | 10-15      | 15+        |
| ${t.responsiveDesign}        | ✅         | ✅         | ✅         |
| ${t.speedUnder2s}           | ✅         | ✅         | ✅         |
| ${t.onlineBooking}          | ❌         | ✅         | ✅         |
| ${t.girlProfiles}             | ❌         | ✅         | ✅         |
| ${t.adminPanel}               | ❌         | ✅         | ✅         |
| ${t.mobileApp}    | ❌         | ❌         | ✅         |
| ${t.separateAccounts}   | ❌         | ❌         | ✅         |
| ${t.pushNotifications}           | ❌         | ❌         | ✅         |
| ${t.seoOptimization}          | ${t.basic}   | ${t.complete}  | ${t.complete}  |
| ${t.geoAieo}                  | ❌         | ✅         | ✅         |
| ${t.multilingual}             | ❌         | 2 ${t.languages}   | 3 ${t.languages}   |
| ${t.supportAfterLaunch}       | 14 ${t.days}     | 30 ${t.days}     | 60 ${t.days}     |
| ${t.delivery}                    | 5-7 ${t.days}    | 2-4 ${t.weeks}  | 4-6 ${t.weeks}  |
`;
}

/**
 * Get package upgrade benefits
 */
export function getUpgradeBenefits(
  currentPackage: PackageType,
  targetPackage: PackageType,
  language: RecommendationLocale = 'cs'
): string[] {
  const currentFeatures = new Set(PACKAGE_FEATURES_I18N[currentPackage][language]);
  const targetFeatures = PACKAGE_FEATURES_I18N[targetPackage][language];

  // Filter out features that start with "Everything from" / "Vše z" etc
  const prefixes = ['Vše z', 'Everything from', 'Alles aus', 'Всё из'];
  return targetFeatures.filter(f =>
    !currentFeatures.has(f) &&
    !prefixes.some(prefix => f.startsWith(prefix))
  );
}

/**
 * Calculate potential ROI estimate
 */
export function calculateROIEstimate(
  packageType: PackageType,
  estimatedAverageTransaction: number = 2500
): {
  investmentMin: number;
  investmentMax: number;
  customersNeeded: number;
  estimatedPaybackMonths: string;
} {
  const pkg = EROWEB_PACKAGES[packageType];
  const avgInvestment = (pkg.priceMin + pkg.priceMax) / 2;
  const customersNeeded = Math.ceil(avgInvestment / estimatedAverageTransaction);

  let paybackMonths: string;
  if (packageType === 'basic') {
    paybackMonths = '1-2';
  } else if (packageType === 'premium') {
    paybackMonths = '2-3';
  } else {
    paybackMonths = '3-4';
  }

  return {
    investmentMin: pkg.priceMin,
    investmentMax: pkg.priceMax,
    customersNeeded,
    estimatedPaybackMonths: paybackMonths,
  };
}
