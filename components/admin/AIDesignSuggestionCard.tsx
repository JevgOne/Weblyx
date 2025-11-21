"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Copy, RefreshCw, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { AIDesignSuggestion } from "@/types/ai-design";

interface AIDesignSuggestionCardProps {
  suggestion: AIDesignSuggestion;
  leadId: string;
  onRegenerate?: () => void;
}

export function AIDesignSuggestionCard({
  suggestion,
  leadId,
  onRegenerate
}: AIDesignSuggestionCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>AI Design Návrh</CardTitle>
          <Badge variant="outline">Automaticky vygenerováno</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Color Palette */}
        <div>
          <h4 className="font-semibold mb-2">Barevné schéma</h4>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(suggestion.colorPalette).map(([name, color]) => (
              <div key={name} className="text-center">
                <div
                  className="w-12 h-12 rounded-lg border shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <p className="text-xs mt-1 capitalize">{name}</p>
                <code className="text-xs text-muted-foreground">{color}</code>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div>
          <h4 className="font-semibold mb-2">Typografie</h4>
          <div className="space-y-1">
            <p>Nadpisy: <code className="text-sm bg-muted px-2 py-1 rounded">{suggestion.typography.headingFont}</code></p>
            <p>Text: <code className="text-sm bg-muted px-2 py-1 rounded">{suggestion.typography.bodyFont}</code></p>
          </div>
        </div>

        {/* Content Suggestions */}
        <div>
          <h4 className="font-semibold mb-2">Návrhy textů</h4>
          <div className="space-y-2 bg-muted p-4 rounded-lg">
            <div>
              <span className="text-sm font-medium">Headline:</span>
              <p className="text-lg">{suggestion.contentSuggestions.headline}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Tagline:</span>
              <p>{suggestion.contentSuggestions.tagline}</p>
            </div>
            <div>
              <span className="text-sm font-medium">CTA:</span>
              <p>{suggestion.contentSuggestions.ctaPrimary}</p>
            </div>
          </div>
        </div>

        {/* Layout Suggestions */}
        <div>
          <h4 className="font-semibold mb-2">Doporučená struktura</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestion.layoutSuggestions.sections.map((section, i) => (
              <div key={i} className="border rounded p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{section.name}</span>
                  <Badge variant={
                    section.priority === "high" ? "default" :
                    section.priority === "medium" ? "secondary" :
                    "outline"
                  }>{section.priority}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Style Guidelines */}
        <div>
          <h4 className="font-semibold mb-2">Styl</h4>
          <div className="flex gap-2">
            <Badge>{suggestion.styleGuidelines.mood}</Badge>
            <Badge variant="outline">{suggestion.styleGuidelines.imageStyle}</Badge>
          </div>
        </div>

        {/* Technical Recommendations */}
        <div>
          <h4 className="font-semibold mb-2">Doporučené funkce</h4>
          <div className="flex flex-wrap gap-2">
            {suggestion.technicalRecommendations.recommendedFeatures.map((feature, i) => (
              <Badge key={i} variant="secondary">{feature}</Badge>
            ))}
          </div>
        </div>

        {/* Inspiration References */}
        {suggestion.inspirationReferences.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Inspirace</h4>
            <div className="space-y-2">
              {suggestion.inspirationReferences.map((ref, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ExternalLink className="h-4 w-4 mt-1 flex-shrink-0" />
                  <div>
                    <a href={ref.url} target="_blank" rel="noopener noreferrer"
                       className="text-primary hover:underline text-sm">
                      {ref.url}
                    </a>
                    <p className="text-sm text-muted-foreground">{ref.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Implementation Notes */}
        <div>
          <h4 className="font-semibold mb-2">Poznámky pro implementaci</h4>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-primary">Priority:</span>
              <ul className="list-disc list-inside text-sm">
                {suggestion.implementationNotes.priorities.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
            {suggestion.implementationNotes.niceToHave.length > 0 && (
              <div>
                <span className="text-sm font-medium text-blue-600">Nice-to-have:</span>
                <ul className="list-disc list-inside text-sm">
                  {suggestion.implementationNotes.niceToHave.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
            {suggestion.implementationNotes.challenges.length > 0 && (
              <div>
                <span className="text-sm font-medium text-amber-600">Potenciální výzvy:</span>
                <ul className="list-disc list-inside text-sm">
                  {suggestion.implementationNotes.challenges.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={() => copyToClipboard(JSON.stringify(suggestion, null, 2))}
            variant="outline"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? "Zkopírováno!" : "Kopírovat jako JSON"}
          </Button>
          {onRegenerate && (
            <Button variant="outline" onClick={onRegenerate}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerovat návrh
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
