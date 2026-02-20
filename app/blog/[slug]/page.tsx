import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getBlogPostBySlug, getPublishedBlogPostsByLanguage, getPostTranslations } from "@/lib/turso/blog";
import { getRequestLocale, getRequestBrandConfig } from "@/lib/brand-server";
import { JsonLd } from "@/components/seo/JsonLd";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { generateHowToSchema, HowToStep } from "@/lib/schema-generators";

// Engagement components
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar";
import { DesktopTableOfContents, MobileTableOfContents } from "@/components/blog/TableOfContents";
import { FloatingShareBar } from "@/components/blog/FloatingShareBar";
import { ArticleFeedback } from "@/components/blog/ArticleFeedback";
import { InlineNewsletterCTA } from "@/components/blog/InlineNewsletterCTA";
import { AuthorBoxSimple } from "@/components/blog/AuthorBoxSimple";
import { BlogCTA } from "@/components/blog/BlogCTA";

// Utilities
import { extractHeadings, addHeadingIds, splitContentForCTA, enhanceBlockquotes } from "@/lib/blog-utils";

// Locale-specific UI strings for blog detail
const blogDetailContent = {
  cs: {
    notFoundTitle: "Článek nenalezen | Weblyx Blog",
    readTimeSuffix: "min čtení",
    authorPrefix: "od",
    relatedLabel: "Další články",
    endLabel: "— konec článku —",
    backToBlog: "← Zpět na blog",
    ctaLabel: "Poptávka →",
    ctaLink: "/poptavka",
    dateLocale: "cs-CZ",
    schemaLocale: "cs-CZ",
  },
  de: {
    notFoundTitle: "Artikel nicht gefunden | Seitelyx Blog",
    readTimeSuffix: "Min. Lesezeit",
    authorPrefix: "von",
    relatedLabel: "Weitere Artikel",
    endLabel: "— Ende des Artikels —",
    backToBlog: "← Zurück zum Blog",
    ctaLabel: "Anfrage →",
    ctaLink: "/anfrage",
    dateLocale: "de-DE",
    schemaLocale: "de-DE",
  },
} as const;

export const revalidate = 60;
export const dynamicParams = true;

/**
 * Build hreflang alternates for a blog post using the parent_post_id
 * relationship to find the correct slug in each language.
 */
async function getBlogAlternateLanguages(
  post: { id: string; language: string; parentPostId?: string },
  currentSlug: string,
  baseUrl: string
): Promise<Record<string, string>> {
  const csBase = "https://www.weblyx.cz";
  const deBase = "https://seitelyx.de";

  const alternates: Record<string, string> = {
    "x-default": `${csBase}/blog/${currentSlug}`,
  };

  if (post.language === "cs") {
    alternates["cs"] = `${csBase}/blog/${currentSlug}`;
  } else {
    alternates["de"] = `${deBase}/blog/${currentSlug}`;
  }

  try {
    const translations = await getPostTranslations(post.id);
    for (const translation of translations) {
      if (translation.language === "de" && translation.published) {
        alternates["de"] = `${deBase}/blog/${translation.slug}`;
      } else if (translation.language === "cs" && translation.published) {
        alternates["cs"] = `${csBase}/blog/${translation.slug}`;
        alternates["x-default"] = `${csBase}/blog/${translation.slug}`;
      }
    }
  } catch (e) {
    console.error("Failed to fetch blog translations for hreflang:", e);
  }

  return alternates;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const brand = await getRequestBrandConfig();
  const t = blogDetailContent[locale];
  const baseUrl = brand.domain === 'seitelyx.de' ? 'https://seitelyx.de' : 'https://www.weblyx.cz';

  try {
    const post = await getBlogPostBySlug(slug);

    if (!post || !post.published) {
      return { title: t.notFoundTitle };
    }

    return {
      title: post.metaTitle
        ? post.metaTitle.replace(/\s*\|\s*(Weblyx|Seitelyx)(\s+Blog)?$/i, '')
        : post.title,
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
        siteName: brand.name,
        locale: locale === 'de' ? 'de_DE' : 'cs_CZ',
      },
      twitter: {
        card: "summary_large_image",
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt || '',
        images: post.featuredImage ? [post.featuredImage] : [],
        creator: `@${brand.name.toLowerCase()}`,
      },
      alternates: {
        canonical: `${baseUrl}/blog/${slug}`,
        languages: await getBlogAlternateLanguages(post, slug, baseUrl),
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
    return { title: t.notFoundTitle };
  }
}

// Shared prose classes for article content
const proseClasses = `prose prose-base md:prose-lg max-w-none dark:prose-invert
  prose-headings:font-semibold prose-headings:text-neutral-900 dark:prose-headings:text-foreground prose-headings:tracking-tight
  prose-h2:text-xl prose-h2:md:text-2xl prose-h2:mt-12 prose-h2:mb-5 prose-h2:pt-6 prose-h2:border-t prose-h2:border-neutral-100 dark:prose-h2:border-border prose-h2:scroll-mt-24
  prose-h3:text-lg prose-h3:md:text-xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:scroll-mt-24
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
  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/[0.03] dark:prose-blockquote:bg-primary/[0.06] prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-10 prose-blockquote:rounded-r-lg prose-blockquote:text-lg prose-blockquote:md:text-xl prose-blockquote:text-neutral-600 dark:prose-blockquote:text-foreground/70 prose-blockquote:italic prose-blockquote:leading-relaxed prose-blockquote:not-italic
  [&_blockquote_p]:italic [&_blockquote_p]:text-lg [&_blockquote_p]:md:text-xl [&_blockquote_p]:leading-relaxed [&_blockquote_p]:text-neutral-600 dark:[&_blockquote_p]:text-foreground/70
  prose-hr:border-neutral-100 dark:prose-hr:border-border`;

export default async function BlogPostPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  const locale = await getRequestLocale();
  const brand = await getRequestBrandConfig();
  const t = blogDetailContent[locale];
  const baseUrl = brand.domain === 'seitelyx.de' ? 'https://seitelyx.de' : 'https://www.weblyx.cz';

  try {
    const post = await getBlogPostBySlug(slug);

    if (!post || !post.published) {
      notFound();
    }

    // Related posts — same language, prefer tag overlap
    const allPosts = await getPublishedBlogPostsByLanguage(post.language);
    const otherPosts = allPosts.filter((p) => p.slug !== slug);

    // Score by tag overlap, then by recency
    const postTags = new Set(post.tags?.map(t => t.toLowerCase()) || []);
    const scoredPosts = otherPosts.map((p) => {
      const pTags = p.tags?.map(t => t.toLowerCase()) || [];
      const tagOverlap = pTags.filter(t => postTags.has(t)).length;
      return { post: p, score: tagOverlap };
    });
    scoredPosts.sort((a, b) => b.score - a.score || 0);
    const relatedPosts = scoredPosts.slice(0, 3).map(s => s.post);

    const publishedDate = post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString(t.dateLocale, { day: "numeric", month: "long", year: "numeric" })
      : new Date(post.createdAt).toLocaleDateString(t.dateLocale, { day: "numeric", month: "long", year: "numeric" });

    const isoDate = post.publishedAt
      ? new Date(post.publishedAt).toISOString().split("T")[0]
      : new Date(post.createdAt).toISOString().split("T")[0];

    // Process content (sanitize to prevent XSS from stored HTML)
    let htmlContent = await marked.parse(post.content, { gfm: true, breaks: true });
    htmlContent = sanitizeHtml(htmlContent, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'figure', 'figcaption', 'picture', 'source', 'video', 'details', 'summary']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
        a: ['href', 'title', 'target', 'rel'],
        '*': ['id', 'class'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
    });
    htmlContent = addHeadingIds(htmlContent);
    htmlContent = enhanceBlockquotes(htmlContent);

    const wordCount = post.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    // Extract headings for TOC
    const headings = extractHeadings(post.content);

    // Split content for inline newsletter CTA
    const [contentFirstHalf, contentSecondHalf] = splitContentForCTA(htmlContent);

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
        "url": `${baseUrl}/${locale === 'de' ? 'uber-uns' : 'o-nas'}`,
      },
      "publisher": {
        "@type": "Organization",
        "name": brand.name,
        "url": baseUrl,
        "logo": { "@type": "ImageObject", "url": `${baseUrl}/logo.png`, "width": 200, "height": 60 }
      },
      "datePublished": post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date(post.createdAt).toISOString(),
      "dateModified": post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date(post.createdAt).toISOString(),
      "mainEntityOfPage": { "@type": "WebPage", "@id": `${baseUrl}/blog/${slug}` },
      "keywords": post.tags?.join(', ') || '',
      "articleBody": plainTextContent,
      "wordCount": wordCount,
      "inLanguage": t.schemaLocale,
      "timeRequired": `PT${readTime}M`,
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": locale === 'de' ? "Startseite" : "Domů", "item": baseUrl },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${baseUrl}/blog` },
        { "@type": "ListItem", "position": 3, "name": post.title, "item": `${baseUrl}/blog/${slug}` }
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

        {/* Reading progress bar */}
        <ReadingProgressBar />

        {/* Floating share buttons */}
        <FloatingShareBar url={`/blog/${slug}`} title={post.title} />

        {/* Desktop Table of Contents */}
        {headings.length >= 3 && (
          <DesktopTableOfContents headings={headings} />
        )}

        <main className="min-h-screen bg-white dark:bg-background">
          <article id="article-content" className="max-w-2xl mx-auto px-6 pt-12 md:pt-20 pb-24 md:pb-16">
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
                  🕐 {readTime} {t.readTimeSuffix}
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
                      {t.authorPrefix}{" "}
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

            {/* Mobile Table of Contents */}
            {headings.length >= 3 && (
              <MobileTableOfContents headings={headings} />
            )}

            {/* Article body — first half */}
            <div
              className={proseClasses}
              dangerouslySetInnerHTML={{ __html: contentFirstHalf }}
            />

            {/* Inline Newsletter CTA (appears at ~40% of article) */}
            {contentSecondHalf && (
              <InlineNewsletterCTA />
            )}

            {/* Article body — second half */}
            {contentSecondHalf && (
              <div
                className={proseClasses}
                dangerouslySetInnerHTML={{ __html: contentSecondHalf }}
              />
            )}

            {/* CTA after article */}
            <BlogCTA locale={locale} />

            {/* Article feedback */}
            <ArticleFeedback postId={post.id} />

            {/* Author box */}
            <AuthorBoxSimple locale={locale} />

            <Separator className="bg-neutral-100 dark:bg-border mt-10 mb-8" />

            {/* Related posts — enhanced card layout */}
            {relatedPosts.length > 0 && (
              <div className="space-y-6">
                <p className="text-xs text-neutral-300 dark:text-border uppercase tracking-widest font-mono">
                  {t.relatedLabel}
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedPosts.map((rp) => (
                    <Link
                      key={rp.id}
                      href={`/blog/${rp.slug}`}
                      className="group block rounded-xl border border-neutral-100 dark:border-border overflow-hidden hover:border-primary/20 hover:shadow-sm transition-all duration-300"
                    >
                      {rp.featuredImage && (
                        <div className="relative w-full h-32 overflow-hidden bg-neutral-100 dark:bg-card">
                          <Image
                            src={rp.featuredImage}
                            alt={rp.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-2">
                          {rp.title}
                        </h3>
                        {rp.excerpt && (
                          <p className="text-xs text-neutral-400 dark:text-muted-foreground leading-relaxed line-clamp-2 mb-2">
                            {rp.excerpt}
                          </p>
                        )}
                        <span className="text-[11px] text-neutral-300 dark:text-neutral-400 font-mono">
                          {rp.publishedAt
                            ? new Date(rp.publishedAt).toISOString().split("T")[0]
                            : new Date(rp.createdAt).toISOString().split("T")[0]
                          }
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <Separator className="bg-neutral-100 dark:bg-border mt-10 mb-8" />
            <div className="text-center space-y-3">
              <p className="text-xs text-neutral-300 dark:text-border uppercase tracking-widest font-mono">
                {t.endLabel}
              </p>
              <div className="flex items-center justify-center gap-4 pt-2">
                <Link
                  href="/blog"
                  className="text-sm text-neutral-400 hover:text-primary transition-colors"
                >
                  {t.backToBlog}
                </Link>
                <Link
                  href={t.ctaLink}
                  className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  {t.ctaLabel}
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
