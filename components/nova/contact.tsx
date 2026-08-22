"use client";

import { useState } from "react";
import { HoneypotInput } from "@/components/security/HoneypotInput";

const DETAILS = [
  { label: "Adresa", value: "Revoluční 8, Praha 1" },
  { label: "Otevírací doba", value: "Po–Pá 8:00–18:00" },
  { label: "Odpověď", value: "do 24 hodin" },
];

const PROJECT_TYPES = [
  { value: "web", label: "Nový web" },
  { value: "redesign", label: "Redesign webu" },
  { value: "eshop", label: "E-shop" },
  { value: "seo", label: "SEO / marketing" },
  { value: "other", label: "Něco jiného" },
];

const inputStyle = {
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.18)",
  borderRadius: 12,
  color: "#ffffff",
} as const;

export function NovaContact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    companyName: "",
    projectType: "",
    description: "",
  });
  const [gdprConsent, setGdprConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.companyName.trim() || !form.projectType || !form.description.trim()) {
      setError("Vyplňte prosím všechna povinná pole.");
      return;
    }

    if (!gdprConsent) {
      setError("Bez souhlasu se zpracováním osobních údajů nemůžeme zprávu odeslat.");
      return;
    }

    setStatus("sending");

    try {
      const domData = new FormData(event.currentTarget);
      const botFields: Record<string, string> = {};
      domData.forEach((value, key) => {
        if (typeof value === "string" && key.startsWith("website_url_")) {
          botFields[key] = value;
        }
      });
      const timestamp = domData.get("__form_timestamp");

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ...botFields,
          __form_timestamp: timestamp ? Number(timestamp) : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Odeslání se nezdařilo. Zkuste to prosím znovu.");
      }

      if (typeof window !== "undefined") {
        (window as any).fbq?.("track", "Lead");
        (window as any).gtag?.("event", "generate_lead", { currency: "CZK", value: 10000 });
      }

      setStatus("sent");
      setForm({ name: "", email: "", companyName: "", projectType: "", description: "" });
      setGdprConsent(false);
    } catch (err: any) {
      setStatus("idle");
      setError(err.message || "Odeslání se nezdařilo. Zkuste to prosím znovu.");
    }
  };

  return (
    <section
      id="kontakt"
      className="scroll-mt-20"
      style={{ background: "var(--n-ink)", color: "#ffffff" }}
    >
      <div className="nova-container nova-section text-center">
        <h2
          className="font-extrabold"
          style={{
            fontSize: "clamp(38px, 5.4vw, 72px)",
            letterSpacing: "-.045em",
            lineHeight: 1.02,
            margin: 0,
          }}
        >
          Pojďme na váš web.
        </h2>
        <p
          className="mx-auto mt-6 max-w-[520px] text-xl font-medium"
          style={{ color: "var(--n-text-dim)" }}
        >
          Napište nezávazně a do 24 hodin se ozveme s návrhem řešení i ceny.
        </p>

        {status === "sent" ? (
          <div
            className="mx-auto mt-10 max-w-[560px] rounded-[18px] p-8 text-left"
            style={{ background: "rgba(20,184,166,.12)", border: "1px solid rgba(45,212,191,.4)" }}
          >
            <p className="text-lg font-bold">Zpráva odeslána.</p>
            <p className="mt-2 text-[15px] font-medium" style={{ color: "var(--n-text-dim)" }}>
              Ozveme se vám do 24 hodin. Pokud spěcháte, zavolejte na +420 702 110 166.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 max-w-[560px] text-left"
            noValidate
          >
            <HoneypotInput />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="nova-label" style={{ color: "var(--n-text-dim)" }}>
                  Jméno *
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="mt-2 w-full px-4 py-3 text-[15px] font-medium"
                  style={inputStyle}
                  autoComplete="name"
                />
              </label>

              <label className="block">
                <span className="nova-label" style={{ color: "var(--n-text-dim)" }}>
                  E-mail *
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="mt-2 w-full px-4 py-3 text-[15px] font-medium"
                  style={inputStyle}
                  autoComplete="email"
                />
              </label>

              <label className="block">
                <span className="nova-label" style={{ color: "var(--n-text-dim)" }}>
                  Firma / projekt *
                </span>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  className="mt-2 w-full px-4 py-3 text-[15px] font-medium"
                  style={inputStyle}
                  autoComplete="organization"
                />
              </label>

              <label className="block">
                <span className="nova-label" style={{ color: "var(--n-text-dim)" }}>
                  Co potřebujete? *
                </span>
                <select
                  value={form.projectType}
                  onChange={(e) => update("projectType", e.target.value)}
                  className="mt-2 w-full px-4 py-3 text-[15px] font-medium"
                  style={inputStyle}
                >
                  <option value="" style={{ color: "#0F172A" }}>
                    Vyberte…
                  </option>
                  {PROJECT_TYPES.map((type) => (
                    <option key={type.value} value={type.value} style={{ color: "#0F172A" }}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-3 block">
              <span className="nova-label" style={{ color: "var(--n-text-dim)" }}>
                Stručně o projektu *
              </span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className="mt-2 w-full px-4 py-3 text-[15px] font-medium"
                style={inputStyle}
                placeholder="Čím se zabýváte a co od webu čekáte?"
              />
            </label>

            <label className="mt-4 flex items-start gap-3 text-[14px] font-medium">
              <input
                type="checkbox"
                checked={gdprConsent}
                onChange={(e) => setGdprConsent(e.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <span style={{ color: "var(--n-text-dim)" }}>
                Souhlasím se zpracováním osobních údajů podle{" "}
                <a href="/ochrana-udaju" className="underline">
                  zásad ochrany osobních údajů
                </a>
                . *
              </span>
            </label>

            {error && (
              <p className="mt-4 text-[14px] font-semibold" style={{ color: "#FCA5A5" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-6 w-full rounded-full py-4 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "var(--n-brand)" }}
            >
              {status === "sending" ? "Odesílám…" : "Odeslat nezávaznou poptávku"}
            </button>
          </form>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
          <a
            href="mailto:info@weblyx.cz"
            className="rounded-full px-8 py-[15px] text-[17px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--n-brand)" }}
          >
            info@weblyx.cz
          </a>
          <a
            href="tel:+420702110166"
            className="rounded-full border px-8 py-[15px] text-[17px] font-semibold transition-colors"
            style={{ borderColor: "rgba(255,255,255,.3)" }}
          >
            +420 702 110 166
          </a>
        </div>

        <dl className="mt-16 flex flex-wrap justify-center gap-12 text-left">
          {DETAILS.map((detail) => (
            <div key={detail.label}>
              <dt
                className="mb-1.5 text-[13px] font-semibold"
                style={{ color: "var(--n-text-dim)" }}
              >
                {detail.label}
              </dt>
              <dd className="text-base font-medium">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
