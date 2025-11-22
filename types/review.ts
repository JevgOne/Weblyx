// Review types

export interface Review {
  id: string;
  authorName: string;
  authorImage?: string;
  authorRole?: string; // např. "CEO, Firma XYZ"
  rating: number; // 1-5
  text: string;
  date: Date;
  source: 'manual' | 'google'; // odkud pochází recenze
  sourceUrl?: string; // odkaz na originální recenzi (pro Google)
  published: boolean;
  featured: boolean; // zvýrazněná recenze
  order: number;
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
  source: 'manual' | 'google';
  sourceUrl?: string;
  published: boolean;
  featured: boolean;
}
