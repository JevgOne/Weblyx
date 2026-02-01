import { getPublishedBlogPostsByLanguage } from '@/lib/turso/blog';
import { getDomainLocale, getBrandConfig } from '@/lib/brand';

export const revalidate = 3600; // 1 hour

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const locale = getDomainLocale();
  const brand = getBrandConfig();
  const baseUrl = brand.domain === 'seitelyx.de' ? 'https://seitelyx.de' : 'https://www.weblyx.cz';

  let posts: any[] = [];
  try {
    posts = await getPublishedBlogPostsByLanguage(locale);
  } catch {
    posts = [];
  }

  const items = posts.map((post) => {
    const pubDate = post.publishedAt
      ? new Date(post.publishedAt).toUTCString()
      : new Date(post.createdAt).toUTCString();

    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description>${escapeXml(post.excerpt || '')}</description>
      <pubDate>${pubDate}</pubDate>
      ${post.authorName ? `<author>${escapeXml(post.authorName)}</author>` : ''}
      ${post.tags?.map((tag: string) => `<category>${escapeXml(tag)}</category>`).join('\n      ') || ''}
    </item>`;
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${brand.name} Blog</title>
    <link>${baseUrl}/blog</link>
    <description>${locale === 'de' ? 'Tipps und Trends aus der Welt des Webs und Online-Marketings' : 'Tipy a trendy ze sveta webu a online marketingu'}</description>
    <language>${locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
