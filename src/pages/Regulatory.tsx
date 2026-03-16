import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MOCK_REGULATORY_CHANGES, COUNTRY_FLAGS, MOCK_DASHBOARD_DATA } from '@/lib/mockData';
import { ImpactBadge } from '@/components/PriorityBadge';
import { ExternalLink, ChevronDown, AlertTriangle, CheckCircle, FileText, Loader2, Zap, X } from 'lucide-react';
import { useEntity } from '@/contexts/EntityContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRegulatoryChanges } from '@/hooks/use-supabase-data';
import { useNavigate } from 'react-router-dom';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/LoadingSkeleton';
import { analyseRegulatoryImpact, type RegulatoryImpactResult } from '@/lib/ai/analyseRegulatoryImpact';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Country, RegulatoryChange } from '@/types/database';
import type { Tables } from '@/integrations/supabase/types';

const FILTERS: (Country | 'ALL')[] = ['ALL', 'SA', 'AE', 'QA', 'OM'];

function toRegulatoryChange(row: Tables<'regulatory_changes'>): RegulatoryChange {
  return {
    id: row.id,
    country: row.country as Country,
    program: row.program,
    headline: row.headline,
    summary: row.summary ?? '',
    effective_date: row.effective_date ?? '',
    source_url: row.source_url ?? undefined,
    impact_level: (row.impact_level as RegulatoryChange['impact_level']) ?? 'LOW',
    change_type: (row.change_type as RegulatoryChange['change_type']) ?? undefined,
    affects_sectors: row.affects_sectors ?? null,
    detected_at: row.detected_at ?? '',
  };
}

const SEVERITY_COLORS: Record<string, string> = {
  HIGH: 'border-l-4 border-l-status-red',
  MEDIUM: 'border-l-4 border-l-amber',
  LOW: 'border-l-4 border-l-primary',
  NONE: 'border-l-4 border-l-muted-foreground',
};

const SEVERITY_BADGE_CLASS: Record<string, string> = {
  HIGH: 'badge-high-impact',
  MEDIUM: 'badge-medium-impact',
  LOW: 'badge-low-impact',
  NONE: 'badge-unknown',
};

function AIImpactPanel({ result, change, onDismiss, onAddToRecs, entityId }: {
  result: RegulatoryImpactResult;
  change: RegulatoryChange;
  onDismiss: () => void;
  onAddToRecs: () => void;
  entityId: string;
}) {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const handleAddToRecs = async () => {
    setAdding(true);
    try {
      for (const action of result.immediate_actions) {
        await supabase.from('recommendations').insert({
          entity_id: entityId,
          title: action,
          description: `From regulatory change: ${change.headline}`,
          priority: 'OPTIONAL',
          action_type: 'OTHER',
          status: 'OPEN',
        } as any);
      }
      toast.success('Actions added to recommendations');
      navigate('/recommendations');
    } catch {
      toast.error('Failed to add recommendations');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={`mt-3 p-4 rounded-lg bg-muted/30 space-y-3 animate-slide-up ${SEVERITY_COLORS[result.severity]}`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${SEVERITY_BADGE_CLASS[result.severity]}`}>
          {result.severity} IMPACT
        </span>
        <Button size="sm" variant="ghost" onClick={onDismiss} className="h-6 w-6 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-sm">{result.summary}</p>
      <p className="text-sm text-muted-foreground"><strong>Current Status:</strong> {result.current_status}</p>
      {result.gap !== null && result.gap !== undefined && (
        <p className="text-sm"><strong>Gap:</strong> <span className="font-jetbrains text-status-red">{result.gap.toFixed(1)}%</span> below new target</p>
      )}
      {result.immediate_actions.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-1">Immediate Actions:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {result.immediate_actions.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
      {result.time_to_act && (
        <p className="text-sm text-amber"><strong>Time to Act:</strong> {result.time_to_act}</p>
      )}
      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={handleAddToRecs} disabled={adding}>
          {adding ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
          Add to Recommendations
        </Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>Dismiss</Button>
      </div>
    </div>
  );
}

function AIImpactError({ change, onDismiss }: { change: RegulatoryChange; onDismiss: () => void }) {
  return (
    <div className="mt-3 p-4 rounded-lg bg-muted/30 border-l-4 border-l-muted-foreground">
      <p className="text-sm text-muted-foreground">
        Could not analyse impact right now.{' '}
        {change.source_url && (
          <a href={change.source_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            View the source for manual review <ExternalLink className="w-3 h-3 inline" />
          </a>
        )}
      </p>
      <Button size="sm" variant="ghost" onClick={onDismiss} className="mt-2">Dismiss</Button>
    </div>
  );
}

export default function Regulatory() {
  const { selectedEntity, dashboardData } = useEntity();
  const { isDemoMode } = useAuth();
  const { data: liveChanges, isLoading } = useRegulatoryChanges();
  const [filter, setFilter] = useState<Country | 'ALL'>('ALL');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [analysing, setAnalysing] = useState<Record<string, boolean>>({});
  const [impacts, setImpacts] = useState<Record<string, RegulatoryImpactResult | 'error'>>({});

  const entityData = isDemoMode ? MOCK_DASHBOARD_DATA[selectedEntity.id] : dashboardData;

  const changes: RegulatoryChange[] = useMemo(() => {
    if (isDemoMode) return MOCK_REGULATORY_CHANGES;
    return (liveChanges || []).map(toRegulatoryChange);
  }, [isDemoMode, liveChanges]);

  const filtered = filter === 'ALL' ? changes : changes.filter((c) => c.country === filter);

  const handleAnalyse = async (change: RegulatoryChange) => {
    setAnalysing(prev => ({ ...prev, [change.id]: true }));
    try {
      const result = await analyseRegulatoryImpact({
        change: {
          country: change.country,
          program: change.program,
          headline: change.headline,
          summary: change.summary,
          change_type: change.change_type,
          effective_date: change.effective_date,
          affects_sectors: change.affects_sectors,
        },
        entity: {
          name: selectedEntity.name,
          country: selectedEntity.country,
          industry_sector: selectedEntity.industry_sector,
          current_ratio: entityData?.score.ratio ?? 0,
          current_band: entityData?.score.band ?? 'UNKNOWN',
          total_employees: entityData?.score.total_count ?? 0,
          national_count: entityData?.score.national_count ?? 0,
        },
      });
      setImpacts(prev => ({ ...prev, [change.id]: result }));
    } catch (err) {
      console.error('AI impact analysis error:', err);
      setImpacts(prev => ({ ...prev, [change.id]: 'error' }));
    } finally {
      setAnalysing(prev => ({ ...prev, [change.id]: false }));
    }
  };

  const dismissImpact = (id: string) => {
    setImpacts(prev => { const next = { ...prev }; delete next[id]; return next; });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-sora font-bold text-2xl">Regulatory Monitor</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
                {f === 'ALL' ? 'All Countries' : `${COUNTRY_FLAGS[f]} ${f}`}
              </Button>
            ))}
          </div>

          {isLoading && !isDemoMode ? (
            <div className="space-y-4">
              <CardSkeleton className="h-40" />
              <CardSkeleton className="h-40" />
              <CardSkeleton className="h-40" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No regulatory changes"
              description={filter === 'ALL' ? 'No regulatory changes have been detected yet.' : `No regulatory changes found for ${filter}.`}
            />
          ) : (
            <div className="space-y-4">
              {filtered.map((change) => (
                <Card key={change.id} className="shadow-card overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{COUNTRY_FLAGS[change.country]}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <ImpactBadge impact={change.impact_level || 'LOW'} />
                          <span className="text-xs text-muted-foreground">{change.effective_date}</span>
                        </div>
                        <h3 className="font-semibold mb-1">{change.headline}</h3>
                        <p className="text-sm text-muted-foreground">{change.summary}</p>

                        <div className="flex gap-2 mt-3">
                          {!impacts[change.id] && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-primary border-primary/30 hover:bg-primary/5"
                              onClick={() => handleAnalyse(change)}
                              disabled={analysing[change.id]}
                            >
                              {analysing[change.id] ? (
                                <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Analysing...</>
                              ) : (
                                <><Zap className="w-4 h-4 mr-1" /> Analyse Impact</>
                              )}
                            </Button>
                          )}

                          {change.source_url && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={change.source_url} target="_blank" rel="noopener noreferrer">
                                Source <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            </Button>
                          )}
                        </div>

                        {impacts[change.id] && impacts[change.id] !== 'error' && (
                          <AIImpactPanel
                            result={impacts[change.id] as RegulatoryImpactResult}
                            change={change}
                            onDismiss={() => dismissImpact(change.id)}
                            onAddToRecs={() => {}}
                            entityId={selectedEntity.id}
                          />
                        )}

                        {impacts[change.id] === 'error' && (
                          <AIImpactError change={change} onDismiss={() => dismissImpact(change.id)} />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="shadow-card">
            <CardHeader><CardTitle>Upcoming Regulatory Dates</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: 'Q1 2025', event: 'UAE Emiratisation target increases to 10%', country: 'AE' },
                  { date: 'Jan 2025', event: 'Saudi Nitaqat quarterly recalculation', country: 'SA' },
                  { date: 'Q2 2025', event: 'Qatar Qatarisation report due date', country: 'QA' },
                  { date: 'Jul 2025', event: 'Oman Omanisation mid-year review', country: 'OM' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                    <span className="text-lg">{COUNTRY_FLAGS[item.country as Country]}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.event}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card h-fit">
          <CardHeader><CardTitle>Alert Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Alerts</Label>
                <p className="text-xs text-muted-foreground">Get notified via email</p>
              </div>
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>In-App Alerts</Label>
                <p className="text-xs text-muted-foreground">Show in notification center</p>
              </div>
              <Switch checked={inAppAlerts} onCheckedChange={setInAppAlerts} />
            </div>
            <div className="pt-2 border-t">
              <Label className="text-xs text-muted-foreground">Countries to monitor</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(['SA', 'AE', 'QA', 'OM'] as Country[]).map((c) => (
                  <Button key={c} size="sm" variant="outline" className="h-8">
                    {COUNTRY_FLAGS[c]} {c}
                  </Button>
                ))}
              </div>
            </div>
            <Button className="w-full" variant="outline">Save Preferences</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
