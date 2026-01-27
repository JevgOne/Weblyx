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
import { Progress } from "@/components/ui/progress";
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
  Sparkles,
  Brain,
  Users,
  Search,
  TrendingUp,
  Briefcase,
  Copy,
  Check,
  BarChart3,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Lightbulb,
} from "lucide-react";
import RecommendationsPanel from "./_components/RecommendationsPanel";

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

interface GA4Data {
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

interface AnalysisResult {
  strategy: {
    campaign_objective: string;
    target_audience: string;
    unique_value_proposition: string;
    key_differentiators: string[];
    recommended_budget_split: { search: number; display: number; remarketing: number };
  };
  headlines: Array<{ text: string; angle: string; chars: number }>;
  descriptions: Array<{ text: string; angle: string; chars: number }>;
  keywords: {
    high_intent: Array<{ text: string; matchType: string; intent: string }>;
    medium_intent: Array<{ text: string; matchType: string; intent: string }>;
    discovery: Array<{ text: string; matchType: string; intent: string }>;
  };
  negative_keywords: string[];
  extensions: {
    callouts: string[];
    sitelinks: Array<{ text: string; description: string }>;
    structured_snippets: { header: string; values: string[] };
  };
  campaign_settings: {
    bidding_strategy: string;
    daily_budget: number;
    target_cpa: number;
    ad_schedule: string;
    locations: string[];
    devices: string;
  };
  expert_notes: {
    project_manager: string;
    marketing: string;
    seo: string;
    ppc: string;
  };
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
  const [activeTab, setActiveTab] = useState("ads");
  const [dateRange, setDateRange] = useState("30");

  // GA4 state
  const [ga4Data, setGa4Data] = useState<GA4Data | null>(null);
  const [ga4Error, setGa4Error] = useState<string | null>(null);
  const [ga4Connected, setGa4Connected] = useState(false);

  // Search Console state
  const [gscData, setGscData] = useState<SearchConsoleData | null>(null);
  const [gscError, setGscError] = useState<string | null>(null);
  const [gscConnected, setGscConnected] = useState(false);

  // Create campaign state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: "", dailyBudgetCzk: 100 });

  // Multi-Agent Analysis state
  const [showAnalyzeDialog, setShowAnalyzeDialog] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [agentOutputs, setAgentOutputs] = useState<any>(null);
  const [analyzeForm, setAnalyzeForm] = useState({
    websiteUrl: "https://weblyx.cz",
    competitors: "https://flavor.cz, https://flavor-design.cz",
    language: "cs" as "cs" | "de" | "en",
    businessGoal: "leads" as "leads" | "traffic" | "sales" | "brand",
    monthlyBudget: 15000,
  });

  // Copy state
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Fetch Google Ads data
      const testRes = await fetch("/api/google-ads/test");
      const testData = await testRes.json();

      if (testData.success) {
        setConnected(true);
        setCustomerInfo(testData.data);

        const [campaignsRes, keywordsRes] = await Promise.all([
          fetch("/api/google-ads/campaigns"),
          fetch("/api/google-ads/keywords"),
        ]);

        const campaignsData = await campaignsRes.json();
        const keywordsData = await keywordsRes.json();

        if (campaignsData.success) setCampaigns(campaignsData.data || []);
        if (keywordsData.success) setKeywords(keywordsData.data || []);
      } else {
        setConnected(false);
        setError(testData.error || "Google Ads connection failed");
      }

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
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(value);

  const formatNumber = (value: number) => new Intl.NumberFormat("cs-CZ").format(value);

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;
  const formatPercentDirect = (value: number) => `${value.toFixed(2)}%`;
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
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
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
      alert("Failed to create campaign");
    } finally {
      setCreating(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysisResult(null);
    setAgentOutputs(null);
    setAnalysisProgress(0);

    // Simulate progress steps
    const steps = [
      { progress: 10, step: "Načítám web a konkurenci..." },
      { progress: 25, step: "👔 Project Manager analyzuje situaci..." },
      { progress: 45, step: "📊 Marketing Strategist tvoří positioning..." },
      { progress: 65, step: "🔍 SEO Expert hledá klíčová slova..." },
      { progress: 80, step: "💰 PPC Specialist píše reklamy..." },
      { progress: 95, step: "🎯 Finalizuji výsledky..." },
    ];

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setAnalysisProgress(steps[stepIndex].progress);
        setAnalysisStep(steps[stepIndex].step);
        stepIndex++;
      }
    }, 4000);

    try {
      const res = await fetch("/api/google-ads/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...analyzeForm,
          competitors: analyzeForm.competitors.split(",").map((c) => c.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();

      clearInterval(progressInterval);

      if (data.success) {
        setAnalysisProgress(100);
        setAnalysisStep("✅ Hotovo!");
        setAnalysisResult(data.data);
        setAgentOutputs(data.agents);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      clearInterval(progressInterval);
      alert("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
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
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  Google Marketing
                  <div className="flex gap-1">
                    {connected && (
                      <Badge variant="default" className="bg-yellow-500 text-xs">Ads</Badge>
                    )}
                    {ga4Connected && (
                      <Badge variant="default" className="bg-blue-500 text-xs">GA4</Badge>
                    )}
                    {gscConnected && (
                      <Badge variant="default" className="bg-green-500 text-xs">GSC</Badge>
                    )}
                  </div>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Google Ads • Analytics 4 • Search Console
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={showAnalyzeDialog} onOpenChange={setShowAnalyzeDialog}>
                <DialogTrigger asChild>
                  <Button variant="default" className="bg-gradient-to-r from-purple-600 to-blue-600">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Analýza (4 Agenti)
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Multi-Agent AI Analýza
                    </DialogTitle>
                    <DialogDescription>
                      4 AI agenti spolupracují na vytvoření TOP reklam: Project Manager, Marketing Strategist, SEO Expert, PPC Specialist
                    </DialogDescription>
                  </DialogHeader>

                  {!analysisResult ? (
                    <div className="space-y-6 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>URL webu k analýze</Label>
                          <Input
                            value={analyzeForm.websiteUrl}
                            onChange={(e) => setAnalyzeForm({ ...analyzeForm, websiteUrl: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Jazyk reklam</Label>
                          <Select
                            value={analyzeForm.language}
                            onValueChange={(v: "cs" | "de" | "en") => setAnalyzeForm({ ...analyzeForm, language: v })}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cs">Čeština</SelectItem>
                              <SelectItem value="de">Němčina</SelectItem>
                              <SelectItem value="en">Angličtina</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Konkurenční weby (oddělené čárkou)</Label>
                        <Input
                          placeholder="https://competitor1.cz, https://competitor2.cz"
                          value={analyzeForm.competitors}
                          onChange={(e) => setAnalyzeForm({ ...analyzeForm, competitors: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Cíl kampaně</Label>
                          <Select
                            value={analyzeForm.businessGoal}
                            onValueChange={(v: "leads" | "traffic" | "sales" | "brand") =>
                              setAnalyzeForm({ ...analyzeForm, businessGoal: v })
                            }
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="leads">Leady / Poptávky</SelectItem>
                              <SelectItem value="traffic">Návštěvnost</SelectItem>
                              <SelectItem value="sales">Prodeje</SelectItem>
                              <SelectItem value="brand">Brand awareness</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Měsíční rozpočet (CZK)</Label>
                          <Input
                            type="number"
                            value={analyzeForm.monthlyBudget}
                            onChange={(e) => setAnalyzeForm({ ...analyzeForm, monthlyBudget: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>

                      {analyzing && (
                        <div className="space-y-3 p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span className="font-medium">{analysisStep}</span>
                          </div>
                          <Progress value={analysisProgress} />
                          <p className="text-xs text-muted-foreground">
                            Analýza může trvat 30-60 sekund. 4 AI agenti pracují na vašem zadání...
                          </p>
                        </div>
                      )}

                      {/* Data Sources Status */}
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Dostupné datové zdroje pro analýzu</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-4 gap-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${connected && campaigns.length > 0 ? 'bg-green-500' : campaigns.length === 0 ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                              <div>
                                <p className="text-sm font-medium">Google Ads</p>
                                <p className="text-xs text-muted-foreground">
                                  {connected && campaigns.length > 0 ? `${campaigns.length} kampaní` : campaigns.length === 0 ? 'Bez historie' : 'Nepřipojeno'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${ga4Connected ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <div>
                                <p className="text-sm font-medium">GA4</p>
                                <p className="text-xs text-muted-foreground">
                                  {ga4Connected ? `${ga4Data?.summary.totalUsers || 0} uživatelů` : 'Nepřipojeno'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${gscConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <div>
                                <p className="text-sm font-medium">Search Console</p>
                                <p className="text-xs text-muted-foreground">
                                  {gscConnected ? `${gscData?.topQueries.length || 0} dotazů` : 'Nepřipojeno'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                              <div>
                                <p className="text-sm font-medium">Web + Konkurence</p>
                                <p className="text-xs text-muted-foreground">Vždy dostupné</p>
                              </div>
                            </div>
                          </div>
                          {campaigns.length === 0 && (
                            <p className="text-xs text-muted-foreground mt-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                              💡 Tip: I bez historie Google Ads vytvoří AI kvalitní kampaň na základě GA4, Search Console a analýzy webu.
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-4 gap-3">
                        <Card className="p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="h-4 w-4 text-blue-500" />
                            <span>Project Manager</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Strategie & směr</p>
                        </Card>
                        <Card className="p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span>Marketing</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Positioning & messaging</p>
                        </Card>
                        <Card className="p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Search className="h-4 w-4 text-orange-500" />
                            <span>SEO Expert</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Klíčová slova</p>
                        </Card>
                        <Card className="p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="h-4 w-4 text-purple-500" />
                            <span>PPC Specialist</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Ad copy & optimalizace</p>
                        </Card>
                      </div>

                      <Button onClick={handleAnalyze} disabled={analyzing} className="w-full" size="lg">
                        {analyzing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Analyzuji...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Spustit AI Analýzu
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6 py-4">
                      {/* Strategy Summary */}
                      <Card className="border-green-200 bg-green-50/50">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="h-5 w-5 text-green-600" />
                            Strategie
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Cíl kampaně</Label>
                            <p className="font-medium">{analysisResult.strategy.campaign_objective}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Cílová skupina</Label>
                            <p>{analysisResult.strategy.target_audience}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Unique Value Proposition</Label>
                            <p className="font-medium text-primary">{analysisResult.strategy.unique_value_proposition}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Diferenciátory</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {analysisResult.strategy.key_differentiators.map((d, i) => (
                                <Badge key={i} variant="secondary">{d}</Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Headlines */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Headlines (max 30 znaků)</CardTitle>
                          <CardDescription>Klikni pro zkopírování</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2">
                            {analysisResult.headlines.map((h, i) => (
                              <div
                                key={i}
                                onClick={() => copyToClipboard(h.text, `h-${i}`)}
                                className="flex items-center justify-between p-2 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
                              >
                                <div className="flex-1">
                                  <span className="font-medium">{h.text}</span>
                                  <div className="flex gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">{h.angle}</Badge>
                                    <span className="text-xs text-muted-foreground">{h.chars || h.text.length} zn.</span>
                                  </div>
                                </div>
                                {copiedItem === `h-${i}` ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Descriptions */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Descriptions (max 90 znaků)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {analysisResult.descriptions.map((d, i) => (
                            <div
                              key={i}
                              onClick={() => copyToClipboard(d.text, `d-${i}`)}
                              className="flex items-center justify-between p-3 bg-muted rounded cursor-pointer hover:bg-muted/80"
                            >
                              <div className="flex-1">
                                <p>{d.text}</p>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{d.angle}</Badge>
                                  <span className="text-xs text-muted-foreground">{d.chars || d.text.length} zn.</span>
                                </div>
                              </div>
                              {copiedItem === `d-${i}` ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Keywords */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Klíčová slova</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue="high">
                            <TabsList className="mb-4">
                              <TabsTrigger value="high">High Intent</TabsTrigger>
                              <TabsTrigger value="medium">Medium Intent</TabsTrigger>
                              <TabsTrigger value="discovery">Discovery</TabsTrigger>
                              <TabsTrigger value="negative">Negativní</TabsTrigger>
                            </TabsList>
                            <TabsContent value="high">
                              <div className="flex flex-wrap gap-2">
                                {analysisResult.keywords.high_intent?.map((k, i) => (
                                  <Badge key={i} className="cursor-pointer" onClick={() => copyToClipboard(k.text, `kh-${i}`)}>
                                    [{k.matchType}] {k.text}
                                  </Badge>
                                ))}
                              </div>
                            </TabsContent>
                            <TabsContent value="medium">
                              <div className="flex flex-wrap gap-2">
                                {analysisResult.keywords.medium_intent?.map((k, i) => (
                                  <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => copyToClipboard(k.text, `km-${i}`)}>
                                    [{k.matchType}] {k.text}
                                  </Badge>
                                ))}
                              </div>
                            </TabsContent>
                            <TabsContent value="discovery">
                              <div className="flex flex-wrap gap-2">
                                {analysisResult.keywords.discovery?.map((k, i) => (
                                  <Badge key={i} variant="outline" className="cursor-pointer" onClick={() => copyToClipboard(k.text, `kd-${i}`)}>
                                    [{k.matchType}] {k.text}
                                  </Badge>
                                ))}
                              </div>
                            </TabsContent>
                            <TabsContent value="negative">
                              <div className="flex flex-wrap gap-2">
                                {analysisResult.negative_keywords?.map((k, i) => (
                                  <Badge key={i} variant="destructive" className="cursor-pointer" onClick={() => copyToClipboard(k, `kn-${i}`)}>
                                    -{k}
                                  </Badge>
                                ))}
                              </div>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>

                      {/* Extensions & Settings */}
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Ad Extensions</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-xs">Callouts</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {analysisResult.extensions?.callouts?.map((c, i) => (
                                  <Badge key={i} variant="secondary">{c}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Sitelinks</Label>
                              <div className="space-y-1 mt-1">
                                {analysisResult.extensions?.sitelinks?.map((s, i) => (
                                  <div key={i} className="text-sm">
                                    <span className="font-medium">{s.text}</span>
                                    <span className="text-muted-foreground"> - {s.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Doporučené nastavení</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Bidding:</span>
                              <span>{analysisResult.campaign_settings?.bidding_strategy}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Denní rozpočet:</span>
                              <span>{formatCurrency(analysisResult.campaign_settings?.daily_budget || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Target CPA:</span>
                              <span>{formatCurrency(analysisResult.campaign_settings?.target_cpa || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Čas:</span>
                              <span>{analysisResult.campaign_settings?.ad_schedule}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Expert Notes */}
                      <Accordion type="single" collapsible>
                        <AccordionItem value="notes">
                          <AccordionTrigger>Poznámky od expertů</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-blue-50 rounded">
                                <div className="flex items-center gap-2 font-medium text-blue-700">
                                  <Briefcase className="h-4 w-4" /> Project Manager
                                </div>
                                <p className="text-sm mt-1">{analysisResult.expert_notes?.project_manager}</p>
                              </div>
                              <div className="p-3 bg-green-50 rounded">
                                <div className="flex items-center gap-2 font-medium text-green-700">
                                  <TrendingUp className="h-4 w-4" /> Marketing
                                </div>
                                <p className="text-sm mt-1">{analysisResult.expert_notes?.marketing}</p>
                              </div>
                              <div className="p-3 bg-orange-50 rounded">
                                <div className="flex items-center gap-2 font-medium text-orange-700">
                                  <Search className="h-4 w-4" /> SEO
                                </div>
                                <p className="text-sm mt-1">{analysisResult.expert_notes?.seo}</p>
                              </div>
                              <div className="p-3 bg-purple-50 rounded">
                                <div className="flex items-center gap-2 font-medium text-purple-700">
                                  <Target className="h-4 w-4" /> PPC
                                </div>
                                <p className="text-sm mt-1">{analysisResult.expert_notes?.ppc}</p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <Button onClick={() => setAnalysisResult(null)} variant="outline" className="w-full">
                        Nová analýza
                      </Button>
                    </div>
                  )}
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
                    <DialogDescription>Kampaň bude vytvořena jako pozastavená.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Název kampaně</Label>
                      <Input
                        placeholder="Search - Webdesign CZ"
                        value={newCampaign.name}
                        onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Denní rozpočet (CZK)</Label>
                      <Input
                        type="number"
                        value={newCampaign.dailyBudgetCzk}
                        onChange={(e) => setNewCampaign({ ...newCampaign, dailyBudgetCzk: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <Button onClick={handleCreateCampaign} disabled={creating} className="w-full">
                      {creating ? "Vytvářím..." : "Vytvořit kampaň"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button onClick={fetchData} disabled={refreshing} variant="outline">
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="ads" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Google Ads
                  {connected ? (
                    <Badge variant="default" className="bg-green-500 ml-1 h-5 px-1">
                      <CheckCircle className="h-3 w-3" />
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="ml-1 h-5 px-1">
                      <XCircle className="h-3 w-3" />
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="ga4" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics (GA4)
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
                <TabsTrigger value="recommendations" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Doporučení
                  <Badge variant="default" className="bg-purple-500 ml-1">AI</Badge>
                </TabsTrigger>
              </TabsList>

              {/* Google Ads Tab */}
              <TabsContent value="ads" className="space-y-6">
                {/* Empty State - No Campaigns */}
                {campaigns.length === 0 && connected && (
                  <Card className="border-dashed border-2 border-muted-foreground/25">
                    <CardContent className="pt-12 pb-12 text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Target className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Zatím nemáte žádnou kampaň</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        Začněte vytvořením první kampaně. AI analýza použije data z GA4 a Search Console
                        pro vytvoření optimální strategie, i bez historie Google Ads.
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button onClick={() => setShowAnalyzeDialog(true)} className="bg-gradient-to-r from-purple-600 to-blue-600">
                          <Brain className="h-4 w-4 mr-2" />
                          Spustit AI Analýzu
                        </Button>
                        <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Vytvořit kampaň manuálně
                        </Button>
                      </div>
                      <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto">
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${ga4Connected ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <p className="text-xs font-medium">GA4 Data</p>
                          <p className="text-xs text-muted-foreground">{ga4Connected ? 'Dostupné' : 'Nepřipojeno'}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${gscConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <p className="text-xs font-medium">Search Console</p>
                          <p className="text-xs text-muted-foreground">{gscConnected ? 'Dostupné' : 'Nepřipojeno'}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-green-500" />
                          <p className="text-xs font-medium">Web Analýza</p>
                          <p className="text-xs text-muted-foreground">Vždy dostupné</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Summary Cards for Ads */}
                {campaigns.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-1">
                        <Eye className="h-4 w-4" /> Zobrazení
                      </CardDescription>
                      <CardTitle className="text-3xl">{formatNumber(totals.impressions)}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-1">
                        <MousePointer className="h-4 w-4" /> Kliknutí
                      </CardDescription>
                      <CardTitle className="text-3xl">{formatNumber(totals.clicks)}</CardTitle>
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
                        <DollarSign className="h-4 w-4" /> Útrata
                      </CardDescription>
                      <CardTitle className="text-3xl">{formatCurrency(totals.cost)}</CardTitle>
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
                        <Target className="h-4 w-4" /> Konverze
                      </CardDescription>
                      <CardTitle className="text-3xl text-primary">{formatNumber(totals.conversions)}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>
                )}

                {/* Campaigns Table - only show if campaigns exist */}
                {campaigns.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Kampaně (posledních 30 dní)</CardTitle>
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
                        {campaigns.map((campaign) => (
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
                            <TableCell className="text-right">{formatNumber(campaign.impressions)}</TableCell>
                            <TableCell className="text-right">{formatNumber(campaign.clicks)}</TableCell>
                            <TableCell className="text-right">{formatPercent(campaign.ctr)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(campaign.avgCpc)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(campaign.cost)}</TableCell>
                            <TableCell className="text-right">{formatNumber(campaign.conversions)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                )}

                {/* Keywords Table - only show if keywords exist */}
                {keywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Klíčová slova (posledních 30 dní)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Klíčové slovo</TableHead>
                          <TableHead>Match</TableHead>
                          <TableHead>Kampaň</TableHead>
                          <TableHead className="text-right">Zobrazení</TableHead>
                          <TableHead className="text-right">Kliknutí</TableHead>
                          <TableHead className="text-right">CTR</TableHead>
                          <TableHead className="text-right">CPC</TableHead>
                          <TableHead className="text-right">Konverze</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {keywords.map((kw, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{kw.keyword}</TableCell>
                            <TableCell><Badge variant="outline">{kw.matchType}</Badge></TableCell>
                            <TableCell className="text-muted-foreground">{kw.campaignName}</TableCell>
                            <TableCell className="text-right">{formatNumber(kw.impressions)}</TableCell>
                            <TableCell className="text-right">{formatNumber(kw.clicks)}</TableCell>
                            <TableCell className="text-right">{formatPercent(kw.ctr)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(kw.avgCpc)}</TableCell>
                            <TableCell className="text-right">{formatNumber(kw.conversions)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                )}
              </TabsContent>

              {/* GA4 Tab */}
              <TabsContent value="ga4">
                {ga4Error && (
                  <Card className="border-dashed border-2 border-muted-foreground/25">
                    <CardContent className="pt-12 pb-12 text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <BarChart3 className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Google Analytics 4 není připojeno</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-4">
                        Propojte GA4 pro sledování návštěvnosti, chování uživatelů a konverzí na webu.
                      </p>
                      <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto text-left">
                        <p className="text-sm font-medium mb-2">Nastavení:</p>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                          <li>Přidejte <code className="bg-muted px-1 rounded">GA4_PROPERTY_ID</code> do env variables</li>
                          <li>Přidejte Service Account do GA4 s oprávněním Viewer</li>
                        </ol>
                      </div>
                      {ga4Error && (
                        <p className="text-xs text-destructive mt-4">Chyba: {ga4Error}</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {ga4Data && (
                  <div className="space-y-6">
                    {/* GA4 Summary Cards */}
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
                          <CardTitle className="text-3xl">{formatPercentDirect(ga4Data.summary.avgBounceRate)}</CardTitle>
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
                                  <TableCell className="text-right">{formatPercentDirect(page.bounceRate)}</TableCell>
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
                                  {formatNumber(device.sessions)} sessions • {formatPercentDirect(device.bounceRate)} bounce
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
                        Nastav SEARCH_CONSOLE_SITE_URL a GOOGLE_SERVICE_ACCOUNT_KEY
                      </p>
                    </CardContent>
                  </Card>
                )}

                {gscData && (
                  <div className="space-y-6">
                    {/* GSC Summary Cards */}
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
                          <CardTitle className="text-3xl">{formatPercentDirect(gscData.summary.avgCtr)}</CardTitle>
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
                                  <TableCell className="text-right">{formatPercentDirect(page.ctr)}</TableCell>
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

              {/* Recommendations Tab */}
              <TabsContent value="recommendations">
                <RecommendationsPanel />
              </TabsContent>
            </Tabs>
          </div>
      </main>
    </div>
  );
}
