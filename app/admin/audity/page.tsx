"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Loader2, Phone } from "lucide-react";
import type { AuditRecord, AuditSource, CallStatus } from "@/lib/audits/server";

const PAGE_SIZE = 25;

type Filter = AuditSource | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Vše" },
  { value: "web", label: "Z webu" },
  { value: "admin", label: "Naše analýzy" },
];

/** Where the call stands. Clicking the pill moves it along. */
const CALL_STATES: { value: CallStatus; label: string; fg: string; bg: string }[] = [
  { value: "new", label: "Nevoláno", fg: "#0B7F76", bg: "rgba(11,127,118,.13)" },
  { value: "called", label: "Voláno", fg: "#2563EB", bg: "rgba(37,99,235,.13)" },
  { value: "interested", label: "Má zájem", fg: "#0F9268", bg: "rgba(15,146,104,.13)" },
  { value: "rejected", label: "Nemá zájem", fg: "#6E7C80", bg: "rgba(110,124,128,.13)" },
];

const nextCallStatus = (s: CallStatus): CallStatus => {
  const i = CALL_STATES.findIndex((x) => x.value === s);
  return CALL_STATES[(i + 1) % CALL_STATES.length].value;
};

/** Lighthouse bands: red under 50, amber to 89, green above. */
function scoreColor(score: number | null) {
  if (score === null) return { fg: "var(--a-muted)", bg: "rgba(110,124,128,.12)" };
  if (score < 50) return { fg: "#DC2626", bg: "rgba(220,38,38,.12)" };
  if (score < 90) return { fg: "#B45309", bg: "rgba(180,83,9,.12)" };
  return { fg: "#0F9268", bg: "rgba(15,146,104,.12)" };
}

/** What to open the call with — the worse the score, the blunter the line. */
function talkingPoint(a: AuditRecord): string {
  if (a.status === "failed") return "Audit se nepodařilo dokončit — web možná nejede.";
  if (a.score === null) return "Skóre se nepodařilo změřit.";
  if (a.score < 50) return `Web má ${a.score}/100 — načítá se pomalu a přichází o zákazníky.`;
  if (a.score < 90) return `Web má ${a.score}/100 — je co zlepšovat, hlavně rychlost.`;
  return `Web má ${a.score}/100 — technicky je v pořádku, prostor je jinde.`;
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const dateTime = (unix: number) =>
  new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(unix * 1000));

export default function AdminAuditsPage() {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async (offset: number, source: Filter = "all") => {
    offset === 0 ? setLoading(true) : setLoadingMore(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
      if (source !== "all") params.set("source", source);
      const res = await fetch(`/api/admin/audits?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Načtení auditů selhalo");
      setTotal(json.data.total);
      setAudits((cur) => (offset === 0 ? json.data.audits : [...cur, ...json.data.audits]));
    } catch (err: any) {
      setError(err?.message || "Načtení auditů selhalo");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(0, filter);
  }, [load, filter]);

  /** Optimistic: a pill that waits for a round trip reads as broken. */
  async function cycleCall(a: AuditRecord) {
    const next = nextCallStatus(a.callStatus);
    setSavingId(a.id);
    setAudits((cur) => cur.map((x) => (x.id === a.id ? { ...x, callStatus: next } : x)));
    try {
      const res = await fetch("/api/admin/audits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: a.id, callStatus: next }),
      });
      if (!(await res.json()).success) throw new Error();
    } catch {
      setAudits((cur) => cur.map((x) => (x.id === a.id ? { ...x, callStatus: a.callStatus } : x)));
      setError("Stav hovoru se nepodařilo uložit");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="wbx-card p-[26px]">
      <div className="mb-[18px]">
        <h2 className="text-[17px] font-bold" style={{ letterSpacing: "-.02em" }}>
          Audity z webu
        </h2>
        <p className="mt-1 text-[13px] font-medium" style={{ color: "var(--a-muted)" }}>
          Kdo si na webu nechal proklepnout svůj web. Každý z nich vám dal adresu
          svého webu i e-mail — je to hotový podklad na zavolání.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            data-active={filter === f.value}
            aria-pressed={filter === f.value}
            className="wbx-filter"
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-3 text-[13px] font-semibold" style={{ color: "#DC2626" }}>
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : audits.length === 0 ? (
        <p className="py-8 text-center text-sm font-medium" style={{ color: "var(--a-muted)" }}>
          Zatím nikdo audit nespustil.
        </p>
      ) : (
        <ul>
          {audits.map((a) => {
            const c = scoreColor(a.score);
            return (
              <li
                key={a.id}
                className="flex flex-wrap items-start gap-x-4 gap-y-2 border-t py-4"
                style={{ borderColor: "var(--a-border-row)" }}
              >
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[17px] font-extrabold"
                  style={{ color: c.fg, background: c.bg }}
                  title="Skóre PageSpeed"
                >
                  {a.score ?? "—"}
                </span>

                <div className="min-w-[240px] flex-1">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[15px] font-semibold hover:underline"
                  >
                    {hostOf(a.url)}
                    <ExternalLink className="h-3.5 w-3.5" style={{ color: "var(--a-muted)" }} />
                  </a>
                  <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--a-muted)" }}>
                    {talkingPoint(a)}
                  </p>
                  {a.metrics.length > 0 && (
                    <p className="mt-1 text-[12px]" style={{ color: "var(--a-nav-idle)" }}>
                      {a.metrics.map((m) => `${m.label}: ${m.value}`).join(" · ")}
                    </p>
                  )}
                </div>

                <div className="min-w-[200px]">
                  {a.companyName && (
                    <p className="text-[14px] font-semibold">{a.companyName}</p>
                  )}
                  <a
                    href={`mailto:${a.email}`}
                    className="text-[14px] font-semibold hover:underline"
                    style={{ color: "var(--a-brand)" }}
                  >
                    {a.email}
                  </a>
                  <p className="mt-0.5 text-[12px]" style={{ color: "var(--a-muted)" }}>
                    {dateTime(a.createdAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {(() => {
                    const cs = CALL_STATES.find((x) => x.value === a.callStatus)!;
                    return (
                      <button
                        type="button"
                        onClick={() => cycleCall(a)}
                        disabled={savingId === a.id}
                        title="Kliknutím posunete stav hovoru"
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold disabled:opacity-60"
                        style={{ color: cs.fg, background: cs.bg }}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {cs.label}
                      </button>
                    );
                  })()}
                  {a.leadId && (
                    <Link
                      href="/admin/leads"
                      className="rounded-full border px-3 py-1 text-[12px] font-bold"
                      style={{ color: "var(--a-brand-soft)", borderColor: "var(--a-brand-soft)" }}
                    >
                      Poptávka
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {audits.length < total && !loading && (
        <div className="pt-5 text-center">
          <button
            type="button"
            onClick={() => load(audits.length, filter)}
            disabled={loadingMore}
            className="wbx-filter inline-flex items-center gap-1.5"
          >
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            Načíst další
          </button>
        </div>
      )}
    </div>
  );
}
