"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  MessageSquareQuote,
  Target,
  Bot,
  CreditCard,
  Receipt,
  UserCog,
  History,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { useAdminTranslation, LanguageSelector } from "@/lib/admin-i18n";
import { ROLE_NAMES, isAdminOrHigher } from "@/lib/auth/permissions";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, can } = useAdminAuth();
  const { t } = useAdminTranslation();
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
    await fetch('/api/auth/logout', { method: 'POST' });
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
              <h1 className="text-xl font-bold">{t.header.title}</h1>
              <p className="text-sm text-muted-foreground">{t.header.dashboard}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector variant="compact" />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">
                {user?.role ? ROLE_NAMES[user.role]?.cs : t.header.administrator}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t.header.logout}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{t.dashboard.welcome}</h2>
          <p className="text-muted-foreground">
            {t.dashboard.overview}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t.dashboard.activeProjects}
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
                    {t.dashboard.totalProjects}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t.dashboard.leads}
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
                    {t.dashboard.totalLeads}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t.dashboard.portfolioProjects}
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
                    {t.dashboard.publishedOnWeb}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div>
          <h3 className="text-xl font-bold mb-4">{t.dashboard.quickAccess}</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{t.dashboard.leadsTitle}</CardTitle>
                    <CardDescription>{t.dashboard.leadsDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => router.push("/admin/leads")}>
                  {t.common.open}
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
                    <CardTitle>{t.dashboard.projectsTitle}</CardTitle>
                    <CardDescription>{t.dashboard.projectsDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => router.push("/admin/projects")}>
                  {t.common.open}
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
                    <CardTitle>{t.dashboard.portfolioTitle}</CardTitle>
                    <CardDescription>{t.dashboard.portfolioDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => router.push("/admin/portfolio")}>
                  {t.common.open}
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
                    <CardTitle>{t.dashboard.mediaTitle}</CardTitle>
                    <CardDescription>{t.dashboard.mediaDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="default" className="w-full" onClick={() => router.push("/admin/media")}>
                  {t.common.open}
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
                    <CardTitle>{t.dashboard.contentTitle}</CardTitle>
                    <CardDescription>{t.dashboard.contentDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => router.push("/admin/content")}>
                  {t.common.open}
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
                    <CardTitle>{t.dashboard.statsTitle}</CardTitle>
                    <CardDescription>{t.dashboard.statsDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => router.push("/admin/stats")}>
                  {t.common.open}
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
                    <CardTitle>{t.dashboard.blogTitle}</CardTitle>
                    <CardDescription>{t.dashboard.blogDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => router.push("/admin/blog")}>
                  {t.common.open}
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
                    <CardTitle>{t.dashboard.reviewsTitle}</CardTitle>
                    <CardDescription>{t.dashboard.reviewsDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => router.push("/admin/reviews")}>
                  {t.common.open}
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
                    <CardTitle>{t.dashboard.promoCodesTitle}</CardTitle>
                    <CardDescription>{t.dashboard.promoCodesDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => router.push("/admin/promo-codes")}>
                  {t.common.open}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>{t.dashboard.paymentsTitle}</CardTitle>
                    <CardDescription>{t.dashboard.paymentsDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="default" className="w-full bg-green-600 hover:bg-green-700" onClick={() => router.push("/admin/payments")}>
                  {t.common.open}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-200">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>{t.dashboard.invoicesTitle}</CardTitle>
                    <CardDescription>{t.dashboard.invoicesDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/admin/invoices")}>
                  {t.common.open}
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
                    <CardTitle>{t.dashboard.webAnalyzerTitle}</CardTitle>
                    <CardDescription>{t.dashboard.webAnalyzerDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => router.push("/admin/tools/web-analyzer")}>
                    {t.dashboard.analyze}
                  </Button>
                  <Button variant="default" className="flex-1" onClick={() => router.push("/admin/web-leads")}>
                    Leads
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-200">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {t.dashboard.leadGenTitle}
                    </CardTitle>
                    <CardDescription>{t.dashboard.leadGenDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="default" className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={() => router.push("/admin/lead-generation")}>
                    <Bot className="h-4 w-4 mr-1" />
                    {t.common.open}
                  </Button>
                  <Button variant="outline" className="flex-1 border-teal-300" onClick={() => router.push("/admin/lead-generation/stats")}>
                    <BarChart className="h-4 w-4 mr-1" />
                    Stats
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Google Marketing (Ads + GA4 + GSC) */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-200">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Google Marketing</CardTitle>
                    <CardDescription>Ads + GA4 + Search Console</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="default" className="w-full bg-yellow-600 hover:bg-yellow-700" onClick={() => router.push("/admin/google-ads")}>
                  {t.common.open}
                </Button>
              </CardContent>
            </Card>

            {/* EroWeb - only for Owner/Admin */}
            {can('eroweb') && (
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>{t.dashboard.erowebTitle}</CardTitle>
                      <CardDescription>{t.dashboard.erowebDesc}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="default" className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => router.push("/admin/eroweb-analyza")}>
                    {t.common.open}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Tasks - available to all roles */}
            {can('tasks') && (
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <ClipboardList className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>{isAdminOrHigher(user?.role) ? 'Úkoly' : 'Moje úkoly'}</CardTitle>
                      <CardDescription>
                        {isAdminOrHigher(user?.role)
                          ? 'Správa úkolů pro specialisty'
                          : 'Vaše přiřazené úkoly'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="default" className="w-full bg-green-600 hover:bg-green-700" onClick={() => router.push("/admin/tasks")}>
                    {t.common.open}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-zinc-500/10 to-zinc-600/10 border-zinc-300">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-zinc-600 to-zinc-700 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>{t.dashboard.settingsTitle}</CardTitle>
                    <CardDescription>{t.dashboard.settingsDesc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => router.push("/admin/settings")}>
                  {t.common.open}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-200">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <UserCog className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>{t.dashboard.usersTitle || 'User Management'}</CardTitle>
                    <CardDescription>{t.dashboard.usersDesc || 'Manage admin accounts'}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="default" className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => router.push("/admin/users")}>
                  {t.common.open}
                </Button>
              </CardContent>
            </Card>

            {/* Activity Logs - only for Owner and Admin */}
            {isAdminOrHigher(user?.role) && (
              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-slate-500/10 to-slate-600/10 border-slate-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                      <History className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>Záznamy aktivit</CardTitle>
                      <CardDescription>Historie akcí uživatelů</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => router.push("/admin/activity-logs")}>
                    {t.common.open}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
