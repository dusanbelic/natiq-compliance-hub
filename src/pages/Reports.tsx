import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, Table, BarChart3, Shield, Plus, X, Mail, Clock, Loader2, Sparkles, Copy, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useEntity } from '@/contexts/EntityContext';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_EMPLOYEES, MOCK_FORECAST_DATA, MOCK_REGULATORY_CHANGES, PROGRAM_NAMES } from '@/lib/mockData';
import { exportCompliancePDF, exportWorkforceAuditCSV, exportForecastPDF, exportRegulatoryCSV, exportRegulatoryPDF, exportEmployeesCSV, exportWorkforceAuditXLSX, exportRegulatoryXLSX, exportEmployeesXLSX, exportAuditLogPDF, exportAuditLogXLSX } from '@/lib/export-utils';
import { useAuditLogs, type AuditLog, useForecasts, useRegulatoryChanges, useRecommendations } from '@/hooks/use-supabase-data';
import { useReportSchedule, useUpsertReportSchedule } from '@/hooks/use-report-schedules';
import { getRelativeTime } from '@/lib/mockData';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { generateComplianceMemo } from '@/lib/ai/generateComplianceMemo';
import type { Employee, RegulatoryChange } from '@/types/database';
import type { Tables } from '@/integrations/supabase/types';

const REPORTS = [
  { id: 1, icon: Shield, title: 'AI Compliance Memo', desc: 'AI-generated compliance report tailored to your audience', isMemo: true },
  { id: 2, icon: Table, title: 'Workforce Audit Pack', desc: 'Complete headcount breakdown with nationality verification' },
  { id: 3, icon: BarChart3, title: 'Forecast Report', desc: '90-day compliance forecast with scenario analysis' },
  { id: 4, icon: FileText, title: 'Regulatory Impact Summary', desc: 'How recent regulatory changes affect your company' },
];

function toEmployee(row: Tables<'employees'>): Employee {
  return {
    id: row.id, entity_id: row.entity_id, full_name: row.full_name, nationality: row.nationality,
    is_national: row.is_national ?? false, job_title: row.job_title, department: row.department,
    contract_type: (row.contract_type ?? 'full_time') as Employee['contract_type'],
    counts_toward_quota: row.counts_toward_quota ?? true, start_date: row.start_date,
    end_date: row.end_date, salary_band: row.salary_band, created_at: row.created_at ?? '',
  };
}

function toRegulatoryChange(row: Tables<'regulatory_changes'>): RegulatoryChange {
  return {
    id: row.id, country: row.country as RegulatoryChange['country'], program: row.program,
    detected_at: row.detected_at ?? '', effective_date: row.effective_date,
    headline: row.headline, summary: row.summary, impact_level: row.impact_level as RegulatoryChange['impact_level'],
    source_url: row.source_url, affects_sectors: row.affects_sectors,
    change_type: row.change_type as RegulatoryChange['change_type'],
  };
}

function getCurrentQuarter(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${q} ${now.getFullYear()}`;
}

const BASIC_TEMPLATE = (entity: { name: string; ratio: number; target: number; band: string; program: string }) =>
  `## Compliance Memo\n\n**To:** Management\n**From:** HR Compliance\n**Date:** ${new Date().toLocaleDateString()}\n**Subject:** ${entity.program} Compliance Status - ${entity.name}\n\n### Summary\n\nCurrent compliance ratio is ${entity.ratio.toFixed(1)}% against a target of ${entity.target}%. Band status: ${entity.band}.\n\n### Recommended Actions\n\nPlease review workforce composition and take appropriate measures to maintain compliance.\n`;

export default function Reports() {
  const { selectedEntity, dashboardData, employeesByEntity } = useEntity();
  const { isDemoMode } = useAuth();
  const [generating, setGenerating] = useState<number | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [localEnabled, setLocalEnabled] = useState<boolean | null>(null);
  const [localFreq, setLocalFreq] = useState<string | null>(null);
  const [localEmails, setLocalEmails] = useState<string[] | null>(null);
  const [saving, setSaving] = useState(false);

  // Memo state
  const [memoAudience, setMemoAudience] = useState<'board' | 'regulator' | 'internal'>('board');
  const [memoPeriod, setMemoPeriod] = useState(getCurrentQuarter());
  const [memoIncludeRecs, setMemoIncludeRecs] = useState(false);
  const [memoGenerating, setMemoGenerating] = useState(false);
  const [memoContent, setMemoContent] = useState<string | null>(null);
  const [memoOpen, setMemoOpen] = useState(false);
  const [memoError, setMemoError] = useState(false);
  const [memoTimestamp, setMemoTimestamp] = useState<Date | null>(null);

  const { data: auditLogs, isLoading: auditLoading } = useAuditLogs(selectedEntity.id);
  const { data: schedule, isLoading: scheduleLoading } = useReportSchedule(selectedEntity.id);
  const upsertSchedule = useUpsertReportSchedule();
  const { data: liveRecs } = useRecommendations(selectedEntity.id);

  const scheduledEnabled = localEnabled ?? schedule?.enabled ?? false;
  const scheduleFreq = localFreq ?? schedule?.frequency ?? 'weekly';
  const emails = localEmails ?? schedule?.recipients ?? [];

  const setScheduledEnabled = (v: boolean) => setLocalEnabled(v);
  const setScheduleFreq = (v: string) => setLocalFreq(v);
  const setEmails = (v: string[]) => setLocalEmails(v);
  const { data: forecastRow } = useForecasts(selectedEntity.id);
  const { data: regRows, isLoading: regLoading } = useRegulatoryChanges();

  const liveEmployees = employeesByEntity[selectedEntity.id];
  const employees: Employee[] = isDemoMode || !liveEmployees
    ? (MOCK_EMPLOYEES[selectedEntity.id] || [])
    : liveEmployees.map(toEmployee);

  const regulatoryChanges: RegulatoryChange[] = isDemoMode || !regRows
    ? MOCK_REGULATORY_CHANGES : regRows.map(toRegulatoryChange);

  const forecastData = isDemoMode
    ? MOCK_FORECAST_DATA[selectedEntity.id]
    : forecastRow
      ? {
          projected_30d: Number(forecastRow.projected_ratio_30d ?? dashboardData.score.ratio),
          projected_60d: Number(forecastRow.projected_ratio_60d ?? dashboardData.score.ratio),
          projected_90d: Number(forecastRow.projected_ratio_90d ?? dashboardData.score.ratio),
          risk_date: forecastRow.risk_date,
          confidence: (forecastRow.confidence ?? 'MEDIUM') as string,
        }
      : null;

  const generate = async (id: number, title: string, format: 'pdf' | 'excel') => {
    setGenerating(id);
    try {
      if (id === 2) {
        format === 'excel' ? await exportWorkforceAuditXLSX(employees, dashboardData) : exportCompliancePDF(dashboardData);
      } else if (id === 3 && forecastData) {
        // Forecast report - PDF for both since no dedicated XLSX export exists
        exportForecastPDF(dashboardData, forecastData);
      } else if (id === 4) {
        format === 'excel' ? await exportRegulatoryXLSX(regulatoryChanges) : exportRegulatoryPDF(regulatoryChanges);
      }
      toast.success(`${title} (${format.toUpperCase()}) downloaded`);
    } catch {
      toast.error('Failed to generate report');
    }
    setGenerating(null);
  };

  const handleGenerateMemo = async () => {
    setMemoGenerating(true);
    setMemoError(false);
    setMemoOpen(true);
    setMemoContent(null);
    try {
      const { score } = dashboardData;
      const recs = memoIncludeRecs
        ? (liveRecs || []).filter(r => r.status === 'OPEN' || r.status === 'IN_PROGRESS').map(r => ({
            title: r.title,
            compliance_gain: r.compliance_gain ? Number(r.compliance_gain) : null,
            status: r.status || 'OPEN',
          }))
        : undefined;

      const content = await generateComplianceMemo({
        entity: {
          name: selectedEntity.name,
          country: selectedEntity.country,
          program: PROGRAM_NAMES[selectedEntity.country] || 'Nationalization',
          industry: selectedEntity.industry_sector,
          total_employees: score.total_count,
          national_count: score.national_count,
          ratio: score.ratio,
          band: score.band,
          target: score.target,
        },
        period: memoPeriod,
        audience: memoAudience,
        includeRecommendations: memoIncludeRecs,
        recommendations: recs,
      });
      setMemoContent(content);
      setMemoTimestamp(new Date());
    } catch (err) {
      console.error('Memo generation error:', err);
      setMemoError(true);
    } finally {
      setMemoGenerating(false);
    }
  };

  const handleUseTemplate = () => {
    const { score } = dashboardData;
    setMemoContent(BASIC_TEMPLATE({
      name: selectedEntity.name,
      ratio: score.ratio,
      target: score.target,
      band: score.band,
      program: PROGRAM_NAMES[selectedEntity.country] || 'Nationalization',
    }));
    setMemoError(false);
  };

  const addEmail = () => {
    if (newEmail && newEmail.includes('@')) {
      setEmails([...emails, newEmail]);
      setNewEmail('');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="font-sora font-bold text-xl sm:text-2xl">Reports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {REPORTS.map((report) => (
          <Card key={report.id} className="shadow-card">
            <CardContent className="p-4 sm:p-6">
              {report.isMemo ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm sm:text-base">{report.title}</h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-accent-foreground font-mono">Gemini Pro</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">{report.desc}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Audience</Label>
                      <Select value={memoAudience} onValueChange={(v) => setMemoAudience(v as any)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="board">Board</SelectItem>
                          <SelectItem value="regulator">Regulator</SelectItem>
                          <SelectItem value="internal">Internal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Period</Label>
                      <Select value={memoPeriod} onValueChange={setMemoPeriod}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026'].map(q => (
                            <SelectItem key={q} value={q}>{q}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={memoIncludeRecs} onCheckedChange={(v) => setMemoIncludeRecs(!!v)} />
                    Include planned actions from Recommendations
                  </label>
                  <Button className="w-full" onClick={handleGenerateMemo} disabled={memoGenerating}>
                    {memoGenerating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
                    {memoGenerating ? 'Writing your memo...' : 'Generate Memo'}
                  </Button>
                </div>
              ) : (
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <report.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">{report.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">{report.desc}</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => generate(report.id, report.title, 'pdf')} disabled={generating === report.id}>
                        {generating === report.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
                        {generating === report.id ? 'Wait...' : 'PDF'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => generate(report.id, report.title, 'excel')} disabled={generating === report.id}>
                        <Download className="w-4 h-4 mr-1" />Excel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Memo Preview Modal */}
      <Dialog open={memoOpen} onOpenChange={setMemoOpen}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Compliance Memo Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex gap-4 overflow-hidden">
            {/* Left: Content */}
            <div className="flex-[3] overflow-y-auto border rounded-lg p-6 bg-card">
              {memoGenerating && (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Writing your memo...</p>
                </div>
              )}
              {memoError && !memoContent && (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <p className="text-muted-foreground">Memo generation failed. Try again or use the manual template.</p>
                  <Button variant="outline" onClick={handleUseTemplate}>Use Basic Template</Button>
                </div>
              )}
              {memoContent && (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {memoContent.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) return <h2 key={i} className="font-sora text-lg mt-4 mb-2">{line.replace('## ', '')}</h2>;
                    if (line.startsWith('### ')) return <h3 key={i} className="font-sora text-base mt-3 mb-1">{line.replace('### ', '')}</h3>;
                    if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold">{line.replace(/\*\*/g, '')}</p>;
                    if (line.startsWith('- ')) return <li key={i} className="ml-4">{line.replace('- ', '')}</li>;
                    if (line.trim() === '') return <br key={i} />;
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              )}
            </div>
            {/* Right: Meta */}
            <div className="flex-[2] space-y-4 overflow-y-auto">
              <div className="space-y-2">
                <Badge variant="secondary" className="capitalize">{memoAudience}</Badge>
                <p className="text-sm text-muted-foreground">Period: {memoPeriod}</p>
                {memoTimestamp && <p className="text-xs text-muted-foreground">Generated: {memoTimestamp.toLocaleString()}</p>}
              </div>
              <Button className="w-full" variant="outline" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />Download PDF
              </Button>
              <Button className="w-full" variant="outline" onClick={() => {
                if (memoContent) {
                  navigator.clipboard.writeText(memoContent);
                  toast.success('Copied to clipboard');
                }
              }}>
                <Copy className="w-4 h-4 mr-2" />Copy to Clipboard
              </Button>
              <Button className="w-full" variant="outline" onClick={() => {
                setMemoContent(null);
                handleGenerateMemo();
              }}>
                <Sparkles className="w-4 h-4 mr-2" />Regenerate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Audit Log */}
      {!isDemoMode && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />Audit Log
              </div>
              {auditLogs && auditLogs.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { exportAuditLogPDF(auditLogs, selectedEntity.name); toast.success('Audit log PDF downloaded'); }}>
                    <Download className="w-3 h-3 mr-1" />PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={async () => { await exportAuditLogXLSX(auditLogs, selectedEntity.name); toast.success('Audit log Excel downloaded'); }}>
                    <Download className="w-3 h-3 mr-1" />Excel
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {auditLoading ? (
              <div className="space-y-2"><CardSkeleton className="h-10" /><CardSkeleton className="h-10" /><CardSkeleton className="h-10" /></div>
            ) : !auditLogs || auditLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No audit log entries yet.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {auditLogs.map((log: AuditLog) => (
                  <div key={log.id} className="flex items-center gap-2 sm:gap-3 p-2 rounded hover:bg-muted/50 text-sm">
                    <Badge variant={log.action === 'INSERT' ? 'default' : log.action === 'DELETE' ? 'destructive' : 'secondary'} className="text-xs w-14 sm:w-16 justify-center shrink-0">
                      {log.action}
                    </Badge>
                    <span className="text-muted-foreground hidden sm:inline">{log.table_name}</span>
                    <span className="flex-1 truncate">
                      {log.new_data && (log.new_data as any).full_name ? (log.new_data as any).full_name : log.record_id?.substring(0, 8)}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">{getRelativeTime(log.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scheduled Reports */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5" />Scheduled Reports</CardTitle>
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
                      <button onClick={() => setEmails(emails.filter(e => e !== email))} className="ml-1"><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input type="email" placeholder="Add email address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addEmail()} className="max-w-xs" />
                  <Button size="sm" variant="outline" onClick={addEmail}><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
              {schedule?.last_sent_at && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Last sent: {new Date(schedule.last_sent_at).toLocaleDateString()}
                </p>
              )}
              <Button
                disabled={saving || isDemoMode}
                onClick={async () => {
                  setSaving(true);
                  try {
                    await upsertSchedule.mutateAsync({ entity_id: selectedEntity.id, enabled: scheduledEnabled, frequency: scheduleFreq, recipients: emails });
                    setLocalEnabled(null); setLocalFreq(null); setLocalEmails(null);
                    toast.success('Schedule saved');
                  } catch { toast.error('Failed to save schedule'); }
                  setSaving(false);
                }}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                Save Schedule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
