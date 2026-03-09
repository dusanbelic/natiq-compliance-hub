import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Table, BarChart3, Shield, Plus, X, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useEntity } from '@/contexts/EntityContext';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_EMPLOYEES, MOCK_FORECAST_DATA, MOCK_REGULATORY_CHANGES } from '@/lib/mockData';
import { exportCompliancePDF, exportWorkforceAuditCSV, exportForecastPDF, exportRegulatoryCSV, exportEmployeesCSV } from '@/lib/export-utils';
import { useAuditLogs, type AuditLog } from '@/hooks/use-supabase-data';
import { getRelativeTime } from '@/lib/mockData';

const REPORTS = [
  { id: 1, icon: Shield, title: 'Compliance Certificate', desc: 'Printable compliance status report for regulators or auditors', lastGenerated: '2025-01-08' },
  { id: 2, icon: Table, title: 'Workforce Audit Pack', desc: 'Complete headcount breakdown with nationality verification', lastGenerated: '2025-01-05' },
  { id: 3, icon: BarChart3, title: 'Forecast Report', desc: '90-day compliance forecast with scenario analysis', lastGenerated: null },
  { id: 4, icon: FileText, title: 'Regulatory Impact Summary', desc: 'How recent regulatory changes affect your company', lastGenerated: '2024-12-20' },
];

export default function Reports() {
  const { selectedEntity, dashboardData } = useEntity();
  const { isDemoMode } = useAuth();
  const [generating, setGenerating] = useState<number | null>(null);
  const [scheduledEnabled, setScheduledEnabled] = useState(false);
  const [scheduleFreq, setScheduleFreq] = useState('weekly');
  const [emails, setEmails] = useState(['khalid@acmegulf.com']);
  const [newEmail, setNewEmail] = useState('');
  const { data: auditLogs } = useAuditLogs(selectedEntity.id);

  const employees = MOCK_EMPLOYEES[selectedEntity.id] || [];
  const forecastData = MOCK_FORECAST_DATA[selectedEntity.id];

  const generate = (id: number, title: string, format: 'pdf' | 'excel') => {
    setGenerating(id);

    try {
      if (id === 1) {
        // Compliance Certificate
        if (format === 'pdf') {
          exportCompliancePDF(dashboardData);
        } else {
          exportWorkforceAuditCSV(employees, dashboardData);
        }
      } else if (id === 2) {
        // Workforce Audit Pack
        if (format === 'excel') {
          exportWorkforceAuditCSV(employees, dashboardData);
        } else {
          exportCompliancePDF(dashboardData);
        }
      } else if (id === 3) {
        // Forecast Report
        if (forecastData) {
          if (format === 'pdf') {
            exportForecastPDF(dashboardData, {
              projected_30d: forecastData.projected_30d,
              projected_60d: forecastData.projected_60d,
              projected_90d: forecastData.projected_90d,
              risk_date: forecastData.risk_date,
              confidence: forecastData.confidence,
            });
          } else {
            exportEmployeesCSV(employees, selectedEntity.name);
          }
        }
      } else if (id === 4) {
        // Regulatory Impact Summary
        if (format === 'excel') {
          exportRegulatoryCSV(MOCK_REGULATORY_CHANGES);
        } else {
          exportRegulatoryCSV(MOCK_REGULATORY_CHANGES);
        }
      }
      toast.success(`${title} (${format.toUpperCase()}) downloaded`);
    } catch (err) {
      toast.error('Failed to generate report');
    }
    
    setGenerating(null);
  };

  const addEmail = () => {
    if (newEmail && newEmail.includes('@')) {
      setEmails([...emails, newEmail]);
      setNewEmail('');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-sora font-bold text-2xl">Reports</h1>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REPORTS.map((report) => (
          <Card key={report.id} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <report.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{report.desc}</p>
                  {report.lastGenerated && (
                    <p className="text-xs text-muted-foreground mb-3">
                      <Clock className="w-3 h-3 inline mr-1" />Last generated: {report.lastGenerated}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => generate(report.id, report.title, 'pdf')}
                      disabled={generating === report.id}
                    >
                      <Download className="w-4 h-4 mr-1" />{generating === report.id ? 'Generating...' : 'PDF'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generate(report.id, report.title, 'excel')}
                      disabled={generating === report.id}
                    >
                      <Download className="w-4 h-4 mr-1" />Excel/CSV
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Audit Log */}
      {!isDemoMode && auditLogs && auditLogs.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {auditLogs.map((log: AuditLog) => (
                <div key={log.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 text-sm">
                  <Badge variant={log.action === 'INSERT' ? 'default' : log.action === 'DELETE' ? 'destructive' : 'secondary'} className="text-xs w-16 justify-center">
                    {log.action}
                  </Badge>
                  <span className="text-muted-foreground">{log.table_name}</span>
                  <span className="flex-1 truncate">
                    {log.new_data && (log.new_data as any).full_name 
                      ? (log.new_data as any).full_name 
                      : log.record_id?.substring(0, 8)}
                  </span>
                  <span className="text-xs text-muted-foreground">{getRelativeTime(log.created_at)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Reports */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />Scheduled Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-send compliance reports</p>
              <p className="text-sm text-muted-foreground">Automatically email compliance status to selected recipients</p>
            </div>
            <Switch checked={scheduledEnabled} onCheckedChange={setScheduledEnabled} />
          </div>

          {scheduledEnabled && (
            <div className="space-y-4 pt-2 border-t">
              <div>
                <Label>Frequency</Label>
                <Select value={scheduleFreq} onValueChange={setScheduleFreq}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly (Monday)</SelectItem>
                    <SelectItem value="monthly">Monthly (1st)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Recipients</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {emails.map(email => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <button onClick={() => setEmails(emails.filter(e => e !== email))} className="ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="email"
                    placeholder="Add email address"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addEmail()}
                    className="max-w-xs"
                  />
                  <Button size="sm" variant="outline" onClick={addEmail}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={() => toast.success('Schedule saved')}>Save Schedule</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
