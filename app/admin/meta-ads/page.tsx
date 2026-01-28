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
  TrendingUp,
  Copy,
  Check,
  BarChart3,
  Lightbulb,
  Wand2,
  Briefcase,
  Instagram,
  Facebook,
  Megaphone,
  PenTool,
  Zap,
  Upload,
  ImageIcon,
  Loader2,
} from "lucide-react";
import MetaRecommendationsPanel from "./_components/RecommendationsPanel";

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
}

interface AnalysisResult {
  executive_summary?: string;
  raw_analysis?: string;

  alerts?: Array<{
    level: "critical" | "warning" | "info";
    message: string;
    action: string;
  }>;

  performance?: {
    current: {
      spend: number;
      conversions: number;
      cpa: number;
      roas: number;
      ctr: number;
    };
    vs_target: {
      cpa_status: "ok" | "warning" | "critical";
      roas_status: "ok" | "warning" | "critical";
      trend: "improving" | "stable" | "declining";
    };
  };

  strategy?: {
    target_audience?: {
      primary_persona?: {
        name: string;
        demographics: string;
        pain_points: string[];
        motivations: string[];
      };
      meta_targeting?: {
        interests: string[];
        behaviors: string[];
        lookalike_source: string;
      };
    };
    unique_value_proposition?: string;
    messaging_pillars?: string[];
    funnel_allocation?: {
      tofu_percent: number;
      mofu_percent: number;
      bofu_percent: number;
    };
  };

  campaigns?: Array<{
    name: string;
    objective: string;
    daily_budget: number;
    audience: {
      type: string;
      targeting: string;
      estimated_size: string;
    };
    status: "new" | "optimize" | "scale" | "pause";
  }>;

  ad_copy?: {
    primary_texts: Array<{ text: string; angle: string }>;
    headlines: Array<{ text: string }>;
    descriptions: string[];
    ctas: string[];
  };

  creative_concepts?: Array<{
    name: string;
    format: string;
    description: string;
    hook?: string;
    script?: string;
    specs?: {
      dimensions: string;
      duration?: string;
    };
    ai_image_prompt?: string;
  }>;

  optimization_actions?: Array<{
    priority: "critical" | "high" | "medium" | "low";
    action: string;
    reason: string;
    expected_impact: string;
  }>;

  setup_guide?: {
    step1_campaign: {
      name: string;
      objective: string;
      budget: number;
      bid_strategy: string;
    };
    step2_adset: {
      name: string;
      audience: {
        locations: string[];
        age_min: number;
        age_max: number;
        interests: string[];
      };
      placements: string;
      optimization: string;
    };
    step3_ad: {
      format: string;
      text: string;
      headline: string;
      cta: string;
    };
  };

  next_steps?: Array<{
    timeframe: string;
    action: string;
  }>;

  // Legacy support
  business_analysis?: {
    what_they_sell: string;
    target_customer: string;
    main_pain_point: string;
    unique_advantage: string;
    price_positioning: string;
  };
  hashtags?: string[];
  expert_notes?: {
    project_manager: string;
    marketing: string;
    facebook: string;
    instagram: string;
    ppc?: string;
  };
  quick_wins?: string[];
  common_mistakes?: string[];
}

export default function MetaAdsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [dateRange, setDateRange] = useState("last_30d");

  // Create campaign state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    objective: "OUTCOME_LEADS",
    dailyBudgetCzk: 200,
  });

  // AI Analysis state
  const [showAnalyzeDialog, setShowAnalyzeDialog] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  // Project config (stored in localStorage)
  const [projectConfig, setProjectConfig] = useState({
    name: "Weblyx",
    url: "https://weblyx.cz",
    type: "services" as "ecommerce" | "services" | "lead_gen",
    industry: "web_development",
    averageOrderValue: 7990,
    grossMargin: 0.7,
    targetRoas: 3.0,
    targetCpa: 2500,
    monthlyBudget: 15000,
    language: "cs" as "cs" | "en" | "de",
  });


  // Load config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("weblyx_project_config");
    if (saved) {
      try {
        setProjectConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading config:", e);
      }
    }
  }, []);

  // Ad Generator state
  const [showGeneratorDialog, setShowGeneratorDialog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatorForm, setGeneratorForm] = useState({
    type: "ad_copy" as "ad_copy" | "creative_concept" | "audience_suggestion" | "hashtags",
    product: "",
    benefit: "",
    targetAudience: "",
    tone: "friendly",
    language: "cs" as "cs" | "en" | "de",
    platform: "both" as "both" | "facebook" | "instagram",
  });
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  // Copy state
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Creative images state
  const [creativeImages, setCreativeImages] = useState<Record<number, string>>({});
  const [generatingImage, setGeneratingImage] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const testRes = await fetch("/api/meta-ads/test");
      const testData = await testRes.json();

      if (testData.success) {
        setConnected(true);
        setAccountInfo(testData.data);

        const campaignsRes = await fetch(
          `/api/meta-ads/campaigns?date_preset=${dateRange}`
        );
        const campaignsData = await campaignsRes.json();
        if (campaignsData.success) setCampaigns(campaignsData.data || []);
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleGenerateImage = async (index: number, prompt: string) => {
    setGeneratingImage(index);
    try {
      const res = await fetch("/api/meta-ads/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: "1:1" }),
      });
      const data = await res.json();
      if (data.success) {
        // For now, copy enhanced prompt to clipboard
        copyToClipboard(data.data.enhancedDescription, `gen-${index}`);
        alert("Vylepšený prompt zkopírován! Použij ho v Midjourney nebo DALL-E.");
      } else {
        alert(`Chyba: ${data.error}`);
      }
    } catch (err) {
      alert("Nepodařilo se vygenerovat");
    } finally {
      setGeneratingImage(null);
    }
  };

  const handleUploadImage = (index: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setCreativeImages((prev) => ({ ...prev, [index]: dataUrl }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleToggleCampaign = async (campaignId: string, currentStatus: string) => {
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
      }
    } catch (err) {
      alert("Failed to update campaign");
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || newCampaign.dailyBudgetCzk <= 0) return;
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
    setAnalysisProgress(0);

    const steps = [
      { progress: 10, step: "Načítám web a konkurenci..." },
      { progress: 20, step: "👔 Project Manager vytváří brief..." },
      { progress: 35, step: "📊 Marketing Strategist pracuje..." },
      { progress: 50, step: "📘 Facebook Ads Expert analyzuje..." },
      { progress: 65, step: "📸 Instagram Ads Expert tvoří..." },
      { progress: 80, step: "💰 PPC Specialist optimalizuje..." },
      { progress: 95, step: "🎯 Finalizuji výsledky..." },
    ];

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setAnalysisProgress(steps[stepIndex].progress);
        setAnalysisStep(steps[stepIndex].step);
        stepIndex++;
      }
    }, 5000);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 min timeout

      // Save config to localStorage
      localStorage.setItem("weblyx_project_config", JSON.stringify(projectConfig));

      const res = await fetch("/api/meta-ads/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: projectConfig,
          analysisType: "full",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      clearInterval(progressInterval);

      if (data.success) {
        setAnalysisProgress(100);
        setAnalysisStep("✅ Hotovo!");
        // Use agentOutputs if structured data failed
        setAnalysisResult(data.data?.strategy?.note ? data.agentOutputs : data.data);
        console.log("Full analysis response:", data);
      } else {
        alert(`Error: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      if (err.name === 'AbortError') {
        alert("Analýza trvala příliš dlouho (timeout). Zkuste to znovu.");
      } else {
        alert(`Analysis failed: ${err.message || "Unknown error"}`);
        console.error("Analysis error:", err);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!generatorForm.product || !generatorForm.benefit) {
      alert("Vyplňte produkt a benefit");
      return;
    }
    setGenerating(true);
    setGeneratedContent(null);

    try {
      const res = await fetch("/api/meta-ads/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatorForm),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedContent(data.data);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert("Generation failed");
    } finally {
      setGenerating(false);
    }
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
                    <Badge className="bg-blue-600 text-xs">Připojeno</Badge>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Facebook + Instagram Ads • AI Analýza • Generátor
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {/* AI Analysis Button */}
              <Dialog open={showAnalyzeDialog} onOpenChange={setShowAnalyzeDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Analýza (5 Agentů)
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Multi-Agent AI Analýza pro Meta Ads
                    </DialogTitle>
                    <DialogDescription>
                      5 AI expertů spolupracuje: Project Manager, Marketing
                      Strategist, Facebook Expert, Instagram Expert, PPC
                      Specialist
                    </DialogDescription>
                  </DialogHeader>

                  {!analysisResult ? (
                    <div className="space-y-6 py-4">
                      {/* Project Configuration */}
                      <Card className="border-primary/50 bg-primary/5">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Konfigurace projektu
                          </CardTitle>
                          <CardDescription>
                            Tyto metriky určují cíle a výpočty (AOV, marže, ROAS)
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Název projektu</Label>
                              <Input
                                value={projectConfig.name}
                                onChange={(e) =>
                                  setProjectConfig({
                                    ...projectConfig,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>URL webu</Label>
                              <Input
                                value={projectConfig.url}
                                onChange={(e) =>
                                  setProjectConfig({
                                    ...projectConfig,
                                    url: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Typ byznysu</Label>
                              <Select
                                value={projectConfig.type}
                                onValueChange={(v: any) =>
                                  setProjectConfig({ ...projectConfig, type: v })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                                  <SelectItem value="services">Služby</SelectItem>
                                  <SelectItem value="lead_gen">Lead Gen</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Odvětví</Label>
                              <Input
                                value={projectConfig.industry}
                                onChange={(e) =>
                                  setProjectConfig({
                                    ...projectConfig,
                                    industry: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Jazyk</Label>
                              <Select
                                value={projectConfig.language}
                                onValueChange={(v: any) =>
                                  setProjectConfig({ ...projectConfig, language: v })
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

                          <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label>AOV (Kč)</Label>
                              <Input
                                type="number"
                                value={projectConfig.averageOrderValue}
                                onChange={(e) =>
                                  setProjectConfig({
                                    ...projectConfig,
                                    averageOrderValue: parseInt(e.target.value) || 0,
                                  })
                                }
                              />
                              <p className="text-xs text-muted-foreground">Průměrná hodnota objednávky</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Marže (%)</Label>
                              <Input
                                type="number"
                                value={Math.round(projectConfig.grossMargin * 100)}
                                onChange={(e) =>
                                  setProjectConfig({
                                    ...projectConfig,
                                    grossMargin: (parseInt(e.target.value) || 0) / 100,
                                  })
                                }
                              />
                              <p className="text-xs text-muted-foreground">Hrubá marže</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Target ROAS</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={projectConfig.targetRoas}
                                onChange={(e) =>
                                  setProjectConfig({
                                    ...projectConfig,
                                    targetRoas: parseFloat(e.target.value) || 0,
                                  })
                                }
                              />
                              <p className="text-xs text-muted-foreground">Cílová návratnost</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Target CPA (Kč)</Label>
                              <Input
                                type="number"
                                value={projectConfig.targetCpa}
                                onChange={(e) =>
                                  setProjectConfig({
                                    ...projectConfig,
                                    targetCpa: parseInt(e.target.value) || 0,
                                  })
                                }
                              />
                              <p className="text-xs text-muted-foreground">Cílová cena za konverzi</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Měsíční rozpočet (Kč)</Label>
                            <Input
                              type="number"
                              value={projectConfig.monthlyBudget}
                              onChange={(e) =>
                                setProjectConfig({
                                  ...projectConfig,
                                  monthlyBudget: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                            <p className="text-xs text-muted-foreground">
                              = {Math.round(projectConfig.monthlyBudget / 30)} Kč/den
                            </p>
                          </div>

                          {/* Calculated Metrics */}
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-2">Vypočítané metriky:</p>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Break-even ROAS: </span>
                                <span className="font-medium">
                                  {projectConfig.grossMargin > 0
                                    ? (1 / projectConfig.grossMargin).toFixed(2)
                                    : "N/A"}x
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Max CPA: </span>
                                <span className="font-medium">
                                  {projectConfig.grossMargin > 0
                                    ? Math.round(projectConfig.averageOrderValue / (1 / projectConfig.grossMargin))
                                    : "N/A"} Kč
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Denní rozpočet: </span>
                                <span className="font-medium">{Math.round(projectConfig.monthlyBudget / 30)} Kč</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {analyzing && (
                        <div className="space-y-3 p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span className="font-medium">{analysisStep}</span>
                          </div>
                          <Progress value={analysisProgress} />
                          <p className="text-xs text-muted-foreground">
                            Analýza trvá 60-90 sekund. 5 AI expertů pracuje...
                          </p>
                        </div>
                      )}

                      {/* Agent Cards */}
                      <div className="grid grid-cols-6 gap-2">
                        <Card className="p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Brain className="h-4 w-4 text-purple-500" />
                            <span>Orchestrátor</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Koordinace
                          </p>
                        </Card>
                        <Card className="p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                            <span>Analytik</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Data
                          </p>
                        </Card>
                        <Card className="p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="h-4 w-4 text-green-500" />
                            <span>Stratég</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Plán
                          </p>
                        </Card>
                        <Card className="p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Facebook className="h-4 w-4 text-blue-600" />
                            <span>Meta</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Ads Expert
                          </p>
                        </Card>
                        <Card className="p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <PenTool className="h-4 w-4 text-pink-500" />
                            <span>Creative</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Vizuály
                          </p>
                        </Card>
                        <Card className="p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Megaphone className="h-4 w-4 text-orange-500" />
                            <span>Copywriter</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Texty
                          </p>
                        </Card>
                      </div>

                      <Button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="w-full"
                        size="lg"
                      >
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
                      {/* Executive Summary */}
                      {analysisResult.executive_summary && (
                        <Card className="border-primary bg-primary/5">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Brain className="h-5 w-5 text-primary" />
                              Executive Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm leading-relaxed">{analysisResult.executive_summary}</p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Alerts */}
                      {analysisResult.alerts && analysisResult.alerts.length > 0 && (
                        <div className="space-y-2">
                          {analysisResult.alerts.map((alert, i) => (
                            <Card
                              key={i}
                              className={`border-l-4 ${
                                alert.level === "critical"
                                  ? "border-l-red-500 bg-red-50"
                                  : alert.level === "warning"
                                  ? "border-l-yellow-500 bg-yellow-50"
                                  : "border-l-blue-500 bg-blue-50"
                              }`}
                            >
                              <CardContent className="py-3">
                                <div className="flex items-start gap-3">
                                  <span className="text-lg">
                                    {alert.level === "critical" ? "🔴" : alert.level === "warning" ? "🟡" : "🔵"}
                                  </span>
                                  <div>
                                    <p className="font-medium">{alert.message}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      <strong>Akce:</strong> {alert.action}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Performance vs Targets */}
                      {analysisResult.performance && (
                        <Card className="border-blue-200 bg-blue-50/50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <BarChart3 className="h-5 w-5 text-blue-600" />
                              Performance vs Targets
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-5 gap-3 text-center">
                              <div className="p-2 bg-white rounded">
                                <p className="text-2xl font-bold">{analysisResult.performance.current.spend.toLocaleString()} Kč</p>
                                <p className="text-xs text-muted-foreground">Spend</p>
                              </div>
                              <div className="p-2 bg-white rounded">
                                <p className="text-2xl font-bold">{analysisResult.performance.current.conversions}</p>
                                <p className="text-xs text-muted-foreground">Konverze</p>
                              </div>
                              <div className={`p-2 rounded ${
                                analysisResult.performance.vs_target.cpa_status === "ok" ? "bg-green-100" :
                                analysisResult.performance.vs_target.cpa_status === "warning" ? "bg-yellow-100" : "bg-red-100"
                              }`}>
                                <p className="text-2xl font-bold">{analysisResult.performance.current.cpa.toLocaleString()} Kč</p>
                                <p className="text-xs text-muted-foreground">CPA</p>
                              </div>
                              <div className={`p-2 rounded ${
                                analysisResult.performance.vs_target.roas_status === "ok" ? "bg-green-100" :
                                analysisResult.performance.vs_target.roas_status === "warning" ? "bg-yellow-100" : "bg-red-100"
                              }`}>
                                <p className="text-2xl font-bold">{analysisResult.performance.current.roas.toFixed(2)}x</p>
                                <p className="text-xs text-muted-foreground">ROAS</p>
                              </div>
                              <div className="p-2 bg-white rounded">
                                <p className="text-2xl font-bold">{(analysisResult.performance.current.ctr * 100).toFixed(2)}%</p>
                                <p className="text-xs text-muted-foreground">CTR</p>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-center gap-2">
                              <Badge variant={
                                analysisResult.performance.vs_target.trend === "improving" ? "default" :
                                analysisResult.performance.vs_target.trend === "stable" ? "secondary" : "destructive"
                              }>
                                {analysisResult.performance.vs_target.trend === "improving" ? "📈 Zlepšuje se" :
                                 analysisResult.performance.vs_target.trend === "stable" ? "➡️ Stabilní" : "📉 Klesá"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Strategy */}
                      {analysisResult.strategy && (
                        <Card className="border-purple-200 bg-purple-50/50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Target className="h-5 w-5 text-purple-600" />
                              Strategie
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Persona */}
                            {analysisResult.strategy.target_audience?.primary_persona && (
                              <div className="p-3 bg-white rounded-lg">
                                <h4 className="font-medium flex items-center gap-2 mb-2">
                                  <Users className="h-4 w-4" />
                                  {analysisResult.strategy.target_audience.primary_persona.name}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {analysisResult.strategy.target_audience.primary_persona.demographics}
                                </p>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="font-medium text-red-700">Pain Points:</p>
                                    <ul className="list-disc list-inside">
                                      {analysisResult.strategy.target_audience.primary_persona.pain_points?.map((p, i) => (
                                        <li key={i}>{p}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <p className="font-medium text-green-700">Motivace:</p>
                                    <ul className="list-disc list-inside">
                                      {analysisResult.strategy.target_audience.primary_persona.motivations?.map((m, i) => (
                                        <li key={i}>{m}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Value Proposition */}
                            {analysisResult.strategy.unique_value_proposition && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Unique Value Proposition</Label>
                                <p className="font-medium text-primary mt-1">
                                  {analysisResult.strategy.unique_value_proposition}
                                </p>
                              </div>
                            )}

                            {/* Messaging Pillars */}
                            {analysisResult.strategy.messaging_pillars && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Messaging Pillars</Label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {analysisResult.strategy.messaging_pillars.map((pillar, i) => (
                                    <Badge key={i} variant="outline">{pillar}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Funnel Allocation */}
                            {analysisResult.strategy.funnel_allocation && (
                              <div>
                                <Label className="text-xs text-muted-foreground">Funnel Allocation</Label>
                                <div className="flex gap-2 mt-1">
                                  <Badge className="bg-blue-100 text-blue-700">
                                    TOFU {analysisResult.strategy.funnel_allocation.tofu_percent}%
                                  </Badge>
                                  <Badge className="bg-yellow-100 text-yellow-700">
                                    MOFU {analysisResult.strategy.funnel_allocation.mofu_percent}%
                                  </Badge>
                                  <Badge className="bg-green-100 text-green-700">
                                    BOFU {analysisResult.strategy.funnel_allocation.bofu_percent}%
                                  </Badge>
                                </div>
                              </div>
                            )}

                            {/* Meta Targeting */}
                            {analysisResult.strategy.target_audience?.meta_targeting && (
                              <div className="p-3 bg-white rounded-lg">
                                <h4 className="font-medium text-sm mb-2">Meta Ads Targeting</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Interests: </span>
                                    {analysisResult.strategy.target_audience.meta_targeting.interests?.join(", ")}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Behaviors: </span>
                                    {analysisResult.strategy.target_audience.meta_targeting.behaviors?.join(", ")}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">LAL Source: </span>
                                    {analysisResult.strategy.target_audience.meta_targeting.lookalike_source}
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Campaigns */}
                      {analysisResult.campaigns && analysisResult.campaigns.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Megaphone className="h-5 w-5" />
                              Navržené kampaně
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {analysisResult.campaigns.map((campaign, i) => (
                                <div key={i} className="p-3 border rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">{campaign.name}</span>
                                    <div className="flex gap-2">
                                      <Badge variant="outline">{campaign.objective}</Badge>
                                      <Badge className={
                                        campaign.status === "new" ? "bg-blue-500" :
                                        campaign.status === "scale" ? "bg-green-500" :
                                        campaign.status === "optimize" ? "bg-yellow-500" : "bg-red-500"
                                      }>
                                        {campaign.status}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    <p><strong>Rozpočet:</strong> {campaign.daily_budget} Kč/den</p>
                                    <p><strong>Audience:</strong> {campaign.audience.type} - {campaign.audience.targeting}</p>
                                    <p><strong>Est. velikost:</strong> {campaign.audience.estimated_size}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Ad Copy */}
                      {analysisResult.ad_copy && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">
                              Texty reklam (klikni pro kopírování)
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label className="text-xs">Primary Text (max 125 znaků)</Label>
                              <div className="space-y-2 mt-2">
                                {analysisResult.ad_copy?.primary_texts?.map(
                                  (item, i) => (
                                    <div
                                      key={i}
                                      onClick={() =>
                                        copyToClipboard(item.text, `pt-${i}`)
                                      }
                                      className="flex items-center justify-between p-3 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors"
                                    >
                                      <div className="flex-1">
                                        <p className="text-sm">{item.text}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Badge variant="outline" className="text-xs">
                                            {item.angle}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">
                                            {item.text.length}/125 znaků
                                          </span>
                                        </div>
                                      </div>
                                      {copiedItem === `pt-${i}` ? (
                                        <Check className="h-4 w-4 text-green-500 ml-2" />
                                      ) : (
                                        <Copy className="h-4 w-4 text-muted-foreground ml-2" />
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs">Headlines (max 40 znaků)</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {analysisResult.ad_copy?.headlines?.map((item, i) => (
                                  <Badge
                                    key={i}
                                    className="cursor-pointer hover:bg-primary/80"
                                    onClick={() =>
                                      copyToClipboard(item.text, `h-${i}`)
                                    }
                                  >
                                    {item.text}
                                    {copiedItem === `h-${i}` && (
                                      <Check className="h-3 w-3 ml-1" />
                                    )}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs">Descriptions (max 30 znaků)</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {analysisResult.ad_copy?.descriptions?.map((desc, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="cursor-pointer"
                                    onClick={() => copyToClipboard(desc, `desc-${i}`)}
                                  >
                                    {desc}
                                    {copiedItem === `desc-${i}` && (
                                      <Check className="h-3 w-3 ml-1" />
                                    )}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs">CTAs</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {analysisResult.ad_copy?.ctas?.map((cta, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="cursor-pointer"
                                    onClick={() => copyToClipboard(cta, `cta-${i}`)}
                                  >
                                    {cta}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Creative Concepts */}
                      {analysisResult.creative_concepts && analysisResult.creative_concepts.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <PenTool className="h-5 w-5" />
                              Kreativní koncepty
                            </CardTitle>
                            <CardDescription>
                              Detailní briefingy pro grafika/kameramana
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {analysisResult.creative_concepts?.map((concept, i) => (
                                <div
                                  key={i}
                                  className="p-4 border rounded-lg space-y-3"
                                >
                                  <div className="flex items-center gap-2">
                                    <Badge variant={
                                      concept.format === "video" ? "default" :
                                      concept.format === "carousel" ? "secondary" : "outline"
                                    }>
                                      {concept.format}
                                    </Badge>
                                    <span className="font-semibold">
                                      {concept.name}
                                    </span>
                                    {concept.specs?.duration && (
                                      <Badge variant="outline" className="text-xs">
                                        {concept.specs.duration}
                                      </Badge>
                                    )}
                                    {concept.specs?.dimensions && (
                                      <Badge variant="outline" className="text-xs">
                                        {concept.specs.dimensions}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {concept.description}
                                  </p>
                                  {concept.hook && (
                                    <div className="p-2 bg-yellow-50 rounded text-sm">
                                      <strong className="text-yellow-700">Hook (první 3s):</strong> {concept.hook}
                                    </div>
                                  )}
                                  {concept.script && (
                                    <div className="p-2 bg-blue-50 rounded text-sm">
                                      <strong className="text-blue-700">Scénář:</strong>
                                      <p className="whitespace-pre-wrap mt-1">{concept.script}</p>
                                    </div>
                                  )}
                                  {/* Image Preview or Upload Area */}
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    {creativeImages[i] ? (
                                      <div className="relative">
                                        <img
                                          src={creativeImages[i]}
                                          alt={concept.name}
                                          className="w-full max-h-64 object-contain rounded"
                                        />
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="absolute top-2 right-2 h-6 text-xs"
                                          onClick={() => setCreativeImages((prev) => {
                                            const next = { ...prev };
                                            delete next[i];
                                            return next;
                                          })}
                                        >
                                          Odstranit
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="text-center space-y-3">
                                        <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                                        <p className="text-sm text-muted-foreground">
                                          Vygeneruj AI obrázek nebo nahraj vlastní
                                        </p>
                                        <div className="flex justify-center gap-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleGenerateImage(i, concept.ai_image_prompt || concept.description)}
                                            disabled={generatingImage === i}
                                          >
                                            {generatingImage === i ? (
                                              <>
                                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                Generuji...
                                              </>
                                            ) : (
                                              <>
                                                <Sparkles className="h-4 w-4 mr-1" />
                                                Vygenerovat AI
                                              </>
                                            )}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleUploadImage(i)}
                                          >
                                            <Upload className="h-4 w-4 mr-1" />
                                            Nahrát vlastní
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {concept.ai_image_prompt && (
                                    <div className="p-2 bg-purple-50 rounded text-sm">
                                      <strong className="text-purple-700">AI Prompt (Midjourney/DALL-E):</strong>
                                      <p className="font-mono text-xs mt-1">{concept.ai_image_prompt}</p>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="mt-1 h-6 text-xs"
                                        onClick={() => copyToClipboard(concept.ai_image_prompt!, `ai-prompt-${i}`)}
                                      >
                                        {copiedItem === `ai-prompt-${i}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                        Kopírovat prompt
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Optimization Actions */}
                      {analysisResult.optimization_actions && analysisResult.optimization_actions.length > 0 && (
                        <Card className="border-orange-200 bg-orange-50/50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Zap className="h-5 w-5 text-orange-600" />
                              Optimalizační akce
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {analysisResult.optimization_actions.map((action, i) => (
                                <div key={i} className="p-3 bg-white rounded-lg border-l-4"
                                  style={{
                                    borderLeftColor: action.priority === "critical" ? "#ef4444" :
                                      action.priority === "high" ? "#f97316" :
                                      action.priority === "medium" ? "#eab308" : "#22c55e"
                                  }}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className={
                                      action.priority === "critical" ? "text-red-600 border-red-300" :
                                      action.priority === "high" ? "text-orange-600 border-orange-300" :
                                      action.priority === "medium" ? "text-yellow-600 border-yellow-300" : "text-green-600 border-green-300"
                                    }>
                                      {action.priority.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <p className="font-medium">{action.action}</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    <strong>Důvod:</strong> {action.reason}
                                  </p>
                                  <p className="text-sm text-green-700 mt-1">
                                    <strong>Očekávaný dopad:</strong> {action.expected_impact}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Setup Guide */}
                      {analysisResult.setup_guide && (
                        <Card className="border-primary">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Target className="h-5 w-5 text-primary" />
                              Setup Guide - Copy & Paste do Meta Ads Manager
                            </CardTitle>
                            <CardDescription>
                              Krok za krokem jak vytvořit kampaň
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Step 1 - Campaign */}
                            <div className="space-y-3">
                              <h4 className="font-semibold flex items-center gap-2">
                                <Badge variant="outline">1</Badge> Vytvoření kampaně
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-sm pl-6">
                                <div
                                  className="p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                                  onClick={() => copyToClipboard(analysisResult.setup_guide!.step1_campaign.name, "setup-name")}
                                >
                                  <strong>Název:</strong> {analysisResult.setup_guide.step1_campaign.name}
                                  {copiedItem === "setup-name" && <Check className="h-3 w-3 inline ml-1 text-green-500" />}
                                </div>
                                <div><strong>Cíl:</strong> {analysisResult.setup_guide.step1_campaign.objective}</div>
                                <div><strong>Rozpočet:</strong> {analysisResult.setup_guide.step1_campaign.budget} Kč/den</div>
                                <div><strong>Bidding:</strong> {analysisResult.setup_guide.step1_campaign.bid_strategy}</div>
                              </div>
                            </div>

                            {/* Step 2 - Ad Set */}
                            <div className="space-y-3">
                              <h4 className="font-semibold flex items-center gap-2">
                                <Badge variant="outline">2</Badge> Nastavení Ad Setu
                              </h4>
                              <div className="text-sm pl-6 space-y-2">
                                <div
                                  className="p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                                  onClick={() => copyToClipboard(analysisResult.setup_guide!.step2_adset.name, "adset-name")}
                                >
                                  <strong>Název:</strong> {analysisResult.setup_guide.step2_adset.name}
                                  {copiedItem === "adset-name" && <Check className="h-3 w-3 inline ml-1 text-green-500" />}
                                </div>
                                <div><strong>Optimalizace:</strong> {analysisResult.setup_guide.step2_adset.optimization}</div>
                                <div className="p-2 bg-muted rounded">
                                  <strong>Audience:</strong>
                                  <ul className="mt-1 space-y-1">
                                    <li>Lokace: {analysisResult.setup_guide.step2_adset.audience.locations?.join(", ")}</li>
                                    <li>Věk: {analysisResult.setup_guide.step2_adset.audience.age_min}-{analysisResult.setup_guide.step2_adset.audience.age_max} let</li>
                                    <li>Zájmy: {analysisResult.setup_guide.step2_adset.audience.interests?.join(", ")}</li>
                                  </ul>
                                </div>
                                <div><strong>Placements:</strong> {analysisResult.setup_guide.step2_adset.placements}</div>
                              </div>
                            </div>

                            {/* Step 3 - Ad */}
                            <div className="space-y-3">
                              <h4 className="font-semibold flex items-center gap-2">
                                <Badge variant="outline">3</Badge> Vytvoření reklamy
                              </h4>
                              <div className="text-sm pl-6 space-y-2">
                                <div><strong>Formát:</strong> {analysisResult.setup_guide.step3_ad.format}</div>
                                <div
                                  className="p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                                  onClick={() => copyToClipboard(analysisResult.setup_guide!.step3_ad.text, "ad-text")}
                                >
                                  <strong>Text:</strong> {analysisResult.setup_guide.step3_ad.text}
                                  {copiedItem === "ad-text" && <Check className="h-3 w-3 inline ml-1 text-green-500" />}
                                </div>
                                <div
                                  className="p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                                  onClick={() => copyToClipboard(analysisResult.setup_guide!.step3_ad.headline, "ad-headline")}
                                >
                                  <strong>Headline:</strong> {analysisResult.setup_guide.step3_ad.headline}
                                  {copiedItem === "ad-headline" && <Check className="h-3 w-3 inline ml-1 text-green-500" />}
                                </div>
                                <div><strong>CTA:</strong> {analysisResult.setup_guide.step3_ad.cta}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Next Steps */}
                      {analysisResult.next_steps && analysisResult.next_steps.length > 0 && (
                        <Card className="border-green-200 bg-green-50/50">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-green-600" />
                              Další kroky
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {analysisResult.next_steps.map((step, i) => (
                                <div key={i} className="flex items-start gap-3 p-2 bg-white rounded">
                                  <Badge variant="outline" className="shrink-0">{step.timeframe}</Badge>
                                  <p className="text-sm">{step.action}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Legacy: Expert Notes */}
                      {analysisResult.expert_notes && (
                        <Accordion type="single" collapsible>
                          <AccordionItem value="notes">
                            <AccordionTrigger>Poznámky od expertů</AccordionTrigger>
                            <AccordionContent>
                              <div className="grid grid-cols-2 gap-3">
                                {analysisResult.expert_notes.project_manager && (
                                  <div className="p-3 bg-blue-50 rounded">
                                    <div className="flex items-center gap-2 font-medium text-blue-700">
                                      <Briefcase className="h-4 w-4" /> Project Manager
                                    </div>
                                    <p className="text-sm mt-1">
                                      {analysisResult.expert_notes.project_manager}
                                    </p>
                                  </div>
                                )}
                                {analysisResult.expert_notes.marketing && (
                                  <div className="p-3 bg-green-50 rounded">
                                    <div className="flex items-center gap-2 font-medium text-green-700">
                                      <Megaphone className="h-4 w-4" /> Marketing
                                    </div>
                                    <p className="text-sm mt-1">
                                      {analysisResult.expert_notes.marketing}
                                    </p>
                                  </div>
                                )}
                                {analysisResult.expert_notes.facebook && (
                                  <div className="p-3 bg-blue-50 rounded">
                                    <div className="flex items-center gap-2 font-medium text-blue-700">
                                      <Facebook className="h-4 w-4" /> Facebook
                                    </div>
                                    <p className="text-sm mt-1">
                                      {analysisResult.expert_notes.facebook}
                                    </p>
                                  </div>
                                )}
                                {analysisResult.expert_notes.instagram && (
                                  <div className="p-3 bg-pink-50 rounded">
                                    <div className="flex items-center gap-2 font-medium text-pink-700">
                                      <Instagram className="h-4 w-4" /> Instagram
                                    </div>
                                    <p className="text-sm mt-1">
                                      {analysisResult.expert_notes.instagram}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}

                      {/* Raw Analysis (fallback) */}
                      {analysisResult.raw_analysis && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Raw Analysis</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded overflow-auto max-h-96">
                              {analysisResult.raw_analysis}
                            </pre>
                          </CardContent>
                        </Card>
                      )}

                      <Button
                        onClick={() => setAnalysisResult(null)}
                        variant="outline"
                        className="w-full"
                      >
                        Nová analýza
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Ad Generator Button */}
              <Dialog
                open={showGeneratorDialog}
                onOpenChange={setShowGeneratorDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generátor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5" />
                      AI Generátor pro Meta Ads
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Co generovat</Label>
                        <Select
                          value={generatorForm.type}
                          onValueChange={(v: any) =>
                            setGeneratorForm({ ...generatorForm, type: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ad_copy">Texty reklam</SelectItem>
                            <SelectItem value="creative_concept">
                              Kreativní koncepty
                            </SelectItem>
                            <SelectItem value="audience_suggestion">
                              Návrhy cílení
                            </SelectItem>
                            <SelectItem value="hashtags">Hashtagy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Jazyk</Label>
                        <Select
                          value={generatorForm.language}
                          onValueChange={(v: any) =>
                            setGeneratorForm({ ...generatorForm, language: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cs">Čeština</SelectItem>
                            <SelectItem value="en">Angličtina</SelectItem>
                            <SelectItem value="de">Němčina</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Produkt / Služba</Label>
                      <Input
                        placeholder="např. Tvorba webových stránek"
                        value={generatorForm.product}
                        onChange={(e) =>
                          setGeneratorForm({
                            ...generatorForm,
                            product: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Hlavní benefit</Label>
                      <Input
                        placeholder="např. Web který přináší zákazníky"
                        value={generatorForm.benefit}
                        onChange={(e) =>
                          setGeneratorForm({
                            ...generatorForm,
                            benefit: e.target.value,
                          })
                        }
                      />
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="w-full"
                    >
                      {generating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generuji...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generovat
                        </>
                      )}
                    </Button>

                    {generatedContent && (
                      <Card className="mt-4">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Vygenerovaný obsah
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg overflow-auto max-h-96">
                            {JSON.stringify(generatedContent, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_7d">7 dní</SelectItem>
                  <SelectItem value="last_14d">14 dní</SelectItem>
                  <SelectItem value="last_30d">30 dní</SelectItem>
                  <SelectItem value="this_month">Tento měsíc</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={fetchData} disabled={refreshing} variant="outline">
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
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

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="campaigns" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Kampaně
                </TabsTrigger>
                <TabsTrigger
                  value="recommendations"
                  className="flex items-center gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  Doporučení
                  <Badge className="bg-purple-500 ml-1">AI</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="campaigns" className="mt-6">
                {campaigns.length === 0 ? (
                  <Card className="border-dashed border-2">
                    <CardContent className="pt-12 pb-12 text-center">
                      <Facebook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        Žádné kampaně
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Spusťte AI analýzu pro vytvoření první kampaně
                      </p>
                      <Button onClick={() => setShowAnalyzeDialog(true)}>
                        <Brain className="h-4 w-4 mr-2" />
                        AI Analýza
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Kampaně</CardTitle>
                        <Dialog
                          open={showCreateDialog}
                          onOpenChange={setShowCreateDialog}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Nová
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Nová kampaň</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Název</Label>
                                <Input
                                  value={newCampaign.name}
                                  onChange={(e) =>
                                    setNewCampaign({
                                      ...newCampaign,
                                      name: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Cíl</Label>
                                <Select
                                  value={newCampaign.objective}
                                  onValueChange={(v) =>
                                    setNewCampaign({
                                      ...newCampaign,
                                      objective: v,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="OUTCOME_LEADS">
                                      Leady
                                    </SelectItem>
                                    <SelectItem value="OUTCOME_TRAFFIC">
                                      Návštěvnost
                                    </SelectItem>
                                    <SelectItem value="OUTCOME_SALES">
                                      Prodeje
                                    </SelectItem>
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
                                      dailyBudgetCzk:
                                        parseInt(e.target.value) || 0,
                                    })
                                  }
                                />
                              </div>
                              <Button
                                onClick={handleCreateCampaign}
                                disabled={creating}
                                className="w-full"
                              >
                                {creating ? "Vytvářím..." : "Vytvořit"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Název</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Dosah</TableHead>
                            <TableHead className="text-right">Kliky</TableHead>
                            <TableHead className="text-right">CTR</TableHead>
                            <TableHead className="text-right">Útrata</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {campaigns.map((c) => (
                            <TableRow key={c.campaignId}>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleToggleCampaign(c.campaignId, c.status)
                                  }
                                >
                                  {c.status === "ACTIVE" ? (
                                    <Pause className="h-4 w-4 text-yellow-500" />
                                  ) : (
                                    <Play className="h-4 w-4 text-green-500" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell className="font-medium">
                                {c.campaignName}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    c.status === "ACTIVE"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {c.status === "ACTIVE"
                                    ? "Aktivní"
                                    : "Pozastavená"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(c.reach)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(c.clicks)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatPercent(c.ctr)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(c.spend)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="mt-6">
                <MetaRecommendationsPanel />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
