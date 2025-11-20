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
  image: string;
  published: boolean;
  featured: boolean;
  displayOrder: number;
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
  popular: boolean;
  order: number;
  features: string[];
}
