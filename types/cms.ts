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
