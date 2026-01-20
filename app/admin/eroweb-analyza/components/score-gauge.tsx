'use client';

import { cn } from '@/lib/utils';
import { getScoreCategory, SCORE_COLORS } from '@/types/eroweb';
import { useAdminTranslation } from '@/lib/admin-i18n';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

export function ScoreGauge({
  score,
  size = 'md',
  showLabel = true,
  animated = true,
}: ScoreGaugeProps) {
  const { t } = useAdminTranslation();
  const category = getScoreCategory(score);
  const color = SCORE_COLORS[category];

  // Get localized label from translations
  const categoryToLabelKey: Record<string, keyof typeof t.eroweb.scoreLabels> = {
    critical: 'critical',
    poor: 'poor',
    average: 'average',
    good: 'good',
    excellent: 'excellent',
  };
  const label = t.eroweb.scoreLabels?.[categoryToLabelKey[category]] || category;

  const sizes = {
    sm: { width: 60, fontSize: 'text-lg', strokeWidth: 4, labelSize: 'text-xs' },
    md: { width: 100, fontSize: 'text-3xl', strokeWidth: 6, labelSize: 'text-sm' },
    lg: { width: 140, fontSize: 'text-5xl', strokeWidth: 8, labelSize: 'text-base' },
  };

  const { width, fontSize, strokeWidth, labelSize } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width, height: width }}>
        <svg className="transform -rotate-90" width={width} height={width}>
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="#252525"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className={cn(animated && 'transition-all duration-1000 ease-out')}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-bold text-foreground', fontSize)}>
            {score}
          </span>
        </div>
      </div>
      {/* Label */}
      {showLabel && (
        <span
          className={cn('font-medium', labelSize)}
          style={{ color }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

// Category score bar component
interface CategoryScoreBarProps {
  label: string;
  score: number;
  maxScore: number;
  color?: string;
}

export function CategoryScoreBar({
  label,
  score,
  maxScore,
  color,
}: CategoryScoreBarProps) {
  const percentage = (score / maxScore) * 100;
  const category = getScoreCategory((score / maxScore) * 100);
  const barColor = color || SCORE_COLORS[category];

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{score}/{maxScore}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
}
