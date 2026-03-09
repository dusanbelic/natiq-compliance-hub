import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MOCK_REGULATORY_CHANGES, COUNTRY_FLAGS, MOCK_DASHBOARD_DATA } from '@/lib/mockData';
import { ImpactBadge } from '@/components/PriorityBadge';
import { ExternalLink, ChevronDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEntity } from '@/contexts/EntityContext';
import { useNavigate } from 'react-router-dom';
import type { Country, RegulatoryChange } from '@/types/database';

const FILTERS: (Country | 'ALL')[] = ['ALL', 'SA', 'AE', 'QA', 'OM'];

function ImpactAnalysis({ change, entityData }: { change: RegulatoryChange; entityData: typeof MOCK_DASHBOARD_DATA[string] | null }) {
  const navigate = useNavigate();
  
  if (!entityData) {
    return (
      <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        No entity data available for impact analysis.
      </div>
    );
  }

  const { score } = entityData;
  const isAffected = change.affects_sectors === null || change.affects_sectors.includes(entityData.entity.industry_sector || '');
  
  // Simulate impact based on change type
  let impactText = '';
  let gap = 0;
  let isCompliant = score.ratio >= score.target;

  if (change.change_type === 'TARGET_INCREASE') {
    // Simulate new higher target
    const newTarget = score.target + 3; // Example: 3% increase
    gap = newTarget - score.ratio;
    isCompliant = score.ratio >= newTarget;
    impactText = `If this change applies to your sector, the new target would be ${newTarget.toFixed(1)}%. Your current ratio is ${score.ratio.toFixed(1)}%.`;
  } else if (change.change_type === 'NEW_REGULATION') {
    impactText = `This regulatory update may affect your compliance reporting or eligibility criteria. Review the source documentation for details.`;
  } else {
    impactText = `Monitor this change for potential impacts on your operations.`;
  }

  return (
    <div className="p-4 bg-muted/30 rounded-lg space-y-3">
      <div className="flex items-start gap-3">
        {isAffected ? (
          <AlertTriangle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
        ) : (
          <CheckCircle className="w-5 h-5 text-status-green shrink-0 mt-0.5" />
        )}
        <div>
          <p className="text-sm font-medium">
            {isAffected ? 'This change may affect your company' : 'Your sector is not directly affected'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{impactText}</p>
        </div>
      </div>

      {isAffected && change.change_type === 'TARGET_INCREASE' && (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-card rounded">
            <p className="text-xs text-muted-foreground">Current Ratio</p>
            <p className="font-jetbrains font-bold">{score.ratio.toFixed(1)}%</p>
          </div>
          <div className="p-2 bg-card rounded">
            <p className="text-xs text-muted-foreground">New Target</p>
            <p className="font-jetbrains font-bold">{(score.target + 3).toFixed(1)}%</p>
          </div>
          <div className="p-2 bg-card rounded">
            <p className="text-xs text-muted-foreground">Gap</p>
            <p className={`font-jetbrains font-bold ${gap > 0 ? 'text-status-red' : 'text-status-green'}`}>
              {gap > 0 ? `-${gap.toFixed(1)}%` : 'Compliant'}
            </p>
          </div>
        </div>
      )}

      {isAffected && gap > 0 && (
        <Button size="sm" onClick={() => navigate('/recommendations')}>
          View Recommendations
        </Button>
      )}
    </div>
  );
}

export default function Regulatory() {
  const { selectedEntity } = useEntity();
  const [filter, setFilter] = useState<Country | 'ALL'>('ALL');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);

  const entityData = MOCK_DASHBOARD_DATA[selectedEntity.id];
  const filtered = filter === 'ALL' 
    ? MOCK_REGULATORY_CHANGES 
    : MOCK_REGULATORY_CHANGES.filter((c) => c.country === filter);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
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
                        <Collapsible open={expandedIds.has(change.id)} onOpenChange={() => toggleExpand(change.id)}>
                          <CollapsibleTrigger asChild>
                            <Button size="sm" variant="outline">
                              View Impact
                              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${expandedIds.has(change.id) ? 'rotate-180' : ''}`} />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-3">
                            <ImpactAnalysis change={change} entityData={entityData} />
                          </CollapsibleContent>
                        </Collapsible>
                        
                        {change.source_url && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={change.source_url} target="_blank" rel="noopener noreferrer">
                              Source <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Regulatory Calendar */}
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

        {/* Alert Preferences */}
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
