"use client";

import { useState } from "react";
import { useShoptetQuery } from "@/lib/hooks/use-shoptet-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StatsCards } from "../_components/StatsCards";
import { DataTablePagination } from "../_components/DataTablePagination";
import { TableSkeleton } from "../_components/TableSkeleton";
import { Users, ShoppingCart, DollarSign, Star } from "lucide-react";

interface Customer {
  id: number;
  shoptet_id: string;
  email: string;
  name: string;
  phone: string | null;
  company: string | null;
  city: string | null;
  total_orders: number;
  total_spent: number;
  currency: string;
  rfm_segment: string | null;
  last_order_date: number | null;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK" }).format(price);

const formatDate = (ts: number | null) =>
  ts ? new Date(ts * 1000).toLocaleDateString("cs-CZ") : "–";

const rfmLabels: Record<string, { label: string; color: string }> = {
  champion: { label: "Šampion", color: "bg-green-100 text-green-800" },
  loyal: { label: "Loajální", color: "bg-blue-100 text-blue-800" },
  recent: { label: "Nedávný", color: "bg-indigo-100 text-indigo-800" },
  new: { label: "Nový", color: "bg-purple-100 text-purple-800" },
  at_risk: { label: "V ohrožení", color: "bg-red-100 text-red-800" },
  other: { label: "Ostatní", color: "bg-gray-100 text-gray-800" },
};

export default function ShoptetCustomersPage() {
  const [search, setSearch] = useState("");
  const [rfmSegment, setRfmSegment] = useState("all");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data: statsData, isLoading: statsLoading } = useShoptetQuery<{
    products: number; orders: number; customers: number; revenue: number;
  }>({ endpoint: "/api/shoptet/stats" });

  const { data, isLoading } = useShoptetQuery<{
    items: Customer[];
    total: number;
    segments: string[];
  }>({
    endpoint: "/api/shoptet/customers",
    params: {
      limit,
      offset,
      search: search || undefined,
      rfmSegment: rfmSegment !== "all" ? rfmSegment : undefined,
    },
  });

  const items = data?.items || [];
  const total = data?.total || 0;
  const segments = data?.segments || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Zákazníci</h1>
        <p className="text-muted-foreground">Přehled zákazníků s RFM segmentací</p>
      </div>

      <StatsCards
        loading={statsLoading}
        items={[
          { label: "Celkem zákazníků", value: statsData?.customers ?? 0, icon: Users },
          { label: "Objednávek", value: statsData?.orders ?? 0, icon: ShoppingCart },
          { label: "Tržby", value: formatPrice(statsData?.revenue ?? 0), icon: DollarSign },
          { label: "Prům. na zákazníka", value: statsData?.customers ? formatPrice((statsData?.revenue ?? 0) / statsData.customers) : formatPrice(0), icon: Star },
        ]}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Hledat zákazníka..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
          className="w-64"
        />
        <Select value={rfmSegment} onValueChange={(v) => { setRfmSegment(v); setOffset(0); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="RFM segment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechny segmenty</SelectItem>
            {segments.map((s) => (
              <SelectItem key={s} value={s}>
                {rfmLabels[s]?.label || s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Žádní zákazníci</h3>
          <p className="text-muted-foreground">
            Synchronizujte zákazníky ze Shoptet na stránce Synchronizace.
          </p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zákazník</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>RFM Segment</TableHead>
                <TableHead>Objednávek</TableHead>
                <TableHead>Utraceno</TableHead>
                <TableHead>Poslední obj.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((customer) => {
                const rfm = rfmLabels[customer.rfm_segment || "other"] || rfmLabels.other;
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{customer.name}</p>
                        {customer.company && (
                          <p className="text-xs text-muted-foreground">{customer.company}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{customer.email}</p>
                        {customer.phone && (
                          <p className="text-xs text-muted-foreground">{customer.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={rfm.color} variant="outline">
                        {rfm.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{customer.total_orders}</TableCell>
                    <TableCell className="font-medium">{formatPrice(customer.total_spent)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(customer.last_order_date)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <DataTablePagination
            total={total}
            limit={limit}
            offset={offset}
            onPageChange={setOffset}
          />
        </Card>
      )}
    </div>
  );
}
