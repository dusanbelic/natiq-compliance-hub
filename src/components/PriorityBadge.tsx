import { cn } from '@/lib/utils';
import type { Priority, EffortLevel, ImpactLevel } from '@/types/database';

// Priority Badge
interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const PRIORITY_CONFIG: Record<Priority, { className: string; label: string }> = {
  CRITICAL: { className: 'badge-critical', label: 'CRITICAL' },
  IMPORTANT: { className: 'badge-important', label: 'IMPORTANT' },
  OPTIONAL: { className: 'badge-optional', label: 'OPTIONAL' },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];

  return (
    <span
      className={cn(
        'inline-flex items-center text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wide',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

// Effort Badge
interface EffortBadgeProps {
  effort: EffortLevel;
  className?: string;
}

const EFFORT_CONFIG: Record<EffortLevel, { className: string; label: string }> = {
  LOW: { className: 'badge-effort-low', label: 'Low Effort' },
  MEDIUM: { className: 'badge-effort-medium', label: 'Medium Effort' },
  HIGH: { className: 'badge-effort-high', label: 'High Effort' },
};

export function EffortBadge({ effort, className }: EffortBadgeProps) {
  const config = EFFORT_CONFIG[effort];

  return (
    <span
      className={cn(
        'inline-flex items-center text-xs px-2 py-0.5 rounded font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

// Impact Badge
interface ImpactBadgeProps {
  impact: ImpactLevel;
  className?: string;
}

const IMPACT_CONFIG: Record<ImpactLevel, { className: string; label: string }> = {
  HIGH: { className: 'badge-high-impact', label: 'High Impact' },
  MEDIUM: { className: 'badge-medium-impact', label: 'Medium Impact' },
  LOW: { className: 'badge-low-impact', label: 'Low Impact' },
};

export function ImpactBadge({ impact, className }: ImpactBadgeProps) {
  const config = IMPACT_CONFIG[impact];

  return (
    <span
      className={cn(
        'inline-flex items-center text-xs px-2 py-0.5 rounded font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

// Compliance Gain Chip
interface ComplianceGainChipProps {
  gain: number;
  className?: string;
}

export function ComplianceGainChip({ gain, className }: ComplianceGainChipProps) {
  return (
    <span className={cn('chip-gain', className)}>
      +{gain.toFixed(1)}%
    </span>
  );
}
