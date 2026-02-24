import { MetadataRoute } from 'next';

/**
 * Robots.txt configuration for search engine crawling
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

export default function robots(): MetadataRoute.Robots {
  const isGerman = process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de';
  const baseUrl = isGerman ? 'https://seitelyx.de' : 'https://www.weblyx.cz';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/*',          // Block admin panel
          '/api/*',            // Block API routes
          '/t/*',              // Block tracking links (lead generation)
          '/poptavka/dekujeme', // Block thank you page (no indexing needed)
        ],
      },
      // ALLOW AI crawlers to access public content for AI search visibility
      // Research shows: ChatGPT = 87.4% of AI referrals, 25.11% of Google searches have AI Overview
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'PerplexityBot', 'anthropic-ai', 'Claude-Web'],
        allow: isGerman
          ? ['/blog/*', '/leistungen/*', '/portfolio/*', '/uber-uns*', '/preise*', '/kontakt*', '/']
          : ['/blog/*', '/sluzby/*', '/portfolio/*', '/o-nas*', '/cenik*', '/kontakt*', '/seo-optimalizace*', '/geo-optimalizace*', '/redesign-webu*', '/tvorba-eshopu*', '/recenze*', '/'],
        disallow: ['/admin/*', '/api/*', '/t/*', '/poptavka/dekujeme'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
