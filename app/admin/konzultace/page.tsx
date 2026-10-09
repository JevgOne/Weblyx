"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";

/**
 * Consultations: the calls where a website is scoped with the client.
 *
 * The list shows the ones already held, with what was agreed as the next step,
 * and the enquiries that have not had one yet — a consultation always belongs
 * to an enquiry, so a client is never in two places.
 */
interface Item {
  leadId: string;
  name: string;
  company: string;
  contact: string;
  held: boolean;
  requiredDone: number;
  requiredTotal: number;
  nextStep: string;
  nextStepWhen: string;
  updatedAt: number | null;
  updatedBy: string;
}

const muted = { color: "var(--a-muted)" };
const when = (ms: number | null) =>
  ms ? new Date(ms).toLocaleString("cs-CZ", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

export default function ConsultationsPage() {
  const { user } = useAdminAuth();
  const [items, setItems] = useState<Item[] | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/konzultace", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setItems(d.success ? d.items : []));
  }, [user]);

  const create = async () => {
    setCreating(true);
    const response = await fetch("/api/admin/konzultace", { method: "POST" });
    const data = await response.json();
    if (data.success) window.location.href = `/admin/konzultace/${data.id}`;
    else setCreating(false);
  };

  if (!user || !items) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin" style={muted} />
      </div>
    );
  }

  const held = items.filter((i) => i.held);
  const waiting = items.filter((i) => !i.held);

  const row = (i: Item) => (
    <li key={i.leadId} className="flex flex-wrap items-center justify-between gap-3 border-t py-3.5 first:border-t-0" style={{ borderColor: "var(--a-border-row)" }}>
      <div className="min-w-0">
        <p className="text-[15px] font-bold" style={{ color: "var(--a-ink)" }}>{i.company || i.name || "Bez názvu"}</p>
        <p className="mt-0.5 text-[13px]" style={muted}>
          {[i.company && i.name, i.contact].filter(Boolean).join(" · ") || "Kontakt zatím není vyplněný"}
        </p>
        {i.held && (
          <p className="mt-1 text-[13px]" style={{ color: "var(--a-ink)" }}>
            Povinné údaje {i.requiredDone}/{i.requiredTotal}
            {i.nextStep && ` · další krok: ${i.nextStep}${i.nextStepWhen ? ` (${i.nextStepWhen})` : ""}`}
            <span style={muted}>{i.updatedAt ? ` · ${when(i.updatedAt)}${i.updatedBy ? `, ${i.updatedBy}` : ""}` : ""}</span>
          </p>
        )}
      </div>
      <Link
        href={`/admin/konzultace/${i.leadId}`}
        className="rounded-lg border px-4 py-2 text-[14px] font-bold"
        style={i.held ? { borderColor: "var(--a-border)", color: "var(--a-ink)" } : { borderColor: "var(--a-brand)", color: "var(--a-brand)" }}
      >
        {i.held ? "Otevřít" : "Začít konzultaci"}
      </Link>
    </li>
  );

  return (
    <div className="space-y-5">
      <div className="wbx-card flex flex-wrap items-center justify-between gap-4 p-[22px]">
        <div>
          <p className="text-[17px] font-bold" style={{ color: "var(--a-ink)" }}>Konzultace s klientem</p>
          <p className="mt-1 max-w-xl text-[14px]" style={muted}>
            Průvodce hovorem: krok za krokem se zeptáte na všechno, co je potřeba k nacenění a stavbě webu. Odpovědi se
            ukládají samy a na konci máte rekapitulaci.
          </p>
        </div>
        <button
          type="button"
          onClick={create}
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[14px] font-bold text-white disabled:opacity-60"
          style={{ background: "var(--a-ink)" }}
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Nová konzultace
        </button>
      </div>

      <div className="wbx-card p-[22px]">
        <p className="text-[13px] font-bold uppercase tracking-wide" style={muted}>Proběhlé a rozpracované ({held.length})</p>
        {held.length ? <ul className="mt-2">{held.map(row)}</ul> : <p className="mt-3 text-[14px]" style={muted}>Zatím žádná konzultace.</p>}
      </div>

      {waiting.length > 0 && (
        <div className="wbx-card p-[22px]">
          <p className="text-[13px] font-bold uppercase tracking-wide" style={muted}>Poptávky bez konzultace ({waiting.length})</p>
          <ul className="mt-2">{waiting.map(row)}</ul>
        </div>
      )}
    </div>
  );
}
