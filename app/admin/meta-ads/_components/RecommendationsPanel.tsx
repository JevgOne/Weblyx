"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Info,
  Lightbulb,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  Video,
  Zap,
  FileText,
  Shuffle,
  Clock,
  Sliders,
  Star,
  Smile,
  Layers,
} from "lucide-react";

interface Recommendation {
  id: string;
  type: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  howTo: string[];
  metrics?: {
    current: string;
    target: string;
    potential: string;
  };
  relatedCampaigns?: string[];
}

interface Tip {
  title: string;
  tip: string;
  icon: string;
}

const ICON_MAP: Record<string, any> = {
  video: Video,
  zap: Zap,
  users: Users,
  layers: Layers,
  shuffle: Shuffle,
  target: Target,
  "refresh-cw": RefreshCw,
  "user-x": Users,
  clock: Clock,
  "trending-up": TrendingUp,
  sliders: Sliders,
  "check-circle": CheckCircle,
  smile: Smile,
  star: Star,
  "alert-triangle": AlertTriangle,
  "file-text": FileText,
};

export default function MetaRecommendationsPanel() {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [tips, setTips] = useState<Record<string, Tip[]>>({});
  const [explanations, setExplanations] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/meta-ads/recommendations");
      const data = await res.json();

      if (data.success) {
        setRecommendations(data.data.recommendations || []);
        setTips(data.data.tips || {});
        setExplanations(data.data.explanations || {});
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Kritické
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-orange-500 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Vysoká
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-500 flex items-center gap-1">
            <Info className="h-3 w-3" /> Střední
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Info className="h-3 w-3" /> Nízká
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchRecommendations} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Zkusit znovu
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                AI Doporučení
              </CardTitle>
              <CardDescription>
                Personalizovaná doporučení na základě vašich dat
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchRecommendations}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Obnovit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Vše vypadá dobře!</h3>
              <p className="text-muted-foreground">
                Momentálně nemáme žádná doporučení. Vaše kampaně běží optimálně.
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {recommendations.map((rec, index) => (
                <AccordionItem
                  key={rec.id}
                  value={rec.id}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      {getPriorityBadge(rec.priority)}
                      <span className="font-medium">{rec.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <p className="text-muted-foreground">{rec.description}</p>

                    {rec.metrics && (
                      <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Aktuálně
                          </p>
                          <p className="font-medium">{rec.metrics.current}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Cíl</p>
                          <p className="font-medium text-primary">
                            {rec.metrics.target}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Potenciál
                          </p>
                          <p className="font-medium text-green-600">
                            {rec.metrics.potential}
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="font-medium mb-2 flex items-center gap-1">
                        <Target className="h-4 w-4" /> Dopad:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {rec.impact}
                      </p>
                    </div>

                    <div>
                      <p className="font-medium mb-2 flex items-center gap-1">
                        <ArrowRight className="h-4 w-4" /> Jak na to:
                      </p>
                      <ul className="space-y-1">
                        {rec.howTo.map((step, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <span className="text-primary font-medium">
                              {i + 1}.
                            </span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {rec.relatedCampaigns && rec.relatedCampaigns.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground">
                          Kampaně:
                        </span>
                        {rec.relatedCampaigns.map((campaign) => (
                          <Badge key={campaign} variant="outline">
                            {campaign}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Tips & Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            Tipy & Best Practices
          </CardTitle>
          <CardDescription>
            Ověřené postupy pro lepší výkon Meta reklam
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="creative">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="creative">Kreativy</TabsTrigger>
              <TabsTrigger value="targeting">Cílení</TabsTrigger>
              <TabsTrigger value="optimization">Optimalizace</TabsTrigger>
              <TabsTrigger value="copywriting">Copywriting</TabsTrigger>
            </TabsList>

            {Object.entries(tips).map(([category, categoryTips]) => (
              <TabsContent key={category} value={category} className="mt-4">
                <div className="grid gap-3">
                  {categoryTips.map((tip, index) => {
                    const IconComponent = ICON_MAP[tip.icon] || Lightbulb;
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{tip.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {tip.tip}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Metrics Explained */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Co znamenají metriky?
          </CardTitle>
          <CardDescription>
            Jednoduché vysvětlení pro běžné uživatele
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(explanations).map(([key, explanation]: [string, any]) => (
              <div
                key={key}
                className="p-4 border rounded-lg space-y-2"
              >
                <h4 className="font-semibold uppercase text-sm text-primary">
                  {key.replace(/_/g, " ")}
                </h4>
                <p className="text-sm">{explanation.what}</p>
                <div className="flex gap-4 text-xs">
                  <span className="text-green-600">
                    ✅ {explanation.good}
                  </span>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-red-600">
                    ❌ {explanation.bad}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  💡 {explanation.tip}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
