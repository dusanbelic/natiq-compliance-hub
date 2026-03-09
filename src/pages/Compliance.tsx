import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEntity } from '@/contexts/EntityContext';
import { ComplianceRing } from '@/components/ComplianceRing';
import { ComplianceBandBar } from '@/components/ComplianceBandBar';
import { COUNTRY_FLAGS } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function Compliance() {
  const { selectedEntity, dashboardData } = useEntity();
  const { score, department_breakdown } = dashboardData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-sora font-bold text-2xl">Compliance Score</h1>
        <Button variant="outline"><RefreshCw className="w-4 h-4 mr-2" />Recalculate</Button>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>{COUNTRY_FLAGS[selectedEntity.country]} {selectedEntity.name} — Calculation Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-8">
            <ComplianceRing value={score.ratio} size={160} strokeWidth={12} status={score.status} />
            <div className="flex-1">
              <ComplianceBandBar currentRatio={score.ratio} target={score.target} />
            </div>
          </div>

          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2">Category</th><th className="text-right">Count</th><th className="text-right">Qualifying</th></tr></thead>
            <tbody>
              <tr className="border-b"><td className="py-2">Nationals — Full Time</td><td className="text-right font-jetbrains">{score.nationals_full_time}</td><td className="text-right text-status-green">✓</td></tr>
              <tr className="border-b"><td className="py-2">Nationals — Part Time</td><td className="text-right font-jetbrains">{score.nationals_part_time}</td><td className="text-right text-status-green">✓</td></tr>
              <tr className="border-b"><td className="py-2">Nationals — Contract</td><td className="text-right font-jetbrains">{score.nationals_contract}</td><td className="text-right text-muted-foreground">✗</td></tr>
              <tr className="border-b font-semibold"><td className="py-2">Total Qualifying Nationals</td><td className="text-right font-jetbrains">{score.qualifying_nationals}</td><td></td></tr>
              <tr className="border-b font-semibold"><td className="py-2">Total Qualifying Workforce</td><td className="text-right font-jetbrains">{score.qualifying_total}</td><td></td></tr>
              <tr className="font-bold text-lg"><td className="py-3">Compliance Ratio</td><td className="text-right font-jetbrains">{score.ratio.toFixed(1)}%</td><td className="text-right text-muted-foreground">Target: {score.target}%</td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle>Compliance by Department</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2">Department</th><th className="text-right">Total</th><th className="text-right">Nationals</th><th className="text-right">Ratio</th></tr></thead>
            <tbody>
              {department_breakdown.map((d) => (
                <tr key={d.dept} className="border-b">
                  <td className="py-2">{d.dept}</td>
                  <td className="text-right font-jetbrains">{d.total}</td>
                  <td className="text-right font-jetbrains">{d.nationals}</td>
                  <td className={`text-right font-jetbrains ${d.ratio < score.target ? 'text-status-red' : ''}`}>{d.ratio.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
