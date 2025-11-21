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

  const generateDesign = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/generate-design`, {
        method: "POST",
      });

      if (response.ok) {
        // Success - refresh lead data
        if (onRefresh) {
          onRefresh();
        }
      } else {
        console.error("Failed to generate design");
      }
    } catch (error) {
      console.error("Error generating design:", error);
    } finally {
      setGenerating(false);
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
                  Vytvořeno: {new Date(lead.created).toLocaleDateString("cs-CZ")}
                </span>
              </div>

              {lead.budget && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Rozpočet: {lead.budget}</span>
                </div>
              )}

              {lead.projectType && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Typ projektu: </span>
                  <Badge variant="outline">{lead.projectType}</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          {lead.message && (
            <div className="space-y-2">
              <h4 className="font-semibold">Zpráva od klienta</h4>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{lead.message}</p>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
