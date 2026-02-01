"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, CheckCircle2, Gauge, Zap, Search, ShieldCheck, AlertTriangle, XCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface AuditResult {
  url: string;
  performance?: { score?: number; loadTime?: number; pageSize?: number };
  seo?: { score?: number; title?: string; metaDescription?: string; h1?: string };
  accessibility?: { score?: number };
  security?: { https?: boolean };
  issues?: Array<{ severity: string; title: string; description: string }>;
  recommendations?: Array<{ title: string; description: string }>;
}

function ScoreCircle({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500";
  const bg = score >= 80 ? "bg-green-50" : score >= 50 ? "bg-yellow-50" : "bg-red-50";
  const border = score >= 80 ? "border-green-200" : score >= 50 ? "border-yellow-200" : "border-red-200";

  return (
    <div className={`flex flex-col items-center p-4 rounded-xl ${bg} border ${border}`}>
      <span className={`text-3xl font-bold ${color}`}>{score}</span>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

export function AuditForm() {
  const [formData, setFormData] = useState({ url: "", email: "", name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!formData.url.trim()) { setError("Zadejte URL vašeho webu"); return; }
    if (!formData.email.trim()) { setError("Zadejte váš email"); return; }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Analýza selhala");

      setResult(data.data);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ["#14B8A6", "#06B6D4", "#fff"] });
    } catch (err: any) {
      setError(err.message || "Něco se pokazilo. Zkuste to znovu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
          <h3 className="text-xl font-bold">Výsledky auditu</h3>
          <p className="text-sm text-muted-foreground">
            {result.url} — detailní report posíláme na <strong>{formData.email}</strong>
          </p>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {result.performance?.score != null && (
            <ScoreCircle score={result.performance.score} label="Výkon" />
          )}
          {result.seo?.score != null && (
            <ScoreCircle score={result.seo.score} label="SEO" />
          )}
          {result.accessibility?.score != null && (
            <ScoreCircle score={result.accessibility.score} label="Přístupnost" />
          )}
          {result.security && (
            <div className={`flex flex-col items-center p-4 rounded-xl border ${result.security.https ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <ShieldCheck className={`h-8 w-8 ${result.security.https ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-xs text-muted-foreground mt-1">HTTPS</span>
            </div>
          )}
        </div>

        {/* Issues */}
        {result.issues && result.issues.length > 0 && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <p className="font-semibold text-sm">Nalezené problémy ({result.issues.length})</p>
              {result.issues.slice(0, 6).map((issue, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  {issue.severity === 'critical' ? (
                    <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-medium">{issue.title}</span>
                    <p className="text-muted-foreground text-xs">{issue.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center space-y-3">
            <p className="font-semibold">Chcete tyto problémy vyřešit?</p>
            <p className="text-sm text-muted-foreground">
              Opravíme vám web nebo vytvoříme nový — rychlý, SEO optimalizovaný, od 7 990 Kč.
            </p>
            <Button asChild size="lg">
              <a href="/poptavka">Nezávazná poptávka →</a>
            </Button>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full" onClick={() => { setResult(null); setFormData({ url: "", email: "", name: "" }); }}>
          Analyzovat jiný web
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* What you get */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { icon: Gauge, title: "PageSpeed analýza", desc: "Jak rychle se váš web načítá na mobilu i desktopu" },
          { icon: Search, title: "SEO check", desc: "Meta tagy, nadpisy, strukturovaná data, indexace" },
          { icon: Zap, title: "Výkon a UX", desc: "Core Web Vitals, mobilní optimalizace, přístupnost" },
          { icon: ShieldCheck, title: "Bezpečnost", desc: "HTTPS, hlavičky, GDPR souhlas, zranitelnosti" },
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
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzuji web... (10-20s)</>
              ) : (
                <><Search className="mr-2 h-4 w-4" />Spustit audit zdarma</>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Žádný spam. Výsledky uvidíte okamžitě + detailní report na email.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
