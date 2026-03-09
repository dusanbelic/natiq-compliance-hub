import { cn } from '@/lib/utils';
import type { ComplianceStatus } from '@/types/database';

interface StatusBadgeProps {
  status: ComplianceStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const STATUS_CONFIG: Record<ComplianceStatus, { className: string; label: string }> = {
  COMPLIANT: {
    className: 'badge-compliant',
    label: 'Compliant',
  },
  AT_RISK: {
    className: 'badge-at-risk',
    label: 'At Risk',
  },
  NON_COMPLIANT: {
    className: 'badge-non-compliant',
    label: 'Non-Compliant',
  },
  UNKNOWN: {
    className: 'badge-unknown',
    label: 'Unknown',
  },
};

const SIZE_CLASSES = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
  lg: 'text-sm px-2.5 py-1',
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        config.className,
        SIZE_CLASSES[size],
        className
      )}
    >
      {config.label}
    </span>
  );
}

// Band-specific badge
interface BandBadgeProps {
  band: string;
  className?: string;
}

const BAND_CONFIG: Record<string, { className: string; label: string }> = {
  PLATINUM: { className: 'badge-compliant', label: 'Platinum' },
  GREEN_HIGH: { className: 'badge-compliant', label: 'Green High' },
  GREEN_LOW: { className: 'badge-compliant', label: 'Green Low' },
  GREEN: { className: 'badge-compliant', label: 'Green Band' },
  YELLOW: { className: 'badge-at-risk', label: 'Yellow Band' },
  RED: { className: 'badge-non-compliant', label: 'Red Band' },
};

export function BandBadge({ band, className }: BandBadgeProps) {
  const config = BAND_CONFIG[band] ?? { className: 'badge-unknown', label: band };

  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
