// Review types

export interface Review {
  id: string;
  authorName: string;
  authorImage?: string;
  authorRole?: string; // např. "CEO, Firma XYZ"
  rating: number; // 1-5
  text: string;
  date: Date;
  source: string; // 'manual' | 'Google' | 'Firmy.cz' | 'Facebook' | 'Seznam'
  sourceUrl?: string; // odkaz na originální recenzi
  published: boolean;
  featured: boolean; // zvýrazněná recenze
  order: number;
  locale: 'cs' | 'de'; // Language/locale for multi-domain support
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewFormData {
  authorName: string;
  authorImage?: string;
  authorRole?: string;
  rating: number;
  text: string;
  date: Date;
  source: string;
  sourceUrl?: string;
  published: boolean;
  featured: boolean;
  locale: 'cs' | 'de';
}
