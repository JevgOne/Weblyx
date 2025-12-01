"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Mail, Phone, Building2, Calendar, DollarSign } from "lucide-react";
import { AIDesignSuggestionCard } from "./AIDesignSuggestionCard";

interface LeadDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: any;
  onRefresh?: () => void;
}

const statusConfig = {
  new: { label: "Nová", color: "bg-red-500" },
  contacted: { label: "Kontaktován", color: "bg-blue-500" },
  quoted: { label: "Nabídka odeslána", color: "bg-yellow-500" },
  approved: { label: "Schváleno", color: "bg-cyan-500" },
  converted: { label: "Převedeno na projekt", color: "bg-primary" },
  rejected: { label: "Zamítnuto", color: "bg-gray-500" },
  paused: { label: "Pozastaveno", color: "bg-orange-500" },
};

export function LeadDetailDialog({ open, onOpenChange, lead, onRefresh }: LeadDetailDialogProps) {
  const [generating, setGenerating] = useState(false);
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const generateDesign = async () => {
    setGenerating(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/leads/${lead.id}/generate-design`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("✅ AI návrh designu úspěšně vygenerován!");
        // Success - refresh lead data
        if (onRefresh) {
          await onRefresh();
        }
      } else {
        setError(data.error || "Generování selhalo. Zkuste to znovu.");
        console.error("Failed to generate design:", data);
      }
    } catch (error: any) {
      setError("Chyba spojení. Zkuste to znovu.");
      console.error("Error generating design:", error);
    } finally {
      setGenerating(false);
    }
  };

  const generateBrief = async () => {
    setGeneratingBrief(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/leads/${lead.id}/generate-brief`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("✅ AI Brief úspěšně vygenerován!");
        // Success - refresh lead data
        if (onRefresh) {
          await onRefresh();
        }
      } else {
        setError(data.error || "Generování brief selhalo. Zkuste to znovu.");
        console.error("Failed to generate brief:", data);
      }
    } catch (error: any) {
      setError("Chyba spojení. Zkuste to znovu.");
      console.error("Error generating brief:", error);
    } finally {
      setGeneratingBrief(false);
    }
  };

  const handleRegenerate = async () => {
    await generateDesign();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{lead.name}</DialogTitle>
              <DialogDescription>Detail poptávky</DialogDescription>
            </div>
            <Badge
              className={`${statusConfig[lead.status as keyof typeof statusConfig].color} text-white`}
            >
              {statusConfig[lead.status as keyof typeof statusConfig].label}
            </Badge>
          </div>
        </DialogHeader>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${lead.email}`} className="hover:text-primary">
                  {lead.email}
                </a>
              </div>

              {lead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${lead.phone}`} className="hover:text-primary">
                    {lead.phone}
                  </a>
                </div>
              )}

              {lead.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.company}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Vytvořeno: {new Date(lead.createdAt || lead.created).toLocaleDateString("cs-CZ")}
                </span>
              </div>

              {lead.budgetRange && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Rozpočet: {lead.budgetRange}</span>
                </div>
              )}

              {lead.projectType && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Typ projektu: </span>
                  <Badge variant="outline">{lead.projectType}</Badge>
                </div>
              )}

              {lead.timeline && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Termín: </span>
                  <span>{lead.timeline}</span>
                </div>
              )}
            </div>
          </div>

          {/* Business Description */}
          {lead.businessDescription && (
            <div className="space-y-2">
              <h4 className="font-semibold">Popis byznysu</h4>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{lead.businessDescription}</p>
              </div>
            </div>
          )}

          {/* Project Details */}
          {lead.projectDetails && Object.keys(lead.projectDetails).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Detaily projektu</h4>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                {Object.entries(lead.projectDetails).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {lead.features && Array.isArray(lead.features) && lead.features.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Požadované funkce</h4>
              <div className="flex flex-wrap gap-2">
                {lead.features.map((feature: string, idx: number) => (
                  <Badge key={idx} variant="secondary">{feature}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Design Preferences */}
          {lead.designPreferences && Object.keys(lead.designPreferences).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Designové preference</h4>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                {Object.entries(lead.designPreferences).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Design Suggestion */}
          {lead.aiDesignSuggestion ? (
            <AIDesignSuggestionCard
              suggestion={lead.aiDesignSuggestion}
              leadId={lead.id}
              onRegenerate={handleRegenerate}
            />
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-semibold mb-2">Žádný AI návrh</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Pro tento lead ještě nebyl vygenerován AI design návrh.
              </p>
              <Button variant="outline" onClick={generateDesign} disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generuji...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Vygenerovat AI návrh
                  </>
                )}
              </Button>
            </div>
          )}

          {/* AI Project Brief */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Project Brief
            </h4>

            {lead.aiBrief ? (
              <div className="border rounded-lg p-6 space-y-4 bg-muted/30">
                {/* Project Overview */}
                {lead.aiBrief.projectOverview && (
                  <div>
                    <h5 className="font-semibold text-sm text-muted-foreground mb-2">PROJECT OVERVIEW</h5>
                    <h6 className="font-bold text-lg mb-2">{lead.aiBrief.projectOverview.title}</h6>
                    <p className="text-sm mb-3">{lead.aiBrief.projectOverview.summary}</p>
                    {lead.aiBrief.projectOverview.businessGoals && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Business Goals:</p>
                        <ul className="text-sm list-disc list-inside space-y-1">
                          {lead.aiBrief.projectOverview.businessGoals.map((goal: string, idx: number) => (
                            <li key={idx}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Implementation Prompt */}
                {lead.aiBrief.aiImplementationPrompt && (
                  <div>
                    <h5 className="font-semibold text-sm text-muted-foreground mb-2">AI IMPLEMENTATION PROMPT</h5>
                    <div className="bg-background p-4 rounded border font-mono text-xs overflow-x-auto">
                      <pre className="whitespace-pre-wrap">{lead.aiBrief.aiImplementationPrompt}</pre>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        navigator.clipboard.writeText(lead.aiBrief.aiImplementationPrompt);
                      }}
                    >
                      📋 Copy Prompt
                    </Button>
                  </div>
                )}

                {/* Regenerate Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={generateBrief}
                  disabled={generatingBrief}
                >
                  {generatingBrief ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Regeneruji...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Regenerovat Brief
                    </>
                  )}
                </Button>

                {lead.briefGeneratedAt && (
                  <p className="text-xs text-muted-foreground">
                    Vygenerováno: {new Date(
                      typeof lead.briefGeneratedAt === 'number'
                        ? lead.briefGeneratedAt * 1000
                        : lead.briefGeneratedAt.seconds
                        ? lead.briefGeneratedAt.seconds * 1000
                        : lead.briefGeneratedAt
                    ).toLocaleString('cs-CZ')}
                  </p>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="font-semibold mb-2">Žádný AI Project Brief</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Pro tento lead ještě nebyl vygenerován strukturovaný project brief pro AI nástroje.
                </p>
                <Button variant="outline" onClick={generateBrief} disabled={generatingBrief}>
                  {generatingBrief ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generuji...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Vygenerovat AI Brief
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
