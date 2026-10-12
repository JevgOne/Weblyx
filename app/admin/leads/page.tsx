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
import { Search, Filter, Mail, Phone, Building2, Calendar, ArrowRight, Sparkles, User, UserCheck } from "lucide-react";
import { ConvertLeadDialog } from "@/components/admin/ConvertLeadDialog";
import { LeadDetailDialog } from "@/components/admin/LeadDetailDialog";
import { NotificationPermission } from "@/components/admin/NotificationPermission";
import {
  LEAD_STATUS_OPTIONS,
  canonicalLeadStatus,
  leadStatusMeta,
  nextLeadStatus,
} from "@/lib/leads/status";
import { leadValueLabel } from "@/lib/leads/labels";

const GROUP_TITLES: Record<string, string> = {
  new: "Čeká na převzetí",
  in_progress: "V řešení",
  done: "Hotovo",
};

/** "Základní Web - 9 990 Kč" → package and price on separate lines. */
function splitBudget(value: string): [string, string] {
  if (!value || value === "-") return ["", ""];
  const i = value.lastIndexOf(" - ");
  return i > 0 ? [value.slice(0, i), value.slice(i + 3)] : [value, ""];
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

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

  // One order for the whole screen: what waits for someone first, finished
  // work last. Sorted by date alone, new enquiries sat scattered between
  // ones already in hand.
  const groups = useMemo(() => {
    const byDate = (a: any, b: any) => new Date(b.created).getTime() - new Date(a.created).getTime();
    return LEAD_STATUS_OPTIONS.map((option) => ({
      option,
      leads: filteredLeads.filter((l) => canonicalLeadStatus(l.status) === option.value).sort(byDate),
    }))
      .concat([
        {
          option: leadStatusMeta(null),
          leads: filteredLeads.filter((l) => canonicalLeadStatus(l.status) === null).sort(byDate),
        },
      ])
      .filter((g) => g.leads.length > 0);
  }, [filteredLeads]);

  const countFor = (status: string) =>
    status === "all" ? leads.length : leads.filter((l) => canonicalLeadStatus(l.status) === status).length;

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

  // "Vzít poptávku": assign it to the signed-in user and move it to "V řešení".
  // It is still the same enquiry — taking it used to create a project as well,
  // and a second click created a second one.
  const handleTakeLead = async (lead: any) => {
    if (!user) return;

    if (!confirm(`Vzít si poptávku „${lead.name}“? Přiřadí se vám a přejde do stavu „V řešení“.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress', assignedTo: user.name }),
      });

      if (!response.ok) {
        alert(response.status === 401 ? 'Přihlášení vypršelo.' : 'Poptávku se nepodařilo převzít.');
        return;
      }

      setLeads(prevLeads => prevLeads.map(l =>
        l.id === lead.id ? { ...l, status: 'in_progress', assignedTo: user.name } : l
      ));
    } catch (error) {
      console.error('❌ Error taking lead:', error);
      alert('Poptávku se nepodařilo převzít.');
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pulseAnimation }} />
      <div className="min-h-screen bg-background">
      {/*
        The shell already renders the page title, a subtitle and the sidebar
        with its own unread count, so this screen used to show "Poptávky"
        twice — plus a back arrow to the dashboard, which is what the sidebar
        is for. What is left is the part the shell cannot know: the counts and
        the push-notification switch.
      */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 md:py-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{leads.length}</span> celkem
          {newLeadsCount > 0 && (
            <>
              {" · "}
              <span className="font-semibold text-amber-700">{newLeadsCount}</span> čeká na převzetí
            </>
          )}
        </p>
        <NotificationPermission />
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Search and state tabs in one row — the tabs carry the counts. */}
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {[{ value: "all", label: "Vše" }, ...LEAD_STATUS_OPTIONS.map((o) => ({ value: o.value!, label: o.label }))].map(
              (tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  data-active={statusFilter === tab.value}
                  className="wbx-filter inline-flex items-center gap-2"
                >
                  {tab.label}
                  <span className="text-[12px] font-bold opacity-60">{countFor(tab.value)}</span>
                </button>
              )
            )}
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Hledat jméno, e-mail, firmu…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Load / update errors — no mock data stands in for a failed request */}
        {loadError && (
          <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between gap-4">
            <span>{loadError}</span>
            <Button size="sm" variant="outline" onClick={fetchLeads}>
              Zkusit znovu
            </Button>
          </div>
        )}

        {/* Leads Table - Hidden on mobile */}
        {/*
          Eight columns with no widths let the browser size them from content:
          a long company name pushed the row three lines tall and shoved the
          action column past the right edge, so "Vzít poptávku" was unreachable.
          The widths below are the fix; overflow-x-auto is the safety net on a
          narrow window.
        */}
        <Card className="hidden md:block">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[190px]">Jméno / Firma</TableHead>
                <TableHead className="w-[190px]">Kontakt</TableHead>
                <TableHead className="w-[120px]">Typ</TableHead>
                <TableHead className="w-[130px]">Balíček</TableHead>
                <TableHead className="w-[100px]">Stav</TableHead>
                <TableHead className="w-[120px]">Řeší</TableHead>
                <TableHead className="w-[90px]">Přišlo</TableHead>
                {/* Pinned: the action must stay reachable when the table
                    scrolls sideways — it is the whole point of the screen. */}
                <TableHead className="sticky right-0 z-20 w-[130px] bg-card text-right shadow-[-8px_0_8px_-8px_rgba(15,23,42,.15)]">
                  Akce
                </TableHead>
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
                groups.flatMap((group) => [
                  <TableRow key={`group-${group.option.value ?? "other"}`} className="hover:bg-transparent">
                    <TableCell colSpan={8} className="bg-slate-50 py-2">
                      <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-slate-600">
                        <span className={`${group.option.pillClass} !p-0 h-2 w-2 rounded-full`} style={{ background: "currentColor" }} />
                        {GROUP_TITLES[group.option.value ?? ""] ?? group.option.label}
                        <span className="font-semibold text-slate-400">{group.leads.length}</span>
                      </span>
                    </TableCell>
                  </TableRow>,
                  ...group.leads.map((lead) => {
                    const meta = leadStatusMeta(lead.status);
                    const isNew = meta.value === "new";
                    const isDone = meta.value === "done";
                    const [pack, price] = splitBudget(leadValueLabel(lead.budgetRange || lead.budget || ""));
                    return (
                  <TableRow
                    key={lead.id}
                    onClick={() => handleViewDetail(lead)}
                    className="cursor-pointer bg-white transition-colors hover:bg-slate-50"
                  >
                    <TableCell>
                      <div className={isDone ? "text-slate-500" : ""}>
                        <div className="flex items-center gap-2">
                          <span
                            title={lead.name || "Bez jména"}
                            className={`truncate ${isNew ? "font-bold" : "font-medium"} ${lead.name ? "" : "text-slate-400"}`}
                          >
                            {lead.name || "Bez jména"}
                          </span>
                          {lead.aiDesignSuggestion && (
                            <Badge variant="secondary" className="gap-1">
                              <Sparkles className="h-3 w-3" /> AI
                            </Badge>
                          )}
                        </div>
                        {lead.company && lead.company !== lead.name && (
                          <div title={lead.company} className="mt-0.5 truncate text-[13px] text-slate-500">
                            {lead.company}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-0.5 text-[13px]">
                        {lead.email ? (
                          <a
                            href={`mailto:${lead.email}`}
                            title={lead.email}
                            className="block truncate text-slate-700 hover:text-teal-700 hover:underline"
                          >
                            {lead.email}
                          </a>
                        ) : (
                          <span className="text-slate-400">bez e-mailu</span>
                        )}
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="block font-semibold text-slate-900 hover:text-teal-700">
                            {lead.phone}
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] text-slate-700">
                      {leadValueLabel(lead.projectType ?? "") || <span className="text-slate-300">—</span>}
                    </TableCell>
                    <TableCell className="text-[13px]">
                      {pack ? (
                        <>
                          <div className="truncate font-medium text-slate-800" title={pack}>{pack}</div>
                          {price && <div className="whitespace-nowrap text-slate-500">{price}</div>}
                        </>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleCycleStatus(lead)}
                        disabled={statusSaving === lead.id}
                        title="Kliknutím posunete stav"
                        className={`${meta.pillClass} !px-2.5 !py-1 !text-[12px] disabled:opacity-60`}
                      >
                        {meta.label}
                      </button>
                    </TableCell>
                    <TableCell className="text-[13px]">
                      {lead.assignedTo ? (
                        <span className="inline-flex max-w-full items-center gap-1.5" title={lead.assignedTo}>
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                            {initials(lead.assignedTo)}
                          </span>
                          <span className="truncate font-medium text-slate-700">{lead.assignedTo}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">nikdo</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-[13px] text-slate-500">
                      {new Date(lead.created).toLocaleDateString('cs-CZ')}
                    </TableCell>
                    <TableCell
                      onClick={(e) => e.stopPropagation()}
                      className="sticky right-0 z-10 bg-inherit text-right shadow-[-8px_0_8px_-8px_rgba(15,23,42,.12)]"
                    >
                      <div className="flex justify-end gap-1.5">
                        {isNew ? (
                          <Button
                            size="sm"
                            onClick={() => handleTakeLead(lead)}
                            className="gap-1.5 whitespace-nowrap bg-slate-900 font-semibold text-white hover:bg-slate-800"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            Vzít
                          </Button>
                        ) : lead.convertedToProjectId ? (
                          <Button asChild size="sm" variant="outline" className="gap-1 whitespace-nowrap">
                            <a href={`/admin/projects/${lead.convertedToProjectId}`}>
                              Projekt
                              <ArrowRight className="h-3 w-3" />
                            </a>
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => handleViewDetail(lead)}>
                            Detail
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                    );
                  }),
                ])
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
                className="p-4"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{lead.name || "Bez jména"}</h3>
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
                      className={`${leadStatusMeta(lead.status).pillClass} disabled:opacity-60`}
                    >
                      {leadStatusMeta(lead.status).label}
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
                    <Badge variant="outline">{leadValueLabel(lead.projectType ?? "")}</Badge>
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
                        className="flex-1 gap-1.5 bg-slate-900 font-semibold text-white hover:bg-slate-800"
                        onClick={() => handleTakeLead(lead)}
                      >
                        <UserCheck className="h-4 w-4" />
                        Vzít poptávku
                      </Button>
                    ) : lead.convertedToProjectId && (
                      <Button asChild size="sm" variant="outline" className="flex-1 gap-1">
                        <a href={`/admin/projects/${lead.convertedToProjectId}`}>
                          <ArrowRight className="h-3 w-3" />
                          Projekt
                        </a>
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

      </main>
      </div>
    </>
  );
}
