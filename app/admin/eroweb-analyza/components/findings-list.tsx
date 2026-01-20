'use client';

import { cn } from '@/lib/utils';
import { AlertTriangle, XCircle, Lightbulb } from 'lucide-react';
import type { Finding, FindingType } from '@/types/eroweb';
import { useAdminTranslation } from '@/lib/admin-i18n';

interface FindingsListProps {
  findings: Finding[];
  maxItems?: number;
  showAll?: boolean;
}

const FINDING_ICONS: Record<FindingType, React.ComponentType<{ className?: string }>> = {
  critical: XCircle,
  warning: AlertTriangle,
  opportunity: Lightbulb,
};

const FINDING_COLORS: Record<FindingType, { bg: string; text: string; icon: string }> = {
  critical: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    icon: 'text-red-500',
  },
  warning: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    icon: 'text-amber-500',
  },
  opportunity: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    icon: 'text-blue-500',
  },
};

export function FindingsList({ findings, maxItems = 10, showAll = false }: FindingsListProps) {
  const { t } = useAdminTranslation();
  const displayFindings = showAll ? findings : findings.slice(0, maxItems);

  if (findings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t.eroweb.findingLabels?.noProblems || 'No problems found'}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayFindings.map((finding) => (
        <FindingItem key={finding.id} finding={finding} />
      ))}
      {!showAll && findings.length > maxItems && (
        <div className="text-center text-sm text-muted-foreground">
          + {findings.length - maxItems} {t.eroweb.findingLabels?.moreFindings || 'more findings'}
        </div>
      )}
    </div>
  );
}

interface FindingItemProps {
  finding: Finding;
  compact?: boolean;
}

export function FindingItem({ finding, compact = false }: FindingItemProps) {
  const { t } = useAdminTranslation();
  const Icon = FINDING_ICONS[finding.type];
  const colors = FINDING_COLORS[finding.type];
  const label = t.eroweb.findingTypes?.[finding.type] || finding.type;

  return (
    <div
      className={cn(
        'rounded-lg border border-border overflow-hidden',
        colors.bg
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('mt-0.5', colors.icon)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('text-xs font-medium uppercase', colors.text)}>
                {label}
              </span>
              <span className="text-xs text-muted-foreground">
                {finding.category.toUpperCase()}
              </span>
            </div>
            <h4 className="font-medium text-foreground mb-1">
              {finding.title}
            </h4>
            {!compact && (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  {finding.description}
                </p>
                <p className="text-sm text-muted-foreground/80">
                  <span className="font-medium">{t.eroweb.findingLabels?.impact || 'Impact'}:</span> {finding.impact}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Grouped findings by type
interface GroupedFindingsProps {
  findings: Finding[];
}

export function GroupedFindings({ findings }: GroupedFindingsProps) {
  const { t } = useAdminTranslation();
  const critical = findings.filter(f => f.type === 'critical');
  const warnings = findings.filter(f => f.type === 'warning');
  const opportunities = findings.filter(f => f.type === 'opportunity');

  return (
    <div className="space-y-6">
      {critical.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-red-400 mb-3">
            <XCircle className="w-5 h-5" />
            {t.eroweb.findingLabels?.criticalProblems || 'Critical Problems'} ({critical.length})
          </h3>
          <div className="space-y-3">
            {critical.map(f => <FindingItem key={f.id} finding={f} />)}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-amber-400 mb-3">
            <AlertTriangle className="w-5 h-5" />
            {t.eroweb.findingLabels?.warnings || 'Warnings'} ({warnings.length})
          </h3>
          <div className="space-y-3">
            {warnings.map(f => <FindingItem key={f.id} finding={f} />)}
          </div>
        </div>
      )}

      {opportunities.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-blue-400 mb-3">
            <Lightbulb className="w-5 h-5" />
            {t.eroweb.findingLabels?.opportunities || 'Opportunities'} ({opportunities.length})
          </h3>
          <div className="space-y-3">
            {opportunities.map(f => <FindingItem key={f.id} finding={f} />)}
          </div>
        </div>
      )}
    </div>
  );
}
