/**
 * Single definition of the lead lifecycle: new → in_progress → done.
 *
 * `converted` is the historical value for "done" and still sits on rows in the
 * database, so it is accepted on read (and rendered as "Hotovo") but never
 * written by the status cycle.
 */

export const LEAD_STATUSES = ["new", "in_progress", "done"] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEGACY_DONE_STATUS = "converted";

export interface LeadStatusMeta {
  /** Canonical value, or null for a status we do not recognise. */
  value: LeadStatus | null;
  label: string;
  /** Pill styling from app/admin/admin.css. */
  pillClass: string;
  /** Background class for the shadcn Badge used on the older screens. */
  badgeClass: string;
}

const META: Record<LeadStatus, LeadStatusMeta> = {
  new: {
    value: "new",
    label: "Nová",
    pillClass: "wbx-status wbx-status-new",
    badgeClass: "bg-teal-600",
  },
  in_progress: {
    value: "in_progress",
    label: "V řešení",
    pillClass: "wbx-status wbx-status-progress",
    badgeClass: "bg-blue-500",
  },
  done: {
    value: "done",
    label: "Hotovo",
    pillClass: "wbx-status wbx-status-done",
    badgeClass: "bg-emerald-600",
  },
};

export function canonicalLeadStatus(raw: unknown): LeadStatus | null {
  if (typeof raw !== "string") return null;
  if (raw === LEGACY_DONE_STATUS) return "done";
  return (LEAD_STATUSES as readonly string[]).includes(raw) ? (raw as LeadStatus) : null;
}

/** Never throws — an unknown status renders neutrally instead of crashing the list. */
export function leadStatusMeta(raw: unknown): LeadStatusMeta {
  const canonical = canonicalLeadStatus(raw);
  if (canonical) return META[canonical];

  return {
    value: null,
    label: typeof raw === "string" && raw ? raw : "Neznámý",
    pillClass: "wbx-status",
    badgeClass: "bg-slate-400",
  };
}

export function nextLeadStatus(raw: unknown): LeadStatus {
  const canonical = canonicalLeadStatus(raw) ?? "new";
  const index = LEAD_STATUSES.indexOf(canonical);
  return LEAD_STATUSES[(index + 1) % LEAD_STATUSES.length];
}

/** Values the API accepts on write: the three canonical ones plus the legacy alias. */
export function isWritableLeadStatus(value: unknown): boolean {
  return canonicalLeadStatus(value) !== null;
}

export const LEAD_STATUS_OPTIONS: LeadStatusMeta[] = LEAD_STATUSES.map((s) => META[s]);
