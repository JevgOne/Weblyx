import { NextResponse } from 'next/server';
import { getBlogPostBySlug } from '@/lib/turso/blog';
import { autoCoverSvg } from '@/lib/blog-covers/auto.mjs';

/**
 * /blog-cover/{slug}.svg — the generated cover of an article.
 *
 * Every article gets a picture the moment it exists: the templates fall back
 * to this URL when no cover has been set. It is SVG, so it is sharp at any
 * size and costs nothing to make; the `.svg` suffix also keeps it out of the
 * middleware, like every other image.
 */
export const revalidate = 3600;

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug.replace(/\.svg$/, '');
  const post = await getBlogPostBySlug(slug).catch(() => null);
  if (!post) return new NextResponse('Not found', { status: 404 });

  return new NextResponse(autoCoverSvg(post), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
