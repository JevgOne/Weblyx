"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Users,
  Eye,
  Clock,
  TrendingUp,
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  Search,
  MousePointer,
  BarChart3,
  Globe,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface AnalyticsData {
  summary: {
    totalUsers: number;
    totalSessions: number;
    totalPageViews: number;
    avgBounceRate: number;
    avgSessionDuration: number;
    totalConversions: number;
  };
  topPages: Array<{
    path: string;
    title: string;
    pageViews: number;
    avgDuration: number;
    bounceRate: number;
  }>;
  trafficSources: Array<{
    source: string;
    sessions: number;
    users: number;
    conversions: number;
  }>;
  devices: Array<{
    device: string;
    sessions: number;
    users: number;
    bounceRate: number;
  }>;
}

interface SearchConsoleData {
  summary: {
    totalClicks: number;
    totalImpressions: number;
    avgCtr: number;
    avgPosition: number;
  };
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  topPages: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState("30");
  const [activeTab, setActiveTab] = useState("ga4");

  const [ga4Data, setGa4Data] = useState<AnalyticsData | null>(null);
  const [ga4Error, setGa4Error] = useState<string | null>(null);
  const [ga4Connected, setGa4Connected] = useState(false);

  const [gscData, setGscData] = useState<SearchConsoleData | null>(null);
  const [gscError, setGscError] = useState<string | null>(null);
  const [gscConnected, setGscConnected] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);

    // Fetch GA4 data
    try {
      const ga4Res = await fetch(`/api/analytics/overview?startDate=${dateRange}daysAgo&endDate=today`);
      const ga4Json = await ga4Res.json();
      if (ga4Json.success) {
        setGa4Data(ga4Json.data);
        setGa4Connected(true);
        setGa4Error(null);
      } else {
        setGa4Connected(false);
        setGa4Error(ga4Json.error);
      }
    } catch (err: any) {
      setGa4Connected(false);
      setGa4Error(err.message);
    }

    // Fetch Search Console data
    try {
      const gscRes = await fetch(`/api/search-console/overview?days=${dateRange}`);
      const gscJson = await gscRes.json();
      if (gscJson.success) {
        setGscData(gscJson.data);
        setGscConnected(true);
        setGscError(null);
      } else {
        setGscConnected(false);
        setGscError(gscJson.error);
      }
    } catch (err: any) {
      setGscConnected(false);
      setGscError(err.message);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user, dateRange]);

  const formatNumber = (n: number) => new Intl.NumberFormat("cs-CZ").format(Math.round(n));
  const formatPercent = (n: number) => `${n.toFixed(2)}%`;
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "desktop": return <Monitor className="h-4 w-4" />;
      case "mobile": return <Smartphone className="h-4 w-4" />;
      case "tablet": return <Tablet className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/admin/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Analytics & SEO</h1>
                <p className="text-sm text-muted-foreground">GA4 + Google Search Console</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Posledních 7 dní</SelectItem>
                  <SelectItem value="30">Posledních 30 dní</SelectItem>
                  <SelectItem value="90">Posledních 90 dní</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchData} disabled={refreshing} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Obnovit
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="ga4" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Google Analytics 4
              {ga4Connected ? (
                <Badge variant="default" className="bg-green-500 ml-1 h-5 px-1">
                  <CheckCircle className="h-3 w-3" />
                </Badge>
              ) : (
                <Badge variant="destructive" className="ml-1 h-5 px-1">
                  <XCircle className="h-3 w-3" />
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="gsc" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Console
              {gscConnected ? (
                <Badge variant="default" className="bg-green-500 ml-1 h-5 px-1">
                  <CheckCircle className="h-3 w-3" />
                </Badge>
              ) : (
                <Badge variant="destructive" className="ml-1 h-5 px-1">
                  <XCircle className="h-3 w-3" />
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* GA4 Tab */}
          <TabsContent value="ga4">
            {ga4Error && (
              <Card className="mb-6 border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive">{ga4Error}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Nastav GA4_PROPERTY_ID a service-account-key.json
                  </p>
                </CardContent>
              </Card>
            )}

            {ga4Data && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-1">
                        <Users className="h-4 w-4" /> Uživatelé
                      </CardDescription>
                      <CardTitle className="text-3xl">{formatNumber(ga4Data.summary.totalUsers)}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-1">
                        <Eye className="h-4 w-4" /> Zobrazení stránek
                      </CardDescription>
                      <CardTitle className="text-3xl">{formatNumber(ga4Data.summary.totalPageViews)}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Průměrná doba
                      </CardDescription>
                      <CardTitle className="text-3xl">{formatDuration(ga4Data.summary.avgSessionDuration)}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" /> Bounce Rate
                      </CardDescription>
                      <CardTitle className="text-3xl">{formatPercent(ga4Data.summary.avgBounceRate)}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Top Pages */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top stránky</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Stránka</TableHead>
                            <TableHead className="text-right">Zobrazení</TableHead>
                            <TableHead className="text-right">Bounce</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ga4Data.topPages.slice(0, 8).map((page, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium truncate max-w-[200px]" title={page.path}>
                                {page.path}
                              </TableCell>
                              <TableCell className="text-right">{formatNumber(page.pageViews)}</TableCell>
                              <TableCell className="text-right">{formatPercent(page.bounceRate)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Traffic Sources */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Zdroje návštěvnosti</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Zdroj</TableHead>
                            <TableHead className="text-right">Sessions</TableHead>
                            <TableHead className="text-right">Uživatelé</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ga4Data.trafficSources.map((source, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{source.source}</TableCell>
                              <TableCell className="text-right">{formatNumber(source.sessions)}</TableCell>
                              <TableCell className="text-right">{formatNumber(source.users)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>

                {/* Devices */}
                <Card>
                  <CardHeader>
                    <CardTitle>Zařízení</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      {ga4Data.devices.map((device, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="p-3 bg-muted rounded-lg">
                            {getDeviceIcon(device.device)}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{device.device}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatNumber(device.sessions)} sessions • {formatPercent(device.bounceRate)} bounce
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Search Console Tab */}
          <TabsContent value="gsc">
            {gscError && (
              <Card className="mb-6 border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive">{gscError}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Nastav SEARCH_CONSOLE_SITE_URL a service-account-key.json
                  </p>
                </CardContent>
              </Card>
            )}

            {gscData && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-1">
                        <MousePointer className="h-4 w-4" /> Kliknutí
                      </CardDescription>
                      <CardTitle className="text-3xl">{formatNumber(gscData.summary.totalClicks)}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-1">
                        <Eye className="h-4 w-4" /> Zobrazení
                      </CardDescription>
                      <CardTitle className="text-3xl">{formatNumber(gscData.summary.totalImpressions)}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" /> CTR
                      </CardDescription>
                      <CardTitle className="text-3xl">{formatPercent(gscData.summary.avgCtr)}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-1">
                        <Search className="h-4 w-4" /> Avg. pozice
                      </CardDescription>
                      <CardTitle className="text-3xl">{gscData.summary.avgPosition.toFixed(1)}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Top Queries */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top vyhledávací dotazy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Dotaz</TableHead>
                            <TableHead className="text-right">Kliky</TableHead>
                            <TableHead className="text-right">Pozice</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {gscData.topQueries.slice(0, 10).map((query, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium truncate max-w-[200px]" title={query.query}>
                                {query.query}
                              </TableCell>
                              <TableCell className="text-right">{formatNumber(query.clicks)}</TableCell>
                              <TableCell className="text-right">{query.position.toFixed(1)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Top Pages */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top stránky ve vyhledávání</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>URL</TableHead>
                            <TableHead className="text-right">Kliky</TableHead>
                            <TableHead className="text-right">CTR</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {gscData.topPages.slice(0, 10).map((page, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium truncate max-w-[200px]" title={page.page}>
                                {page.page.replace("https://weblyx.cz", "")}
                              </TableCell>
                              <TableCell className="text-right">{formatNumber(page.clicks)}</TableCell>
                              <TableCell className="text-right">{formatPercent(page.ctr)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
