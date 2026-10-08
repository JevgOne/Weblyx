"use client";

import { Fragment, useEffect, useState } from "react";
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

type Filter = 'all' | 'queued' | 'sent' | 'rejected';

/** The four counts at the top; each one also filters the table. */
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Všechny leady' },
  { key: 'queued', label: 'Ve frontě' },
  { key: 'sent', label: 'Odesláno' },
  { key: 'rejected', label: 'Vyřazeno' },
];

const groupOf = (lead: Lead): Filter => (lead.emailSent ? 'sent' : lead.leadStatus === 'rejected' ? 'rejected' : 'queued');

interface Outreach {
  from: string;
  queued: number;
  sent: number;
  optedOut: number;
  toAnalyze: number;
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
  const [analyzeLeft, setAnalyzeLeft] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [openLead, setOpenLead] = useState<string | null>(null);
  const [leadEmail, setLeadEmail] = useState<{ subject: string | null; html: string | null } | null>(null);

  const counts: Record<Filter, number> = {
    all: leads.length,
    queued: leads.filter((l) => groupOf(l) === 'queued').length,
    sent: leads.filter((l) => groupOf(l) === 'sent').length,
    rejected: leads.filter((l) => groupOf(l) === 'rejected').length,
  };
  // Sent ones newest first: that is the order someone checking a batch reads them in.
  const shown = (filter === 'all' ? leads : leads.filter((l) => groupOf(l) === filter)).slice().sort((a, b) =>
    filter === 'sent' ? new Date(b.emailSentAt ?? 0).getTime() - new Date(a.emailSentAt ?? 0).getTime() : 0
  );

  const toggleEmail = async (leadId: string) => {
    if (openLead === leadId) {
      setOpenLead(null);
      return;
    }
    setOpenLead(leadId);
    setLeadEmail(null);
    try {
      const response = await fetch(`/api/lead-generation/outreach?leadId=${encodeURIComponent(leadId)}`, { cache: 'no-store' });
      const data = await response.json();
      setLeadEmail({ subject: data.subject ?? null, html: data.html ?? null });
    } catch {
      setLeadEmail({ subject: null, html: null });
    }
  };

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

  // Rewrites the stock e-mails from an analysis of each company's website,
  // a few leads per request, until none are left.
  const handleAnalyze = async () => {
    setSending(true);
    try {
      let remaining = outreach?.toAnalyze ?? 0;
      let improved = 0;
      while (remaining > 0) {
        const response = await fetch('/api/lead-generation/outreach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'analyze' }),
        });
        const data = await response.json();
        if (!data.success) break;
        improved += data.improved;
        remaining = data.remaining;
        setAnalyzeLeft(remaining);
      }
      alert(`Hotovo. E-mail podle rozboru webu dostalo ${improved} firem; ostatním zůstal původní text.`);
      await loadOutreach();
    } finally {
      setAnalyzeLeft(null);
      setSending(false);
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

      {/* Counts that double as filters for the table below */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={active}
              className={`rounded-xl border bg-white p-5 text-left transition-colors hover:border-teal-500 ${
                active ? 'border-teal-500 ring-2 ring-teal-500/20' : ''
              }`}
            >
              <span className="block text-sm font-medium text-muted-foreground">{f.label}</span>
              <span className="mt-1 block text-2xl font-bold">{counts[f.key]}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{active ? 'zobrazeno níže' : 'kliknutím zobrazit'}</span>
            </button>
          );
        })}
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
              {outreach.toAnalyze > 0 && (
                <Button variant="outline" onClick={handleAnalyze} disabled={sending}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {analyzeLeft !== null ? `Analyzuji weby… zbývá ${analyzeLeft}` : `Napsat e-maily podle rozboru webu (${outreach.toAnalyze})`}
                </Button>
              )}
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
          <CardTitle>
            {FILTERS.find((f) => f.key === filter)?.label} ({shown.length})
          </CardTitle>
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
          ) : shown.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">V této skupině nic není.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Firma</th>
                    <th className="text-left p-2 font-medium">E-mail</th>
                    <th className="text-left p-2 font-medium">Web</th>
                    <th className="text-left p-2 font-medium">Stav</th>
                    <th className="text-right p-2 font-medium">E-mail</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((lead) => (
                    <Fragment key={lead.id}>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="p-2">{lead.companyName || <span className="text-muted-foreground">bez názvu</span>}</td>
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
                        <td className="p-2 text-sm whitespace-nowrap">
                          {lead.emailSent ? (
                            <Badge variant="secondary">
                              Odesláno{lead.emailSentAt ? ` ${new Date(lead.emailSentAt).toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ''}
                            </Badge>
                          ) : lead.leadStatus === 'rejected' ? (
                            <Badge variant="destructive">Vyřazeno</Badge>
                          ) : (
                            <Badge variant="outline">Ve frontě</Badge>
                          )}
                        </td>
                        <td className="p-2 text-right">
                          <Button size="sm" variant="outline" onClick={() => toggleEmail(lead.id)}>
                            <Search className="h-4 w-4 mr-1" />
                            {openLead === lead.id ? 'Skrýt' : 'Zobrazit'}
                          </Button>
                        </td>
                      </tr>
                      {openLead === lead.id && (
                        <tr className="border-b bg-muted/30">
                          <td colSpan={5} className="p-4">
                            {!leadEmail ? (
                              <Skeleton className="h-40 w-full" />
                            ) : leadEmail.html ? (
                              <div className="rounded-lg border bg-white">
                                <p className="border-b px-4 py-2 text-sm font-semibold">Předmět: {leadEmail.subject}</p>
                                <iframe title="E-mail" srcDoc={leadEmail.html} className="h-[420px] w-full rounded-b-lg bg-white" />
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">K této firmě není připravený žádný e-mail.</p>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
