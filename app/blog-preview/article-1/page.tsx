import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock, User, Tag, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getBlogPostBySlug } from "@/lib/turso/blog";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { marked } from "marked";

export const revalidate = 60;

const SLUG = "wordpress-vs-nextjs-srovnani-2026";

export default async function ArticleEditorial() {
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

  const htmlContent = await marked.parse(post.content, {
    gfm: true,
    breaks: true,
  });

  const wordCount = post.content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <main className="min-h-screen bg-white dark:bg-background">
      {/* Design switcher nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-neutral-200 dark:border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Zpět na blog
          </Link>
          <div className="flex items-center gap-1">
            <span className="text-xs text-neutral-400 mr-2 hidden sm:inline">
              Design:
            </span>
            <Link href="/blog-preview/article-1">
              <Button
                size="sm"
                className="bg-primary text-white hover:bg-primary/90 text-xs h-8"
              >
                Editorial
              </Button>
            </Link>
            <Link href="/blog-preview/article-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 text-neutral-500 hover:text-primary"
              >
                Card
              </Button>
            </Link>
            <Link href="/blog-preview/article-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 text-neutral-500 hover:text-primary"
              >
                Clean
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <article>
        {/* Cinematic hero — full width, text overlay */}
        <div className="relative w-full h-[70vh] md:h-[85vh] mt-14">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

          {/* Content over image */}
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto max-w-4xl px-6 pb-12 md:pb-20">
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag: string, i: number) => (
                    <Badge
                      key={i}
                      className="bg-primary/90 text-white border-none text-xs font-medium px-3 py-1"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Title — serif style, large */}
              <h1
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mb-8">
                  {post.excerpt}
                </p>
              )}

              {/* Meta bar */}
              <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {publishedDate}
                </span>
                <span className="text-white/30">·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {readTime} min čtení
                </span>
                {post.authorName && (
                  <>
                    <span className="text-white/30">·</span>
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      {post.authorName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Article body — narrow column, lots of white space */}
        <div className="container mx-auto max-w-2xl px-6 py-16 md:py-24">
          {/* Drop cap effect via prose */}
          <div
            className="prose prose-lg md:prose-xl max-w-none dark:prose-invert
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-16 prose-h2:mb-6
              prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-12 prose-h3:mb-4
              prose-p:text-neutral-600 dark:prose-p:text-foreground/80 prose-p:leading-[1.9] prose-p:mb-7 prose-p:text-[17px] prose-p:md:text-[18px]
              prose-ul:my-6 prose-ul:text-neutral-600 dark:prose-ul:text-foreground/80
              prose-ol:my-6 prose-ol:text-neutral-600 dark:prose-ol:text-foreground/80
              prose-li:my-2 prose-li:leading-relaxed
              prose-li:marker:text-primary
              prose-strong:text-neutral-900 dark:prose-strong:text-foreground prose-strong:font-semibold
              prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline prose-a:underline-offset-4
              prose-code:text-primary prose-code:bg-primary/5 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-[15px]
              prose-pre:bg-neutral-900 prose-pre:rounded-xl prose-pre:shadow-lg prose-pre:p-6
              prose-img:rounded-xl prose-img:shadow-lg prose-img:my-12
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:my-10 prose-blockquote:text-neutral-700 dark:prose-blockquote:text-foreground/80
              prose-hr:border-neutral-200 dark:prose-hr:border-border"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Share */}
          <Separator className="mt-16 mb-10 bg-neutral-200 dark:bg-border" />
          <ShareButtons
            url={`/blog/${SLUG}`}
            title={post.title}
            description={post.excerpt || undefined}
          />
        </div>
      </article>

      {/* Footer CTA */}
      <section className="border-t border-neutral-100 dark:border-border bg-neutral-50 dark:bg-card">
        <div className="container mx-auto max-w-2xl px-6 py-16 text-center space-y-5">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-foreground">
            Potřebujete moderní web?
          </h3>
          <p className="text-neutral-500 dark:text-muted-foreground max-w-md mx-auto">
            Vytvoříme pro vás web, který bude rychlý, bezpečný a SEO optimalizovaný.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/poptavka">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-3">
                Nezávazná poptávka
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="outline" className="rounded-full px-8 py-3">
                Další články
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
