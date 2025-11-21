import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminDbInstance } from "@/lib/firebase-admin";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author?: string;
  category: string;
  tags?: string[];
  published: boolean;
  coverImage?: string;
  readTime?: string;
  createdAt: any;
  updatedAt?: any;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    if (!adminDbInstance) {
      return {
        title: "Článek nenalezen | Weblyx Blog",
      };
    }

    const snapshot = await adminDbInstance
      .collection('blog')
      .where('slug', '==', slug)
      .where('published', '==', true)
      .get();

    if (snapshot.docs.length === 0) {
      return {
        title: "Článek nenalezen | Weblyx Blog",
      };
    }

    const post = snapshot.docs[0].data();
    return {
      title: `${post.title} | Weblyx Blog`,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: "article",
        images: post.coverImage ? [{ url: post.coverImage }] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "Článek nenalezen | Weblyx Blog",
    };
  }
}

export default async function BlogPostPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  try {
    if (!adminDbInstance) {
      notFound();
    }

    const snapshot = await adminDbInstance
      .collection('blog')
      .where('slug', '==', slug)
      .where('published', '==', true)
      .get();

    if (snapshot.docs.length === 0) {
      notFound();
    }

    const data = snapshot.docs[0].data();
    const post: BlogPost = {
      id: snapshot.docs[0].id,
      ...data,
      // Format date
      date: data.createdAt ? new Date(data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt).toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      }) : '',
    } as any;

    return (
      <main className="min-h-screen">
        <article className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <Link href="/blog">
              <Button variant="ghost" className="mb-8 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Zpět na blog
              </Button>
            </Link>

            {post.coverImage && (
              <div className="aspect-video bg-cover bg-center rounded-lg mb-8" style={{ backgroundImage: `url(${post.coverImage})` }} />
            )}

            <header className="mb-12 space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {post.category}
                </span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {(post as any).date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime || '5 min'}
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold">
                {post.title}
              </h1>

              <p className="text-xl text-muted-foreground">
                {post.excerpt}
              </p>

              {post.author && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Autor:</span>
                  <span className="font-medium">{post.author}</span>
                </div>
              )}
            </header>

            <div
              className="prose prose-lg max-w-none dark:prose-invert
                prose-headings:font-bold prose-headings:text-foreground
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                prose-ul:my-6 prose-ul:text-muted-foreground
                prose-ol:my-6 prose-ol:text-muted-foreground
                prose-li:my-2
                prose-strong:text-foreground prose-strong:font-semibold
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Štítky:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold mb-4">
              Potřebujete pomoc s webem?
            </h2>
            <p className="text-muted-foreground mb-6">
              Vytvoříme pro vás moderní web přesně podle vašich představ
            </p>
            <Link href="/poptavka">
              <Button size="lg">
                Nezávazná poptávka
              </Button>
            </Link>
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error('Error loading blog post:', error);
    notFound();
  }
}
