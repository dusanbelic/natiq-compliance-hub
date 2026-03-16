import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Download, Loader2, Check, X, Clock, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'natiq-admin-2025';

interface Application {
  id: string; full_name: string; work_email: string; company_name: string;
  job_title: string | null; countries: string[] | null; headcount_band: string | null;
  biggest_challenge: string | null; referral_source: string | null;
  status: string; internal_notes: string | null; applied_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  reviewing: 'bg-amber-light text-amber',
  approved: 'badge-compliant',
  rejected: 'bg-status-red-light text-status-red',
  waitlist: 'bg-secondary text-secondary-foreground',
};

const FLAG_MAP: Record<string, string> = { SA: '🇸🇦', AE: '🇦🇪', QA: '🇶🇦', OM: '🇴🇲' };

export default function AdminApplications() {
  const [authed, setAuthed] = useState(sessionStorage.getItem('adminAuthed') === 'true');
  const [password, setPassword] = useState('');
  const [shake, setShake] = useState(false);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmReject, setConfirmReject] = useState<Application | null>(null);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuthed', 'true');
      setAuthed(true);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const fetchApps = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('admin-applications', { body: { action: 'list' } });
      setApps(data?.data || []);
    } catch { toast.error('Failed to load applications'); }
    setLoading(false);
  };

  useEffect(() => { if (authed) fetchApps(); }, [authed]);

  const [approvalTarget, setApprovalTarget] = useState<Application | null>(null);

  const updateStatus = async (id: string, status: string) => {
    await supabase.functions.invoke('admin-applications', { body: { action: 'update_status', id, status } });
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    toast.success(`Status updated to ${status}`);
  };

  const handleApprove = (app: Application) => {
    setApprovalTarget(app);
  };

  const confirmApprove = async (sendEmail: boolean) => {
    if (!approvalTarget) return;
    await updateStatus(approvalTarget.id, 'approved');
    if (sendEmail) {
      const firstName = approvalTarget.full_name.split(' ')[0];
      const emailContent = `Subject: You're in — NatIQ Design Partner Programme\n\nHi ${firstName},\n\nGreat news — you've been accepted into the NatIQ Design Partner Programme!\n\nHere's how to get started:\n1. Create your free account at https://natiq.io/signup?partner=true\n2. We'll reach out within 24 hours to schedule your onboarding call\n3. Your 12-month free access starts immediately on signup\n\nQuestions? Reply to this email directly and you'll reach the founders.\n\nThe NatIQ Team`;
      console.log(`📧 Approval email to ${approvalTarget.full_name} <${approvalTarget.work_email}>:\n\n${emailContent}`);
      toast.success('Email logged to console — configure email provider to send automatically');
    }
    setApprovalTarget(null);
  };

  const saveNotes = async (id: string, notes: string) => {
    await supabase.functions.invoke('admin-applications', { body: { action: 'update_notes', id, internal_notes: notes } });
    setApps(prev => prev.map(a => a.id === id ? { ...a, internal_notes: notes } : a));
  };

  const exportCSV = () => {
    const headers = ['Applied', 'Name', 'Email', 'Company', 'Title', 'Countries', 'Headcount', 'Status', 'Challenge', 'Source'];
    const rows = apps.map(a => [
      new Date(a.applied_at).toLocaleDateString(), a.full_name, a.work_email, a.company_name,
      a.job_title || '', (a.countries || []).join('; '), a.headcount_band || '', a.status,
      a.biggest_challenge || '', a.referral_source || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'applications.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-sm shadow-elevated">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 justify-center">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-jetbrains font-bold text-sm">N</span>
              </div>
              <span className="font-sora font-bold text-xl">NatIQ</span>
            </div>
            <h2 className="font-sora font-bold text-center">Admin Access</h2>
            <Input
              type="password" placeholder="Password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className={shake ? 'animate-[shake_0.5s] border-destructive' : ''}
            />
            {shake && <p className="text-xs text-destructive text-center">Incorrect password</p>}
            <Button className="w-full" onClick={handleLogin}>Enter</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);
  const approved = apps.filter(a => a.status === 'approved').length;
  const pending = apps.filter(a => a.status === 'pending').length;
  const slotsRemaining = 20 - approved;

  return (
    <div className="min-h-screen bg-background p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-sora font-bold text-2xl">Design Partner Applications</h1>
        <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card"><CardContent className="p-4 text-center"><Users className="w-5 h-5 mx-auto text-muted-foreground mb-1" /><p className="font-jetbrains font-bold text-2xl">{apps.length}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4 text-center"><Clock className="w-5 h-5 mx-auto text-amber mb-1" /><p className="font-jetbrains font-bold text-2xl">{pending}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4 text-center"><Check className="w-5 h-5 mx-auto text-status-green mb-1" /><p className="font-jetbrains font-bold text-2xl">{approved}</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4 text-center"><AlertTriangle className={`w-5 h-5 mx-auto mb-1 ${slotsRemaining > 0 ? 'text-primary' : 'text-status-red'}`} /><p className={`font-jetbrains font-bold text-2xl ${slotsRemaining > 0 ? 'text-primary' : 'text-status-red'}`}>{slotsRemaining}</p><p className="text-xs text-muted-foreground">Slots Left</p></CardContent></Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'reviewing', 'approved', 'waitlist', 'rejected'].map(s => (
          <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s)} className="capitalize">
            {s}
          </Button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
      ) : (
        <Card className="shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="text-left p-3">Applied</th><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th>
                <th className="text-left p-3">Company</th><th className="text-left p-3">Countries</th><th className="text-left p-3">Status</th>
                <th className="text-right p-3">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(app => (
                  <>
                    <tr key={app.id} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
                      <td className="p-3 text-muted-foreground">{new Date(app.applied_at).toLocaleDateString()}</td>
                      <td className="p-3 font-medium">{app.full_name}</td>
                      <td className="p-3 text-muted-foreground">{app.work_email}</td>
                      <td className="p-3">{app.company_name}</td>
                      <td className="p-3">{(app.countries || []).map(c => FLAG_MAP[c] || c).join(' ')}</td>
                      <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[app.status] || ''}`}>{app.status}</span></td>
                      <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" className="text-status-green h-7 text-xs" onClick={() => handleApprove(app)}>Approve</Button>
                          <Button size="sm" variant="ghost" className="text-amber h-7 text-xs" onClick={() => updateStatus(app.id, 'waitlist')}>Waitlist</Button>
                          <Button size="sm" variant="ghost" className="text-status-red h-7 text-xs" onClick={() => setConfirmReject(app)}>Reject</Button>
                        </div>
                      </td>
                    </tr>
                    {expanded === app.id && (
                      <tr key={`${app.id}-detail`}><td colSpan={7} className="p-4 bg-muted/20">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Title:</strong> {app.job_title || 'N/A'}</div>
                          <div><strong>Headcount:</strong> {app.headcount_band || 'N/A'}</div>
                          <div><strong>Source:</strong> {app.referral_source || 'N/A'}</div>
                          <div className="col-span-2"><strong>Challenge:</strong> {app.biggest_challenge || 'N/A'}</div>
                          <div className="col-span-2">
                            <strong>Internal Notes:</strong>
                            <Textarea defaultValue={app.internal_notes || ''} className="mt-1" rows={2}
                              onBlur={e => saveNotes(app.id, e.target.value)} placeholder="Add notes..." />
                          </div>
                        </div>
                      </td></tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog open={!!confirmReject} onOpenChange={() => setConfirmReject(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Rejection</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Reject application from <strong>{confirmReject?.full_name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReject(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (confirmReject) { updateStatus(confirmReject.id, 'rejected'); setConfirmReject(null); } }}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
