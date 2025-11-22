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
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Plus, X } from "lucide-react";
import { ContactInfo } from "@/types/cms";

export default function ContactEditorPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState<ContactInfo>({
    heading: "",
    subheading: "",
    email: "",
    address: "",
    openingHours: {
      weekdays: "",
      weekend: "",
    },
    formLabels: {
      name: "",
      email: "",
      phone: "",
      projectType: "",
      budget: "",
      message: "",
      submit: "",
      submitting: "",
    },
    projectTypes: [],
    budgetOptions: [],
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
      const response = await fetch('/api/cms/contact');
      const result = await response.json();

      if (result.success && result.data) {
        setFormData(result.data);
      }
    } catch (error) {
      console.error("Error loading contact data:", error);
      showNotification("error", "Chyba při načítání dat");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev as any)[parent],
        [field]: value,
      },
    }));
  };

  const handleArrayChange = (arrayName: 'projectTypes' | 'budgetOptions', index: number, field: 'value' | 'label', value: string) => {
    const newArray = [...formData[arrayName]];
    newArray[index] = { ...newArray[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      [arrayName]: newArray,
    }));
  };

  const addArrayItem = (arrayName: 'projectTypes' | 'budgetOptions') => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { value: '', label: '' }],
    }));
  };

  const removeArrayItem = (arrayName: 'projectTypes' | 'budgetOptions', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      enabled: e.target.checked,
    }));
  };

  const handleSave = async () => {
    if (!formData.email.trim()) {
      showNotification("error", "Email je povinný");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/cms/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save');
      }

      showNotification("success", "Kontaktní informace byly úspěšně uloženy!");
      await loadData();
    } catch (error) {
      console.error("Error saving contact info:", error);
      showNotification("error", "Chyba při ukládání. Zkuste to prosím znovu.");
    } finally {
      setSaving(false);
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
              <h1 className="text-xl font-bold">Editor kontaktních informací</h1>
              <p className="text-sm text-muted-foreground">Kontaktní sekce</p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Ukládání..." : "Uložit změny"}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Základní informace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heading">Hlavní nadpis</Label>
                <Input
                  id="heading"
                  name="heading"
                  value={formData.heading}
                  onChange={handleInputChange}
                  placeholder="Napište nám"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subheading">Podnadpis</Label>
                <Textarea
                  id="subheading"
                  name="subheading"
                  value={formData.subheading}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresa</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Otevírací doba - všední dny</Label>
                  <Input
                    value={formData.openingHours.weekdays}
                    onChange={(e) => handleNestedChange('openingHours', 'weekdays', e.target.value)}
                    placeholder="Po - Pá: 9:00 - 18:00"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Otevírací doba - víkendy</Label>
                  <Input
                    value={formData.openingHours.weekend}
                    onChange={(e) => handleNestedChange('openingHours', 'weekend', e.target.value)}
                    placeholder="So - Ne: Zavřeno"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popisky formuláře</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jméno</Label>
                <Input
                  value={formData.formLabels.name}
                  onChange={(e) => handleNestedChange('formLabels', 'name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={formData.formLabels.email}
                  onChange={(e) => handleNestedChange('formLabels', 'email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input
                  value={formData.formLabels.phone}
                  onChange={(e) => handleNestedChange('formLabels', 'phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Typ projektu</Label>
                <Input
                  value={formData.formLabels.projectType}
                  onChange={(e) => handleNestedChange('formLabels', 'projectType', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Rozpočet</Label>
                <Input
                  value={formData.formLabels.budget}
                  onChange={(e) => handleNestedChange('formLabels', 'budget', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Zpráva</Label>
                <Input
                  value={formData.formLabels.message}
                  onChange={(e) => handleNestedChange('formLabels', 'message', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tlačítko Odeslat</Label>
                <Input
                  value={formData.formLabels.submit}
                  onChange={(e) => handleNestedChange('formLabels', 'submit', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Text při odesílání</Label>
                <Input
                  value={formData.formLabels.submitting}
                  onChange={(e) => handleNestedChange('formLabels', 'submitting', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Typy projektů</CardTitle>
                <Button size="sm" onClick={() => addArrayItem('projectTypes')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Přidat
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.projectTypes.map((type, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Hodnota"
                    value={type.value}
                    onChange={(e) => handleArrayChange('projectTypes', index, 'value', e.target.value)}
                  />
                  <Input
                    placeholder="Popisek"
                    value={type.label}
                    onChange={(e) => handleArrayChange('projectTypes', index, 'label', e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayItem('projectTypes', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Rozpočtové možnosti</CardTitle>
                <Button size="sm" onClick={() => addArrayItem('budgetOptions')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Přidat
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.budgetOptions.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Hodnota"
                    value={option.value}
                    onChange={(e) => handleArrayChange('budgetOptions', index, 'value', e.target.value)}
                  />
                  <Input
                    placeholder="Popisek"
                    value={option.label}
                    onChange={(e) => handleArrayChange('budgetOptions', index, 'label', e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayItem('budgetOptions', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="enabled" className="font-normal cursor-pointer">
                  Zobrazit kontaktní sekci na webu
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/admin/content")}>
            Zrušit
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Ukládání..." : "Uložit změny"}
          </Button>
        </div>
      </main>
    </div>
  );
}
