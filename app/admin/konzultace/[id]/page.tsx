"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Copy, Loader2, Printer } from "lucide-react";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { STEPS, answerText, isAnswered, progress, recapMarkdown, type Answer, type Answers, type Question } from "@/lib/consultation/questions";

/**
 * The consultation call, one topic at a time.
 *
 * On the left what to ask, in the words to say it; on the right the recap
 * growing as the answers come in. Every change is saved a moment after it is
 * made, so a dropped call or a closed tab loses nothing.
 */
const muted = { color: "var(--a-muted)" };
const field = "w-full rounded-lg border px-3 py-2.5 text-[15px] outline-none focus:border-[color:var(--a-brand)]";
const fieldStyle = { borderColor: "var(--a-border)", background: "var(--a-bg)", color: "var(--a-ink)" };

function Field({ q, value, onChange }: { q: Question; value: Answer | undefined; onChange: (v: Answer) => void }) {
  if (q.type === "choice" || q.type === "multi") {
    const selected = Array.isArray(value) ? value : value ? [value] : [];
    const toggle = (option: string) => {
      if (q.type === "choice") onChange(selected[0] === option ? "" : option);
      else onChange(selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option]);
    };
    return (
      <div className="flex flex-wrap gap-2">
        {q.options?.map((option) => {
          const on = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              aria-pressed={on}
              className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[14px] font-bold"
              style={on ? { background: "var(--a-brand)", borderColor: "var(--a-brand)", color: "#fff" } : { borderColor: "var(--a-border)", color: "var(--a-ink)" }}
            >
              {on && <Check className="h-3.5 w-3.5" />}
              {option}
            </button>
          );
        })}
      </div>
    );
  }
  const text = typeof value === "string" ? value : "";
  return q.type === "long" ? (
    <textarea value={text} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={q.placeholder} className={field} style={fieldStyle} />
  ) : (
    <input value={text} onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder} className={field} style={fieldStyle} />
  );
}

export default function ConsultationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAdminAuth();
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<Answers>({});

  useEffect(() => {
    if (!user || !id) return;
    fetch(`/api/admin/konzultace?id=${encodeURIComponent(id)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) return setNotFound(true);
        latest.current = d.consultation.answers;
        setAnswers(d.consultation.answers);
        setSavedAt(d.consultation.updatedAt);
      });
  }, [user, id]);

  const save = useCallback(async () => {
    setSaveState("saving");
    try {
      const response = await fetch("/api/admin/konzultace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, answers: latest.current }),
      });
      const data = await response.json();
      if (!data.success) throw new Error();
      setSavedAt(data.savedAt);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }, [id]);

  const change = (questionId: string, value: Answer) => {
    const next = { ...latest.current, [questionId]: value };
    latest.current = next;
    setAnswers(next);
    setSaveState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(save, 700);
  };

  // A tab closed mid-sentence should not lose the sentence.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (saveState !== "saved") e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveState]);

  if (notFound) {
    return (
      <div className="wbx-card p-[22px]">
        <p className="font-bold" style={{ color: "var(--a-ink)" }}>Tahle konzultace neexistuje.</p>
        <Link href="/admin/konzultace" className="mt-2 inline-block text-[14px] font-bold" style={{ color: "var(--a-brand)" }}>Zpět na seznam</Link>
      </div>
    );
  }
  if (!user || !answers) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin" style={muted} />
      </div>
    );
  }

  const step = STEPS[stepIndex];
  const p = progress(answers);
  const recap = recapMarkdown(answers, { date: new Date(savedAt ?? Date.now()).toLocaleDateString("cs-CZ"), by: user.name });
  const copy = async () => {
    await navigator.clipboard.writeText(recap);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Who, how far, and whether it is saved */}
      <div className="wbx-card flex flex-wrap items-center justify-between gap-4 p-[18px] print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/admin/konzultace" className="rounded-lg border p-2" style={{ borderColor: "var(--a-border)", color: "var(--a-ink)" }} aria-label="Zpět na seznam">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-[17px] font-bold" style={{ color: "var(--a-ink)" }}>
              {answerText(answers.company) || answerText(answers.contactName) || "Nová konzultace"}
            </p>
            <p className="text-[13px]" style={muted}>
              Povinné údaje {p.requiredDone}/{p.requiredTotal} · vyplněno {p.answered} z {p.total} otázek
            </p>
          </div>
        </div>
        <p className="text-[13px] font-bold" style={{ color: saveState === "error" ? "#b91c1c" : "var(--a-muted)" }}>
          {saveState === "saving" && "Ukládám…"}
          {saveState === "saved" && (savedAt ? `Uloženo ${new Date(savedAt).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}` : "Zatím nic k uložení")}
          {saveState === "error" && "Neuloženo! Zkontrolujte připojení."}
          {saveState === "error" && (
            <button type="button" onClick={save} className="ml-2 underline">Zkusit znovu</button>
          )}
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[220px_1fr_400px]">
        {/* Steps */}
        <nav className="wbx-card h-fit p-3 print:hidden">
          {STEPS.map((s, i) => {
            const done = s.questions.filter((q) => isAnswered(answers[q.id])).length;
            const missing = s.questions.some((q) => q.required && !isAnswered(answers[q.id]));
            const active = i === stepIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStepIndex(i)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-[14px] font-bold"
                style={active ? { background: "var(--a-ink)", color: "#fff" } : { color: "var(--a-ink)" }}
              >
                <span>{i + 1}. {s.title}</span>
                {/* A tick means the step is covered — not merely that nothing in it is required. */}
                <span className="shrink-0 text-[12px]" style={{ color: active ? "#fff" : missing ? "#b45309" : done ? "var(--a-brand)" : "var(--a-muted)" }}>
                  {!missing && done > 0 ? <Check className="h-4 w-4" /> : `${done}/${s.questions.length}`}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Questions */}
        <div className="wbx-card p-[26px] print:hidden">
          <p className="text-[13px] font-bold uppercase tracking-wide" style={muted}>Krok {stepIndex + 1} z {STEPS.length}</p>
          <p className="mt-1 text-[22px] font-extrabold" style={{ color: "var(--a-ink)" }}>{step.title}</p>
          <p className="mt-1 text-[14px]" style={muted}>{step.intro}</p>

          <div className="mt-6 space-y-6">
            {step.questions.map((q) => (
              <div key={q.id}>
                <p className="text-[16px] font-medium leading-relaxed" style={{ color: "var(--a-ink)" }}>„{q.ask}“</p>
                <p className="mb-2 mt-0.5 text-[12px] font-bold uppercase tracking-wide" style={muted}>
                  {q.label}
                  {q.required && !isAnswered(answers[q.id]) && <span style={{ color: "#b45309" }}> · potřebujeme</span>}
                </p>
                <Field q={q} value={answers[q.id]} onChange={(v) => change(q.id, v)} />
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button type="button" onClick={() => setStepIndex((i) => Math.max(0, i - 1))} disabled={stepIndex === 0} className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-[14px] font-bold disabled:opacity-40" style={{ borderColor: "var(--a-border)", color: "var(--a-ink)" }}>
              <ChevronLeft className="h-4 w-4" /> Zpět
            </button>
            {stepIndex < STEPS.length - 1 ? (
              <button type="button" onClick={() => setStepIndex((i) => i + 1)} className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-[14px] font-bold text-white" style={{ background: "var(--a-brand)" }}>
                Další: {STEPS[stepIndex + 1].title} <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <p className="text-[14px] font-bold" style={{ color: p.missing.length ? "#b45309" : "var(--a-brand)" }}>
                {p.missing.length ? `Ještě chybí ${p.missing.length} povinných údajů` : "Máte všechno potřebné"}
              </p>
            )}
          </div>
        </div>

        {/* Recap */}
        <aside className="wbx-card h-fit p-[22px] xl:sticky xl:top-4">
          <div className="flex items-center justify-between gap-2 print:hidden">
            <p className="text-[13px] font-bold uppercase tracking-wide" style={muted}>Rekapitulace</p>
            <div className="flex gap-2">
              <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-bold" style={{ borderColor: "var(--a-border)", color: "var(--a-ink)" }}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Zkopírováno" : "Kopírovat"}
              </button>
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-bold" style={{ borderColor: "var(--a-border)", color: "var(--a-ink)" }}>
                <Printer className="h-3.5 w-3.5" /> Tisk
              </button>
            </div>
          </div>

          <p className="mt-3 hidden text-[20px] font-extrabold print:block" style={{ color: "var(--a-ink)" }}>
            Rekapitulace konzultace: {answerText(answers.company) || answerText(answers.contactName)}
          </p>

          {p.answered === 0 ? (
            <p className="mt-3 text-[14px]" style={muted}>Začne se plnit s první odpovědí.</p>
          ) : (
            <div className="mt-3 space-y-4">
              {STEPS.map((s) => {
                const rows = s.questions.filter((q) => isAnswered(answers[q.id]));
                if (!rows.length) return null;
                return (
                  <div key={s.id}>
                    <p className="text-[13px] font-extrabold" style={{ color: "var(--a-ink)" }}>{s.title}</p>
                    <dl className="mt-1 space-y-1.5">
                      {rows.map((q) => (
                        <div key={q.id} className="text-[13px]">
                          <dt className="inline font-bold" style={muted}>{q.label}: </dt>
                          <dd className="inline whitespace-pre-wrap" style={{ color: "var(--a-ink)" }}>{answerText(answers[q.id])}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })}
            </div>
          )}

          {p.missing.length > 0 && (
            <div className="mt-5 rounded-lg border p-3" style={{ borderColor: "#f59e0b" }}>
              <p className="text-[13px] font-extrabold" style={{ color: "#b45309" }}>Chybí doplnit ({p.missing.length})</p>
              <ul className="mt-1.5 space-y-1">
                {p.missing.map((q) => (
                  <li key={q.id}>
                    <button
                      type="button"
                      onClick={() => setStepIndex(STEPS.findIndex((s) => s.questions.some((x) => x.id === q.id)))}
                      className="text-left text-[13px] underline print:no-underline"
                      style={{ color: "var(--a-ink)" }}
                    >
                      {q.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
