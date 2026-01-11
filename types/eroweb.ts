// EroWeb Analysis Types
// Specialized for adult industry websites (massage, privat, escort)

export type BusinessType = 'massage' | 'privat' | 'escort';

export type FindingType = 'critical' | 'warning' | 'opportunity';

export type ScoreCategory = 'critical' | 'poor' | 'average' | 'good' | 'excellent';

export type AnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'failed';

export interface Finding {
  id: string;
  type: FindingType;
  category: 'speed' | 'mobile' | 'security' | 'seo' | 'geo' | 'design';
  title: string;
  description: string;
  impact: string;
  priority: number; // 1-10, higher = more important
}

export interface AnalysisScores {
  speed: number;      // 0-20
  mobile: number;     // 0-15
  security: number;   // 0-10
  seo: number;        // 0-20
  geo: number;        // 0-15
  design: number;     // 0-20
  total: number;      // 0-100
}

export interface PageSpeedMetrics {
  lcp: number;              // Largest Contentful Paint (ms)
  fcp: number;              // First Contentful Paint (ms)
  ttfb: number;             // Time to First Byte (ms)
  cls: number;              // Cumulative Layout Shift
  tbt: number;              // Total Blocking Time (ms)
  performanceScore: number; // Google's performance score (0-100)
}

export interface AnalysisDetails {
  // Speed metrics
  lcp: number;
  fcp: number;
  ttfb: number;
  cls: number;
  tbt: number;
  pageSpeedScore: number;

  // Mobile
  hasViewportMeta: boolean;
  hasResponsiveImages: boolean;
  touchTargetsOk: boolean;
  hasHorizontalScroll: boolean;
  textReadable: boolean;

  // Security
  hasHttps: boolean;
  hasMixedContent: boolean;
  hasSecurityHeaders: boolean;
  validCertificate: boolean;

  // SEO
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  descriptionLength: number;
  h1: string | null;
  h1Count: number;
  hasProperHeadingStructure: boolean;
  imagesWithAlt: number;
  totalImages: number;
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  hasCanonical: boolean;
  hasStructuredData: boolean;
  structuredDataTypes: string[];

  // GEO (AI Engine Optimization)
  hasFaqSection: boolean;
  hasQaFormat: boolean;
  hasLocalBusinessSchema: boolean;
  hasAnySchema: boolean;
  hasAddress: boolean;
  hasOpeningHours: boolean;
  hasPricing: boolean;
  hasStatistics: boolean;
  contentYear: number;
  hasAboutPage: boolean;
  hasContactPage: boolean;
  naturalLanguageScore: number;

  // Design & UX
  copyrightYear: number | null;
  usesFlexbox: boolean;
  usesGrid: boolean;
  usesWebfonts: boolean;
  imageQuality: 'high' | 'medium' | 'low' | 'unknown';
  hasBookingSystem: boolean;
  hasPhone: boolean;
  hasWhatsApp: boolean;
  hasContactForm: boolean;
  hasEmail: boolean;
  cmsDetected: string | null;
}

export interface EroWebAnalysis {
  id: string;
  url: string;
  domain: string;
  businessType: BusinessType;
  status: AnalysisStatus;
  analyzedAt: Date | null;

  // Scores
  scores: AnalysisScores;

  // Detailed analysis data
  details: AnalysisDetails;

  // Findings
  findings: Finding[];

  // Recommendation text
  recommendation: string;
  recommendedPackage: PackageType;

  // Screenshot
  screenshotUrl: string | null;

  // Contact info (optional)
  contactName: string | null;
  contactEmail: string | null;

  // Email tracking
  emailSent: boolean;
  emailSentAt: Date | null;
  emailOpened: boolean;
  emailOpenedAt: Date | null;

  // Admin notes
  notes: string | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisFormData {
  url: string;
  businessType: BusinessType;
  contactName?: string;
  contactEmail?: string;
}

// Package pricing
export type PackageType = 'basic' | 'premium' | 'enterprise';

export interface EroWebPackage {
  id: PackageType;
  name: string;
  priceMin: number;
  priceMax: number;
  deliveryTime: string;
  features: string[];
  notIncluded: string[];
  idealFor: string;
  highlight?: string;
}

export const EROWEB_PACKAGES: Record<PackageType, EroWebPackage> = {
  basic: {
    id: 'basic',
    name: 'EroWeb BASIC',
    priceMin: 19990,
    priceMax: 24990,
    deliveryTime: '5-7 pracovních dní',
    features: [
      'Moderní responzivní design na míru',
      '5-7 stránek (úvod, o nás, služby, galerie, kontakt)',
      'Rychlost pod 2 sekundy (garantováno)',
      'HTTPS zabezpečení',
      'PageSpeed 90+',
      'WhatsApp tlačítko',
      'Kontaktní formulář',
      'Galerie až 30 fotek',
      '18+ vstupní stránka',
      'Základní SEO (meta tagy, struktura)',
      'Optimalizace pro mobily',
    ],
    notIncluded: [
      'Online rezervační systém',
      'Profily dívek/masérek s filtry',
      'Pokročilé SEO/GEO optimalizace',
      'Blog sekce',
      'Vícejazyčnost',
      'Admin panel pro správu obsahu',
    ],
    idealFor: 'Menší masážní salony, začínající podniky, jednodušší prezentace',
  },
  premium: {
    id: 'premium',
    name: 'EroWeb PREMIUM',
    priceMin: 49990,
    priceMax: 59990,
    deliveryTime: '2-4 týdny',
    features: [
      'Vše z BASIC +',
      '10-15 stránek',
      'Online rezervační systém s kalendářem',
      'Profily dívek/masérek (neomezený počet)',
      'Filtry: věk, barva vlasů, služby, jazyk',
      'Admin panel pro správu rezervací a obsahu',
      'Kompletní SEO optimalizace',
      'GEO/AIEO optimalizace pro AI vyhledávače',
      '2 jazykové verze (CZ + EN nebo DE)',
      'FAQ sekce (optimalizováno pro AI)',
      'Blog sekce',
      'Google Analytics 4 setup',
      'Synchronizace s Google Calendar',
      '30 dní priority podpory',
    ],
    notIncluded: [
      'Mobilní aplikace pro dívky',
      'Interní rezervační systém',
      'Správa personálu',
      'Finanční přehledy',
    ],
    idealFor: 'Větší salony, privátní kluby, escort agentury, podniky s více dívkami',
  },
  enterprise: {
    id: 'enterprise',
    name: 'EroWeb ENTERPRISE',
    priceMin: 119990,
    priceMax: 149990,
    deliveryTime: '2-3 měsíce',
    highlight: 'S mobilní aplikací',
    features: [
      'Vše z PREMIUM +',
      'Mobilní aplikace pro dívky (iOS + Android)',
      'Vlastní login pro každou dívku',
      'Osobní kalendář směn a rezervací',
      'Push notifikace o nových rezervacích',
      'Nastavení vlastní dostupnosti',
      'Přehled výdělků a provizí',
      'Chat s recepcí/managementem',
      'Interní rezervační systém',
      'Centrální kalendář všech dívek',
      'Správa personálu (profily, historie, docházka)',
      'Finanční přehledy (tržby, provize)',
      'CRM - klientská databáze',
      'VIP klienti s prioritním bookingem',
      'Export dat pro účetnictví',
      '60 dní priority podpory + SLA',
    ],
    notIncluded: [],
    idealFor: 'Velké agentury, řetězce salonů, salony s více dívkami',
  },
};

// Score category helpers
export const SCORE_LABELS: Record<ScoreCategory, string> = {
  critical: 'Kritický stav',
  poor: 'Podprůměrný',
  average: 'Průměrný',
  good: 'Dobrý',
  excellent: 'Výborný',
};

export const SCORE_COLORS: Record<ScoreCategory, string> = {
  critical: '#EF4444', // red-500
  poor: '#F97316',     // orange-500
  average: '#F59E0B',  // amber-500
  good: '#10B981',     // emerald-500
  excellent: '#22C55E', // green-500
};

export const SCORE_DESCRIPTIONS: Record<ScoreCategory, string> = {
  critical: `Váš web má vážné technické problémy, které aktivně odrazují potenciální klienty. Každý den bez opravy znamená ztracené zákazníky. Odhadujeme, že současný stav vás může stát až 50% potenciálních klientů.`,
  poor: `Web funguje, ale výrazně zaostává za konkurencí. Moderní zákazníci očekávají rychlost, mobilní zobrazení a profesionální vzhled. Bez modernizace budete postupně ztrácet tržní podíl.`,
  average: `Solidní základ, ale s několika úpravami můžete získat výraznou konkurenční výhodu ve vašem městě. Investice do modernizace se vrátí v podobě vyšších konverzí.`,
  good: `Nadprůměrný web s menšími nedostatky. S drobnými optimalizacemi můžete patřit mezi absolutní špičku v oboru a maximalizovat konverze.`,
  excellent: `Gratulujeme! Váš web patří mezi nejlepší v oboru. Nabízíme pokročilé funkce pro další růst - rezervační systém, AI chatbot, nebo rozšířené analytiky.`,
};

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  massage: 'erotické masáže',
  privat: 'privátní služby',
  escort: 'escort služby',
};

// Helper functions
export function getScoreCategory(score: number): ScoreCategory {
  if (score <= 30) return 'critical';
  if (score <= 50) return 'poor';
  if (score <= 70) return 'average';
  if (score <= 85) return 'good';
  return 'excellent';
}

export function getRecommendedPackage(
  businessType: BusinessType,
  totalScore: number,
  hasBookingSystem: boolean,
  estimatedGirlsCount?: number
): PackageType {
  // ENTERPRISE for large operations (10+ girls or escort agencies)
  if (estimatedGirlsCount && estimatedGirlsCount >= 10) return 'enterprise';
  if (businessType === 'escort' && hasBookingSystem) return 'enterprise';

  // PREMIUM for escort (always need profiles)
  if (businessType === 'escort') return 'premium';
  // PREMIUM for privat (usually multiple girls)
  if (businessType === 'privat') return 'premium';
  // PREMIUM if they already have booking system (need upgrade, not downgrade)
  if (totalScore >= 40 && hasBookingSystem) return 'premium';
  // BASIC for massage salons with low scores
  if (businessType === 'massage' && totalScore < 50) return 'basic';
  // Default to premium for larger operations
  return 'premium';
}

// Format price range
export function formatPriceRange(min: number, max: number): string {
  const formatNumber = (n: number) => n.toLocaleString('cs-CZ');
  if (min === max) return `${formatNumber(min)} Kč`;
  return `${formatNumber(min)} - ${formatNumber(max)} Kč`;
}
