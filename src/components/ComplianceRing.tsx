import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ComplianceStatus } from '@/types/database';

interface ComplianceRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  status: ComplianceStatus;
  showLabel?: boolean;
  className?: string;
}

const STATUS_COLORS: Record<ComplianceStatus, string> = {
  COMPLIANT: '#059669',    // green
  AT_RISK: '#D97706',      // amber
  NON_COMPLIANT: '#DC2626', // red
  UNKNOWN: '#94A3B8',      // slate
};

export function ComplianceRing({
  value,
  size = 120,
  strokeWidth = 10,
  status,
  showLabel = true,
  className,
}: ComplianceRingProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number>();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - displayValue / 100);
  const color = STATUS_COLORS[status];

  useEffect(() => {
    const duration = 800;
    const startTime = performance.now();
    const startValue = displayValue;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const newValue = startValue + (value - startValue) * eased;
      setDisplayValue(newValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value]);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--slate-300))"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke 0.3s ease' }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-jetbrains font-bold text-foreground"
            style={{ fontSize: size * 0.2 }}
          >
            {displayValue.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

// Mini version for lists and tables
interface ComplianceRingMiniProps {
  value: number;
  status: ComplianceStatus;
  className?: string;
}

export function ComplianceRingMini({ value, status, className }: ComplianceRingMiniProps) {
  return (
    <ComplianceRing
      value={value}
      size={48}
      strokeWidth={5}
      status={status}
      showLabel={false}
      className={className}
    />
  );
}
