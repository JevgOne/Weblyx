"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CHANGE_TYPE_COLORS,
  CHANGE_TYPE_LABELS,
  formatChangeDateTime,
  type ChangelogEntry,
} from "@/lib/changelog/types";

/**
 * The last five archive entries on the dashboard.
 *
 * Fetched client-side like the rest of this page rather than passed down: the
 * dashboard is a client component and this block is the least important thing
 * on it, so it must never be what a visitor waits for.
 */
export function RecentChanges({ limit = 5 }: { limit?: number }) {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/admin/changelog?limit=${limit}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json?.success) setEntries(json.data.entries);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return (
    <div className="wbx-card p-[26px]">
      <div className="mb-[18px] flex items-center justify-between gap-4">
        <h2 className="text-[17px] font-bold" style={{ letterSpacing: "-.02em" }}>
          Archiv změn
        </h2>
        <Link href="/admin/archiv" className="text-sm font-semibold" style={{ color: "var(--a-brand)" }}>
          Celý archiv ›
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="py-6 text-sm font-medium" style={{ color: "var(--a-muted)" }}>
          Zatím žádné zaznamenané změny.
        </p>
      ) : (
        <ul>
          {entries.map((entry) => {
            const color = CHANGE_TYPE_COLORS[entry.type];
            return (
              <li
                key={entry.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t py-3"
                style={{ borderColor: "var(--a-border-row)" }}
              >
                <span
                  className="shrink-0 text-[13px] font-medium"
                  style={{ color: "var(--a-muted)", minWidth: 130 }}
                >
                  {formatChangeDateTime(entry.createdAt)}
                </span>
                <span
                  className="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[12px] font-bold"
                  style={{ color: color.fg, background: color.bg }}
                >
                  {CHANGE_TYPE_LABELS[entry.type]}
                </span>
                <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
                  {entry.title}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
