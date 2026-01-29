"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, FileText, Loader2, Download, Search, UserCheck, UserPlus } from "lucide-react";
import type { InvoiceType, InvoiceItem, PaymentMethod, InvoiceStatus, Client } from "@/types/payments";

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAdminAuth();

  const [loading, setLoading] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(searchParams.get('lead_id'));
  const [projectId, setProjectId] = useState<string | null>(searchParams.get('project_id'));

  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    client_street: "",
    client_city: "",
    client_zip: "",
    client_country: "Česká republika",
    client_ico: "",
    client_dic: "",
    invoice_type: "standard" as InvoiceType,
    payment_method: "bank_transfer" as PaymentMethod,
    status: "draft" as InvoiceStatus,
    due_days: 14,
    related_invoice_id: "",
    notes: "",
    internal_notes: "",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: "Vývoj webových stránek",
      quantity: 1,
      unit_price: 3000000, // 30,000 CZK in haléře
      vat_rate: 0, // Default 0% - nejsme plátci DPH
    },
  ]);

  // Client search state
  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState<Client[]>([]);
  const [clientSearching, setClientSearching] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const clientSearchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced client search
  const handleClientSearch = useCallback((query: string) => {
    setClientSearch(query);
    setSelectedClientId(null);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
      setClientResults([]);
      setShowClientDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setClientSearching(true);
      try {
        const res = await fetch(`/api/clients?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setClientResults(data.data);
          setShowClientDropdown(true);
        } else {
          setClientResults([]);
          setShowClientDropdown(false);
        }
      } catch (err) {
        console.error("Client search error:", err);
      } finally {
        setClientSearching(false);
      }
    }, 300);
  }, []);

  // Select client from dropdown
  const handleSelectClient = (client: Client) => {
    setSelectedClientId(client.id);
    setClientSearch(client.name);
    setShowClientDropdown(false);
    setFormData((prev) => ({
      ...prev,
      client_name: client.name,
      client_email: client.email || "",
      client_phone: client.phone || "",
      client_street: client.street || "",
      client_city: client.city || "",
      client_zip: client.zip || "",
      client_country: client.country || "Česká republika",
      client_ico: client.ico || "",
      client_dic: client.dic || "",
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (clientSearchRef.current && !clientSearchRef.current.contains(e.target as Node)) {
        setShowClientDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load lead data if lead_id provided
  useEffect(() => {
    if (leadId) {
      loadLeadData(leadId);
    }
  }, [leadId]);

  const loadLeadData = async (id: string) => {
    try {
      const response = await fetch(`/api/leads/${id}`);
      const result = await response.json();

      if (result.success && result.lead) {
        const lead = result.lead;
        setFormData(prev => ({
          ...prev,
          client_name: lead.company || lead.name || "",
          client_email: lead.email || "",
          client_phone: lead.phone || "",
        }));
      }
    } catch (error) {
      console.error("Error loading lead:", error);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        unit_price: 0,
        vat_rate: 0, // Default 0% - nejsme plátci DPH
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setItems(newItems);
  };

  const calculateTotal = () => {
    let totalWithoutVat = 0;
    let vatAmount = 0;

    for (const item of items) {
      const itemTotal = item.quantity * item.unit_price;
      totalWithoutVat += itemTotal;
      vatAmount += Math.round(itemTotal * (item.vat_rate / 100));
    }

    return {
      withoutVat: totalWithoutVat / 100,
      vat: vatAmount / 100,
      withVat: (totalWithoutVat + vatAmount) / 100,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_name) {
      alert("Prosím vyplňte jméno klienta");
      return;
    }

    if (items.length === 0) {
      alert("Prosím přidejte alespoň jednu položku");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          items,
          lead_id: leadId,
          project_id: projectId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Invoice created:", result.invoice);

        // Show success message
        const emailStatus = result.email_sent
          ? "Faktura byla vytvořena a odeslána na email!"
          : "Faktura byla vytvořena!";
        alert(emailStatus);

        // Open PDF in new tab
        if (result.pdf_url) {
          window.open(result.pdf_url, '_blank');
        }

        // Redirect to invoices list
        router.push("/admin/invoices");
      } else {
        alert(`Chyba: ${result.error}`);
      }
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      alert("Nastala chyba při vytváření faktury");
    } finally {
      setLoading(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/invoices")}
          className="mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zpět
        </Button>
        <h1 className="text-3xl font-bold">Nová faktura</h1>
        <p className="text-muted-foreground">
          Vytvořte novou fakturu pro klienta
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Nastavení faktury</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="invoice_type">Typ faktury</Label>
                <Select
                  value={formData.invoice_type}
                  onValueChange={(value) => setFormData({ ...formData, invoice_type: value as InvoiceType })}
                >
                  <SelectTrigger id="invoice_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Faktura</SelectItem>
                    <SelectItem value="proforma">Proforma</SelectItem>
                    <SelectItem value="deposit">Záloha</SelectItem>
                    <SelectItem value="final">Konečná faktura</SelectItem>
                    <SelectItem value="credit_note">Dobropis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as InvoiceStatus })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Koncept</SelectItem>
                    <SelectItem value="issued">Vystaveno</SelectItem>
                    <SelectItem value="sent">Odesláno</SelectItem>
                    <SelectItem value="awaiting_payment">Čeká na zaplacení</SelectItem>
                    <SelectItem value="deposit_paid">Zaplacena záloha</SelectItem>
                    <SelectItem value="paid">Zaplaceno</SelectItem>
                    <SelectItem value="overdue">Po splatnosti</SelectItem>
                    <SelectItem value="cancelled">Zrušeno</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Způsob platby</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => setFormData({ ...formData, payment_method: value as PaymentMethod })}
                >
                  <SelectTrigger id="payment_method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bankovní převod</SelectItem>
                    <SelectItem value="card">Platební kartou</SelectItem>
                    <SelectItem value="gopay">GoPay</SelectItem>
                    <SelectItem value="cash">Hotově</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_days">Splatnost (dny)</Label>
                <Input
                  id="due_days"
                  type="number"
                  min="1"
                  value={formData.due_days}
                  onChange={(e) => setFormData({ ...formData, due_days: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {/* Related Invoice (for final invoices after deposit) */}
            {formData.invoice_type === "final" && (
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="related_invoice_id">
                  Navázat na zálohovou fakturu (volitelné)
                </Label>
                <Input
                  id="related_invoice_id"
                  placeholder="ID zálohové faktury"
                  value={formData.related_invoice_id}
                  onChange={(e) => setFormData({ ...formData, related_invoice_id: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Pokud tato faktura navazuje na dříve vystavenou zálohu, zadejte zde ID té faktury
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle>Údaje klienta</CardTitle>
            <CardDescription>
              Začněte psát jméno, IČO nebo email pro vyhledání existujícího klienta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Client search */}
            <div ref={clientSearchRef} className="relative">
              <Label htmlFor="client_search">Vyhledat klienta</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="client_search"
                  placeholder="Hledat dle jména, IČO nebo emailu..."
                  value={clientSearch}
                  onChange={(e) => handleClientSearch(e.target.value)}
                  className="pl-10"
                />
                {clientSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Dropdown results */}
              {showClientDropdown && clientResults.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
                  {clientResults.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md"
                      onClick={() => handleSelectClient(client)}
                    >
                      <UserCheck className="h-4 w-4 flex-shrink-0 text-teal-500" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{client.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {[client.ico && `IČO: ${client.ico}`, client.email].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {client.invoice_count} {client.invoice_count === 1 ? "faktura" : client.invoice_count < 5 ? "faktury" : "faktur"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected / New client indicator */}
            {selectedClientId ? (
              <div className="flex items-center gap-2 text-sm text-teal-600 bg-teal-50 dark:bg-teal-950/30 rounded-md px-3 py-2">
                <UserCheck className="h-4 w-4" />
                <span>Existující klient — údaje byly vyplněny automaticky</span>
                <button
                  type="button"
                  className="ml-auto text-xs underline hover:no-underline"
                  onClick={() => {
                    setSelectedClientId(null);
                    setClientSearch("");
                  }}
                >
                  Zrušit výběr
                </button>
              </div>
            ) : formData.client_name ? (
              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 dark:bg-blue-950/30 rounded-md px-3 py-2">
                <UserPlus className="h-4 w-4" />
                <span>Nový klient — bude uložen automaticky při vytvoření faktury</span>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client_name">Jméno / Firma *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => {
                    setFormData({ ...formData, client_name: e.target.value });
                    if (selectedClientId) setSelectedClientId(null);
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_email">Email</Label>
                <Input
                  id="client_email"
                  type="email"
                  placeholder="klient@example.com"
                  value={formData.client_email}
                  onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  📧 Faktura bude automaticky odeslána na tento email
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_phone">Telefon</Label>
                <Input
                  id="client_phone"
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_street">Ulice</Label>
                <Input
                  id="client_street"
                  value={formData.client_street}
                  onChange={(e) => setFormData({ ...formData, client_street: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_city">Město</Label>
                <Input
                  id="client_city"
                  value={formData.client_city}
                  onChange={(e) => setFormData({ ...formData, client_city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_zip">PSČ</Label>
                <Input
                  id="client_zip"
                  value={formData.client_zip}
                  onChange={(e) => setFormData({ ...formData, client_zip: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_ico">IČO</Label>
                <Input
                  id="client_ico"
                  value={formData.client_ico}
                  onChange={(e) => setFormData({ ...formData, client_ico: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_dic">DIČ</Label>
                <Input
                  id="client_dic"
                  value={formData.client_dic}
                  onChange={(e) => setFormData({ ...formData, client_dic: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle>Položky faktury</CardTitle>
            <CardDescription>
              Ceny zadávejte v korunách (automaticky se převedou na haléře)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid gap-4 md:grid-cols-12 items-end border-b pb-4">
                <div className="md:col-span-5 space-y-2">
                  <Label htmlFor={`item_desc_${index}`}>Popis</Label>
                  <Input
                    id={`item_desc_${index}`}
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    placeholder="Např. Vývoj webových stránek"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`item_qty_${index}`}>Množství</Label>
                  <Input
                    id={`item_qty_${index}`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value))}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`item_price_${index}`}>Cena (Kč)</Label>
                  <Input
                    id={`item_price_${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price / 100}
                    onChange={(e) => handleItemChange(index, "unit_price", Math.round(parseFloat(e.target.value) * 100))}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`item_vat_${index}`}>DPH (%)</Label>
                  <Select
                    value={item.vat_rate.toString()}
                    onValueChange={(value) => handleItemChange(index, "vat_rate", parseInt(value))}
                  >
                    <SelectTrigger id={`item_vat_${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="15">15%</SelectItem>
                      <SelectItem value="21">21%</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Nejsme plátci DPH
                  </p>
                </div>

                <div className="md:col-span-1 flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddItem}
            >
              <Plus className="mr-2 h-4 w-4" />
              Přidat položku
            </Button>

            {/* Total */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Základ daně:</span>
                <span className="font-medium">{total.withoutVat.toLocaleString('cs-CZ', { minimumFractionDigits: 2 })} Kč</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">DPH:</span>
                <span className="font-medium">{total.vat.toLocaleString('cs-CZ', { minimumFractionDigits: 2 })} Kč</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Celkem:</span>
                <span className="text-teal-600">{total.withVat.toLocaleString('cs-CZ', { minimumFractionDigits: 2 })} Kč</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Poznámky</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Poznámka na faktuře (viditelná pro klienta)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Např. Platba předem, děkujeme za spolupráci..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal_notes">Interní poznámka (pouze pro admin)</Label>
              <Textarea
                id="internal_notes"
                value={formData.internal_notes}
                onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                placeholder="Interní poznámky..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/invoices")}
          >
            Zrušit
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vytvářím...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Vytvořit fakturu
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
