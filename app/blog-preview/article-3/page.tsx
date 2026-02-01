import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  ChevronLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getBlogPostBySlug } from "@/lib/turso/blog";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { marked } from "marked";

export const revalidate = 60;

const SLUG = "wordpress-vs-nextjs-srovnani-2026";

export default async function ArticleClean() {
  const post = await getBlogPostBySlug(SLUG);

  if (!post || !post.published) {
    notFound();
  }

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("cs-CZ", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date(post.createdAt).toLocaleDateString("cs-CZ", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const isoDate = post.publishedAt
    ? new Date(post.publishedAt).toISOString().split("T")[0]
    : new Date(post.createdAt).toISOString().split("T")[0];

  const htmlContent = await marked.parse(post.content, {
    gfm: true,
    breaks: true,
  });

  const wordCount = post.content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <main className="min-h-screen bg-white dark:bg-background">
      {/* Design switcher nav — ultra minimal */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-background/90 backdrop-blur-sm border-b border-neutral-100 dark:border-border">
        <div className="max-w-2xl mx-auto px-6 h-12 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-900 dark:hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Blog
          </Link>
          <div className="flex items-center gap-1">
            <span className="text-xs text-neutral-300 mr-2 hidden sm:inline">
              Design:
            </span>
            <Link href="/blog-preview/article-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2 text-neutral-400 hover:text-primary"
              >
                Editorial
              </Button>
            </Link>
            <Link href="/blog-preview/article-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2 text-neutral-400 hover:text-primary"
              >
                Card
              </Button>
            </Link>
            <Link href="/blog-preview/article-3">
              <Button
                size="sm"
                className="bg-primary text-white hover:bg-primary/90 text-xs h-7 px-2"
              >
                Clean
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <article className="max-w-2xl mx-auto px-6 pt-12 md:pt-20 pb-16">
        {/* Header — title with small thumbnail */}
        <header className="mb-10 md:mb-14">
          {/* Monospace date + reading time */}
          <div className="flex items-center gap-3 mb-6">
            <time
              dateTime={isoDate}
              className="text-sm text-neutral-400 dark:text-muted-foreground"
              style={{ fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', monospace" }}
            >
              {isoDate}
            </time>
            <span className="text-neutral-200 dark:text-border">·</span>
            <span
              className="text-sm text-neutral-400 dark:text-muted-foreground"
              style={{ fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', monospace" }}
            >
              {readTime} min read
            </span>
          </div>

          {/* Title + thumbnail row */}
          <div className="flex gap-5 items-start">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-foreground tracking-tight leading-[1.2] mb-4">
                {post.title}
              </h1>

              {/* Author */}
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

        {/* Thin separator */}
        <Separator className="bg-neutral-100 dark:bg-border mb-10 md:mb-14" />

        {/* Article body — ultra clean */}
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

        {/* Thin separator */}
        <Separator className="bg-neutral-100 dark:bg-border mt-12 mb-8" />

        {/* Share — minimal */}
        <ShareButtons
          url={`/blog/${SLUG}`}
          title={post.title}
          description={post.excerpt || undefined}
        />

        {/* End separator */}
        <Separator className="bg-neutral-100 dark:bg-border mt-8 mb-10" />

        {/* Minimal footer text */}
        <div className="text-center space-y-3">
          <p
            className="text-xs text-neutral-300 dark:text-border uppercase tracking-widest"
            style={{ fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', monospace" }}
          >
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
  );
}
