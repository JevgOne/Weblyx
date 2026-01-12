// EroWeb Recommendation Generator
// Generates personalized recommendations based on analysis results

import type {
  AnalysisScores,
  AnalysisDetails,
  BusinessType,
  PackageType,
  EroWebPackage
} from '@/types/eroweb';
import {
  getScoreCategory,
  SCORE_DESCRIPTIONS,
  EROWEB_PACKAGES,
  BUSINESS_TYPE_LABELS,
  formatPriceRange
} from '@/types/eroweb';

/**
 * Generate recommendation text based on analysis
 */
export function generateRecommendation(
  scores: AnalysisScores,
  businessType: BusinessType,
  recommendedPackage: PackageType
): string {
  const category = getScoreCategory(scores.total);
  const baseDescription = SCORE_DESCRIPTIONS[category];
  const pkg = EROWEB_PACKAGES[recommendedPackage];
  const businessLabel = BUSINESS_TYPE_LABELS[businessType];

  let recommendation = baseDescription + '\n\n';

  // Add specific recommendations based on weak areas
  const weakAreas: string[] = [];

  if (scores.speed < 10) weakAreas.push('rychlost načítání');
  if (scores.mobile < 8) weakAreas.push('mobilní optimalizace');
  if (scores.security < 5) weakAreas.push('zabezpečení');
  if (scores.seo < 10) weakAreas.push('SEO');
  if (scores.geo < 8) weakAreas.push('optimalizace pro AI vyhledávače');
  if (scores.design < 10) weakAreas.push('design a UX');

  if (weakAreas.length > 0) {
    recommendation += `Hlavní oblasti ke zlepšení: ${weakAreas.join(', ')}.\n\n`;
  }

  // Individual pricing approach (no specific packages)
  recommendation += `Ceník je individuální podle rozsahu prací. Pro váš typ podnikání (${businessLabel}) připravíme nabídku přesně na míru.`;

  return recommendation;
}

/**
 * Generate package recommendation text for email/PDF
 */
export function generatePackageRecommendationText(
  recommendedPackage: PackageType,
  scores: AnalysisScores,
  businessType: BusinessType
): string {
  const pkg = EROWEB_PACKAGES[recommendedPackage];
  const category = getScoreCategory(scores.total);

  const header = `🎯 NAŠE DOPORUČENÍ: ${pkg.name}`;
  const divider = '━'.repeat(42);

  let text = `${header}\n\n`;

  if (recommendedPackage === 'basic') {
    text += `Vzhledem ke stavu vašeho současného webu doporučujeme
začít s balíčkem ${pkg.name}.

${divider}
💰 CENA: ${formatPriceRange(pkg.priceMin, pkg.priceMax)} (jednorázově)
⏱️ DODÁNÍ: ${pkg.deliveryTime}
${divider}

Co získáte:
${pkg.features.map(f => `• ${f}`).join('\n')}

Proč investovat:
${divider}
Váš současný web vás stojí zákazníky každý den.
Za jednorázovou investici získáte web, který bude
pracovat pro vás 24/7.

Srovnání s konkurencí:
• Běžná agentura: 40 000 - 80 000 Kč
• Weblyx: ${formatPriceRange(pkg.priceMin, pkg.priceMax)}
• ÚSPORA: až 70%

💡 TIP: Pokud plánujete růst nebo máte více dívek,
zvažte rovnou EroWeb PREMIUM s online rezervacemi
a profily - ušetříte za pozdější upgrade.`;

  } else if (recommendedPackage === 'premium') {
    text += `Pro váš typ podnikání doporučujeme kompletní řešení
${pkg.name} s rezervačním systémem a profily.

${divider}
💰 CENA: ${formatPriceRange(pkg.priceMin, pkg.priceMax)} (jednorázově)
⏱️ DODÁNÍ: ${pkg.deliveryTime}
${divider}

Co získáte navíc oproti běžným webům:
${pkg.features.slice(0, 12).map(f => `• ✅ ${f}`).join('\n')}

Proč PREMIUM:
${divider}
Online rezervace zvyšují počet zákazníků o 25-40%.
Mnoho klientů preferuje rezervaci bez telefonování -
zejména u diskrétních služeb.

Optimalizace pro AI vyhledávače (GEO) zajistí,
že vás doporučí ChatGPT a další AI asistenti,
které dnes používá přes 400 milionů lidí týdně.

Srovnání s konkurencí:
• Běžná agentura: 80 000 - 150 000 Kč
• Weblyx: ${formatPriceRange(pkg.priceMin, pkg.priceMax)}
• ÚSPORA: až 60%

ROI (návratnost investice):
${divider}
Při průměrné útratě 2 500 Kč na klienta stačí
získat 20-24 nových zákazníků a investice se vrátí.
S online rezervacemi to může být otázka 1-2 měsíců.`;

  } else if (recommendedPackage === 'enterprise') {
    text += `Pro vaši velikost operace doporučujeme kompletní
řešení ${pkg.name} s mobilní aplikací.

${divider}
💰 CENA: ${formatPriceRange(pkg.priceMin, pkg.priceMax)} (jednorázově)
⏱️ DODÁNÍ: ${pkg.deliveryTime}
${divider}

Co získáte:
${pkg.features.map(f => `• ✅ ${f}`).join('\n')}

Proč ENTERPRISE:
${divider}
PWA mobilní aplikace umožňuje:
• Každé dívce vlastní přístup a přehled rezervací
• Push notifikace o nových rezervacích
• Dashboard pro management s přehledem výkonnosti
• Statistiky a reporty

S více než 10 dívkami potřebujete systém, který
škáluje. ENTERPRISE řeší správu personálu,
rezervace a komunikaci na jednom místě.

Srovnání s konkurencí:
• Vlastní vývoj: 300 000 - 500 000 Kč
• Weblyx ENTERPRISE: ${formatPriceRange(pkg.priceMin, pkg.priceMax)}
• ÚSPORA: až 70%

ROI (návratnost investice):
${divider}
S optimalizovaným systémem a aplikací můžete
zvýšit kapacitu o 20-30% bez dodatečného stresu.
Investice se vrátí během 2-4 měsíců.`;
  }

  return text;
}

/**
 * Generate comparison table text
 */
export function generateComparisonTable(): string {
  const basic = EROWEB_PACKAGES.basic;
  const premium = EROWEB_PACKAGES.premium;
  const enterprise = EROWEB_PACKAGES.enterprise;

  return `
SROVNÁNÍ BALÍČKŮ
${'━'.repeat(60)}

| Funkce                    | BASIC      | PREMIUM    | ENTERPRISE |
|---------------------------|------------|------------|------------|
| Cena                      | od ${(basic.priceMin/1000).toFixed(0)}k Kč  | od ${(premium.priceMin/1000).toFixed(0)}k Kč  | od ${(enterprise.priceMin/1000).toFixed(0)}k Kč |
| Počet stránek             | 5-7        | 10-15      | 15+        |
| Responzivní design        | ✅         | ✅         | ✅         |
| Rychlost pod 2s           | ✅         | ✅         | ✅         |
| Online rezervace          | ❌         | ✅         | ✅         |
| Profily dívek             | ❌         | ✅         | ✅         |
| Admin panel               | ❌         | ✅         | ✅         |
| Mobilní aplikace (PWA)    | ❌         | ❌         | ✅         |
| Oddělené účty pro dívky   | ❌         | ❌         | ✅         |
| Push notifikace           | ❌         | ❌         | ✅         |
| SEO optimalizace          | Základní   | Kompletní  | Kompletní  |
| GEO/AIEO                  | ❌         | ✅         | ✅         |
| Vícejazyčnost             | ❌         | 2 jazyky   | 3 jazyky   |
| Podpora po spuštění       | 14 dní     | 30 dní     | 60 dní     |
| Dodání                    | 5-7 dní    | 2-4 týdny  | 4-6 týdnů  |
`;
}

/**
 * Get package upgrade benefits
 */
export function getUpgradeBenefits(
  currentPackage: PackageType,
  targetPackage: PackageType
): string[] {
  const current = EROWEB_PACKAGES[currentPackage];
  const target = EROWEB_PACKAGES[targetPackage];

  // Features in target but not in current
  const currentFeatures = new Set(current.features);
  return target.features.filter(f => !currentFeatures.has(f) && !f.startsWith('Vše z'));
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
