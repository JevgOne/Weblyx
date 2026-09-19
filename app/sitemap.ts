import { MetadataRoute } from 'next';
import { getAllPortfolio } from '@/lib/turso/portfolio';
import { getPublishedBlogPostsByLanguage } from '@/lib/turso/blog';

/**
 * Dynamic sitemap generation for better SEO
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

/**
 * Static routes change when we deploy, not when a crawler asks. Using
 * `new Date()` meant the sitemap claimed all 27 of them changed today,
 * every day — and a sitemap that cries wolf gets its lastmod ignored for
 * the whole domain, including the blog, where the dates are real.
 */
const STATIC_LAST_MODIFIED = new Date('2026-09-19');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de' ? 'https://seitelyx.de' : 'https://www.weblyx.cz';
  const isGermanSite = process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de';

  // Static routes with priorities
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Public changelog. Czech-only: the German site has no archive page.
    ...(isGermanSite
      ? []
      : [
          {
            url: `${baseUrl}/archiv`,
            lastModified: STATIC_LAST_MODIFIED,
            changeFrequency: 'weekly' as const,
            priority: 0.5,
          },
        ]),
  ];

  // Language-specific routes for Services, About, Quote
  const languageRoutes: MetadataRoute.Sitemap = isGermanSite
    ? [
        {
          url: `${baseUrl}/leistungen`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'weekly',
          priority: 0.9,
        },
        {
          url: `${baseUrl}/uber-uns`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'monthly',
          priority: 0.6,
        },
        {
          url: `${baseUrl}/anfrage`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'monthly',
          priority: 0.9,
        },
      ]
    : [
        {
          url: `${baseUrl}/sluzby`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'weekly',
          priority: 0.9,
        },
        {
          url: `${baseUrl}/o-nas`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'monthly',
          priority: 0.6,
        },
        {
          url: `${baseUrl}/poptavka`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'monthly',
          priority: 0.9,
        },
      ];

  // German-specific routes
  const germanRoutes: MetadataRoute.Sitemap = isGermanSite
    ? [
        {
          url: `${baseUrl}/preise`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'monthly',
          priority: 0.9, // High priority for SEO
        },
        {
          url: `${baseUrl}/impressum`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'yearly',
          priority: 0.3,
        },
        {
          url: `${baseUrl}/datenschutz`,
          lastModified: STATIC_LAST_MODIFIED,
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
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/website-erstellen-muenchen`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'weekly',
          priority: 0.8,
        },
      ]
    : [
        {
          url: `${baseUrl}/tvorba-webu-praha`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/tvorba-webu-brno`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/tvorba-webu-ostrava`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'weekly',
          priority: 0.8,
        },
      ];

  // SEO landing pages
  const seoLandingRoutes: MetadataRoute.Sitemap = isGermanSite
    ? [
        {
          url: `${baseUrl}/wordpress-alternative`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/website-fuer-aerzte`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'weekly',
          priority: 0.8,
        },
      ]
    : [
        {
          url: `${baseUrl}/webnode-alternativa`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/wordpress-alternativa`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/seo-optimalizace`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'weekly',
          priority: 0.9,
        },
        {
          url: `${baseUrl}/geo-optimalizace`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/redesign-webu`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/web-pro-restaurace`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'monthly',
          priority: 0.7,
        },
        {
          url: `${baseUrl}/web-pro-zivnostniky`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'monthly',
          priority: 0.7,
        },
        {
          url: `${baseUrl}/web-pro-pravniky`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'monthly',
          priority: 0.7,
        },
        {
          url: `${baseUrl}/audit`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'monthly',
          priority: 0.7,
        },
        {
          url: `${baseUrl}/recenze`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'weekly',
          priority: 0.6,
        },
      ];

  // Czech-specific routes
  const czechRoutes: MetadataRoute.Sitemap = !isGermanSite
    ? [
        {
          url: `${baseUrl}/pagespeed-garance`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'yearly',
          priority: 0.5,
        },
        {
          url: `${baseUrl}/cookies`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'yearly',
          priority: 0.3,
        },
        {
          url: `${baseUrl}/ochrana-udaju`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'yearly',
          priority: 0.3,
        },
        {
          url: `${baseUrl}/obchodni-podminky`,
          lastModified: STATIC_LAST_MODIFIED,
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
