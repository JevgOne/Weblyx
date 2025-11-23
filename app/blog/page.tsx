import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Clock, Calendar } from "lucide-react";
import { getPublishedBlogPosts } from "@/lib/turso/blog";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Blog – tipy a trendy ze světa webu a online marketingu",
  description: "Sdílíme know-how z oblasti tvorby webu, SEO, rychlosti webu a online marketingu. Články píšeme tak, aby byly srozumitelné a praktické – od \"kolik stojí web v roce 2024\" po srovnání WordPress vs. Next.js.",
  keywords: [
    "blog tvorba webů",
    "SEO tipy",
    "rychlost webu",
    "WordPress vs Next.js",
    "webové technologie",
    "online marketing"
  ],
  openGraph: {
    title: "Blog | Weblyx – tipy ze světa webu",
    description: "Praktické tipy z oblasti tvorby webu, SEO a online marketingu.",
    url: "https://weblyx.cz/blog",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Weblyx - Blog"
      }
    ],
  },
  alternates: {
    canonical: "https://weblyx.cz/blog"
  }
};

export default async function BlogPage() {
  let posts: any[] = [];

  try {
    const blogPosts = await getPublishedBlogPosts();

    posts = blogPosts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      category: '', // Blog schema doesn't have category
      tags: post.tags || [],
      coverImage: post.featuredImage,
      readTime: '5 min', // Could calculate from content length later
      date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      }) : new Date(post.createdAt).toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      }),
    }));
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    posts = [];
  }

  return (
    <>
      {/* Breadcrumb Schema */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Domů",
              item: "https://weblyx.cz",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blog",
              item: "https://weblyx.cz/blog",
            },
          ],
        }}
      />

      <main className="min-h-screen">
        <section className="py-20 md:py-32 px-4 gradient-hero grid-pattern">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="text-primary">Blog</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Tipy, trendy a novinky ze světa webu a online marketingu
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Zatím zde nejsou žádné publikované články. Brzy se tu objeví nový obsah!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-elegant transition-all">
                    {post.coverImage ? (
                      <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${post.coverImage})` }} />
                    ) : (
                      <div className="aspect-video bg-gradient-hero flex items-center justify-center">
                        <p className="text-muted-foreground">📝 Náhledový obrázek</p>
                      </div>
                    )}
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{post.category}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {post.readTime || '5 min'}
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground">{post.excerpt}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                        <Calendar className="h-4 w-4" />
                        {(post as any).date}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
    </>
  );
}
