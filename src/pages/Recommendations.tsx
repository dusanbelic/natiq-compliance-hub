import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEntity } from '@/contexts/EntityContext';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_RECOMMENDATIONS } from '@/lib/mockData';
import { useRecommendations, useUpdateRecommendationStatus } from '@/hooks/use-supabase-data';
import { PriorityBadge, EffortBadge, ComplianceGainChip } from '@/components/PriorityBadge';
import { PostJobDialog } from '@/components/recommendations/PostJobDialog';
import { EmptyState, CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { toast } from 'sonner';
import { Lightbulb, Briefcase, Sparkles, Loader2 } from 'lucide-react';
import { generateRecommendations } from '@/lib/ai/generateRecommendations';
import { supabase } from '@/integrations/supabase/client';
import type { Priority, RecommendationStatus, Recommendation } from '@/types/database';

type SortBy = 'priority' | 'impact' | 'effort';

export default function Recommendations() {
  const { selectedEntity, dashboardData, employeesByEntity } = useEntity();
  const { isDemoMode } = useAuth();
  const { data: liveRecs, isLoading, refetch } = useRecommendations(selectedEntity.id);
  const updateStatus = useUpdateRecommendationStatus();

  const mockRecs = MOCK_RECOMMENDATIONS[selectedEntity.id] || [];
  const recommendations: Recommendation[] = isDemoMode
    ? mockRecs
    : (liveRecs || []).map(r => ({
        ...r,
        priority: (r.priority ?? 'OPTIONAL') as Priority,
        status: (r.status ?? 'OPEN') as RecommendationStatus,
        effort_level: r.effort_level ?? undefined,
        compliance_gain: r.compliance_gain ? Number(r.compliance_gain) : undefined,
        action_type: r.action_type ?? undefined,
        description: r.description ?? undefined,
        impact_score: r.impact_score ?? undefined,
      } as Recommendation));

  const [filter, setFilter] = useState<Priority | 'ALL' | 'DONE'>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('priority');
  const [localStatuses, setLocalStatuses] = useState<Record<string, RecommendationStatus>>({});
  const [postJobRec, setPostJobRec] = useState<Recommendation | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [aiTimestamp, setAiTimestamp] = useState<Date | null>(null);
  const [usingSaved, setUsingSaved] = useState(false);

  const getStatus = (id: string, original: RecommendationStatus) => localStatuses[id] || original;

  const handleGenerateAI = useCallback(async () => {
    if (isDemoMode) {
      toast.info('AI generation is not available in demo mode');
      return;
    }
    setAiLoading(true);
    setUsingSaved(false);
    try {
      const { score, department_breakdown } = dashboardData;
      const employees = employeesByEntity[selectedEntity.id] || [];

      const contractMap = new Map<string, { count: number; nationalCount: number }>();
      employees.forEach(e => {
        const ct = e.contract_type || 'full_time';
        const cur = contractMap.get(ct) || { count: 0, nationalCount: 0 };
        cur.count++;
        if (e.is_national) cur.nationalCount++;
        contractMap.set(ct, cur);
      });

      const result = await generateRecommendations({
        entityName: selectedEntity.name,
        country: selectedEntity.country,
        program: score.program,
        currentRatio: score.ratio,
        targetRatio: score.target,
        band: score.band,
        totalEmployees: score.total_count,
        nationalCount: score.national_count,
        expatCount: score.total_count - score.national_count,
        departmentBreakdown: department_breakdown.map(d => ({
          department: d.dept,
          total: d.total,
          nationals: d.nationals,
          ratio: d.ratio,
        })),
        contractBreakdown: Array.from(contractMap.entries()).map(([ct, v]) => ({
          contractType: ct,
          count: v.count,
          nationalCount: v.nationalCount,
        })),
      });

      // Upsert into recommendations table
      for (const rec of result) {
        await supabase.from('recommendations').upsert({
          entity_id: selectedEntity.id,
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          effort_level: rec.effort_level,
          compliance_gain: rec.compliance_gain,
          action_type: rec.action_type,
          status: 'OPEN',
        } as any, { onConflict: 'entity_id,title', ignoreDuplicates: false });
      }

      await refetch();
      setAiGenerated(true);
      setAiTimestamp(new Date());
      toast.success('AI recommendations generated');
    } catch (err) {
      console.error('AI recommendation error:', err);
      setUsingSaved(true);
      toast.info('Using saved recommendations');
    } finally {
      setAiLoading(false);
    }
  }, [isDemoMode, dashboardData, selectedEntity, employeesByEntity, refetch]);

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

  const persistStatus = (id: string, status: RecommendationStatus) => {
    setLocalStatuses(prev => ({ ...prev, [id]: status }));
    if (!isDemoMode) {
      updateStatus.mutate({ id, status });
    }
  };

  const markDone = (id: string) => { persistStatus(id, 'DONE'); toast.success('Action marked complete'); };
  const reopenRec = (id: string) => { persistStatus(id, 'OPEN'); toast.info('Recommendation reopened'); };
  const markInProgress = (id: string) => { persistStatus(id, 'IN_PROGRESS'); toast.info('Marked as in progress'); };
  const dismiss = (id: string) => {
    persistStatus(id, 'DISMISSED');
    toast('Recommendation dismissed', {
      action: {
        label: 'Undo',
        onClick: () => {
          setLocalStatuses(prev => { const next = { ...prev }; delete next[id]; return next; });
          if (!isDemoMode) updateStatus.mutate({ id, status: 'OPEN' });
        },
      },
    });
  };

  const loading = !isDemoMode && isLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-sora font-bold text-2xl">Recommendations</h1>
        <CardSkeleton className="h-16" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-sora font-bold text-2xl">
          Recommendations <span className="text-muted-foreground text-lg">({openRecs.length} open)</span>
        </h1>
        <Button
          onClick={handleGenerateAI}
          disabled={aiLoading}
          variant="outline"
          className="gap-2"
        >
          {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {aiLoading ? 'Analysing your workforce data...' : 'Generate AI Recommendations'}
        </Button>
      </div>

      {openRecs.length > 0 && (
        <div className="p-4 rounded-lg bg-teal-light border border-primary/20">
          <p className="text-sm text-primary">
            Complete the top 3 recommendations to gain <strong className="font-jetbrains">+{totalGain.toFixed(1)}%</strong> compliance ratio and improve your band status.
          </p>
        </div>
      )}

      {aiLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
          ))}
          <p className="text-sm text-muted-foreground text-center">Analysing your workforce data...</p>
        </div>
      )}

      {!aiLoading && (
        <>
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

          {filtered.length === 0 ? (
            <EmptyState icon={Lightbulb} title="No recommendations" description="All caught up! Click 'Generate AI Recommendations' to get fresh insights." />
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
                            <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => dismiss(rec.id)}>Dismiss</Button>
                          </div>
                        )}
                        {status === 'IN_PROGRESS' && (
                          <Button size="sm" onClick={() => markDone(rec.id)}>Mark Done</Button>
                        )}
                        {status === 'DONE' && (
                          <Button size="sm" variant="outline" onClick={() => reopenRec(rec.id)}>Reopen</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {(aiGenerated || usingSaved) && (
            <p className="text-xs text-muted-foreground text-center">
              {usingSaved ? '📋 Using saved recommendations' : `✨ Generated by AI · ${aiTimestamp?.toLocaleString()}`}
            </p>
          )}
        </>
      )}

      <PostJobDialog open={!!postJobRec} onClose={() => setPostJobRec(null)} recommendation={postJobRec} onPost={() => postJobRec && markInProgress(postJobRec.id)} />
    </div>
  );
}
