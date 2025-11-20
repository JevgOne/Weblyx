"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ConvertLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: any;
}

export function ConvertLeadDialog({ open, onOpenChange, lead }: ConvertLeadDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    // Project details
    projectName: lead?.company || lead?.name || "",
    projectType: lead?.projectType || "Web",

    // Client info (pre-filled from lead)
    clientName: lead?.name || "",
    clientEmail: lead?.email || "",
    clientPhone: lead?.phone || "",
    clientCompany: lead?.company || "",

    // Project-specific fields
    hostingType: "",
    hostingUrl: "",
    hostingUsername: "",
    hostingPassword: "",

    githubRepo: "",
    githubBranch: "main",

    // Pricing
    priceTotal: "",
    priceDeposit: "",
    priceRemaining: "",

    // Dates
    startDate: new Date().toISOString().split("T")[0],
    deadline: "",

    // Additional info
    notes: lead?.message || "",
    priority: "medium",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Calculate remaining price
      const total = parseFloat(formData.priceTotal) || 0;
      const deposit = parseFloat(formData.priceDeposit) || 0;
      const remaining = total - deposit;

      const response = await fetch(`/api/leads/${lead.id}/convert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          priceRemaining: remaining.toString(),
          leadId: lead.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to convert lead");
      }

      // Success - redirect to new project
      router.push(`/admin/projects/${data.projectId}`);
      onOpenChange(false);
    } catch (err: any) {
      console.error("Conversion error:", err);
      setError(err.message || "Failed to convert lead to project");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-calculate remaining price when total or deposit changes
    if (field === "priceTotal" || field === "priceDeposit") {
      const total = field === "priceTotal" ? parseFloat(value) : parseFloat(formData.priceTotal);
      const deposit = field === "priceDeposit" ? parseFloat(value) : parseFloat(formData.priceDeposit);

      if (!isNaN(total) && !isNaN(deposit)) {
        const remaining = total - deposit;
        setFormData((prev) => ({ ...prev, priceRemaining: remaining.toString() }));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Převést poptávku na projekt</DialogTitle>
          <DialogDescription>
            Vyplňte detaily projektu. Informace o klientovi jsou předvyplněné z poptávky.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Základní informace</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Název projektu *</Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => handleChange("projectName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectType">Typ projektu *</Label>
                <Select
                  value={formData.projectType}
                  onValueChange={(value) => handleChange("projectType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web">Web</SelectItem>
                    <SelectItem value="E-shop">E-shop</SelectItem>
                    <SelectItem value="Landing page">Landing page</SelectItem>
                    <SelectItem value="Web + E-shop">Web + E-shop</SelectItem>
                    <SelectItem value="Aplikace">Aplikace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priorita</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Nízká</SelectItem>
                  <SelectItem value="medium">Střední</SelectItem>
                  <SelectItem value="high">Vysoká</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Client Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Informace o klientovi</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Jméno klienta *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleChange("clientName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientCompany">Firma</Label>
                <Input
                  id="clientCompany"
                  value={formData.clientCompany}
                  onChange={(e) => handleChange("clientCompany", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleChange("clientEmail", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone">Telefon</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => handleChange("clientPhone", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Hosting Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Hosting</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hostingType">Typ hostingu</Label>
                <Select
                  value={formData.hostingType}
                  onValueChange={(value) => handleChange("hostingType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte typ hostingu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vercel">Vercel</SelectItem>
                    <SelectItem value="netlify">Netlify</SelectItem>
                    <SelectItem value="wedos">Wedos</SelectItem>
                    <SelectItem value="custom">Vlastní</SelectItem>
                    <SelectItem value="none">Zatím nevyřešeno</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hostingUrl">URL</Label>
                <Input
                  id="hostingUrl"
                  placeholder="https://example.com"
                  value={formData.hostingUrl}
                  onChange={(e) => handleChange("hostingUrl", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hostingUsername">Uživatelské jméno</Label>
                <Input
                  id="hostingUsername"
                  value={formData.hostingUsername}
                  onChange={(e) => handleChange("hostingUsername", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hostingPassword">Heslo</Label>
                <Input
                  id="hostingPassword"
                  type="password"
                  value={formData.hostingPassword}
                  onChange={(e) => handleChange("hostingPassword", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* GitHub Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">GitHub</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="githubRepo">Repository URL</Label>
                <Input
                  id="githubRepo"
                  placeholder="https://github.com/username/repo"
                  value={formData.githubRepo}
                  onChange={(e) => handleChange("githubRepo", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubBranch">Branch</Label>
                <Input
                  id="githubBranch"
                  value={formData.githubBranch}
                  onChange={(e) => handleChange("githubBranch", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Cenové údaje</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceTotal">Celková cena (Kč) *</Label>
                <Input
                  id="priceTotal"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.priceTotal}
                  onChange={(e) => handleChange("priceTotal", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceDeposit">Záloha (Kč)</Label>
                <Input
                  id="priceDeposit"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.priceDeposit}
                  onChange={(e) => handleChange("priceDeposit", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceRemaining">Zbývá uhradit (Kč)</Label>
                <Input
                  id="priceRemaining"
                  type="number"
                  value={formData.priceRemaining}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Časový plán</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Datum zahájení *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Termín dokončení *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleChange("deadline", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Poznámky</h3>

            <div className="space-y-2">
              <Label htmlFor="notes">Poznámky k projektu</Label>
              <Textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Zde můžete přidat další poznámky k projektu..."
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Zrušit
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Převádím...
                </>
              ) : (
                "Převést na projekt"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
