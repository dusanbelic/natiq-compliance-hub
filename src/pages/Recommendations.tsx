import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEntity } from '@/contexts/EntityContext';
import { MOCK_RECOMMENDATIONS } from '@/lib/mockData';
import { PriorityBadge, EffortBadge, ComplianceGainChip } from '@/components/PriorityBadge';
import { toast } from 'sonner';
import type { Priority, RecommendationStatus } from '@/types/database';

export default function Recommendations() {
  const { selectedEntity } = useEntity();
  const recommendations = MOCK_RECOMMENDATIONS[selectedEntity.id] || [];
  const [filter, setFilter] = useState<Priority | 'ALL'>('ALL');
  const [statuses, setStatuses] = useState<Record<string, RecommendationStatus>>({});

  const filtered = filter === 'ALL' ? recommendations : recommendations.filter((r) => r.priority === filter);
  const openRecs = recommendations.filter((r) => (statuses[r.id] || r.status) === 'OPEN');
  const totalGain = openRecs.slice(0, 3).reduce((sum, r) => sum + (r.compliance_gain || 0), 0);

  const markDone = (id: string) => { setStatuses({ ...statuses, [id]: 'DONE' }); toast.success('Action marked complete'); };
  const dismiss = (id: string) => { setStatuses({ ...statuses, [id]: 'DISMISSED' }); toast.info('Recommendation dismissed'); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-sora font-bold text-2xl">Recommendations <span className="text-muted-foreground text-lg">({openRecs.length} open)</span></h1>
      </div>

      <div className="p-4 rounded-lg bg-teal-light border border-primary/20">
        <p className="text-sm text-primary">Complete the top 3 recommendations to gain <strong>+{totalGain.toFixed(1)}%</strong> compliance ratio.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'CRITICAL', 'IMPORTANT', 'OPTIONAL'] as const).map((f) => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>{f === 'ALL' ? 'All' : f}</Button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((rec) => {
          const status = statuses[rec.id] || rec.status;
          if (status === 'DISMISSED') return null;
          return (
            <Card key={rec.id} className={`shadow-card ${status === 'DONE' ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <PriorityBadge priority={rec.priority} />
                      {status === 'DONE' && <span className="text-xs text-status-green font-medium">✓ Done</span>}
                    </div>
                    <h3 className={`font-semibold ${status === 'DONE' ? 'line-through' : ''}`}>{rec.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      {rec.compliance_gain && <ComplianceGainChip gain={rec.compliance_gain} />}
                      {rec.effort_level && <EffortBadge effort={rec.effort_level} />}
                      <span className="text-xs text-muted-foreground">{rec.action_type?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  {status === 'OPEN' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => markDone(rec.id)}>Mark Done</Button>
                      <Button size="sm" variant="ghost" onClick={() => dismiss(rec.id)}>Dismiss</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
