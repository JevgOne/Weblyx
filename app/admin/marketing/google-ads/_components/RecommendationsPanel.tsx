"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  ArrowRight,
  Lightbulb,
  Target,
  DollarSign,
} from "lucide-react";

interface Recommendation {
  id: string;
  type: string;
  priority: "critical" | "high" | "medium" | "low";
  status: string;
  title: string;
  description: string;
  reasoning: string;
  expectedImpact: string;
  effort: "low" | "medium" | "high";
  autoApplicable: boolean;
  data?: Record<string, any>;
  priorityInfo: {
    label: string;
    emoji: string;
    color: string;
    description: string;
  };
  effortInfo: {
    label: string;
    emoji: string;
    description: string;
  };
  impactComparison: {
    action: string;
    ifYouDo: string;
    ifYouDont: string;
    bestCase: string;
    worstCase: string;
    recommendation: string;
  };
}

interface Campaign {
  id: number;
  campaignId: string;
  campaignName: string;
  phase: string;
  healthScore: number;
  startDate: string;
  lastAnalysisDate?: string;
  nextAnalysisDate?: string;
  analysisCount: number;
}

const PHASE_INFO: Record<string, { label: string; color: string; icon: any }> = {
  new: { label: "Nová", color: "blue", icon: Clock },
  learning: { label: "Učení", color: "yellow", icon: Zap },
  optimizing: { label: "Optimalizace", color: "green", icon: TrendingUp },
  mature: { label: "Stabilní", color: "teal", icon: CheckCircle },
  declining: { label: "Klesající", color: "red", icon: TrendingDown },
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
};

export default function RecommendationsPanel() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [summary, setSummary] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0, autoApplied: 0 });
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [runningAnalysis, setRunningAnalysis] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/google-marketing/recommendations");
      const data = await res.json();

      if (data.success) {
        setCampaigns(data.data.campaigns || []);
        setRecommendations(data.data.recommendations || []);
        setSummary(data.data.summary || { total: 0, critical: 0, high: 0, medium: 0, low: 0, autoApplied: 0 });
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (rec: Recommendation) => {
    setProcessing(rec.id);
    try {
      const res = await fetch("/api/google-marketing/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationId: rec.id, action: "approve" }),
      });
      const data = await res.json();
      if (data.success) {
        setRecommendations(prev => prev.filter(r => r.id !== rec.id));
        setSummary(prev => ({ ...prev, total: prev.total - 1 }));
      }
    } catch (error) {
      console.error("Error approving recommendation:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRec) return;
    setProcessing(selectedRec.id);
    try {
      const res = await fetch("/api/google-marketing/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendationId: selectedRec.id,
          action: "reject",
          rejectionReason: rejectReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRecommendations(prev => prev.filter(r => r.id !== selectedRec.id));
        setSummary(prev => ({ ...prev, total: prev.total - 1 }));
        setShowRejectDialog(false);
        setSelectedRec(null);
        setRejectReason("");
      }
    } catch (error) {
      console.error("Error rejecting recommendation:", error);
    } finally {
      setProcessing(null);
    }
  };

  const triggerManualAnalysis = async () => {
    setRunningAnalysis(true);
    try {
      const res = await fetch("/api/google-marketing/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error triggering analysis:", error);
    } finally {
      setRunningAnalysis(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className={summary.critical > 0 ? "border-red-500 bg-red-50" : ""}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Kritické
            </CardDescription>
            <CardTitle className="text-3xl text-red-600">{summary.critical}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={summary.high > 0 ? "border-orange-500 bg-orange-50" : ""}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Vysoká priorita
            </CardDescription>
            <CardTitle className="text-3xl text-orange-600">{summary.high}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Střední
            </CardDescription>
            <CardTitle className="text-3xl">{summary.medium}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4 text-blue-500" />
              Nízká
            </CardDescription>
            <CardTitle className="text-3xl">{summary.low}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Auto aplikováno
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{summary.autoApplied}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Campaign Health Overview */}
      {campaigns.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Zdraví kampaní</CardTitle>
              <CardDescription>Přehled stavu vašich kampaní</CardDescription>
            </div>
            <Button onClick={triggerManualAnalysis} disabled={runningAnalysis} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${runningAnalysis ? "animate-spin" : ""}`} />
              {runningAnalysis ? "Analyzuji..." : "Spustit analýzu"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map(campaign => {
                const phaseInfo = PHASE_INFO[campaign.phase] || PHASE_INFO.new;
                const PhaseIcon = phaseInfo.icon;
                return (
                  <div key={campaign.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{campaign.campaignName}</h4>
                        <Badge variant="outline" className={`text-${phaseInfo.color}-600`}>
                          <PhaseIcon className="h-3 w-3 mr-1" />
                          {phaseInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Analýz: {campaign.analysisCount}</span>
                        {campaign.lastAnalysisDate && (
                          <span>Poslední: {new Date(campaign.lastAnalysisDate).toLocaleDateString("cs")}</span>
                        )}
                        {campaign.nextAnalysisDate && (
                          <span>Další: {new Date(campaign.nextAnalysisDate).toLocaleDateString("cs")}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{campaign.healthScore}</div>
                      <div className="text-xs text-muted-foreground">Health Score</div>
                      <Progress value={campaign.healthScore} className="w-24 h-2 mt-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {recommendations.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Žádná čekající doporučení</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Všechna automatická doporučení byla aplikována. Další analýza proběhne podle plánu,
              nebo ji můžete spustit manuálně.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recommendations List */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Doporučení ke schválení</CardTitle>
            <CardDescription>
              Projděte si doporučení a rozhodněte, která chcete aplikovat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-4">
              {recommendations.map(rec => (
                <AccordionItem key={rec.id} value={rec.id} className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div className={`w-3 h-3 rounded-full ${PRIORITY_COLORS[rec.priority]}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{rec.title}</span>
                          <Badge variant="outline">{rec.effortInfo.emoji} {rec.effortInfo.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-6 mt-4">
                      {/* Why Section */}
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <HelpCircle className="h-4 w-4" />
                          Proč to doporučujeme?
                        </h4>
                        <div className="text-sm whitespace-pre-line">{rec.reasoning}</div>
                      </div>

                      {/* Impact Comparison */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                          <h5 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4" />
                            Pokud to uděláte
                          </h5>
                          <p className="text-sm text-green-800">{rec.impactComparison.ifYouDo}</p>
                          <div className="mt-3 pt-3 border-t border-green-200">
                            <p className="text-xs text-green-600">
                              <strong>Nejlepší scénář:</strong> {rec.impactComparison.bestCase}
                            </p>
                          </div>
                        </div>
                        <div className="border rounded-lg p-4 bg-red-50 border-red-200">
                          <h5 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                            <ThumbsDown className="h-4 w-4" />
                            Pokud to neuděláte
                          </h5>
                          <p className="text-sm text-red-800">{rec.impactComparison.ifYouDont}</p>
                          <div className="mt-3 pt-3 border-t border-red-200">
                            <p className="text-xs text-red-600">
                              <strong>Nejhorší scénář:</strong> {rec.impactComparison.worstCase}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Expected Impact */}
                      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Target className="h-8 w-8 text-blue-600" />
                        <div>
                          <h5 className="font-medium text-blue-800">Očekávaný dopad</h5>
                          <p className="text-sm text-blue-700">{rec.expectedImpact}</p>
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-purple-800">
                          {rec.impactComparison.recommendation}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          onClick={() => handleApprove(rec)}
                          disabled={processing === rec.id}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {processing === rec.id ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Schválit a aplikovat
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedRec(rec);
                            setShowRejectDialog(true);
                          }}
                          disabled={processing === rec.id}
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Odmítnout
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Odmítnout doporučení</DialogTitle>
            <DialogDescription>
              Proč toto doporučení odmítáte? (volitelné)
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Např.: Nemáme rozpočet, není to teď priorita, už jsme to zkoušeli..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Zrušit
            </Button>
            <Button onClick={handleReject} disabled={processing !== null} variant="destructive">
              {processing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
              Odmítnout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
