"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Info, Package, CheckCircle2 } from "lucide-react";
import { WebAnalysisResult } from "@/types/cms";

interface Props {
  analysis: WebAnalysisResult;
}

export default function IssuesList({ analysis }: Props) {
  return (
    <div className="space-y-6">
      {/* Package Recommendation */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Doporuceny balicek
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-primary">{analysis.recommendation.packageName}</h3>
                <p className="text-sm text-muted-foreground">Shoda: {analysis.recommendation.confidence}%</p>
              </div>
              <Badge variant="default" className="text-lg px-4 py-2">
                {analysis.recommendation.packageId.toUpperCase()}
              </Badge>
            </div>
            <Separator />
            <div>
              <p className="font-medium mb-2">Zduvodneni:</p>
              <p className="text-muted-foreground">{analysis.recommendation.reasoning}</p>
            </div>
            <div>
              <p className="font-medium mb-2">Vyresi:</p>
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

      {/* Issues List */}
      {analysis.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Identifikovane problemy</CardTitle>
            <CardDescription>
              Celkem {analysis.issues.length} problemu
              ({analysis.issueCount.critical} kritickych, {analysis.issueCount.warning} varovani, {analysis.issueCount.info} info)
            </CardDescription>
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
                        <Badge variant={issue.category === "critical" ? "destructive" : "secondary"}>
                          {issue.category === "critical" ? "Kriticke" : issue.category === "warning" ? "Varovani" : "Info"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                      <div className="space-y-1">
                        <p className="text-sm"><span className="font-medium">Dopad:</span> {issue.impact}</p>
                        <p className="text-sm"><span className="font-medium">Reseni:</span> {issue.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
