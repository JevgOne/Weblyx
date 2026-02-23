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
import { ShoppingCart, DollarSign, TrendingUp, Package } from "lucide-react";

interface Order {
  id: number;
  shoptet_id: string;
  order_number: string;
  status: string;
  customer_email: string | null;
  customer_name: string | null;
  total_price: number;
  currency: string;
  payment_method: string | null;
  shipping_method: string | null;
  items_count: number;
  order_date: number;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK" }).format(price);

const formatDate = (ts: number) =>
  new Date(ts * 1000).toLocaleDateString("cs-CZ");

const orderStatusColors: Record<string, string> = {
  "Nová": "bg-blue-100 text-blue-800",
  "Přijata": "bg-indigo-100 text-indigo-800",
  "Vyřizuje se": "bg-yellow-100 text-yellow-800",
  "Expedována": "bg-purple-100 text-purple-800",
  "Doručena": "bg-green-100 text-green-800",
  "Stornována": "bg-red-100 text-red-800",
  "Vrácena": "bg-orange-100 text-orange-800",
};

export default function ShoptetOrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data: statsData, isLoading: statsLoading } = useShoptetQuery<{
    products: number; orders: number; customers: number; revenue: number;
  }>({ endpoint: "/api/shoptet/stats" });

  const { data, isLoading } = useShoptetQuery<{
    items: Order[];
    total: number;
    statuses: string[];
  }>({
    endpoint: "/api/shoptet/orders",
    params: {
      limit,
      offset,
      search: search || undefined,
      status: status !== "all" ? status : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
  });

  const items = data?.items || [];
  const total = data?.total || 0;
  const statuses = data?.statuses || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Objednávky</h1>
        <p className="text-muted-foreground">Přehled objednávek ze Shoptet</p>
      </div>

      <StatsCards
        loading={statsLoading}
        items={[
          { label: "Celkem objednávek", value: statsData?.orders ?? 0, icon: ShoppingCart },
          { label: "Tržby", value: formatPrice(statsData?.revenue ?? 0), icon: DollarSign },
          { label: "Průměrná objednávka", value: statsData?.orders ? formatPrice((statsData?.revenue ?? 0) / statsData.orders) : formatPrice(0), icon: TrendingUp },
          { label: "Produktů", value: statsData?.products ?? 0, icon: Package },
        ]}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Hledat objednávku..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
          className="w-64"
        />
        <Select value={status} onValueChange={(v) => { setStatus(v); setOffset(0); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Stav" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechny stavy</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setOffset(0); }}
          className="w-[160px]"
          placeholder="Od"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setOffset(0); }}
          className="w-[160px]"
          placeholder="Do"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={8} columns={7} />
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Žádné objednávky</h3>
          <p className="text-muted-foreground">
            Synchronizujte objednávky ze Shoptet na stránce Synchronizace.
          </p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Číslo</TableHead>
                <TableHead>Zákazník</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead>Částka</TableHead>
                <TableHead>Platba</TableHead>
                <TableHead>Položek</TableHead>
                <TableHead>Datum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{order.customer_name || "–"}</p>
                      {order.customer_email && (
                        <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={orderStatusColors[order.status] || "bg-gray-100 text-gray-800"}
                      variant="outline"
                    >
                      {order.status || "Neznámý"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatPrice(order.total_price)}</TableCell>
                  <TableCell className="text-sm">{order.payment_method || "–"}</TableCell>
                  <TableCell className="text-sm">{order.items_count}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(order.order_date)}
                  </TableCell>
                </TableRow>
              ))}
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
