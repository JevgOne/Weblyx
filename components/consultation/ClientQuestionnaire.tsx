"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { CLIENT_REQUIRED, type Answer, type Answers } from "@/lib/consultation/questions";

interface ClientQuestion {
  id: string;
  text: string;
  type: "text" | "long" | "choice" | "multi";
  options: string[];
}

const field =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[16px] text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20";

/**
 * The short questionnaire a client fills alone, from a link.
 * One page, no steps: twelve questions do not need a wizard.
 */
export function ClientQuestionnaire({
  token,
  questions,
  initial,
}: {
  token: string;
  questions: ClientQuestion[];
  initial: Answers;
}) {
  const [answers, setAnswers] = useState<Answers>(initial);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (id: string, value: Answer) => setAnswers((prev) => ({ ...prev, [id]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const response = await fetch(`/api/dotaznik/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || "Odeslání se nepovedlo. Zkuste to prosím znovu.");
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Odeslání se nepovedlo. Zkuste to prosím znovu.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="mt-10 rounded-2xl border border-teal-200 bg-teal-50 p-7">
        <p className="flex items-center gap-2 text-[20px] font-extrabold text-slate-900">
          <Check className="h-6 w-6 text-teal-700" /> Děkujeme, máme to.
        </p>
        <p className="mt-2 text-[16px] leading-relaxed text-slate-700">
          Odpovědi dorazily. Ozveme se vám s nabídkou a domluvíme krátkou konzultaci, kde doladíme vzhled a detaily.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-10 space-y-8">
      {questions.map((q, index) => {
        const value = answers[q.id];
        const required = CLIENT_REQUIRED.includes(q.id);
        const selected = Array.isArray(value) ? value : value ? [value] : [];
        return (
          <div key={q.id}>
            <label htmlFor={`q-${q.id}`} className="block text-[17px] font-bold text-slate-900">
              <span className="mr-2 text-teal-700">{index + 1}.</span>
              {q.text}
              {!required && <span className="ml-2 text-[13px] font-medium text-slate-400">nepovinné</span>}
            </label>
            <div className="mt-3">
              {q.type === "choice" || q.type === "multi" ? (
                <div className="flex flex-wrap gap-2" role="group" aria-label={q.text}>
                  {q.options.map((option) => {
                    const on = selected.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          q.type === "choice"
                            ? set(q.id, on ? "" : option)
                            : set(q.id, on ? selected.filter((o) => o !== option) : [...selected, option])
                        }
                        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-left text-[15px] font-semibold transition-colors ${
                          on
                            ? "border-teal-700 bg-teal-700 text-white"
                            : "border-slate-300 bg-white text-slate-800 hover:border-teal-600"
                        }`}
                      >
                        {on && <Check className="h-4 w-4 shrink-0" />}
                        {option}
                      </button>
                    );
                  })}
                </div>
              ) : q.type === "long" ? (
                <textarea
                  id={`q-${q.id}`}
                  rows={3}
                  required={required}
                  value={typeof value === "string" ? value : ""}
                  onChange={(e) => set(q.id, e.target.value)}
                  className={field}
                />
              ) : (
                <input
                  id={`q-${q.id}`}
                  required={required}
                  type={q.id === "email" ? "email" : q.id === "phone" ? "tel" : "text"}
                  value={typeof value === "string" ? value : ""}
                  onChange={(e) => set(q.id, e.target.value)}
                  className={field}
                />
              )}
            </div>
          </div>
        );
      })}

      {error && <p className="text-[15px] font-semibold text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-[16px] font-bold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {sending && <Loader2 className="h-4 w-4 animate-spin" />}
        Odeslat odpovědi
      </button>
    </form>
  );
}
