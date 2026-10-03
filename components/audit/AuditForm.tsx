"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2, Gauge, Search, ShieldCheck, Bot, Check, X, Phone } from "lucide-react";
import confetti from "canvas-confetti";

/**
 * The audit a visitor can actually run.
 *
 * This form used to POST to /api/contact — the generic enquiry endpoint — and
 * answer "we will e-mail you within 48 hours". Meanwhile /api/audit already
 * ran PageSpeed Insights, returned a score and metrics synchronously, mailed
 * the full report and recorded the lead in `audits`. It was simply never
 * called, so no visitor ever saw a number and no web audit ever reached the
 * admin list. It is called now, and the score is shown on the page.
 */
interface AuditMetric {
  label: string;
  value: string;
  score: number;
}

interface AuditCategory {
  key: string;
  label: string;
  score: number;
}

interface AuditFinding {
  severity: "critical" | "warning";
  title: string;
  recommendation: string;
}

interface AuditBenchmark {
  average: number;
  sample: number;
  url: string;
  verdict: string;
}

interface AuditCheck {
  id: string;
  group: "ai" | "google" | "mobile" | "trust";
  label: string;
  ok: boolean | null;
  detail: string;
  fix: string;
}

interface AuditOffer {
  headline: string;
  body: string;
  cta: string;
}

const GROUP_LABELS: Array<[AuditCheck["group"], string]> = [
  ["ai", "Najde vás AI (ChatGPT, Perplexity, Google AI)?"],
  ["google", "Google a mapy"],
  ["mobile", "Zákazník na mobilu"],
  ["trust", "Důvěra a pravidla"],
];

interface AuditResult {
  url: string;
  checks?: AuditCheck[];
  vitals?: Array<{ label: string; value: string; good: boolean }>;
  offer?: AuditOffer;
  score: number;
  metrics: AuditMetric[];
  categories: AuditCategory[];
  findings: AuditFinding[];
  issueCount: number;
  benchmark?: AuditBenchmark;
}

function scoreTone(score: number): { color: string; label: string } {
  if (score >= 90) return { color: "#16a34a", label: "Výborně" };
  if (score >= 50) return { color: "#d97706", label: "Průměr" };
  return { color: "#dc2626", label: "Potřebuje zlepšit" };
}

export function AuditForm() {
  const [formData, setFormData] = useState({ url: "", email: "", name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.url.trim()) { setError("Zadejte URL vašeho webu"); return; }
    if (!formData.email.trim()) { setError("Zadejte váš email"); return; }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: formData.url,
          email: formData.email,
          name: formData.name || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        // The endpoint says what went wrong — a bad URL reads differently
        // from a service outage, and the visitor can act on the difference.
        throw new Error(data?.error || "Analýza se nezdařila");
      }

      setResult(data as AuditResult);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ["#14B8A6", "#06B6D4", "#fff"] });
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Něco se pokazilo. Zkuste to znovu nebo nám napište na info@weblyx.cz"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    const tone = scoreTone(result.score);
    return (
      <Card className="border-primary/20">
        <CardContent className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Výsledek pro</p>
            <p className="font-semibold break-all">{result.url}</p>
          </div>

          <div className="text-center">
            <p className="text-7xl font-extrabold leading-none" style={{ color: tone.color }}>
              {result.score}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">ze 100 · {tone.label}</p>
          </div>

          {result.benchmark && (
            <div
              className="rounded-xl border p-5"
              style={{ background: "rgba(20,184,166,.06)", borderColor: "rgba(20,184,166,.3)" }}
            >
              <p className="text-sm font-semibold">Jak si stojíte proti trhu</p>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {result.benchmark.verdict} Změřili jsme {result.benchmark.sample} českých
                firemních webů —{" "}
                <a href={result.benchmark.url} className="text-primary hover:underline">
                  celá analýza je tady
                </a>.
              </p>
            </div>
          )}

          {result.categories.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">Podle kategorií</p>
              {result.categories.map((c) => {
                const t = scoreTone(c.score);
                return (
                  <div key={c.key} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-sm text-muted-foreground">{c.label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.max(c.score, 2)}%`, background: t.color }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-right text-sm font-semibold" style={{ color: t.color }}>
                      {c.score}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {result.vitals && result.vitals.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Rychlost na mobilu (Google Lighthouse)</p>
              {result.vitals.map((v) => (
                <div key={v.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{v.label}</span>
                  <span className="font-semibold" style={{ color: v.good ? "#16a34a" : "#dc2626" }}>{v.value}</span>
                </div>
              ))}
            </div>
          )}

          {result.checks && result.checks.some((c) => c.ok !== null) && (
            <div className="space-y-5">
              <p className="text-sm font-semibold">
                Kontrola bod po bodu{" "}
                <span className="font-normal text-muted-foreground">
                  ({result.checks.filter((c) => c.ok === true).length} z{" "}
                  {result.checks.filter((c) => c.ok !== null).length} v pořádku)
                </span>
              </p>
              {GROUP_LABELS.map(([group, label]) => {
                const rows = result.checks!.filter((c) => c.group === group && c.ok !== null);
                if (rows.length === 0) return null;
                return (
                  <div key={group} className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
                    <ul className="space-y-1.5">
                      {rows.map((c) => (
                        <li key={c.id} className="flex items-start gap-2.5 text-sm">
                          <span
                            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                            style={{ background: c.ok ? "rgba(22,163,74,.12)" : "rgba(220,38,38,.12)", color: c.ok ? "#16a34a" : "#dc2626" }}
                            aria-label={c.ok ? "v pořádku" : "chybí"}
                          >
                            {c.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium">
                              {c.label} <span className="font-normal text-muted-foreground">— {c.detail}</span>
                            </p>
                            {!c.ok && <p className="text-muted-foreground leading-relaxed">{c.fix}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {result.findings.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">
                Co konkrétně zlepšit{" "}
                <span className="font-normal text-muted-foreground">
                  ({result.issueCount} {result.issueCount === 1 ? "nález" : result.issueCount < 5 ? "nálezy" : "nálezů"})
                </span>
              </p>
              <ul className="space-y-2">
                {result.findings.map((f, i) => (
                  <li
                    key={`${f.title}-${i}`}
                    className="rounded-xl border border-border/60 p-4"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: f.severity === "critical" ? "#dc2626" : "#d97706" }}
                      />
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium text-sm">{f.title}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {f.recommendation}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                Stejný rozpis jsme poslali i na <strong>{formData.email}</strong>.
              </p>
            </div>
          )}

          {result.findings.length === 0 && (
            <div className="rounded-xl border border-border/60 p-5 text-center">
              <p className="font-semibold">Nenašli jsme nic zásadního ke zlepšení</p>
            </div>
          )}

          {result.offer && (
            <div
              className="rounded-xl border p-6 text-center space-y-2"
              style={{ background: "rgba(20,184,166,.06)", borderColor: "rgba(20,184,166,.3)" }}
            >
              <p className="text-lg font-bold">{result.offer.headline}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.offer.body}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <a href={`/poptavka?zdroj=audit&web=${encodeURIComponent(result.url)}`}>
                {result.offer?.cta ?? "Chci to spravit"}
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="tel:+420702110166">
                <Phone className="mr-2 h-4 w-4" />
                702 110 166
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => { setResult(null); setFormData({ url: "", email: formData.email, name: formData.name }); }}
            >
              Zkontrolovat další web
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* What you get */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { icon: Bot, title: "Najde vás AI?", desc: "Přístup pro ChatGPT, Claude a Perplexity, llms.txt, FAQ, údaje o firmě" },
          { icon: Search, title: "Google a mapy", desc: "Titulky, sitemap, hvězdičky z recenzí, Firma na Googlu" },
          { icon: Gauge, title: "Rychlost a mobil", desc: "Načítání na mobilu, klikací telefon, moderní obrázky" },
          { icon: ShieldCheck, title: "Důvěra a pravidla", desc: "HTTPS, cookie lišta, měření návštěvnosti, náhled při sdílení" },
        ].map((item) => (
          <div key={item.title} className="flex gap-3 p-4 rounded-xl bg-muted/50 border border-border/60">
            <item.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL vašeho webu *</Label>
              <Input
                id="url"
                type="text"
                placeholder="www.vas-web.cz"
                value={formData.url}
                onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                required
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Váš email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jan@firma.cz"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Vaše jméno (nepovinné)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jan Novák"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" size="lg" className="w-full group" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzuji web…</>
              ) : (
                <><Send className="mr-2 h-4 w-4" />Spustit audit zdarma</>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Žádný spam. Skóre uvidíte hned, detailní rozpis přijde na e-mail.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
