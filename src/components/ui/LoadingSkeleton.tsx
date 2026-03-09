import { cn } from '@/lib/utils';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Status bar */}
      <div className="h-28 rounded-xl bg-muted" />
      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="h-72 rounded-xl bg-muted" />
          <div className="h-52 rounded-xl bg-muted" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="h-60 rounded-xl bg-muted" />
          <div className="h-60 rounded-xl bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="h-72 rounded-xl bg-muted" />
        <div className="h-72 rounded-xl bg-muted" />
        <div className="h-72 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-10 rounded bg-muted" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 rounded bg-muted/60" />
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return <div className={cn('rounded-xl bg-muted animate-pulse', className)} />;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-sora font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}
