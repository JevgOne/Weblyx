"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Save,
  Calendar,
  DollarSign,
  User,
  Globe,
  Github,
  Server,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Project, ProjectStatus, ProjectPriority, ProjectType, HostingProvider, statusConfig, priorityConfig } from "@/types/project";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [project, setProject] = useState<Project | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Project>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/admin/login");
      } else {
        fetchProject();
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const projectRef = doc(db, "projects", projectId);
      const projectSnap = await getDoc(projectRef);

      if (projectSnap.exists()) {
        const data = projectSnap.data() as Project;
        setProject(data);
        setFormData(data);
      } else {
        setMessage({ type: "error", text: "Projekt nebyl nalezen" });
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      setMessage({ type: "error", text: "Chyba při načítání projektu" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Project, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name?.trim()) return "Název projektu je povinný";
    if (!formData.clientName?.trim()) return "Jméno klienta je povinné";
    if (!formData.clientEmail?.trim()) return "Email klienta je povinný";
    if (!formData.deadline) return "Deadline je povinný";
    if (formData.progress !== undefined && (formData.progress < 0 || formData.progress > 100)) {
      return "Progress musí být mezi 0 a 100";
    }
    if (formData.priceTotal !== undefined && formData.priceTotal < 0) {
      return "Celková cena musí být kladné číslo";
    }
    if (formData.pricePaid !== undefined && formData.pricePaid < 0) {
      return "Zaplacená částka musí být kladné číslo";
    }
    if (
      formData.priceTotal !== undefined &&
      formData.pricePaid !== undefined &&
      formData.pricePaid > formData.priceTotal
    ) {
      return "Zaplacená částka nemůže být vyšší než celková cena";
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const projectRef = doc(db, "projects", projectId);
      const updateData = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(projectRef, updateData);

      setMessage({ type: "success", text: "Projekt byl úspěšně uložen" });
      setProject({ ...project, ...updateData } as Project);

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error saving project:", error);
      setMessage({ type: "error", text: "Chyba při ukládání projektu" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Projekt nenalezen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Požadovaný projekt nebyl nalezen v databázi.
            </p>
            <Button onClick={() => router.push("/admin/projects")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zpět na projekty
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/admin/projects")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{formData.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {formData.projectNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {message && (
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                    message.type === "success"
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">{message.text}</span>
                </div>
              )}
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Ukládám..." : "Uložit změny"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Status Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stav projektu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={`${
                  statusConfig[formData.status as ProjectStatus]?.color || "bg-gray-500"
                } text-white`}
              >
                {statusConfig[formData.status as ProjectStatus]?.label || formData.status}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold">{formData.progress}%</div>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${formData.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Celková cena
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formData.priceTotal?.toLocaleString()} {formData.currency}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Zaplaceno
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formData.pricePaid?.toLocaleString()} {formData.currency}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.priceTotal && formData.pricePaid
                  ? `${Math.round((formData.pricePaid / formData.priceTotal) * 100)}% zaplaceno`
                  : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Přehled</TabsTrigger>
            <TabsTrigger value="technical">Technické info</TabsTrigger>
            <TabsTrigger value="files">Soubory</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Základní informace</CardTitle>
                  <CardDescription>Název a typ projektu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Název projektu *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Např. Web pro firmu XYZ"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectNumber">Číslo projektu</Label>
                    <Input
                      id="projectNumber"
                      value={formData.projectNumber || ""}
                      onChange={(e) => handleInputChange("projectNumber", e.target.value)}
                      placeholder="WBX-2025-0001"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectType">Typ projektu</Label>
                    <Select
                      value={formData.projectType}
                      onValueChange={(value) => handleInputChange("projectType", value as ProjectType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte typ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Web">Web</SelectItem>
                        <SelectItem value="E-shop">E-shop</SelectItem>
                        <SelectItem value="Landing page">Landing page</SelectItem>
                        <SelectItem value="App">Aplikace</SelectItem>
                        <SelectItem value="Other">Jiné</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informace o klientovi
                  </CardTitle>
                  <CardDescription>Kontaktní údaje klienta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Jméno klienta *</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName || ""}
                      onChange={(e) => handleInputChange("clientName", e.target.value)}
                      placeholder="Jan Novák"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={formData.clientEmail || ""}
                      onChange={(e) => handleInputChange("clientEmail", e.target.value)}
                      placeholder="jan@priklad.cz"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Telefon</Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      value={formData.clientPhone || ""}
                      onChange={(e) => handleInputChange("clientPhone", e.target.value)}
                      placeholder="+420 123 456 789"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Status & Priority */}
              <Card>
                <CardHeader>
                  <CardTitle>Stav a priorita</CardTitle>
                  <CardDescription>Aktuální stav projektu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Stav projektu</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange("status", value as ProjectStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte stav" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">Nezaplaceno</SelectItem>
                        <SelectItem value="awaiting_invoice">Čeká na fakturu</SelectItem>
                        <SelectItem value="in_progress">Rozpracováno</SelectItem>
                        <SelectItem value="delivered">Předáno</SelectItem>
                        <SelectItem value="warranty_ended">Záruka ukončena</SelectItem>
                        <SelectItem value="cancelled">Zrušeno</SelectItem>
                        <SelectItem value="paused">Pozastaveno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priorita</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => handleInputChange("priority", value as ProjectPriority)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte prioritu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Vysoká</SelectItem>
                        <SelectItem value="medium">Střední</SelectItem>
                        <SelectItem value="low">Nízká</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="progress">Progress (0-100%)</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="progress"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.progress || 0}
                        onChange={(e) =>
                          handleInputChange("progress", parseInt(e.target.value) || 0)
                        }
                      />
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${formData.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Termíny
                  </CardTitle>
                  <CardDescription>Důležité datumy projektu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Datum zahájení</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate || ""}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline *</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline || ""}
                      onChange={(e) => handleInputChange("deadline", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="completedAt">Datum dokončení</Label>
                    <Input
                      id="completedAt"
                      type="date"
                      value={formData.completedAt || ""}
                      onChange={(e) => handleInputChange("completedAt", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Financials */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Finanční informace
                  </CardTitle>
                  <CardDescription>Ceny a platby</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="priceTotal">Celková cena</Label>
                      <Input
                        id="priceTotal"
                        type="number"
                        min="0"
                        value={formData.priceTotal || ""}
                        onChange={(e) =>
                          handleInputChange("priceTotal", parseFloat(e.target.value) || 0)
                        }
                        placeholder="50000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pricePaid">Zaplaceno</Label>
                      <Input
                        id="pricePaid"
                        type="number"
                        min="0"
                        value={formData.pricePaid || ""}
                        onChange={(e) =>
                          handleInputChange("pricePaid", parseFloat(e.target.value) || 0)
                        }
                        placeholder="25000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Měna</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) => handleInputChange("currency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte měnu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CZK">CZK (Kč)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.priceTotal !== undefined && formData.pricePaid !== undefined && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Zbývá zaplatit:</span>
                        <span className="text-lg font-bold">
                          {(formData.priceTotal - formData.pricePaid).toLocaleString()}{" "}
                          {formData.currency}
                        </span>
                      </div>
                      <div className="w-full bg-background rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              formData.priceTotal > 0
                                ? (formData.pricePaid / formData.priceTotal) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* URLs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    URL adresy
                  </CardTitle>
                  <CardDescription>Produkční a testovací prostředí</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productionUrl">Produkční URL</Label>
                    <Input
                      id="productionUrl"
                      type="url"
                      value={formData.productionUrl || ""}
                      onChange={(e) => handleInputChange("productionUrl", e.target.value)}
                      placeholder="https://example.com"
                    />
                    {formData.productionUrl && (
                      <a
                        href={formData.productionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        Otevřít <Globe className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stagingUrl">Staging URL</Label>
                    <Input
                      id="stagingUrl"
                      type="url"
                      value={formData.stagingUrl || ""}
                      onChange={(e) => handleInputChange("stagingUrl", e.target.value)}
                      placeholder="https://staging.example.com"
                    />
                    {formData.stagingUrl && (
                      <a
                        href={formData.stagingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        Otevřít <Globe className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="githubRepo">GitHub Repository</Label>
                    <Input
                      id="githubRepo"
                      type="url"
                      value={formData.githubRepo || ""}
                      onChange={(e) => handleInputChange("githubRepo", e.target.value)}
                      placeholder="https://github.com/user/repo"
                    />
                    {formData.githubRepo && (
                      <a
                        href={formData.githubRepo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        Otevřít na GitHubu <Github className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Hosting */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Hosting a doména
                  </CardTitle>
                  <CardDescription>Informace o hostingu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hostingProvider">Hosting provider</Label>
                    <Select
                      value={formData.hostingProvider}
                      onValueChange={(value) =>
                        handleInputChange("hostingProvider", value as HostingProvider)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte poskytovatele" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vercel">Vercel</SelectItem>
                        <SelectItem value="Netlify">Netlify</SelectItem>
                        <SelectItem value="Custom">Vlastní server</SelectItem>
                        <SelectItem value="Other">Jiné</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="domainName">Název domény</Label>
                    <Input
                      id="domainName"
                      value={formData.domainName || ""}
                      onChange={(e) => handleInputChange("domainName", e.target.value)}
                      placeholder="example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="domainRegistrar">Domain registrátor</Label>
                    <Input
                      id="domainRegistrar"
                      value={formData.domainRegistrar || ""}
                      onChange={(e) => handleInputChange("domainRegistrar", e.target.value)}
                      placeholder="GoDaddy, Wedos, atd."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Hosting Info */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Přihlašovací údaje a poznámky</CardTitle>
                  <CardDescription>
                    Přístupové údaje k hostingu, FTP, databázi apod.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="hostingInfo">Technické poznámky</Label>
                    <Textarea
                      id="hostingInfo"
                      value={formData.hostingInfo || ""}
                      onChange={(e) => handleInputChange("hostingInfo", e.target.value)}
                      placeholder="FTP: user@server.com&#10;Password: ****&#10;Database: mysql://..."
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Citlivé informace - budou bezpečně uloženy v databázi
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Soubory projektu</CardTitle>
                <CardDescription>
                  Nahrané dokumenty, obrázky a další soubory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Správa souborů bude implementována v další verzi</p>
                  <p className="text-sm mt-2">
                    Zde budou dostupné loga, wireframy, smlouvy a další dokumenty
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Timeline projektu</CardTitle>
                <CardDescription>Historie změn a milníků</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Timeline items */}
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Timeline bude implementován v další verzi</p>
                    <p className="text-sm mt-2">
                      Zde budou zobrazeny všechny změny, komentáře a milníky projektu
                    </p>
                  </div>

                  {/* Basic info for now */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Vytvořeno:</span>
                      <span className="font-medium">
                        {formData.createdAt
                          ? new Date(formData.createdAt).toLocaleString("cs-CZ")
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Poslední změna:</span>
                      <span className="font-medium">
                        {formData.updatedAt
                          ? new Date(formData.updatedAt).toLocaleString("cs-CZ")
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
