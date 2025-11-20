import { MetadataRoute } from 'next';

/**
 * Robots.txt configuration for search engine crawling
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://weblyx.cz';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/*',          // Block admin panel
          '/api/*',            // Block API routes
          '/poptavka/dekujeme', // Block thank you page (no indexing needed)
        ],
      },
      {
        userAgent: 'GPTBot',   // Block OpenAI crawler
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User', // Block ChatGPT user agent
        disallow: '/',
      },
      {
        userAgent: 'CCBot',    // Block Common Crawl
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai', // Block Claude AI crawler
        disallow: '/',
      },
      {
        userAgent: 'Claude-Web', // Block Claude web crawler
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
