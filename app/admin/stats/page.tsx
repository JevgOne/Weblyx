"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderKanban,
  Mail,
  Image,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Stats {
  projects: {
    total: number;
    active: number;
    completed: number;
    pending: number;
  };
  leads: {
    total: number;
    new: number;
    contacted: number;
    converted: number;
  };
  portfolio: {
    total: number;
    published: number;
    featured: number;
  };
}

export default function StatsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    projects: { total: 0, active: 0, completed: 0, pending: 0 },
    leads: { total: 0, new: 0, contacted: 0, converted: 0 },
    portfolio: { total: 0, published: 0, featured: 0 },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch basic counts from API
        const response = await fetch('/api/admin/stats');
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch stats');
        }

        // Fetch detailed data for status breakdowns
        const { collection, getDocs } = await import('firebase/firestore');
        const [projectsSnap, leadsSnap, portfolioResponse] = await Promise.all([
          getDocs(collection(db, "projects")),
          getDocs(collection(db, "leads")),
          fetch('/api/portfolio')
        ]);

        const projects = projectsSnap.docs.map(doc => doc.data());
        const leads = leadsSnap.docs.map(doc => doc.data());
        const portfolioResult = await portfolioResponse.json();
        const portfolio = portfolioResult.success ? portfolioResult.data : [];

        setStats({
          projects: {
            total: result.data.projects,
            active: projects.filter((p: any) => p.status === 'in_progress').length,
            completed: projects.filter((p: any) => p.status === 'completed').length,
            pending: projects.filter((p: any) => p.status === 'pending').length,
          },
          leads: {
            total: result.data.leads,
            new: leads.filter((l: any) => l.status === 'new').length,
            contacted: leads.filter((l: any) => l.status === 'contacted').length,
            converted: leads.filter((l: any) => l.status === 'converted').length,
          },
          portfolio: {
            total: result.data.portfolio,
            published: portfolio.filter((p: any) => p.published).length,
            featured: portfolio.filter((p: any) => p.featured).length,
          },
        });
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
          {/* Projects Stats */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              Projekty
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Celkem projektů</CardDescription>
                  <CardTitle className="text-3xl">{stats.projects.total}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 mr-1 text-primary" />
                    Všechny projekty
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Aktivní projekty</CardDescription>
                  <CardTitle className="text-3xl text-blue-600">{stats.projects.active}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1 text-blue-500" />
                    Probíhající vývoj
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Dokončené</CardDescription>
                  <CardTitle className="text-3xl text-primary">{stats.projects.completed}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 mr-1 text-primary" />
                    Úspěšně dokončeno
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Čekající</CardDescription>
                  <CardTitle className="text-3xl text-yellow-600">{stats.projects.pending}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mr-1 text-yellow-500" />
                    Čeká na zahájení
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Celkem poptávek</CardDescription>
                  <CardTitle className="text-3xl">{stats.leads.total}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1 text-primary" />
                    Všechny poptávky
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Nové</CardDescription>
                  <CardTitle className="text-3xl text-blue-600">{stats.leads.new}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 mr-1 text-blue-500" />
                    Nepřečtené
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Kontaktované</CardDescription>
                  <CardTitle className="text-3xl text-yellow-600">{stats.leads.contacted}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 mr-1 text-yellow-500" />
                    Probíhá komunikace
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Konvertované</CardDescription>
                  <CardTitle className="text-3xl text-primary">{stats.leads.converted}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 mr-1 text-primary" />
                    Staly se projekty
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Portfolio Stats */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              Portfolio
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
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
                    <CheckCircle2 className="h-4 w-4 mr-1 text-primary" />
                    Veřejně viditelné
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Featured</CardDescription>
                  <CardTitle className="text-3xl text-yellow-600">{stats.portfolio.featured}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 mr-1 text-yellow-500" />
                    Zvýrazněné projekty
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
                <Link href="/admin/projects">
                  <FolderKanban className="h-4 w-4 mr-2" />
                  Spravovat projekty
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/leads">
                  <Mail className="h-4 w-4 mr-2" />
                  Spravovat poptávky
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/portfolio">
                  <Image className="h-4 w-4 mr-2" />
                  Spravovat portfolio
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
