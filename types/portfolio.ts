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
  published: boolean;
  featured: boolean;
}
