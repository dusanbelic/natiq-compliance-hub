import { cn } from '@/lib/utils';

interface ComplianceBandBarProps {
  currentRatio: number;
  target: number;
  yellowMin?: number;
  greenMin?: number;
  platinumMin?: number;
  className?: string;
}

export function ComplianceBandBar({
  currentRatio,
  target,
  yellowMin = target * 0.8,
  greenMin = target,
  platinumMin = target * 1.4,
  className,
}: ComplianceBandBarProps) {
  // Calculate position (0-100%) for the indicator
  const maxDisplay = Math.max(platinumMin * 1.2, currentRatio * 1.1);
  const position = (currentRatio / maxDisplay) * 100;
  
  // Zone boundaries as percentages
  const yellowStart = 0;
  const yellowEnd = (yellowMin / maxDisplay) * 100;
  const greenStart = yellowEnd;
  const greenEnd = (greenMin / maxDisplay) * 100;
  const greenHighEnd = (platinumMin / maxDisplay) * 100;

  return (
    <div className={cn('w-full', className)}>
      {/* Labels */}
      <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mb-1">
        <span>0%</span>
        <span>{yellowMin.toFixed(0)}%</span>
        <span>{greenMin.toFixed(0)}%</span>
        <span>{platinumMin.toFixed(0)}%</span>
      </div>
      
      {/* Bar */}
      <div className="relative h-6 rounded-full overflow-hidden flex">
        {/* Red zone (below yellow) */}
        <div 
          className="h-full bg-status-red-light"
          style={{ width: `${yellowEnd}%` }}
        />
        {/* Yellow zone */}
        <div 
          className="h-full bg-amber-light"
          style={{ width: `${greenEnd - yellowEnd}%` }}
        />
        {/* Green zone */}
        <div 
          className="h-full bg-status-green-light"
          style={{ width: `${greenHighEnd - greenEnd}%` }}
        />
        {/* Platinum zone */}
        <div 
          className="h-full bg-teal-light flex-1"
        />
        
        {/* Current position indicator */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-foreground shadow-lg transform -translate-x-1/2 transition-all duration-500"
          style={{ left: `${Math.min(position, 100)}%` }}
        >
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs px-1.5 py-0.5 rounded font-jetbrains font-semibold whitespace-nowrap">
            {currentRatio.toFixed(1)}%
          </div>
        </div>
      </div>
      
      {/* Zone labels */}
      <div className="flex justify-between text-xs mt-1">
        <span className="text-status-red font-medium">Red</span>
        <span className="text-amber font-medium">Yellow</span>
        <span className="text-status-green font-medium">Green</span>
        <span className="text-teal font-medium">Platinum</span>
      </div>
    </div>
  );
}

// Simple horizontal bar showing current vs target
interface SimpleComplianceBarProps {
  current: number;
  target: number;
  className?: string;
}

export function SimpleComplianceBar({ current, target, className }: SimpleComplianceBarProps) {
  const percentage = Math.min((current / target) * 100, 150);
  const isCompliant = current >= target;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">Current: <span className="font-jetbrains font-semibold text-foreground">{current.toFixed(1)}%</span></span>
        <span className="text-muted-foreground">Target: <span className="font-jetbrains font-semibold">{target.toFixed(1)}%</span></span>
      </div>
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isCompliant ? 'bg-status-green' : 'bg-amber'
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
        {/* Target line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-foreground/50"
          style={{ left: `${Math.min((target / Math.max(current, target) * 100), 100)}%` }}
        />
      </div>
    </div>
  );
}
