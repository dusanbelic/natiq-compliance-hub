import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEntity } from '@/contexts/EntityContext';
import { MOCK_FORECAST_DATA, CHART_COLORS } from '@/lib/mockData';
import { AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';

export default function Forecast() {
  const { selectedEntity, dashboardData } = useEntity();
  const forecastData = MOCK_FORECAST_DATA[selectedEntity.id];
  const [scenario, setScenario] = useState({ nationalHires: 0, expatHires: 0, nationalDepartures: 0, expatDepartures: 0 });

  return (
    <div className="space-y-6">
      <h1 className="font-sora font-bold text-2xl">90-Day Compliance Forecast</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {forecastData?.risk_date && (
            <div className="p-4 rounded-lg bg-amber-light flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber" />
              <div>
                <p className="font-semibold text-amber">⚠ Compliance projected to breach minimum on {forecastData.risk_date}</p>
                <p className="text-sm text-amber/80">Take action to avoid penalties</p>
              </div>
            </div>
          )}

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 'auto']} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <ReferenceArea y1={forecastData?.target} y2={100} fill={CHART_COLORS.greenLight} fillOpacity={0.3} />
                    <ReferenceArea y1={0} y2={forecastData?.target} fill={CHART_COLORS.redLight} fillOpacity={0.3} />
                    <ReferenceLine y={forecastData?.target} stroke={CHART_COLORS.red} strokeDasharray="5 5" label="Min Target" />
                    <Line type="monotone" dataKey="historical" stroke={CHART_COLORS.teal} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="projected" stroke={CHART_COLORS.navy} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-teal"></div>Historical</div>
                <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-secondary border-dashed"></div>Projected</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader><CardTitle>Adjust Scenario</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Planned National Hires</Label><Input type="number" value={scenario.nationalHires} onChange={(e) => setScenario({...scenario, nationalHires: +e.target.value})} /></div>
            <div><Label>Planned Expat Hires</Label><Input type="number" value={scenario.expatHires} onChange={(e) => setScenario({...scenario, expatHires: +e.target.value})} /></div>
            <div><Label>Expected National Departures</Label><Input type="number" value={scenario.nationalDepartures} onChange={(e) => setScenario({...scenario, nationalDepartures: +e.target.value})} /></div>
            <div><Label>Expected Expat Departures</Label><Input type="number" value={scenario.expatDepartures} onChange={(e) => setScenario({...scenario, expatDepartures: +e.target.value})} /></div>
            <Button className="w-full">Update Forecast</Button>

            <div className="border-t pt-4 space-y-2">
              <p className="text-sm"><strong>Projected 30d:</strong> <span className="font-jetbrains">{forecastData?.projected_30d}%</span></p>
              <p className="text-sm"><strong>Projected 60d:</strong> <span className="font-jetbrains">{forecastData?.projected_60d}%</span></p>
              <p className="text-sm"><strong>Projected 90d:</strong> <span className="font-jetbrains">{forecastData?.projected_90d}%</span></p>
              <p className="text-sm"><strong>Confidence:</strong> {forecastData?.confidence}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
