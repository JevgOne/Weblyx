import type { Metadata } from "next";
import { getAlternateLanguages } from "@/lib/seo-metadata";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import { getPublishedBlogPostsByLanguage } from "@/lib/turso/blog";
import { getRequestLocale, getRequestBrandConfig } from "@/lib/brand-server";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const revalidate = 60;

// Locale-specific blog page content
const blogPageContent = {
  cs: {
    metaTitle: "Blog – tipy a trendy ze světa webu a online marketingu",
    metaDescription: "Sdílíme know-how z oblasti tvorby webu, SEO, rychlosti webu a online marketingu. Články píšeme tak, aby byly srozumitelné a praktické.",
    metaKeywords: ["blog tvorba webů", "SEO tipy", "rychlost webu", "WordPress vs Next.js", "webové technologie", "online marketing"],
    ogTitle: "Blog | Weblyx – tipy ze světa webu",
    ogDescription: "Praktické tipy z oblasti tvorby webu, SEO a online marketingu.",
    ogImageAlt: "Weblyx - Blog",
    articleCount: (n: number) => `${n} ${n === 1 ? 'článek' : n < 5 ? 'články' : 'článků'}`,
    heading: "Weblyx",
    subtitle: "Praktické tipy, trendy a know-how ze světa moderního webu",
    emptyState: "Zatím zde nejsou žádné publikované články. Brzy se tu objeví nový obsah!",
    readMore: "Pokračovat ve čtení",
    readTimeSuffix: "čtení",
    ctaTitle: "Potřebujete pomoc s webem?",
    ctaDescription: "Vytvoříme pro vás moderní web přesně podle vašich představ. Rychle, kvalitně a za férovou cenu.",
    ctaButton: "Nezávazná poptávka",
    ctaSecondary: "Naše projekty",
    ctaLink: "/poptavka",
    ctaSecondaryLink: "/portfolio",
    breadcrumbHome: "Domů",
    dateLocale: "cs-CZ",
    schemaName: "Weblyx Blog",
    schemaDescription: "Praktické tipy, trendy a know-how ze světa moderního webu, SEO a online marketingu",
  },
  de: {
    metaTitle: "Blog – Tipps und Trends aus der Welt des Webs und Online-Marketings",
    metaDescription: "Wir teilen Know-how aus den Bereichen Webentwicklung, SEO, Website-Geschwindigkeit und Online-Marketing. Praxisnah und verständlich.",
    metaKeywords: ["Webdesign Blog", "SEO Tipps", "Website Geschwindigkeit", "WordPress vs Next.js", "Webtechnologien", "Online Marketing"],
    ogTitle: "Blog | Seitelyx – Tipps aus der Welt des Webs",
    ogDescription: "Praktische Tipps aus den Bereichen Webentwicklung, SEO und Online-Marketing.",
    ogImageAlt: "Seitelyx - Blog",
    articleCount: (n: number) => `${n} ${n === 1 ? 'Artikel' : 'Artikel'}`,
    heading: "Seitelyx",
    subtitle: "Praktische Tipps, Trends und Know-how aus der modernen Webwelt",
    emptyState: "Noch keine Artikel auf Deutsch verfügbar. Bald erscheinen hier neue Inhalte!",
    readMore: "Weiterlesen",
    readTimeSuffix: "Lesezeit",
    ctaTitle: "Brauchen Sie Hilfe mit Ihrer Website?",
    ctaDescription: "Wir erstellen für Sie eine moderne Website nach Ihren Vorstellungen. Schnell, hochwertig und zu fairen Preisen.",
    ctaButton: "Unverbindliche Anfrage",
    ctaSecondary: "Unsere Projekte",
    ctaLink: "/anfrage",
    ctaSecondaryLink: "/portfolio",
    breadcrumbHome: "Startseite",
    dateLocale: "de-DE",
    schemaName: "Seitelyx Blog",
    schemaDescription: "Praktische Tipps, Trends und Know-how aus der modernen Webwelt, SEO und Online-Marketing",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const brand = await getRequestBrandConfig();
  const t = blogPageContent[locale];

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    keywords: [...t.metaKeywords],
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: `${brand.domain === 'seitelyx.de' ? 'https://seitelyx.de' : 'https://www.weblyx.cz'}/blog`,
      type: "website",
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: t.ogImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.ogTitle,
      description: t.ogDescription,
    },
    alternates: {
      canonical: `${brand.domain === 'seitelyx.de' ? 'https://seitelyx.de' : 'https://www.weblyx.cz'}/blog`,
      languages: getAlternateLanguages('/blog'),
    },
  };
}

function formatDate(date: Date | undefined, locale: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString(locale, {
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
  const locale = await getRequestLocale();
  const brand = await getRequestBrandConfig();
  const t = blogPageContent[locale];
  const baseUrl = brand.domain === 'seitelyx.de' ? 'https://seitelyx.de' : 'https://www.weblyx.cz';

  const posts = await getPublishedBlogPostsByLanguage(locale);

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
              name: t.breadcrumbHome,
              item: baseUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blog",
              item: `${baseUrl}/blog`,
            },
          ],
        }}
      />

      {/* Blog CollectionPage schema */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: t.schemaName,
          description: t.schemaDescription,
          url: `${baseUrl}/blog`,
          inLanguage: locale === 'de' ? 'de-DE' : 'cs-CZ',
          publisher: {
            "@type": "Organization",
            name: brand.name,
            url: baseUrl,
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
              {t.articleCount(posts.length)}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 dark:text-foreground tracking-tight">
            {t.heading} <span className="text-primary">Blog</span>
          </h1>
          <p className="mt-4 text-lg text-neutral-500 dark:text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
          <Separator className="mt-10 mx-auto max-w-xs bg-neutral-300 dark:bg-border" />
        </section>

        {posts.length === 0 ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <p className="text-neutral-400 dark:text-muted-foreground text-lg">
              {t.emptyState}
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
                      {formatDate(post.publishedAt || post.createdAt, t.dateLocale)}
                    </span>
                    <span className="text-neutral-300 dark:text-border">·</span>
                    <span className="flex items-center gap-1.5 text-sm text-neutral-400 dark:text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {estimateReadTime(post.content)} {t.readTimeSuffix}
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
                    {t.readMore}
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
              {t.ctaTitle}
            </h3>
            <p className="text-neutral-500 dark:text-muted-foreground max-w-md mx-auto">
              {t.ctaDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link href={t.ctaLink}>
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-3 text-base">
                  {t.ctaButton}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href={t.ctaSecondaryLink}>
                <Button variant="outline" className="rounded-full px-8 py-3 text-base">
                  {t.ctaSecondary}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
