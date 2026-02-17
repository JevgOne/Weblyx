"use client";

import { useState } from "react";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Globe,
  AlertTriangle,
  TrendingUp,
  Loader2,
  ArrowLeft,
  FileDown,
} from "lucide-react";
import Link from "next/link";
import { WebAnalysisResult } from "@/types/cms";

import ScoreOverview from "./_components/ScoreOverview";
import SeoAnalysisCard from "./_components/SeoAnalysisCard";
import PerformanceSecurityCard from "./_components/PerformanceSecurityCard";
import ContentAccessibilityCard from "./_components/ContentAccessibilityCard";
import SocialGeoCard from "./_components/SocialGeoCard";
import IssuesList from "./_components/IssuesList";
import EmailTemplates from "./_components/EmailTemplates";

export default function WebAnalyzerPage() {
  useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [analysis, setAnalysis] = useState<(WebAnalysisResult & Record<string, any>) | null>(null);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          contactEmail: contactEmail || undefined,
          contactName: contactName || undefined,
          businessName: businessName || undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Analyza selhala");
      }

      setAnalysis(data.data);
    } catch (err: any) {
      setError(err.message || "Neco se pokazilo");
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!analysis) return;
    setPdfLoading(true);
    try {
      const response = await fetch("/api/admin/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis,
          businessName: businessName || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `web-analysis-${new URL(analysis.url).hostname}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Chyba pri generovani PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpet
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Globe className="h-8 w-8" />
            Web Analyzer
          </h1>
          <p className="text-muted-foreground mt-2">
            Komplexni analyza webu - 8 kategorii, detailni report
          </p>
        </div>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Analyzovat web</CardTitle>
          <CardDescription>Zadejte URL webu, ktery chcete analyzovat</CardDescription>
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
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">Nazev firmy (volitelne)</Label>
                <Input
                  id="businessName"
                  placeholder="Firma s.r.o."
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Jmeno kontaktu (volitelne)</Label>
                <Input
                  id="contactName"
                  placeholder="Jan Novak"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email (volitelne)</Label>
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
                  Analyzuji... (8 kategorii)
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
                <p className="font-medium">Chyba pri analyze</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Score Overview with Radar Chart */}
          <ScoreOverview analysis={analysis} />

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleGeneratePDF} disabled={pdfLoading}>
              {pdfLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4 mr-2" />
              )}
              {pdfLoading ? "Generuji PDF..." : "Vygenerovat PDF report"}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("/admin/promo-codes", "_blank")}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Vytvorit promo kod
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="seo" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-auto">
              <TabsTrigger value="seo" className="text-xs">SEO</TabsTrigger>
              <TabsTrigger value="perf-sec" className="text-xs">Perf & Security</TabsTrigger>
              <TabsTrigger value="content-a11y" className="text-xs">Content & A11y</TabsTrigger>
              <TabsTrigger value="social-geo" className="text-xs">Social & GEO</TabsTrigger>
              <TabsTrigger value="issues" className="text-xs">Issues</TabsTrigger>
              <TabsTrigger value="screenshots" className="text-xs">Screenshots</TabsTrigger>
              <TabsTrigger value="email" className="text-xs">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="seo">
              <SeoAnalysisCard analysis={analysis} />
            </TabsContent>

            <TabsContent value="perf-sec">
              <PerformanceSecurityCard analysis={analysis} />
            </TabsContent>

            <TabsContent value="content-a11y">
              <ContentAccessibilityCard analysis={analysis} />
            </TabsContent>

            <TabsContent value="social-geo">
              <SocialGeoCard analysis={analysis} />
            </TabsContent>

            <TabsContent value="issues">
              <IssuesList analysis={analysis} />
            </TabsContent>

            <TabsContent value="screenshots">
              {analysis.screenshots ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Screenshots webu</CardTitle>
                    <CardDescription>Automaticky porizene screenshoty na ruznych zarizenich</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      {analysis.screenshots.desktop && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-primary" />
                            <h4 className="font-semibold">Desktop (1920x1080)</h4>
                          </div>
                          <div className="border rounded-lg overflow-hidden bg-muted/50">
                            <img
                              src={`data:image/png;base64,${analysis.screenshots.desktop}`}
                              alt="Desktop screenshot"
                              className="w-full h-auto"
                            />
                          </div>
                        </div>
                      )}
                      <div className="grid md:grid-cols-2 gap-6">
                        {analysis.screenshots.tablet && (
                          <div className="space-y-2">
                            <h4 className="font-semibold">Tablet (768x1024)</h4>
                            <div className="border rounded-lg overflow-hidden bg-muted/50">
                              <img
                                src={`data:image/png;base64,${analysis.screenshots.tablet}`}
                                alt="Tablet screenshot"
                                className="w-full h-auto"
                              />
                            </div>
                          </div>
                        )}
                        {analysis.screenshots.mobile && (
                          <div className="space-y-2">
                            <h4 className="font-semibold">Mobile (375x667)</h4>
                            <div className="border rounded-lg overflow-hidden bg-muted/50">
                              <img
                                src={`data:image/png;base64,${analysis.screenshots.mobile}`}
                                alt="Mobile screenshot"
                                className="w-full h-auto"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Screenshoty nejsou k dispozici (puppeteer nebyl dostupny).
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="email">
              <EmailTemplates analysis={analysis} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
