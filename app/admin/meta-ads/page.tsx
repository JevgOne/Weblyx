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
  strategy: {
    campaign_objective: string;
    target_audience: string;
    unique_value_proposition: string;
    key_messages: string[];
    content_pillars: string[];
    budget_split: { facebook: number; instagram: number };
    funnel_strategy: {
      cold: string;
      warm: string;
      hot: string;
    };
  };
  facebook_ads: {
    recommended_formats: string[];
    placements: string[];
    audience_targeting: any;
  };
  instagram_ads: {
    content_style: string;
    recommended_formats: string[];
    reels_strategy: any;
  };
  ad_copy: {
    primary_texts: Array<{ text: string; angle: string }>;
    headlines: Array<{ text: string; angle: string }>;
    descriptions: string[];
    ctas: string[];
  };
  creative_concepts: Array<{
    name: string;
    format: string;
    description: string;
    hook?: string;
    script?: string;
  }>;
  hashtags: string[];
  campaign_settings: any;
  testing_plan: any;
  expert_notes: {
    project_manager: string;
    marketing: string;
    facebook: string;
    instagram: string;
    ppc: string;
  };
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
  const [analyzeForm, setAnalyzeForm] = useState({
    websiteUrl: "https://weblyx.cz",
    competitors: "",
    language: "cs" as "cs" | "de" | "en",
    businessGoal: "leads" as "leads" | "traffic" | "sales" | "brand",
    monthlyBudget: 15000,
    targetPlatform: "both" as "both" | "facebook" | "instagram",
  });

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
      const res = await fetch("/api/meta-ads/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...analyzeForm,
          competitors: analyzeForm.competitors
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();

      clearInterval(progressInterval);

      if (data.success) {
        setAnalysisProgress(100);
        setAnalysisStep("✅ Hotovo!");
        setAnalysisResult(data.data);
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>URL webu</Label>
                          <Input
                            value={analyzeForm.websiteUrl}
                            onChange={(e) =>
                              setAnalyzeForm({
                                ...analyzeForm,
                                websiteUrl: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Jazyk</Label>
                          <Select
                            value={analyzeForm.language}
                            onValueChange={(v: any) =>
                              setAnalyzeForm({ ...analyzeForm, language: v })
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
                        <Label>Konkurence (oddělené čárkou)</Label>
                        <Input
                          placeholder="https://competitor1.cz, https://competitor2.cz"
                          value={analyzeForm.competitors}
                          onChange={(e) =>
                            setAnalyzeForm({
                              ...analyzeForm,
                              competitors: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Cíl</Label>
                          <Select
                            value={analyzeForm.businessGoal}
                            onValueChange={(v: any) =>
                              setAnalyzeForm({ ...analyzeForm, businessGoal: v })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="leads">Leady</SelectItem>
                              <SelectItem value="traffic">Návštěvnost</SelectItem>
                              <SelectItem value="sales">Prodeje</SelectItem>
                              <SelectItem value="brand">Brand</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Měsíční rozpočet (CZK)</Label>
                          <Input
                            type="number"
                            value={analyzeForm.monthlyBudget}
                            onChange={(e) =>
                              setAnalyzeForm({
                                ...analyzeForm,
                                monthlyBudget: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Platforma</Label>
                          <Select
                            value={analyzeForm.targetPlatform}
                            onValueChange={(v: any) =>
                              setAnalyzeForm({
                                ...analyzeForm,
                                targetPlatform: v,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="both">FB + IG</SelectItem>
                              <SelectItem value="facebook">
                                Jen Facebook
                              </SelectItem>
                              <SelectItem value="instagram">
                                Jen Instagram
                              </SelectItem>
                            </SelectContent>
                          </Select>
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
                            Analýza trvá 60-90 sekund. 5 AI expertů pracuje...
                          </p>
                        </div>
                      )}

                      {/* Agent Cards */}
                      <div className="grid grid-cols-5 gap-2">
                        <Card className="p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="h-4 w-4 text-blue-500" />
                            <span>PM</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Strategie
                          </p>
                        </Card>
                        <Card className="p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Megaphone className="h-4 w-4 text-green-500" />
                            <span>Marketing</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Messaging
                          </p>
                        </Card>
                        <Card className="p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Facebook className="h-4 w-4 text-blue-600" />
                            <span>FB Expert</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Facebook
                          </p>
                        </Card>
                        <Card className="p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Instagram className="h-4 w-4 text-pink-500" />
                            <span>IG Expert</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Instagram
                          </p>
                        </Card>
                        <Card className="p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="h-4 w-4 text-purple-500" />
                            <span>PPC</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Optimalizace
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
                      {/* Strategy Summary */}
                      <Card className="border-blue-200 bg-blue-50/50">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-600" />
                            Strategie
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Cílová skupina
                            </Label>
                            <p>{analysisResult.strategy.target_audience}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Hlavní hodnota
                            </Label>
                            <p className="font-medium text-primary">
                              {analysisResult.strategy.unique_value_proposition}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Rozpočet
                            </Label>
                            <div className="flex gap-4">
                              <Badge>
                                Facebook:{" "}
                                {analysisResult.strategy.budget_split?.facebook || 60}%
                              </Badge>
                              <Badge variant="secondary">
                                Instagram:{" "}
                                {analysisResult.strategy.budget_split?.instagram || 40}%
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Ad Copy */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Texty reklam (klikni pro kopírování)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-xs">Primary Text</Label>
                            <div className="space-y-2 mt-2">
                              {analysisResult.ad_copy?.primary_texts?.map(
                                (item, i) => (
                                  <div
                                    key={i}
                                    onClick={() =>
                                      copyToClipboard(item.text, `pt-${i}`)
                                    }
                                    className="flex items-center justify-between p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                                  >
                                    <div>
                                      <p>{item.text}</p>
                                      <Badge variant="outline" className="text-xs">
                                        {item.angle}
                                      </Badge>
                                    </div>
                                    {copiedItem === `pt-${i}` ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Copy className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs">Headlines</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {analysisResult.ad_copy?.headlines?.map((item, i) => (
                                <Badge
                                  key={i}
                                  className="cursor-pointer"
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
                            <Label className="text-xs">Hashtags</Label>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {analysisResult.hashtags?.map((tag, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="cursor-pointer text-xs"
                                  onClick={() => copyToClipboard(tag, `tag-${i}`)}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Creative Concepts */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Kreativní koncepty
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {analysisResult.creative_concepts?.map((concept, i) => (
                              <div
                                key={i}
                                className="p-4 border rounded-lg space-y-2"
                              >
                                <div className="flex items-center gap-2">
                                  <Badge>{concept.format}</Badge>
                                  <span className="font-medium">
                                    {concept.name}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {concept.description}
                                </p>
                                {concept.hook && (
                                  <p className="text-sm">
                                    <strong>Hook:</strong> {concept.hook}
                                  </p>
                                )}
                                {concept.script && (
                                  <p className="text-sm">
                                    <strong>Script:</strong> {concept.script}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Expert Notes */}
                      <Accordion type="single" collapsible>
                        <AccordionItem value="notes">
                          <AccordionTrigger>Poznámky od expertů</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-blue-50 rounded">
                                <div className="flex items-center gap-2 font-medium text-blue-700">
                                  <Briefcase className="h-4 w-4" /> Project
                                  Manager
                                </div>
                                <p className="text-sm mt-1">
                                  {analysisResult.expert_notes?.project_manager}
                                </p>
                              </div>
                              <div className="p-3 bg-green-50 rounded">
                                <div className="flex items-center gap-2 font-medium text-green-700">
                                  <Megaphone className="h-4 w-4" /> Marketing
                                </div>
                                <p className="text-sm mt-1">
                                  {analysisResult.expert_notes?.marketing}
                                </p>
                              </div>
                              <div className="p-3 bg-blue-50 rounded">
                                <div className="flex items-center gap-2 font-medium text-blue-700">
                                  <Facebook className="h-4 w-4" /> Facebook
                                </div>
                                <p className="text-sm mt-1">
                                  {analysisResult.expert_notes?.facebook}
                                </p>
                              </div>
                              <div className="p-3 bg-pink-50 rounded">
                                <div className="flex items-center gap-2 font-medium text-pink-700">
                                  <Instagram className="h-4 w-4" /> Instagram
                                </div>
                                <p className="text-sm mt-1">
                                  {analysisResult.expert_notes?.instagram}
                                </p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

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
