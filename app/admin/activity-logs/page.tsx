"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  History,
  User,
  UserPlus,
  UserMinus,
  UserCog,
  LogIn,
  LogOut,
  FileText,
  Settings,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { isAdminOrHigher } from "@/lib/auth/permissions";
import type { ActivityLog, ActionType } from "@/lib/activity-log";

const ACTION_ICONS: Record<string, any> = {
  user_created: UserPlus,
  user_updated: UserCog,
  user_deleted: UserMinus,
  user_login: LogIn,
  user_logout: LogOut,
  default: FileText,
};

const ACTION_COLORS: Record<string, string> = {
  user_created: 'bg-green-100 text-green-800',
  user_updated: 'bg-blue-100 text-blue-800',
  user_deleted: 'bg-red-100 text-red-800',
  user_login: 'bg-purple-100 text-purple-800',
  user_logout: 'bg-gray-100 text-gray-800',
  default: 'bg-gray-100 text-gray-800',
};

const ACTION_LABELS: Record<string, string> = {
  user_created: 'Vytvořil uživatele',
  user_updated: 'Upravil uživatele',
  user_deleted: 'Smazal uživatele',
  user_login: 'Přihlášení',
  user_logout: 'Odhlášení',
  lead_created: 'Vytvořil poptávku',
  lead_updated: 'Upravil poptávku',
  lead_deleted: 'Smazal poptávku',
  lead_converted: 'Převedl na projekt',
  project_created: 'Vytvořil projekt',
  project_updated: 'Upravil projekt',
  project_deleted: 'Smazal projekt',
  password_changed: 'Změnil heslo',
  settings_updated: 'Změnil nastavení',
  content_updated: 'Upravil obsah',
};

export default function ActivityLogsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 20;

  // Check access
  useEffect(() => {
    if (user && !isAdminOrHigher(user.role)) {
      router.push('/admin/dashboard');
    }
  }, [user, router]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/activity-logs?limit=${limit}&offset=${page * limit}`);
      const data = await res.json();

      if (data.success) {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionIcon = (action: string) => {
    const Icon = ACTION_ICONS[action] || ACTION_ICONS.default;
    return <Icon className="h-4 w-4" />;
  };

  const getActionColor = (action: string) => {
    return ACTION_COLORS[action] || ACTION_COLORS.default;
  };

  const getActionLabel = (action: string) => {
    return ACTION_LABELS[action] || action;
  };

  if (!user || !isAdminOrHigher(user.role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/admin/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="bg-primary rounded-lg p-2">
                <History className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Záznamy aktivit</h1>
                <p className="text-sm text-muted-foreground">Historie akcí v admin panelu</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Obnovit
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Historie aktivit</CardTitle>
            <CardDescription>
              Celkem {total} záznamů
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && logs.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Zatím žádné záznamy.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Čas</TableHead>
                      <TableHead>Uživatel</TableHead>
                      <TableHead>Akce</TableHead>
                      <TableHead>Objekt</TableHead>
                      <TableHead>Detail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-sm">{log.user_name || 'Unknown'}</div>
                              <div className="text-xs text-muted-foreground">{log.user_email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getActionColor(log.action)} gap-1`}>
                            {getActionIcon(log.action)}
                            {getActionLabel(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {log.entity_name || '-'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {log.details || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Stránka {page + 1} z {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Předchozí
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                      >
                        Další
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
