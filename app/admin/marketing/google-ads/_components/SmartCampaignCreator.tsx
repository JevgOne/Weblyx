"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Rocket,
  Globe,
  Target,
  ShoppingCart,
  Users,
  RefreshCw,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Zap,
  Brain,
  Megaphone,
  Search,
  MousePointer,
  AlertTriangle,
  Lightbulb,
  FlaskConical,
  Shield,
  CircleAlert,
  Wrench,
  TrendingUp,
} from "lucide-react";

interface SmartCampaignCreatorProps {
  onCampaignCreated: () => void;
}

type Goal = "leads" | "sales" | "traffic";

interface ExpertNote {
  insight: string;
  test_first: string;
  warning: string;
}

interface ExpertNotes {
  project_manager?: ExpertNote;
  marketing?: ExpertNote;
  seo?: ExpertNote;
  ppc?: ExpertNote;
}

interface BlockingIssue {
  issue: string;
  evidence: string;
  fix: string;
  priority: "critical" | "high";
}

interface WebsiteChange {
  page: string;
  change: string;
  reason: string;
  priority: "critical" | "high" | "medium";
}

interface CampaignChange {
  change: string;
  reason: string;
  priority: "critical" | "high" | "medium";
}

interface ActionPlan {
  readiness_score: number;
  readiness_label: string;
  blocking_issues: BlockingIssue[];
  website_changes: WebsiteChange[];
  campaign_changes: CampaignChange[];
}

interface AnalysisPreview {
  campaignId: string;
  campaignName: string;
  keywords: string[];
  headlines: string[];
  descriptions: string[];
  estimatedMonthlyClicks: number;
  monthlyBudget: number;
  dailyBudget: number;
  goal: Goal;
  analysis: any;
  expertNotes?: ExpertNotes;
  actionPlan?: ActionPlan;
}

const BUDGET_PRESETS = [
  { value: 5000, label: "5 000 Kč" },
  { value: 10000, label: "10 000 Kč" },
  { value: 15000, label: "15 000 Kč" },
  { value: 25000, label: "25 000 Kč" },
];

const GOAL_OPTIONS: Array<{ value: Goal; label: string; description: string; icon: React.ReactNode }> = [
  {
    value: "leads",
    label: "Poptávky",
    description: "Formuláře, telefonáty, emaily",
    icon: <Target className="h-6 w-6" />,
  },
  {
    value: "sales",
    label: "Prodeje",
    description: "E-shop objednávky, nákupy",
    icon: <ShoppingCart className="h-6 w-6" />,
  },
  {
    value: "traffic",
    label: "Návštěvnost",
    description: "Více lidí na web",
    icon: <Users className="h-6 w-6" />,
  },
];

const PROGRESS_MESSAGES = [
  "Čteme váš web...",
  "Analyzujeme konkurenci...",
  "Hledáme klíčová slova...",
  "Píšeme texty reklam...",
  "Tým expertů finalizuje strategii...",
  "Vytváříme kampaň...",
];

export default function SmartCampaignCreator({ onCampaignCreated }: SmartCampaignCreatorProps) {
  // Step: "input" | "analyzing" | "preview" | "deploying" | "done"
  const [step, setStep] = useState<"input" | "analyzing" | "preview" | "deploying" | "done">("input");

  // Input state
  const [websiteUrl, setWebsiteUrl] = useState("https://");
  const [monthlyBudget, setMonthlyBudget] = useState(15000);
  const [customBudget, setCustomBudget] = useState(false);
  const [goal, setGoal] = useState<Goal>("leads");

  // Analysis state
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Preview state
  const [preview, setPreview] = useState<AnalysisPreview | null>(null);

  const handleAnalyze = async () => {
    if (!websiteUrl || websiteUrl === "https://" || !monthlyBudget || !goal) {
      setError("Vyplňte prosím URL webu, rozpočet a cíl.");
      return;
    }

    setError(null);
    setStep("analyzing");
    setProgressPercent(0);

    // Simulate progress messages while waiting
    let msgIndex = 0;
    const progressInterval = setInterval(() => {
      if (msgIndex < PROGRESS_MESSAGES.length) {
        setProgressMessage(PROGRESS_MESSAGES[msgIndex]);
        setProgressPercent(Math.min(15 + msgIndex * 15, 90));
        msgIndex++;
      }
    }, 5000);

    setProgressMessage(PROGRESS_MESSAGES[0]);
    setProgressPercent(10);

    try {
      const res = await fetch("/api/google-ads/smart-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrl,
          monthlyBudget,
          goal,
          language: "cs",
        }),
      });

      clearInterval(progressInterval);

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Nepodařilo se vytvořit kampaň.");
        setStep("input");
        return;
      }

      setProgressPercent(100);
      setProgressMessage("Hotovo!");

      setPreview({
        campaignId: data.data.campaignId,
        campaignName: data.data.campaignName,
        keywords: data.data.summary.keywords,
        headlines: data.data.summary.headlines,
        descriptions: data.data.summary.descriptions,
        estimatedMonthlyClicks: data.data.estimatedMonthlyClicks,
        monthlyBudget: data.data.monthlyBudget,
        dailyBudget: data.data.dailyBudget,
        goal: data.data.summary.goal,
        analysis: data.data.analysis,
        expertNotes: data.data.analysis?.expert_notes,
        actionPlan: data.data.analysis?.action_plan,
      });

      // Small delay before showing preview
      setTimeout(() => setStep("preview"), 500);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err?.message || "Připojení selhalo. Zkuste to znovu.");
      setStep("input");
    }
  };

  const handleDeploy = async () => {
    if (!preview) return;

    setStep("deploying");

    try {
      // Enable the campaign (it was created as PAUSED)
      const res = await fetch(`/api/google-ads/campaign/${preview.campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ENABLED" }),
      });

      const data = await res.json();
      if (data.success) {
        setStep("done");
        setTimeout(() => onCampaignCreated(), 2000);
      } else {
        setError("Nepodařilo se spustit kampaň: " + data.error);
        setStep("preview");
      }
    } catch (err: any) {
      setError("Spuštění selhalo: " + (err?.message || "Neznámá chyba"));
      setStep("preview");
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(value);

  // INPUT STEP
  if (step === "input") {
    return (
      <Card className="border-2 border-dashed border-teal-300 bg-gradient-to-br from-teal-50/50 to-blue-50/50 dark:from-teal-950/20 dark:to-blue-950/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center mb-4">
            <Rocket className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </div>
          <CardTitle className="text-2xl">Spusťte Google Ads kampaň</CardTitle>
          <p className="text-muted-foreground mt-1">
            Zadejte web, rozpočet a cíl. AI vytvoří kompletní kampaň za vás.
          </p>
        </CardHeader>
        <CardContent className="space-y-8 max-w-2xl mx-auto">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {/* URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-teal-600" />
              URL vašeho webu
            </label>
            <Input
              placeholder="https://vasefirma.cz"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="text-lg h-12"
            />
          </div>

          {/* Budget */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Měsíční rozpočet</label>
            <div className="grid grid-cols-4 gap-2">
              {BUDGET_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant={monthlyBudget === preset.value && !customBudget ? "default" : "outline"}
                  className={monthlyBudget === preset.value && !customBudget ? "bg-teal-600 hover:bg-teal-700" : ""}
                  onClick={() => {
                    setMonthlyBudget(preset.value);
                    setCustomBudget(false);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={customBudget ? "default" : "outline"}
                size="sm"
                className={customBudget ? "bg-teal-600 hover:bg-teal-700" : ""}
                onClick={() => setCustomBudget(true)}
              >
                Jiný
              </Button>
              {customBudget && (
                <Input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(parseInt(e.target.value) || 0)}
                  className="w-40"
                  placeholder="Částka v Kč"
                />
              )}
              <span className="text-sm text-muted-foreground">
                = cca {formatCurrency(Math.round(monthlyBudget / 30))}/den
              </span>
            </div>
          </div>

          {/* Goal */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Co chcete od reklamy?</label>
            <div className="grid grid-cols-3 gap-3">
              {GOAL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGoal(option.value)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    goal === option.value
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30 shadow-md"
                      : "border-muted hover:border-teal-300 hover:bg-muted/50"
                  }`}
                >
                  <div className={`mx-auto mb-2 ${goal === option.value ? "text-teal-600" : "text-muted-foreground"}`}>
                    {option.icon}
                  </div>
                  <p className="font-semibold text-sm">{option.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            size="lg"
            className="w-full h-14 text-lg bg-teal-600 hover:bg-teal-700"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Vytvořit kampaň s AI
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ANALYZING STEP
  if (step === "analyzing") {
    return (
      <Card className="border-2 border-teal-200">
        <CardContent className="py-16 text-center max-w-lg mx-auto space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-teal-600 animate-spin" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">AI připravuje vaši kampaň</h3>
            <p className="text-muted-foreground">{progressMessage}</p>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <p className="text-xs text-muted-foreground">
            Obvykle to trvá 30-60 sekund. 4 AI experti pracují na vaší kampani.
          </p>
        </CardContent>
      </Card>
    );
  }

  // PREVIEW STEP
  if (step === "preview" && preview) {
    return (
      <Card className="border-2 border-teal-200">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl">Kampaň je připravena ke spuštění</CardTitle>
          <p className="text-sm text-muted-foreground">
            Kampaň &quot;{preview.campaignName}&quot; byla vytvořena jako pozastavená.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 max-w-2xl mx-auto">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {/* What we'll show */}
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Budeme vás ukazovat lidem, kteří hledají:</p>
              <div className="flex flex-wrap gap-1.5">
                {preview.keywords.map((kw, i) => (
                  <Badge key={i} variant="secondary" className="text-sm">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Reklamy budou říkat:</p>
              <div className="space-y-1.5">
                {preview.headlines.map((h, i) => (
                  <p key={i} className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                    {h}
                  </p>
                ))}
              </div>
              {preview.descriptions.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {preview.descriptions[0]}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-teal-600">{formatCurrency(preview.monthlyBudget)}</p>
                <p className="text-xs text-muted-foreground">měsíční rozpočet</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-teal-600">~{preview.estimatedMonthlyClicks}</p>
                <p className="text-xs text-muted-foreground">odhadovaných kliků/měsíc</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-teal-600">{preview.keywords.length}</p>
                <p className="text-xs text-muted-foreground">klíčových slov</p>
              </div>
            </div>
          </div>

          {/* Action Plan */}
          {preview.actionPlan && <ActionPlanSection actionPlan={preview.actionPlan} />}

          {/* Expert Notes */}
          {preview.expertNotes && Object.keys(preview.expertNotes).length > 0 && (
            <Accordion type="single" collapsible defaultValue="expert-notes">
              <AccordionItem value="expert-notes" className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Brain className="h-4 w-4 text-teal-600" />
                    Poznámky od AI expertů
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid gap-3">
                    {preview.expertNotes.project_manager && (
                      <ExpertNoteCard
                        icon={<Brain className="h-4 w-4" />}
                        title="Projektový manažer"
                        color="text-blue-600 dark:text-blue-400"
                        bgColor="bg-blue-50 dark:bg-blue-950/30"
                        note={preview.expertNotes.project_manager}
                      />
                    )}
                    {preview.expertNotes.marketing && (
                      <ExpertNoteCard
                        icon={<Megaphone className="h-4 w-4" />}
                        title="Marketing stratég"
                        color="text-purple-600 dark:text-purple-400"
                        bgColor="bg-purple-50 dark:bg-purple-950/30"
                        note={preview.expertNotes.marketing}
                      />
                    )}
                    {preview.expertNotes.seo && (
                      <ExpertNoteCard
                        icon={<Search className="h-4 w-4" />}
                        title="SEO expert"
                        color="text-green-600 dark:text-green-400"
                        bgColor="bg-green-50 dark:bg-green-950/30"
                        note={preview.expertNotes.seo}
                      />
                    )}
                    {preview.expertNotes.ppc && (
                      <ExpertNoteCard
                        icon={<MousePointer className="h-4 w-4" />}
                        title="PPC specialista"
                        color="text-orange-600 dark:text-orange-400"
                        bgColor="bg-orange-50 dark:bg-orange-950/30"
                        note={preview.expertNotes.ppc}
                      />
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {preview.actionPlan && preview.actionPlan.readiness_score < 40 && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <CircleAlert className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400">
                    Web není připraven na placený provoz
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400/80 mt-1">
                    Readiness skóre je {preview.actionPlan.readiness_score}/100. Doporučujeme nejdříve opravit kritické
                    problémy na webu, jinak riskujete zbytečné propalování rozpočtu.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleDeploy}
              size="lg"
              className="flex-1 h-14 text-lg bg-teal-600 hover:bg-teal-700"
            >
              <Zap className="h-5 w-5 mr-2" />
              Spustit kampaň
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14"
              onClick={() => {
                setStep("input");
                setPreview(null);
                setError(null);
              }}
            >
              Zpět
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Kampaň se spustí jako aktivní v Google Ads. Můžete ji kdykoliv pozastavit.
          </p>
        </CardContent>
      </Card>
    );
  }

  // DEPLOYING STEP
  if (step === "deploying") {
    return (
      <Card className="border-2 border-teal-200">
        <CardContent className="py-16 text-center max-w-lg mx-auto space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
            <Zap className="h-8 w-8 text-teal-600 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold">Spouštíme kampaň...</h3>
        </CardContent>
      </Card>
    );
  }

  // DONE STEP
  if (step === "done") {
    return (
      <Card className="border-2 border-green-200">
        <CardContent className="py-16 text-center max-w-lg mx-auto space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Kampaň běží!</h3>
            <p className="text-muted-foreground">
              Vaše Google Ads kampaň je aktivní. Data se začnou zobrazovat během několika hodin.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

function ActionPlanSection({ actionPlan }: { actionPlan: ActionPlan }) {
  const score = actionPlan.readiness_score;
  const scoreColor =
    score >= 70 ? "text-green-600 dark:text-green-400" : score >= 40 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400";
  const scoreBg =
    score >= 70 ? "bg-green-100 dark:bg-green-900/30" : score >= 40 ? "bg-yellow-100 dark:bg-yellow-900/30" : "bg-red-100 dark:bg-red-900/30";
  const scoreBorder =
    score >= 70 ? "border-green-300 dark:border-green-800" : score >= 40 ? "border-yellow-300 dark:border-yellow-800" : "border-red-300 dark:border-red-800";
  const progressColor =
    score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500";

  const priorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
      high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
      medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[priority] || colors.medium}`}>
        {priority}
      </span>
    );
  };

  const hasContent =
    actionPlan.blocking_issues?.length > 0 ||
    actionPlan.website_changes?.length > 0 ||
    actionPlan.campaign_changes?.length > 0;

  return (
    <Accordion type="single" collapsible defaultValue={score < 70 ? "action-plan" : undefined}>
      <AccordionItem value="action-plan" className={`border-2 rounded-lg ${scoreBorder}`}>
        <AccordionTrigger className="px-4 hover:no-underline">
          <span className="flex items-center gap-3 text-sm font-medium">
            <Shield className={`h-4 w-4 ${scoreColor}`} />
            Akční plán — Připravenost webu
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${scoreBg} ${scoreColor}`}>
              {score}/100 — {actionPlan.readiness_label}
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4">
            {/* Readiness Score Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Připravenost na placený provoz</span>
                <span className={`font-semibold ${scoreColor}`}>{score}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${progressColor}`} style={{ width: `${score}%` }} />
              </div>
            </div>

            {/* Blocking Issues */}
            {actionPlan.blocking_issues?.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
                  <CircleAlert className="h-4 w-4" />
                  Blokující problémy ({actionPlan.blocking_issues.length})
                </p>
                <div className="space-y-2">
                  {actionPlan.blocking_issues.map((issue, i) => (
                    <div key={i} className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-sm">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-red-800 dark:text-red-300">{issue.issue}</p>
                        {priorityBadge(issue.priority)}
                      </div>
                      <p className="text-xs text-red-600/80 dark:text-red-400/70 mb-1.5">
                        <span className="font-medium">Důkaz:</span> {issue.evidence}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Řešení:</span> {issue.fix}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Website Changes */}
            {actionPlan.website_changes?.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Wrench className="h-4 w-4" />
                  Změny na webu ({actionPlan.website_changes.length})
                </p>
                <div className="space-y-1.5">
                  {actionPlan.website_changes.map((change, i) => (
                    <div key={i} className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg text-sm">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium">
                          <Badge variant="outline" className="mr-2 text-xs">{change.page}</Badge>
                          {change.change}
                        </p>
                        {priorityBadge(change.priority)}
                      </div>
                      <p className="text-xs text-muted-foreground">{change.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Campaign Changes */}
            {actionPlan.campaign_changes?.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold flex items-center gap-2 text-teal-600 dark:text-teal-400">
                  <TrendingUp className="h-4 w-4" />
                  Změny v kampani ({actionPlan.campaign_changes.length})
                </p>
                <div className="space-y-1.5">
                  {actionPlan.campaign_changes.map((change, i) => (
                    <div key={i} className="p-3 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 rounded-lg text-sm">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium">{change.change}</p>
                        {priorityBadge(change.priority)}
                      </div>
                      <p className="text-xs text-muted-foreground">{change.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasContent && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Žádné konkrétní problémy nebyly identifikovány.
              </p>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function ExpertNoteCard({
  icon,
  title,
  color,
  bgColor,
  note,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  bgColor: string;
  note: ExpertNote;
}) {
  return (
    <div className={`rounded-lg border p-3 ${bgColor}`}>
      <p className={`font-semibold text-sm flex items-center gap-2 mb-2 ${color}`}>
        {icon}
        {title}
      </p>
      <div className="space-y-2 text-sm">
        {note.insight && (
          <div className="flex gap-2">
            <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0 text-yellow-500" />
            <p className="text-muted-foreground">{note.insight}</p>
          </div>
        )}
        {note.test_first && (
          <div className="flex gap-2">
            <FlaskConical className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
            <p className="text-muted-foreground">{note.test_first}</p>
          </div>
        )}
        {note.warning && (
          <div className="flex gap-2">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
            <p className="text-muted-foreground">{note.warning}</p>
          </div>
        )}
      </div>
    </div>
  );
}
