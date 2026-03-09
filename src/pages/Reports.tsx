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

const REPORTS = [
  { id: 1, icon: Shield, title: 'Compliance Certificate', desc: 'Printable compliance status report for regulators or auditors', lastGenerated: '2025-01-08' },
  { id: 2, icon: Table, title: 'Workforce Audit Pack', desc: 'Complete headcount breakdown with nationality verification', lastGenerated: '2025-01-05' },
  { id: 3, icon: BarChart3, title: 'Forecast Report', desc: '90-day compliance forecast with scenario analysis', lastGenerated: null },
  { id: 4, icon: FileText, title: 'Regulatory Impact Summary', desc: 'How recent regulatory changes affect your company', lastGenerated: '2024-12-20' },
];

export default function Reports() {
  const [generating, setGenerating] = useState<number | null>(null);
  const [scheduledEnabled, setScheduledEnabled] = useState(false);
  const [scheduleFreq, setScheduleFreq] = useState('weekly');
  const [emails, setEmails] = useState(['khalid@acmegulf.com']);
  const [newEmail, setNewEmail] = useState('');

  const generate = (id: number, title: string, format: 'pdf' | 'excel') => {
    setGenerating(id);
    toast.info(`Generating ${title} (${format.toUpperCase()})...`);
    setTimeout(() => {
      setGenerating(null);
      toast.success(`${title} ready for download`, {
        action: { label: 'Download', onClick: () => toast.info('Download started') },
      });
    }, 2000);
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
                      <Download className="w-4 h-4 mr-1" />Excel
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
