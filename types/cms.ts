// CMS Content Types

export interface HeroSection {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
  enabled: boolean;
}

export interface Service {
  id?: string;
  title: string;
  description: string;
  icon: string;
  imageUrl?: string; // Optional image for service display
  features: string[];
  order: number;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PricingTier {
  id?: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'one-time';
  features: string[];
  highlighted: boolean;
  ctaText: string;
  ctaLink: string;
  order: number;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProcessStep {
  id?: string;
  number: string;
  icon: string;
  title: string;
  description: string;
  order: number;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProcessSection {
  heading: string;
  subheading: string;
  enabled: boolean;
}

export interface FAQItem {
  id?: string;
  question: string;
  answer: string;
  order: number;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FAQSection {
  heading: string;
  subheading: string;
  enabled: boolean;
}

export interface CTABenefit {
  icon: string;
  title: string;
  description: string;
}

export interface CTASection {
  heading: string;
  subheading: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  benefits: CTABenefit[];
  enabled: boolean;
}

export interface ContactInfo {
  heading: string;
  subheading: string;
  email: string;
  address: string;
  openingHours: {
    weekdays: string;
    weekend: string;
  };
  formLabels: {
    name: string;
    email: string;
    phone: string;
    projectType: string;
    budget: string;
    message: string;
    submit: string;
    submitting: string;
  };
  projectTypes: Array<{ value: string; label: string }>;
  budgetOptions: Array<{ value: string; label: string }>;
  enabled: boolean;
}

// === Homepage Section Data Types (JSON blobs stored in homepage_sections) ===

export interface SocialProofStat {
  value: string;
  label: string;
  description: string;
}

export interface SocialProofData {
  title: string;
  titleHighlight: string;
  subtitle: string;
  stats: SocialProofStat[];
}

export interface TargetAudienceItem {
  title: string;
  description: string;
}

export interface TargetAudienceData {
  title: string;
  subtitle: string;
  audiences: TargetAudienceItem[];
}

export interface BeforeAfterMetric {
  label: string;
  beforeValue: string;
  afterValue: string;
}

export interface BeforeAfterData {
  title: string;
  titleVs: string;
  titleHighlight: string;
  subtitle: string;
  badgeBefore: string;
  badgeAfter: string;
  beforeTitle: string;
  beforeSubtitle: string;
  afterTitle: string;
  afterSubtitle: string;
  metrics: BeforeAfterMetric[];
  ctaTitle: string;
  ctaHighlight: string;
  ctaStat: string;
  ctaSubtitle: string;
  ctaText: string;
  ctaLink: string;
}

export interface CaseStudyData {
  badgeText: string;
  title: string;
  subtitleTemplate: string; // Use {projectName} as placeholder
  ctaText: string;
}

export interface ClientLogoItem {
  name: string;
  slug: string;
}

export interface ClientLogosData {
  heading: string;
  clients: ClientLogoItem[];
}

export interface TrustBadgeItem {
  title: string;
  description: string;
}

export interface TrustBadgesData {
  badges: TrustBadgeItem[];
}

export interface FreeAuditData {
  badge: string;
  title: string;
  subtitle: string;
  urlPlaceholder: string;
  emailPlaceholder: string;
  buttonSubmit: string;
  buttonLoading: string;
  noSpam: string;
}

export interface LocalizedSectionData<T> {
  cs: T;
  de: T;
}

export interface HomepageSections {
  hero: HeroSection;
  socialProofData?: string | null;
  targetAudienceData?: string | null;
  beforeAfterData?: string | null;
  caseStudyData?: string | null;
  clientLogosData?: string | null;
  trustBadgesData?: string | null;
  freeAuditData?: string | null;
  updatedAt?: Date;
}

// Form validation errors
export interface FormErrors {
  [key: string]: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// AI Design Generation Types
export interface DesignPreference {
  industry: string;
  targetAudience: string;
  stylePreference: 'minimalist' | 'modern' | 'classic' | 'bold' | 'elegant';
  colorPreferences: string[];
  inspirationUrls: string[];
  requiredFeatures: string[];
  contentReady: boolean;
  additionalNotes: string;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface Typography {
  headingFont: string;
  bodyFont: string;
  fontPairing: string;
}

export interface AIDesignVariant {
  id: string;
  name: string; // "Design A", "Design B", "Design C"
  style: string; // "Minimalistický", "Moderní/Odvážný", "Klasický/Elegantní"
  colorPalette: ColorPalette;
  typography: Typography;
  layoutStyle: string;
  visualElements: string[];
  moodboardPrompt: string;
  reasoning: string; // Why this design fits the business
}

export interface AIGeneratedDesigns {
  designs: [AIDesignVariant, AIDesignVariant, AIDesignVariant];
  generatedAt: Date;
  basedOn: DesignPreference;
}

// Promo Code Types
export interface PromoCode {
  id?: string;
  code: string; // The actual promo code (e.g., "SUMMER2024")
  description: string; // Admin description
  discountType: 'percentage' | 'fixed'; // Percentage off or fixed amount
  discountValue: number; // e.g., 20 for 20% or 1000 for 1000 CZK
  minOrderValue?: number; // Minimum order value to use code
  maxDiscount?: number; // Maximum discount amount for percentage codes
  usageLimit?: number; // Maximum number of uses (null = unlimited)
  usageCount: number; // Current number of uses
  validFrom: Date; // Start date
  validUntil: Date; // End date
  enabled: boolean; // Active/inactive
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id?: string;
  // Basic info
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budget: string;
  message: string;

  // Design preferences for AI
  designPreferences?: DesignPreference;

  // AI generated designs
  aiDesigns?: AIGeneratedDesigns;
  selectedDesign?: string; // ID of chosen design

  // Team assignment - flexible string to support any team member name
  assignedTo?: string;
  assignedAt?: Date;
  status: 'new' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Web Analyzer Types
export interface WebAnalysisTechnical {
  // SEO Basics
  title?: string | null;
  description?: string | null;
  keywords?: string[];
  hasH1: boolean;
  h1Count: number;
  headingsStructure: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5: number;
    h6: number;
  };

  // Canonical & OG
  canonicalUrl?: string | null;
  hasCanonical: boolean;
  ogTags: { title?: string; description?: string; image?: string; url?: string };
  hasOgTags: boolean;
  twitterCard: { card?: string; title?: string; description?: string; image?: string };
  hasTwitterCard: boolean;
  hreflangTags: string[];

  // Favicon & Lang
  hasFavicon: boolean;
  htmlLang?: string | null;
  hasLangAttribute: boolean;

  // DOM metrics
  domElementCount: number;
  inlineStyleCount: number;
  pageSize: number;

  // Image optimization
  imagesWithLazyLoading: number;
  imagesWithModernFormat: number;

  // Heading order & broken links
  headingOrder: string[];
  brokenInternalLinks: string[];

  // Images & Links
  imagesWithoutAlt: number;
  totalImages: number;
  internalLinks: number;
  externalLinks: number;

  // Technical
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  loadTime: number;
  mobileResponsive: boolean;
  hasSSL: boolean;
  schemaMarkup: boolean;
}

export interface WebAnalysisContent {
  wordCount: number;
  paragraphCount: number;
  sentenceCount: number;
  readabilityScore: number; // Flesch Reading Ease (0-100)
  readabilityLevel: 'very-easy' | 'easy' | 'moderate' | 'difficult' | 'very-difficult';
  averageWordsPerSentence: number;
  language?: string;
  topKeywords: Array<{ word: string; count: number }>;
}

export interface WebAnalysisTechnology {
  // CMS/Platform
  platform?: string | null; // WordPress, Shopify, Wix, Next.js, Custom
  platformVersion?: string | null;

  // Frontend
  framework?: string | null; // React, Vue, Angular, etc.
  libraries: string[]; // jQuery, Bootstrap, Tailwind, etc.

  // Analytics & Marketing
  analytics: string[]; // Google Analytics, GTM, Facebook Pixel

  // Server
  server?: string | null; // nginx, Apache, Cloudflare

  // Other
  fonts: string[]; // Google Fonts, etc.
  cdns: string[]; // Cloudflare, jsDelivr, etc.
}

export interface WebAnalysisSecurity {
  securityScore: number; // 0-100
  headers: {
    strictTransportSecurity: boolean;
    contentSecurityPolicy: boolean;
    xFrameOptions: boolean;
    xContentTypeOptions: boolean;
    referrerPolicy: boolean;
  };
  mixedContent: boolean;
  httpsRedirect: boolean;
}

export interface WebAnalysisPerformance {
  estimatedScore: number; // 0-100 based on simple metrics
  totalResourcesSize: number; // KB
  totalResources: number;
  hasCompression: boolean;
  hasCaching: boolean;
  largeImages: number; // count of images > 100KB
  scriptCount: number;
  stylesheetCount: number;
  imageCount: number;
  thirdPartyRequests: number;
  hasLazyLoading: boolean;
}

export interface WebAnalysisIssue {
  category: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
}

export interface PackageRecommendation {
  packageId: 'start' | 'standard' | 'premium' | 'enterprise';
  packageName: string;
  confidence: number; // 0-100%
  reasoning: string;
  matchedNeeds: string[];
}

export interface WebAnalysisResult {
  id?: string;
  url: string;
  analyzedAt: Date;

  // Technical analysis
  technical: WebAnalysisTechnical;

  // NEW: Extended analysis
  content?: WebAnalysisContent;
  technology?: WebAnalysisTechnology;
  security?: WebAnalysisSecurity;
  performance?: WebAnalysisPerformance;

  // Identified issues
  issues: WebAnalysisIssue[];
  issueCount: {
    critical: number;
    warning: number;
    info: number;
  };

  // Score (0-100)
  overallScore: number;

  // AI Package recommendation
  recommendation: PackageRecommendation;

  // Promo code for cold email
  promoCodeId?: string;
  promoCodeUsed?: boolean;

  // Cold email tracking
  emailSent: boolean;
  emailSentAt?: Date;
  emailOpened?: boolean;
  emailClicked?: boolean;

  // Business contact info (for outreach)
  contactEmail?: string;
  contactName?: string;
  businessName?: string;

  // Screenshots (base64)
  screenshots?: {
    desktop: string;
    tablet: string;
    mobile: string;
  };

  // Admin notes
  notes?: string;
  status: 'analyzed' | 'email_sent' | 'responded' | 'converted' | 'rejected';

  createdAt: Date;
  updatedAt: Date;
}
