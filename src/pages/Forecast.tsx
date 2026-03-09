import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useEntity } from '@/contexts/EntityContext';
import { MOCK_FORECAST_DATA, CHART_COLORS, formatPercent } from '@/lib/mockData';
import { AlertTriangle, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea, Legend } from 'recharts';
import { toast } from 'sonner';

export default function Forecast() {
  const { selectedEntity, dashboardData } = useEntity();
  const baseData = MOCK_FORECAST_DATA[selectedEntity.id];
  const { score } = dashboardData;

  const [scenario, setScenario] = useState({
    nationalHires: 0,
    expatHires: 0,
    nationalDepartures: 0,
    expatDepartures: 0,
  });

  const [appliedScenario, setAppliedScenario] = useState(scenario);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate projected ratios based on scenario
  const projections = useMemo(() => {
    const { nationalHires, expatHires, nationalDepartures, expatDepartures } = appliedScenario;
    
    const currentNationals = score.national_count;
    const currentTotal = score.total_count;
    
    // Net changes per period (assume evenly distributed over 90 days)
    const netNationals30 = (nationalHires - nationalDepartures) / 3;
    const netTotal30 = ((nationalHires + expatHires) - (nationalDepartures + expatDepartures)) / 3;

    const nationals30 = currentNationals + netNationals30;
    const total30 = currentTotal + netTotal30;
    const ratio30 = total30 > 0 ? (nationals30 / total30) * 100 : 0;

    const nationals60 = currentNationals + (netNationals30 * 2);
    const total60 = currentTotal + (netTotal30 * 2);
    const ratio60 = total60 > 0 ? (nationals60 / total60) * 100 : 0;

    const nationals90 = currentNationals + (nationalHires - nationalDepartures);
    const total90 = currentTotal + ((nationalHires + expatHires) - (nationalDepartures + expatDepartures));
    const ratio90 = total90 > 0 ? (nationals90 / total90) * 100 : 0;

    // Determine risk date
    let riskDate: string | null = null;
    if (ratio30 < score.target) riskDate = '~30 days';
    else if (ratio60 < score.target) riskDate = '~60 days';
    else if (ratio90 < score.target) riskDate = '~90 days';

    return {
      ratio30: Math.max(0, Math.min(100, ratio30)),
      ratio60: Math.max(0, Math.min(100, ratio60)),
      ratio90: Math.max(0, Math.min(100, ratio90)),
      riskDate,
      hasScenario: nationalHires > 0 || expatHires > 0 || nationalDepartures > 0 || expatDepartures > 0,
    };
  }, [appliedScenario, score]);

  // Generate chart data with scenario projections
  const chartData = useMemo(() => {
    if (!baseData) return [];
    
    // Create a copy with scenario field
    const data = baseData.data.map(d => ({ ...d, scenario: undefined as number | undefined }));
    
    // If scenario applied, override projected values
    if (projections.hasScenario) {
      const todayIndex = data.findIndex(d => d.isToday);
      if (todayIndex >= 0) {
        // Interpolate between today and projected values
        const step30 = (projections.ratio30 - score.ratio) / 3;
        const step60 = (projections.ratio60 - projections.ratio30) / 3;
        const step90 = (projections.ratio90 - projections.ratio60) / 3;
        
        data.forEach((point, idx) => {
          const i = idx - todayIndex;
          if (i <= 0) return; // Before or at today
          if (i <= 3) {
            point.scenario = score.ratio + (step30 * i);
          } else if (i <= 6) {
            point.scenario = projections.ratio30 + (step60 * (i - 3));
          } else {
            point.scenario = projections.ratio60 + (step90 * (i - 6));
          }
        });
      }
    }
    
    return data;
  }, [baseData, projections, score]);

  const handleUpdateForecast = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setAppliedScenario(scenario);
      setIsCalculating(false);
      toast.success('Forecast updated with your scenario');
    }, 600);
  };

  const handleReset = () => {
    setScenario({ nationalHires: 0, expatHires: 0, nationalDepartures: 0, expatDepartures: 0 });
    setAppliedScenario({ nationalHires: 0, expatHires: 0, nationalDepartures: 0, expatDepartures: 0 });
    toast.info('Scenario reset to baseline');
  };

  const displayRatio30 = projections.hasScenario ? projections.ratio30 : baseData?.projected_30d || 0;
  const displayRatio60 = projections.hasScenario ? projections.ratio60 : baseData?.projected_60d || 0;
  const displayRatio90 = projections.hasScenario ? projections.ratio90 : baseData?.projected_90d || 0;
  const displayRiskDate = projections.hasScenario ? projections.riskDate : baseData?.risk_date;

  const trend90 = displayRatio90 - score.ratio;
  const isImproving = trend90 >= 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-sora font-bold text-2xl">90-Day Compliance Forecast</h1>
        {projections.hasScenario && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-1" />Reset
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 space-y-4">
          {displayRiskDate && (
            <div className="p-4 rounded-lg bg-amber-light flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber shrink-0" />
              <div>
                <p className="font-semibold text-amber">
                  ⚠ Compliance projected to breach minimum {displayRiskDate}
                </p>
                <p className="text-sm text-amber/80">Take action to avoid penalties</p>
              </div>
            </div>
          )}

          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.slate300} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke={CHART_COLORS.slate400} />
                    <YAxis domain={[0, 'auto']} tick={{ fontSize: 11 }} stroke={CHART_COLORS.slate400} />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, '']} />
                    <Legend />
                    <ReferenceArea y1={baseData?.target} y2={100} fill={CHART_COLORS.greenLight} fillOpacity={0.3} />
                    <ReferenceArea y1={0} y2={baseData?.target} fill={CHART_COLORS.redLight} fillOpacity={0.3} />
                    <ReferenceLine y={baseData?.target} stroke={CHART_COLORS.red} strokeDasharray="5 5" label={{ value: 'Min Target', fontSize: 10 }} />
                    <Line type="monotone" dataKey="historical" stroke={CHART_COLORS.teal} strokeWidth={2} dot={false} name="Historical" />
                    <Line type="monotone" dataKey="projected" stroke={CHART_COLORS.navy} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Projected" />
                    {projections.hasScenario && (
                      <Line type="monotone" dataKey="scenario" stroke={CHART_COLORS.green} strokeWidth={2} dot={false} name="Scenario" />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-teal" />
                  <span>Historical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-secondary" style={{ borderStyle: 'dashed' }} />
                  <span>Baseline Projection</span>
                </div>
                {projections.hasScenario && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-status-green" />
                    <span>Your Scenario</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Confidence */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Confidence:</span>
            <Badge variant={baseData?.confidence === 'HIGH' ? 'default' : 'secondary'}>
              {baseData?.confidence || 'MEDIUM'}
            </Badge>
            <span className="text-xs text-muted-foreground">Based on historical patterns and current trajectory</span>
          </div>
        </div>

        {/* Scenario Panel */}
        <div className="space-y-4">
          <Card className="shadow-card">
            <CardHeader><CardTitle>Adjust Scenario</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Modify inputs to see how hiring or departures affect your forecast.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">National Hires</Label>
                  <Input
                    type="number"
                    min={0}
                    value={scenario.nationalHires}
                    onChange={(e) => setScenario({ ...scenario, nationalHires: Math.max(0, +e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Expat Hires</Label>
                  <Input
                    type="number"
                    min={0}
                    value={scenario.expatHires}
                    onChange={(e) => setScenario({ ...scenario, expatHires: Math.max(0, +e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs">National Departures</Label>
                  <Input
                    type="number"
                    min={0}
                    value={scenario.nationalDepartures}
                    onChange={(e) => setScenario({ ...scenario, nationalDepartures: Math.max(0, +e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Expat Departures</Label>
                  <Input
                    type="number"
                    min={0}
                    value={scenario.expatDepartures}
                    onChange={(e) => setScenario({ ...scenario, expatDepartures: Math.max(0, +e.target.value) })}
                  />
                </div>
              </div>

              <Button className="w-full" onClick={handleUpdateForecast} disabled={isCalculating}>
                {isCalculating ? 'Calculating...' : 'Update Forecast'}
              </Button>
            </CardContent>
          </Card>

          {/* Projections Summary */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                Impact Summary
                {projections.hasScenario && (
                  <Badge variant="outline" className="text-xs">Scenario</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">In 30 days:</span>
                <span className="font-jetbrains font-semibold">{formatPercent(displayRatio30)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">In 60 days:</span>
                <span className="font-jetbrains font-semibold">{formatPercent(displayRatio60)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">In 90 days:</span>
                <span className="font-jetbrains font-semibold">{formatPercent(displayRatio90)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-sm font-medium">Net Change:</span>
                <div className={`flex items-center gap-1 ${isImproving ? 'text-status-green' : 'text-status-red'}`}>
                  {isImproving ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-jetbrains font-semibold">
                    {isImproving ? '+' : ''}{trend90.toFixed(1)}%
                  </span>
                </div>
              </div>
              {displayRatio90 < score.target ? (
                <div className="p-2 rounded bg-status-red-light text-status-red text-xs">
                  ⚠ Still below {score.target}% target at 90 days
                </div>
              ) : displayRatio90 >= score.target && score.ratio < score.target ? (
                <div className="p-2 rounded bg-status-green-light text-status-green text-xs">
                  ✓ This scenario brings you to compliance!
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
