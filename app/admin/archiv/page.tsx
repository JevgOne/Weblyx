"use client";

import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, EyeOff, Loader2, Plus } from "lucide-react";
import {
  ALWAYS_INTERNAL,
  CHANGE_TYPES,
  CHANGE_TYPE_COLORS,
  CHANGE_TYPE_LABELS,
  formatChangeDateTime,
  type ChangeType,
  type ChangelogEntry,
} from "@/lib/changelog/types";

const PAGE_SIZE = 20;

type Filter = ChangeType | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Vše" },
  ...CHANGE_TYPES.map((type) => ({ value: type as Filter, label: CHANGE_TYPE_LABELS[type] })),
];

function TypeBadge({ type }: { type: ChangeType }) {
  const color = CHANGE_TYPE_COLORS[type];
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[12px] font-bold"
      style={{ color: color.fg, background: color.bg }}
    >
      {CHANGE_TYPE_LABELS[type]}
    </span>
  );
}

export default function AdminArchivPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [composerOpen, setComposerOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDetail, setDraftDetail] = useState("");
  const [draftPublic, setDraftPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  /**
   * `offset` is a parameter rather than `entries.length` so a filter change and
   * "Načíst další" go through one path without racing each other over state.
   */
  const load = useCallback(async (nextFilter: Filter, offset: number) => {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
    if (nextFilter !== "all") params.set("type", nextFilter);

    offset === 0 ? setLoading(true) : setLoadingMore(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/changelog?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Načtení archivu selhalo");

      setTotal(json.data.total);
      setEntries((current) =>
        offset === 0 ? json.data.entries : [...current, ...json.data.entries]
      );
    } catch (err: any) {
      setError(err?.message || "Načtení archivu selhalo");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(filter, 0);
  }, [filter, load]);

  async function toggleVisibility(entry: ChangelogEntry) {
    setTogglingId(entry.id);
    const next = !entry.isPublic;

    // Optimistic: a switch that waits for a round trip before moving reads as
    // broken. Rolled back below if the write fails.
    setEntries((current) =>
      current.map((item) => (item.id === entry.id ? { ...item, isPublic: next } : item))
    );

    try {
      const res = await fetch("/api/admin/changelog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id, isPublic: next }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
    } catch {
      setEntries((current) =>
        current.map((item) => (item.id === entry.id ? { ...item, isPublic: entry.isPublic } : item))
      );
      setError("Změnu viditelnosti se nepodařilo uložit");
    } finally {
      setTogglingId(null);
    }
  }

  async function saveManualEntry() {
    if (!draftTitle.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/changelog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draftTitle.trim(),
          detail: draftDetail.trim() || null,
          isPublic: draftPublic,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Uložení selhalo");

      setDraftTitle("");
      setDraftDetail("");
      setComposerOpen(false);
      await load(filter, 0);
    } catch (err: any) {
      setError(err?.message || "Uložení selhalo");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border px-3 py-2 text-[15px] outline-none focus:border-[color:var(--a-brand)]";
  const inputStyle = {
    borderColor: "var(--a-border)",
    background: "var(--a-bg)",
    color: "var(--a-ink)",
  } as const;

  const hasMore = entries.length < total;

  return (
    <div className="wbx-card p-[26px]">
      <div className="mb-[18px] flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-bold" style={{ letterSpacing: "-.02em" }}>
            Archiv změn
          </h2>
          <p className="mt-1 text-[13px] font-medium" style={{ color: "var(--a-muted)" }}>
            Co se na webu dělo. Záznamy se zapisují samy při každé úpravě v panelu; ručně lze
            přidat jen technickou poznámku.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setComposerOpen((open) => !open)}
          className="wbx-filter inline-flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Nový záznam
        </button>
      </div>

      {composerOpen && (
        <div
          className="mb-5 space-y-3 rounded-xl border p-4"
          style={{ borderColor: "var(--a-border)", background: "var(--a-bg)" }}
        >
          <p className="text-sm font-semibold">
            Technická poznámka{" "}
            <span style={{ color: "var(--a-muted)" }}>(zapíše se jako typ Systém)</span>
          </p>
          <input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            placeholder="Např. Nasazen nový design webu"
            maxLength={160}
            className={inputClass}
            style={inputStyle}
          />
          <textarea
            value={draftDetail}
            onChange={(event) => setDraftDetail(event.target.value)}
            placeholder="Nepovinný delší popis"
            rows={2}
            className={inputClass}
            style={inputStyle}
          />
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={draftPublic}
              onChange={(event) => setDraftPublic(event.target.checked)}
              className="h-4 w-4"
              style={{ accentColor: "var(--a-brand)" }}
            />
            Zobrazit i na webu
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveManualEntry}
              disabled={saving || !draftTitle.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--a-ink)" }}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Uložit
            </button>
            <button
              type="button"
              onClick={() => setComposerOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ color: "var(--a-muted)" }}
            >
              Zrušit
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            data-active={filter === item.value}
            aria-pressed={filter === item.value}
            className="wbx-filter"
          >
            {item.label}
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
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="py-8 text-center text-sm font-medium" style={{ color: "var(--a-muted)" }}>
          Zatím tu nic není.
        </p>
      ) : (
        <ul>
          {entries.map((entry) => {
            const locked = (ALWAYS_INTERNAL as readonly string[]).includes(entry.type);
            return (
              <li
                key={entry.id}
                className="flex flex-wrap items-start gap-x-4 gap-y-2 border-t py-4"
                style={{ borderColor: "var(--a-border-row)" }}
              >
                <time
                  dateTime={new Date(entry.createdAt * 1000).toISOString()}
                  className="w-[140px] shrink-0 text-[13px] font-medium"
                  style={{ color: "var(--a-muted)" }}
                >
                  {formatChangeDateTime(entry.createdAt)}
                </time>

                <TypeBadge type={entry.type} />

                <div className="min-w-[220px] flex-1">
                  <p className="text-[15px] font-semibold">{entry.title}</p>
                  {entry.detail && (
                    <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--a-muted)" }}>
                      {entry.detail}
                    </p>
                  )}
                  {entry.author && (
                    <p className="mt-0.5 text-[12px]" style={{ color: "var(--a-nav-idle)" }}>
                      {entry.author}
                    </p>
                  )}
                </div>

                {locked ? (
                  <span
                    className="shrink-0 text-[12px] font-medium"
                    style={{ color: "var(--a-nav-idle)" }}
                    title="Tento typ se na web nikdy nezobrazuje"
                  >
                    vždy interní
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleVisibility(entry)}
                    disabled={togglingId === entry.id}
                    aria-pressed={entry.isPublic}
                    title={entry.isPublic ? "Zobrazuje se na webu" : "Jen pro interní potřebu"}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-bold disabled:opacity-60"
                    style={
                      entry.isPublic
                        ? {
                            color: "var(--a-brand-soft)",
                            borderColor: "var(--a-brand-soft)",
                            background: "rgba(13,148,136,.09)",
                          }
                        : {
                            color: "var(--a-muted)",
                            borderColor: "var(--a-border)",
                            background: "var(--a-bg)",
                          }
                    }
                  >
                    {entry.isPublic ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                    {entry.isPublic ? "Veřejné" : "Interní"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {hasMore && !loading && (
        <div className="pt-5 text-center">
          <button
            type="button"
            onClick={() => load(filter, entries.length)}
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
