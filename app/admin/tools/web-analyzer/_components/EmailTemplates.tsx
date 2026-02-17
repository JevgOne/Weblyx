"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Copy } from "lucide-react";
import { WebAnalysisResult } from "@/types/cms";

interface Props {
  analysis: WebAnalysisResult & {
    proposalEmail?: string;
    proposalSubject?: string;
    primaryIssue?: string;
    emailTemplates?: Record<string, string>;
    emailSubjects?: Record<string, string>;
  };
}

export default function EmailTemplates({ analysis }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("auto");
  const [emailCopied, setEmailCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const currentEmail =
    selectedTemplate === "auto"
      ? analysis.proposalEmail
      : analysis.emailTemplates?.[selectedTemplate];

  const currentSubject =
    selectedTemplate === "auto"
      ? analysis.proposalSubject
      : analysis.emailSubjects?.[selectedTemplate] || analysis.proposalSubject;

  if (!analysis.proposalEmail) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email templates s nabidkou
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Selector */}
        {analysis.emailTemplates && (
          <div className="space-y-3">
            <Label>Vyberte template:</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {[
                { key: "auto", label: "Automaticky", icon: "✨" },
                { key: "general", label: "Obecny", icon: "📄" },
                { key: "slowWeb", label: "Pomaly web", icon: "🐌" },
                { key: "badSEO", label: "Spatne SEO", icon: "🔍" },
                { key: "mobileIssues", label: "Mobilni", icon: "📱" },
                { key: "outdatedDesign", label: "Zastaraly", icon: "🎨" },
                { key: "followUp", label: "Follow-up", icon: "📧" },
              ].map(({ key, label, icon }) => (
                <Button
                  key={key}
                  variant={selectedTemplate === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTemplate(key)}
                  className="justify-start"
                >
                  {icon} {label}
                  {key === "auto" && analysis.primaryIssue && selectedTemplate === "auto" && (
                    <Badge className="ml-1 bg-primary-foreground text-primary text-xs">
                      {analysis.primaryIssue}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Email Subject */}
        {currentSubject && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Predmet emailu:</Label>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-background rounded border">
                <p className="font-semibold text-sm">{currentSubject}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(currentSubject)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Copy Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => currentEmail && copyToClipboard(currentEmail)}
          className="w-full"
        >
          <Copy className="h-4 w-4 mr-2" />
          {emailCopied ? "Zkopirovano!" : "Zkopirovat vybrany template"}
        </Button>

        {/* Email Content */}
        <pre className="whitespace-pre-wrap text-sm font-mono bg-background p-4 rounded border overflow-auto max-h-96">
          {currentEmail || "Template neni dostupny"}
        </pre>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Automaticky template se vybira podle hlavniho problemu webu.
          </p>
          {analysis.primaryIssue && (
            <p className="text-xs text-primary font-medium">
              Pro tento web byl automaticky vybran: <strong>{analysis.primaryIssue}</strong>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
