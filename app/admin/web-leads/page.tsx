"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Globe,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Eye,
  Trash2,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface WebLead {
  id: string;
  url: string;
  contactName?: string;
  contactEmail?: string;
  businessName?: string;
  primaryIssue?: string;
  performance?: { score: number };
  seo?: { score: number };
  accessibility?: { score: number };
  analyzedAt: any;
  status?: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  notes?: string;
}

export default function WebLeadsPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<WebLead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch("/api/admin/analyze-website");
        const result = await response.json();

        if (result.success) {
          const formattedLeads = result.data.map((lead: any) => ({
            ...lead,
            analyzedAt: lead.analyzedAt?.toDate ? lead.analyzedAt.toDate() : new Date(lead.analyzedAt),
          }));
          setLeads(formattedLeads);
        }
      } catch (error) {
        console.error("Error fetching web leads:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchLeads();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu chcete smazat tento lead?")) return;

    try {
      const response = await fetch(`/api/admin/analyze-website?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLeads(leads.filter(l => l.id !== id));
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-primary";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default" className="bg-blue-600">Nový</Badge>;
      case 'contacted':
        return <Badge variant="default" className="bg-purple-600">Kontaktován</Badge>;
      case 'quoted':
        return <Badge variant="default" className="bg-yellow-600">Nabídka</Badge>;
      case 'won':
        return <Badge variant="default" className="bg-primary">Vyhrán</Badge>;
      case 'lost':
        return <Badge variant="destructive">Ztracen</Badge>;
      default:
        return <Badge variant="secondary">Nezpracován</Badge>;
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
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
                onClick={() => router.push("/admin/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Web Analyzer Leads</h1>
                <p className="text-sm text-muted-foreground">
                  Správa analýz webů a potenciálních klientů ({leads.length} celkem)
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Hledat podle URL, jména, emailu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  Všechny
                </Button>
                <Button
                  variant={statusFilter === "new" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("new")}
                >
                  Nové
                </Button>
                <Button
                  variant={statusFilter === "contacted" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("contacted")}
                >
                  Kontaktované
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Celkem leadů</p>
                  <p className="text-2xl font-bold">{leads.length}</p>
                </div>
                <Search className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">S kontaktem</p>
                  <p className="text-2xl font-bold">
                    {leads.filter(l => l.contactEmail).length}
                  </p>
                </div>
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Kritické weby</p>
                  <p className="text-2xl font-bold text-red-600">
                    {leads.filter(l => {
                      const avgScore = Math.round(
                        ((l.performance?.score || 0) + (l.seo?.score || 0) + (l.accessibility?.score || 0)) / 3
                      );
                      return avgScore < 50;
                    }).length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pomalé weby</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {leads.filter(l => (l.performance?.score || 0) < 50).length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leads List */}
        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
            <Card>
              <CardContent className="p-16 text-center">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Žádné leady</h2>
                <p className="text-muted-foreground mb-6">
                  Začněte analyzovat weby v Web Analyzeru
                </p>
                <Button onClick={() => router.push("/admin/tools/web-analyzer")}>
                  <Search className="h-4 w-4 mr-2" />
                  Analyzovat web
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredLeads.map((lead) => {
              const avgScore = Math.round(
                ((lead.performance?.score || 0) + (lead.seo?.score || 0) + (lead.accessibility?.score || 0)) / 3
              );

              return (
                <Card key={lead.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <Globe className="h-5 w-5 text-primary" />
                          <a
                            href={lead.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-semibold hover:text-primary transition-colors"
                          >
                            {lead.businessName || lead.url}
                          </a>
                          {getStatusBadge(lead.status)}
                          {lead.primaryIssue && (
                            <Badge variant="outline">{lead.primaryIssue}</Badge>
                          )}
                        </div>

                        {/* Contact Info */}
                        {(lead.contactName || lead.contactEmail) && (
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {lead.contactName && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {lead.contactName}
                              </div>
                            )}
                            {lead.contactEmail && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {lead.contactEmail}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Scores */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Celkové skóre: </span>
                            <span className={`font-bold ${getScoreColor(avgScore)}`}>
                              {avgScore}/100
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Výkon: </span>
                            <span className={`font-bold ${getScoreColor(lead.performance?.score || 0)}`}>
                              {lead.performance?.score || 0}/100
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">SEO: </span>
                            <span className={`font-bold ${getScoreColor(lead.seo?.score || 0)}`}>
                              {lead.seo?.score || 0}/100
                            </span>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Analyzováno: {lead.analyzedAt.toLocaleDateString('cs-CZ')} {lead.analyzedAt.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/admin/tools/web-analyzer?id=${lead.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(lead.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Smazat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
