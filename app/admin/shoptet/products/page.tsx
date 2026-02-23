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
import { Package, DollarSign, AlertTriangle, Eye } from "lucide-react";

interface Product {
  id: number;
  shoptet_id: string;
  name: string;
  sku: string | null;
  price: number;
  price_before_discount: number | null;
  currency: string;
  stock: number;
  brand: string | null;
  category: string | null;
  image_url: string | null;
  visible: number;
  updated_at: number;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK" }).format(price);

const formatDate = (ts: number) =>
  new Date(ts * 1000).toLocaleDateString("cs-CZ");

export default function ShoptetProductsPage() {
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("all");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState("all");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data: statsData, isLoading: statsLoading } = useShoptetQuery<{
    products: number; orders: number; customers: number; revenue: number;
  }>({ endpoint: "/api/shoptet/stats" });

  const { data, isLoading } = useShoptetQuery<{
    items: Product[];
    total: number;
    brands: string[];
    categories: string[];
  }>({
    endpoint: "/api/shoptet/products",
    params: {
      limit,
      offset,
      search: search || undefined,
      brand: brand !== "all" ? brand : undefined,
      category: category !== "all" ? category : undefined,
      stock: stock !== "all" ? stock : undefined,
    },
  });

  const items = data?.items || [];
  const total = data?.total || 0;
  const brands = data?.brands || [];
  const categories = data?.categories || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Produkty</h1>
        <p className="text-muted-foreground">Přehled produktů synchronizovaných ze Shoptet</p>
      </div>

      <StatsCards
        loading={statsLoading}
        items={[
          { label: "Celkem produktů", value: statsData?.products ?? 0, icon: Package },
          { label: "Celkem objednávek", value: statsData?.orders ?? 0, icon: DollarSign },
          { label: "Tržby", value: formatPrice(statsData?.revenue ?? 0), icon: DollarSign, description: "celkový obrat" },
          { label: "Vyprodáno", value: items.filter((p) => p.stock === 0).length, icon: AlertTriangle, description: "z aktuální stránky" },
        ]}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Hledat produkt..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
          className="w-64"
        />
        <Select value={brand} onValueChange={(v) => { setBrand(v); setOffset(0); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Značka" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechny značky</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={(v) => { setCategory(v); setOffset(0); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechny kategorie</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stock} onValueChange={(v) => { setStock(v); setOffset(0); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sklad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechny</SelectItem>
            <SelectItem value="inStock">Skladem</SelectItem>
            <SelectItem value="outOfStock">Vyprodáno</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Žádné produkty</h3>
          <p className="text-muted-foreground">
            Synchronizujte produkty ze Shoptet na stránce Synchronizace.
          </p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produkt</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Cena</TableHead>
                <TableHead>Sklad</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Aktualizováno</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        {product.brand && (
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{product.sku || "–"}</TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{formatPrice(product.price)}</span>
                      {product.price_before_discount && product.price_before_discount > product.price && (
                        <span className="text-xs text-muted-foreground line-through ml-2">
                          {formatPrice(product.price_before_discount)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
                      {product.stock > 0 ? `${product.stock} ks` : "Vyprodáno"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{product.category || "–"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {formatDate(product.updated_at)}
                      {!product.visible && (
                        <Eye className="h-3 w-3 text-muted-foreground ml-1" />
                      )}
                    </div>
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
