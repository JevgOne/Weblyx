// Portfolio project types

export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  projectUrl?: string; // URL of the live project
  clientName?: string; // Optional client name
  pagespeedMobile?: number; // PageSpeed score mobile (0-100)
  pagespeedDesktop?: number; // PageSpeed score desktop (0-100)
  loadTimeBefore?: number; // Load time before optimization (seconds)
  loadTimeAfter?: number; // Load time after optimization (seconds)
  published: boolean;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Alias for consistency with Turso DAL
export type PortfolioItem = PortfolioProject;

export interface PortfolioFormData {
  title: string;
  category: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  projectUrl?: string; // URL of the live project
  pagespeedMobile?: number;
  pagespeedDesktop?: number;
  loadTimeBefore?: number;
  loadTimeAfter?: number;
  published: boolean;
  featured: boolean;
}
