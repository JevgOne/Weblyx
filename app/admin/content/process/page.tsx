"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  GripVertical,
} from "lucide-react";
import { ProcessSection, ProcessStep } from "@/types/cms";

export default function ProcessManagementPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [sectionData, setSectionData] = useState<ProcessSection>({
    heading: "",
    subheading: "",
    enabled: true,
  });
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState<Omit<ProcessStep, "id" | "createdAt" | "updatedAt">>({
    number: "",
    icon: "",
    title: "",
    description: "",
    order: 0,
    enabled: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      await loadData();
      setLoading(false);
    };

    fetchData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/cms/process');
      const result = await response.json();

      if (result.success && result.data) {
        // Set section data
        if (result.data.section) {
          setSectionData(result.data.section);
        }

        // Set steps data
        if (result.data.steps) {
          setSteps(result.data.steps);
        }
      }
    } catch (error) {
      console.error("Error loading process data:", error);
      showNotification("error", "Chyba při načítání dat");
    }
  };

  const handleSectionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSectionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSectionCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSectionData((prev) => ({
      ...prev,
      enabled: e.target.checked,
    }));
  };

  const handleSaveSection = async () => {
    if (!sectionData.heading.trim()) {
      showNotification("error", "Nadpis je povinný");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/cms/process', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save');
      }

      showNotification("success", "Sekce byla úspěšně uložena!");
      await loadData();
    } catch (error) {
      console.error("Error saving section:", error);
      showNotification("error", "Chyba při ukládání. Zkuste to prosím znovu.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "order" ? parseInt(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const startCreating = () => {
    setFormData({
      number: String(steps.length + 1).padStart(2, '0'),
      icon: "",
      title: "",
      description: "",
      order: steps.length + 1,
      enabled: true,
    });
    setIsCreating(true);
    setEditingId(null);
  };

  const startEditing = (step: ProcessStep) => {
    setFormData({
      number: step.number,
      icon: step.icon,
      title: step.title,
      description: step.description,
      order: step.order,
      enabled: step.enabled,
    });
    setEditingId(step.id || null);
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      number: "",
      icon: "",
      title: "",
      description: "",
      order: 0,
      enabled: true,
    });
  };

  const handleSave = async () => {
    if (!formData.number.trim()) {
      showNotification("error", "Číslo kroku je povinné");
      return;
    }
    if (!formData.title.trim()) {
      showNotification("error", "Název kroku je povinný");
      return;
    }
    if (!formData.description.trim()) {
      showNotification("error", "Popis kroku je povinný");
      return;
    }
    if (!formData.icon.trim()) {
      showNotification("error", "Ikona kroku je povinná");
      return;
    }

    setSaving(true);
    try {
      if (isCreating) {
        // Create new step
        const response = await fetch('/api/cms/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to create step');
        }

        showNotification("success", "Krok byl úspěšně vytvořen!");
      } else if (editingId) {
        // Update existing step
        const response = await fetch('/api/cms/process', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...formData }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to update step');
        }

        showNotification("success", "Krok byl úspěšně aktualizován!");
      }

      await loadData();
      cancelEditing();
    } catch (error) {
      console.error("Error saving step:", error);
      showNotification("error", "Chyba při ukládání. Zkuste to prosím znovu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu chcete smazat tento krok?")) {
      return;
    }

    try {
      const response = await fetch(`/api/cms/process?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete step');
      }

      showNotification("success", "Krok byl úspěšně smazán!");
      await loadData();
    } catch (error) {
      console.error("Error deleting step:", error);
      showNotification("error", "Chyba při mazání. Zkuste to prosím znovu.");
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Načítání...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/content")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zpět
            </Button>
            <div>
              <h1 className="text-xl font-bold">Správa procesu</h1>
              <p className="text-sm text-muted-foreground">
                {steps.length} kroků celkem
              </p>
            </div>
          </div>

          <Button onClick={startCreating} className="gap-2" disabled={isCreating || editingId !== null}>
            <Plus className="h-4 w-4" />
            Přidat krok
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Notification */}
        {notification && (
          <Alert
            variant={notification.type === "error" ? "destructive" : "default"}
            className="mb-6"
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {notification.type === "success" ? "Úspěch" : "Chyba"}
            </AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        )}

        {/* Section Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nastavení sekce</CardTitle>
            <CardDescription>
              Upravte hlavní nadpis a podnadpis sekce procesu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heading">
                Hlavní nadpis <span className="text-destructive">*</span>
              </Label>
              <Input
                id="heading"
                name="heading"
                value={sectionData.heading}
                onChange={handleSectionChange}
                placeholder="Jak to funguje"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subheading">Podnadpis</Label>
              <Textarea
                id="subheading"
                name="subheading"
                value={sectionData.subheading}
                onChange={handleSectionChange}
                placeholder="Náš proces je jednoduchý, transparentní a efektivní"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="section-enabled"
                checked={sectionData.enabled}
                onChange={handleSectionCheckboxChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="section-enabled" className="font-normal cursor-pointer">
                Zobrazit sekci na webu
              </Label>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveSection} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Ukládání..." : "Uložit sekci"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Form */}
        {(isCreating || editingId) && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle>
                {isCreating ? "Vytvořit nový krok" : "Upravit krok"}
              </CardTitle>
              <CardDescription>
                Vyplňte všechny povinné údaje
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Number */}
                <div className="space-y-2">
                  <Label htmlFor="number">
                    Číslo kroku <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="number"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    placeholder="01"
                    maxLength={2}
                  />
                </div>

                {/* Icon */}
                <div className="space-y-2">
                  <Label htmlFor="icon">
                    Ikona (Lucide název) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    placeholder="MessageSquare, Palette, Code..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Viz lucide.dev/icons
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Název <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Konzultace"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Popis <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Podrobný popis kroku..."
                  rows={3}
                />
              </div>

              {/* Order */}
              <div className="space-y-2">
                <Label htmlFor="order">Pořadí</Label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  Určuje pořadí zobrazení (1 = první)
                </p>
              </div>

              {/* Enabled */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enabled"
                  name="enabled"
                  checked={formData.enabled}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="enabled" className="font-normal cursor-pointer">
                  Zobrazit krok na webu
                </Label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={cancelEditing}>
                  <X className="h-4 w-4 mr-2" />
                  Zrušit
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Ukládání..." : "Uložit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Steps List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Všechny kroky</h2>
          {steps.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>Zatím nejsou žádné kroky.</p>
                <Button onClick={startCreating} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Přidat první krok
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {steps.map((step) => (
                <Card
                  key={step.id}
                  className={`${
                    !step.enabled ? "opacity-50" : ""
                  } hover:shadow-lg transition-shadow`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{step.number}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{step.title}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            Pořadí: {step.order}
                          </p>
                        </div>
                      </div>
                      {!step.enabled && (
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          Skryto
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {step.description}
                    </p>
                    <div className="text-xs text-muted-foreground mb-4">
                      <strong>Ikona:</strong> {step.icon}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => startEditing(step)}
                      >
                        <Edit className="h-4 w-4" />
                        Upravit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => step.id && handleDelete(step.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
