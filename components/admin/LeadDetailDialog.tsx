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
import { Sparkles, Loader2, Mail, Phone, Building2, Calendar, DollarSign, Trash2, User, UserCheck, ClipboardList, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AIDesignSuggestionCard } from "./AIDesignSuggestionCard";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";

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

const ADMIN_USERS = [
  { id: 'admin-1', name: 'Admin', email: 'admin@weblyx.cz' },
  { id: 'admin-2', name: 'Zen', email: 'zvin.a@seznam.cz' },
  { id: 'admin-3', name: 'Filip', email: 'filip@weblyx.com' },
];

// Helper function to parse AI Brief from rawResponse
function parseAIBrief(aiBrief: any) {
  if (!aiBrief) return null;

  // If it's already parsed correctly, return it
  if (aiBrief.projectOverview || aiBrief.targetAudience) {
    return aiBrief;
  }

  // If it has rawResponse, parse it
  if (aiBrief.rawResponse) {
    try {
      // Remove markdown code block wrappers (```json ... ```)
      let jsonString = aiBrief.rawResponse.trim();
      jsonString = jsonString.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');

      // Parse the JSON
      const parsed = JSON.parse(jsonString);
      return parsed;
    } catch (error) {
      console.error('Failed to parse AI Brief rawResponse:', error);
      return null;
    }
  }

  return null;
}

export function LeadDetailDialog({ open, onOpenChange, lead, onRefresh, onLeadUpdate }: LeadDetailDialogProps) {
  const { user } = useAdminAuth();
  const [currentLead, setCurrentLead] = useState(lead);
  const [generating, setGenerating] = useState(false);
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [assignedToId, setAssignedToId] = useState<string>(lead.assignedTo || "");
  const [updatingAssignment, setUpdatingAssignment] = useState(false);
  const [takingLead, setTakingLead] = useState(false);

  // Task creation state
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [taskBrief, setTaskBrief] = useState("");
  const [taskKwAnalysis, setTaskKwAnalysis] = useState("");
  const [taskAssignedTo, setTaskAssignedTo] = useState("");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [creatingTask, setCreatingTask] = useState(false);

  // Update currentLead when lead prop changes
  useEffect(() => {
    setCurrentLead(lead);
    setAssignedToId(lead.assignedTo || "");
  }, [lead]);

  // Load specialists for task assignment
  useEffect(() => {
    const loadSpecialists = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          const specs = data.users?.filter((u: any) => u.role === 'specialist' && u.active) || [];
          setSpecialists(specs);
        }
      } catch (error) {
        console.error('Failed to load specialists:', error);
      }
    };
    loadSpecialists();
  }, []);

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

  const handleUpdateAssignment = async (adminId: string) => {
    if (!adminId) return;

    setUpdatingAssignment(true);
    setError(null);
    setSuccess(null);

    const selectedAdmin = ADMIN_USERS.find(a => a.id === adminId);

    try {
      const response = await fetch(`/api/admin/leads`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId: currentLead.id,
          updates: {
            assignedTo: adminId,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`✅ Lead přiřazen uživateli ${selectedAdmin?.name}`);
        setCurrentLead({ ...currentLead, assignedTo: adminId });
        setAssignedToId(adminId);

        if (onLeadUpdate) {
          onLeadUpdate({ ...currentLead, assignedTo: adminId });
        }

        if (onRefresh) {
          await onRefresh();
        }
      } else {
        setError(data.error || "Update přiřazení selhal. Zkuste to znovu.");
      }
    } catch (error: any) {
      setError("Chyba spojení. Zkuste to znovu.");
      console.error("Error updating assignment:", error);
    } finally {
      setUpdatingAssignment(false);
    }
  };

  const handleTakeLead = async () => {
    if (!user) return;

    if (!confirm(`Chcete převést poptávku "${currentLead.name}" na projekt a přiřadit si ji?`)) {
      return;
    }

    setTakingLead(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/leads/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: currentLead.id,
          adminId: user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.error || 'Chyba při převodu poptávky');
        return;
      }

      const result = await response.json();

      setSuccess(`✅ Poptávka převedena na projekt!\n\nMůžete ji najít v Projekty → ID: ${result.project.id}`);

      // Refresh and close after delay
      setTimeout(() => {
        if (onRefresh) {
          onRefresh();
        }
        onOpenChange(false);
      }, 2000);

    } catch (error) {
      console.error('❌ Error taking lead:', error);
      setError('Chyba při převodu poptávky');
    } finally {
      setTakingLead(false);
    }
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

  // Create task for specialist
  const handleCreateTask = async () => {
    if (!taskBrief.trim()) {
      setError("Zadejte Brief pro úkol");
      return;
    }

    setCreatingTask(true);
    setError(null);
    setSuccess(null);

    try {
      // Build complete task description
      let description = `## Brief\n${taskBrief}`;
      if (taskKwAnalysis.trim()) {
        description += `\n\n## Klíčová slova & SEO\n${taskKwAnalysis}`;
      }

      // Add lead info
      description += `\n\n---\n**Kontakt:** ${currentLead.name}`;
      if (currentLead.company) description += ` (${currentLead.company})`;
      if (currentLead.email) description += `\n**Email:** ${currentLead.email}`;
      if (currentLead.phone) description += `\n**Tel:** ${currentLead.phone}`;
      if (currentLead.budgetRange) description += `\n**Rozpočet:** ${currentLead.budgetRange}`;

      const actualAssignedTo = taskAssignedTo === 'unassigned' ? null : taskAssignedTo;
      const specialist = specialists.find(s => s.id === actualAssignedTo);

      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${currentLead.projectType || 'Web'}: ${currentLead.company || currentLead.name}`,
          description,
          domain: currentLead.existingWebsite || '',
          assigned_to: actualAssignedTo,
          assigned_to_name: specialist?.name || null,
          priority: taskPriority,
          source_analysis_id: `lead-${currentLead.id}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        // Update lead status to converted
        await fetch(`/api/admin/leads`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId: currentLead.id,
            updates: { status: 'converted' },
          }),
        });

        setSuccess(`✅ Úkol vytvořen! ${specialist ? `Přiřazen: ${specialist.name}` : 'Nepřiřazeno'}`);

        // Clear form
        setTaskBrief("");
        setTaskKwAnalysis("");
        setTaskAssignedTo("");
        setTaskPriority("medium");

        // Refresh
        if (onRefresh) {
          setTimeout(() => onRefresh(), 1500);
        }
      } else {
        const err = await res.json();
        setError(err.error || "Chyba při vytváření úkolu");
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setError("Chyba připojení. Zkuste to znovu.");
    } finally {
      setCreatingTask(false);
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

          {/* Assignment Section */}
          <div className="space-y-4 bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-900/20 p-6 rounded-lg border-2 border-teal-200 dark:border-teal-800">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <UserCheck className="h-5 w-5 text-teal-600" />
                Přiřazení projektu
              </Label>
              {currentLead.status === 'new' && (
                <Badge variant="destructive" className="animate-pulse">
                  🚨 Nová
                </Badge>
              )}
            </div>

            {/* Take Lead Button - Only for new leads */}
            {currentLead.status === 'new' && user && (
              <Button
                onClick={handleTakeLead}
                disabled={takingLead}
                size="lg"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-xl transition-all"
              >
                {takingLead ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Převádím na projekt...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-5 w-5 mr-2" />
                    🚨 Vzít poptávku a převést na projekt
                  </>
                )}
              </Button>
            )}

            {/* Divider */}
            {currentLead.status === 'new' && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-teal-300 dark:border-teal-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-teal-50 dark:bg-teal-950/20 px-2 text-teal-600 dark:text-teal-400">
                    nebo přiřadit kolegovi
                  </span>
                </div>
              </div>
            )}

            {/* Assign to Colleague */}
            <div className="space-y-3">
              <Label htmlFor="assignedTo" className="text-sm text-muted-foreground">
                Přiřadit konkrétnímu adminovi:
              </Label>
              <div className="flex gap-2">
                <Select
                  value={assignedToId}
                  onValueChange={(value) => {
                    setAssignedToId(value);
                    handleUpdateAssignment(value);
                  }}
                  disabled={updatingAssignment}
                >
                  <SelectTrigger className="flex-1 bg-white dark:bg-gray-900">
                    <SelectValue placeholder="Vyberte admina..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_USERS.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{admin.name}</span>
                          <span className="text-xs text-muted-foreground">({admin.email})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {currentLead.assignedTo && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="gap-1">
                    <UserCheck className="h-3 w-3" />
                    {ADMIN_USERS.find(a => a.id === currentLead.assignedTo)?.name || currentLead.assignedTo}
                  </Badge>
                  <span className="text-muted-foreground">je přiřazen k této poptávce</span>
                </div>
              )}
            </div>
          </div>

          {/* CREATE TASK SECTION - Main workflow */}
          {currentLead.status !== 'converted' && (
            <div className="space-y-4 bg-gradient-to-r from-purple-50 to-violet-100 dark:from-purple-950/20 dark:to-violet-900/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <ClipboardList className="h-5 w-5 text-purple-600" />
                  Vytvořit úkol pro specialistu
                </Label>
                <a
                  href="https://claude.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Otevřít Claude
                </a>
              </div>

              <p className="text-sm text-muted-foreground">
                Vygenerujte Brief a KW analýzu v Claude a vložte je sem. Pak vytvořte úkol pro specialistu.
              </p>

              {/* Brief Field */}
              <div className="space-y-2">
                <Label htmlFor="taskBrief" className="text-sm font-medium">
                  1. Brief (zadání projektu) *
                </Label>
                <Textarea
                  id="taskBrief"
                  placeholder="Sem vložte vygenerovaný Brief z Claude...

Např: Vytvořit moderní webovou prezentaci pro kadeřnický salon. Hlavní cíl: zvýšit online rezervace o 30%. Design: čistý, minimalistický, ženská cílová skupina..."
                  className="min-h-[150px] bg-white dark:bg-gray-900"
                  value={taskBrief}
                  onChange={(e) => setTaskBrief(e.target.value)}
                />
              </div>

              {/* KW Analysis Field */}
              <div className="space-y-2">
                <Label htmlFor="taskKwAnalysis" className="text-sm font-medium">
                  2. Klíčová slova & SEO analýza (volitelné)
                </Label>
                <Textarea
                  id="taskKwAnalysis"
                  placeholder="Sem vložte výsledky KW analýzy z Claude...

Např: Hlavní KW: kadeřnictví Praha (2400 hledání/měs), dámské střihy (1900), barvení vlasů..."
                  className="min-h-[120px] bg-white dark:bg-gray-900"
                  value={taskKwAnalysis}
                  onChange={(e) => setTaskKwAnalysis(e.target.value)}
                />
              </div>

              {/* Assignment and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Přiřadit specialistovi</Label>
                  <Select
                    value={taskAssignedTo}
                    onValueChange={setTaskAssignedTo}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-900">
                      <SelectValue placeholder="Vybrat specialistu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Nepřiřazeno</SelectItem>
                      {specialists.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Priorita</Label>
                  <Select
                    value={taskPriority}
                    onValueChange={(v) => setTaskPriority(v as any)}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Nízká</SelectItem>
                      <SelectItem value="medium">Střední</SelectItem>
                      <SelectItem value="high">Vysoká</SelectItem>
                      <SelectItem value="urgent">Urgentní</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Create Task Button */}
              <Button
                onClick={handleCreateTask}
                disabled={creatingTask || !taskBrief.trim()}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-bold shadow-lg hover:shadow-xl transition-all"
              >
                {creatingTask ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Vytvářím úkol...
                  </>
                ) : (
                  <>
                    <ClipboardList className="h-5 w-5 mr-2" />
                    Vytvořit úkol pro specialistu
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Already converted notice */}
          {currentLead.status === 'converted' && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <UserCheck className="h-5 w-5" />
                <span className="font-medium">Tato poptávka již byla převedena na úkol.</span>
              </div>
            </div>
          )}

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

            {(() => {
              const parsedBrief = parseAIBrief(currentLead.aiBrief);
              return parsedBrief ? (
              <div className="border rounded-lg p-6 space-y-4 bg-muted/30">
                {/* Project Overview */}
                {parsedBrief.projectOverview && (
                  <div>
                    <h5 className="font-semibold text-sm text-muted-foreground mb-2">PROJECT OVERVIEW</h5>
                    <h6 className="font-bold text-lg mb-2">{parsedBrief.projectOverview.title}</h6>
                    <p className="text-sm mb-3">{parsedBrief.projectOverview.summary}</p>
                    {parsedBrief.projectOverview.businessGoals && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Business Goals:</p>
                        <ul className="text-sm list-disc list-inside space-y-1">
                          {parsedBrief.projectOverview.businessGoals.map((goal: string, idx: number) => (
                            <li key={idx}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Implementation Prompt */}
                {parsedBrief.aiImplementationPrompt && (
                  <div>
                    <h5 className="font-semibold text-sm text-muted-foreground mb-2">AI IMPLEMENTATION PROMPT</h5>
                    <div className="bg-background p-4 rounded border font-mono text-xs overflow-x-auto">
                      <pre className="whitespace-pre-wrap">{parsedBrief.aiImplementationPrompt}</pre>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        navigator.clipboard.writeText(parsedBrief.aiImplementationPrompt);
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
            );
            })()}
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
