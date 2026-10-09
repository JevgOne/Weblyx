"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Phone, Building2, Globe, Trash2, UserCheck, ClipboardList, RotateCcw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { canonicalLeadStatus, leadStatusMeta, nextLeadStatus } from "@/lib/leads/status";
import { formatCzk } from "@/lib/pricing/types";
import { leadValueLabel } from "@/lib/leads/labels";
import { buildLeadBriefMarkdown } from "@/lib/leads/brief";

interface LeadDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: any;
  onRefresh?: () => void;
  onLeadUpdate?: (updatedLead: any) => void;
}

/* --- What the enquiry forms store, in words ---------------------------------
   The forms save machine values ("new-web", "asap", "partial") and camelCase
   keys. The panel used to print them as they were, or not at all. */

const FIELD_LABELS: Record<string, string> = {
  purpose: "Účel webu",
  targetAudience: "Cílová skupina",
  mainActions: "Co má návštěvník udělat",
  sections: "Sekce webu",
  hasContent: "Podklady (texty, fotky)",
  contentNotes: "Poznámka k obsahu",
  style: "Styl",
  colors: "Barvy",
  inspiration: "Inspirace",
  mustHave: "Nesmí chybět",
  expectations: "Očekávání",
  primary: "Hlavní",
  secondary: "Doplňková",
  accent: "Akcent",
  noPreference: "Bez preference",
  needsAnalytics: "Google Analytics",
  needsFacebookPixel: "Facebook Pixel",
  needsGoogleAds: "Google Ads",
  integrations: "Integrace",
  languages: "Jazyky",
};

const SOURCE_LABELS: Record<string, string> = {
  audit: "Bezplatný audit",
  contact_form: "Kontaktní formulář",
  questionnaire: "Dotazník",
};

const labelOf = (key: string) =>
  FIELD_LABELS[key] ??
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim();

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined || value === false) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.every(isEmpty);
  if (typeof value === "object") return Object.values(value as object).every(isEmpty);
  return false;
}

const chipClass =
  "inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700";

/** Renders whatever a form field holds: text, a list, colours, a nested object. */
function FieldValue({ value }: { value: unknown }) {
  if (value === true) return <span>Ano</span>;

  if (Array.isArray(value)) {
    return (
      <span className="flex flex-wrap gap-1.5">
        {value.filter((v) => !isEmpty(v)).map((v, i) => (
          <span key={i} className={chipClass}>
            {typeof v === "string" ? leadValueLabel(v) : JSON.stringify(v)}
          </span>
        ))}
      </span>
    );
  }

  if (typeof value === "object" && value !== null) {
    return (
      <span className="flex flex-wrap gap-x-4 gap-y-1.5">
        {Object.entries(value)
          .filter(([, v]) => !isEmpty(v))
          .map(([k, v]) =>
            typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v) ? (
              <span key={k} className="inline-flex items-center gap-1.5">
                <span
                  className="h-4 w-4 rounded-full border border-slate-300"
                  style={{ background: v }}
                />
                {labelOf(k)} <span className="text-slate-500">{v}</span>
              </span>
            ) : v === true ? (
              <span key={k}>{labelOf(k)}</span>
            ) : (
              <span key={k}>
                {labelOf(k)}: <FieldValue value={v} />
              </span>
            )
          )}
      </span>
    );
  }

  const text = String(value);
  if (/^https?:\/\//.test(text)) {
    return (
      <a href={text} target="_blank" rel="noopener noreferrer" className="break-all text-teal-700 hover:underline">
        {text}
      </a>
    );
  }
  return <span className="whitespace-pre-wrap break-words">{leadValueLabel(text)}</span>;
}

/** A titled block of label/value rows. Renders nothing when every row is empty. */
function Section({ title, rows }: { title: string; rows: Array<[string, unknown]> }) {
  const filled = rows.filter(([, v]) => !isEmpty(v));
  if (filled.length === 0) return null;
  return (
    <section className="space-y-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h4>
      <dl className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-slate-50 px-4">
        {filled.map(([label, value]) => (
          <div key={label} className="grid gap-1 py-2.5 text-sm sm:grid-cols-[190px_1fr] sm:gap-4">
            <dt className="font-medium text-slate-500">{label}</dt>
            <dd className="min-w-0 text-slate-900">
              <FieldValue value={value} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Lighthouse bands: red under 50, amber to 89, green above. */
function scoreClass(score: number | null) {
  if (score === null) return "bg-slate-100 text-slate-500";
  if (score < 50) return "bg-red-100 text-red-700";
  if (score < 90) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export function LeadDetailDialog({ open, onOpenChange, lead, onRefresh, onLeadUpdate }: LeadDetailDialogProps) {
  const [currentLead, setCurrentLead] = useState(lead);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
  }, [lead]);

  // Pre-fill the brief once per lead. Keyed on the id so a status change, which
  // hands in a new lead object, does not wipe what staff have already edited.
  useEffect(() => {
    setTaskBrief(lead ? buildLeadBriefMarkdown(lead) : "");
    setTaskKwAnalysis("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?.id]);

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

  // Cycles new → v řešení → hotovo. Optimistic, rolled back if the PATCH fails
  // (an expired session returns 401 and is a realistic case here).
  const handleCycleStatus = async () => {
    if (statusSaving) return;

    const previous = currentLead.status;
    const next = nextLeadStatus(previous);

    setStatusSaving(true);
    setError(null);
    setCurrentLead((prev: any) => ({ ...prev, status: next }));
    onLeadUpdate?.({ ...currentLead, status: next });

    try {
      const response = await fetch(`/api/leads/${currentLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      if (!response.ok) {
        throw new Error(response.status === 401 ? "Přihlášení vypršelo." : "Změna stavu selhala.");
      }
    } catch (err: any) {
      setCurrentLead((prev: any) => ({ ...prev, status: previous }));
      onLeadUpdate?.({ ...currentLead, status: previous });
      setError(err.message || "Změna stavu selhala.");
    } finally {
      setStatusSaving(false);
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
      // The brief already carries contact, package and budget in its header.
      let description = taskBrief.trim();
      if (taskKwAnalysis.trim()) {
        description += `\n\n## Klíčová slova & SEO\n${taskKwAnalysis.trim()}`;
      }

      const actualAssignedTo = taskAssignedTo === 'unassigned' ? null : taskAssignedTo;
      const specialist = specialists.find(s => s.id === actualAssignedTo);

      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${config?.tierName || leadValueLabel(currentLead.projectType || '') || 'Web'}: ${currentLead.company || currentLead.name}`,
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

        // Mark as done ('converted' is the legacy value, still read but not written)
        await fetch(`/api/admin/leads`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId: currentLead.id,
            updates: { status: 'done' },
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


  const config = currentLead.configuration;
  const attribution = currentLead.attribution ?? {};
  const audits: any[] = Array.isArray(currentLead.audits) ? currentLead.audits : [];
  const isDone = canonicalLeadStatus(currentLead.status) === "done";
  const inputClass = "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400";

  // The dialog is portalled to <body>, outside `.wbx-admin`, so neither the
  // panel's tokens nor its "always light" override reach it. Colours here are
  // therefore stated outright, and no `dark:` variants: those follow the
  // visitor's OS and painted near-black fields onto a white panel.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-slate-200 bg-white text-slate-900">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-6">
            <div>
              <DialogTitle className="text-2xl text-slate-900">{currentLead.name}</DialogTitle>
              <DialogDescription className="text-slate-500">
                {SOURCE_LABELS[currentLead.source] ?? "Poptávka"} ·{" "}
                {dateTime(currentLead.createdAt || currentLead.created)}
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={handleCycleStatus}
              disabled={statusSaving}
              title="Kliknutím posunete stav"
              className="disabled:opacity-60"
            >
              <Badge className={`${leadStatusMeta(currentLead.status).badgeClass} text-white`}>
                {leadStatusMeta(currentLead.status).label}
              </Badge>
            </button>
          </div>
        </DialogHeader>

        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* The consultation call for this enquiry: start it, or return to what was said. */}
          <a
            href={`/admin/konzultace/${currentLead.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700"
          >
            <Phone className="h-4 w-4" />
            Konzultace s klientem
          </a>

          {/* Contact — the first thing anyone opening an enquiry is after */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a href={`mailto:${currentLead.email}`} className="inline-flex items-center gap-2 font-semibold text-teal-700 hover:underline">
              <Mail className="h-4 w-4" />
              {currentLead.email}
            </a>
            {currentLead.phone && (
              <a href={`tel:${currentLead.phone}`} className="inline-flex items-center gap-2 font-semibold text-teal-700 hover:underline">
                <Phone className="h-4 w-4" />
                {currentLead.phone}
              </a>
            )}
            {currentLead.company && (
              <span className="inline-flex items-center gap-2 text-slate-700">
                <Building2 className="h-4 w-4 text-slate-400" />
                {currentLead.company}
              </span>
            )}
            {currentLead.existingWebsite && (
              <a
                href={/^https?:\/\//.test(currentLead.existingWebsite) ? currentLead.existingWebsite : `https://${currentLead.existingWebsite}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-teal-700 hover:underline"
              >
                <Globe className="h-4 w-4" />
                {currentLead.existingWebsite}
              </a>
            )}
          </div>

          <Section
            title="Poptávka"
            rows={[
              ["Typ projektu", currentLead.projectTypeOther || currentLead.projectType],
              ["Rozpočet", currentLead.budgetRange],
              ["Termín", currentLead.timeline],
              ["Zpráva", currentLead.businessDescription],
              ["Cíl projektu", currentLead.projectGoal],
              ["Důvod", currentLead.projectReason],
              ["Další požadavky", currentLead.additionalRequirements],
              ["Přiřazeno", currentLead.assignedTo],
            ]}
          />

          {/* The audit this lead ran on /audit — for those leads it is the enquiry */}
          {audits.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Audit webu</h4>
                <Link href="/admin/audity" className="text-xs font-semibold text-teal-700 hover:underline">
                  Všechny audity →
                </Link>
              </div>
              <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-slate-50 px-4">
                {audits.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 py-3 text-sm">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-extrabold ${scoreClass(a.score)}`}
                      title="Celkové skóre"
                    >
                      {a.score ?? "—"}
                    </span>
                    <div className="min-w-0">
                      <a href={a.url} target="_blank" rel="noopener noreferrer" className="break-all font-semibold text-slate-900 hover:underline">
                        {a.url}
                      </a>
                      <p className="text-slate-600">
                        {a.status === "failed"
                          ? "Audit se nepodařilo dokončit."
                          : [
                              ...(Array.isArray(a.metrics) ? a.metrics.map((m: any) => `${m.label}: ${m.value}`) : []),
                              a.issueCount !== null ? `nalezených problémů: ${a.issueCount}` : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                      </p>
                      <p className="text-xs text-slate-500">{dateTime(a.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {config?.tierName && (
            <Section
              title="Konfigurace z ceníku"
              rows={[
                ["Balíček", config.tierName],
                [
                  "Doplňky",
                  Array.isArray(config.addons) && config.addons.length > 0
                    ? config.addons.map((addon: any) => `${addon.name} (${addon.hours} h)`)
                    : "bez doplňků",
                ],
                [
                  "Cena",
                  `${formatCzk(Number(config.totalPrice) || 0)} Kč${config.hourlyRate ? ` (sazba ${config.hourlyRate} Kč/h)` : ""}`,
                ],
                ["Odhad práce", config.totalHours ? `${config.totalHours} h` : null],
                ["Dodání", config.deliveryDays ? `${config.deliveryDays} dní` : null],
              ]}
            />
          )}

          <Section
            title="Projekt"
            rows={[
              ...Object.entries(currentLead.projectDetails ?? {}).map(
                ([key, value]) => [labelOf(key), value] as [string, unknown]
              ),
              ["Požadované funkce", currentLead.features],
            ]}
          />

          <Section
            title="Design"
            rows={Object.entries(currentLead.designPreferences ?? {}).map(
              ([key, value]) => [labelOf(key), value] as [string, unknown]
            )}
          />

          <Section
            title="Firma"
            rows={[
              ["Odvětví", currentLead.industry],
              ["Velikost firmy", currentLead.companySize],
              ["IČO", currentLead.ico],
              ["Adresa", currentLead.address],
              ["Let na trhu", currentLead.yearsInBusiness],
              ["V čem jsou jiní", currentLead.usp],
              ["Jak získávají zákazníky", currentLead.customerAcquisition],
              ["Konkurence", currentLead.topCompetitors],
              ["Sociální sítě", currentLead.socialMedia],
            ]}
          />

          <Section
            title="Marketing a technika"
            rows={Object.entries(
              typeof currentLead.marketingTech === "object" && currentLead.marketingTech
                ? currentLead.marketingTech
                : {}
            ).map(([key, value]) => [labelOf(key), value] as [string, unknown])}
          />

          <Section
            title="Jak se spojit"
            rows={[
              ["Preferovaný kontakt", currentLead.preferredContact],
              ["Kdy se hodí schůzka", currentLead.preferredMeetingTime],
              ["Jak se o nás dozvěděli", currentLead.howDidYouHear],
            ]}
          />

          {/* Most enquiries are organic and an empty box says nothing. */}
          <Section
            title="Odkud poptávka přišla"
            rows={[
              ["Kampaň", attribution.utmCampaign],
              [
                "Zdroj",
                attribution.utmSource && attribution.utmMedium
                  ? `${attribution.utmSource} / ${attribution.utmMedium}`
                  : attribution.utmSource,
              ],
              ["Klíčové slovo", attribution.utmTerm],
              ["Inzerát", attribution.utmContent],
              ["Google Ads klik", attribution.gclid],
              ["Vstupní stránka", attribution.landingPage],
              ["Odkud přišel", attribution.referrer],
            ]}
          />

          {/* Hand-off to a specialist. Below the enquiry on purpose: it used to
              sit on top and push everything the client wrote off the screen. */}
          {!isDone && (
            <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <ClipboardList className="h-5 w-5 text-teal-600" />
                  Vytvořit úkol pro specialistu
                </Label>
                <button
                  type="button"
                  onClick={() => setTaskBrief(buildLeadBriefMarkdown(currentLead))}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline"
                >
                  <RotateCcw className="h-3 w-3" />
                  Obnovit z poptávky
                </button>
              </div>

              <p className="text-sm text-slate-500">
                Brief se sám sestavil z poptávky a balíčku: stránky, sekce, kdo dodá jaký obsah, co je mimo rozsah.
                Před odesláním ho upravte, zvlášť části označené „návrh“ a „ověřit“.
              </p>

              <div className="space-y-2">
                <Label htmlFor="taskBrief" className="text-sm font-medium text-slate-900">
                  1. Brief pro specialistu (markdown) *
                </Label>
                <Textarea
                  id="taskBrief"
                  className={`min-h-[420px] font-mono text-xs leading-relaxed ${inputClass}`}
                  value={taskBrief}
                  onChange={(e) => setTaskBrief(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskKwAnalysis" className="text-sm font-medium text-slate-900">
                  2. Klíčová slova & SEO analýza (volitelné)
                </Label>
                <Textarea
                  id="taskKwAnalysis"
                  placeholder="Např: Hlavní KW: kadeřnictví Praha (2400 hledání/měs), dámské střihy (1900), barvení vlasů..."
                  className={`min-h-[120px] ${inputClass}`}
                  value={taskKwAnalysis}
                  onChange={(e) => setTaskKwAnalysis(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900">Přiřadit specialistovi</Label>
                  <Select value={taskAssignedTo} onValueChange={setTaskAssignedTo}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Vybrat specialistu" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-200 bg-white text-slate-900">
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
                  <Label className="text-sm font-medium text-slate-900">Priorita</Label>
                  <Select value={taskPriority} onValueChange={(v) => setTaskPriority(v as any)}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-200 bg-white text-slate-900">
                      <SelectItem value="low">Nízká</SelectItem>
                      <SelectItem value="medium">Střední</SelectItem>
                      <SelectItem value="high">Vysoká</SelectItem>
                      <SelectItem value="urgent">Urgentní</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateTask}
                disabled={creatingTask || !taskBrief.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
              >
                {creatingTask ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Vytvářím úkol...
                  </>
                ) : (
                  <>
                    <ClipboardList className="h-4 w-4" />
                    Vytvořit úkol pro specialistu
                  </>
                )}
              </button>
            </section>
          )}

          {isDone && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
              <UserCheck className="h-5 w-5" />
              Tato poptávka již byla převedena na úkol.
            </div>
          )}

          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-500">Smazat poptávku trvale z databáze</p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold disabled:opacity-60 ${
                  confirmDelete
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-slate-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50"
                }`}
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {deleting ? "Mažu..." : confirmDelete ? "Potvrdit smazání" : "Smazat poptávku"}
              </button>
            </div>
            {confirmDelete && !deleting && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                Klikněte znovu pro potvrzení. Tato akce je nevratná.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
