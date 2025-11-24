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

export interface HomepageSections {
  hero: HeroSection;
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

// Team Assignment Types
export type TeamMember = 'jevgenij' | 'maxim';

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

  // Team assignment
  assignedTo?: TeamMember;
  assignedAt?: Date;
  status: 'new' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Web Analyzer Types
export interface WebAnalysisTechnical {
  // SEO Basics
  title?: string;
  description?: string;
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
}

export interface WebAnalysisTechnology {
  // CMS/Platform
  platform?: string; // WordPress, Shopify, Wix, Next.js, Custom
  platformVersion?: string;

  // Frontend
  framework?: string; // React, Vue, Angular, etc.
  libraries: string[]; // jQuery, Bootstrap, Tailwind, etc.

  // Analytics & Marketing
  analytics: string[]; // Google Analytics, GTM, Facebook Pixel

  // Server
  server?: string; // nginx, Apache, Cloudflare

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
