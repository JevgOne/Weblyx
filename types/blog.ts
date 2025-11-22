// Blog types

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
}
