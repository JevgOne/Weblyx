"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
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
  Sparkles,
  Settings,
  Pencil,
  Search,
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

interface Keyword {
  keyword: string;
  matchType: string;
  status: string;
  adGroupName: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgCpc: number;
  cost: number;
  conversions: number;
}

interface GeneratedAds {
  headlines: string[];
  descriptions: string[];
  keywords: Array<{ text: string; matchType: string }>;
  negativeKeywords: string[];
  callouts: string[];
  sitelinks: Array<{ text: string; description: string }>;
}

export default function GoogleAdsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("campaigns");

  // Create campaign state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    dailyBudgetCzk: 100,
  });

  // Edit budget state
  const [editingBudget, setEditingBudget] = useState<{ id: string; amount: number } | null>(null);
  const [updatingBudget, setUpdatingBudget] = useState(false);

  // AI Generation state
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedAds, setGeneratedAds] = useState<GeneratedAds | null>(null);
  const [generateForm, setGenerateForm] = useState({
    businessName: "Weblyx",
    businessDescription: "Webdesign a vývoj webových stránek na míru. Moderní weby, e-shopy, SEO optimalizace.",
    targetKeywords: "",
    targetAudience: "Malé a střední firmy hledající profesionální webové stránky",
    language: "cs" as "cs" | "de" | "en",
    campaignGoal: "leads" as "traffic" | "leads" | "sales" | "brand",
  });

  const fetchData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const testRes = await fetch("/api/google-ads/test");
      const testData = await testRes.json();

      if (!testData.success) {
        setConnected(false);
        setError(testData.error || "Connection failed");
        return;
      }

      setConnected(true);
      setCustomerInfo(testData.data);

      const [campaignsRes, keywordsRes] = await Promise.all([
        fetch("/api/google-ads/campaigns"),
        fetch("/api/google-ads/keywords"),
      ]);

      const campaignsData = await campaignsRes.json();
      const keywordsData = await keywordsRes.json();

      if (campaignsData.success) {
        setCampaigns(campaignsData.data || []);
      }
      if (keywordsData.success) {
        setKeywords(keywordsData.data || []);
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

  const handleToggleCampaign = async (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ENABLED" ? "PAUSED" : "ENABLED";
    try {
      const res = await fetch(`/api/google-ads/campaign/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaignId ? { ...c, status: newStatus } : c
          )
        );
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("Error toggling campaign:", err);
      alert("Failed to update campaign");
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || newCampaign.dailyBudgetCzk <= 0) {
      alert("Please fill in all fields");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/google-ads/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCampaign),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateDialog(false);
        setNewCampaign({ name: "", dailyBudgetCzk: 100 });
        fetchData();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("Error creating campaign:", err);
      alert("Failed to create campaign");
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateAds = async () => {
    setGenerating(true);
    setGeneratedAds(null);
    try {
      const res = await fetch("/api/google-ads/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...generateForm,
          targetKeywords: generateForm.targetKeywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedAds(data.data);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("Error generating ads:", err);
      alert("Failed to generate ads");
    } finally {
      setGenerating(false);
    }
  };

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
            <div className="flex gap-2">
              <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={!connected}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Generátor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>AI Generátor reklam</DialogTitle>
                    <DialogDescription>
                      Vygeneruj headlines, descriptions a klíčová slova pomocí AI
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Název firmy</Label>
                        <Input
                          value={generateForm.businessName}
                          onChange={(e) =>
                            setGenerateForm({ ...generateForm, businessName: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Jazyk</Label>
                        <Select
                          value={generateForm.language}
                          onValueChange={(v: "cs" | "de" | "en") =>
                            setGenerateForm({ ...generateForm, language: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cs">Čeština</SelectItem>
                            <SelectItem value="de">Němčina</SelectItem>
                            <SelectItem value="en">Angličtina</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Popis firmy/služeb</Label>
                      <Textarea
                        rows={3}
                        value={generateForm.businessDescription}
                        onChange={(e) =>
                          setGenerateForm({ ...generateForm, businessDescription: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cíl kampaně</Label>
                        <Select
                          value={generateForm.campaignGoal}
                          onValueChange={(v: "traffic" | "leads" | "sales" | "brand") =>
                            setGenerateForm({ ...generateForm, campaignGoal: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="traffic">Návštěvnost</SelectItem>
                            <SelectItem value="leads">Leady/Poptávky</SelectItem>
                            <SelectItem value="sales">Prodeje</SelectItem>
                            <SelectItem value="brand">Brand awareness</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Cílová skupina</Label>
                        <Input
                          value={generateForm.targetAudience}
                          onChange={(e) =>
                            setGenerateForm({ ...generateForm, targetAudience: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Klíčová slova (oddělená čárkou)</Label>
                      <Input
                        placeholder="webdesign, tvorba webu, webové stránky"
                        value={generateForm.targetKeywords}
                        onChange={(e) =>
                          setGenerateForm({ ...generateForm, targetKeywords: e.target.value })
                        }
                      />
                    </div>
                    <Button onClick={handleGenerateAds} disabled={generating}>
                      {generating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generuji...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Vygenerovat
                        </>
                      )}
                    </Button>

                    {generatedAds && (
                      <div className="space-y-4 mt-4 border-t pt-4">
                        <div>
                          <h4 className="font-semibold mb-2">Headlines (max 30 znaků)</h4>
                          <div className="flex flex-wrap gap-2">
                            {generatedAds.headlines.map((h, i) => (
                              <Badge key={i} variant="secondary" className="text-sm">
                                {h} ({h.length})
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Descriptions (max 90 znaků)</h4>
                          <div className="space-y-1">
                            {generatedAds.descriptions.map((d, i) => (
                              <p key={i} className="text-sm bg-muted p-2 rounded">
                                {d} ({d.length})
                              </p>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Klíčová slova</h4>
                          <div className="flex flex-wrap gap-2">
                            {generatedAds.keywords.map((k, i) => (
                              <Badge key={i} variant="outline">
                                [{k.matchType}] {k.text}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {generatedAds.negativeKeywords.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Negativní klíčová slova</h4>
                            <div className="flex flex-wrap gap-2">
                              {generatedAds.negativeKeywords.map((k, i) => (
                                <Badge key={i} variant="destructive">
                                  -{k}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {generatedAds.callouts.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Callouts</h4>
                            <div className="flex flex-wrap gap-2">
                              {generatedAds.callouts.map((c, i) => (
                                <Badge key={i} variant="secondary">
                                  {c}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

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
                      Kampaň bude vytvořena jako pozastavená. Po vytvoření ji můžete aktivovat.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Název kampaně</Label>
                      <Input
                        placeholder="Např. Search - Webdesign CZ"
                        value={newCampaign.name}
                        onChange={(e) =>
                          setNewCampaign({ ...newCampaign, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Denní rozpočet (CZK)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newCampaign.dailyBudgetCzk}
                        onChange={(e) =>
                          setNewCampaign({
                            ...newCampaign,
                            dailyBudgetCzk: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Zrušit
                    </Button>
                    <Button onClick={handleCreateCampaign} disabled={creating}>
                      {creating ? "Vytvářím..." : "Vytvořit kampaň"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button onClick={fetchData} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
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

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="campaigns">Kampaně</TabsTrigger>
                <TabsTrigger value="keywords">Klíčová slova</TabsTrigger>
              </TabsList>

              <TabsContent value="campaigns">
                <Card>
                  <CardHeader>
                    <CardTitle>Kampaně (posledních 30 dní)</CardTitle>
                    <CardDescription>
                      Přehled výkonu všech kampaní. Kliknutím na ikonu můžete kampaň zapnout/pozastavit.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Akce</TableHead>
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
                            <TableCell colSpan={9} className="text-center text-muted-foreground">
                              Žádné kampaně
                            </TableCell>
                          </TableRow>
                        ) : (
                          campaigns.map((campaign) => (
                            <TableRow key={campaign.id}>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleCampaign(campaign.id, campaign.status)}
                                  title={campaign.status === "ENABLED" ? "Pozastavit" : "Aktivovat"}
                                >
                                  {campaign.status === "ENABLED" ? (
                                    <Pause className="h-4 w-4 text-yellow-500" />
                                  ) : (
                                    <Play className="h-4 w-4 text-green-500" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell className="font-medium">{campaign.name}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={campaign.status === "ENABLED" ? "default" : "secondary"}
                                >
                                  {campaign.status === "ENABLED" ? "Aktivní" :
                                   campaign.status === "PAUSED" ? "Pozastavená" : campaign.status}
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
              </TabsContent>

              <TabsContent value="keywords">
                <Card>
                  <CardHeader>
                    <CardTitle>Klíčová slova (posledních 30 dní)</CardTitle>
                    <CardDescription>
                      Top 100 klíčových slov podle zobrazení
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Klíčové slovo</TableHead>
                          <TableHead>Typ shody</TableHead>
                          <TableHead>Kampaň</TableHead>
                          <TableHead className="text-right">Zobrazení</TableHead>
                          <TableHead className="text-right">Kliknutí</TableHead>
                          <TableHead className="text-right">CTR</TableHead>
                          <TableHead className="text-right">CPC</TableHead>
                          <TableHead className="text-right">Konverze</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {keywords.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground">
                              Žádná klíčová slova
                            </TableCell>
                          </TableRow>
                        ) : (
                          keywords.map((kw, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{kw.keyword}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{kw.matchType}</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {kw.campaignName}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(kw.impressions)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(kw.clicks)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatPercent(kw.ctr)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(kw.avgCpc)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(kw.conversions)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
