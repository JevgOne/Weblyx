"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { WebAnalysisResult } from "@/types/cms";

interface Props {
  analysis: WebAnalysisResult;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-primary";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
};

export default function ContentAccessibilityCard({ analysis }: Props) {
  const content = analysis.content;
  const acc = analysis.accessibility;
  const tech = analysis.technology;

  return (
    <div className="space-y-6">
      {/* Content Analysis */}
      {content && (
        <Card>
          <CardHeader>
            <CardTitle>Analyza obsahu</CardTitle>
            <CardDescription>Readability score a textove metriky</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pocet slov</p>
                <p className="text-2xl font-bold">{content.wordCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Readability</p>
                <p className={`text-2xl font-bold ${getScoreColor(content.readabilityScore)}`}>
                  {content.readabilityScore}/100
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Vety</p>
                <p className="text-2xl font-bold">{content.sentenceCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Odstavce</p>
                <p className="text-2xl font-bold">{content.paragraphCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {content.readabilityLevel === "very-easy" && "Velmi snadne"}
                {content.readabilityLevel === "easy" && "Snadne"}
                {content.readabilityLevel === "moderate" && "Stredni"}
                {content.readabilityLevel === "difficult" && "Tezke"}
                {content.readabilityLevel === "very-difficult" && "Velmi tezke"}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Prumer: {content.averageWordsPerSentence} slov/veta
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technology Stack */}
      {tech && (
        <Card>
          <CardHeader>
            <CardTitle>Detekovane technologie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {tech.platform && (
                  <div>
                    <p className="text-sm font-medium mb-2">Platforma/CMS</p>
                    <Badge>{tech.platform}</Badge>
                  </div>
                )}
                {tech.framework && (
                  <div>
                    <p className="text-sm font-medium mb-2">Framework</p>
                    <Badge variant="secondary">{tech.framework}</Badge>
                  </div>
                )}
                {tech.server && (
                  <div>
                    <p className="text-sm font-medium mb-2">Server</p>
                    <Badge variant="outline">{tech.server}</Badge>
                  </div>
                )}
              </div>
              {tech.libraries.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Knihovny</p>
                  <div className="flex flex-wrap gap-1">
                    {tech.libraries.map((lib, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{lib}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {tech.analytics.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Analytics & Marketing</p>
                  <div className="flex flex-wrap gap-1">
                    {tech.analytics.map((tool, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{tool}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {tech.fonts.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Fonty</p>
                  <div className="flex flex-wrap gap-1">
                    {tech.fonts.map((f, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accessibility */}
      {acc && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pristupnost (Accessibility)</CardTitle>
                <CardDescription>Kontrola pristupnosti pro uzivatele s postizenim</CardDescription>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(acc.accessibilityScore)}`}>
                {acc.accessibilityScore}/100
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-x-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm py-1">
                  {acc.htmlLangAttribute ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  <span>Lang atribut: {acc.htmlLangAttribute || "Chybi"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm py-1">
                  {acc.hasSkipNavigation ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  <span>Skip navigace</span>
                </div>
                <div className="flex items-center gap-2 text-sm py-1">
                  {acc.headingHierarchyValid ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  <span>Hierarchie nadpisu</span>
                </div>
                <div className="flex items-center gap-2 text-sm py-1">
                  {acc.emptyLinksCount === 0 ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  <span>Prazdne odkazy: {acc.emptyLinksCount}</span>
                </div>
                <div className="flex items-center gap-2 text-sm py-1">
                  {acc.emptyButtonsCount === 0 ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  <span>Prazdna tlacitka: {acc.emptyButtonsCount}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ARIA labels</span>
                  <span className="font-medium">{acc.ariaLabelsCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ARIA landmarks</span>
                  <span className="font-medium">{acc.ariaLandmarksCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Form inputs</span>
                  <span className="font-medium">{acc.formInputsTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Labels prirazene</span>
                  <span className="font-medium">{acc.formLabelsAssociated}/{acc.formInputsTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tabindex pouziti</span>
                  <span className="font-medium">{acc.tabindexUsage}</span>
                </div>
              </div>
            </div>
            {acc.issues.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">Zjistene problemy:</p>
                <ul className="space-y-1">
                  {acc.issues.map((issue, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <XCircle className="h-3 w-3 text-red-500 flex-shrink-0 mt-1" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
