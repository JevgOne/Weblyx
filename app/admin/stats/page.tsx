"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Image,
  TrendingUp,
  ArrowLeft,
  FileText,
  Star,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Stats {
  portfolio: {
    total: number;
    published: number;
  };
  blog: {
    total: number;
    published: number;
  };
  reviews: {
    total: number;
    published: number;
    featured: number;
  };
  leads: {
    total: number;
  };
}

export default function StatsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    portfolio: { total: 0, published: 0 },
    blog: { total: 0, published: 0 },
    reviews: { total: 0, published: 0, featured: 0 },
    leads: { total: 0 },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Single API call - counts only, no full data transfer
        const res = await fetch('/api/admin/stats');
        const result = await res.json();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Statistiky</h1>
              <p className="text-sm text-muted-foreground">
                Přehled všech aktivit a metrik
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Portfolio Stats */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              Portfolio
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Celkem projektů</CardDescription>
                  <CardTitle className="text-3xl">{stats.portfolio.total}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Image className="h-4 w-4 mr-1 text-primary" />
                    Všechny projekty
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Publikované</CardDescription>
                  <CardTitle className="text-3xl text-primary">{stats.portfolio.published}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Eye className="h-4 w-4 mr-1 text-primary" />
                    Veřejně viditelné
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Blog Stats */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Blog
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Celkem článků</CardDescription>
                  <CardTitle className="text-3xl">{stats.blog.total}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 mr-1 text-primary" />
                    Všechny články
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Publikované</CardDescription>
                  <CardTitle className="text-3xl text-primary">{stats.blog.published}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Eye className="h-4 w-4 mr-1 text-primary" />
                    Veřejně viditelné
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reviews Stats */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Recenze
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Celkem recenzí</CardDescription>
                  <CardTitle className="text-3xl">{stats.reviews.total}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Star className="h-4 w-4 mr-1 text-primary" />
                    Všechny recenze
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Publikované</CardDescription>
                  <CardTitle className="text-3xl text-primary">{stats.reviews.published}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Eye className="h-4 w-4 mr-1 text-primary" />
                    Veřejně viditelné
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Zvýrazněné</CardDescription>
                  <CardTitle className="text-3xl text-yellow-600">{stats.reviews.featured}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 mr-1 text-yellow-500" />
                    Featured recenze
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Leads Stats */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Poptávky
            </h2>
            <div className="grid gap-4 md:grid-cols-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Celkem poptávek</CardDescription>
                  <CardTitle className="text-3xl">{stats.leads.total}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 mr-1 text-primary" />
                    Všechny poptávky
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Rychlé akce</CardTitle>
              <CardDescription>Přejít na správu jednotlivých sekcí</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/admin/portfolio">
                  <Image className="h-4 w-4 mr-2" />
                  Spravovat portfolio
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/blog">
                  <FileText className="h-4 w-4 mr-2" />
                  Spravovat blog
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/reviews">
                  <Star className="h-4 w-4 mr-2" />
                  Spravovat recenze
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/leads">
                  <Mail className="h-4 w-4 mr-2" />
                  Spravovat poptávky
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
