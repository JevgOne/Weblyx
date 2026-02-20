"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  AlertTriangle,
  Megaphone,
  Calendar,
  UserCircle,
} from "lucide-react";
import RecommendationsPanel from "./_components/RecommendationsPanel";
import CampaignWizard from "./_components/CampaignWizard";

// Format helpers - defined outside component to avoid re-creation on every render
const currencyFormatter = new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 });
const numberFormatter = new Intl.NumberFormat("cs-CZ");
const formatCurrency = (value: number) => currencyFormatter.format(value);
const formatNumber = (value: number) => numberFormatter.format(value);
const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;
const formatPercentDirect = (value: number) => `${value.toFixed(2)}%`;
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

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

interface ExpertNote {
  insight: string;
  test_first: string;
  warning: string;
}

interface AnalysisResult {
  strategy: {
    campaign_objective: string;
    target_audience: string;
    unique_value_proposition: string;
    key_differentiators: string[];
    brand_positioning?: string;
    recommended_budget_split: { search: number; display: number; remarketing: number };
  };
  personas?: Array<{
    name: string;
    age: string;
    position: string;
    pain_points: string[];
    goals: string[];
    objections: string[];
  }>;
  uvp_angles?: Array<{
    name: string;
    positioning: string;
  }>;
  headlines: Array<{ text: string; angle: string; chars: number }>;
  headlines_by_angle?: Array<{
    angle: string;
    headlines: Array<{ text: string; formula: string; chars: number }>;
  }>;
  descriptions: Array<{ text: string; angle: string; chars: number }>;
  descriptions_by_type?: {
    benefit: Array<{ text: string; chars: number }>;
    problem_solution: Array<{ text: string; chars: number }>;
    social_proof: Array<{ text: string; chars: number }>;
  };
  meta_ads?: {
    primary_texts: Array<{ text: string; angle: string }>;
    headlines: Array<{ text: string }>;
    descriptions: Array<{ text: string }>;
    creative_recommendations: string;
  };
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
  testing_plan?: {
    week_1: string;
    week_2: string;
    week_4: string;
  };
  expert_notes: {
    project_manager: string | ExpertNote;
    marketing: string | ExpertNote;
    seo: string | ExpertNote;
    ppc: string | ExpertNote;
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
  const [searchTerms, setSearchTerms] = useState<SearchTerm[]>([]);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("ads");
  const [adsSubTab, setAdsSubTab] = useState("campaigns");
  const [dateRange, setDateRange] = useState("30");

  // GA4 state
  const [ga4Data, setGa4Data] = useState<GA4Data | null>(null);
  const [ga4Error, setGa4Error] = useState<string | null>(null);
  const [ga4Connected, setGa4Connected] = useState(false);

  // Search Console state
  const [gscData, setGscData] = useState<SearchConsoleData | null>(null);
  const [gscError, setGscError] = useState<string | null>(null);
  const [gscConnected, setGscConnected] = useState(false);

  // Campaign wizard state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [wizardAnalysisData, setWizardAnalysisData] = useState<AnalysisResult | null>(null);

  // Campaign detail panel state
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const [campaignDetail, setCampaignDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingBudget, setUpdatingBudget] = useState(false);
  const [editBudget, setEditBudget] = useState<number>(0);
  const [removingCampaign, setRemovingCampaign] = useState(false);

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

  const fetchData = useCallback(async () => {
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

        // Mock search terms data (API endpoint doesn't exist yet)
        // This would typically come from /api/google-ads/search-terms
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
            searchTerm: "webové stránky na míru",
            keyword: "webové stránky",
            matchType: "BROAD",
            campaignName: keywordsData.data[0]?.campaignName || "Search Campaign",
            impressions: 750,
            clicks: 28,
            ctr: 0.037,
            cost: 540,
            conversions: 2,
            addedExcluded: "added",
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
            searchTerm: "wordpress šablony zdarma",
            keyword: "wordpress",
            matchType: "BROAD",
            campaignName: keywordsData.data[0]?.campaignName || "Search Campaign",
            impressions: 520,
            clicks: 8,
            ctr: 0.015,
            cost: 150,
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
          {
            searchTerm: "webová agentura brno",
            keyword: "webová agentura",
            matchType: "BROAD",
            campaignName: keywordsData.data[0]?.campaignName || "Search Campaign",
            impressions: 290,
            clicks: 12,
            ctr: 0.041,
            cost: 240,
            conversions: 0,
            addedExcluded: "none",
          },
        ] : [];
        setSearchTerms(mockSearchTerms);
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
  }, [dateRange]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  // Load persisted analysis result on mount
  useEffect(() => {
    if (!user) return;
    fetch("/api/google-ads/analyze/history")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setAnalysisResult(json.data);
          setAgentOutputs(json.agentOutputs || null);
        }
      })
      .catch(() => {
        // Silently ignore — no saved analysis yet
      });
  }, [user]);

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

  const handleOpenWizard = (fromAnalysis?: boolean) => {
    setWizardAnalysisData(fromAnalysis && analysisResult ? analysisResult : null);
    setShowCreateDialog(true);
  };

  const handleExpandCampaign = async (campaignId: string) => {
    if (expandedCampaignId === campaignId) {
      setExpandedCampaignId(null);
      setCampaignDetail(null);
      return;
    }
    setExpandedCampaignId(campaignId);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/google-ads/campaign/${campaignId}`);
      const data = await res.json();
      if (data.success) {
        setCampaignDetail(data.data);
        setEditBudget(data.data.budgetAmount || 0);
      }
    } catch (err) {
      console.error("Failed to load campaign details:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateBudget = async () => {
    if (!campaignDetail?.budgetId || editBudget <= 0) return;
    setUpdatingBudget(true);
    try {
      const res = await fetch(`/api/google-ads/budget/${campaignDetail.budgetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCzk: editBudget }),
      });
      const data = await res.json();
      if (data.success) {
        setCampaignDetail((prev: any) => prev ? { ...prev, budgetAmount: editBudget } : prev);
        fetchData();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert("Failed to update budget");
    } finally {
      setUpdatingBudget(false);
    }
  };

  const handleRemoveCampaign = async (campaignId: string) => {
    if (!confirm("Opravdu chcete smazat tuto kampaň? Tato akce je nevratná.")) return;
    setRemovingCampaign(true);
    try {
      const res = await fetch(`/api/google-ads/campaign/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REMOVED" }),
      });
      const data = await res.json();
      if (data.success) {
        setExpandedCampaignId(null);
        setCampaignDetail(null);
        fetchData();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert("Failed to remove campaign");
    } finally {
      setRemovingCampaign(false);
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

      if (data.success) {
        setAnalysisProgress(100);
        setAnalysisStep("✅ Hotovo!");
        setAnalysisResult(data.data);
        setAgentOutputs(data.agents);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Analysis failed: ${err?.message || "Network timeout - zkuste to znovu"}`);
    } finally {
      clearInterval(progressInterval);
      setAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const totals = useMemo(() => campaigns.reduce(
    (acc, c) => ({
      impressions: acc.impressions + c.impressions,
      clicks: acc.clicks + c.clicks,
      cost: acc.cost + c.cost,
      conversions: acc.conversions + c.conversions,
    }),
    { impressions: 0, clicks: 0, cost: 0, conversions: 0 }
  ), [campaigns]);

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
              <Button variant="ghost" size="icon" onClick={() => router.push("/admin/marketing")}>
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
                      {/* 1. Strategy Summary */}
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
                          {analysisResult.strategy.brand_positioning && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Brand Positioning</Label>
                              <p>{analysisResult.strategy.brand_positioning}</p>
                            </div>
                          )}
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

                      {/* 2. Personas */}
                      {analysisResult.personas && analysisResult.personas.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <UserCircle className="h-5 w-5 text-blue-600" />
                              Persony
                            </CardTitle>
                            <CardDescription>Cílové zákaznické profily</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {analysisResult.personas.map((p, i) => (
                                <div key={i} className="border rounded-lg p-4 space-y-3">
                                  <div>
                                    <p className="font-semibold text-base">{p.name}</p>
                                    <p className="text-sm text-muted-foreground">{p.age} | {p.position}</p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-red-600">Bolesti</Label>
                                    <ul className="text-sm space-y-1 mt-1">
                                      {p.pain_points.map((pp, j) => (
                                        <li key={j} className="flex items-start gap-1.5">
                                          <span className="text-red-400 mt-0.5 shrink-0">-</span>
                                          <span>{pp}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-green-600">Cíle</Label>
                                    <ul className="text-sm space-y-1 mt-1">
                                      {p.goals.map((g, j) => (
                                        <li key={j} className="flex items-start gap-1.5">
                                          <span className="text-green-400 mt-0.5 shrink-0">-</span>
                                          <span>{g}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-yellow-600">Námitky</Label>
                                    <ul className="text-sm space-y-1 mt-1">
                                      {p.objections.map((o, j) => (
                                        <li key={j} className="flex items-start gap-1.5">
                                          <span className="text-yellow-400 mt-0.5 shrink-0">-</span>
                                          <span>{o}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* 3. UVP Angles */}
                      {analysisResult.uvp_angles && analysisResult.uvp_angles.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Lightbulb className="h-5 w-5 text-yellow-600" />
                              UVP Úhly
                            </CardTitle>
                            <CardDescription>3 úhly pro A/B testování</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {analysisResult.uvp_angles.map((a, i) => (
                                <div key={i} className="border rounded-lg p-4 bg-gradient-to-b from-yellow-50/50 to-transparent">
                                  <p className="font-semibold text-base">{a.name}</p>
                                  <p className="text-sm text-muted-foreground mt-2">{a.positioning}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* 4. Headlines */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Headlines (max 30 znaků)</CardTitle>
                          <CardDescription>Klikni pro zkopírování</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {analysisResult.headlines_by_angle && analysisResult.headlines_by_angle.length > 0 ? (
                            <Tabs defaultValue={analysisResult.headlines_by_angle[0]?.angle}>
                              <TabsList className="mb-4 flex-wrap h-auto gap-1">
                                {analysisResult.headlines_by_angle.map((group, i) => (
                                  <TabsTrigger key={i} value={group.angle} className="text-xs">
                                    {group.angle}
                                  </TabsTrigger>
                                ))}
                              </TabsList>
                              {analysisResult.headlines_by_angle.map((group, gi) => (
                                <TabsContent key={gi} value={group.angle}>
                                  <div className="grid grid-cols-2 gap-2">
                                    {group.headlines.map((h, hi) => {
                                      const id = `ha-${gi}-${hi}`;
                                      return (
                                        <div
                                          key={hi}
                                          onClick={() => copyToClipboard(h.text, id)}
                                          className="flex items-center justify-between p-2 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
                                        >
                                          <div className="flex-1">
                                            <span className="font-medium">{h.text}</span>
                                            <div className="flex gap-2 mt-1">
                                              <Badge variant="outline" className="text-xs">{h.formula}</Badge>
                                              <span className="text-xs text-muted-foreground">{h.chars || h.text.length} zn.</span>
                                            </div>
                                          </div>
                                          {copiedItem === id ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                          ) : (
                                            <Copy className="h-4 w-4 text-muted-foreground" />
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </TabsContent>
                              ))}
                            </Tabs>
                          ) : (
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
                          )}
                        </CardContent>
                      </Card>

                      {/* 5. Descriptions */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Descriptions (max 90 znaků)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {analysisResult.descriptions_by_type &&
                           (analysisResult.descriptions_by_type.benefit?.length > 0 ||
                            analysisResult.descriptions_by_type.problem_solution?.length > 0 ||
                            analysisResult.descriptions_by_type.social_proof?.length > 0) ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Benefit */}
                              <div className="space-y-2">
                                <Label className="text-xs text-green-600 font-semibold">Benefit</Label>
                                {analysisResult.descriptions_by_type.benefit?.map((d, i) => {
                                  const id = `db-${i}`;
                                  return (
                                    <div
                                      key={i}
                                      onClick={() => copyToClipboard(d.text, id)}
                                      className="flex items-center justify-between p-2 bg-green-50/50 border border-green-100 rounded cursor-pointer hover:bg-green-50 transition-colors"
                                    >
                                      <div className="flex-1">
                                        <p className="text-sm">{d.text}</p>
                                        <span className="text-xs text-muted-foreground">{d.chars || d.text.length} zn.</span>
                                      </div>
                                      {copiedItem === id ? (
                                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                                      ) : (
                                        <Copy className="h-4 w-4 text-muted-foreground shrink-0" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              {/* Problem-Solution */}
                              <div className="space-y-2">
                                <Label className="text-xs text-orange-600 font-semibold">Problem-Solution</Label>
                                {analysisResult.descriptions_by_type.problem_solution?.map((d, i) => {
                                  const id = `dp-${i}`;
                                  return (
                                    <div
                                      key={i}
                                      onClick={() => copyToClipboard(d.text, id)}
                                      className="flex items-center justify-between p-2 bg-orange-50/50 border border-orange-100 rounded cursor-pointer hover:bg-orange-50 transition-colors"
                                    >
                                      <div className="flex-1">
                                        <p className="text-sm">{d.text}</p>
                                        <span className="text-xs text-muted-foreground">{d.chars || d.text.length} zn.</span>
                                      </div>
                                      {copiedItem === id ? (
                                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                                      ) : (
                                        <Copy className="h-4 w-4 text-muted-foreground shrink-0" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              {/* Social Proof */}
                              <div className="space-y-2">
                                <Label className="text-xs text-blue-600 font-semibold">Social Proof</Label>
                                {analysisResult.descriptions_by_type.social_proof?.map((d, i) => {
                                  const id = `ds-${i}`;
                                  return (
                                    <div
                                      key={i}
                                      onClick={() => copyToClipboard(d.text, id)}
                                      className="flex items-center justify-between p-2 bg-blue-50/50 border border-blue-100 rounded cursor-pointer hover:bg-blue-50 transition-colors"
                                    >
                                      <div className="flex-1">
                                        <p className="text-sm">{d.text}</p>
                                        <span className="text-xs text-muted-foreground">{d.chars || d.text.length} zn.</span>
                                      </div>
                                      {copiedItem === id ? (
                                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                                      ) : (
                                        <Copy className="h-4 w-4 text-muted-foreground shrink-0" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
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
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* 6. Meta Ads */}
                      {analysisResult.meta_ads && (
                        analysisResult.meta_ads.primary_texts?.length > 0 ||
                        analysisResult.meta_ads.headlines?.length > 0
                      ) && (
                        <Card className="border-blue-200 bg-blue-50/30">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Megaphone className="h-5 w-5 text-blue-600" />
                              Meta Ads (Facebook / Instagram)
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Primary Texts */}
                            {analysisResult.meta_ads.primary_texts?.length > 0 && (
                              <div>
                                <Label className="text-xs font-semibold">Primary Text (max 125 viditelných / 500 celkem)</Label>
                                <div className="space-y-2 mt-2">
                                  {analysisResult.meta_ads.primary_texts.map((t, i) => {
                                    const id = `mp-${i}`;
                                    return (
                                      <div
                                        key={i}
                                        onClick={() => copyToClipboard(t.text, id)}
                                        className="p-3 bg-white border rounded cursor-pointer hover:border-blue-300 transition-colors"
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1">
                                            <p className="text-sm">{t.text}</p>
                                            <Badge variant="outline" className="text-xs mt-2">{t.angle}</Badge>
                                          </div>
                                          {copiedItem === id ? (
                                            <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                                          ) : (
                                            <Copy className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            {/* Meta Headlines + Descriptions */}
                            <div className="grid grid-cols-2 gap-4">
                              {analysisResult.meta_ads.headlines?.length > 0 && (
                                <div>
                                  <Label className="text-xs font-semibold">Headlines (max 40 zn.)</Label>
                                  <div className="space-y-1 mt-2">
                                    {analysisResult.meta_ads.headlines.map((h, i) => {
                                      const id = `mh-${i}`;
                                      return (
                                        <div
                                          key={i}
                                          onClick={() => copyToClipboard(h.text, id)}
                                          className="flex items-center justify-between p-2 bg-white border rounded cursor-pointer hover:border-blue-300 transition-colors"
                                        >
                                          <span className="text-sm font-medium">{h.text}</span>
                                          {copiedItem === id ? (
                                            <Check className="h-4 w-4 text-green-500 shrink-0" />
                                          ) : (
                                            <Copy className="h-4 w-4 text-muted-foreground shrink-0" />
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              {analysisResult.meta_ads.descriptions?.length > 0 && (
                                <div>
                                  <Label className="text-xs font-semibold">Descriptions (max 30 zn.)</Label>
                                  <div className="space-y-1 mt-2">
                                    {analysisResult.meta_ads.descriptions.map((d, i) => {
                                      const id = `md-${i}`;
                                      return (
                                        <div
                                          key={i}
                                          onClick={() => copyToClipboard(d.text, id)}
                                          className="flex items-center justify-between p-2 bg-white border rounded cursor-pointer hover:border-blue-300 transition-colors"
                                        >
                                          <span className="text-sm">{d.text}</span>
                                          {copiedItem === id ? (
                                            <Check className="h-4 w-4 text-green-500 shrink-0" />
                                          ) : (
                                            <Copy className="h-4 w-4 text-muted-foreground shrink-0" />
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* Creative Recommendations */}
                            {analysisResult.meta_ads.creative_recommendations && (
                              <div className="p-3 bg-white border rounded">
                                <Label className="text-xs font-semibold">Creative doporučení</Label>
                                <p className="text-sm mt-1">{analysisResult.meta_ads.creative_recommendations}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* 7. Keywords */}
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

                      {/* 8. Extensions & Settings */}
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

                      {/* 9. Testing Plan */}
                      {analysisResult.testing_plan && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-indigo-600" />
                              Testovací plán
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="border rounded-lg p-4">
                                <Badge variant="default" className="mb-2">Týden 1</Badge>
                                <p className="text-sm">{analysisResult.testing_plan.week_1}</p>
                              </div>
                              <div className="border rounded-lg p-4">
                                <Badge variant="secondary" className="mb-2">Týden 2</Badge>
                                <p className="text-sm">{analysisResult.testing_plan.week_2}</p>
                              </div>
                              <div className="border rounded-lg p-4">
                                <Badge variant="outline" className="mb-2">Týden 4</Badge>
                                <p className="text-sm">{analysisResult.testing_plan.week_4}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* 10. Expert Notes */}
                      <Accordion type="single" collapsible>
                        <AccordionItem value="notes">
                          <AccordionTrigger>Poznámky od expertů</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 gap-3">
                              {([
                                { key: "project_manager" as const, label: "Project Manager", icon: <Briefcase className="h-4 w-4" />, bg: "bg-blue-50", text: "text-blue-700" },
                                { key: "marketing" as const, label: "Marketing", icon: <TrendingUp className="h-4 w-4" />, bg: "bg-green-50", text: "text-green-700" },
                                { key: "seo" as const, label: "SEO", icon: <Search className="h-4 w-4" />, bg: "bg-orange-50", text: "text-orange-700" },
                                { key: "ppc" as const, label: "PPC", icon: <Target className="h-4 w-4" />, bg: "bg-purple-50", text: "text-purple-700" },
                              ]).map(({ key, label, icon, bg, text }) => {
                                const note = analysisResult.expert_notes?.[key];
                                const isStructured = note && typeof note === "object";
                                return (
                                  <div key={key} className={`p-3 ${bg} rounded`}>
                                    <div className={`flex items-center gap-2 font-medium ${text}`}>
                                      {icon} {label}
                                    </div>
                                    {isStructured ? (
                                      <div className="mt-2 space-y-2 text-sm">
                                        <div>
                                          <span className="font-medium">Insight:</span>
                                          <p className="text-muted-foreground">{(note as ExpertNote).insight}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium">Testovat první:</span>
                                          <p className="text-muted-foreground">{(note as ExpertNote).test_first}</p>
                                        </div>
                                        <div className="flex items-start gap-1">
                                          <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 mt-0.5 shrink-0" />
                                          <p className="text-muted-foreground">{(note as ExpertNote).warning}</p>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-sm mt-1">{note as string}</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <div className="flex gap-3">
                        <Button onClick={() => { setShowAnalyzeDialog(false); handleOpenWizard(true); }} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Vytvořit kampaň z analýzy
                        </Button>
                        <Button onClick={() => setAnalysisResult(null)} variant="outline" className="flex-1">
                          Nová analýza
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Button disabled={!connected} onClick={() => handleOpenWizard(false)}>
                <Plus className="h-4 w-4 mr-2" />
                Nová kampaň
              </Button>

              <CampaignWizard
                open={showCreateDialog}
                onClose={() => { setShowCreateDialog(false); setWizardAnalysisData(null); }}
                onSuccess={fetchData}
                analysisResult={wizardAnalysisData}
              />

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
                        <Button variant="outline" onClick={() => handleOpenWizard(false)}>
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
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        CPA: {totals.conversions > 0 ? formatCurrency(totals.cost / totals.conversions) : "N/A"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                )}

                {/* Sub-tabs for Campaigns, Keywords, Search Terms */}
                {campaigns.length > 0 && (
                <Tabs value={adsSubTab} onValueChange={setAdsSubTab}>
                  <TabsList>
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
                  <TabsContent value="campaigns" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Kampaně (posledních 30 dní)</CardTitle>
                        <CardDescription>Přehled všech kampaní s rozšířenými metrikami včetně rozpočtu, CPA a ROAS</CardDescription>
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
                                <TableHead className="text-right">ROAS</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {campaigns.map((campaign) => {
                                const cpa = campaign.conversions > 0 ? campaign.cost / campaign.conversions : null;
                                const roas = campaign.cost > 0 && campaign.conversionValue
                                  ? campaign.conversionValue / campaign.cost
                                  : null;
                                const estimatedBudget = campaign.budgetAmount || Math.round(campaign.cost / 30 * 1.2);
                                const isExpanded = expandedCampaignId === campaign.id;

                                return (
                                  <React.Fragment key={campaign.id}>
                                    <TableRow
                                      className="cursor-pointer hover:bg-muted/50"
                                      onClick={() => handleExpandCampaign(campaign.id)}
                                    >
                                      <TableCell>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={(e) => { e.stopPropagation(); handleToggleCampaign(campaign.id, campaign.status); }}
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
                                      <TableCell className="text-right">
                                        {roas !== null ? (
                                          <span className={roas < 1 ? "text-red-500" : roas > 3 ? "text-green-500" : ""}>
                                            {roas.toFixed(2)}x
                                          </span>
                                        ) : (
                                          <span className="text-muted-foreground">-</span>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                    {isExpanded && (
                                      <TableRow>
                                        <TableCell colSpan={9} className="bg-muted/30 p-4">
                                          {loadingDetail ? (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                              <RefreshCw className="h-4 w-4 animate-spin" />
                                              Načítám detaily kampaně...
                                            </div>
                                          ) : campaignDetail ? (
                                            <div className="space-y-4">
                                              <div className="flex items-center gap-3">
                                                <h4 className="font-semibold">Správa kampaně</h4>
                                                <Badge variant="outline">{campaignDetail.channelType}</Badge>
                                              </div>
                                              <div className="flex flex-wrap gap-3">
                                                <Button
                                                  size="sm"
                                                  variant={campaign.status === "ENABLED" ? "outline" : "default"}
                                                  onClick={() => handleToggleCampaign(campaign.id, campaign.status)}
                                                >
                                                  {campaign.status === "ENABLED" ? (
                                                    <>
                                                      <Pause className="h-3 w-3 mr-1" />
                                                      Pozastavit
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Play className="h-3 w-3 mr-1" />
                                                      Aktivovat
                                                    </>
                                                  )}
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="destructive"
                                                  disabled={removingCampaign}
                                                  onClick={() => handleRemoveCampaign(campaign.id)}
                                                >
                                                  <XCircle className="h-3 w-3 mr-1" />
                                                  {removingCampaign ? "Mazání..." : "Smazat"}
                                                </Button>
                                              </div>
                                              <div className="flex items-end gap-3">
                                                <div className="space-y-1">
                                                  <Label className="text-xs">Denní rozpočet (CZK)</Label>
                                                  <Input
                                                    type="number"
                                                    min={1}
                                                    className="w-40 h-8"
                                                    value={editBudget}
                                                    onChange={(e) => setEditBudget(parseInt(e.target.value) || 0)}
                                                  />
                                                </div>
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  disabled={updatingBudget || editBudget === campaignDetail.budgetAmount}
                                                  onClick={handleUpdateBudget}
                                                >
                                                  {updatingBudget ? (
                                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                                  ) : (
                                                    <>
                                                      <DollarSign className="h-3 w-3 mr-1" />
                                                      Uložit rozpočet
                                                    </>
                                                  )}
                                                </Button>
                                                {editBudget !== campaignDetail.budgetAmount && (
                                                  <span className="text-xs text-muted-foreground">
                                                    Aktuální: {formatCurrency(campaignDetail.budgetAmount)}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          ) : (
                                            <p className="text-sm text-muted-foreground">Nepodařilo se načíst detaily</p>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Keywords Table */}
                  <TabsContent value="keywords" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Klíčová slova (posledních 30 dní)</CardTitle>
                        <CardDescription>Top klíčová slova seřazená podle počtu zobrazení</CardDescription>
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
                  <TabsContent value="searchTerms" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Vyhledávací dotazy (posledních 30 dní)</CardTitle>
                        <CardDescription>
                          Skutečné vyhledávací dotazy, které spustily vaše reklamy. Identifikujte nová klíčová slova nebo negativní slova.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {searchTerms.length === 0 ? (
                          <div className="text-center py-8">
                            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Zatím nejsou k dispozici žádné vyhledávací dotazy.</p>
                            <p className="text-sm text-muted-foreground mt-1">Data se zobrazí po získání dostatečného množství dat z kampaní.</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Vyhledávací dotaz</TableHead>
                                  <TableHead>Spouštěcí klíčové slovo</TableHead>
                                  <TableHead>Match Type</TableHead>
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
                                  <TableRow key={i} className={term.addedExcluded === "excluded" ? "bg-red-50/50" : term.addedExcluded === "added" ? "bg-green-50/50" : ""}>
                                    <TableCell className="font-medium">{term.searchTerm}</TableCell>
                                    <TableCell className="text-muted-foreground">{term.keyword}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline">{term.matchType}</Badge>
                                    </TableCell>
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
                                        <Badge variant="secondary">
                                          Nové
                                        </Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}

                        {/* Search Terms Tips */}
                        {searchTerms.length > 0 && (
                          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-yellow-500" />
                              Tipy pro optimalizaci
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>- Vyhledávací dotazy s vysokým CTR a konverzemi zvažte přidat jako klíčová slova</li>
                              <li>- Nerelevantní dotazy bez konverzí přidejte jako negativní klíčová slova</li>
                              <li>- Sledujte trendy ve vyhledávacích dotazech pro nové příležitosti</li>
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
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
