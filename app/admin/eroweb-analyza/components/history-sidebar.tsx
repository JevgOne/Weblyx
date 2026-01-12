'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// ScrollArea component not available - using div instead
import {
  Globe,
  Search,
  Clock,
  Mail,
  MailOpen,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import type { EroWebAnalysis, ContactStatus } from '@/types/eroweb';
import { getScoreCategory, SCORE_COLORS, CONTACT_STATUS_LABELS, CONTACT_STATUS_COLORS } from '@/types/eroweb';

interface HistorySidebarProps {
  analyses: EroWebAnalysis[];
  selectedId?: string;
  onSelect: (analysis: EroWebAnalysis) => void;
  onDelete?: (id: string) => void;
  onNewAnalysis: () => void;
}

const BUSINESS_TYPE_EMOJI: Record<string, string> = {
  massage: '🧖‍♀️',
  privat: '🏠',
  escort: '💎',
};

export function HistorySidebar({
  analyses,
  selectedId,
  onSelect,
  onDelete,
  onNewAnalysis,
}: HistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ContactStatus | 'all'>('all');

  const filteredAnalyses = analyses.filter((a) => {
    const matchesSearch = a.domain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || a.contactStatus === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Group by date
  const groupedByDate = filteredAnalyses.reduce((groups, analysis) => {
    const date = new Date(analysis.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey: string;
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Dnes';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Vcera';
    } else {
      dateKey = date.toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'long',
      });
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(analysis);
    return groups;
  }, {} as Record<string, EroWebAnalysis[]>);

  // Count by status
  const statusCounts = {
    all: analyses.length,
    not_contacted: analyses.filter(a => a.contactStatus === 'not_contacted').length,
    contacted: analyses.filter(a => a.contactStatus === 'contacted').length,
    agreed: analyses.filter(a => a.contactStatus === 'agreed').length,
    no_response: analyses.filter(a => a.contactStatus === 'no_response').length,
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Historie analyz</h2>
        <Button
          onClick={onNewAnalysis}
          className="w-full bg-primary hover:bg-primary/90 text-white mb-3"
        >
          Nova analyza
        </Button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Hledat domenu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="border-b border-border bg-muted/30">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={cn(
              'flex-shrink-0 px-4 py-2 text-sm font-medium transition-colors border-b-2',
              activeFilter === 'all'
                ? 'border-primary text-primary bg-background'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            Vše ({statusCounts.all})
          </button>
          <button
            onClick={() => setActiveFilter('not_contacted')}
            className={cn(
              'flex-shrink-0 px-4 py-2 text-sm font-medium transition-colors border-b-2',
              activeFilter === 'not_contacted'
                ? 'border-gray-500 text-gray-600 bg-background'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            Nekontaktováno ({statusCounts.not_contacted})
          </button>
          <button
            onClick={() => setActiveFilter('contacted')}
            className={cn(
              'flex-shrink-0 px-4 py-2 text-sm font-medium transition-colors border-b-2',
              activeFilter === 'contacted'
                ? 'border-blue-500 text-blue-600 bg-background'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            Kontaktováno ({statusCounts.contacted})
          </button>
          <button
            onClick={() => setActiveFilter('agreed')}
            className={cn(
              'flex-shrink-0 px-4 py-2 text-sm font-medium transition-colors border-b-2',
              activeFilter === 'agreed'
                ? 'border-green-500 text-green-600 bg-background'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            Domluveno ({statusCounts.agreed})
          </button>
          <button
            onClick={() => setActiveFilter('no_response')}
            className={cn(
              'flex-shrink-0 px-4 py-2 text-sm font-medium transition-colors border-b-2',
              activeFilter === 'no_response'
                ? 'border-red-500 text-red-600 bg-background'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            Neodpověděno ({statusCounts.no_response})
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto">
        <div className="p-2">
          {Object.entries(groupedByDate).map(([dateKey, items]) => (
            <div key={dateKey} className="mb-4">
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
                {dateKey}
              </div>
              <div className="space-y-1">
                {items.map((analysis) => (
                  <HistoryItem
                    key={analysis.id}
                    analysis={analysis}
                    isSelected={analysis.id === selectedId}
                    onSelect={() => onSelect(analysis)}
                    onDelete={onDelete ? () => onDelete(analysis.id) : undefined}
                  />
                ))}
              </div>
            </div>
          ))}

          {filteredAnalyses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? 'Zadne vysledky nenalezeny'
                : 'Zadna historie analyz'}
            </div>
          )}
        </div>
      </div>

      {/* Footer with stats */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Celkem: {analyses.length}</span>
          <span>
            Odeslano:{' '}
            {analyses.filter((a) => a.emailSent).length}
          </span>
        </div>
      </div>
    </div>
  );
}

interface HistoryItemProps {
  analysis: EroWebAnalysis;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}

function HistoryItem({ analysis, isSelected, onSelect, onDelete }: HistoryItemProps) {
  const [showDelete, setShowDelete] = useState(false);
  const scoreCategory = getScoreCategory(analysis.scores.total);
  const scoreColor = SCORE_COLORS[scoreCategory];

  return (
    <div
      className={cn(
        'group relative rounded-lg p-3 cursor-pointer transition-colors',
        isSelected
          ? 'bg-primary/10 border border-primary/50'
          : 'hover:bg-muted border border-transparent'
      )}
      onClick={onSelect}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className="flex items-start gap-3">
        {/* Score indicator */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ backgroundColor: scoreColor }}
        >
          {analysis.scores.total}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">
              {analysis.domain}
            </span>
            <span className="text-xs">
              {BUSINESS_TYPE_EMOJI[analysis.businessType]}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              {new Date(analysis.createdAt).toLocaleTimeString('cs-CZ', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>

            {analysis.emailSent && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs px-1 py-0',
                  analysis.emailOpened
                    ? 'border-green-500/50 text-green-500'
                    : 'border-blue-500/50 text-blue-500'
                )}
              >
                {analysis.emailOpened ? (
                  <>
                    <MailOpen className="w-3 h-3 mr-1" />
                    Precteno
                  </>
                ) : (
                  <>
                    <Mail className="w-3 h-3 mr-1" />
                    Odeslano
                  </>
                )}
              </Badge>
            )}
          </div>

          {analysis.contactName && (
            <div className="text-xs text-muted-foreground mt-1 truncate">
              {analysis.contactName}
            </div>
          )}

          {/* Contact Status Badge */}
          <div className="mt-1">
            <Badge
              variant="outline"
              className="text-xs px-2 py-0.5"
              style={{
                borderColor: CONTACT_STATUS_COLORS[analysis.contactStatus],
                color: CONTACT_STATUS_COLORS[analysis.contactStatus],
              }}
            >
              {CONTACT_STATUS_LABELS[analysis.contactStatus]}
            </Badge>
          </div>
        </div>

        {/* Arrow / Delete */}
        <div className="shrink-0">
          {showDelete && onDelete ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <ChevronRight
              className={cn(
                'w-4 h-4 transition-colors',
                isSelected ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Compact list variant for smaller spaces
interface HistoryListCompactProps {
  analyses: EroWebAnalysis[];
  selectedId?: string;
  onSelect: (analysis: EroWebAnalysis) => void;
  maxItems?: number;
}

export function HistoryListCompact({
  analyses,
  selectedId,
  onSelect,
  maxItems = 5,
}: HistoryListCompactProps) {
  const displayAnalyses = analyses.slice(0, maxItems);

  return (
    <div className="space-y-2">
      {displayAnalyses.map((analysis) => {
        const scoreCategory = getScoreCategory(analysis.scores.total);
        const scoreColor = SCORE_COLORS[scoreCategory];

        return (
          <button
            key={analysis.id}
            onClick={() => onSelect(analysis)}
            className={cn(
              'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
              analysis.id === selectedId
                ? 'bg-primary/10'
                : 'hover:bg-muted'
            )}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: scoreColor }}
            >
              {analysis.scores.total}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-foreground truncate">{analysis.domain}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(analysis.createdAt).toLocaleDateString('cs-CZ')}
              </div>
            </div>
          </button>
        );
      })}

      {analyses.length > maxItems && (
        <div className="text-center text-xs text-muted-foreground py-2">
          + {analyses.length - maxItems} dalsich
        </div>
      )}
    </div>
  );
}
