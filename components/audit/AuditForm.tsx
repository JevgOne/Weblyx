"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2, CheckCircle2, Gauge, Zap, Search, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";

export function AuditForm() {
  const [formData, setFormData] = useState({
    url: "",
    email: "",
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.url.trim()) {
      setError("Zadejte URL vašeho webu");
      return;
    }
    if (!formData.email.trim()) {
      setError("Zadejte váš email");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name || "Audit request",
          email: formData.email,
          phone: "",
          subject: "🔍 Zdarma audit webu",
          message: `URL k auditu: ${formData.url}\nJméno: ${formData.name || "neuvedeno"}`,
          type: "audit",
        }),
      });

      if (!response.ok) throw new Error("Odeslání selhalo");

      setIsSubmitted(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#14B8A6", "#06B6D4", "#ffffff"],
      });
    } catch (err) {
      setError("Něco se pokazilo. Zkuste to znovu nebo nám napište na info@weblyx.cz");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-8 text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
          <h3 className="text-2xl font-bold">Děkujeme! 🎉</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Váš web <strong>{formData.url}</strong> zanalyzujeme a audit vám pošleme na <strong>{formData.email}</strong> do 48 hodin.
          </p>
        </CardContent>
      </Card>
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

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button type="submit" size="lg" className="w-full group" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Odesílám...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" />Chci zdarma audit</>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Žádný spam. Audit pošleme do 48 hodin na váš email.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
