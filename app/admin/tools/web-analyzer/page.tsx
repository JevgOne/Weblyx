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
  Loader2,
  Mail,
  Copy,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
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
  const [showEmail, setShowEmail] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('auto'); // 'auto', 'general', 'slowWeb', etc.

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
    if (score >= 80) return "text-primary";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "Výborné", variant: "default" as const, className: "bg-primary" };
    if (score >= 60) return { label: "Dobré", variant: "default" as const, className: "bg-yellow-600" };
    if (score >= 40) return { label: "Slabé", variant: "default" as const, className: "bg-orange-600" };
    return { label: "Kritické", variant: "destructive" as const, className: "" };
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Globe className="h-8 w-8" />
            Web Analyzer
          </h1>
          <p className="text-muted-foreground mt-2">
            Analyzujte konkurenční weby a identifikujte příležitosti pro cold outreach
          </p>
        </div>
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
                        <CheckCircle2 className="h-4 w-4 text-primary" />
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
                  <Shield className={analysis.technical.hasSSL ? "text-primary" : "text-red-600"} />
                  <div>
                    <p className="text-sm font-medium">SSL/HTTPS</p>
                    <p className="text-xs text-muted-foreground">
                      {analysis.technical.hasSSL ? "Ano" : "Ne"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Smartphone className={analysis.technical.mobileResponsive ? "text-primary" : "text-red-600"} />
                  <div>
                    <p className="text-sm font-medium">Mobilní</p>
                    <p className="text-xs text-muted-foreground">
                      {analysis.technical.mobileResponsive ? "Ano" : "Ne"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className={analysis.technical.title ? "text-primary" : "text-red-600"} />
                  <div>
                    <p className="text-sm font-medium">Title tag</p>
                    <p className="text-xs text-muted-foreground">
                      {analysis.technical.title ? "Ano" : "Ne"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className={analysis.technical.hasH1 ? "text-primary" : "text-red-600"} />
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

          {/* SEO Audit */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Audit</CardTitle>
              <CardDescription>Checklist klíčových SEO prvků</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "Title tag", ok: !!analysis.technical.title },
                  { label: "Meta description", ok: !!analysis.technical.description },
                  { label: "H1 nadpis", ok: analysis.technical.hasH1 },
                  { label: "Canonical URL", ok: analysis.technical.hasCanonical },
                  { label: "Open Graph tagy", ok: analysis.technical.hasOgTags },
                  { label: "Twitter Card", ok: analysis.technical.hasTwitterCard },
                  { label: "Sitemap.xml", ok: analysis.technical.hasSitemap },
                  { label: "Robots.txt", ok: analysis.technical.hasRobotsTxt },
                  { label: "Schema markup", ok: analysis.technical.schemaMarkup },
                  { label: "Favicon", ok: analysis.technical.hasFavicon },
                  { label: "Lang atribut", ok: analysis.technical.hasLangAttribute },
                  { label: "SSL/HTTPS", ok: analysis.technical.hasSSL },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    {item.ok ? (
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                    <span className={item.ok ? "" : "text-muted-foreground"}>{item.label}</span>
                  </div>
                ))}
              </div>
              {analysis.technical.hreflangTags.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-1">Hreflang jazyky:</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.technical.hreflangTags.map((lang, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{lang}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {analysis.technical.brokenInternalLinks.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-700 mb-1">
                    Nefunkční interní odkazy ({analysis.technical.brokenInternalLinks.length}):
                  </p>
                  {analysis.technical.brokenInternalLinks.slice(0, 5).map((link, idx) => (
                    <p key={idx} className="text-xs text-red-600 truncate">{link}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Keywords & DOM Metrics */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Keywords */}
            {analysis.content?.topKeywords && analysis.content.topKeywords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top klíčová slova</CardTitle>
                  <CardDescription>Nejčastější slova na stránce</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.content.topKeywords.map((kw, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{kw.word}</span>
                        <Badge variant="secondary">{kw.count}x</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* DOM Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>DOM & Obrázky</CardTitle>
                <CardDescription>Technické metriky stránky</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DOM elementy:</span>
                    <span className={`font-medium ${analysis.technical.domElementCount > 3000 ? 'text-red-600' : analysis.technical.domElementCount > 1500 ? 'text-yellow-600' : ''}`}>
                      {analysis.technical.domElementCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inline styly:</span>
                    <span className="font-medium">{analysis.technical.inlineStyleCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Velikost HTML:</span>
                    <span className="font-medium">{analysis.technical.pageSize} KB</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lazy loading:</span>
                    <span className="font-medium">{analysis.technical.imagesWithLazyLoading} / {analysis.technical.totalImages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">WebP/AVIF:</span>
                    <span className="font-medium">{analysis.technical.imagesWithModernFormat}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Analysis */}
          {(analysis as any).content && (
            <Card>
              <CardHeader>
                <CardTitle>📝 Analýza obsahu</CardTitle>
                <CardDescription>Readability score a textové metriky</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Word Count</p>
                      <p className="text-2xl font-bold">{(analysis as any).content.wordCount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Readability</p>
                      <p className={`text-2xl font-bold ${
                        (analysis as any).content.readabilityScore >= 60 ? 'text-primary' :
                        (analysis as any).content.readabilityScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(analysis as any).content.readabilityScore}/100
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Věty</p>
                      <p className="text-2xl font-bold">{(analysis as any).content.sentenceCount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Odstavce</p>
                      <p className="text-2xl font-bold">{(analysis as any).content.paragraphCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {(analysis as any).content.readabilityLevel === 'very-easy' && '✅ Velmi snadné'}
                      {(analysis as any).content.readabilityLevel === 'easy' && '✅ Snadné'}
                      {(analysis as any).content.readabilityLevel === 'moderate' && '⚠️ Střední'}
                      {(analysis as any).content.readabilityLevel === 'difficult' && '❌ Těžké'}
                      {(analysis as any).content.readabilityLevel === 'very-difficult' && '❌ Velmi těžké'}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Průměr: {(analysis as any).content.averageWordsPerSentence} slov/věta
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* NEW: Technology Stack */}
          {(analysis as any).technology && (
            <Card>
              <CardHeader>
                <CardTitle>🛠️ Detekované technologie</CardTitle>
                <CardDescription>Platforma, framework, knihovny a analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {(analysis as any).technology.platform && (
                      <div>
                        <p className="text-sm font-medium mb-2">Platform/CMS</p>
                        <Badge variant="default" className="text-sm">
                          {(analysis as any).technology.platform}
                        </Badge>
                      </div>
                    )}

                    {(analysis as any).technology.framework && (
                      <div>
                        <p className="text-sm font-medium mb-2">Framework</p>
                        <Badge variant="secondary" className="text-sm">
                          {(analysis as any).technology.framework}
                        </Badge>
                      </div>
                    )}

                    {(analysis as any).technology.server && (
                      <div>
                        <p className="text-sm font-medium mb-2">Server</p>
                        <Badge variant="outline" className="text-sm">
                          {(analysis as any).technology.server}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {(analysis as any).technology.libraries.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Knihovny</p>
                      <div className="flex flex-wrap gap-2">
                        {(analysis as any).technology.libraries.map((lib: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {lib}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(analysis as any).technology.analytics.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Analytics & Marketing</p>
                      <div className="flex flex-wrap gap-2">
                        {(analysis as any).technology.analytics.map((tool: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(analysis as any).technology.fonts.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Fonty</p>
                      <div className="flex flex-wrap gap-2">
                        {(analysis as any).technology.fonts.map((font: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {font}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* NEW: Security & Performance */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Security */}
            {(analysis as any).security && (
              <Card>
                <CardHeader>
                  <CardTitle>🔒 Bezpečnost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Security Score</p>
                      <div className={`text-4xl font-bold ${
                        (analysis as any).security.securityScore >= 80 ? 'text-primary' :
                        (analysis as any).security.securityScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(analysis as any).security.securityScore}/100
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Security Headers:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          {(analysis as any).security.headers.strictTransportSecurity ? '✅' : '❌'} HSTS
                        </div>
                        <div className="flex items-center gap-1">
                          {(analysis as any).security.headers.contentSecurityPolicy ? '✅' : '❌'} CSP
                        </div>
                        <div className="flex items-center gap-1">
                          {(analysis as any).security.headers.xFrameOptions ? '✅' : '❌'} X-Frame
                        </div>
                        <div className="flex items-center gap-1">
                          {(analysis as any).security.headers.xContentTypeOptions ? '✅' : '❌'} X-Content-Type
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance */}
            {(analysis as any).performance && (
              <Card>
                <CardHeader>
                  <CardTitle>⚡ Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Performance Score</p>
                      <div className={`text-4xl font-bold ${
                        (analysis as any).performance.estimatedScore >= 75 ? 'text-primary' :
                        (analysis as any).performance.estimatedScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(analysis as any).performance.estimatedScore}/100
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Resources:</span>
                        <span className="font-medium">{(analysis as any).performance.totalResources}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. Size:</span>
                        <span className="font-medium">{Math.round((analysis as any).performance.totalResourcesSize / 1024)} MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Compression:</span>
                        <span>{(analysis as any).performance.hasCompression ? '✅ Ano' : '❌ Ne'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Caching:</span>
                        <span>{(analysis as any).performance.hasCaching ? '✅ Ano' : '❌ Ne'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

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

          {/* Screenshots */}
          {(analysis as any).screenshots && (
            <Card>
              <CardHeader>
                <CardTitle>Screenshots webu</CardTitle>
                <CardDescription>
                  Automaticky pořízené screenshoty na různých zařízeních
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {/* Desktop Screenshot */}
                  {(analysis as any).screenshots.desktop && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold">Desktop (1920x1080)</h4>
                      </div>
                      <div className="border rounded-lg overflow-hidden bg-muted/50">
                        <img
                          src={`data:image/png;base64,${(analysis as any).screenshots.desktop}`}
                          alt="Desktop screenshot"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tablet and Mobile in Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Tablet Screenshot */}
                    {(analysis as any).screenshots.tablet && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold">Tablet (768x1024)</h4>
                        </div>
                        <div className="border rounded-lg overflow-hidden bg-muted/50">
                          <img
                            src={`data:image/png;base64,${(analysis as any).screenshots.tablet}`}
                            alt="Tablet screenshot"
                            className="w-full h-auto"
                          />
                        </div>
                      </div>
                    )}

                    {/* Mobile Screenshot */}
                    {(analysis as any).screenshots.mobile && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-primary" />
                          <h4 className="font-semibold">Mobile (375x667)</h4>
                        </div>
                        <div className="border rounded-lg overflow-hidden bg-muted/50">
                          <img
                            src={`data:image/png;base64,${(analysis as any).screenshots.mobile}`}
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
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Další kroky</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="default"
                  onClick={() => setShowEmail(!showEmail)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {showEmail ? "Skrýt email" : "Zobrazit email s nabídkou"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!(analysis as any).proposalEmail) {
                      alert("Email nebyl vygenerován");
                      return;
                    }
                    navigator.clipboard.writeText((analysis as any).proposalEmail);
                    setEmailCopied(true);
                    setTimeout(() => setEmailCopied(false), 2000);
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {emailCopied ? "Zkopírováno!" : "Zkopírovat email"}
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      // Send full analysis data (without screenshots to save size)
                      const { screenshots, ...analysisWithoutScreenshots } = analysis as any;
                      const response = await fetch("/api/admin/generate-pdf", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          analysis: analysisWithoutScreenshots,
                          businessName,
                        }),
                      });

                      if (!response.ok) throw new Error("Failed to generate PDF");

                      const blob = await response.blob();
                      const downloadUrl = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = downloadUrl;
                      a.download = `web-analysis-${new URL(analysis.url).hostname}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(downloadUrl);
                      document.body.removeChild(a);
                    } catch (err) {
                      console.error("PDF generation error:", err);
                      alert("Chyba při generování PDF");
                    }
                  }}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Vygenerovat PDF report
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open("/admin/promo-codes", "_blank");
                  }}
                >
                  Vytvořit promo kód
                </Button>
              </div>

              {/* Email Preview with Template Selection */}
              {showEmail && (analysis as any).proposalEmail && (
                <div className="mt-6 p-4 bg-muted rounded-lg space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email templates s nabídkou
                    </h4>
                  </div>

                  {/* Template Selector */}
                  {(analysis as any).emailTemplates && (
                    <div className="space-y-3">
                      <Label>Vyberte template:</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <Button
                          variant={selectedTemplate === 'auto' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTemplate('auto')}
                          className="justify-start"
                        >
                          ✨ Automatický
                          {(analysis as any).primaryIssue && selectedTemplate === 'auto' && (
                            <Badge className="ml-2 bg-primary-foreground text-primary">
                              {(analysis as any).primaryIssue}
                            </Badge>
                          )}
                        </Button>
                        <Button
                          variant={selectedTemplate === 'general' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTemplate('general')}
                          className="justify-start"
                        >
                          📄 Obecný
                        </Button>
                        <Button
                          variant={selectedTemplate === 'slowWeb' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTemplate('slowWeb')}
                          className="justify-start"
                        >
                          🐌 Pomalý web
                        </Button>
                        <Button
                          variant={selectedTemplate === 'badSEO' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTemplate('badSEO')}
                          className="justify-start"
                        >
                          🔍 Špatné SEO
                        </Button>
                        <Button
                          variant={selectedTemplate === 'mobileIssues' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTemplate('mobileIssues')}
                          className="justify-start"
                        >
                          📱 Mobilní problémy
                        </Button>
                        <Button
                          variant={selectedTemplate === 'outdatedDesign' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTemplate('outdatedDesign')}
                          className="justify-start"
                        >
                          🎨 Zastaralý design
                        </Button>
                        <Button
                          variant={selectedTemplate === 'followUp' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTemplate('followUp')}
                          className="justify-start"
                        >
                          📧 Follow-up
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Email Subject with Copy Button */}
                  {((analysis as any).proposalSubject || (analysis as any).emailSubjects) && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">AI návrh - Předmět emailu:</Label>
                      <div className="flex gap-2">
                        <div className="flex-1 p-3 bg-background rounded border">
                          <p className="font-semibold text-sm">
                            {selectedTemplate === 'auto'
                              ? (analysis as any).proposalSubject
                              : (analysis as any).emailSubjects?.[selectedTemplate] || (analysis as any).proposalSubject}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const subject = selectedTemplate === 'auto'
                              ? (analysis as any).proposalSubject
                              : (analysis as any).emailSubjects?.[selectedTemplate] || (analysis as any).proposalSubject;

                            if (!subject) {
                              alert("Předmět není dostupný");
                              return;
                            }
                            navigator.clipboard.writeText(subject);
                            setEmailCopied(true);
                            setTimeout(() => setEmailCopied(false), 2000);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Copy Button for Selected Template */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const emailContent = selectedTemplate === 'auto'
                        ? (analysis as any).proposalEmail
                        : (analysis as any).emailTemplates?.[selectedTemplate];

                      if (!emailContent) {
                        alert("Email template není dostupný");
                        return;
                      }
                      navigator.clipboard.writeText(emailContent);
                      setEmailCopied(true);
                      setTimeout(() => setEmailCopied(false), 2000);
                    }}
                    className="w-full"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {emailCopied ? "✓ Zkopírováno!" : "Zkopírovat vybraný template"}
                  </Button>

                  {/* Email Content */}
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-background p-4 rounded border overflow-auto max-h-96">
                    {selectedTemplate === 'auto'
                      ? (analysis as any).proposalEmail
                      : (analysis as any).emailTemplates?.[selectedTemplate] || 'Template není dostupný'}
                  </pre>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Automatický template:</strong> Vybírá se podle hlavního problému webu
                    </p>
                    {(analysis as any).primaryIssue && (
                      <p className="text-xs text-primary font-medium">
                        ✨ Pro tento web byl automaticky vybrán: <strong>{(analysis as any).primaryIssue}</strong>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      📝 Tip: Vyberte jiný template nebo zkopírujte a upravte podle potřeby
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
