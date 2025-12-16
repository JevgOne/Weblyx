"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Mail, Phone, Building2, Calendar, DollarSign, Trash2 } from "lucide-react";
import { AIDesignSuggestionCard } from "./AIDesignSuggestionCard";

interface LeadDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: any;
  onRefresh?: () => void;
  onLeadUpdate?: (updatedLead: any) => void;
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

export function LeadDetailDialog({ open, onOpenChange, lead, onRefresh, onLeadUpdate }: LeadDetailDialogProps) {
  const [currentLead, setCurrentLead] = useState(lead);
  const [generating, setGenerating] = useState(false);
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Update currentLead when lead prop changes
  useEffect(() => {
    setCurrentLead(lead);
  }, [lead]);

  const generateDesign = async () => {
    setGenerating(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/leads/${currentLead.id}/generate-design`, {
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
      const response = await fetch(`/api/leads/${currentLead.id}/generate-brief`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("✅ AI Brief úspěšně vygenerován!");

        // Fetch updated lead data immediately
        const leadsResponse = await fetch('/api/admin/leads');
        const leadsData = await leadsResponse.json();

        if (leadsData.success) {
          const updatedLead = leadsData.data.find((l: any) => l.id === currentLead.id);
          if (updatedLead) {
            setCurrentLead(updatedLead);
            if (onLeadUpdate) {
              onLeadUpdate(updatedLead);
            }
          }
        }

        // Also call parent refresh if provided
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

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/leads/${currentLead.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("✅ Lead úspěšně smazán!");
        // Close dialog after short delay
        setTimeout(() => {
          onOpenChange(false);
          if (onRefresh) {
            onRefresh();
          }
        }, 1500);
      } else {
        setError(data.error || "Mazání selhalo. Zkuste to znovu.");
        console.error("Failed to delete lead:", data);
      }
    } catch (error: any) {
      setError("Chyba spojení. Zkuste to znovu.");
      console.error("Error deleting lead:", error);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{currentLead.name}</DialogTitle>
              <DialogDescription>Detail poptávky</DialogDescription>
            </div>
            <Badge
              className={`${statusConfig[currentLead.status as keyof typeof statusConfig].color} text-white`}
            >
              {statusConfig[currentLead.status as keyof typeof statusConfig].label}
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
                <a href={`mailto:${currentLead.email}`} className="hover:text-primary">
                  {currentLead.email}
                </a>
              </div>

              {currentLead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${currentLead.phone}`} className="hover:text-primary">
                    {currentLead.phone}
                  </a>
                </div>
              )}

              {currentLead.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{currentLead.company}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Vytvořeno: {new Date(currentLead.createdAt || currentLead.created).toLocaleDateString("cs-CZ")}
                </span>
              </div>

              {currentLead.budgetRange && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Rozpočet: {currentLead.budgetRange}</span>
                </div>
              )}

              {currentLead.projectType && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Typ projektu: </span>
                  <Badge variant="outline">{currentLead.projectType}</Badge>
                </div>
              )}

              {currentLead.timeline && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Termín: </span>
                  <span>{currentLead.timeline}</span>
                </div>
              )}
            </div>
          </div>

          {/* Business Description */}
          {currentLead.businessDescription && (
            <div className="space-y-2">
              <h4 className="font-semibold">Popis byznysu</h4>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{currentLead.businessDescription}</p>
              </div>
            </div>
          )}

          {/* NEW: Extended Business Info */}
          {(currentLead.industry || currentLead.companySize || currentLead.existingWebsite) && (
            <div className="space-y-2">
              <h4 className="font-semibold">Informace o firmě</h4>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                {currentLead.industry && (
                  <div className="text-sm">
                    <span className="font-medium">Odvětví: </span>
                    <span>{currentLead.industry}</span>
                  </div>
                )}
                {currentLead.companySize && (
                  <div className="text-sm">
                    <span className="font-medium">Velikost firmy: </span>
                    <span>{currentLead.companySize} zaměstnanců</span>
                  </div>
                )}
                {currentLead.existingWebsite && (
                  <div className="text-sm">
                    <span className="font-medium">Existující web: </span>
                    <a
                      href={currentLead.existingWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {currentLead.existingWebsite}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Project Details */}
          {currentLead.projectDetails && Object.keys(currentLead.projectDetails).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Detaily projektu</h4>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                {Object.entries(currentLead.projectDetails).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {currentLead.features && Array.isArray(currentLead.features) && currentLead.features.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Požadované funkce</h4>
              <div className="flex flex-wrap gap-2">
                {currentLead.features.map((feature: string, idx: number) => (
                  <Badge key={idx} variant="secondary">{feature}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Design Preferences */}
          {currentLead.designPreferences && Object.keys(currentLead.designPreferences).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Designové preference</h4>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                {Object.entries(currentLead.designPreferences).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEW: Marketing & Technical Requirements */}
          {currentLead.marketingTech && (
            <div className="space-y-2">
              <h4 className="font-semibold">Marketing & Technické požadavky</h4>
              <div className="bg-muted p-4 rounded-lg space-y-3">
                {/* Tracking */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Tracking:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentLead.marketingTech.needsAnalytics && <Badge variant="secondary">Google Analytics</Badge>}
                    {currentLead.marketingTech.needsFacebookPixel && <Badge variant="secondary">Facebook Pixel</Badge>}
                    {currentLead.marketingTech.needsGoogleAds && <Badge variant="secondary">Google Ads</Badge>}
                  </div>
                </div>
                {/* Integrations */}
                {currentLead.marketingTech.integrations && currentLead.marketingTech.integrations.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Integrace:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentLead.marketingTech.integrations.map((integration: string, idx: number) => (
                        <Badge key={idx} variant="outline">{integration}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {/* Languages */}
                {currentLead.marketingTech.languages && currentLead.marketingTech.languages.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Jazyky:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentLead.marketingTech.languages.map((lang: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Design Suggestion */}
          {currentLead.aiDesignSuggestion ? (
            <AIDesignSuggestionCard
              suggestion={currentLead.aiDesignSuggestion}
              leadId={currentLead.id}
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

            {currentLead.aiBrief ? (
              <div className="border rounded-lg p-6 space-y-4 bg-muted/30">
                {/* Project Overview */}
                {currentLead.aiBrief.projectOverview && (
                  <div>
                    <h5 className="font-semibold text-sm text-muted-foreground mb-2">PROJECT OVERVIEW</h5>
                    <h6 className="font-bold text-lg mb-2">{currentLead.aiBrief.projectOverview.title}</h6>
                    <p className="text-sm mb-3">{currentLead.aiBrief.projectOverview.summary}</p>
                    {currentLead.aiBrief.projectOverview.businessGoals && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Business Goals:</p>
                        <ul className="text-sm list-disc list-inside space-y-1">
                          {currentLead.aiBrief.projectOverview.businessGoals.map((goal: string, idx: number) => (
                            <li key={idx}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Implementation Prompt */}
                {currentLead.aiBrief.aiImplementationPrompt && (
                  <div>
                    <h5 className="font-semibold text-sm text-muted-foreground mb-2">AI IMPLEMENTATION PROMPT</h5>
                    <div className="bg-background p-4 rounded border font-mono text-xs overflow-x-auto">
                      <pre className="whitespace-pre-wrap">{currentLead.aiBrief.aiImplementationPrompt}</pre>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        navigator.clipboard.writeText(currentLead.aiBrief.aiImplementationPrompt);
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

                {currentLead.briefGeneratedAt && (
                  <p className="text-xs text-muted-foreground">
                    Vygenerováno: {new Date(
                      typeof currentLead.briefGeneratedAt === 'number'
                        ? currentLead.briefGeneratedAt * 1000
                        : currentLead.briefGeneratedAt.seconds
                        ? currentLead.briefGeneratedAt.seconds * 1000
                        : currentLead.briefGeneratedAt
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

          {/* Delete Section */}
          <div className="pt-6 border-t mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-destructive">Danger Zone</h4>
                <p className="text-sm text-muted-foreground">
                  Smazat tento lead trvale z databáze
                </p>
              </div>
              <Button
                variant={confirmDelete ? "destructive" : "outline"}
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className={confirmDelete ? "" : "text-destructive hover:bg-destructive hover:text-destructive-foreground"}
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mažu...
                  </>
                ) : confirmDelete ? (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Potvrdit smazání
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Smazat Lead
                  </>
                )}
              </Button>
            </div>
            {confirmDelete && !deleting && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Klikněte znovu pro potvrzení. Tato akce je nevratná!
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
