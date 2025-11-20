"use client";

import { useState } from "react";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingUp,
  Package,
  Clock,
  Shield,
  Smartphone,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  Loader2
} from "lucide-react";
import { WebAnalysisResult } from "@/types/cms";

export default function WebAnalyzerPage() {
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [analysis, setAnalysis] = useState<WebAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url) {
      setError("Zadejte URL webu");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/api/admin/analyze-website", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          contactEmail: contactEmail || undefined,
          contactName: contactName || undefined,
          businessName: businessName || undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Analýza selhala");
      }

      setAnalysis(data.data);
    } catch (err: any) {
      setError(err.message || "Něco se pokazilo");
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "Výborné", variant: "default" as const, className: "bg-green-600" };
    if (score >= 60) return { label: "Dobré", variant: "default" as const, className: "bg-yellow-600" };
    if (score >= 40) return { label: "Slabé", variant: "default" as const, className: "bg-orange-600" };
    return { label: "Kritické", variant: "destructive" as const, className: "" };
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Globe className="h-8 w-8" />
          Web Analyzer
        </h1>
        <p className="text-muted-foreground mt-2">
          Analyzujte konkurenční weby a identifikujte příležitosti pro cold outreach
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Analyzovat web</CardTitle>
          <CardDescription>Zadejte URL webu, který chcete analyzovat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL webu *</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">Název firmy (volitelné)</Label>
                <Input
                  id="businessName"
                  placeholder="Firma s.r.o."
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactName">Jméno kontaktu (volitelné)</Label>
                <Input
                  id="contactName"
                  placeholder="Jan Novák"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email (volitelné)</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="jan@firma.cz"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <Button onClick={handleAnalyze} disabled={loading} size="lg" className="w-full md:w-auto">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzuji...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analyzovat web
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Chyba při analýze</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Celkové hodnocení</CardTitle>
                  <CardDescription>{analysis.url}</CardDescription>
                </div>
                <div className="text-right">
                  <div className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}
                  </div>
                  <Badge {...getScoreBadge(analysis.overallScore)} className="mt-2">
                    {getScoreBadge(analysis.overallScore).label}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Kritické problémy</p>
                  <p className="text-2xl font-bold text-red-600">{analysis.issueCount.critical}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Varování</p>
                  <p className="text-2xl font-bold text-yellow-600">{analysis.issueCount.warning}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Informace</p>
                  <p className="text-2xl font-bold text-blue-600">{analysis.issueCount.info}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Čas načtení</p>
                  <p className="text-2xl font-bold">{analysis.technical.loadTime}ms</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Recommendation */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Doporučený balíček
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-primary">{analysis.recommendation.packageName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Shoda: {analysis.recommendation.confidence}%
                    </p>
                  </div>
                  <Badge variant="default" className="text-lg px-4 py-2">
                    {analysis.recommendation.packageId.toUpperCase()}
                  </Badge>
                </div>

                <Separator />

                <div>
                  <p className="font-medium mb-2">Zdůvodnění:</p>
                  <p className="text-muted-foreground">{analysis.recommendation.reasoning}</p>
                </div>

                <div>
                  <p className="font-medium mb-2">Vyřeší:</p>
                  <ul className="space-y-1">
                    {analysis.recommendation.matchedNeeds.map((need, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        {need}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Technické detaily</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Shield className={analysis.technical.hasSSL ? "text-green-600" : "text-red-600"} />
                  <div>
                    <p className="text-sm font-medium">SSL/HTTPS</p>
                    <p className="text-xs text-muted-foreground">
                      {analysis.technical.hasSSL ? "Ano" : "Ne"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Smartphone className={analysis.technical.mobileResponsive ? "text-green-600" : "text-red-600"} />
                  <div>
                    <p className="text-sm font-medium">Mobilní</p>
                    <p className="text-xs text-muted-foreground">
                      {analysis.technical.mobileResponsive ? "Ano" : "Ne"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className={analysis.technical.title ? "text-green-600" : "text-red-600"} />
                  <div>
                    <p className="text-sm font-medium">Title tag</p>
                    <p className="text-xs text-muted-foreground">
                      {analysis.technical.title ? "Ano" : "Ne"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className={analysis.technical.hasH1 ? "text-green-600" : "text-red-600"} />
                  <div>
                    <p className="text-sm font-medium">H1 nadpis</p>
                    <p className="text-xs text-muted-foreground">
                      {analysis.technical.h1Count} ks
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ImageIcon className="text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Obrázky</p>
                    <p className="text-xs text-muted-foreground">
                      {analysis.technical.totalImages} celkem, {analysis.technical.imagesWithoutAlt} bez ALT
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <LinkIcon className="text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Odkazy</p>
                    <p className="text-xs text-muted-foreground">
                      {analysis.technical.internalLinks} int., {analysis.technical.externalLinks} ext.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues List */}
          {analysis.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Identifikované problémy</CardTitle>
                <CardDescription>Celkem {analysis.issues.length} problémů</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        issue.category === "critical"
                          ? "border-red-200 bg-red-50"
                          : issue.category === "warning"
                          ? "border-yellow-200 bg-yellow-50"
                          : "border-blue-200 bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {issue.category === "critical" ? (
                          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        ) : issue.category === "warning" ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        )}

                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <h4 className="font-medium">{issue.title}</h4>
                            <Badge
                              variant={issue.category === "critical" ? "destructive" : "secondary"}
                            >
                              {issue.category === "critical"
                                ? "Kritické"
                                : issue.category === "warning"
                                ? "Varování"
                                : "Info"}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground">{issue.description}</p>

                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">Dopad:</span> {issue.impact}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Řešení:</span> {issue.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Další kroky</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Vygenerovat PDF report
                </Button>
                <Button variant="outline">
                  <Globe className="h-4 w-4 mr-2" />
                  Odeslat cold email
                </Button>
                <Button variant="outline">
                  Vytvořit promo kód
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
