"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";

/**
 * The figures about the studio that the site quotes.
 *
 * One number, typed once: how many projects we have delivered. The homepage,
 * the About page, the portfolio and every landing page read it from here, so
 * it cannot say one thing in one place and another elsewhere.
 */
const PLACES = [
  "Lišta s čísly na úvodní stránce",
  "Stránka O nás",
  "Konec stránky Portfolio („Celkem jsme jich dokončili přes…“)",
  "Vstupní stránky: Praha, Brno, Ostrava, web pro malé firmy, nabídka Praha, CRM a rezervační systém na míru",
  "Německý web seitelyx.de",
];

export default function SiteFiguresPage() {
  const { user } = useAdminAuth();
  const [value, setValue] = useState("");
  const [shownAs, setShownAs] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/site-stats", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setValue(String(d.completedProjects));
          setShownAs(d.shownAs);
        }
      });
  }, [user]);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/site-stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedProjects: value }),
      });
      const data = await response.json();
      if (data.success) {
        setShownAs(data.shownAs);
        setMessage(`Uloženo. Web teď všude uvádí ${data.shownAs}.`);
      } else setMessage(data.error ?? "Uložení se nepovedlo.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;
  const muted = { color: "var(--a-muted)" };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="wbx-card p-[26px]">
        <p className="text-[17px] font-bold" style={{ color: "var(--a-ink)" }}>Počet dokončených projektů</p>
        <p className="mt-1 text-[14px]" style={muted}>
          Všechny projekty, které jste dodali, i ty, které klient nedovolil zveřejnit. Portfolio jich ukazuje jen část;
          tohle číslo říká, kolik jich je doopravdy.
        </p>

        <div className="mt-5 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-[13px] font-bold" style={{ color: "var(--a-ink)" }}>Počet</span>
            <input
              type="number"
              min={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-36 rounded-lg border px-3 py-2 text-[18px] font-bold outline-none focus:border-[color:var(--a-brand)]"
              style={{ borderColor: "var(--a-border)", background: "var(--a-bg)", color: "var(--a-ink)" }}
            />
          </label>
          <button
            type="button"
            onClick={save}
            disabled={saving || !value}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[14px] font-bold text-white disabled:opacity-60"
            style={{ background: "var(--a-ink)" }}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Uložit a propsat na web
          </button>
          {shownAs && (
            <p className="pb-2 text-[14px]" style={muted}>
              Na webu se zobrazuje jako <strong style={{ color: "var(--a-ink)" }}>{shownAs}</strong>
            </p>
          )}
        </div>

        <p className="mt-3 text-[13px]" style={muted}>
          Číslo se zaokrouhluje dolů na pětky a přidá se plus (57 se ukáže jako 55+), aby web nikdy netvrdil víc, než je pravda.
        </p>
        {message && <p className="mt-3 text-[14px] font-bold" style={{ color: "var(--a-brand)" }}>{message}</p>}
      </div>

      <div className="wbx-card p-[26px]">
        <p className="text-[15px] font-bold" style={{ color: "var(--a-ink)" }}>Kde všude se číslo ukazuje</p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px]" style={{ color: "var(--a-ink)" }}>
          {PLACES.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <p className="mt-4 text-[13px]" style={muted}>
          Mimo web číslo neměníme: v odkazech Google Ads a ve firemním profilu na Googlu ho upravte ručně.
        </p>
      </div>
    </div>
  );
}
