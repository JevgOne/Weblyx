"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Mail,
  Calendar,
  BarChart,
  FileText,
  Settings,
  LogOut,
  Image,
  Images,
  FileEdit,
  Tag,
  Globe,
  MessageSquareQuote
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    projects: 0,
    leads: 0,
    portfolio: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      console.time("Dashboard Load");
      try {
        const response = await fetch('/api/admin/stats');
        const result = await response.json();

        if (result.success) {
          setStats(result.data);
        } else {
          console.error("Failed to fetch stats:", result.error);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }

      setLoading(false);
      console.timeEnd("Dashboard Load");
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Weblyx Admin</h1>
              <p className="text-sm text-muted-foreground">Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Odhlásit</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Vítejte zpět! 👋</h2>
          <p className="text-muted-foreground">
            Přehled vašeho administračního panelu
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aktivní projekty
              </CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-9 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold">{stats.projects}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Celkem projektů
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Poptávky (Leads)
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-9 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold">{stats.leads}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Celkem poptávek
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Portfolio projekty
              </CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-9 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold">{stats.portfolio}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Publikované na webu
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div>
          <h3 className="text-xl font-bold mb-4">Rychlý přístup</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Poptávky</CardTitle>
                    <CardDescription>Správa leadů</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => router.push("/admin/leads")}>
                  Otevřít
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderKanban className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Projekty</CardTitle>
                    <CardDescription>Správa projektů</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => router.push("/admin/projects")}>
                  Otevřít
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Image className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Portfolio</CardTitle>
                    <CardDescription>Správa portfolia</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => router.push("/admin/portfolio")}>
                  Otevřít
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <Images className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Média 📸</CardTitle>
                    <CardDescription>Knihovna obrázků</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="default" className="w-full" onClick={() => router.push("/admin/media")}>
                  Otevřít
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileEdit className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Content (CMS)</CardTitle>
                    <CardDescription>Úprava obsahu webu</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => router.push("/admin/content")}>
                  Otevřít
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Statistiky</CardTitle>
                    <CardDescription>Analytics & reporty</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => router.push("/admin/stats")}>
                  Otevřít
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Blog</CardTitle>
                    <CardDescription>Správa článků</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => router.push("/admin/blog")}>
                  Otevřít
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageSquareQuote className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Recenze</CardTitle>
                    <CardDescription>Zákaznické hodnocení</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => router.push("/admin/reviews")}>
                  Otevřít
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Tag className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Promo kódy</CardTitle>
                    <CardDescription>Správa slev a akcí</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => router.push("/admin/promo-codes")}>
                  Otevřít
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Web Analyzer</CardTitle>
                    <CardDescription>Analýza konkurenčních webů</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => router.push("/admin/tools/web-analyzer")}>
                  Otevřít
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
