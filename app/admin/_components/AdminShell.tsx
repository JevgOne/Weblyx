"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAdminAuth } from "./AdminAuthProvider";
import type { Permission } from "@/lib/auth/permissions";

interface NavItem {
  label: string;
  href: string;
  /** Omitted for items every signed-in user may open. */
  permission?: Permission;
  /** Subtitle shown under the page title in the topbar. */
  subtitle: string;
  /** Shows the count of new leads. */
  badge?: "newLeads";
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

/**
 * The prototype ships five sections; this panel has far more, so they are
 * grouped. Order and labels follow the existing dashboard tiles so nobody has
 * to relearn where things live.
 */
const NAV: NavGroup[] = [
  {
    items: [
      { label: "Přehled", href: "/admin/dashboard", permission: "dashboard", subtitle: "Souhrn aktivity vašeho studia" },
      { label: "Poptávky", href: "/admin/leads", permission: "leads", subtitle: "Příchozí poptávky z webu", badge: "newLeads" },
      { label: "Projekty", href: "/admin/projects", permission: "projects", subtitle: "Rozpracované a hotové weby" },
    ],
  },
  {
    title: "Obsah",
    items: [
      { label: "Portfolio", href: "/admin/portfolio", permission: "portfolio", subtitle: "Reference zobrazené na webu" },
      { label: "Recenze", href: "/admin/reviews", permission: "reviews", subtitle: "Hodnocení od klientů" },
      { label: "Blog", href: "/admin/blog", permission: "blog", subtitle: "Články a jejich publikace" },
      { label: "Stránky", href: "/admin/content", permission: "content", subtitle: "Texty sekcí na webu" },
      { label: "Média", href: "/admin/media", permission: "media", subtitle: "Nahrané obrázky a soubory" },
    ],
  },
  {
    title: "Obchod",
    items: [
      { label: "Ceník", href: "/admin/content/pricing", permission: "content", subtitle: "Balíčky, hodiny a sazba" },
      { label: "Slevové kódy", href: "/admin/promo-codes", permission: "promo_codes", subtitle: "Promo kódy a jejich platnost" },
      { label: "Platby", href: "/admin/payments", permission: "payments", subtitle: "Přijaté a čekající platby" },
      { label: "Faktury", href: "/admin/invoices", permission: "invoices", subtitle: "Vystavené faktury" },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "Statistiky", href: "/admin/stats", permission: "stats", subtitle: "Návštěvnost a výkon webu" },
      { label: "Marketing", href: "/admin/marketing", subtitle: "Google a Meta kampaně" },
      { label: "AI asistent", href: "/admin/ai-assistant", subtitle: "Generování textů a návrhů" },
      { label: "Web leady", href: "/admin/web-leads", permission: "web_analyzer", subtitle: "Firmy se zastaralým webem" },
      { label: "Lead generation", href: "/admin/lead-generation", permission: "lead_generation", subtitle: "Vyhledávání nových kontaktů" },
      { label: "Eroweb analýza", href: "/admin/eroweb-analyza", permission: "eroweb", subtitle: "Analýza konkurence" },
    ],
  },
  {
    title: "Provoz",
    items: [
      { label: "Úkoly", href: "/admin/tasks", permission: "tasks", subtitle: "Interní úkoly týmu" },
      { label: "Nastavení", href: "/admin/settings", permission: "settings", subtitle: "Konfigurace panelu" },
      { label: "Uživatelé", href: "/admin/users", permission: "users", subtitle: "Účty a role" },
      { label: "Logy", href: "/admin/activity-logs", permission: "users", subtitle: "Historie změn v panelu" },
    ],
  },
];

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, can } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newLeads, setNewLeads] = useState<number | null>(null);

  // Close the drawer whenever navigation happens.
  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((result) => {
        if (cancelled || !result?.success) return;
        const count = result.data?.leads?.new ?? result.data?.leads?.total ?? null;
        if (typeof count === "number") setNewLeads(count);
      })
      .catch(() => {
        // Badge is decorative — a failed count simply stays hidden.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleGroups = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || can(item.permission)),
  })).filter((group) => group.items.length > 0);

  const allItems = visibleGroups.flatMap((group) => group.items);
  // Longest matching href wins, so /admin/lead-generation does not light up
  // /admin/leads.
  const active = allItems
    .filter((item) => pathname === item.href || pathname?.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  const displayName = user?.name || user?.email || "Admin";

  const sidebar = (
    <aside
      className="flex h-full w-64 shrink-0 flex-col px-[18px] py-[26px] text-white"
      style={{ background: "var(--a-ink)" }}
    >
      <div className="flex items-center gap-2.5 px-2 pb-[26px]">
        <span
          className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-white text-[17px] font-extrabold"
          style={{ color: "var(--a-ink)", letterSpacing: "-.03em" }}
        >
          W
        </span>
        <span className="text-[18px] font-bold" style={{ letterSpacing: "-.02em" }}>
          Weblyx
        </span>
        <span
          className="ml-auto rounded-full border px-[7px] py-0.5 text-[11px] font-semibold"
          style={{ color: "var(--a-muted)", borderColor: "rgba(255,255,255,.18)" }}
        >
          Admin
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {visibleGroups.map((group, index) => (
          <div key={group.title ?? `group-${index}`}>
            {group.title && <div className="wbx-nav-group">{group.title}</div>}
            <div className="flex flex-col gap-[3px]">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="wbx-nav-item"
                  data-active={active?.href === item.href}
                  aria-current={active?.href === item.href ? "page" : undefined}
                >
                  <span className="wbx-nav-dot" aria-hidden="true" />
                  {item.label}
                  {item.badge === "newLeads" && newLeads ? (
                    <span className="wbx-nav-badge">{newLeads}</span>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div
        className="mt-auto flex items-center gap-[11px] border-t px-2.5 py-3.5"
        style={{ borderColor: "rgba(255,255,255,.1)" }}
      >
        <span
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-sm font-extrabold"
          style={{ background: "var(--a-brand)", color: "var(--a-ink)" }}
        >
          {initialsOf(displayName)}
        </span>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-semibold">{displayName}</div>
          <Link href="/" className="text-xs hover:underline" style={{ color: "var(--a-muted)" }}>
            Zpět na web ›
          </Link>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen lg:block">{sidebar}</div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative h-full">{sidebar}</div>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <div
          className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b px-5 py-[22px] md:px-9"
          style={{
            borderColor: "var(--a-border)",
            background: "rgba(255,255,255,.8)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="lg:hidden"
              aria-label={mobileOpen ? "Zavřít menu" : "Otevřít menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="min-w-0">
              <h1
                className="truncate text-2xl font-extrabold"
                style={{ letterSpacing: "-.03em", margin: 0 }}
              >
                {active?.label ?? "Admin"}
              </h1>
              <p
                className="mt-0.5 truncate text-sm font-medium"
                style={{ color: "var(--a-muted)" }}
              >
                {active?.subtitle ?? "Správa webu Weblyx"}
              </p>
            </div>
          </div>

          <Link
            href="/admin/leads"
            className="shrink-0 rounded-full px-[18px] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--a-ink)" }}
          >
            + Nová poptávka
          </Link>
        </div>

        <div className="flex-1 p-5 md:p-9">{children}</div>
      </main>
    </div>
  );
}
