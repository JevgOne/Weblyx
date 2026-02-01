import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  BookOpen,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getBlogPostBySlug } from "@/lib/turso/blog";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { marked } from "marked";

export const revalidate = 60;

const SLUG = "wordpress-vs-nextjs-srovnani-2026";

export default async function ArticleCard() {
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
    <main className="min-h-screen bg-neutral-50 dark:bg-background">
      {/* Design switcher nav */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-neutral-200 dark:border-border">
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
                variant="ghost"
                size="sm"
                className="text-xs h-8 text-neutral-500 hover:text-primary"
              >
                Editorial
              </Button>
            </Link>
            <Link href="/blog-preview/article-2">
              <Button
                size="sm"
                className="bg-primary text-white hover:bg-primary/90 text-xs h-8"
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

      <article className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        {/* Hero card — rounded with padding */}
        <div className="bg-white dark:bg-card rounded-2xl md:rounded-3xl shadow-sm border border-neutral-200 dark:border-border overflow-hidden mb-8 md:mb-12">
          <div className="p-4 md:p-6 lg:p-8">
            {post.featuredImage && (
              <div className="relative w-full aspect-[2/1] md:aspect-[21/9] rounded-xl md:rounded-2xl overflow-hidden">
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
        </div>

        {/* Two-column layout: sidebar + content */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar — sticky on desktop */}
          <aside className="lg:w-72 xl:w-80 flex-shrink-0 order-2 lg:order-1">
            <div className="lg:sticky lg:top-20 space-y-6">
              {/* Meta card */}
              <div className="bg-white dark:bg-card rounded-2xl border border-neutral-200 dark:border-border p-6 space-y-5">
                <h3 className="text-xs font-semibold text-neutral-400 dark:text-muted-foreground uppercase tracking-wider">
                  Informace
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 dark:text-muted-foreground">
                        Publikováno
                      </p>
                      <p className="text-sm font-medium text-neutral-700 dark:text-foreground">
                        {publishedDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 dark:text-muted-foreground">
                        Doba čtení
                      </p>
                      <p className="text-sm font-medium text-neutral-700 dark:text-foreground">
                        {readTime} min
                      </p>
                    </div>
                  </div>

                  {post.authorName && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 dark:text-muted-foreground">
                          Autor
                        </p>
                        <p className="text-sm font-medium text-neutral-700 dark:text-foreground">
                          {post.authorName}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 dark:text-muted-foreground">
                        Počet slov
                      </p>
                      <p className="text-sm font-medium text-neutral-700 dark:text-foreground">
                        {wordCount.toLocaleString("cs-CZ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags card */}
              {post.tags && post.tags.length > 0 && (
                <div className="bg-white dark:bg-card rounded-2xl border border-neutral-200 dark:border-border p-6 space-y-4">
                  <h3 className="text-xs font-semibold text-neutral-400 dark:text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5" />
                    Témata
                  </h3>
                  <div className="flex flex-wrap gap-2">
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
                </div>
              )}

              {/* Share card */}
              <div className="bg-white dark:bg-card rounded-2xl border border-neutral-200 dark:border-border p-6 space-y-4">
                <h3 className="text-xs font-semibold text-neutral-400 dark:text-muted-foreground uppercase tracking-wider">
                  Sdílet článek
                </h3>
                <ShareButtons
                  url={`/blog/${SLUG}`}
                  title={post.title}
                  description={post.excerpt || undefined}
                />
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 order-1 lg:order-2">
            <div className="bg-white dark:bg-card rounded-2xl border border-neutral-200 dark:border-border p-6 md:p-8 lg:p-10">
              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-foreground tracking-tight leading-[1.15] mb-6">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-lg text-neutral-500 dark:text-muted-foreground leading-relaxed mb-8 pb-8 border-b border-neutral-100 dark:border-border">
                  {post.excerpt}
                </p>
              )}

              {/* Article body */}
              <div
                className="prose prose-lg max-w-none dark:prose-invert
                  prose-headings:font-bold prose-headings:text-neutral-900 dark:prose-headings:text-foreground prose-headings:tracking-tight
                  prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-14 prose-h2:mb-6
                  prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-10 prose-h3:mb-4
                  prose-p:text-neutral-600 dark:prose-p:text-foreground/80 prose-p:leading-[1.85] prose-p:mb-6 prose-p:text-[17px]
                  prose-ul:my-6 prose-ul:text-neutral-600 dark:prose-ul:text-foreground/80
                  prose-ol:my-6 prose-ol:text-neutral-600 dark:prose-ol:text-foreground/80
                  prose-li:my-2 prose-li:leading-relaxed
                  prose-li:marker:text-primary
                  prose-strong:text-neutral-900 dark:prose-strong:text-foreground prose-strong:font-semibold
                  prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline prose-a:underline-offset-4
                  prose-code:text-primary prose-code:bg-primary/5 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-[15px]
                  prose-pre:bg-neutral-900 prose-pre:rounded-xl prose-pre:shadow-lg prose-pre:p-5
                  prose-img:rounded-xl prose-img:shadow-lg prose-img:my-10
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-lg prose-blockquote:my-8 prose-blockquote:text-neutral-700 dark:prose-blockquote:text-foreground/80
                  prose-hr:border-neutral-200 dark:prose-hr:border-border"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>
        </div>
      </article>

      {/* Footer CTA */}
      <section className="border-t border-neutral-200 dark:border-border bg-white dark:bg-card mt-12">
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center space-y-5">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-foreground">
            Potřebujete moderní web?
          </h3>
          <p className="text-neutral-500 dark:text-muted-foreground max-w-md mx-auto">
            Vytvoříme pro vás web na míru — rychlý, bezpečný a SEO optimalizovaný.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/poptavka">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-3">
                Nezávazná poptávka
              </Button>
            </Link>
            <Link href="/portfolio">
              <Button variant="outline" className="rounded-full px-8 py-3">
                Naše projekty
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
