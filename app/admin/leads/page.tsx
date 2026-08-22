"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Search, Filter, Mail, Phone, Building2, Calendar, ArrowRight, Sparkles, User, UserCheck } from "lucide-react";
import { ConvertLeadDialog } from "@/components/admin/ConvertLeadDialog";
import { LeadDetailDialog } from "@/components/admin/LeadDetailDialog";
import { NotificationPermission } from "@/components/admin/NotificationPermission";
import {
  LEAD_STATUS_OPTIONS,
  canonicalLeadStatus,
  leadStatusMeta,
  nextLeadStatus,
} from "@/lib/leads/status";

export default function AdminLeadsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState<string | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  // Custom pulse animation for new leads
  const pulseAnimation = `
    @keyframes strongPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.85; transform: scale(0.98); }
    }
  `;

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase());

      // Legacy 'converted' rows filter under "Hotovo" like the badge shows them
      const matchesStatus =
        statusFilter === "all" || canonicalLeadStatus(lead.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  const handleConvertLead = (lead: any) => {
    setSelectedLead(lead);
    setConvertDialogOpen(true);
  };

  const handleViewDetail = (lead: any) => {
    setSelectedLead(lead);
    setDetailDialogOpen(true);
  };

  const fetchLeads = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch('/api/admin/leads');

      if (response.status === 401) {
        throw new Error("Přihlášení vypršelo. Přihlaste se prosím znovu.");
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Poptávky se nepodařilo načíst.");
      }

      setLeads(result.data);
      // Also update selectedLead if it exists and matches
      if (selectedLead) {
        const updatedLead = result.data.find((l: any) => l.id === selectedLead.id);
        if (updatedLead) {
          setSelectedLead(updatedLead);
        }
      }
    } catch (error: any) {
      console.error("Error loading leads:", error);
      setLeads([]);
      setLoadError(error.message || "Poptávky se nepodařilo načíst.");
    }
    setLoading(false);
  };

  /**
   * Status pill doubles as the control that moves the lead along. Optimistic
   * with rollback, and locked while the request is in flight so three quick
   * clicks cannot send three PATCHes.
   */
  const handleCycleStatus = async (lead: any) => {
    if (statusSaving) return;

    const previous = lead.status;
    const next = nextLeadStatus(previous);

    setStatusSaving(lead.id);
    setLoadError(null);
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: next } : l)));
    setSelectedLead((prev: any) => (prev?.id === lead.id ? { ...prev, status: next } : prev));

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 ? "Přihlášení vypršelo." : "Změna stavu selhala."
        );
      }
    } catch (error: any) {
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: previous } : l)));
      setSelectedLead((prev: any) =>
        prev?.id === lead.id ? { ...prev, status: previous } : prev
      );
      setLoadError(error.message || "Změna stavu selhala.");
    } finally {
      setStatusSaving(null);
    }
  };

  const handleLeadUpdate = (updatedLead: any) => {
    setSelectedLead(updatedLead);
    // Also update in leads array
    setLeads(prevLeads =>
      prevLeads.map(l => l.id === updatedLead.id ? updatedLead : l)
    );
  };

  // Count new leads (ALARM)
  const newLeadsCount = leads.filter(l => l.status === 'new').length;

  // Handle "Vzít poptávku" - convert lead to project and assign to current user
  const handleTakeLead = async (lead: any) => {
    if (!user) return;

    if (!confirm(`Chcete převést poptávku "${lead.name}" na projekt a přiřadit si ji?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/leads/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          adminId: user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Chyba při převodu poptávky');
        return;
      }

      const result = await response.json();

      // Remove from leads list (or update status to converted)
      setLeads(prevLeads => prevLeads.map(l =>
        l.id === lead.id ? { ...l, status: 'converted' } : l
      ));

      alert(`✅ Poptávka převedena na projekt!\n\nMůžete ji najít v Projekty → ID: ${result.project.id}`);

      // Refresh leads
      fetchLeads();
    } catch (error) {
      console.error('❌ Error taking lead:', error);
      alert('Chyba při převodu poptávky');
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pulseAnimation }} />
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/admin/dashboard")}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold">Poptávky</h1>
                  {newLeadsCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="animate-pulse text-lg px-4 py-2 font-bold shadow-lg shadow-red-500/50 border-2 border-red-600"
                    >
                      🚨 {newLeadsCount} NOVÝCH!
                    </Badge>
                  )}
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {leads.length} celkem · {newLeadsCount} čeká na převzetí
                </p>
              </div>
            </div>
            <NotificationPermission />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Hledat podle jména, emailu, firmy..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Filtrovat podle stavu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny stavy</SelectItem>
                  {LEAD_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value!} value={option.value!}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Load / update errors — no mock data stands in for a failed request */}
        {loadError && (
          <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between gap-4">
            <span>{loadError}</span>
            <Button size="sm" variant="outline" onClick={fetchLeads}>
              Zkusit znovu
            </Button>
          </div>
        )}

        {/* Results count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Zobrazeno {filteredLeads.length} z {leads.length} poptávek
        </div>

        {/* Leads Table - Hidden on mobile */}
        <Card className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jméno / Firma</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Typ projektu</TableHead>
                <TableHead>Rozpočet</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead>Přiřazeno</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Skeleton loading rows
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                    Žádné poptávky nenalezeny
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className={`cursor-pointer hover:bg-muted/50 transition-all ${
                      lead.status === 'new'
                        ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-950/20 border-l-8 border-l-red-600 shadow-md shadow-red-200/50 dark:shadow-red-900/30 animate-pulse'
                        : ''
                    }`}
                  >
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          {lead.status === 'new' && (
                            <span className="text-red-600 font-bold text-lg">🚨</span>
                          )}
                          <span className="font-medium">{lead.name}</span>
                          {lead.aiDesignSuggestion && (
                            <Badge variant="secondary" className="gap-1">
                              <Sparkles className="h-3 w-3" /> AI
                            </Badge>
                          )}
                        </div>
                        {lead.company && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Building2 className="h-3 w-3" />
                            {lead.company}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <a href={`mailto:${lead.email}`} className="hover:text-primary">
                            {lead.email}
                          </a>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <a href={`tel:${lead.phone}`} className="hover:text-primary">
                              {lead.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.projectType}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{lead.budgetRange || lead.budget || '-'}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleCycleStatus(lead)}
                        disabled={statusSaving === lead.id}
                        title="Kliknutím posunete stav"
                        className="disabled:opacity-60"
                      >
                        <Badge className={`${leadStatusMeta(lead.status).badgeClass} text-white`}>
                          {leadStatusMeta(lead.status).label}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-sm">
                      {lead.assignedTo ? (
                        <Badge variant="secondary" className="font-normal">
                          {lead.assignedTo}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Nepřiřazeno</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(lead.created).toLocaleDateString('cs-CZ')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleViewDetail(lead)}>
                          Detail
                        </Button>
                        {lead.status === 'new' ? (
                          <Button
                            size="default"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTakeLead(lead);
                            }}
                            className="gap-2 animate-pulse font-bold shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-600/60 transition-all"
                          >
                            <UserCheck className="h-4 w-4" />
                            Vzít poptávku
                          </Button>
                        ) : (lead.status === "approved" || lead.status === "quoted") && !lead.convertedToProjectId && (
                          <Button
                            size="sm"
                            onClick={() => handleConvertLead(lead)}
                            className="gap-1"
                          >
                            <ArrowRight className="h-3 w-3" />
                            Převést na projekt
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Mobile Cards - Visible only on mobile */}
        <div className="md:hidden space-y-4">
          {loading ? (
            // Skeleton loading cards
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={`skeleton-card-${i}`} className="p-4">
                <Skeleton className="h-6 w-32 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </Card>
            ))
          ) : filteredLeads.length === 0 ? (
            <Card className="p-8">
              <p className="text-center text-muted-foreground">
                Žádné poptávky nenalezeny
              </p>
            </Card>
          ) : (
            filteredLeads.map((lead) => (
              <Card
                key={lead.id}
                className={`p-4 transition-all ${
                  lead.status === 'new'
                    ? 'border-4 border-red-600 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-950/20 shadow-lg shadow-red-300/50 dark:shadow-red-900/30 animate-pulse'
                    : ''
                }`}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {lead.status === 'new' && (
                          <span className="text-red-600 font-bold text-xl">🚨</span>
                        )}
                        <h3 className="font-semibold text-lg">{lead.name}</h3>
                      </div>
                      {lead.company && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {lead.company}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCycleStatus(lead)}
                      disabled={statusSaving === lead.id}
                      title="Kliknutím posunete stav"
                      className="disabled:opacity-60"
                    >
                      <Badge className={`${leadStatusMeta(lead.status).badgeClass} text-white`}>
                        {leadStatusMeta(lead.status).label}
                      </Badge>
                    </button>
                  </div>

                  {/* Contact */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <a href={`mailto:${lead.email}`} className="hover:text-primary">
                        {lead.email}
                      </a>
                    </div>
                    {lead.phone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <a href={`tel:${lead.phone}`} className="hover:text-primary">
                          {lead.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">{lead.projectType}</Badge>
                    {lead.budgetRange && (
                      <Badge variant="secondary">{lead.budgetRange}</Badge>
                    )}
                    {lead.assignedTo && (
                      <Badge variant="secondary" className="gap-1">
                        <User className="h-3 w-3" />
                        {lead.assignedTo}
                      </Badge>
                    )}
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(lead.created).toLocaleDateString('cs-CZ')}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleViewDetail(lead)}
                    >
                      Detail
                    </Button>
                    {lead.status === 'new' ? (
                      <Button
                        size="default"
                        variant="destructive"
                        className="flex-1 gap-2 animate-pulse font-bold shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-600/60 transition-all"
                        onClick={() => handleTakeLead(lead)}
                      >
                        <UserCheck className="h-4 w-4" />
                        Vzít poptávku
                      </Button>
                    ) : (lead.status === "approved" || lead.status === "quoted") && !lead.convertedToProjectId && (
                      <Button
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => handleConvertLead(lead)}
                      >
                        <ArrowRight className="h-3 w-3" />
                        Převést
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Detail Dialog */}
        {selectedLead && (
          <LeadDetailDialog
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
            lead={selectedLead}
            onRefresh={fetchLeads}
            onLeadUpdate={handleLeadUpdate}
          />
        )}

        {/* Conversion Dialog */}
        {selectedLead && (
          <ConvertLeadDialog
            open={convertDialogOpen}
            onOpenChange={setConvertDialogOpen}
            lead={selectedLead}
          />
        )}

        {/* Info note */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Zde se zobrazují všechny poptávky odeslané přes kontaktní formulář.
            Data jsou uložena v databázi a automaticky se aktualizují.
          </p>
        </div>
      </main>
      </div>
    </>
  );
}
