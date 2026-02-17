"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function PerformanceSecurityCard({ analysis }: Props) {
  const perf = analysis.performance;
  const sec = analysis.security;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Performance */}
      {perf && (
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(perf.estimatedScore)}`}>
                  {perf.estimatedScore}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Odhadovane skore</p>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Celkem zdroju</span>
                  <span className="font-medium">{perf.totalResources}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Odhadovana velikost</span>
                  <span className="font-medium">
                    {perf.totalResourcesSize > 1024
                      ? `${(perf.totalResourcesSize / 1024).toFixed(1)} MB`
                      : `${perf.totalResourcesSize} KB`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Komprese (gzip/brotli)</span>
                  <span>{perf.hasCompression ? <CheckCircle2 className="h-4 w-4 text-primary inline" /> : <XCircle className="h-4 w-4 text-red-500 inline" />}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cache headers</span>
                  <span>{perf.hasCaching ? <CheckCircle2 className="h-4 w-4 text-primary inline" /> : <XCircle className="h-4 w-4 text-red-500 inline" />}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Velke obrazky</span>
                  <span className="font-medium">{perf.largeImages}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cas nacteni</span>
                  <span className="font-medium">{analysis.technical.loadTime}ms</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security */}
      {sec && (
        <Card>
          <CardHeader>
            <CardTitle>Bezpecnost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(sec.securityScore)}`}>
                  {sec.securityScore}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Security skore</p>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-medium">Security Headers:</p>
                <div className="space-y-2">
                  {[
                    { key: "strictTransportSecurity", label: "Strict-Transport-Security (HSTS)" },
                    { key: "contentSecurityPolicy", label: "Content-Security-Policy (CSP)" },
                    { key: "xFrameOptions", label: "X-Frame-Options" },
                    { key: "xContentTypeOptions", label: "X-Content-Type-Options" },
                    { key: "referrerPolicy", label: "Referrer-Policy" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      {sec.headers[key as keyof typeof sec.headers] ? (
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">HTTPS redirect</span>
                    <span>{sec.httpsRedirect ? <CheckCircle2 className="h-4 w-4 text-primary inline" /> : <XCircle className="h-4 w-4 text-red-500 inline" />}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mixed content</span>
                    <span>{!sec.mixedContent ? <CheckCircle2 className="h-4 w-4 text-primary inline" /> : <XCircle className="h-4 w-4 text-red-500 inline" />}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
