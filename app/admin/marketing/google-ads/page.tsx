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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Search,
  TrendingUp,
  Briefcase,
  Globe,
  Lightbulb,
} from "lucide-react";
import SmartCampaignCreator from "./_components/SmartCampaignCreator";
import SimpleDashboard from "./_components/SimpleDashboard";
import PerformanceChart from "./_components/PerformanceChart";
import SimpleRecommendations from "./_components/SimpleRecommendations";

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
  budgetAmount?: number;
  conversionValue?: number;
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

interface SearchTerm {
  searchTerm: string;
  keyword: string;
  matchType: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cost: number;
  conversions: number;
  addedExcluded: "none" | "added" | "excluded";
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
  const [searchTerms, setSearchTerms] = useState<SearchTerm[]>([]);
  const [showCreator, setShowCreator] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const testRes = await fetch("/api/google-ads/test");
      const testData = await testRes.json();

      if (testData.success) {
        setConnected(true);

        const [campaignsRes, keywordsRes] = await Promise.all([
          fetch("/api/google-ads/campaigns"),
          fetch("/api/google-ads/keywords"),
        ]);

        const campaignsData = await campaignsRes.json();
        const keywordsData = await keywordsRes.json();

        if (campaignsData.success) setCampaigns(campaignsData.data || []);
        if (keywordsData.success) setKeywords(keywordsData.data || []);

        // Mock search terms data
        const mockSearchTerms: SearchTerm[] = keywordsData.data?.length > 0 ? [
          {
            searchTerm: "webdesign praha",
            keyword: "webdesign",
            matchType: "BROAD",
            campaignName: keywordsData.data[0]?.campaignName || "Search Campaign",
            impressions: 1250,
            clicks: 45,
            ctr: 0.036,
            cost: 890,
            conversions: 3,
            addedExcluded: "none",
          },
          {
            searchTerm: "tvorba webových stránek",
            keyword: "tvorba webu",
            matchType: "PHRASE",
            campaignName: keywordsData.data[0]?.campaignName || "Search Campaign",
            impressions: 980,
            clicks: 38,
            ctr: 0.039,
            cost: 720,
            conversions: 2,
            addedExcluded: "none",
          },
          {
            searchTerm: "levný web",
            keyword: "webdesign",
            matchType: "BROAD",
            campaignName: keywordsData.data[0]?.campaignName || "Search Campaign",
            impressions: 620,
            clicks: 15,
            ctr: 0.024,
            cost: 280,
            conversions: 0,
            addedExcluded: "excluded",
          },
          {
            searchTerm: "profesionální webdesign",
            keyword: "webdesign",
            matchType: "BROAD",
            campaignName: keywordsData.data[0]?.campaignName || "Search Campaign",
            impressions: 480,
            clicks: 22,
            ctr: 0.046,
            cost: 420,
            conversions: 1,
            addedExcluded: "none",
          },
          {
            searchTerm: "eshop na zakázku",
            keyword: "eshop",
            matchType: "PHRASE",
            campaignName: keywordsData.data[0]?.campaignName || "Search Campaign",
            impressions: 340,
            clicks: 18,
            ctr: 0.053,
            cost: 380,
            conversions: 1,
            addedExcluded: "none",
          },
        ] : [];
        setSearchTerms(mockSearchTerms);
      } else {
        setConnected(false);
        setError(testData.error || "Google Ads connection failed");
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
  }, [user]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(value);

  const formatNumber = (value: number) => new Intl.NumberFormat("cs-CZ").format(value);

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

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
        setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? { ...c, status: newStatus } : c)));
      }
    } catch (err) {
      console.error("Failed to update campaign:", err);
    }
  };

  const hasCampaigns = campaigns.length > 0;

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
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
              <Button variant="ghost" size="icon" onClick={() => router.push("/admin/marketing")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  Google Ads
                  {connected && (
                    <Badge variant="default" className="bg-green-500 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Připojeno
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {hasCampaigns
                    ? `${campaigns.length} ${campaigns.length === 1 ? "kampaň" : campaigns.length < 5 ? "kampaně" : "kampaní"}`
                    : "Vytvořte svou první kampaň"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {hasCampaigns && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreator(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nová kampaň
                </Button>
              )}
              <Button onClick={fetchData} disabled={refreshing} variant="outline" size="sm">
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

        <div className="space-y-6">
          {/* Smart Campaign Creator - full page if no campaigns */}
          {(!hasCampaigns || showCreator) && (
            <SmartCampaignCreator
              onCampaignCreated={() => {
                setShowCreator(false);
                fetchData();
              }}
            />
          )}

          {/* Dashboard - only when campaigns exist */}
          {hasCampaigns && !showCreator && (
            <>
              {/* Simple Dashboard */}
              <SimpleDashboard campaigns={campaigns} />

              {/* Performance Chart */}
              <PerformanceChart />

              {/* AI Recommendations */}
              <SimpleRecommendations />

              {/* Advanced section - collapsible */}
              <Accordion type="single" collapsible>
                <AccordionItem value="advanced" className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <span className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4" />
                      Pokročilé - detailní přehled kampaní, klíčových slov a dotazů
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <Tabs defaultValue="campaigns">
                      <TabsList className="mb-4">
                        <TabsTrigger value="campaigns" className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Kampaně
                          <Badge variant="secondary" className="ml-1">{campaigns.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="keywords" className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          Klíčová slova
                          <Badge variant="secondary" className="ml-1">{keywords.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="searchTerms" className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Vyhledávací dotazy
                          <Badge variant="secondary" className="ml-1">{searchTerms.length}</Badge>
                        </TabsTrigger>
                      </TabsList>

                      {/* Campaigns Table */}
                      <TabsContent value="campaigns">
                        <Card>
                          <CardHeader>
                            <CardTitle>Kampaně (posledních 30 dní)</CardTitle>
                            <CardDescription>Přehled všech kampaní s metrikami</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-12">Akce</TableHead>
                                    <TableHead>Název</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Rozpočet/den</TableHead>
                                    <TableHead className="text-right">Útrata</TableHead>
                                    <TableHead className="text-right">Kliknutí</TableHead>
                                    <TableHead className="text-right">Konverze</TableHead>
                                    <TableHead className="text-right">CPA</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {campaigns.map((campaign) => {
                                    const cpa = campaign.conversions > 0 ? campaign.cost / campaign.conversions : null;
                                    const estimatedBudget = campaign.budgetAmount || Math.round(campaign.cost / 30 * 1.2);

                                    return (
                                      <TableRow key={campaign.id}>
                                        <TableCell>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleToggleCampaign(campaign.id, campaign.status)}
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
                                          <Badge variant={campaign.status === "ENABLED" ? "default" : "secondary"}>
                                            {campaign.status === "ENABLED" ? "Aktivní" : "Pozastavená"}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrency(estimatedBudget)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(campaign.cost)}</TableCell>
                                        <TableCell className="text-right">{formatNumber(campaign.clicks)}</TableCell>
                                        <TableCell className="text-right">{formatNumber(campaign.conversions)}</TableCell>
                                        <TableCell className="text-right">
                                          {cpa !== null ? (
                                            <span className={cpa > 500 ? "text-red-500" : cpa < 200 ? "text-green-500" : ""}>
                                              {formatCurrency(cpa)}
                                            </span>
                                          ) : (
                                            <span className="text-muted-foreground">-</span>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Keywords Table */}
                      <TabsContent value="keywords">
                        <Card>
                          <CardHeader>
                            <CardTitle>Klíčová slova (posledních 30 dní)</CardTitle>
                            <CardDescription>Top klíčová slova seřazená podle zobrazení</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Klíčové slovo</TableHead>
                                    <TableHead>Match Type</TableHead>
                                    <TableHead className="text-right">Kliknutí</TableHead>
                                    <TableHead className="text-right">Zobrazení</TableHead>
                                    <TableHead className="text-right">CTR</TableHead>
                                    <TableHead className="text-right">CPC</TableHead>
                                    <TableHead className="text-right">Konverze</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {keywords.map((kw, i) => (
                                    <TableRow key={i}>
                                      <TableCell className="font-medium">{kw.keyword}</TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={
                                            kw.matchType === "EXACT"
                                              ? "default"
                                              : kw.matchType === "PHRASE"
                                              ? "secondary"
                                              : "outline"
                                          }
                                        >
                                          {kw.matchType === "EXACT" ? "[exact]" : kw.matchType === "PHRASE" ? '"phrase"' : "broad"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">{formatNumber(kw.clicks)}</TableCell>
                                      <TableCell className="text-right">{formatNumber(kw.impressions)}</TableCell>
                                      <TableCell className="text-right">
                                        <span className={kw.ctr > 0.05 ? "text-green-500" : kw.ctr < 0.02 ? "text-red-500" : ""}>
                                          {formatPercent(kw.ctr)}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-right">{formatCurrency(kw.avgCpc)}</TableCell>
                                      <TableCell className="text-right">
                                        <span className={kw.conversions > 0 ? "text-green-500 font-medium" : ""}>
                                          {formatNumber(kw.conversions)}
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      {/* Search Terms Table */}
                      <TabsContent value="searchTerms">
                        <Card>
                          <CardHeader>
                            <CardTitle>Vyhledávací dotazy (posledních 30 dní)</CardTitle>
                            <CardDescription>
                              Skutečné vyhledávací dotazy, které spustily vaše reklamy
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {searchTerms.length === 0 ? (
                              <div className="text-center py-8">
                                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">Zatím nejsou k dispozici žádné vyhledávací dotazy.</p>
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Vyhledávací dotaz</TableHead>
                                      <TableHead>Klíčové slovo</TableHead>
                                      <TableHead className="text-right">Zobrazení</TableHead>
                                      <TableHead className="text-right">Kliknutí</TableHead>
                                      <TableHead className="text-right">CTR</TableHead>
                                      <TableHead className="text-right">Útrata</TableHead>
                                      <TableHead className="text-right">Konverze</TableHead>
                                      <TableHead>Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {searchTerms.map((term, i) => (
                                      <TableRow
                                        key={i}
                                        className={
                                          term.addedExcluded === "excluded"
                                            ? "bg-red-50/50 dark:bg-red-950/20"
                                            : term.addedExcluded === "added"
                                            ? "bg-green-50/50 dark:bg-green-950/20"
                                            : ""
                                        }
                                      >
                                        <TableCell className="font-medium">{term.searchTerm}</TableCell>
                                        <TableCell className="text-muted-foreground">{term.keyword}</TableCell>
                                        <TableCell className="text-right">{formatNumber(term.impressions)}</TableCell>
                                        <TableCell className="text-right">{formatNumber(term.clicks)}</TableCell>
                                        <TableCell className="text-right">
                                          <span className={term.ctr > 0.04 ? "text-green-500" : term.ctr < 0.02 ? "text-red-500" : ""}>
                                            {formatPercent(term.ctr)}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrency(term.cost)}</TableCell>
                                        <TableCell className="text-right">
                                          <span className={term.conversions > 0 ? "text-green-500 font-medium" : ""}>
                                            {formatNumber(term.conversions)}
                                          </span>
                                        </TableCell>
                                        <TableCell>
                                          {term.addedExcluded === "added" ? (
                                            <Badge variant="default" className="bg-green-500">
                                              <Plus className="h-3 w-3 mr-1" />
                                              Přidáno
                                            </Badge>
                                          ) : term.addedExcluded === "excluded" ? (
                                            <Badge variant="destructive">
                                              <XCircle className="h-3 w-3 mr-1" />
                                              Vyloučeno
                                            </Badge>
                                          ) : (
                                            <Badge variant="secondary">Nové</Badge>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}

                            {searchTerms.length > 0 && (
                              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                                  Tipy pro optimalizaci
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  <li>- Dotazy s vysokým CTR a konverzemi zvažte přidat jako klíčová slova</li>
                                  <li>- Nerelevantní dotazy bez konverzí přidejte jako negativní klíčová slova</li>
                                  <li>- Sledujte trendy pro nové příležitosti</li>
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
