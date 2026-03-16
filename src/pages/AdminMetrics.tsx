import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Download, Loader2, BarChart3, Users, Eye, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'natiq-admin-2025';

interface Feedback {
  id: string; referral_source: string | null; challenge_text: string | null;
  would_use: string | null; submitted_at: string;
}

export default function AdminMetrics() {
  const [authed, setAuthed] = useState(sessionStorage.getItem('adminAuthed') === 'true');
  const [password, setPassword] = useState('');
  const [shake, setShake] = useState(false);

  const [appStats, setAppStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, waitlist: 0 });
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuthed', 'true');
      setAuthed(true);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  useEffect(() => {
    if (!authed) return;
    (async () => {
      setLoading(true);
      try {
        // Fetch applications stats
        const { data: apps } = await supabase.functions.invoke('admin-applications', { body: { action: 'list' } });
        const appList = apps?.data || [];
        setAppStats({
          total: appList.length,
          pending: appList.filter((a: any) => a.status === 'pending').length,
          approved: appList.filter((a: any) => a.status === 'approved').length,
          rejected: appList.filter((a: any) => a.status === 'rejected').length,
          waitlist: appList.filter((a: any) => a.status === 'waitlist').length,
        });

        // Fetch demo feedback
        const { data: fb } = await supabase.functions.invoke('admin-applications', {
          body: { action: 'list_feedback' },
        });
        setFeedback(fb?.data || []);

        // Fetch subscriber count
        const { data: subs } = await supabase.functions.invoke('admin-applications', {
          body: { action: 'list_subscribers' },
        });
        setSubscriberCount(subs?.data?.length || 0);
      } catch { /* silent */ }
      setLoading(false);
    })();
  }, [authed]);

  const copyInvestorUpdate = () => {
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const text = `NatIQ traction update as of ${date}: ${appStats.total} design partner applications received, ${appStats.approved} approved design partners, ${feedback.length} demo sessions completed, ${subscriberCount} resource article views. We are tracking compliance data for GCC entities across 4 countries.`;
    navigator.clipboard.writeText(text);
    toast.success('Investor update copied to clipboard');
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-jetbrains font-bold text-sm">N</span>
            </div>
            <h2 className="font-sora font-bold text-lg">Admin Metrics</h2>
            <div className={shake ? 'animate-shake' : ''}>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            {shake && <p className="text-xs text-destructive">Incorrect password</p>}
            <Button onClick={handleLogin} className="w-full">Enter</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const slotsRemaining = Math.max(0, 20 - appStats.approved);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-sora font-bold text-2xl">Founder Metrics</h1>
          <Button onClick={copyInvestorUpdate} variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" /> Copy Investor Update
          </Button>
        </div>

        {/* Growth Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatTile icon={Users} label="Total Applications" value={appStats.total} />
          <StatTile icon={BarChart3} label="Approved Partners" value={appStats.approved} color="text-status-green" />
          <StatTile icon={Eye} label="Demo Feedback" value={feedback.length} />
          <StatTile
            icon={FileText}
            label="Slots Remaining"
            value={slotsRemaining}
            color={slotsRemaining > 0 ? 'text-primary' : 'text-status-red'}
          />
        </div>

        {/* Applications Pipeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-sora text-lg">Applications Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline">Total: {appStats.total}</Badge>
              <Badge className="bg-muted text-muted-foreground">Pending: {appStats.pending}</Badge>
              <Badge className="badge-compliant">Approved: {appStats.approved}</Badge>
              <Badge className="bg-status-red-light text-status-red">Rejected: {appStats.rejected}</Badge>
              <Badge className="bg-secondary text-secondary-foreground">Waitlist: {appStats.waitlist}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Resource Subscribers */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="font-sora text-lg">Resource Subscribers</CardTitle>
            <Badge variant="outline">{subscriberCount} emails collected</Badge>
          </CardHeader>
        </Card>

        {/* Demo Feedback */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-sora text-lg">Demo Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {feedback.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No feedback yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Challenge</TableHead>
                    <TableHead>Would Use</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedback.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="text-xs">{new Date(f.submitted_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm">{f.referral_source || '—'}</TableCell>
                      <TableCell className="text-sm max-w-xs truncate">{f.challenge_text || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          f.would_use === 'yes' ? 'badge-compliant' :
                          f.would_use === 'no' ? 'bg-status-red-light text-status-red' :
                          'bg-amber-light text-amber'
                        }>{f.would_use || '—'}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color?: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className={`w-8 h-8 ${color || 'text-primary'}`} />
        <div>
          <p className={`font-jetbrains font-bold text-2xl ${color || ''}`}>{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
