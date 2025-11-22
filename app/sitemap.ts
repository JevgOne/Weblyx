import { MetadataRoute } from 'next';
import { adminDbInstance } from '@/lib/firebase-admin';
import { getAllPortfolio } from '@/lib/turso/portfolio';

/**
 * Dynamic sitemap generation for better SEO
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://weblyx.cz';

  // Static routes with priorities
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sluzby`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/poptavka`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/o-nas`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ochrana-udaju`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/obchodni-podminky`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Fetch dynamic portfolio items from Turso
  let portfolioRoutes: MetadataRoute.Sitemap = [];
  try {
    const allPortfolio = await getAllPortfolio();
    const publishedPortfolio = allPortfolio.filter(p => p.published);

    portfolioRoutes = publishedPortfolio.map((project) => ({
      url: `${baseUrl}/portfolio/${project.id}`,
      lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error fetching portfolio for sitemap:', error);
  }

  // Fetch dynamic blog posts
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    if (adminDbInstance) {
      const blogSnapshot = await adminDbInstance
        .collection('blog')
        .where('published', '==', true)
        .get();

      blogRoutes = blogSnapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          url: `${baseUrl}/blog/${data.slug || doc.id}`,
          lastModified: data.updatedAt?.toDate() || new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        };
      });
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  return [...staticRoutes, ...portfolioRoutes, ...blogRoutes];
}
