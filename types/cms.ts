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
