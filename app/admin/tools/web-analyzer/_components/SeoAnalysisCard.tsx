"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { WebAnalysisResult } from "@/types/cms";

interface SeoAnalysisCardProps {
  analysis: WebAnalysisResult;
}

function CheckItem({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
      )}
      <div>
        <span className="text-sm font-medium">{label}</span>
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
      </div>
    </div>
  );
}

export default function SeoAnalysisCard({ analysis }: SeoAnalysisCardProps) {
  const t = analysis.technical;

  return (
    <div className="space-y-6">
      {/* SEO Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Checklist</CardTitle>
          <CardDescription>Zakladni SEO prvky a jejich stav</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-x-8">
            <div>
              <CheckItem
                ok={!!t.title}
                label="Title tag"
                detail={t.title ? `"${t.title}" (${t.titleLength || t.title.length} znaku)` : "Chybi"}
              />
              <CheckItem
                ok={!!t.description}
                label="Meta description"
                detail={t.description ? `${t.descriptionLength || t.description.length} znaku` : "Chybi"}
              />
              <CheckItem
                ok={t.hasH1 && t.h1Count === 1}
                label="H1 nadpis"
                detail={`${t.h1Count} ks`}
              />
              <CheckItem ok={!!t.hasCanonical} label="Canonical tag" detail={t.canonicalUrl || "Chybi"} />
              <CheckItem ok={t.hasSitemap} label="Sitemap.xml" />
              <CheckItem ok={t.hasRobotsTxt} label="Robots.txt" />
            </div>
            <div>
              <CheckItem ok={t.hasSSL} label="SSL/HTTPS" />
              <CheckItem ok={t.mobileResponsive} label="Viewport meta (mobilni)" />
              <CheckItem ok={t.schemaMarkup} label="Schema markup (JSON-LD)" />
              <CheckItem
                ok={!!t.headingHierarchyValid}
                label="Hierarchie nadpisu"
                detail={t.headingHierarchyValid ? "Spravna" : "Preskocene urovne"}
              />
              <CheckItem
                ok={t.imagesWithoutAlt === 0}
                label="Alt texty obrazku"
                detail={`${t.imagesWithoutAlt} z ${t.totalImages} bez ALT`}
              />
              <CheckItem
                ok={(t.hreflangTags?.length || 0) > 0}
                label="Hreflang tagy"
                detail={t.hreflangTags?.length ? t.hreflangTags.join(", ") : "Zadne"}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Title/Description Length Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Delka Title & Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Title ({t.titleLength || 0} znaku)</span>
              <span className="text-muted-foreground">Idealni: 50-60</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  (t.titleLength || 0) >= 50 && (t.titleLength || 0) <= 60
                    ? "bg-primary"
                    : (t.titleLength || 0) > 60
                    ? "bg-orange-500"
                    : "bg-yellow-500"
                }`}
                style={{ width: `${Math.min(100, ((t.titleLength || 0) / 70) * 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Description ({t.descriptionLength || 0} znaku)</span>
              <span className="text-muted-foreground">Idealni: 150-160</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  (t.descriptionLength || 0) >= 150 && (t.descriptionLength || 0) <= 160
                    ? "bg-primary"
                    : (t.descriptionLength || 0) > 160
                    ? "bg-orange-500"
                    : "bg-yellow-500"
                }`}
                style={{ width: `${Math.min(100, ((t.descriptionLength || 0) / 200) * 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keyword Density & Text/HTML Ratio */}
      <div className="grid md:grid-cols-2 gap-6">
        {t.keywordDensity && t.keywordDensity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top klicova slova</CardTitle>
              <CardDescription>Nejcastejsi slova v obsahu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {t.keywordDensity.slice(0, 8).map((kw, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{kw.word}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{kw.count}x</span>
                      <Badge variant="outline" className="text-xs">{kw.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Technicke metriky</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Text/HTML pomer</span>
                <span className="font-medium">{t.textHtmlRatio || 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Interni odkazy</span>
                <span className="font-medium">{t.internalLinks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Externi odkazy</span>
                <span className="font-medium">{t.externalLinks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Robots meta</span>
                <span className="font-medium">{t.robotsMeta || "Nenastaveno"}</span>
              </div>
              {t.structuredDataTypes && t.structuredDataTypes.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground">Schema typy:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {t.structuredDataTypes.map((type, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{type}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Headings Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Struktura nadpisu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            {(["h1", "h2", "h3", "h4", "h5", "h6"] as const).map((h) => (
              <div key={h} className="text-center p-3 bg-muted rounded-lg">
                <div className="text-xs text-muted-foreground uppercase font-medium">{h}</div>
                <div className="text-xl font-bold mt-1">
                  {t.headingsStructure[h]}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
