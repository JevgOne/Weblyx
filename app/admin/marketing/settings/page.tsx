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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Settings,
  Link as LinkIcon,
  TrendingUp,
  BarChart3,
  Search,
  Loader2,
  Save,
  AlertTriangle,
} from "lucide-react";

interface ConnectionStatus {
  connected: boolean;
  accountName?: string;
  accountId?: string;
  error?: string;
  lastSync?: string;
}

interface ProjectConfig {
  name: string;
  url: string;
  type: "ecommerce" | "services" | "lead_gen";
  industry: string;
  averageOrderValue: number;
  grossMargin: number;
  customerLtv: number;
  targetRoas: number;
  targetCpa: number;
  monthlyBudget: number;
  currency: string;
  timezone: string;
}

export default function MarketingSettingsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  // Connection statuses
  const [connections, setConnections] = useState({
    google_ads: { connected: false } as ConnectionStatus,
    meta_ads: { connected: false } as ConnectionStatus,
    ga4: { connected: false } as ConnectionStatus,
    gsc: { connected: false } as ConnectionStatus,
  });

  // Project config
  const [config, setConfig] = useState<ProjectConfig>({
    name: "Weblyx",
    url: "https://weblyx.cz",
    type: "services",
    industry: "web_development",
    averageOrderValue: 7990,
    grossMargin: 0.7,
    customerLtv: 15000,
    targetRoas: 3.0,
    targetCpa: 2500,
    monthlyBudget: 15000,
    currency: "CZK",
    timezone: "Europe/Prague",
  });

  // Calculated metrics
  const breakEvenRoas = config.grossMargin > 0 ? 1 / config.grossMargin : 0;
  const maxCpa = config.grossMargin > 0
    ? config.averageOrderValue * config.grossMargin
    : 0;
  const dailyBudget = Math.round(config.monthlyBudget / 30);

  useEffect(() => {
    const loadData = async () => {
      // Load config from localStorage
      const savedConfig = localStorage.getItem("weblyx-project-config");
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }

      // Test connections
      const [googleAds, metaAds, ga4, gsc] = await Promise.all([
        fetch("/api/google-ads/test").then(r => r.json()).catch(() => ({ success: false })),
        fetch("/api/meta-ads/test").then(r => r.json()).catch(() => ({ success: false })),
        fetch("/api/analytics/overview?startDate=7daysAgo&endDate=today")
          .then(r => r.json()).catch(() => ({ success: false })),
        fetch("/api/search-console/overview?days=7")
          .then(r => r.json()).catch(() => ({ success: false })),
      ]);

      setConnections({
        google_ads: {
          connected: googleAds.success,
          accountName: googleAds.data?.descriptiveName,
          accountId: googleAds.data?.customerId,
          error: googleAds.error,
        },
        meta_ads: {
          connected: metaAds.success,
          accountName: metaAds.data?.name,
          accountId: metaAds.data?.id,
          error: metaAds.error,
        },
        ga4: {
          connected: ga4.success,
          error: ga4.error,
        },
        gsc: {
          connected: gsc.success,
          error: gsc.error,
        },
      });

      setLoading(false);
    };

    if (user) loadData();
  }, [user]);

  const handleTestConnection = async (platform: string) => {
    setTesting(platform);
    try {
      let res;
      switch (platform) {
        case "google_ads":
          res = await fetch("/api/google-ads/test");
          break;
        case "meta_ads":
          res = await fetch("/api/meta-ads/test");
          break;
        case "ga4":
          res = await fetch("/api/analytics/overview?startDate=7daysAgo&endDate=today");
          break;
        case "gsc":
          res = await fetch("/api/search-console/overview?days=7");
          break;
        default:
          return;
      }
      const data = await res.json();
      setConnections(prev => ({
        ...prev,
        [platform]: {
          connected: data.success,
          accountName: data.data?.descriptiveName || data.data?.name,
          accountId: data.data?.customerId || data.data?.id,
          error: data.error,
        },
      }));
    } catch (err: any) {
      setConnections(prev => ({
        ...prev,
        [platform]: { connected: false, error: err.message },
      }));
    } finally {
      setTesting(null);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem("weblyx-project-config", JSON.stringify(config));
      // In future: save to database via API
      alert("Konfigurace uložena!");
    } catch (err) {
      alert("Chyba při ukládání");
    } finally {
      setSaving(false);
    }
  };

  if (!user || loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-96" />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/marketing")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Marketing Settings</h1>
          <p className="text-sm text-muted-foreground">
            API připojení a konfigurace projektu
          </p>
        </div>
      </div>

      <Tabs defaultValue="connections">
        <TabsList className="mb-6">
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            API Connections
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Project Config
          </TabsTrigger>
        </TabsList>

        {/* API Connections */}
        <TabsContent value="connections" className="space-y-4">
          {/* Google Ads */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Google Ads</CardTitle>
                    <CardDescription>Správa PPC kampaní</CardDescription>
                  </div>
                </div>
                {connections.google_ads.connected ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Připojeno
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Nepřipojeno
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {connections.google_ads.connected ? (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Účet:</strong> {connections.google_ads.accountName || "–"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ID: {connections.google_ads.accountId}
                  </p>
                </div>
              ) : connections.google_ads.error ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{connections.google_ads.error}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nastav GOOGLE_ADS_* env variables na Vercelu
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection("google_ads")}
                  disabled={testing === "google_ads"}
                >
                  {testing === "google_ads" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Test
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <a
                    href="https://ads.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Google Ads
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Meta Ads */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Meta Ads</CardTitle>
                    <CardDescription>Facebook & Instagram reklamy</CardDescription>
                  </div>
                </div>
                {connections.meta_ads.connected ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Připojeno
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Nepřipojeno
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {connections.meta_ads.connected ? (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Účet:</strong> {connections.meta_ads.accountName || "–"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ID: {connections.meta_ads.accountId}
                  </p>
                </div>
              ) : connections.meta_ads.error ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{connections.meta_ads.error}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nastav META_ACCESS_TOKEN a META_AD_ACCOUNT_ID na Vercelu
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection("meta_ads")}
                  disabled={testing === "meta_ads"}
                >
                  {testing === "meta_ads" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Test
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <a
                    href="https://business.facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Meta Business
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* GA4 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Google Analytics 4</CardTitle>
                    <CardDescription>Web analytics</CardDescription>
                  </div>
                </div>
                {connections.ga4.connected ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Připojeno
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Nepřipojeno
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection("ga4")}
                  disabled={testing === "ga4"}
                >
                  {testing === "ga4" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Test
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* GSC */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Search className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Google Search Console</CardTitle>
                    <CardDescription>Organic search data</CardDescription>
                  </div>
                </div>
                {connections.gsc.connected ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Připojeno
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Nepřipojeno
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection("gsc")}
                  disabled={testing === "gsc"}
                >
                  {testing === "gsc" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Configuration */}
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Project Configuration</CardTitle>
              <CardDescription>
                Nastav business metriky pro správné výpočty ROAS a CPA targetů
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Business Type */}
              <div className="space-y-2">
                <Label>Typ byznysu</Label>
                <Select
                  value={config.type}
                  onValueChange={(v: "ecommerce" | "services" | "lead_gen") =>
                    setConfig({ ...config, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="services">Služby</SelectItem>
                    <SelectItem value="lead_gen">Lead Generation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Název projektu</Label>
                  <Input
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL webu</Label>
                  <Input
                    value={config.url}
                    onChange={(e) => setConfig({ ...config, url: e.target.value })}
                  />
                </div>
              </div>

              {/* Business Metrics */}
              <div className="space-y-4">
                <h4 className="font-medium">Business Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Average Order Value (AOV)</Label>
                    <div className="flex">
                      <Input
                        type="number"
                        value={config.averageOrderValue}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            averageOrderValue: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      <span className="flex items-center px-3 bg-muted border border-l-0 rounded-r-md text-sm">
                        Kč
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Gross Margin (marže)</Label>
                    <div className="flex">
                      <Input
                        type="number"
                        value={Math.round(config.grossMargin * 100)}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            grossMargin: (parseInt(e.target.value) || 0) / 100,
                          })
                        }
                      />
                      <span className="flex items-center px-3 bg-muted border border-l-0 rounded-r-md text-sm">
                        %
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Customer LTV (optional)</Label>
                    <div className="flex">
                      <Input
                        type="number"
                        value={config.customerLtv}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            customerLtv: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      <span className="flex items-center px-3 bg-muted border border-l-0 rounded-r-md text-sm">
                        Kč
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Budget</Label>
                    <div className="flex">
                      <Input
                        type="number"
                        value={config.monthlyBudget}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            monthlyBudget: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      <span className="flex items-center px-3 bg-muted border border-l-0 rounded-r-md text-sm">
                        Kč
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Targets */}
              <div className="space-y-4">
                <h4 className="font-medium">Targets (auto-calculated, can override)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target ROAS</Label>
                    <div className="flex">
                      <Input
                        type="number"
                        step="0.1"
                        value={config.targetRoas}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            targetRoas: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                      <span className="flex items-center px-3 bg-muted border border-l-0 rounded-r-md text-sm">
                        x
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Break-even ROAS: {breakEvenRoas.toFixed(2)}x
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Target CPA</Label>
                    <div className="flex">
                      <Input
                        type="number"
                        value={config.targetCpa}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            targetCpa: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      <span className="flex items-center px-3 bg-muted border border-l-0 rounded-r-md text-sm">
                        Kč
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Max acceptable CPA: {maxCpa.toFixed(0)} Kč
                    </p>
                  </div>
                </div>
              </div>

              {/* Calculated Summary */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-3">Shrnutí</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Break-even ROAS:</span>
                    <p className="font-medium">{breakEvenRoas.toFixed(2)}x</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max CPA:</span>
                    <p className="font-medium">{maxCpa.toFixed(0)} Kč</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Daily Budget:</span>
                    <p className="font-medium">{dailyBudget} Kč</p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSaveConfig} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Uložit konfiguraci
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
