import {
  ProjectType,
  DesignStyle,
  BrandingStatus,
  Timeline,
  PriceResult,
  PriceBreakdownItem,
} from './types';

// Base prices matching existing pricing-calculator.tsx
const BASE_PRICES: Record<ProjectType, { min: number; max: number; label: string; days: { min: number; max: number } }> = {
  landing: { min: 7990, max: 9990, label: 'Landing Page', days: { min: 3, max: 5 } },
  basic: { min: 9990, max: 14990, label: 'Firemní web', days: { min: 5, max: 7 } },
  standard: { min: 24990, max: 34990, label: 'Rozšířený web', days: { min: 7, max: 14 } },
  eshop: { min: 49990, max: 69990, label: 'E-shop / Aplikace', days: { min: 14, max: 21 } },
};

// Feature prices matching existing add-ons
const FEATURE_PRICES: Record<string, { price: number; label: string }> = {
  blog: { price: 3000, label: 'Blog s CMS' },
  booking: { price: 5000, label: 'Rezervační systém' },
  newsletter: { price: 2000, label: 'Newsletter integrace' },
  'advanced-seo': { price: 3000, label: 'Pokročilé SEO' },
  multilang: { price: 4000, label: 'Vícejazyčnost' },
  animations: { price: 3500, label: 'Pokročilé animace' },
  'custom-cms': { price: 5000, label: 'Custom CMS' },
  payment: { price: 4000, label: 'Platební brána' },
  gallery: { price: 2000, label: 'Galerie / Portfolio' },
  'live-chat': { price: 1500, label: 'Live chat' },
};

const DESIGN_MULTIPLIERS: Record<DesignStyle, number> = {
  minimal: 1.0,
  creative: 1.10,
  corporate: 1.05,
  undecided: 1.05,
};

const BRANDING_COSTS: Record<BrandingStatus, number> = {
  'has-branding': 0,
  'has-logo': 2000,
  'needs-everything': 4000,
};

const TIMELINE_MULTIPLIERS: Record<Timeline, { multiplier: number; label: string }> = {
  urgent: { multiplier: 1.20, label: 'Express příplatek (+20%)' },
  normal: { multiplier: 1.0, label: '' },
  relaxed: { multiplier: 0.95, label: 'Sleva za flexibilitu (-5%)' },
  flexible: { multiplier: 0.90, label: 'Sleva za flexibilitu (-10%)' },
};

const INCLUDED_FEATURES: Record<ProjectType, string[]> = {
  landing: [
    'Responzivní design',
    'Kontaktní formulář',
    'SEO základy',
    'Google Analytics',
    '1 měsíc podpora',
  ],
  basic: [
    'Responzivní design',
    'Kontaktní formulář',
    'Pokročilé SEO',
    'Google Analytics',
    'Napojení na sociální sítě',
    '2 měsíce podpora',
  ],
  standard: [
    'Premium design na míru',
    'Responzivní design',
    'Kompletní CMS',
    'Pokročilé SEO & Analytics',
    '3 měsíce podpora',
    '2h úprav zdarma',
  ],
  eshop: [
    'Kompletní e-shop řešení',
    'Responzivní design',
    'Správa produktů',
    'Platební brána',
    'Pokročilé SEO & Analytics',
    '3 měsíce podpora',
    '5h úprav zdarma',
  ],
};

// Round to Czech pricing pattern (X 990)
function roundToCzechPrice(price: number): number {
  return Math.round(price / 1000) * 1000 - 10;
}

export interface CalculateInput {
  projectType: ProjectType;
  features: string[];
  designStyle: DesignStyle;
  brandingStatus: BrandingStatus;
  timeline: Timeline;
}

export function calculatePrice(input: CalculateInput): PriceResult {
  const base = BASE_PRICES[input.projectType];
  const breakdown: PriceBreakdownItem[] = [];

  // 1. Base price
  breakdown.push({
    label: base.label,
    amount: base.min,
    type: 'base',
  });

  // 2. Features
  let featuresTotal = 0;
  for (const featureId of input.features) {
    const feature = FEATURE_PRICES[featureId];
    if (feature) {
      featuresTotal += feature.price;
      breakdown.push({
        label: feature.label,
        amount: feature.price,
        type: 'feature',
      });
    }
  }

  // 3. Branding cost
  const brandingCost = BRANDING_COSTS[input.brandingStatus];
  if (brandingCost > 0) {
    breakdown.push({
      label: input.brandingStatus === 'has-logo' ? 'Tvorba vizuální identity' : 'Kompletní branding',
      amount: brandingCost,
      type: 'modifier',
    });
  }

  // 4. Calculate subtotals
  const subtotalMin = base.min + featuresTotal + brandingCost;
  const subtotalMax = base.max + featuresTotal + brandingCost;

  // 5. Apply design multiplier
  const designMult = DESIGN_MULTIPLIERS[input.designStyle];

  // 6. Apply timeline multiplier
  const timelineMod = TIMELINE_MULTIPLIERS[input.timeline];
  if (timelineMod.label) {
    const timelineAmount = Math.round(subtotalMin * (timelineMod.multiplier - 1));
    breakdown.push({
      label: timelineMod.label,
      amount: timelineAmount,
      type: 'modifier',
    });
  }

  const combinedMult = designMult * timelineMod.multiplier;

  // 7. Final totals
  const totalMin = roundToCzechPrice(subtotalMin * combinedMult);
  const totalMax = roundToCzechPrice(subtotalMax * combinedMult);

  // 8. Estimated delivery days
  const baseDays = base.days;
  const featureCount = input.features.length;
  const extraDays = Math.ceil(featureCount / 2);
  const timelineDaysMult = input.timeline === 'urgent' ? 0.7 : input.timeline === 'relaxed' ? 1.3 : input.timeline === 'flexible' ? 1.5 : 1.0;

  const estimatedDays = {
    min: Math.round((baseDays.min + extraDays) * timelineDaysMult),
    max: Math.round((baseDays.max + extraDays) * timelineDaysMult),
  };

  return {
    totalMin: Math.max(totalMin, 4990),
    totalMax: Math.max(totalMax, totalMin + 1000),
    breakdown,
    estimatedDays,
    recommendedPackage: base.label,
    includedFeatures: INCLUDED_FEATURES[input.projectType],
  };
}

export { FEATURE_PRICES, BASE_PRICES };
