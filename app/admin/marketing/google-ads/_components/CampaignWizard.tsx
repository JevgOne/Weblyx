"use client";

import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Plus,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

interface KeywordEntry {
  text: string;
  matchType: "EXACT" | "PHRASE" | "BROAD";
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
  keywords: {
    high_intent: Array<{ text: string; matchType: string; intent: string }>;
    medium_intent: Array<{ text: string; matchType: string; intent: string }>;
    discovery: Array<{ text: string; matchType: string; intent: string }>;
  };
  campaign_settings: {
    bidding_strategy: string;
    daily_budget: number;
    target_cpa: number;
    ad_schedule: string;
    locations: string[];
    devices: string;
  };
  [key: string]: any;
}

interface CampaignWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  analysisResult?: AnalysisResult | null;
}

export default function CampaignWizard({ open, onClose, onSuccess, analysisResult }: CampaignWizardProps) {
  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creationLog, setCreationLog] = useState<string[]>([]);

  // Step 1: Campaign
  const [campaignName, setCampaignName] = useState(
    analysisResult?.strategy?.campaign_objective
      ? `Search - ${analysisResult.strategy.campaign_objective.slice(0, 40)}`
      : ""
  );
  const [dailyBudget, setDailyBudget] = useState(
    analysisResult?.campaign_settings?.daily_budget || 100
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Step 2: Ad Group + Keywords
  const [adGroupName, setAdGroupName] = useState(
    analysisResult?.strategy?.campaign_objective
      ? `AG - ${analysisResult.strategy.campaign_objective.slice(0, 30)}`
      : ""
  );
  const [cpcBid, setCpcBid] = useState(
    analysisResult?.campaign_settings?.target_cpa
      ? Math.round(analysisResult.campaign_settings.target_cpa / 10)
      : 15
  );
  const [keywords, setKeywords] = useState<KeywordEntry[]>(
    analysisResult
      ? [
          ...(analysisResult.keywords.high_intent || []).map((k) => ({
            text: k.text,
            matchType: (k.matchType as "EXACT" | "PHRASE" | "BROAD") || "EXACT",
          })),
          ...(analysisResult.keywords.medium_intent || []).map((k) => ({
            text: k.text,
            matchType: (k.matchType as "EXACT" | "PHRASE" | "BROAD") || "PHRASE",
          })),
        ]
      : []
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [defaultMatchType, setDefaultMatchType] = useState<"EXACT" | "PHRASE" | "BROAD">("PHRASE");

  const addKeywordsFromInput = () => {
    const lines = keywordInput
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    const newKws = lines.map((text) => ({ text, matchType: defaultMatchType }));
    setKeywords((prev) => [...prev, ...newKws]);
    setKeywordInput("");
  };

  const removeKeyword = (index: number) => {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  };

  const updateKeywordMatchType = (index: number, matchType: "EXACT" | "PHRASE" | "BROAD") => {
    setKeywords((prev) => prev.map((k, i) => (i === index ? { ...k, matchType } : k)));
  };

  const loadFromAnalysis = () => {
    if (!analysisResult) return;
    const allKws = [
      ...(analysisResult.keywords.high_intent || []).map((k) => ({
        text: k.text,
        matchType: (k.matchType as "EXACT" | "PHRASE" | "BROAD") || "EXACT",
      })),
      ...(analysisResult.keywords.medium_intent || []).map((k) => ({
        text: k.text,
        matchType: (k.matchType as "EXACT" | "PHRASE" | "BROAD") || "PHRASE",
      })),
    ];
    setKeywords(allKws);
  };

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    setCreationLog([]);

    try {
      // Step 1: Create campaign
      setCreationLog(["Vytvářím kampaň..."]);
      const campaignRes = await fetch("/api/google-ads/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignName,
          dailyBudgetCzk: dailyBudget,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      });
      const campaignData = await campaignRes.json();
      if (!campaignData.success) {
        throw new Error(`Kampaň: ${campaignData.error}`);
      }

      // Extract campaign ID from resource name
      const campaignResourceName = campaignData.data.campaignResourceName;
      const campaignId = campaignResourceName?.split("/").pop();
      if (!campaignId) {
        throw new Error("Nepodařilo se získat ID kampaně");
      }
      setCreationLog((prev) => [...prev, `Kampaň vytvořena (ID: ${campaignId})`]);

      // Step 2: Create ad group (if name provided)
      if (adGroupName) {
        setCreationLog((prev) => [...prev, "Vytvářím ad group..."]);
        const adGroupRes = await fetch("/api/google-ads/ad-group", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId,
            name: adGroupName,
            cpcBidCzk: cpcBid,
          }),
        });
        const adGroupData = await adGroupRes.json();
        if (!adGroupData.success) {
          throw new Error(`Ad Group: ${adGroupData.error}`);
        }

        const adGroupResourceName = adGroupData.data.resourceName;
        const adGroupId = adGroupResourceName?.split("/").pop();
        setCreationLog((prev) => [...prev, `Ad group vytvořena (ID: ${adGroupId})`]);

        // Step 3: Add keywords (if any)
        if (keywords.length > 0 && adGroupId) {
          setCreationLog((prev) => [...prev, `Přidávám ${keywords.length} klíčových slov...`]);
          const kwRes = await fetch("/api/google-ads/keywords", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              adGroupId,
              keywords: keywords.map((k) => ({ text: k.text, matchType: k.matchType })),
            }),
          });
          const kwData = await kwRes.json();
          if (!kwData.success) {
            throw new Error(`Keywords: ${kwData.error}`);
          }
          setCreationLog((prev) => [...prev, `${keywords.length} klíčových slov přidáno`]);
        }
      }

      setCreationLog((prev) => [...prev, "Hotovo! Kampaň vytvořena jako PAUSED."]);

      // Wait a moment to show success, then close
      setTimeout(() => {
        onSuccess();
        onClose();
        // Reset state
        setStep(1);
        setCreating(false);
        setCreationLog([]);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Nepodařilo se vytvořit kampaň");
      setCreating(false);
    }
  };

  const canProceedStep1 = campaignName.trim().length > 0 && dailyBudget > 0;
  const canProceedStep2 = true; // Ad group is optional

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Vytvořit kampaň
            <Badge variant="outline" className="ml-2">
              Krok {step}/3
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Základní nastavení kampaně a rozpočtu"}
            {step === 2 && "Ad Group, CPC bid a klíčová slova"}
            {step === 3 && "Shrnutí a vytvoření kampaně"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex gap-1 mb-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Campaign */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Název kampaně *</Label>
              <Input
                placeholder="Search - Webdesign CZ"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Denní rozpočet (CZK) *</Label>
              <Input
                type="number"
                min={1}
                value={dailyBudget}
                onChange={(e) => setDailyBudget(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Měsíční odhad: ~{new Intl.NumberFormat("cs-CZ").format(dailyBudget * 30)} Kč
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum začátku (volitelné)</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Datum konce (volitelné)</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
                Další
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Ad Group + Keywords */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Název Ad Group</Label>
                <Input
                  placeholder="AG - Hlavní klíčová slova"
                  value={adGroupName}
                  onChange={(e) => setAdGroupName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Max CPC bid (Kč)</Label>
                <Input
                  type="number"
                  min={1}
                  value={cpcBid}
                  onChange={(e) => setCpcBid(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Klíčová slova ({keywords.length})</Label>
                <div className="flex gap-2">
                  {analysisResult && (
                    <Button variant="outline" size="sm" onClick={loadFromAnalysis}>
                      <Sparkles className="h-3 w-3 mr-1" />
                      Z AI analýzy
                    </Button>
                  )}
                  <Select
                    value={defaultMatchType}
                    onValueChange={(v: "EXACT" | "PHRASE" | "BROAD") => setDefaultMatchType(v)}
                  >
                    <SelectTrigger className="w-[130px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXACT">[exact]</SelectItem>
                      <SelectItem value="PHRASE">"phrase"</SelectItem>
                      <SelectItem value="BROAD">broad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Textarea
                placeholder="Zadejte klíčová slova (jedno na řádek)&#10;webdesign praha&#10;tvorba webových stránek&#10;webová agentura"
                rows={4}
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addKeywordsFromInput}
                disabled={keywordInput.trim().length === 0}
              >
                <Plus className="h-3 w-3 mr-1" />
                Přidat
              </Button>
            </div>

            {/* Keywords list */}
            {keywords.length > 0 && (
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
                {keywords.map((kw, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm group">
                    <Select
                      value={kw.matchType}
                      onValueChange={(v: "EXACT" | "PHRASE" | "BROAD") => updateKeywordMatchType(i, v)}
                    >
                      <SelectTrigger className="w-[100px] h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EXACT">[exact]</SelectItem>
                        <SelectItem value="PHRASE">"phrase"</SelectItem>
                        <SelectItem value="BROAD">broad</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="flex-1 truncate">{kw.text}</span>
                    <button
                      onClick={() => removeKeyword(i)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zpět
              </Button>
              <Button onClick={() => setStep(3)} disabled={!canProceedStep2}>
                Další
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Create */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="font-semibold">Kampaň</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-muted-foreground">Název:</span>
                <span className="font-medium">{campaignName}</span>
                <span className="text-muted-foreground">Denní rozpočet:</span>
                <span>{new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(dailyBudget)}</span>
                {startDate && (
                  <>
                    <span className="text-muted-foreground">Začátek:</span>
                    <span>{startDate}</span>
                  </>
                )}
                {endDate && (
                  <>
                    <span className="text-muted-foreground">Konec:</span>
                    <span>{endDate}</span>
                  </>
                )}
              </div>
            </div>

            {adGroupName && (
              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-semibold">Ad Group</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-muted-foreground">Název:</span>
                  <span className="font-medium">{adGroupName}</span>
                  <span className="text-muted-foreground">Max CPC:</span>
                  <span>{cpcBid} Kč</span>
                  <span className="text-muted-foreground">Keywords:</span>
                  <span>{keywords.length} klíčových slov</span>
                </div>
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {keywords.slice(0, 10).map((k, i) => (
                      <Badge key={i} variant={k.matchType === "EXACT" ? "default" : k.matchType === "PHRASE" ? "secondary" : "outline"} className="text-xs">
                        {k.matchType === "EXACT" ? `[${k.text}]` : k.matchType === "PHRASE" ? `"${k.text}"` : k.text}
                      </Badge>
                    ))}
                    {keywords.length > 10 && (
                      <Badge variant="outline" className="text-xs">+{keywords.length - 10} dalších</Badge>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-lg border border-yellow-200 bg-yellow-50/50 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-sm text-yellow-800">
                Kampaň bude vytvořena jako <strong>PAUSED</strong> (pozastavená). Můžete ji aktivovat v tabulce kampaní.
              </p>
            </div>

            {/* Creation log */}
            {creationLog.length > 0 && (
              <div className="rounded-lg bg-muted p-3 space-y-1">
                {creationLog.map((log, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {i === creationLog.length - 1 && creating ? (
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    ) : (
                      <Check className="h-3 w-3 text-green-500" />
                    )}
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(2)} disabled={creating}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zpět
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Vytvářím...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Vytvořit kampaň (PAUSED)
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
