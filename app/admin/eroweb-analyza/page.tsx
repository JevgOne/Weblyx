'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnalyzerForm } from './components/analyzer-form';
import { AnalysisProgress } from './components/analysis-progress';
import { ReportCard } from './components/report-card';
import { EmailComposer } from './components/email-composer';
import { HistorySidebar } from './components/history-sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Menu, X } from 'lucide-react';
// Toast component not available - using console.log instead
import type { EroWebAnalysis, AnalysisFormData, ContactStatus } from '@/types/eroweb';

type ViewState = 'form' | 'analyzing' | 'report';

export default function EroWebAnalyzaPage() {
  const [viewState, setViewState] = useState<ViewState>('form');
  const [analyses, setAnalyses] = useState<EroWebAnalysis[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<EroWebAnalysis | null>(null);
  const [analysisStep, setAnalysisStep] = useState('');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/eroweb');
      if (res.ok) {
        const data = await res.json();
        setAnalyses(data.analyses || []);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const simulateAnalysisProgress = useCallback(async () => {
    const steps = ['fetch', 'speed', 'seo', 'geo', 'design', 'report'];

    for (const step of steps) {
      setAnalysisStep(step);
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));
      setCompletedSteps((prev) => [...prev, step]);
    }
  }, []);

  const handleAnalyze = async (formData: AnalysisFormData) => {
    setIsLoading(true);
    setViewState('analyzing');
    setCompletedSteps([]);
    setAnalysisStep('fetch');

    // Start progress simulation
    const progressPromise = simulateAnalysisProgress();

    try {
      const res = await fetch('/api/eroweb/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // Wait for progress animation to finish
      await progressPromise;

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Analyza selhala');
      }

      const analysis = await res.json();

      setCurrentAnalysis(analysis);
      setAnalyses((prev) => [analysis, ...prev]);
      setViewState('report');

      console.log('✅ Analyza dokoncena', `Skore: ${analysis.scores.total}/100`);
    } catch (error: any) {
      console.error('❌ Chyba pri analyze:', error.message);
      setViewState('form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnalysis = (analysis: EroWebAnalysis) => {
    setCurrentAnalysis(analysis);
    setViewState('report');
    setIsMobileSidebarOpen(false); // Close mobile sidebar after selection
  };

  const handleDeleteAnalysis = async (id: string) => {
    try {
      const res = await fetch(`/api/eroweb/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAnalyses((prev) => prev.filter((a) => a.id !== id));
        if (currentAnalysis?.id === id) {
          setCurrentAnalysis(null);
          setViewState('form');
        }
        console.log('✅ Analyza smazana');
      }
    } catch (error) {
      console.error('❌ Chyba pri mazani');
    }
  };

  const handleNewAnalysis = () => {
    setCurrentAnalysis(null);
    setViewState('form');
    setCompletedSteps([]);
    setAnalysisStep('');
  };

  const handleSendEmail = async (to: string, subject: string, body: string) => {
    if (!currentAnalysis) return;

    try {
      const res = await fetch('/api/eroweb/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: currentAnalysis.id,
          to,
          subject,
          body,
        }),
      });

      if (!res.ok) {
        throw new Error('Odeslani selhalo');
      }

      // Update local state
      setAnalyses((prev) =>
        prev.map((a) =>
          a.id === currentAnalysis.id
            ? { ...a, emailSent: true, emailSentAt: new Date() }
            : a
        )
      );
      setCurrentAnalysis((prev) =>
        prev ? { ...prev, emailSent: true, emailSentAt: new Date() } : null
      );

      console.log('✅ Email odeslan', `Odeslan na ${to}`);
    } catch (error: any) {
      console.error('❌ Chyba pri odeslani emailu:', error.message);
    }
  };

  const handleDownloadPdf = async () => {
    if (!currentAnalysis) return;

    try {
      const res = await fetch(`/api/eroweb/pdf?id=${currentAnalysis.id}`);
      if (!res.ok) throw new Error('Generovani PDF selhalo');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eroweb-analyza-${currentAnalysis.domain}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('✅ PDF stazeno');
    } catch (error: any) {
      console.error('❌ Chyba pri stahovani PDF:', error.message);
    }
  };

  const handleStatusChange = async (status: ContactStatus) => {
    if (!currentAnalysis) return;

    try {
      const res = await fetch(`/api/eroweb/${currentAnalysis.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactStatus: status }),
      });

      if (!res.ok) {
        throw new Error('Zmena statusu selhala');
      }

      const { analysis } = await res.json();

      // Update local state
      setAnalyses((prev) =>
        prev.map((a) => (a.id === currentAnalysis.id ? analysis : a))
      );
      setCurrentAnalysis(analysis);

      console.log('✅ Status zmenen', `Novy status: ${status}`);
    } catch (error: any) {
      console.error('❌ Chyba pri zmene statusu:', error.message);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="w-80 border-r border-border hidden lg:block">
        <HistorySidebar
          analyses={analyses}
          selectedId={currentAnalysis?.id}
          onSelect={handleSelectAnalysis}
          onDelete={handleDeleteAnalysis}
          onNewAnalysis={handleNewAnalysis}
        />
      </aside>

      {/* Sidebar - Mobile (Overlay) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          {/* Sidebar */}
          <aside className="absolute left-0 top-0 h-full w-80 bg-background border-r border-border overflow-y-auto">
            <HistorySidebar
              analyses={analyses}
              selectedId={currentAnalysis?.id}
              onSelect={handleSelectAnalysis}
              onDelete={handleDeleteAnalysis}
              onNewAnalysis={handleNewAnalysis}
            />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="p-4 sm:p-6 w-full">
          <div className="max-w-4xl mx-auto space-y-6 w-full">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                  className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Toggle history"
                >
                  <Menu className="w-5 h-5 text-foreground" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">EroWeb Analyza</h1>
                  <p className="text-muted-foreground">
                    Analyzujte weby konkurence a ziskejte nove klienty
                  </p>
                </div>
              </div>
              {viewState === 'report' && (
                <button
                  onClick={handleNewAnalysis}
                  className="text-sm text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
                >
                  + Nova analyza
                </button>
              )}
            </div>

            {/* Content based on state */}
            {viewState === 'form' && (
              <AnalyzerForm onAnalyze={handleAnalyze} isLoading={isLoading} />
            )}

            {viewState === 'analyzing' && (
              <AnalysisProgress
                currentStep={analysisStep}
                completedSteps={completedSteps}
              />
            )}

            {viewState === 'report' && currentAnalysis && (
              <Tabs defaultValue="report" className="space-y-6">
                <TabsList className="bg-muted border border-border">
                  <TabsTrigger
                    value="report"
                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Report
                  </TabsTrigger>
                  <TabsTrigger
                    value="email"
                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Email
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="report">
                  <ReportCard
                    analysis={currentAnalysis}
                    onSendEmail={() => {
                      // Switch to email tab
                      const trigger = document.querySelector('[value="email"]');
                      if (trigger instanceof HTMLElement) trigger.click();
                    }}
                    onDownloadPdf={handleDownloadPdf}
                    onStatusChange={handleStatusChange}
                  />
                </TabsContent>

                <TabsContent value="email">
                  <EmailComposer
                    analysis={currentAnalysis}
                    onSend={handleSendEmail}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
