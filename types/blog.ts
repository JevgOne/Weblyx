// Blog types

export type BlogLanguage = 'cs' | 'de';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorId?: string;
  authorName?: string;
  featuredImage?: string;
  published: boolean;
  publishedAt?: Date;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  // Scheduling & Multi-language fields
  language: BlogLanguage;
  scheduledDate?: Date; // When to auto-publish this post
  autoTranslate: boolean; // Auto-create translation in other language
  parentPostId?: string; // Links to original post if this is a translation
}

export interface CreateBlogPostData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorId?: string;
  authorName?: string;
  featuredImage?: string;
  published?: boolean;
  publishedAt?: Date;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  // Scheduling & Multi-language fields
  language?: BlogLanguage;
  scheduledDate?: Date;
  autoTranslate?: boolean;
  parentPostId?: string;
}

export interface UpdateBlogPostData {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  authorId?: string;
  authorName?: string;
  featuredImage?: string;
  published?: boolean;
  publishedAt?: Date;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  // Scheduling & Multi-language fields
  language?: BlogLanguage;
  scheduledDate?: Date;
  autoTranslate?: boolean;
  parentPostId?: string;
}
