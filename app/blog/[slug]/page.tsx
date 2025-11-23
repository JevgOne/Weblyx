import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogPostBySlug, getPublishedBlogPosts } from "@/lib/turso/blog";
import { JsonLd } from "@/components/seo/JsonLd";
import { ShareButtons } from "@/components/blog/ShareButtons";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getBlogPostBySlug(slug);

    if (!post || !post.published) {
      return {
        title: "Článek nenalezen | Weblyx Blog",
      };
    }

    return {
      title: `${post.title} | Weblyx Blog`,
      description: post.excerpt || post.title,
      keywords: post.tags || [],
      authors: post.authorName ? [{ name: post.authorName }] : undefined,
      openGraph: {
        title: post.title,
        description: post.excerpt || '',
        type: "article",
        publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
        modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
        authors: post.authorName ? [post.authorName] : undefined,
        images: post.featuredImage ? [{ url: post.featuredImage }] : [],
        url: `https://weblyx.cz/blog/${slug}`,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt || '',
        images: post.featuredImage ? [post.featuredImage] : [],
      },
      alternates: {
        canonical: `https://weblyx.cz/blog/${slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "Článek nenalezen | Weblyx Blog",
    };
  }
}

export default async function BlogPostPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  try {
    const post = await getBlogPostBySlug(slug);

    if (!post || !post.published) {
      notFound();
    }

    // Fetch related posts (other published posts, excluding current one)
    const allPosts = await getPublishedBlogPosts();
    const relatedPosts = allPosts
      .filter((p) => p.slug !== slug)
      .slice(0, 3)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt || '',
        featuredImage: p.featuredImage,
        publishedAt: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('cs-CZ', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }) : new Date(p.createdAt).toLocaleDateString('cs-CZ', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
      }));

    // Format dates
    const publishedDate = post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString('cs-CZ', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : new Date(post.createdAt).toLocaleDateString('cs-CZ', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = post.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    // Generate Article schema
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt || '',
      "image": post.featuredImage || '',
      "author": {
        "@type": "Person",
        "name": post.authorName || "Weblyx",
      },
      "publisher": {
        "@type": "Organization",
        "name": "Weblyx",
        "logo": {
          "@type": "ImageObject",
          "url": "https://weblyx.cz/logo.png"
        }
      },
      "datePublished": post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date(post.createdAt).toISOString(),
      "dateModified": post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date(post.createdAt).toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://weblyx.cz/blog/${slug}`
      },
      "keywords": post.tags?.join(', ') || '',
    };

    // Generate Breadcrumbs schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Domů",
          "item": "https://weblyx.cz"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": "https://weblyx.cz/blog"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": post.title,
          "item": `https://weblyx.cz/blog/${slug}`
        }
      ]
    };

    return (
      <>
        {/* Schema.org JSON-LD */}
        <JsonLd data={articleSchema} />
        <JsonLd data={breadcrumbSchema} />

        <main className="min-h-screen">
          <article className="py-20 px-4">
            <div className="container mx-auto max-w-4xl">
              <Link href="/blog">
                <Button variant="ghost" className="mb-8 gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Zpět na blog
                </Button>
              </Link>

              {post.featuredImage && (
                <div className="aspect-video bg-cover bg-center rounded-lg mb-8 overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <header className="mb-12 space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {publishedDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {readTime} min čtení
                  </div>
                  {post.authorName && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.authorName}
                    </div>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="text-xl text-muted-foreground">
                    {post.excerpt}
                  </p>
                )}
              </header>

              <div
                className="prose prose-lg max-w-none dark:prose-invert
                  prose-headings:font-bold prose-headings:text-foreground
                  prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                  prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                  prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                  prose-ul:my-6 prose-ul:text-muted-foreground
                  prose-ol:my-6 prose-ol:text-muted-foreground
                  prose-li:my-2
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:rounded
                  prose-pre:bg-muted prose-pre:border"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Share Buttons */}
              <div className="mt-12 pt-8 border-t">
                <ShareButtons
                  url={`/blog/${slug}`}
                  title={post.title}
                  description={post.excerpt || undefined}
                />
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Štítky:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Related Posts Section */}
          {relatedPosts.length > 0 && (
            <section className="py-12 px-4">
              <div className="container mx-auto max-w-4xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-8">
                  Další články
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                      <Card className="h-full hover:shadow-elegant transition-all">
                        {relatedPost.featuredImage ? (
                          <div
                            className="aspect-video bg-cover bg-center rounded-t-lg"
                            style={{ backgroundImage: `url(${relatedPost.featuredImage})` }}
                          />
                        ) : (
                          <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center rounded-t-lg">
                            <span className="text-4xl">📝</span>
                          </div>
                        )}
                        <CardContent className="p-4 space-y-2">
                          <h3 className="font-semibold hover:text-primary transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {relatedPost.excerpt}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2">
                            <Calendar className="h-3 w-3" />
                            {relatedPost.publishedAt}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section className="py-12 px-4 bg-muted/30">
            <div className="container mx-auto max-w-4xl text-center space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">
                Potřebujete pomoc s webem?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Vytvoříme pro vás moderní web přesně podle vašich představ. Rychle, kvalitně a za férovou cenu.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/poptavka">
                  <Button size="lg">
                    Nezávazná poptávka
                  </Button>
                </Link>
                <Link href="/portfolio">
                  <Button size="lg" variant="outline">
                    Naše projekty
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  } catch (error) {
    console.error('Error loading blog post:', error);
    notFound();
  }
}
