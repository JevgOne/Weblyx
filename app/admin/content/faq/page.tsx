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
} from "lucide-react";
import { FAQSection, FAQItem } from "@/types/cms";

export default function FAQManagementPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [sectionData, setSectionData] = useState<FAQSection>({
    heading: "",
    subheading: "",
    enabled: true,
  });
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState<Omit<FAQItem, "id" | "createdAt" | "updatedAt">>({
    question: "",
    answer: "",
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
      const response = await fetch('/api/cms/faq');
      const result = await response.json();

      if (result.success && result.data) {
        setSectionData(result.data);
      }

      // TODO: Load FAQ items from API once endpoint is created
      setFaqs([]);
    } catch (error) {
      console.error("Error loading FAQ data:", error);
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
      const response = await fetch('/api/cms/faq', {
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
      question: "",
      answer: "",
      order: faqs.length + 1,
      enabled: true,
    });
    setIsCreating(true);
    setEditingId(null);
  };

  const startEditing = (faq: FAQItem) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
      enabled: faq.enabled,
    });
    setEditingId(faq.id || null);
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      question: "",
      answer: "",
      order: 0,
      enabled: true,
    });
  };

  const handleSave = async () => {
    if (!formData.question.trim()) {
      showNotification("error", "Otázka je povinná");
      return;
    }
    if (!formData.answer.trim()) {
      showNotification("error", "Odpověď je povinná");
      return;
    }

    setSaving(true);
    try {
      // TODO: Implement API endpoint for FAQ items CRUD
      showNotification("error", "FAQ items API not yet implemented");
      /*
      if (isCreating) {
        await createFAQItem(formData);
        showNotification("success", "FAQ bylo úspěšně vytvořeno!");
      } else if (editingId) {
        await updateFAQItem(editingId, formData);
        showNotification("success", "FAQ bylo úspěšně aktualizováno!");
      }

      await loadData();
      cancelEditing();
      */
    } catch (error) {
      console.error("Error saving FAQ:", error);
      showNotification("error", "Chyba při ukládání. Zkuste to prosím znovu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu chcete smazat tuto FAQ položku?")) {
      return;
    }

    try {
      // TODO: Implement API endpoint for FAQ items CRUD
      showNotification("error", "FAQ items API not yet implemented");
      /*
      await deleteFAQItem(id);
      showNotification("success", "FAQ bylo úspěšně smazáno!");
      await loadData();
      */
    } catch (error) {
      console.error("Error deleting FAQ:", error);
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
              <h1 className="text-xl font-bold">Správa FAQ</h1>
              <p className="text-sm text-muted-foreground">
                {faqs.length} otázek celkem
              </p>
            </div>
          </div>

          <Button onClick={startCreating} className="gap-2" disabled={isCreating || editingId !== null}>
            <Plus className="h-4 w-4" />
            Přidat FAQ
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nastavení sekce</CardTitle>
            <CardDescription>
              Upravte hlavní nadpis a podnadpis FAQ sekce
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
                placeholder="Často kladené otázky"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subheading">Podnadpis</Label>
              <Textarea
                id="subheading"
                name="subheading"
                value={sectionData.subheading}
                onChange={handleSectionChange}
                placeholder="Odpovědi na nejčastější dotazy"
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

        {(isCreating || editingId) && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle>
                {isCreating ? "Vytvořit novou FAQ" : "Upravit FAQ"}
              </CardTitle>
              <CardDescription>
                Vyplňte všechny povinné údaje
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">
                  Otázka <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="question"
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  placeholder="Jak dlouho trvá vytvoření webu?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">
                  Odpověď <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="answer"
                  name="answer"
                  value={formData.answer}
                  onChange={handleInputChange}
                  placeholder="Jednoduché webové stránky dodáme za 5-7 dní..."
                  rows={6}
                />
              </div>

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
                  Zobrazit FAQ na webu
                </Label>
              </div>

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

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Všechny FAQ</h2>
          {faqs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>Zatím nejsou žádné FAQ položky.</p>
                <Button onClick={startCreating} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Přidat první FAQ
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card
                  key={faq.id}
                  className={`${
                    !faq.enabled ? "opacity-50" : ""
                  } hover:shadow-lg transition-shadow`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{faq.question}</CardTitle>
                          {!faq.enabled && (
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              Skryto
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Pořadí: {faq.order}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => startEditing(faq)}
                      >
                        <Edit className="h-4 w-4" />
                        Upravit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => faq.id && handleDelete(faq.id)}
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
