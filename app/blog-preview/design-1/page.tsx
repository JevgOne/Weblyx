import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, ArrowRight, Newspaper } from "lucide-react";
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

export default async function BlogDesign1() {
  const posts = await getPublishedBlogPosts();
  const [hero, ...rest] = posts;

  return (
    <main className="min-h-screen bg-background">
      {/* Nav bar */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto max-w-7xl flex items-center justify-between h-16 px-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-[#14B8A6] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Zpět na blog
          </Link>
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-[#14B8A6]" />
            <span className="font-bold text-lg">Design 1 — <span className="text-[#14B8A6]">Magazine</span></span>
          </div>
          <div className="flex gap-2">
            <Link href="/blog-preview/design-2">
              <Button variant="ghost" size="sm">Design 2</Button>
            </Link>
            <Link href="/blog-preview/design-3">
              <Button variant="ghost" size="sm">Design 3</Button>
            </Link>
          </div>
        </div>
      </nav>

      {posts.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground text-lg">Zatím žádné články.</p>
        </div>
      ) : (
        <>
          {/* HERO — full-width featured article */}
          {hero && (
            <Link href={`/blog/${hero.slug}`} className="group block">
              <section className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
                {/* Background image */}
                {hero.featuredImage ? (
                  <Image
                    src={hero.featuredImage}
                    alt={hero.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/30 via-[#14B8A6]/10 to-background" />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex items-end">
                  <div className="container mx-auto max-w-7xl px-4 pb-16 md:pb-20 space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-[#14B8A6] text-white border-0 hover:bg-[#14B8A6]/90 text-sm px-3 py-1">
                        Hlavní článek
                      </Badge>
                      {hero.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="border-white/30 text-white/80">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl leading-tight">
                      {hero.title}
                    </h1>

                    {hero.excerpt && (
                      <p className="text-lg md:text-xl text-white/80 max-w-2xl line-clamp-3">
                        {hero.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-white/60 text-sm pt-2">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDate(hero.publishedAt || hero.createdAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        5 min čtení
                      </span>
                    </div>

                    <div className="pt-2">
                      <span className="inline-flex items-center gap-2 text-[#14B8A6] font-semibold group-hover:gap-3 transition-all">
                        Číst článek <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </Link>
          )}

          {/* 2-column grid for the rest */}
          {rest.length > 0 && (
            <section className="container mx-auto max-w-7xl px-4 py-16 md:py-24">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold">Další články</h2>
                  <p className="text-muted-foreground mt-2">Další čtení z naší redakce</p>
                </div>
                <div className="hidden md:block h-px flex-1 bg-border ml-8" />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {rest.map((post, idx) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                    <Card className="overflow-hidden border-0 shadow-none bg-transparent hover:bg-muted/50 transition-all duration-300 rounded-2xl">
                      <div className="flex flex-col md:flex-row gap-6 p-4">
                        {/* Thumbnail */}
                        <div className="relative w-full md:w-48 h-48 md:h-36 rounded-xl overflow-hidden flex-shrink-0">
                          {post.featuredImage ? (
                            <Image
                              src={post.featuredImage}
                              alt={post.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#14B8A6]/20 to-[#14B8A6]/5 flex items-center justify-center">
                              <Newspaper className="h-8 w-8 text-[#14B8A6]/40" />
                            </div>
                          )}
                        </div>

                        {/* Text */}
                        <CardContent className="p-0 flex flex-col justify-between flex-1">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              {post.tags?.slice(0, 1).map((tag) => (
                                <Badge key={tag} variant="secondary" className="bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/20 text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              <span className="text-xs text-muted-foreground">
                                {formatDate(post.publishedAt || post.createdAt)}
                              </span>
                            </div>

                            <h3 className="text-xl font-bold group-hover:text-[#14B8A6] transition-colors line-clamp-2">
                              {post.title}
                            </h3>

                            {post.excerpt && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {post.excerpt}
                              </p>
                            )}
                          </div>

                          <span className="inline-flex items-center gap-1.5 text-sm text-[#14B8A6] font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            Přečíst <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
