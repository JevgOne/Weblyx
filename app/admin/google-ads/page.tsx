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
  ArrowLeft,
  TrendingUp,
  MousePointer,
  Eye,
  DollarSign,
  Target,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  status: string;
  channelType: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgCpc: number;
  cost: number;
  conversions: number;
  costPerConversion: number | null;
}

export default function GoogleAdsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [customerInfo, setCustomerInfo] = useState<any>(null);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Test connection
      const testRes = await fetch("/api/google-ads/test");
      const testData = await testRes.json();

      if (!testData.success) {
        setConnected(false);
        setError(testData.error || "Connection failed");
        return;
      }

      setConnected(true);
      setCustomerInfo(testData.data);

      // Fetch campaigns
      const campaignsRes = await fetch("/api/google-ads/campaigns");
      const campaignsData = await campaignsRes.json();

      if (campaignsData.success) {
        setCampaigns(campaignsData.data || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "CZK",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("cs-CZ").format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  // Calculate totals
  const totals = campaigns.reduce(
    (acc, c) => ({
      impressions: acc.impressions + c.impressions,
      clicks: acc.clicks + c.clicks,
      cost: acc.cost + c.cost,
      conversions: acc.conversions + c.conversions,
    }),
    { impressions: 0, clicks: 0, cost: 0, conversions: 0 }
  );

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/admin/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  Google Ads
                  {connected ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Připojeno
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Nepřipojeno
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {customerInfo?.customer?.descriptive_name || "Správa kampaní a statistiky"}
                </p>
              </div>
            </div>
            <Button onClick={fetchData} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Obnovit
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {connected && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    Zobrazení
                  </CardDescription>
                  <CardTitle className="text-3xl">
                    {formatNumber(totals.impressions)}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <MousePointer className="h-4 w-4" />
                    Kliknutí
                  </CardDescription>
                  <CardTitle className="text-3xl">
                    {formatNumber(totals.clicks)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    CTR: {totals.impressions > 0 ? formatPercent(totals.clicks / totals.impressions) : "0%"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Útrata
                  </CardDescription>
                  <CardTitle className="text-3xl">
                    {formatCurrency(totals.cost)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    CPC: {totals.clicks > 0 ? formatCurrency(totals.cost / totals.clicks) : "0 Kč"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Konverze
                  </CardDescription>
                  <CardTitle className="text-3xl text-primary">
                    {formatNumber(totals.conversions)}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Campaigns Table */}
            <Card>
              <CardHeader>
                <CardTitle>Kampaně (posledních 30 dní)</CardTitle>
                <CardDescription>
                  Přehled výkonu všech kampaní
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Název</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Zobrazení</TableHead>
                      <TableHead className="text-right">Kliknutí</TableHead>
                      <TableHead className="text-right">CTR</TableHead>
                      <TableHead className="text-right">CPC</TableHead>
                      <TableHead className="text-right">Útrata</TableHead>
                      <TableHead className="text-right">Konverze</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          Žádné kampaně
                        </TableCell>
                      </TableRow>
                    ) : (
                      campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={campaign.status === "ENABLED" ? "default" : "secondary"}
                            >
                              {campaign.status === "ENABLED" ? "Aktivní" : campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(campaign.impressions)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(campaign.clicks)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPercent(campaign.ctr)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(campaign.avgCpc)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(campaign.cost)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(campaign.conversions)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
