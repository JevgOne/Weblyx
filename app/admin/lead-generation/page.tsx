"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Plus,
  Upload,
  Download,
  Search,
  MailPlus,
  BarChart3,
  Bot,
} from "lucide-react";
import Link from "next/link";
import { Lead } from "@/types/lead-generation";

export default function LeadGenerationPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch('/api/lead-generation');
        const data = await response.json();

        if (data.success) {
          setLeads(data.leads);
        }
      } catch (error) {
        console.error('Failed to fetch leads:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLeads();
    }
  }, [user]);

  const handleAnalyzeLead = async (leadId: string) => {
    try {
      const response = await fetch('/api/lead-generation/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh leads
        const refreshResponse = await fetch('/api/lead-generation');
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setLeads(refreshData.leads);
        }

        alert(`✅ Analýza hotová! Skóre: ${data.analysisResult.overallScore}/100`);
      } else {
        alert(`❌ Chyba: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to analyze lead:', error);
      alert("❌ Chyba při analýze webu");
    }
  };

  const handleGenerateEmail = async (leadId: string) => {
    try {
      const response = await fetch('/api/lead-generation/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });

      const data = await response.json();

      if (data.success) {
        alert(` Email vygenerov�n!\n\nPYedmt: ${data.email.subject}\n\nTracking link: https://weblyx.cz/t/${data.email.trackingCode}`);
      } else {
        alert(`❌ Chyba: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to generate email:', error);
      alert('❌ Chyba při generování emailu');
    }
  };

  const handleCSVImport = async () => {
    setIsImporting(true);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';

    fileInput.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) {
        setIsImporting(false);
        return;
      }

      try {
        const csvContent = await file.text();

        const response = await fetch('/api/lead-generation/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvContent }),
        });

        const data = await response.json();

        if (data.success) {
          alert(` Importov�no: ${data.imported} leado\nL Chyby: ${data.failed}`);

          // Refresh leads
          const refreshResponse = await fetch('/api/lead-generation');
          const refreshData = await refreshResponse.json();
          if (refreshData.success) {
            setLeads(refreshData.leads);
          }
        } else {
          alert(`❌ Chyba při importu:\n${data.errors.join('\n')}`);
        }
      } catch (error) {
        console.error('Failed to import CSV:', error);
        alert('❌ Chyba při importu CSV');
      } finally {
        setIsImporting(false);
      }
    };

    fileInput.click();
  };

  const handleDownloadTemplate = () => {
    window.open('/api/lead-generation/import?template=true', '_blank');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zpět
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Lead Generation</h1>
            <p className="text-muted-foreground">
              Správa leadů, analýza webů a generování emailů
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Stáhnout šablonu CSV
          </Button>
          <Button variant="outline" onClick={handleCSVImport} disabled={isImporting}>
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? 'Importuji...' : 'Importovat CSV'}
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/lead-generation/stats">
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistiky
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Celkem leado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Analyzováno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(l => l.analyzedAt).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Email odesl�n
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(l => l.emailSent).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kliknut� na link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(l => l.linkClicked).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leady ({leads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Zat�m nejsou ~�dn� leady.</p>
              <p className="text-sm mt-2">Importujte CSV soubor pro za�tek.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Firma</th>
                    <th className="text-left p-2 font-medium">Email</th>
                    <th className="text-left p-2 font-medium">Website</th>
                    <th className="text-center p-2 font-medium">Sk�re</th>
                    <th className="text-center p-2 font-medium">Status</th>
                    <th className="text-right p-2 font-medium">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{lead.companyName}</td>
                      <td className="p-2 text-sm text-muted-foreground">{lead.email}</td>
                      <td className="p-2 text-sm">
                        {lead.website ? (
                          <a
                            href={`https://${lead.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {lead.website}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {lead.analyzedAt ? (
                          <Badge variant={lead.analysisScore < 50 ? 'destructive' : lead.analysisScore < 80 ? 'default' : 'secondary'}>
                            {lead.analysisScore}/100
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        <Badge variant={
                          lead.leadStatus === 'converted' ? 'default' :
                          lead.leadStatus === 'interested' ? 'secondary' :
                          'outline'
                        }>
                          {lead.leadStatus}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2 justify-end">
                          {!lead.analyzedAt && lead.website && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAnalyzeLead(lead.id)}
                            >
                              <Search className="h-4 w-4 mr-1" />
                              Analyzovat
                            </Button>
                          )}

                          {lead.analyzedAt && !lead.emailSent && (
                            <Button
                              size="sm"
                              onClick={() => handleGenerateEmail(lead.id)}
                            >
                              <MailPlus className="h-4 w-4 mr-1" />
                              Generovat email
                            </Button>
                          )}

                          {lead.emailSent && (
                            <Badge variant="secondary" className="text-xs">
                               Email pYipraven
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
