"use client";

import { useState } from "react";
import { useShoptetQuery, useShoptetSync } from "@/lib/hooks/use-shoptet-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  RefreshCw, Package, ShoppingCart, Users, CheckCircle2,
  XCircle, Clock, AlertTriangle, Settings,
} from "lucide-react";

interface SyncStatusRecord {
  id: number;
  sync_type: string;
  status: string;
  items_synced: number;
  error_message: string | null;
  started_at: number;
  completed_at: number | null;
}

interface ConfigStatus {
  shoptetConfigured: boolean;
  databaseConfigured: boolean;
  shoptetApiUrl: string;
  shoptetApiToken: string;
}

const formatDate = (ts: number) =>
  new Date(ts * 1000).toLocaleString("cs-CZ", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const syncTypeConfig: Record<string, { label: string; icon: typeof Package }> = {
  products: { label: "Produkty", icon: Package },
  orders: { label: "Objednávky", icon: ShoppingCart },
  customers: { label: "Zákazníci", icon: Users },
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  running: { label: "Běží", variant: "default" },
  completed: { label: "Dokončeno", variant: "secondary" },
  failed: { label: "Chyba", variant: "destructive" },
};

export default function ShoptetSyncPage() {
  const [syncingType, setSyncingType] = useState<string | null>(null);

  const { data: configData, isLoading: configLoading } = useShoptetQuery<ConfigStatus>({
    endpoint: "/api/shoptet/sync",
  });

  const { data: syncData, isLoading: syncLoading, refetch } = useShoptetQuery<{
    latest: Record<string, SyncStatusRecord | null>;
    history: SyncStatusRecord[];
  }>({
    endpoint: "/api/shoptet/sync/status",
  });

  const syncMutation = useShoptetSync({
    onSuccess: () => {
      setSyncingType(null);
      refetch();
    },
  });

  const handleSync = (type: string) => {
    setSyncingType(type);
    syncMutation.mutate(type, {
      onError: () => setSyncingType(null),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Synchronizace Shoptet</h1>
        <p className="text-muted-foreground">Správa synchronizace dat z vašeho Shoptet e-shopu</p>
      </div>

      {/* Config Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Stav konfigurace
          </CardTitle>
          <CardDescription>Připojení k Shoptet API a databázi</CardDescription>
        </CardHeader>
        <CardContent>
          {configLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : configData ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                {configData.databaseConfigured ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  Databáze: {configData.databaseConfigured ? "Připojena" : "Nepřipojena"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {configData.shoptetConfigured ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  Shoptet API: {configData.shoptetConfigured ? "Nastaveno" : "Nenastaveno"}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">{configData.shoptetApiUrl}</div>
              <div className="text-sm text-muted-foreground">{configData.shoptetApiToken}</div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nelze načíst konfiguraci</p>
          )}
        </CardContent>
      </Card>

      {/* Warning if not configured */}
      {configData && !configData.shoptetConfigured && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Shoptet API není nakonfigurováno</AlertTitle>
          <AlertDescription>
            Nastavte proměnné prostředí SHOPTET_API_URL a SHOPTET_API_TOKEN pro aktivaci synchronizace.
          </AlertDescription>
        </Alert>
      )}

      {/* Sync error */}
      {syncMutation.isError && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Chyba synchronizace</AlertTitle>
          <AlertDescription>{(syncMutation.error as Error).message}</AlertDescription>
        </Alert>
      )}

      {/* Sync Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {(["products", "orders", "customers"] as const).map((type) => {
          const config = syncTypeConfig[type];
          const Icon = config.icon;
          const latest = syncData?.latest?.[type];
          const isSyncing = syncingType === type;

          return (
            <Card key={type}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {config.label}
                </CardTitle>
                {latest && (
                  <Badge variant={statusConfig[latest.status]?.variant || "outline"}>
                    {statusConfig[latest.status]?.label || latest.status}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {latest ? (
                  <div className="text-sm space-y-1">
                    <p>Poslední sync: {formatDate(latest.started_at)}</p>
                    <p>Položek: {latest.items_synced}</p>
                    {latest.error_message && (
                      <p className="text-red-500 text-xs">{latest.error_message}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Dosud nesynchronizováno</p>
                )}
                <Button
                  onClick={() => handleSync(type)}
                  disabled={isSyncing || !configData?.shoptetConfigured}
                  className="w-full"
                  size="sm"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Synchronizuji...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Synchronizovat
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historie synchronizací
          </CardTitle>
        </CardHeader>
        <CardContent>
          {syncLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : syncData?.history && syncData.history.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Typ</TableHead>
                  <TableHead>Stav</TableHead>
                  <TableHead>Položek</TableHead>
                  <TableHead>Zahájeno</TableHead>
                  <TableHead>Dokončeno</TableHead>
                  <TableHead>Chyba</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncData.history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {syncTypeConfig[record.sync_type]?.label || record.sync_type}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[record.status]?.variant || "outline"}>
                        {statusConfig[record.status]?.label || record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.items_synced}</TableCell>
                    <TableCell className="text-sm">{formatDate(record.started_at)}</TableCell>
                    <TableCell className="text-sm">
                      {record.completed_at ? formatDate(record.completed_at) : "–"}
                    </TableCell>
                    <TableCell className="text-sm text-red-500 max-w-[200px] truncate">
                      {record.error_message || "–"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Zatím žádné synchronizace. Spusťte první sync výše.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
