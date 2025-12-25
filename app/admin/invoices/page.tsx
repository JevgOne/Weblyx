"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ArrowLeft, Search, Filter, FileText, Calendar, CheckCircle2, AlertCircle, Clock, Download, ExternalLink, Send } from "lucide-react";
import type { InvoiceStatus, InvoiceType } from "@/types/payments";

interface Invoice {
  id: string;
  invoice_number: string;
  variable_symbol: string;
  invoice_type: InvoiceType;
  status: InvoiceStatus;
  client_name: string;
  client_email: string | null;
  amount_czk: number;
  currency: string;
  issue_date: number;
  due_date: number;
  paid_date: number | null;
  payment_id: string | null;
  pdf_url: string | null;
  created_at: number;
  is_overdue: boolean;
  days_until_due: number;
}

interface InvoiceStats {
  total_amount_czk: number;
  paid_count: number;
  unpaid_count: number;
  overdue_count: number;
  total_paid_amount: number;
  total_unpaid_amount: number;
}

const statusConfig: Record<InvoiceStatus, { label: string; color: string; icon: any }> = {
  draft: { label: "Koncept", color: "bg-gray-500", icon: FileText },
  issued: { label: "Vystaveno", color: "bg-blue-500", icon: Send },
  sent: { label: "Odesláno", color: "bg-cyan-500", icon: Send },
  awaiting_payment: { label: "Čeká na zaplacení", color: "bg-orange-500", icon: Clock },
  deposit_paid: { label: "Zaplacena záloha", color: "bg-teal-500", icon: CheckCircle2 },
  paid: { label: "Zaplaceno", color: "bg-green-500", icon: CheckCircle2 },
  overdue: { label: "Po splatnosti", color: "bg-red-500", icon: AlertCircle },
  cancelled: { label: "Zrušeno", color: "bg-gray-400", icon: AlertCircle },
};

const typeConfig: Record<InvoiceType, { label: string; color: string }> = {
  standard: { label: "Faktura", color: "bg-blue-100 text-blue-800" },
  proforma: { label: "Proforma", color: "bg-purple-100 text-purple-800" },
  deposit: { label: "Záloha", color: "bg-yellow-100 text-yellow-800" },
  final: { label: "Konečná", color: "bg-green-100 text-green-800" },
  credit_note: { label: "Dobropis", color: "bg-red-100 text-red-800" },
};

export default function AdminInvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Get payment_id from URL params if present
  const paymentIdFilter = searchParams.get('payment_id');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invoices/list?limit=100');
      const result = await response.json();

      if (result.success) {
        setInvoices(result.invoices);
        setStats(result.stats);
        console.log("✅ Loaded invoices:", result.invoices.length);
      } else {
        console.error("❌ Failed to load invoices:", result.error);
      }
    } catch (error: any) {
      console.error("❌ Error loading invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      // Payment ID filter (from URL)
      if (paymentIdFilter && invoice.payment_id !== paymentIdFilter) {
        return false;
      }

      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        invoice.invoice_number.toLowerCase().includes(searchLower) ||
        invoice.variable_symbol.includes(searchLower) ||
        invoice.client_name.toLowerCase().includes(searchLower) ||
        invoice.client_email?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

      // Type filter
      const matchesType = typeFilter === "all" || invoice.invoice_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [invoices, searchTerm, statusFilter, typeFilter, paymentIdFilter]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
          <h1 className="text-3xl font-bold">Faktury</h1>
          <p className="text-muted-foreground">
            Správa faktur a dokladů
          </p>
        </div>
        <Button onClick={() => router.push("/admin/invoices/new")}>
          <FileText className="mr-2 h-4 w-4" />
          Nová faktura
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Celkem vyfakturováno
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_amount_czk)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.paid_count} zaplacených faktur
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Zaplaceno
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_paid_amount)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.paid_count} faktur
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                K zaplacení
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_unpaid_amount)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.unpaid_count} nezaplacených
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Po splatnosti
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overdue_count}</div>
              <p className="text-xs text-muted-foreground">
                Vyžadují pozornost
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
                  placeholder="Hledat podle čísla faktury, VS, jména..."
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

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny typy</SelectItem>
                <SelectItem value="standard">Faktura</SelectItem>
                <SelectItem value="proforma">Proforma</SelectItem>
                <SelectItem value="deposit">Záloha</SelectItem>
                <SelectItem value="final">Konečná</SelectItem>
                <SelectItem value="credit_note">Dobropis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Přehled faktur ({filteredInvoices.length})</CardTitle>
          <CardDescription>
            Seznam všech faktur v systému
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Žádné faktury</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Zkuste změnit filtry"
                  : "Zatím nebyly vytvořeny žádné faktury"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Číslo faktury</TableHead>
                  <TableHead>Klient</TableHead>
                  <TableHead>Částka</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vystaveno</TableHead>
                  <TableHead>Splatnost</TableHead>
                  <TableHead className="text-right">Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const statusInfo = statusConfig[invoice.status];
                  const typeInfo = typeConfig[invoice.invoice_type];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium">
                            {invoice.client_name}
                          </span>
                          {invoice.client_email && (
                            <span className="text-xs text-muted-foreground">
                              {invoice.client_email}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(invoice.amount_czk)}
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
                        {formatDate(invoice.issue_date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className={`text-sm ${invoice.is_overdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                            {formatDate(invoice.due_date)}
                          </span>
                          {invoice.days_until_due < 0 && (
                            <span className="text-xs text-red-500">
                              {Math.abs(invoice.days_until_due)} dní po splatnosti
                            </span>
                          )}
                          {invoice.days_until_due >= 0 && invoice.days_until_due <= 7 && invoice.status !== 'paid' && (
                            <span className="text-xs text-orange-500">
                              Zbývá {invoice.days_until_due} dní
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {invoice.pdf_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(invoice.pdf_url!, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {invoice.payment_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/payments?invoice_id=${invoice.id}`)}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
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
