import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogPostBySlug, getPublishedBlogPosts } from "@/lib/turso/blog";
import { JsonLd } from "@/components/seo/JsonLd";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { marked } from "marked";
import { generateHowToSchema, HowToStep } from "@/lib/schema-generators";
import { getLocaleFromDomain } from "@/lib/seo-metadata";

// Use ISR: Render on-demand and cache for 60 seconds
export const revalidate = 60;

// Allow all blog posts to be rendered dynamically
export const dynamicParams = true;

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

    const locale = getLocaleFromDomain();
    const baseUrl = locale === 'de' ? 'https://seitelyx.de' : 'https://www.weblyx.cz';
    const siteName = locale === 'de' ? 'Seitelyx' : 'Weblyx';

    return {
      title: post.metaTitle || `${post.title} | ${siteName} Blog`,
      description: post.metaDescription || post.excerpt || post.title,
      keywords: post.tags || [],
      authors: post.authorName ? [{ name: post.authorName }] : undefined,
      openGraph: {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt || '',
        type: "article",
        publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
        modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
        authors: post.authorName ? [post.authorName] : undefined,
        images: post.featuredImage ? [{
          url: post.featuredImage,
          width: 1200,
          height: 630,
          alt: post.title
        }] : [],
        url: `${baseUrl}/blog/${slug}`,
        siteName,
        locale: locale === 'de' ? 'de_DE' : 'cs_CZ',
      },
      twitter: {
        card: "summary_large_image",
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt || '',
        images: post.featuredImage ? [post.featuredImage] : [],
        creator: `@${siteName.toLowerCase()}`,
      },
      alternates: {
        canonical: `${baseUrl}/blog/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
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

    // Convert Markdown to HTML
    const htmlContent = await marked.parse(post.content, {
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert \n to <br>
    });

    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = post.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    // Strip HTML tags for plain text content
    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const plainTextContent = stripHtml(htmlContent);

    // Generate Article schema with E-E-A-T signals (2025 best practices)
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt || '',
      "image": post.featuredImage ? {
        "@type": "ImageObject",
        "url": post.featuredImage,
        "width": 1200,
        "height": 630
      } : undefined,
      "author": {
        "@type": "Person",
        "name": post.authorName || "Weblyx Team",
        "jobTitle": "Senior Web Developer & SEO Specialist",
        "url": "https://weblyx.cz/o-nas",
        "sameAs": [
          "https://www.linkedin.com/company/weblyx"
        ]
      },
      "publisher": {
        "@type": "Organization",
        "name": "Weblyx",
        "url": "https://weblyx.cz",
        "logo": {
          "@type": "ImageObject",
          "url": "https://weblyx.cz/logo.png",
          "width": 200,
          "height": 60
        }
      },
      "datePublished": post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date(post.createdAt).toISOString(),
      "dateModified": post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date(post.createdAt).toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://weblyx.cz/blog/${slug}`
      },
      "keywords": post.tags?.join(', ') || '',
      "articleBody": plainTextContent,
      "wordCount": wordCount,
      "inLanguage": "cs-CZ",
      "timeRequired": `PT${readTime}M`,
    };

    // Speakable schema for voice search optimization (2025/2026 trend)
    const speakableSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", "h2", "article p"]
      }
    };

    // Detect if this is a tutorial/how-to post
    const isTutorial = post.tags?.some(tag =>
      ['tutorial', 'návod', 'guide', 'how-to', 'jak'].some(keyword =>
        tag.toLowerCase().includes(keyword)
      )
    );

    // Extract HowTo steps from markdown content if it's a tutorial
    let howToSchema = null;
    if (isTutorial) {
      // Extract steps from markdown headers (## 1., ## Krok 1, ## Step 1, etc.)
      const stepRegex = /^##\s*(?:(\d+)[\.:]?\s*)?(?:Krok|Step|Schritt)?\s*(.+)$/gim;
      const steps: HowToStep[] = [];
      let match;

      while ((match = stepRegex.exec(post.content)) !== null) {
        const stepNumber = match[1] || (steps.length + 1).toString();
        const stepName = match[2].trim();

        // Find the content after this header until next ## header
        const headerIndex = match.index + match[0].length;
        const nextHeaderMatch = post.content.slice(headerIndex).match(/^##\s/m);
        const nextHeaderIndex = nextHeaderMatch ? headerIndex + nextHeaderMatch.index! : post.content.length;
        const stepContent = post.content.slice(headerIndex, nextHeaderIndex).trim();

        // Strip markdown and get plain text (max 500 chars)
        const plainStepText = stripHtml(await marked(stepContent)).slice(0, 500);

        if (plainStepText.length > 10) {
          steps.push({
            name: `${stepNumber}. ${stepName}`,
            text: plainStepText
          });
        }
      }

      if (steps.length >= 2) {
        howToSchema = generateHowToSchema({
          name: post.title,
          description: post.excerpt || post.title,
          steps,
          totalTime: `PT${readTime}M`,
          image: post.featuredImage
        });
      }
    }

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
        <JsonLd data={speakableSchema} />
        {howToSchema && <JsonLd data={howToSchema} />}

        <main className="min-h-screen relative">
          {/* Background gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5 -z-10"></div>

          <article className="py-12 md:py-20 px-4">
            <div className="container mx-auto max-w-4xl">
              {/* Back button with better styling */}
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group">
                <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </div>
                <span>Zpět na blog</span>
              </Link>

              {/* Featured Image with better styling */}
              {post.featuredImage ? (
                <div className="aspect-video bg-cover bg-center rounded-2xl mb-12 overflow-hidden shadow-2xl border-2 border-primary/10">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    width={1200}
                    height={675}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video relative overflow-hidden rounded-2xl mb-12 bg-gradient-to-br from-primary/20 via-primary/10 to-background border-2 border-primary/10 shadow-2xl">
                  {/* Animated gradient orbs */}
                  <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-primary/15 rounded-full blur-2xl animate-pulse delay-1000"></div>

                  {/* Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full"></div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-primary/40 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Header with enhanced styling */}
              <header className="mb-16 space-y-6">
                {/* Meta information with pills */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">{publishedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{readTime} min čtení</span>
                  </div>
                  {post.authorName && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">{post.authorName}</span>
                    </div>
                  )}
                </div>

                {/* Title with gradient accent */}
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full"></div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                    {post.title}
                  </h1>
                </div>

                {/* Excerpt with better styling */}
                {post.excerpt && (
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed border-l-4 border-primary/20 pl-6 py-2">
                    {post.excerpt}
                  </p>
                )}
              </header>

              {/* Content with premium typography */}
              <div className="relative">
                {/* Subtle gradient background for content area */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-primary/[0.02] rounded-3xl -z-10"></div>

                <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-primary/5 shadow-sm">
                  <div
                    className="prose prose-xl max-w-none dark:prose-invert
                      prose-headings:font-extrabold prose-headings:text-foreground prose-headings:tracking-tight prose-headings:scroll-mt-20
                      prose-h2:text-4xl prose-h2:mt-20 prose-h2:mb-8 prose-h2:pb-4 prose-h2:border-b-2 prose-h2:border-primary/20 prose-h2:bg-gradient-to-r prose-h2:from-primary/10 prose-h2:to-transparent prose-h2:pl-6 prose-h2:pr-6 prose-h2:-mx-6 prose-h2:rounded-lg
                      prose-h3:text-2xl prose-h3:mt-14 prose-h3:mb-6 prose-h3:text-primary prose-h3:font-bold
                      prose-p:text-foreground/90 prose-p:leading-[1.8] prose-p:mb-8 prose-p:text-[18px] prose-p:font-normal
                      prose-ul:my-10 prose-ul:text-foreground/90 prose-ul:space-y-3 prose-ul:text-[17px]
                      prose-ol:my-10 prose-ol:text-foreground/90 prose-ol:space-y-3 prose-ol:text-[17px]
                      prose-li:my-3 prose-li:pl-2 prose-li:leading-relaxed
                      prose-li:marker:text-primary prose-li:marker:font-bold
                      prose-strong:text-foreground prose-strong:font-bold prose-strong:bg-primary/5 prose-strong:px-1 prose-strong:rounded
                      prose-a:text-primary prose-a:no-underline prose-a:font-semibold prose-a:underline-offset-4 hover:prose-a:underline prose-a:transition-all prose-a:decoration-2 prose-a:decoration-primary/50
                      prose-code:text-primary prose-code:bg-primary/10 prose-code:px-3 prose-code:py-1.5 prose-code:rounded-md prose-code:font-mono prose-code:text-[15px] prose-code:font-semibold prose-code:border prose-code:border-primary/20
                      prose-pre:bg-muted prose-pre:border-2 prose-pre:border-primary/10 prose-pre:rounded-2xl prose-pre:shadow-2xl prose-pre:p-6
                      prose-img:rounded-2xl prose-img:shadow-2xl prose-img:border-2 prose-img:border-primary/10 prose-img:my-12
                      prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:my-10 prose-blockquote:font-medium prose-blockquote:text-foreground/90 prose-blockquote:italic"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                </div>
              </div>

              {/* Share Buttons */}
              <div className="mt-12 pt-8 border-t">
                <ShareButtons
                  url={`/blog/${slug}`}
                  title={post.title}
                  description={post.excerpt || undefined}
                />
              </div>

              {/* Tags with better design */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-16 pt-8 border-t border-primary/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold">
                      Štítky
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium hover:bg-primary/20 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Related Posts Section with enhanced design */}
          {relatedPosts.length > 0 && (
            <section className="py-16 md:py-20 px-4 bg-muted/30">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    <span className="text-sm font-medium text-primary">Pokračujte ve čtení</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Další články z blogu
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Objevte více užitečných tipů a návodů
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group">
                      <Card className="h-full overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/20">
                        {relatedPost.featuredImage ? (
                          <div className="aspect-video relative overflow-hidden">
                            <img src={relatedPost.featuredImage} alt={relatedPost.title} className="w-full h-full object-cover" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        ) : (
                          <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/15 via-primary/8 to-background">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="absolute bottom-0 left-0 w-20 h-20 bg-primary/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 delay-100"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          </div>
                        )}
                        <CardContent className="p-6 space-y-3">
                          <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                            {relatedPost.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {relatedPost.excerpt}
                          </p>
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {relatedPost.publishedAt}
                            </div>
                            <div className="text-primary opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
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
