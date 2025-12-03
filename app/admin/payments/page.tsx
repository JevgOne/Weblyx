"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Search, Filter, CreditCard, Calendar, CheckCircle2, XCircle, Clock, Download, ExternalLink } from "lucide-react";
import type { PaymentStatus, PaymentType } from "@/types/payments";

interface Payment {
  id: string;
  gopay_id: string;
  status: PaymentStatus;
  variable_symbol: string;
  amount_czk: number;
  currency: string;
  description: string;
  payment_type: PaymentType;
  payer_name: string | null;
  payer_email: string | null;
  lead_id: string | null;
  invoice_id: string | null;
  created_at: number;
  paid_at: number | null;
}

interface PaymentStats {
  total_amount_czk: number;
  paid_count: number;
  pending_count: number;
  cancelled_count: number;
}

const statusConfig: Record<PaymentStatus, { label: string; color: string; icon: any }> = {
  CREATED: { label: "Vytvořena", color: "bg-gray-500", icon: Clock },
  PAYMENT_METHOD_CHOSEN: { label: "Vybrána metoda", color: "bg-blue-500", icon: CreditCard },
  PAID: { label: "Zaplaceno", color: "bg-green-500", icon: CheckCircle2 },
  AUTHORIZED: { label: "Autorizováno", color: "bg-cyan-500", icon: CheckCircle2 },
  CANCELED: { label: "Zrušeno", color: "bg-red-500", icon: XCircle },
  TIMEOUTED: { label: "Vypršelo", color: "bg-orange-500", icon: Clock },
  REFUNDED: { label: "Vráceno", color: "bg-purple-500", icon: ArrowLeft },
  PARTIALLY_REFUNDED: { label: "Částečně vráceno", color: "bg-purple-400", icon: ArrowLeft },
};

const paymentTypeConfig: Record<PaymentType, { label: string; color: string }> = {
  project: { label: "Projekt", color: "bg-blue-100 text-blue-800" },
  package: { label: "Balíček", color: "bg-green-100 text-green-800" },
  deposit: { label: "Záloha", color: "bg-yellow-100 text-yellow-800" },
  subscription: { label: "Předplatné", color: "bg-purple-100 text-purple-800" },
  manual: { label: "Manuální", color: "bg-gray-100 text-gray-800" },
};

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payments/list?limit=100');
      const result = await response.json();

      if (result.success) {
        setPayments(result.payments);
        setStats(result.stats);
        console.log("✅ Loaded payments:", result.payments.length);
      } else {
        console.error("❌ Failed to load payments:", result.error);
      }
    } catch (error: any) {
      console.error("❌ Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        payment.description.toLowerCase().includes(searchLower) ||
        payment.variable_symbol.includes(searchLower) ||
        payment.payer_name?.toLowerCase().includes(searchLower) ||
        payment.payer_email?.toLowerCase().includes(searchLower) ||
        payment.gopay_id.includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === "all" || payment.status === statusFilter;

      // Type filter
      const matchesType = typeFilter === "all" || payment.payment_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [payments, searchTerm, statusFilter, typeFilter]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin")}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět
          </Button>
          <h1 className="text-3xl font-bold">Platby</h1>
          <p className="text-muted-foreground">
            Správa plateb přes GoPay
          </p>
        </div>
        <Button onClick={() => router.push("/admin/payments/create")}>
          <CreditCard className="mr-2 h-4 w-4" />
          Nová platba
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Celkem zaplaceno
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_amount_czk)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.paid_count} zaplacených plateb
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Čekající
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_count}</div>
              <p className="text-xs text-muted-foreground">
                Nevyřízené platby
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Zrušené
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cancelled_count}</div>
              <p className="text-xs text-muted-foreground">
                Zrušené nebo vypršené
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Celkem plateb
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
              <p className="text-xs text-muted-foreground">
                Všech plateb v systému
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Hledat podle VS, jména, emailu, popisu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny statusy</SelectItem>
                <SelectItem value="CREATED">Vytvořena</SelectItem>
                <SelectItem value="PAYMENT_METHOD_CHOSEN">Vybrána metoda</SelectItem>
                <SelectItem value="PAID">Zaplaceno</SelectItem>
                <SelectItem value="CANCELED">Zrušeno</SelectItem>
                <SelectItem value="TIMEOUTED">Vypršelo</SelectItem>
                <SelectItem value="REFUNDED">Vráceno</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny typy</SelectItem>
                <SelectItem value="project">Projekt</SelectItem>
                <SelectItem value="package">Balíček</SelectItem>
                <SelectItem value="deposit">Záloha</SelectItem>
                <SelectItem value="subscription">Předplatné</SelectItem>
                <SelectItem value="manual">Manuální</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Přehled plateb ({filteredPayments.length})</CardTitle>
          <CardDescription>
            Seznam všech plateb v systému
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Žádné platby</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Zkuste změnit filtry"
                  : "Zatím nebyly vytvořeny žádné platby"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>VS</TableHead>
                  <TableHead>Popis</TableHead>
                  <TableHead>Plátce</TableHead>
                  <TableHead>Částka</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vytvořeno</TableHead>
                  <TableHead className="text-right">Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const statusInfo = statusConfig[payment.status];
                  const typeInfo = paymentTypeConfig[payment.payment_type];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">
                        {payment.variable_symbol}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {payment.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium">
                            {payment.payer_name || "—"}
                          </span>
                          {payment.payer_email && (
                            <span className="text-xs text-muted-foreground">
                              {payment.payer_email}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(payment.amount_czk)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={typeInfo.color}>
                          {typeInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(payment.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {payment.invoice_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/invoices?payment_id=${payment.id}`)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://gate.gopay.cz/payment/${payment.gopay_id}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
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
