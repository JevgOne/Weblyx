import type { Metadata } from "next";
import { getAlternateLanguages } from "@/lib/seo-metadata";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
        languages: getAlternateLanguages('/blog/' + slug),
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

    // Related posts
    const allPosts = await getPublishedBlogPosts();
    const relatedPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

    const publishedDate = post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" })
      : new Date(post.createdAt).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });

    const isoDate = post.publishedAt
      ? new Date(post.publishedAt).toISOString().split("T")[0]
      : new Date(post.createdAt).toISOString().split("T")[0];

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

        <main className="min-h-screen bg-white dark:bg-background">
          <article className="max-w-2xl mx-auto px-6 pt-12 md:pt-20 pb-16">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-900 dark:hover:text-foreground transition-colors mb-10"
            >
              <ChevronLeft className="h-4 w-4" />
              Blog
            </Link>

            {/* Header */}
            <header className="mb-10 md:mb-14">
              {/* Monospace date + reading time */}
              <div className="flex items-center gap-3 mb-6">
                <time
                  dateTime={isoDate}
                  className="text-sm text-neutral-400 dark:text-muted-foreground font-mono"
                >
                  {isoDate}
                </time>
                <span className="text-neutral-200 dark:text-border">·</span>
                <span className="text-sm text-neutral-400 dark:text-muted-foreground font-mono">
                  {readTime} min čtení
                </span>
              </div>

              {/* Title + thumbnail row */}
              <div className="flex gap-5 items-start">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-foreground tracking-tight leading-[1.2] mb-4">
                    {post.title}
                  </h1>

                  {post.authorName && (
                    <p className="text-sm text-neutral-400 dark:text-muted-foreground">
                      od{" "}
                      <span className="text-neutral-600 dark:text-foreground/70 font-medium">
                        {post.authorName}
                      </span>
                    </p>
                  )}
                </div>

                {/* Small thumbnail */}
                {post.featuredImage && (
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      priority
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-base md:text-lg text-neutral-500 dark:text-muted-foreground leading-relaxed mt-5">
                  {post.excerpt}
                </p>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-6">
                  {post.tags.map((tag: string, i: number) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="border-neutral-200 dark:border-border text-neutral-500 dark:text-muted-foreground bg-transparent font-normal text-xs rounded-full px-3"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </header>

            <Separator className="bg-neutral-100 dark:bg-border mb-10 md:mb-14" />

            {/* Article body */}
            <div
              className="prose prose-base md:prose-lg max-w-none dark:prose-invert
                prose-headings:font-semibold prose-headings:text-neutral-900 dark:prose-headings:text-foreground prose-headings:tracking-tight
                prose-h2:text-xl prose-h2:md:text-2xl prose-h2:mt-12 prose-h2:mb-5 prose-h2:pt-6 prose-h2:border-t prose-h2:border-neutral-100 dark:prose-h2:border-border
                prose-h3:text-lg prose-h3:md:text-xl prose-h3:mt-10 prose-h3:mb-4
                prose-p:text-neutral-600 dark:prose-p:text-foreground/80 prose-p:leading-[1.9] prose-p:mb-5 prose-p:text-[16px] prose-p:md:text-[17px]
                prose-ul:my-5 prose-ul:text-neutral-600 dark:prose-ul:text-foreground/80
                prose-ol:my-5 prose-ol:text-neutral-600 dark:prose-ol:text-foreground/80
                prose-li:my-1.5 prose-li:leading-relaxed
                prose-li:marker:text-neutral-300 dark:prose-li:marker:text-border
                prose-strong:text-neutral-800 dark:prose-strong:text-foreground prose-strong:font-semibold
                prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline prose-a:underline-offset-4
                prose-code:text-neutral-700 dark:prose-code:text-foreground/90 prose-code:bg-neutral-100 dark:prose-code:bg-border prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[14px]
                prose-pre:bg-neutral-50 dark:prose-pre:bg-card prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-border prose-pre:rounded-lg prose-pre:p-5 prose-pre:shadow-none
                prose-img:rounded-lg prose-img:border prose-img:border-neutral-200 dark:prose-img:border-border prose-img:my-8 prose-img:shadow-none
                prose-blockquote:border-l-2 prose-blockquote:border-neutral-200 dark:prose-blockquote:border-border prose-blockquote:bg-transparent prose-blockquote:py-0 prose-blockquote:px-4 prose-blockquote:my-6 prose-blockquote:text-neutral-500 dark:prose-blockquote:text-foreground/60 prose-blockquote:italic
                prose-hr:border-neutral-100 dark:prose-hr:border-border"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            <Separator className="bg-neutral-100 dark:bg-border mt-12 mb-8" />

            {/* Share */}
            <ShareButtons
              url={`/blog/${slug}`}
              title={post.title}
              description={post.excerpt || undefined}
            />

            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <>
                <Separator className="bg-neutral-100 dark:bg-border mt-8 mb-10" />
                <div className="space-y-6">
                  <p className="text-xs text-neutral-300 dark:text-border uppercase tracking-widest font-mono">
                    Další články
                  </p>
                  {relatedPosts.map((rp) => (
                    <Link
                      key={rp.id}
                      href={`/blog/${rp.slug}`}
                      className="group flex gap-4 items-start"
                    >
                      {rp.featuredImage && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={rp.featuredImage}
                            alt={rp.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-neutral-900 dark:text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {rp.title}
                        </h3>
                        <span className="text-xs text-neutral-400 dark:text-muted-foreground font-mono mt-1 block">
                          {rp.publishedAt
                            ? new Date(rp.publishedAt).toISOString().split("T")[0]
                            : new Date(rp.createdAt).toISOString().split("T")[0]
                          }
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* Footer */}
            <Separator className="bg-neutral-100 dark:bg-border mt-10 mb-8" />
            <div className="text-center space-y-3">
              <p className="text-xs text-neutral-300 dark:text-border uppercase tracking-widest font-mono">
                — konec článku —
              </p>
              <div className="flex items-center justify-center gap-4 pt-2">
                <Link
                  href="/blog"
                  className="text-sm text-neutral-400 hover:text-primary transition-colors"
                >
                  ← Zpět na blog
                </Link>
                <Link
                  href="/poptavka"
                  className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Poptávka →
                </Link>
              </div>
            </div>
          </article>
        </main>
      </>
    );
  } catch (error) {
    console.error('Error loading blog post:', error);
    notFound();
  }
}
