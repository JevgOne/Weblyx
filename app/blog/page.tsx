import type { Metadata } from "next";
import { getAlternateLanguages } from "@/lib/seo-metadata";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import { getPublishedBlogPosts } from "@/lib/turso/blog";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog – tipy a trendy ze světa webu a online marketingu",
  description: "Sdílíme know-how z oblasti tvorby webu, SEO, rychlosti webu a online marketingu. Články píšeme tak, aby byly srozumitelné a praktické.",
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
    url: "https://www.weblyx.cz/blog",
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
    canonical: "https://www.weblyx.cz/blog",
    languages: getAlternateLanguages('/blog')
  }
};

function formatDate(date?: Date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function estimateReadTime(content?: string): string {
  if (!content) return "5 min";
  const words = content.split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

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
              item: "https://www.weblyx.cz",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blog",
              item: "https://www.weblyx.cz/blog",
            },
          ],
        }}
      />

      {/* Blog CollectionPage schema */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Weblyx Blog",
          description: "Praktické tipy, trendy a know-how ze světa moderního webu, SEO a online marketingu",
          url: "https://www.weblyx.cz/blog",
          publisher: {
            "@type": "Organization",
            name: "Weblyx",
            url: "https://www.weblyx.cz",
          },
        }}
      />

      <main className="min-h-screen bg-[#FAFAF9] dark:bg-background">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Blog", href: "/blog" }
          ]}
        />

        {/* Header — minimal */}
        <section className="container mx-auto max-w-4xl px-4 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {posts.length} {posts.length === 1 ? 'článek' : posts.length < 5 ? 'články' : 'článků'}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 dark:text-foreground tracking-tight">
            Weblyx <span className="text-primary">Blog</span>
          </h1>
          <p className="mt-4 text-lg text-neutral-500 dark:text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Praktické tipy, trendy a know-how ze světa moderního webu
          </p>
          <Separator className="mt-10 mx-auto max-w-xs bg-neutral-300 dark:bg-border" />
        </section>

        {posts.length === 0 ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <p className="text-neutral-400 dark:text-muted-foreground text-lg">
              Zatím zde nejsou žádné publikované články. Brzy se tu objeví nový obsah!
            </p>
          </div>
        ) : (
          <section className="container mx-auto max-w-4xl px-4 pb-24 space-y-0">
            {posts.map((post, idx) => (
              <div key={post.id}>
                <Link href={`/blog/${post.slug}`} className="group block py-10 md:py-14">
                  {/* Full-width image */}
                  {post.featuredImage && (
                    <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-8">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  )}

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="flex items-center gap-1.5 text-sm text-neutral-400 dark:text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(post.publishedAt || post.createdAt)}
                    </span>
                    <span className="text-neutral-300 dark:text-border">·</span>
                    <span className="flex items-center gap-1.5 text-sm text-neutral-400 dark:text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {estimateReadTime(post.content)} čtení
                    </span>
                    {post.tags?.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-primary/30 text-primary bg-primary/5 font-normal text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-foreground group-hover:text-primary transition-colors duration-300 leading-snug mb-4">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-neutral-500 dark:text-muted-foreground text-lg md:text-xl leading-relaxed max-w-3xl line-clamp-3 mb-6">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Read more */}
                  <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                    Pokračovat ve čtení
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>

                {/* Divider between articles */}
                {idx < posts.length - 1 && (
                  <Separator className="bg-neutral-200 dark:bg-border" />
                )}
              </div>
            ))}
          </section>
        )}

        {/* Footer CTA */}
        <section className="border-t border-neutral-200 dark:border-border bg-white dark:bg-card">
          <div className="container mx-auto max-w-4xl px-4 py-16 text-center space-y-6">
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
                  <ArrowRight className="h-4 w-4 ml-2" />
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
}
