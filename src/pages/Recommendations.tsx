import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEntity } from '@/contexts/EntityContext';
import { MOCK_RECOMMENDATIONS } from '@/lib/mockData';
import { PriorityBadge, EffortBadge, ComplianceGainChip } from '@/components/PriorityBadge';
import { PostJobDialog } from '@/components/recommendations/PostJobDialog';
import { EmptyState } from '@/components/ui/LoadingSkeleton';
import { toast } from 'sonner';
import { Lightbulb, Briefcase } from 'lucide-react';
import type { Priority, RecommendationStatus, Recommendation } from '@/types/database';

type SortBy = 'priority' | 'impact' | 'effort';

export default function Recommendations() {
  const { selectedEntity } = useEntity();
  const recommendations = MOCK_RECOMMENDATIONS[selectedEntity.id] || [];
  const [filter, setFilter] = useState<Priority | 'ALL' | 'DONE'>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('priority');
  const [statuses, setStatuses] = useState<Record<string, RecommendationStatus>>({});
  const [postJobRec, setPostJobRec] = useState<Recommendation | null>(null);

  const getStatus = (id: string, original: RecommendationStatus) => statuses[id] || original;

  const filtered = recommendations
    .filter((r) => {
      const s = getStatus(r.id, r.status);
      if (filter === 'DONE') return s === 'DONE';
      if (filter === 'ALL') return s !== 'DISMISSED';
      return r.priority === filter && s !== 'DISMISSED';
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { CRITICAL: 0, IMPORTANT: 1, OPTIONAL: 2 };
        return order[a.priority] - order[b.priority];
      }
      if (sortBy === 'impact') return (b.compliance_gain || 0) - (a.compliance_gain || 0);
      const effortOrder = { LOW: 0, MEDIUM: 1, HIGH: 2 };
      return (effortOrder[a.effort_level || 'MEDIUM'] || 1) - (effortOrder[b.effort_level || 'MEDIUM'] || 1);
    });

  const openRecs = recommendations.filter((r) => getStatus(r.id, r.status) === 'OPEN');
  const totalGain = openRecs.slice(0, 3).reduce((sum, r) => sum + (r.compliance_gain || 0), 0);

  const markDone = (id: string) => {
    setStatuses({ ...statuses, [id]: 'DONE' });
    toast.success('Action marked complete');
  };

  const markInProgress = (id: string) => {
    setStatuses({ ...statuses, [id]: 'IN_PROGRESS' });
    toast.info('Marked as in progress');
  };

  const dismiss = (id: string, title: string) => {
    setStatuses({ ...statuses, [id]: 'DISMISSED' });
    toast('Recommendation dismissed', {
      action: {
        label: 'Undo',
        onClick: () => setStatuses(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        }),
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-sora font-bold text-2xl">
          Recommendations <span className="text-muted-foreground text-lg">({openRecs.length} open)</span>
        </h1>
      </div>

      {/* Impact Summary */}
      {openRecs.length > 0 && (
        <div className="p-4 rounded-lg bg-teal-light border border-primary/20">
          <p className="text-sm text-primary">
            Complete the top 3 recommendations to gain <strong className="font-jetbrains">+{totalGain.toFixed(1)}%</strong> compliance ratio and improve your band status.
          </p>
        </div>
      )}

      {/* Filters & Sort */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'CRITICAL', 'IMPORTANT', 'OPTIONAL', 'DONE'] as const).map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Sort by Priority</SelectItem>
            <SelectItem value="impact">Sort by Impact</SelectItem>
            <SelectItem value="effort">Sort by Effort</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No recommendations"
          description="All caught up! Check back later for new compliance recommendations."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((rec) => {
            const status = getStatus(rec.id, rec.status);
            return (
              <Card key={rec.id} className={`shadow-card transition-all ${status === 'DONE' ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <PriorityBadge priority={rec.priority} />
                        {status === 'DONE' && <span className="text-xs text-status-green font-medium">✓ Done</span>}
                        {status === 'IN_PROGRESS' && <span className="text-xs text-primary font-medium">⏳ In Progress</span>}
                      </div>
                      <h3 className={`font-semibold ${status === 'DONE' ? 'line-through' : ''}`}>{rec.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        {rec.compliance_gain && <ComplianceGainChip gain={rec.compliance_gain} />}
                        {rec.effort_level && <EffortBadge effort={rec.effort_level} />}
                        <span className="text-xs text-muted-foreground">{rec.action_type?.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    {status === 'OPEN' && (
                      <div className="flex flex-col gap-2 shrink-0">
                        {rec.action_type === 'HIRE_NATIONAL' && (
                          <Button size="sm" variant="outline" onClick={() => setPostJobRec(rec)}>
                            <Briefcase className="w-4 h-4 mr-1" />Post Job
                          </Button>
                        )}
                        <Button size="sm" onClick={() => markInProgress(rec.id)}>In Progress</Button>
                        <Button size="sm" variant="outline" onClick={() => markDone(rec.id)}>Mark Done</Button>
                        <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => dismiss(rec.id, rec.title)}>Dismiss</Button>
                      </div>
                    )}
                    {status === 'IN_PROGRESS' && (
                      <Button size="sm" onClick={() => markDone(rec.id)}>Mark Done</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Post Job Dialog */}
      <PostJobDialog
        open={!!postJobRec}
        onClose={() => setPostJobRec(null)}
        recommendation={postJobRec}
        onPost={() => postJobRec && markInProgress(postJobRec.id)}
      />
    </div>
  );
}
