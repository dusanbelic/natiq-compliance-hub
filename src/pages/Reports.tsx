import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Table, BarChart3, Shield } from 'lucide-react';
import { toast } from 'sonner';

const REPORTS = [
  { id: 1, icon: Shield, title: 'Compliance Certificate', desc: 'Printable compliance status report for regulators or auditors' },
  { id: 2, icon: Table, title: 'Workforce Audit Pack', desc: 'Complete headcount breakdown with nationality verification' },
  { id: 3, icon: BarChart3, title: 'Forecast Report', desc: '90-day compliance forecast with scenario analysis' },
  { id: 4, icon: FileText, title: 'Regulatory Impact Summary', desc: 'How recent regulatory changes affect your company' },
];

export default function Reports() {
  const generate = (title: string) => toast.info(`Generating ${title}... This feature is coming soon.`);

  return (
    <div className="space-y-6">
      <h1 className="font-sora font-bold text-2xl">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REPORTS.map((report) => (
          <Card key={report.id} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                  <report.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{report.desc}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => generate(report.title)}><Download className="w-4 h-4 mr-1" />PDF</Button>
                    <Button size="sm" variant="outline" onClick={() => generate(report.title)}><Download className="w-4 h-4 mr-1" />Excel</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
