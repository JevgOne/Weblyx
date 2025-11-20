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
