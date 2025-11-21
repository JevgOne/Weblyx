"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { db } from "@/lib/firebase";
import { PromoCode } from "@/types/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Tag, Calendar, TrendingUp, Percent, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PromoCodesPage() {
  const { user } = useAdminAuth();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    usageLimit: 0,
    validFrom: "",
    validUntil: "",
    enabled: true,
  });

  useEffect(() => {
    if (user) {
      fetchPromoCodes();
    }
  }, [user]);

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      if (typeof db.collection === 'function') {
        // Mock Firebase
        const snapshot = await db.collection("promo_codes").get();
        const codes: PromoCode[] = [];
        snapshot.docs.forEach((doc: any) => {
          codes.push({ id: doc.id, ...doc.data() } as PromoCode);
        });
        setPromoCodes(codes);
      } else {
        // Real Firebase
        const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
        const q = query(collection(db, "promo_codes"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const codes: PromoCode[] = [];
        snapshot.forEach((doc) => {
          codes.push({ id: doc.id, ...doc.data() } as PromoCode);
        });
        setPromoCodes(codes);
      }
    } catch (error) {
      console.error("Error fetching promo codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const promoData = {
      code: formData.code.toUpperCase(),
      description: formData.description,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minOrderValue: formData.minOrderValue || undefined,
      maxDiscount: formData.maxDiscount || undefined,
      usageLimit: formData.usageLimit || undefined,
      usageCount: 0,
      validFrom: new Date(formData.validFrom),
      validUntil: new Date(formData.validUntil),
      enabled: formData.enabled,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      if (editingCode && editingCode.id) {
        // Update existing
        if (typeof db.collection === 'function') {
          await db.collection("promo_codes").doc(editingCode.id).update({
            ...promoData,
            createdAt: editingCode.createdAt,
          });
        } else {
          const { doc, updateDoc } = await import('firebase/firestore');
          await updateDoc(doc(db, "promo_codes", editingCode.id), {
            ...promoData,
            createdAt: editingCode.createdAt,
          });
        }
      } else {
        // Create new
        if (typeof db.collection === 'function') {
          await db.collection("promo_codes").add(promoData);
        } else {
          const { collection, addDoc } = await import('firebase/firestore');
          await addDoc(collection(db, "promo_codes"), promoData);
        }
      }

      await fetchPromoCodes();
      setShowForm(false);
      setEditingCode(null);
      resetForm();
    } catch (error) {
      console.error("Error saving promo code:", error);
    }
  };

  const handleEdit = (code: PromoCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      description: code.description,
      discountType: code.discountType,
      discountValue: code.discountValue,
      minOrderValue: code.minOrderValue || 0,
      maxDiscount: code.maxDiscount || 0,
      usageLimit: code.usageLimit || 0,
      validFrom: formatDateForInput(code.validFrom),
      validUntil: formatDateForInput(code.validUntil),
      enabled: code.enabled,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu chcete smazat tento promo kód?")) return;

    try {
      if (typeof db.collection === 'function') {
        await db.collection("promo_codes").doc(id).delete();
      } else {
        const { doc, deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, "promo_codes", id));
      }
      await fetchPromoCodes();
    } catch (error) {
      console.error("Error deleting promo code:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      minOrderValue: 0,
      maxDiscount: 0,
      usageLimit: 0,
      validFrom: "",
      validUntil: "",
      enabled: true,
    });
    setEditingCode(null);
  };

  const formatDateForInput = (date: Date | any): string => {
    const d = date instanceof Date ? date : date.toDate();
    return d.toISOString().slice(0, 16);
  };

  const formatDate = (date: Date | any): string => {
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleDateString("cs-CZ");
  };

  const isExpired = (date: Date | any): boolean => {
    const d = date instanceof Date ? date : date.toDate();
    return d < new Date();
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promo kódy</h1>
          <p className="text-muted-foreground">Správa slev a promo kódů</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nový promo kód
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCode ? "Upravit promo kód" : "Nový promo kód"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Code */}
                <div className="space-y-2">
                  <Label htmlFor="code">Kód *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER2024"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Popis *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Letní sleva 20%"
                    required
                  />
                </div>

                {/* Discount Type */}
                <div className="space-y-2">
                  <Label htmlFor="discountType">Typ slevy *</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value: "percentage" | "fixed") =>
                      setFormData({ ...formData, discountType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Procenta (%)</SelectItem>
                      <SelectItem value="fixed">Fixní částka (Kč)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Discount Value */}
                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    Hodnota slevy * {formData.discountType === "percentage" ? "(%)" : "(Kč)"}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    min="0"
                    required
                  />
                </div>

                {/* Min Order Value */}
                <div className="space-y-2">
                  <Label htmlFor="minOrderValue">Minimální hodnota objednávky (Kč)</Label>
                  <Input
                    id="minOrderValue"
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    min="0"
                  />
                </div>

                {/* Max Discount */}
                {formData.discountType === "percentage" && (
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Maximální sleva (Kč)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                      min="0"
                    />
                  </div>
                )}

                {/* Usage Limit */}
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Limit použití (0 = neomezeno)</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    min="0"
                  />
                </div>

                {/* Valid From */}
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Platnost od *</Label>
                  <Input
                    id="validFrom"
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                  />
                </div>

                {/* Valid Until */}
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Platnost do *</Label>
                  <Input
                    id="validUntil"
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit">{editingCode ? "Uložit změny" : "Vytvořit kód"}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Zrušit
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Promo Codes List */}
      <Card>
        <CardHeader>
          <CardTitle>Všechny promo kódy</CardTitle>
          <CardDescription>Celkem: {promoCodes.length} kódů</CardDescription>
        </CardHeader>
        <CardContent>
          {promoCodes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Zatím nemáte žádné promo kódy.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kód</TableHead>
                  <TableHead>Popis</TableHead>
                  <TableHead>Sleva</TableHead>
                  <TableHead>Použití</TableHead>
                  <TableHead>Platnost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((code) => {
                  const expired = isExpired(code.validUntil);
                  const usageLimitReached = code.usageLimit && code.usageCount >= code.usageLimit;

                  return (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-bold">{code.code}</TableCell>
                      <TableCell>{code.description}</TableCell>
                      <TableCell>
                        {code.discountType === "percentage" ? (
                          <span className="flex items-center gap-1">
                            <Percent className="h-3 w-3" />
                            {code.discountValue}%
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {code.discountValue} Kč
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {code.usageCount}
                        {code.usageLimit ? ` / ${code.usageLimit}` : " / ∞"}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(code.validFrom)} - {formatDate(code.validUntil)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {!code.enabled ? (
                          <Badge variant="secondary">Neaktivní</Badge>
                        ) : expired ? (
                          <Badge variant="destructive">Vypršel</Badge>
                        ) : usageLimitReached ? (
                          <Badge variant="destructive">Vyčerpán</Badge>
                        ) : (
                          <Badge variant="default" className="bg-primary">Aktivní</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(code)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => code.id && handleDelete(code.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
