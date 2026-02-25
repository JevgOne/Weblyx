import { MetadataRoute } from 'next';
import { getAllPortfolio } from '@/lib/turso/portfolio';
import { getPublishedBlogPostsByLanguage } from '@/lib/turso/blog';

/**
 * Dynamic sitemap generation for better SEO
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de' ? 'https://seitelyx.de' : 'https://www.weblyx.cz';
  const isGermanSite = process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de';

  // Static routes with priorities
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Language-specific routes for Services, About, Quote
  const languageRoutes: MetadataRoute.Sitemap = isGermanSite
    ? [
        {
          url: `${baseUrl}/leistungen`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
        },
        {
          url: `${baseUrl}/uber-uns`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
        },
        {
          url: `${baseUrl}/anfrage`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.9,
        },
      ]
    : [
        {
          url: `${baseUrl}/sluzby`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
        },
        {
          url: `${baseUrl}/o-nas`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
        },
        {
          url: `${baseUrl}/poptavka`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.9,
        },
        {
          url: `${baseUrl}/kalkulacka`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.9,
        },
      ];

  // German-specific routes
  const germanRoutes: MetadataRoute.Sitemap = isGermanSite
    ? [
        {
          url: `${baseUrl}/preise`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.9, // High priority for SEO
        },
        {
          url: `${baseUrl}/impressum`,
          lastModified: new Date(),
          changeFrequency: 'yearly',
          priority: 0.3,
        },
        {
          url: `${baseUrl}/datenschutz`,
          lastModified: new Date(),
          changeFrequency: 'yearly',
          priority: 0.3,
        },
      ]
    : [];

  // City-specific SEO landing pages
  const cityRoutes: MetadataRoute.Sitemap = isGermanSite
    ? [
        {
          url: `${baseUrl}/website-erstellen-berlin`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/website-erstellen-muenchen`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        },
      ]
    : [
        {
          url: `${baseUrl}/tvorba-webu-praha`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/tvorba-webu-brno`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/tvorba-webu-ostrava`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        },
      ];

  // SEO landing pages
  const seoLandingRoutes: MetadataRoute.Sitemap = isGermanSite
    ? [
        {
          url: `${baseUrl}/wordpress-alternative`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/website-fuer-aerzte`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/onlineshop-erstellen`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        },
      ]
    : [
        {
          url: `${baseUrl}/webnode-alternativa`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/wordpress-alternativa`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/seo-optimalizace`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
        },
        {
          url: `${baseUrl}/geo-optimalizace`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/redesign-webu`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/tvorba-eshopu`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/web-pro-restaurace`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
        },
        {
          url: `${baseUrl}/web-pro-zivnostniky`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
        },
        {
          url: `${baseUrl}/web-pro-pravniky`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
        },
        {
          url: `${baseUrl}/audit`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
        },
        {
          url: `${baseUrl}/recenze`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        },
      ];

  // Czech-specific routes
  const czechRoutes: MetadataRoute.Sitemap = !isGermanSite
    ? [
        {
          url: `${baseUrl}/napiste-recenzi`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
        },
        {
          url: `${baseUrl}/pagespeed-garance`,
          lastModified: new Date(),
          changeFrequency: 'yearly',
          priority: 0.5,
        },
        {
          url: `${baseUrl}/cookies`,
          lastModified: new Date(),
          changeFrequency: 'yearly',
          priority: 0.3,
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
      ]
    : [];

  const allStaticRoutes = [...staticRoutes, ...languageRoutes, ...germanRoutes, ...czechRoutes, ...cityRoutes, ...seoLandingRoutes];

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

  // Fetch dynamic blog posts from Turso — filtered by locale
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const blogLocale = isGermanSite ? 'de' : 'cs';
    const publishedPosts = await getPublishedBlogPostsByLanguage(blogLocale);

    blogRoutes = publishedPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(post.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8, // High priority - blog articles are important for SEO
    }));
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  return [...allStaticRoutes, ...portfolioRoutes, ...blogRoutes];
}
