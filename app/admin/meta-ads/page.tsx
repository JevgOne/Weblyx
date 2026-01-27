"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  MousePointer,
  Eye,
  DollarSign,
  Target,
  RefreshCw,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Plus,
  Users,
  TrendingUp,
  Facebook,
  Instagram,
  BarChart3,
} from "lucide-react";

interface Campaign {
  campaignId: string;
  campaignName: string;
  status: string;
  objective: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  spend: number;
  reach: number;
  frequency: number;
  conversions?: number;
  costPerConversion?: number;
}

interface AdSet {
  adSetId: string;
  adSetName: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  spend: number;
  reach: number;
  conversions?: number;
}

interface Ad {
  adId: string;
  adName: string;
  adSetName: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  spend: number;
  reach: number;
  conversions?: number;
}

interface AccountInfo {
  id: string;
  name: string;
  status: string;
  currency: string;
  timezone: string;
  amountSpent: number;
}

export default function MetaAdsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [adSets, setAdSets] = useState<AdSet[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [dateRange, setDateRange] = useState("last_30d");

  // Create campaign state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    objective: "OUTCOME_LEADS" as string,
    dailyBudgetCzk: 200,
  });

  const fetchData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Test connection
      const testRes = await fetch("/api/meta-ads/test");
      const testData = await testRes.json();

      if (testData.success) {
        setConnected(true);
        setAccountInfo(testData.data);

        // Fetch campaigns, ad sets, and ads in parallel
        const [campaignsRes, adSetsRes, adsRes] = await Promise.all([
          fetch(`/api/meta-ads/campaigns?date_preset=${dateRange}`),
          fetch(`/api/meta-ads/ad-sets?insights=true&date_preset=${dateRange}`),
          fetch(`/api/meta-ads/ads?insights=true&date_preset=${dateRange}`),
        ]);

        const campaignsData = await campaignsRes.json();
        const adSetsData = await adSetsRes.json();
        const adsData = await adsRes.json();

        if (campaignsData.success) setCampaigns(campaignsData.data || []);
        if (adSetsData.success) setAdSets(adSetsData.data || []);
        if (adsData.success) setAds(adsData.data || []);
      } else {
        setConnected(false);
        setError(testData.error || "Meta Ads connection failed");
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
    if (user) fetchData();
  }, [user, dateRange]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "CZK",
      maximumFractionDigits: 0,
    }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("cs-CZ").format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  const handleToggleCampaign = async (
    campaignId: string,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch("/api/meta-ads/campaign", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns((prev) =>
          prev.map((c) =>
            c.campaignId === campaignId ? { ...c, status: newStatus } : c
          )
        );
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert("Failed to update campaign");
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || newCampaign.dailyBudgetCzk <= 0) {
      alert("Vyplnte vsechna pole");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/meta-ads/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCampaign),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateDialog(false);
        setNewCampaign({ name: "", objective: "OUTCOME_LEADS", dailyBudgetCzk: 200 });
        fetchData();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert("Failed to create campaign");
    } finally {
      setCreating(false);
    }
  };

  const getObjectiveLabel = (objective: string) => {
    const labels: Record<string, string> = {
      OUTCOME_AWARENESS: "Povedomí",
      OUTCOME_ENGAGEMENT: "Zapojení",
      OUTCOME_LEADS: "Leady",
      OUTCOME_SALES: "Prodeje",
      OUTCOME_TRAFFIC: "Návštěvnost",
    };
    return labels[objective] || objective;
  };

  const getStatusBadge = (status: string) => {
    if (status === "ACTIVE") {
      return <Badge className="bg-green-500">Aktivní</Badge>;
    } else if (status === "PAUSED") {
      return <Badge variant="secondary">Pozastavená</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const totals = campaigns.reduce(
    (acc, c) => ({
      impressions: acc.impressions + c.impressions,
      clicks: acc.clicks + c.clicks,
      spend: acc.spend + c.spend,
      reach: acc.reach + c.reach,
      conversions: acc.conversions + (c.conversions || 0),
    }),
    { impressions: 0, clicks: 0, spend: 0, reach: 0, conversions: 0 }
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
                  <Facebook className="h-6 w-6 text-blue-600" />
                  Meta Marketing
                  {connected && (
                    <Badge variant="default" className="bg-blue-600 text-xs">
                      Připojeno
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Facebook Ads • Instagram Ads
                  {accountInfo && ` • ${accountInfo.name}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Dnes</SelectItem>
                  <SelectItem value="yesterday">Včera</SelectItem>
                  <SelectItem value="last_7d">Posledních 7 dní</SelectItem>
                  <SelectItem value="last_14d">Posledních 14 dní</SelectItem>
                  <SelectItem value="last_30d">Posledních 30 dní</SelectItem>
                  <SelectItem value="this_month">Tento měsíc</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button disabled={!connected}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nová kampaň
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Vytvořit novou kampaň</DialogTitle>
                    <DialogDescription>
                      Kampaň bude vytvořena jako pozastavená.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Název kampaně</Label>
                      <Input
                        placeholder="Weblyx - Lead Gen CZ"
                        value={newCampaign.name}
                        onChange={(e) =>
                          setNewCampaign({ ...newCampaign, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cíl kampaně</Label>
                      <Select
                        value={newCampaign.objective}
                        onValueChange={(v) =>
                          setNewCampaign({ ...newCampaign, objective: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OUTCOME_AWARENESS">
                            Povědomí o značce
                          </SelectItem>
                          <SelectItem value="OUTCOME_TRAFFIC">
                            Návštěvnost webu
                          </SelectItem>
                          <SelectItem value="OUTCOME_ENGAGEMENT">
                            Zapojení
                          </SelectItem>
                          <SelectItem value="OUTCOME_LEADS">
                            Generování leadů
                          </SelectItem>
                          <SelectItem value="OUTCOME_SALES">Prodeje</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Denní rozpočet (CZK)</Label>
                      <Input
                        type="number"
                        value={newCampaign.dailyBudgetCzk}
                        onChange={(e) =>
                          setNewCampaign({
                            ...newCampaign,
                            dailyBudgetCzk: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <Button
                      onClick={handleCreateCampaign}
                      disabled={creating}
                      className="w-full"
                    >
                      {creating ? "Vytvářím..." : "Vytvořit kampaň"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button onClick={fetchData} disabled={refreshing} variant="outline">
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Obnovit
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <p className="text-destructive">{error}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Zkontroluj META_ACCESS_TOKEN a META_AD_ACCOUNT_ID v env variables
              </p>
            </CardContent>
          </Card>
        )}

        {connected && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> Dosah
                  </CardDescription>
                  <CardTitle className="text-3xl">
                    {formatNumber(totals.reach)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Eye className="h-4 w-4" /> Zobrazení
                  </CardDescription>
                  <CardTitle className="text-3xl">
                    {formatNumber(totals.impressions)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <MousePointer className="h-4 w-4" /> Kliknutí
                  </CardDescription>
                  <CardTitle className="text-3xl">
                    {formatNumber(totals.clicks)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    CTR:{" "}
                    {totals.impressions > 0
                      ? formatPercent((totals.clicks / totals.impressions) * 100)
                      : "0%"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" /> Útrata
                  </CardDescription>
                  <CardTitle className="text-3xl">
                    {formatCurrency(totals.spend)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    CPC:{" "}
                    {totals.clicks > 0
                      ? formatCurrency(totals.spend / totals.clicks)
                      : "0 Kč"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Target className="h-4 w-4" /> Konverze
                  </CardDescription>
                  <CardTitle className="text-3xl text-primary">
                    {formatNumber(totals.conversions)}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Tabs for Campaigns, Ad Sets, Ads */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="campaigns" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Kampaně ({campaigns.length})
                </TabsTrigger>
                <TabsTrigger value="adsets" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Ad Sety ({adSets.length})
                </TabsTrigger>
                <TabsTrigger value="ads" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Reklamy ({ads.length})
                </TabsTrigger>
              </TabsList>

              {/* Campaigns Tab */}
              <TabsContent value="campaigns" className="mt-6">
                {campaigns.length === 0 ? (
                  <Card className="border-dashed border-2 border-muted-foreground/25">
                    <CardContent className="pt-12 pb-12 text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Facebook className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        Zatím nemáte žádnou kampaň
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        Vytvořte první Meta kampaň pro Facebook a Instagram.
                      </p>
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Vytvořit kampaň
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Kampaně</CardTitle>
                      <CardDescription>
                        Správa Facebook a Instagram kampaní
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Akce</TableHead>
                            <TableHead>Název</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Cíl</TableHead>
                            <TableHead className="text-right">Dosah</TableHead>
                            <TableHead className="text-right">Zobrazení</TableHead>
                            <TableHead className="text-right">Kliknutí</TableHead>
                            <TableHead className="text-right">CTR</TableHead>
                            <TableHead className="text-right">Útrata</TableHead>
                            <TableHead className="text-right">Konverze</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {campaigns.map((campaign) => (
                            <TableRow key={campaign.campaignId}>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleToggleCampaign(
                                      campaign.campaignId,
                                      campaign.status
                                    )
                                  }
                                >
                                  {campaign.status === "ACTIVE" ? (
                                    <Pause className="h-4 w-4 text-yellow-500" />
                                  ) : (
                                    <Play className="h-4 w-4 text-green-500" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell className="font-medium">
                                {campaign.campaignName}
                              </TableCell>
                              <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {getObjectiveLabel(campaign.objective)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(campaign.reach)}
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
                                {formatCurrency(campaign.spend)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(campaign.conversions || 0)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Ad Sets Tab */}
              <TabsContent value="adsets" className="mt-6">
                {adSets.length === 0 ? (
                  <Card className="border-dashed border-2 border-muted-foreground/25">
                    <CardContent className="pt-12 pb-12 text-center">
                      <p className="text-muted-foreground">
                        Žádné ad sety k zobrazení
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Ad Sety</CardTitle>
                      <CardDescription>Skupiny reklam v kampaních</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Název</TableHead>
                            <TableHead>Kampaň</TableHead>
                            <TableHead className="text-right">Dosah</TableHead>
                            <TableHead className="text-right">Zobrazení</TableHead>
                            <TableHead className="text-right">Kliknutí</TableHead>
                            <TableHead className="text-right">CTR</TableHead>
                            <TableHead className="text-right">Útrata</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {adSets.map((adSet) => (
                            <TableRow key={adSet.adSetId}>
                              <TableCell className="font-medium">
                                {adSet.adSetName}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {adSet.campaignName}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(adSet.reach)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(adSet.impressions)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(adSet.clicks)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatPercent(adSet.ctr)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(adSet.spend)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Ads Tab */}
              <TabsContent value="ads" className="mt-6">
                {ads.length === 0 ? (
                  <Card className="border-dashed border-2 border-muted-foreground/25">
                    <CardContent className="pt-12 pb-12 text-center">
                      <p className="text-muted-foreground">
                        Žádné reklamy k zobrazení
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Reklamy</CardTitle>
                      <CardDescription>Jednotlivé reklamy</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Název</TableHead>
                            <TableHead>Ad Set</TableHead>
                            <TableHead>Kampaň</TableHead>
                            <TableHead className="text-right">Zobrazení</TableHead>
                            <TableHead className="text-right">Kliknutí</TableHead>
                            <TableHead className="text-right">CTR</TableHead>
                            <TableHead className="text-right">Útrata</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ads.map((ad) => (
                            <TableRow key={ad.adId}>
                              <TableCell className="font-medium">{ad.adName}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {ad.adSetName}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {ad.campaignName}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(ad.impressions)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(ad.clicks)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatPercent(ad.ctr)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(ad.spend)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Account Info */}
            {accountInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Účet připojen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">ID účtu</p>
                      <p className="font-medium">{accountInfo.id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Název</p>
                      <p className="font-medium">{accountInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Měna</p>
                      <p className="font-medium">{accountInfo.currency}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Celková útrata</p>
                      <p className="font-medium">
                        {formatCurrency(accountInfo.amountSpent)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!connected && !error && (
          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Facebook className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Připojte Meta Business účet
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Nastavte META_ACCESS_TOKEN a META_AD_ACCOUNT_ID v env variables
                pro připojení k Meta Ads.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
