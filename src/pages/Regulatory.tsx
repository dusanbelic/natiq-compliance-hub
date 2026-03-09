import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MOCK_REGULATORY_CHANGES, COUNTRY_FLAGS, getRelativeTime } from '@/lib/mockData';
import { ImpactBadge } from '@/components/PriorityBadge';
import { ExternalLink } from 'lucide-react';
import type { Country } from '@/types/database';

const FILTERS: (Country | 'ALL')[] = ['ALL', 'SA', 'AE', 'QA', 'OM'];

export default function Regulatory() {
  const [filter, setFilter] = useState<Country | 'ALL'>('ALL');
  const filtered = filter === 'ALL' ? MOCK_REGULATORY_CHANGES : MOCK_REGULATORY_CHANGES.filter((c) => c.country === filter);

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
              <Card key={change.id} className="shadow-card">
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
                        <Button size="sm" variant="outline">View Impact</Button>
                        {change.source_url && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={change.source_url} target="_blank" rel="noopener noreferrer">Source <ExternalLink className="w-3 h-3 ml-1" /></a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="shadow-card h-fit">
          <CardHeader><CardTitle>Alert Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">Configure your regulatory change alert settings in Settings → Notifications.</p>
            <Button variant="outline" className="w-full">Configure Alerts</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
