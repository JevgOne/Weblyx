"use client";

import { useState } from "react";
import { useShoptetQuery } from "@/lib/hooks/use-shoptet-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "../_components/DataTablePagination";
import { TableSkeleton } from "../_components/TableSkeleton";
import { ShoppingCart, Info, CheckCircle2, XCircle } from "lucide-react";

interface AbandonedCart {
  id: number;
  shoptet_id: string;
  customer_email: string | null;
  customer_name: string | null;
  total_price: number;
  currency: string;
  items_count: number;
  recovered: number;
  created_at: number;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK" }).format(price);

const formatDate = (ts: number) =>
  new Date(ts * 1000).toLocaleDateString("cs-CZ", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

export default function ShoptetAbandonedCartsPage() {
  const [search, setSearch] = useState("");
  const [recovered, setRecovered] = useState("all");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data, isLoading } = useShoptetQuery<{
    items: AbandonedCart[];
    total: number;
  }>({
    endpoint: "/api/shoptet/abandoned-carts",
    params: {
      limit,
      offset,
      search: search || undefined,
      recovered: recovered !== "all" ? recovered : undefined,
    },
  });

  const items = data?.items || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Opuštěné košíky</h1>
        <p className="text-muted-foreground">Přehled nedokončených nákupů ze Shoptet</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Opuštěné košíky</AlertTitle>
        <AlertDescription>
          Data opuštěných košíků závisí na nastavení vašeho Shoptet e-shopu a dostupnosti API.
          Košíky se zobrazí po synchronizaci dat, pokud váš tarif tuto funkci podporuje.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Hledat dle emailu nebo jména..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
          className="w-64"
        />
        <Select value={recovered} onValueChange={(v) => { setRecovered(v); setOffset(0); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Stav obnovení" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechny</SelectItem>
            <SelectItem value="0">Neobnovené</SelectItem>
            <SelectItem value="1">Obnovené</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Žádné opuštěné košíky</h3>
          <p className="text-muted-foreground">
            Momentálně nejsou k dispozici žádná data o opuštěných košících.
          </p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zákazník</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Částka</TableHead>
                <TableHead>Položek</TableHead>
                <TableHead>Obnoveno</TableHead>
                <TableHead>Datum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((cart) => (
                <TableRow key={cart.id}>
                  <TableCell className="font-medium">{cart.customer_name || "–"}</TableCell>
                  <TableCell className="text-sm">{cart.customer_email || "–"}</TableCell>
                  <TableCell className="font-medium">{formatPrice(cart.total_price)}</TableCell>
                  <TableCell>{cart.items_count}</TableCell>
                  <TableCell>
                    {cart.recovered ? (
                      <Badge className="bg-green-100 text-green-800" variant="outline">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Ano
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800" variant="outline">
                        <XCircle className="h-3 w-3 mr-1" />
                        Ne
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(cart.created_at)}
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
