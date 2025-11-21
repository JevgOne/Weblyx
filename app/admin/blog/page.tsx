"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User,
  FileText
} from "lucide-react";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  published: boolean;
  featured: boolean;
  category: string;
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function BlogPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Check if we're using mock Firebase
        if (typeof db.collection === 'function') {
          // Mock Firebase
          const snapshot = await db.collection("blog").orderBy("createdAt", "desc").get();
          const postsData = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          }));
          setPosts(postsData);
        } else {
          // Real Firebase (modular v9+)
          const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
          const q = query(collection(db, "blog"), orderBy("createdAt", "desc"));
          const snapshot = await getDocs(q);
          const postsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          } as BlogPost));
          setPosts(postsData);
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error);
        // If collection doesn't exist yet, just set empty array
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    // Start fetching immediately, don't wait for user
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu chcete smazat tento článek?")) return;

    try {
      if (typeof db.collection === 'function') {
        await db.collection("blog").doc(id).delete();
      } else {
        const { doc, deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, "blog", id));
      }
      setPosts(posts.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Chyba při mazání článku");
    }
  };

  const togglePublish = async (post: BlogPost) => {
    try {
      const newPublished = !post.published;
      if (typeof db.collection === 'function') {
        await db.collection("blog").doc(post.id).update({ published: newPublished });
      } else {
        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, "blog", post.id), { published: newPublished });
      }
      setPosts(posts.map(p => p.id === post.id ? { ...p, published: newPublished } : p));
    } catch (error) {
      console.error("Error toggling publish:", error);
      alert("Chyba při změně stavu publikace");
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/admin/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Blog</h1>
                <p className="text-sm text-muted-foreground">
                  Správa blog příspěvků ({posts.length} celkem)
                </p>
              </div>
            </div>
            <Button onClick={() => router.push("/admin/blog/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Nový článek
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Žádné články</h2>
              <p className="text-muted-foreground mb-6">
                Začněte vytvořením prvního blog příspěvku
              </p>
              <Button onClick={() => router.push("/admin/blog/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Vytvořit první článek
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-semibold">{post.title}</h2>
                        {post.published ? (
                          <Badge variant="default" className="bg-primary">
                            <Eye className="h-3 w-3 mr-1" />
                            Publikováno
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Koncept
                          </Badge>
                        )}
                        {post.featured && (
                          <Badge variant="default">Featured</Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {post.createdAt.toLocaleDateString('cs-CZ')}
                        </div>
                        {post.category && (
                          <Badge variant="outline">{post.category}</Badge>
                        )}
                      </div>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-32 h-32 object-cover rounded-lg shrink-0"
                      />
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/blog/${post.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Upravit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublish(post)}
                    >
                      {post.published ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Skrýt
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Publikovat
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                    >
                      Zobrazit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Smazat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
