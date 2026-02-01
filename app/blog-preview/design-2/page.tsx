import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, ArrowUpRight, Sparkles, Eye } from "lucide-react";
import { getPublishedBlogPosts } from "@/lib/turso/blog";

export const revalidate = 60;

function formatDate(date?: Date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function BlogDesign2() {
  const posts = await getPublishedBlogPosts();

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Top bar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl flex items-center justify-between h-14 px-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-[#14B8A6] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Blog
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#14B8A6]" />
            <span className="font-semibold">Design 2 — <span className="text-[#14B8A6]">Bento Grid</span></span>
          </div>
          <div className="flex gap-2">
            <Link href="/blog-preview/design-1">
              <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10">Design 1</Button>
            </Link>
            <Link href="/blog-preview/design-3">
              <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10">Design 3</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="container mx-auto max-w-7xl px-4 pt-16 pb-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/20 mb-4">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14B8A6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#14B8A6]"></span>
              </span>
              <span className="text-xs font-medium text-[#14B8A6]">{posts.length} článků</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Weblyx <span className="text-[#14B8A6]">Blog</span>
            </h1>
          </div>
        </div>
      </section>

      {posts.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <p className="text-white/50 text-lg">Zatím žádné články.</p>
        </div>
      ) : (
        <section className="container mx-auto max-w-7xl px-4 pb-24">
          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[280px] md:auto-rows-[320px]">
            {posts.map((post, idx) => {
              // Asymmetric layout pattern
              let spanClass = "";
              const pattern = idx % 6;
              if (pattern === 0) spanClass = "md:col-span-2 md:row-span-2"; // big
              else if (pattern === 1) spanClass = "md:col-span-1 md:row-span-1"; // small
              else if (pattern === 2) spanClass = "md:col-span-1 md:row-span-1"; // small
              else if (pattern === 3) spanClass = "md:col-span-3 md:row-span-1"; // horizontal full
              else if (pattern === 4) spanClass = "md:col-span-1 md:row-span-2"; // tall
              else if (pattern === 5) spanClass = "md:col-span-2 md:row-span-1"; // wide

              const isBig = pattern === 0 || pattern === 3;
              const isTall = pattern === 4;

              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className={`group relative ${spanClass}`}
                >
                  <Card className="h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#14B8A6]/30 transition-all duration-500">
                    {/* Background image */}
                    {post.featuredImage ? (
                      <div className="absolute inset-0">
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          className="object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-500 group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/10 via-transparent to-[#14B8A6]/5" />
                    )}

                    {/* Content */}
                    <CardContent className="relative h-full flex flex-col justify-end p-6 z-10">
                      {/* Top badges */}
                      <div className="absolute top-5 left-5 flex items-center gap-2">
                        {post.tags?.slice(0, isBig ? 3 : 1).map((tag) => (
                          <Badge
                            key={tag}
                            className="bg-[#14B8A6]/20 text-[#14B8A6] border-[#14B8A6]/30 backdrop-blur-md text-[10px] uppercase tracking-wider"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Arrow icon */}
                      <div className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-[#14B8A6]">
                        <ArrowUpRight className="h-4 w-4 text-white" />
                      </div>

                      <div className="space-y-2">
                        {/* Views count */}
                        {post.views > 0 && (
                          <div className="flex items-center gap-1 text-white/40 text-xs">
                            <Eye className="h-3 w-3" />
                            {post.views} zobrazení
                          </div>
                        )}

                        <h3 className={`font-bold text-white leading-tight line-clamp-${isBig ? 3 : 2} ${isBig ? "text-2xl md:text-3xl" : "text-lg"}`}>
                          {post.title}
                        </h3>

                        {(isBig || isTall) && post.excerpt && (
                          <p className="text-white/50 text-sm line-clamp-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-white/30 text-xs pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(post.publishedAt || post.createdAt)}
                          </span>
                          <span>·</span>
                          <span>5 min čtení</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
