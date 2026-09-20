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
      // AI crawlers, named explicitly.
      //
      // The previous list named `anthropic-ai` and `Claude-Web`, both retired —
      // Anthropic crawls as ClaudeBot and Claude-User now — and was missing
      // OAI-SearchBot entirely, which is how ChatGPT Search collects citations.
      // The paths it allowed included /cenik and /tvorba-eshopu, neither of
      // which is a page: both redirect.
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-User',
          'Claude-SearchBot',
          'PerplexityBot',
          'Perplexity-User',
          'Google-Extended',
          'Applebot-Extended',
          'CCBot',
          'Amazonbot',
          'DuckAssistBot',
          'Meta-ExternalAgent',
          'MistralAI-User',
          'cohere-ai',
        ],
        allow: '/',
        disallow: ['/admin/*', '/api/*', '/t/*', '/poptavka/dekujeme'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
