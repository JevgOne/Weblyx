import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, ArrowLeft, ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import { getPublishedBlogPosts } from "@/lib/turso/blog";

export const revalidate = 60;

function formatDate(date?: Date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogDesign3() {
  const posts = await getPublishedBlogPosts();

  return (
    <main className="min-h-screen bg-[#FAFAF9]">
      {/* Minimalist top nav */}
      <nav className="sticky top-0 z-50 bg-[#FAFAF9]/90 backdrop-blur-lg border-b border-neutral-200">
        <div className="container mx-auto max-w-4xl flex items-center justify-between h-14 px-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-[#14B8A6] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Blog
          </Link>
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-[#14B8A6]" />
            <span className="font-medium text-neutral-800">Design 3 — <span className="text-[#14B8A6]">Minimal</span></span>
          </div>
          <div className="flex gap-2">
            <Link href="/blog-preview/design-1">
              <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-neutral-800">Design 1</Button>
            </Link>
            <Link href="/blog-preview/design-2">
              <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-neutral-800">Design 2</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header — ultra minimal */}
      <section className="container mx-auto max-w-4xl px-4 pt-20 pb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-neutral-900 tracking-tight">
          Weblyx <span className="text-[#14B8A6]">Blog</span>
        </h1>
        <p className="mt-4 text-lg text-neutral-500 max-w-xl mx-auto leading-relaxed">
          Tipy, trendy a know-how ze světa moderního webu
        </p>
        <Separator className="mt-10 mx-auto max-w-xs bg-neutral-300" />
      </section>

      {posts.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <p className="text-neutral-400 text-lg">Zatím žádné články.</p>
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
                  <span className="flex items-center gap-1.5 text-sm text-neutral-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(post.publishedAt || post.createdAt)}
                  </span>
                  <span className="text-neutral-300">·</span>
                  <span className="flex items-center gap-1.5 text-sm text-neutral-400">
                    <Clock className="h-3.5 w-3.5" />
                    5 min čtení
                  </span>
                  {post.tags?.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-[#14B8A6]/30 text-[#14B8A6] bg-[#14B8A6]/5 font-normal text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-neutral-900 group-hover:text-[#14B8A6] transition-colors duration-300 leading-snug mb-4">
                  {post.title}
                </h2>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-neutral-500 text-lg md:text-xl leading-relaxed max-w-3xl line-clamp-3 mb-6">
                    {post.excerpt}
                  </p>
                )}

                {/* Read more */}
                <span className="inline-flex items-center gap-2 text-[#14B8A6] font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                  Pokračovat ve čtení
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>

              {/* Divider between articles */}
              {idx < posts.length - 1 && (
                <Separator className="bg-neutral-200" />
              )}
            </div>
          ))}
        </section>
      )}

      {/* Footer CTA */}
      <section className="border-t border-neutral-200 bg-white">
        <div className="container mx-auto max-w-4xl px-4 py-16 text-center space-y-6">
          <h3 className="text-2xl font-serif font-bold text-neutral-900">
            Chcete moderní web?
          </h3>
          <p className="text-neutral-500 max-w-md mx-auto">
            Pomůžeme vám vytvořit web, který nejen skvěle vypadá, ale i konvertuje.
          </p>
          <Link href="/#kontakt">
            <Button className="bg-[#14B8A6] hover:bg-[#0D9488] text-white rounded-full px-8 py-3 text-base mt-2">
              Nezávazná konzultace
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
