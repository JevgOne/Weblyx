// Portfolio project types

export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  published: boolean;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioFormData {
  title: string;
  category: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  published: boolean;
  featured: boolean;
}
