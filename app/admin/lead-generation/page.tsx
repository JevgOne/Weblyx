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

interface Outreach {
  from: string;
  queued: number;
  sent: number;
  optedOut: number;
  batch: { company: string; email: string; subject: string }[];
  preview: { subject: string; html: string } | null;
}

export default function LeadGenerationPage() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [outreach, setOutreach] = useState<Outreach | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);

  const refreshLeads = async () => {
    const response = await fetch('/api/lead-generation?limit=5000');
    const data = await response.json();
    if (data.success) setLeads(data.leads);
  };

  const loadOutreach = async () => {
    try {
      const response = await fetch('/api/lead-generation/outreach', { cache: 'no-store' });
      const data = await response.json();
      if (data.success) setOutreach(data);
    } catch (error) {
      console.error('Failed to load outreach queue:', error);
    }
  };

  const handleSendTest = async () => {
    const to = window.prompt('Na jakou adresu poslat zkušební e-mail?');
    if (!to) return;
    setSending(true);
    try {
      const response = await fetch('/api/lead-generation/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', to: to.trim() }),
      });
      const data = await response.json();
      alert(data.success ? `Zkouška odeslána na ${to.trim()}. Do evidence se nezapsala.` : `❌ ${data.error}`);
    } finally {
      setSending(false);
    }
  };

  const handleSendBatch = async () => {
    if (!outreach || outreach.batch.length === 0) return;
    const ok = window.confirm(
      `Opravdu odeslat ${outreach.batch.length} e-mailů firmám?\n\nOdesílatel: ${outreach.from}\nPrvní: ${outreach.batch[0].email}\n\nOdeslané e-maily nejdou vzít zpět.`
    );
    if (!ok) return;
    setSending(true);
    try {
      const response = await fetch('/api/lead-generation/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send' }),
      });
      const data = await response.json();
      alert(
        data.success
          ? `Odesláno ${data.sent} e-mailů. Ve frontě zbývá ${data.remaining}.`
          : `Odesláno ${data.sent ?? 0}, pak chyba:\n${data.error}`
      );
      await Promise.all([refreshLeads(), loadOutreach()]);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch('/api/lead-generation?limit=5000');
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
      loadOutreach();
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
        const refreshResponse = await fetch('/api/lead-generation?limit=5000');
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
        alert(`Email vygenerován!\n\nPředmět: ${data.email.subject}\n\nTracking link: https://weblyx.cz/t/${data.email.trackingCode}`);
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
          alert(`Importováno: ${data.imported} leadů${data.skipped ? `\nPřeskočeno (bez e-mailu nebo už v seznamu): ${data.skipped}` : ''}${data.failed ? `\nChyby: ${data.failed}` : ''}`);
          loadOutreach();

          // Refresh leads
          const refreshResponse = await fetch('/api/lead-generation?limit=5000');
          const refreshData = await refreshResponse.json();
          if (refreshData.success) {
            setLeads(refreshData.leads);
          }
        } else {
          alert(`❌ Chyba při importu:\n${(data.errors ?? [data.error]).join('\n')}`);
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
          <div><p className="text-muted-foreground">
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
              Celkem leadů
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
              E-mail odeslán
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
              Kliknutí na odkaz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(l => l.linkClicked).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outreach: what goes out next, and the buttons that send it */}
      {outreach && (outreach.queued > 0 || outreach.sent > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Rozesílka oslovení</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ve frontě <strong className="text-foreground">{outreach.queued}</strong> · odesláno{' '}
              <strong className="text-foreground">{outreach.sent}</strong> · odhlášeno{' '}
              <strong className="text-foreground">{outreach.optedOut}</strong>. Odesílatel {outreach.from}. Jedna dávka
              je nejvýše 20 e-mailů a každá firma dostane e-mail jen jednou.
            </p>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setShowPreview((v) => !v)} disabled={outreach.batch.length === 0}>
                <Search className="h-4 w-4 mr-2" />
                {showPreview ? 'Skrýt náhled' : `Náhled další dávky (${outreach.batch.length})`}
              </Button>
              <Button variant="outline" onClick={handleSendTest} disabled={sending || outreach.batch.length === 0}>
                <MailPlus className="h-4 w-4 mr-2" />
                Poslat zkoušku
              </Button>
              <Button onClick={handleSendBatch} disabled={sending || outreach.batch.length === 0}>
                <MailPlus className="h-4 w-4 mr-2" />
                {sending ? 'Odesílám…' : `Odeslat dávku (${outreach.batch.length})`}
              </Button>
            </div>

            {showPreview && outreach.preview && (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border">
                  <p className="border-b px-4 py-2 text-sm font-semibold">Komu půjde tato dávka</p>
                  <ul className="max-h-[420px] divide-y overflow-y-auto text-sm">
                    {outreach.batch.map((m) => (
                      <li key={m.email} className="px-4 py-2">
                        <span className="font-medium">{m.company}</span>
                        <span className="text-muted-foreground"> · {m.email}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border">
                  <p className="border-b px-4 py-2 text-sm font-semibold">První e-mail: {outreach.preview.subject}</p>
                  <iframe
                    title="Náhled e-mailu"
                    srcDoc={outreach.preview.html}
                    className="h-[420px] w-full rounded-b-lg bg-white"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
              <p>Zatím tu nejsou žádné leady.</p>
              <p className="text-sm mt-2">Importujte CSV soubor pro začátek.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Firma</th>
                    <th className="text-left p-2 font-medium">Email</th>
                    <th className="text-left p-2 font-medium">Website</th>
                    <th className="text-center p-2 font-medium">Skóre</th>
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
                              E-mail odeslán
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
