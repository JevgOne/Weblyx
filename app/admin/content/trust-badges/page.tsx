"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Plus, Trash2, RotateCcw } from "lucide-react";
import type { TrustBadgesData, LocalizedSectionData, TrustBadgeItem } from "@/types/cms";

const emptyBadges: TrustBadgeItem[] = [
  { title: "", description: "" },
  { title: "", description: "" },
  { title: "", description: "" },
  { title: "", description: "" },
];

const emptyData: TrustBadgesData = { badges: [...emptyBadges] };

export default function TrustBadgesEditorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeLocale, setActiveLocale] = useState<"cs" | "de">("cs");
  const [formData, setFormData] = useState<LocalizedSectionData<TrustBadgesData>>({
    cs: { badges: emptyBadges.map(b => ({ ...b })) },
    de: { badges: emptyBadges.map(b => ({ ...b })) },
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await fetch("/api/cms/trust-badges");
      const result = await res.json();
      if (result.success && result.data) setFormData(result.data);
    } catch { showNotification("error", "Chyba při načítání dat"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/trust-badges", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      showNotification("success", "Trust Badges uloženy!");
    } catch { showNotification("error", "Chyba při ukládání."); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    if (!confirm("Opravdu chcete resetovat na výchozí hodnoty?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/cms/trust-badges", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(null) });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      setFormData({ cs: { badges: emptyBadges.map(b => ({ ...b })) }, de: { badges: emptyBadges.map(b => ({ ...b })) } });
      showNotification("success", "Resetováno.");
    } catch { showNotification("error", "Chyba při resetování."); }
    finally { setSaving(false); }
  };

  const updateBadge = (locale: "cs" | "de", index: number, field: keyof TrustBadgeItem, value: string) => {
    setFormData(prev => {
      const badges = [...prev[locale].badges];
      badges[index] = { ...badges[index], [field]: value };
      return { ...prev, [locale]: { ...prev[locale], badges } };
    });
  };

  const addBadge = (locale: "cs" | "de") => {
    setFormData(prev => ({ ...prev, [locale]: { badges: [...prev[locale].badges, { title: "", description: "" }] } }));
  };

  const removeBadge = (locale: "cs" | "de", index: number) => {
    setFormData(prev => ({ ...prev, [locale]: { badges: prev[locale].badges.filter((_, i) => i !== index) } }));
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/content")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Zpět
            </Button>
            <div>
              <h1 className="text-xl font-bold">Trust Badges</h1>
              <p className="text-sm text-muted-foreground">Odznaky důvěry</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2"><RotateCcw className="h-4 w-4" /> Reset</Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2"><Save className="h-4 w-4" /> {saving ? "Ukládání..." : "Uložit"}</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {notification && (
          <Alert variant={notification.type === "error" ? "destructive" : "default"} className="mb-6">
            {notification.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{notification.type === "success" ? "Úspěch" : "Chyba"}</AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeLocale} onValueChange={(v) => setActiveLocale(v as "cs" | "de")}>
          <TabsList className="mb-6">
            <TabsTrigger value="cs">🇨🇿 Čeština</TabsTrigger>
            <TabsTrigger value="de">🇩🇪 Deutsch</TabsTrigger>
          </TabsList>

          {(["cs", "de"] as const).map((locale) => (
            <TabsContent key={locale} value={locale}>
              <Card>
                <CardHeader>
                  <CardTitle>Trust Badges ({locale.toUpperCase()})</CardTitle>
                  <CardDescription>Karty s odznaky důvěry — max 4 doporučeno</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {loading ? <><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></> : (
                    <>
                      {formData[locale].badges.map((badge, i) => (
                        <div key={i} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">Badge {i + 1}</span>
                            {formData[locale].badges.length > 1 && (
                              <Button variant="ghost" size="sm" onClick={() => removeBadge(locale, i)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Název</Label>
                              <Input value={badge.title} onChange={(e) => updateBadge(locale, i, "title", e.target.value)} placeholder="SSL & Bezpečnost" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Popis</Label>
                              <Input value={badge.description} onChange={(e) => updateBadge(locale, i, "description", e.target.value)} placeholder="Vždy zabezpečený HTTPS" />
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" onClick={() => addBadge(locale)} className="gap-2 w-full"><Plus className="h-4 w-4" /> Přidat badge</Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/admin/content")}>Zrušit</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2"><Save className="h-4 w-4" /> {saving ? "Ukládání..." : "Uložit změny"}</Button>
        </div>
      </main>
    </div>
  );
}
