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
        {/* Hero Section with Gradient */}
        <section className="relative py-24 md:py-32 px-4 overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 -z-10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.1),transparent_50%)] -z-10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(20,184,166,0.08),transparent_50%)] -z-10"></div>

          <div className="container mx-auto max-w-6xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">Aktuálně {posts.length} {posts.length === 1 ? 'článek' : posts.length < 5 ? 'články' : 'článků'}</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Weblyx <span className="text-primary">Blog</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Praktické tipy, trendy a know-how ze světa moderního webu, SEO a online marketingu
            </p>

            {/* Decorative elements */}
            <div className="flex items-center justify-center gap-8 pt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-1 w-12 bg-gradient-to-r from-transparent to-primary/30 rounded-full"></div>
                <span className="text-sm">Zdarma</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">Bez reklam</span>
                <div className="h-1 w-12 bg-gradient-to-l from-transparent to-primary/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Section Heading */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nejnovější články
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Praktické tipy, trendy a know-how ze světa moderního webu
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Zatím zde nejsou žádné publikované články. Brzy se tu objeví nový obsah!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <Card className="h-full overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/20 relative">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>

                    {/* Featured Image or Gradient Placeholder */}
                    {post.coverImage ? (
                      <div className="aspect-video bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: `url(${post.coverImage})` }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    ) : (
                      <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background">
                        {/* Animated gradient orbs */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 delay-100"></div>

                        {/* Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary/60 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    <CardContent className="p-6 space-y-4 relative">
                      {/* Category badge and read time */}
                      <div className="flex items-center justify-between">
                        {post.tags && post.tags.length > 0 ? (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {post.tags[0]}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Článek</Badge>
                        )}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {post.readTime || '5 min'}
                        </div>
                      </div>

                      {/* Title with gradient on hover */}
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                        {post.excerpt}
                      </p>

                      {/* Date and arrow */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {(post as any).date}
                        </div>
                        <div className="text-primary opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
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
