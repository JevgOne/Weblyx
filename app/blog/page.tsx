import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Clock, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | Weblyx - Tipy a trendy ze světa webu",
  description: "Články o tvorbě webů, SEO, designu a webových technologiích. Praktické tipy a návody.",
};

export default function BlogPage() {
  const posts = [
    {
      title: "Jak vybrat správnou webovou agenturu v roce 2025",
      excerpt: "Tipy a rady, na co se zaměřit při výběru partnera pro tvorbu webu",
      category: "Průvodce",
      date: "15. 11. 2025",
      readTime: "5 min",
      slug: "jak-vybrat-webovou-agenturu-2025",
    },
    {
      title: "10 důvodů, proč potřebujete responzivní web",
      excerpt: "Mobilní zařízení tvoří více než 60% návštěvnosti. Je váš web připraven?",
      category: "Web Design",
      date: "12. 11. 2025",
      readTime: "4 min",
      slug: "10-duvodu-proc-potrebujete-responzivni-web",
    },
    {
      title: "SEO základy: Jak dostat web na první stránku Google",
      excerpt: "Kompletní průvodce SEO optimalizací pro začátečníky i pokročilé",
      category: "SEO",
      date: "8. 11. 2025",
      readTime: "8 min",
      slug: "seo-zaklady-prvni-stranka-google",
    },
  ];

  return (
    <main className="min-h-screen">
      <section className="py-20 md:py-32 px-4 gradient-hero grid-pattern">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="text-primary">Blog</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Tipy, trendy a novinky ze světa webu a online marketingu
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <Link key={index} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-elegant transition-all">
                  <div className="aspect-video bg-gradient-hero flex items-center justify-center">
                    <p className="text-muted-foreground">📝 Náhledový obrázek</p>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{post.category}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {post.readTime}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground">{post.excerpt}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                      <Calendar className="h-4 w-4" />
                      {post.date}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
