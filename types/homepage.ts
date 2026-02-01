/**
 * TypeScript interfaces for homepage data from Firestore
 */

export interface HeroStat {
  icon: string;
  value: string;
  label: string;
}

export interface HeroCTA {
  text: string;
  href: string;
}

export interface HeroData {
  badge: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  ctaPrimary: HeroCTA;
  ctaSecondary: HeroCTA;
  stats: HeroStat[];
}

export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
}

export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  beforeImageUrl?: string;
  projectUrl?: string;
  clientName?: string;
  pagespeedMobile?: number;
  pagespeedDesktop?: number;
  loadTimeBefore?: number;
  loadTimeAfter?: number;
  published: boolean;
  featured: boolean;
  order: number;
}

// PricingTier interface removed - now using unified CMS schema from @/types/cms
// This ensures consistency between homepage display and admin CMS
// Import PricingTier from @/types/cms instead
