import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock, User, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getBlogPostBySlug, getPublishedBlogPosts } from "@/lib/turso/blog";
import { JsonLd } from "@/components/seo/JsonLd";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { marked } from "marked";
import { generateHowToSchema, HowToStep } from "@/lib/schema-generators";

export const revalidate = 60;
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
      return { title: "Článek nenalezen | Weblyx Blog" };
    }

    return {
      title: post.metaTitle || `${post.title} | Weblyx Blog`,
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
        url: `https://www.weblyx.cz/blog/${slug}`,
        siteName: "Weblyx",
        locale: "cs_CZ",
      },
      twitter: {
        card: "summary_large_image",
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt || '',
        images: post.featuredImage ? [post.featuredImage] : [],
        creator: "@weblyx",
      },
      alternates: {
        canonical: `https://www.weblyx.cz/blog/${slug}`,
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
    return { title: "Článek nenalezen | Weblyx Blog" };
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

    const allPosts = await getPublishedBlogPosts();
    const relatedPosts = allPosts
      .filter((p) => p.slug !== slug)
      .slice(0, 3);

    const publishedDate = post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
      : new Date(post.createdAt).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });

    const htmlContent = await marked.parse(post.content, { gfm: true, breaks: true });

    const wordCount = post.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const plainTextContent = stripHtml(htmlContent);

    // Schema.org
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt || '',
      "image": post.featuredImage ? { "@type": "ImageObject", "url": post.featuredImage, "width": 1200, "height": 630 } : undefined,
      "author": {
        "@type": "Person",
        "name": post.authorName || "Weblyx Team",
        "jobTitle": "Senior Web Developer & SEO Specialist",
        "url": "https://weblyx.cz/o-nas",
      },
      "publisher": {
        "@type": "Organization",
        "name": "Weblyx",
        "url": "https://weblyx.cz",
        "logo": { "@type": "ImageObject", "url": "https://weblyx.cz/logo.png", "width": 200, "height": 60 }
      },
      "datePublished": post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date(post.createdAt).toISOString(),
      "dateModified": post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date(post.createdAt).toISOString(),
      "mainEntityOfPage": { "@type": "WebPage", "@id": `https://weblyx.cz/blog/${slug}` },
      "keywords": post.tags?.join(', ') || '',
      "articleBody": plainTextContent,
      "wordCount": wordCount,
      "inLanguage": "cs-CZ",
      "timeRequired": `PT${readTime}M`,
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Domů", "item": "https://weblyx.cz" },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://weblyx.cz/blog" },
        { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://weblyx.cz/blog/${slug}` }
      ]
    };

    // HowTo schema for tutorials
    let howToSchema = null;
    const isTutorial = post.tags?.some(tag =>
      ['tutorial', 'návod', 'guide', 'how-to', 'jak'].some(kw => tag.toLowerCase().includes(kw))
    );
    if (isTutorial) {
      const stepRegex = /^##\s*(?:(\d+)[\.:]?\s*)?(?:Krok|Step|Schritt)?\s*(.+)$/gim;
      const steps: HowToStep[] = [];
      let match;
      while ((match = stepRegex.exec(post.content)) !== null) {
        const stepNumber = match[1] || (steps.length + 1).toString();
        const stepName = match[2].trim();
        const headerIndex = match.index + match[0].length;
        const nextHeaderMatch = post.content.slice(headerIndex).match(/^##\s/m);
        const nextHeaderIndex = nextHeaderMatch ? headerIndex + nextHeaderMatch.index! : post.content.length;
        const stepContent = post.content.slice(headerIndex, nextHeaderIndex).trim();
        const plainStepText = stripHtml(await marked(stepContent)).slice(0, 500);
        if (plainStepText.length > 10) {
          steps.push({ name: `${stepNumber}. ${stepName}`, text: plainStepText });
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

    return (
      <>
        <JsonLd data={articleSchema} />
        <JsonLd data={breadcrumbSchema} />
        {howToSchema && <JsonLd data={howToSchema} />}

        <main className="min-h-screen bg-[#FAFAF9] dark:bg-background">
          <article>
            {/* Hero image — full width, cinematic */}
            {post.featuredImage ? (
              <div className="relative w-full aspect-[21/9] md:aspect-[3/1]">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAF9] dark:from-background via-transparent to-transparent" />
              </div>
            ) : (
              <div className="w-full h-32 md:h-48 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
            )}

            {/* Article content */}
            <div className="container mx-auto max-w-3xl px-4 -mt-16 md:-mt-24 relative z-10">
              {/* Back link */}
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-primary transition-colors mb-8"
              >
                <ArrowLeft className="h-4 w-4" />
                Zpět na blog
              </Link>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="flex items-center gap-1.5 text-sm text-neutral-400 dark:text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {publishedDate}
                </span>
                <span className="text-neutral-300 dark:text-border">·</span>
                <span className="flex items-center gap-1.5 text-sm text-neutral-400 dark:text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {readTime} min čtení
                </span>
                {post.authorName && (
                  <>
                    <span className="text-neutral-300 dark:text-border">·</span>
                    <span className="flex items-center gap-1.5 text-sm text-neutral-400 dark:text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      {post.authorName}
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-foreground tracking-tight leading-[1.15] mb-6">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-lg md:text-xl text-neutral-500 dark:text-muted-foreground leading-relaxed mb-8">
                  {post.excerpt}
                </p>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-10">
                  {post.tags.map((tag: string, i: number) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="border-primary/30 text-primary bg-primary/5 font-normal text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <Separator className="mb-12 bg-neutral-200 dark:bg-border" />

              {/* Article body — clean typography */}
              <div
                className="prose prose-lg max-w-none dark:prose-invert
                  prose-headings:font-bold prose-headings:text-neutral-900 dark:prose-headings:text-foreground prose-headings:tracking-tight
                  prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-14 prose-h2:mb-6
                  prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-neutral-800 dark:prose-h3:text-foreground/90
                  prose-p:text-neutral-600 dark:prose-p:text-foreground/80 prose-p:leading-[1.85] prose-p:mb-6 prose-p:text-[17px]
                  prose-ul:my-6 prose-ul:text-neutral-600 dark:prose-ul:text-foreground/80 prose-ul:text-[17px]
                  prose-ol:my-6 prose-ol:text-neutral-600 dark:prose-ol:text-foreground/80 prose-ol:text-[17px]
                  prose-li:my-2 prose-li:leading-relaxed
                  prose-li:marker:text-primary
                  prose-strong:text-neutral-900 dark:prose-strong:text-foreground prose-strong:font-semibold
                  prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline prose-a:underline-offset-4
                  prose-code:text-primary prose-code:bg-primary/5 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-[15px] prose-code:font-mono
                  prose-pre:bg-neutral-900 prose-pre:rounded-xl prose-pre:shadow-lg prose-pre:p-5
                  prose-img:rounded-xl prose-img:shadow-lg prose-img:my-10
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-lg prose-blockquote:my-8 prose-blockquote:text-neutral-700 dark:prose-blockquote:text-foreground/80 prose-blockquote:italic prose-blockquote:not-italic
                  prose-hr:border-neutral-200 dark:prose-hr:border-border"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />

              {/* Share */}
              <Separator className="mt-14 mb-8 bg-neutral-200 dark:bg-border" />
              <ShareButtons
                url={`/blog/${slug}`}
                title={post.title}
                description={post.excerpt || undefined}
              />
            </div>
          </article>

          {/* Related posts — minimal */}
          {relatedPosts.length > 0 && (
            <section className="border-t border-neutral-200 dark:border-border mt-20">
              <div className="container mx-auto max-w-3xl px-4 py-16">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-foreground mb-10">
                  Další články
                </h2>
                <div className="space-y-0">
                  {relatedPosts.map((rp, idx) => (
                    <div key={rp.id}>
                      <Link href={`/blog/${rp.slug}`} className="group block py-6">
                        <div className="flex gap-6 items-start">
                          {rp.featuredImage && (
                            <div className="relative w-28 h-20 md:w-40 md:h-24 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={rp.featuredImage}
                                alt={rp.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-xs text-neutral-400 dark:text-muted-foreground">
                              {rp.publishedAt
                                ? new Date(rp.publishedAt).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
                                : new Date(rp.createdAt).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
                              }
                            </span>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-foreground group-hover:text-primary transition-colors leading-snug mt-1 line-clamp-2">
                              {rp.title}
                            </h3>
                            {rp.excerpt && (
                              <p className="text-sm text-neutral-500 dark:text-muted-foreground line-clamp-2 mt-1.5">
                                {rp.excerpt}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-neutral-300 group-hover:text-primary transition-colors flex-shrink-0 mt-2" />
                        </div>
                      </Link>
                      {idx < relatedPosts.length - 1 && (
                        <Separator className="bg-neutral-200 dark:bg-border" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="border-t border-neutral-200 dark:border-border bg-white dark:bg-card">
            <div className="container mx-auto max-w-3xl px-4 py-16 text-center space-y-6">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-foreground">
                Potřebujete pomoc s webem?
              </h3>
              <p className="text-neutral-500 dark:text-muted-foreground max-w-md mx-auto">
                Vytvoříme pro vás moderní web přesně podle vašich představ. Rychle, kvalitně a za férovou cenu.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Link href="/poptavka">
                  <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-3 text-base">
                    Nezávazná poptávka
                  </Button>
                </Link>
                <Link href="/portfolio">
                  <Button variant="outline" className="rounded-full px-8 py-3 text-base">
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
