"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut } from "lucide-react";
import { LanguageSelector } from "@/lib/admin-i18n";
import { canonicalLeadStatus, leadStatusMeta, nextLeadStatus } from "@/lib/leads/status";

interface Stats {
  portfolio: { total: number; published: number };
  blog: { total: number; published: number };
  reviews: { total: number; published: number; featured: number };
  leads: { total: number; new?: number };
}

interface Lead {
  id: string;
  name: string;
  email: string;
  projectType?: string;
  budgetRange?: string;
  status: string;
  createdAt: string;
}

const EMPTY_STATS: Stats = {
  portfolio: { total: 0, published: 0 },
  blog: { total: 0, published: 0 },
  reviews: { total: 0, published: 0, featured: 0 },
  leads: { total: 0 },
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StatCard({
  label,
  value,
  note,
  loading,
}: {
  label: string;
  value: number | string;
  note: string;
  loading: boolean;
}) {
  return (
    <div className="wbx-card p-6">
      <p className="text-[13px] font-semibold" style={{ color: "var(--a-muted)" }}>
        {label}
      </p>
      {loading ? (
        <Skeleton className="mt-3 h-10 w-20" />
      ) : (
        <p className="mt-3 text-[38px] font-extrabold leading-none" style={{ letterSpacing: "-.04em" }}>
          {value}
        </p>
      )}
      <p className="mt-2 text-[13px] font-semibold" style={{ color: "#0F9268" }}>
        {note}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusSaving, setStatusSaving] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch("/api/admin/stats").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/leads").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([statsResult, leadsResult]) => {
        if (cancelled) return;
        if (statsResult?.success) setStats(statsResult.data);

        const list = leadsResult?.leads ?? leadsResult?.data ?? leadsResult;
        if (Array.isArray(list)) setLeads(list);
      })
      .catch((error) => console.error("Dashboard load failed:", error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const derived = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const parsed = leads.map((lead) => ({ ...lead, date: new Date(lead.createdAt) }));

    return {
      newLeads: parsed.filter((l) => l.status === "new").length,
      thisWeek: parsed.filter((l) => l.date >= weekAgo).length,
      thisMonth: parsed.filter((l) => l.date >= monthStart).length,
      closedThisMonth: parsed.filter(
        (l) => l.date >= monthStart && canonicalLeadStatus(l.status) === "done"
      ).length,
      recent: parsed
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5),
    };
  }, [leads]);

  const monthLabel = useMemo(
    () =>
      new Date().toLocaleDateString("cs-CZ", { month: "long", year: "numeric" }),
    []
  );

  // Same cycle as the leads table: optimistic, guarded, rolled back on failure.
  const handleCycleStatus = async (lead: Lead) => {
    if (statusSaving) return;

    const previous = lead.status;
    const next = nextLeadStatus(previous);

    setStatusSaving(lead.id);
    setStatusError(null);
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: next } : l)));

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
      setStatusError(error.message || "Změna stavu selhala.");
    } finally {
      setStatusSaving(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/admin/login");
  };

  return (
    <div>
      {/* Account row — the shell owns the page title, so this only carries
          identity and session actions. */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[15px] font-semibold">{user?.name || user?.email}</p>
          <p className="text-[13px] font-medium" style={{ color: "var(--a-muted)" }}>
            Přihlášen · {monthLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector variant="compact" />
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-50"
            style={{ borderColor: "var(--a-border)" }}
          >
            <LogOut className="h-4 w-4" />
            Odhlásit
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Nové poptávky"
          value={derived.newLeads}
          note={`${derived.thisWeek} za posledních 7 dní`}
          loading={loading}
        />
        <StatCard
          label="Poptávky celkem"
          value={stats.leads.total}
          note={`${derived.thisMonth} tento měsíc`}
          loading={loading}
        />
        <StatCard
          label="Reference na webu"
          value={stats.portfolio.published}
          note={`z ${stats.portfolio.total} celkem`}
          loading={loading}
        />
        <StatCard
          label="Publikované recenze"
          value={stats.reviews.published}
          note={`${stats.reviews.featured} vybraných`}
          loading={loading}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {/* Recent leads */}
        <div className="wbx-card p-[26px]">
          <div className="mb-[18px] flex items-center justify-between gap-4">
            <h2 className="text-[17px] font-bold" style={{ letterSpacing: "-.02em" }}>
              Nejnovější poptávky
            </h2>
            <Link
              href="/admin/leads"
              className="text-sm font-semibold"
              style={{ color: "var(--a-brand)" }}
            >
              Vše ›
            </Link>
          </div>

          {statusError && (
            <p className="mb-3 text-[13px] font-semibold" style={{ color: "#DC2626" }}>
              {statusError}
            </p>
          )}

          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : derived.recent.length === 0 ? (
            <p className="py-6 text-sm font-medium" style={{ color: "var(--a-muted)" }}>
              Zatím žádné poptávky.
            </p>
          ) : (
            <ul>
              {derived.recent.map((lead) => {
                const pill = leadStatusMeta(lead.status);
                return (
                  <li
                    key={lead.id}
                    className="flex items-center gap-3.5 border-t py-3.5"
                    style={{ borderColor: "var(--a-border-row)" }}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
                      style={{ background: "#F1F5F9", color: "#334155" }}
                    >
                      {initialsOf(lead.name || lead.email)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold">{lead.name || lead.email}</p>
                      <p
                        className="truncate text-[13px] font-medium"
                        style={{ color: "var(--a-muted)" }}
                      >
                        {[lead.projectType, lead.budgetRange].filter(Boolean).join(" · ") ||
                          lead.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCycleStatus(lead)}
                      disabled={statusSaving === lead.id}
                      title="Kliknutím posunete stav"
                      className={`${pill.pillClass} disabled:opacity-60`}
                    >
                      {pill.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* This month */}
        <div
          className="flex flex-col rounded-2xl p-[26px] text-white"
          style={{ background: "var(--a-ink)" }}
        >
          <h2 className="text-[17px] font-bold" style={{ letterSpacing: "-.02em" }}>
            Tento měsíc
          </h2>
          <p className="mb-6 mt-1 text-[13px] font-medium capitalize" style={{ color: "var(--a-muted)" }}>
            {monthLabel}
          </p>

          <dl className="flex flex-col gap-[18px]">
            <div>
              <dt className="text-[13px]" style={{ color: "var(--a-muted)" }}>
                Nové poptávky
              </dt>
              <dd className="text-[28px] font-extrabold" style={{ letterSpacing: "-.03em" }}>
                {loading ? "—" : derived.thisMonth}
              </dd>
            </div>
            <div>
              <dt className="text-[13px]" style={{ color: "var(--a-muted)" }}>
                Uzavřené poptávky
              </dt>
              <dd className="text-[28px] font-extrabold" style={{ letterSpacing: "-.03em" }}>
                {loading ? "—" : derived.closedThisMonth}
              </dd>
            </div>
            <div>
              <dt className="text-[13px]" style={{ color: "var(--a-muted)" }}>
                Článků na blogu
              </dt>
              <dd
                className="text-[28px] font-extrabold"
                style={{ letterSpacing: "-.03em", color: "var(--a-brand)" }}
              >
                {loading ? "—" : stats.blog.published}
              </dd>
            </div>
          </dl>

          <Link
            href="/admin/invoices"
            className="mt-auto pt-6 text-sm font-semibold"
            style={{ color: "var(--a-brand)" }}
          >
            Přehled fakturace ›
          </Link>
        </div>
      </div>
    </div>
  );
}
