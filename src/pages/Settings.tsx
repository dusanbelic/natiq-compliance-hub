import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MOCK_COMPANY, MOCK_ENTITIES, MOCK_TEAM_MEMBERS, COUNTRY_FLAGS } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, UserPlus, CreditCard, Download, Check, AlertTriangle, Loader2, Building2 } from 'lucide-react';
import { DepartmentManager } from '@/components/settings/DepartmentManager';
import { InviteTeamDialog } from '@/components/settings/InviteTeamDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany, useUpdateCompany, useEntities, useUserProfile, useUpdateUserProfile, useTeamMembers, useTeamMemberRoles } from '@/hooks/use-supabase-data';
import { usePermissions } from '@/hooks/use-permissions';
import { Skeleton } from '@/components/ui/skeleton';

const PLANS = [
  { name: 'Starter', price: 'Free', features: ['1 entity', '50 employees', 'Basic compliance tracking'] },
  { name: 'Growth', price: '$199/mo', features: ['5 entities', '500 employees', 'Forecasting', 'Recommendations', 'CSV import'], current: true },
  { name: 'Scale', price: '$499/mo', features: ['Unlimited entities', '5,000 employees', 'API access', 'Priority support', 'Custom reports'] },
  { name: 'Enterprise', price: 'Custom', features: ['Everything in Scale', 'SSO', 'Dedicated CSM', 'SLA guarantee', 'Custom integrations'] },
];

const INVOICES = [
  { date: '2025-01-01', id: 'INV-2025-001', amount: '$199.00', status: 'Paid' },
  { date: '2024-12-01', id: 'INV-2024-012', amount: '$199.00', status: 'Paid' },
  { date: '2024-11-01', id: 'INV-2024-011', amount: '$199.00', status: 'Paid' },
];

export default function Settings() {
  const { isDemoMode, user } = useAuth();
  const { canManageTeam, canEditCompany, canManageBilling, canInviteMembers } = usePermissions();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  // Live data hooks
  const { data: company, isLoading: companyLoading } = useCompany();
  const { data: entities, isLoading: entitiesLoading } = useEntities();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: teamMembers, isLoading: teamLoading } = useTeamMembers();
  const updateCompany = useUpdateCompany();
  const updateProfile = useUpdateUserProfile();

  // Team member roles
  const teamUserIds = teamMembers?.map(m => m.id) ?? [];
  const { data: teamRoles } = useTeamMemberRoles(teamUserIds);

  // Editable company fields
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companySaving, setCompanySaving] = useState(false);

  // Notification prefs
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifInApp, setNotifInApp] = useState(true);
  const [profileName, setProfileName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Sync from fetched data
  useEffect(() => {
    if (company) {
      setCompanyName(company.name);
      setCompanyIndustry(company.industry ?? '');
    } else if (isDemoMode) {
      setCompanyName(MOCK_COMPANY.name);
      setCompanyIndustry(MOCK_COMPANY.industry ?? '');
    }
  }, [company, isDemoMode]);

  useEffect(() => {
    if (profile) {
      setNotifEmail(profile.notification_email ?? true);
      setNotifInApp(profile.notification_in_app ?? true);
      setProfileName(profile.full_name ?? '');
    }
  }, [profile]);

  const displayCompany = isDemoMode ? MOCK_COMPANY : company;
  const displayEntities = isDemoMode ? MOCK_ENTITIES : (entities ?? []);
  const displayPlan = displayCompany?.plan ?? 'starter';

  // Build team list
  const teamList = isDemoMode
    ? MOCK_TEAM_MEMBERS
    : (teamMembers ?? []).map(m => {
        const roleEntry = teamRoles?.find(r => r.user_id === m.id);
        return {
          id: m.id,
          full_name: m.full_name ?? 'Unknown',
          email: '', // email not exposed in user_profiles
          role: roleEntry?.role ?? 'viewer',
          last_active: m.created_at?.split('T')[0] ?? '',
        };
      });

  const handleSaveCompany = async () => {
    if (isDemoMode || !displayCompany) {
      toast.info('Company saved (demo mode)');
      return;
    }
    setCompanySaving(true);
    try {
      await updateCompany.mutateAsync({ id: displayCompany.id, name: companyName, industry: companyIndustry || null });
      toast.success('Company information updated');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save');
    } finally {
      setCompanySaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (isDemoMode || !user) {
      toast.info('Profile saved (demo mode)');
      return;
    }
    setProfileSaving(true);
    try {
      await updateProfile.mutateAsync({
        id: user.id,
        full_name: profileName,
        notification_email: notifEmail,
        notification_in_app: notifInApp,
      });
      toast.success('Profile & notification preferences saved');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save');
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-sora font-bold text-2xl">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList>
          {canEditCompany && <TabsTrigger value="company">Company Profile</TabsTrigger>}
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          {canManageTeam && <TabsTrigger value="team">Team Members</TabsTrigger>}
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          {canManageBilling && <TabsTrigger value="billing">Billing & Plan</TabsTrigger>}
        </TabsList>

        {/* Company */}
        <TabsContent value="company" className="space-y-4 mt-4">
          <Card className="shadow-card">
            <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {companyLoading && !isDemoMode ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Company Name</Label>
                      <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    </div>
                    <div>
                      <Label>Industry</Label>
                      <Input value={companyIndustry} onChange={(e) => setCompanyIndustry(e.target.value)} />
                    </div>
                  </div>
                  <div><Label>Plan</Label><Badge className="ml-2 capitalize">{displayPlan}</Badge></div>
                  <Button variant="outline" onClick={handleSaveCompany} disabled={companySaving}>
                    {companySaving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                    Save Changes
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Entities</CardTitle>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Entity</Button>
            </CardHeader>
            <CardContent>
              {entitiesLoading && !isDemoMode ? (
                <div className="space-y-2">
                  {[1, 2].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : displayEntities.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No entities yet. Add one to get started.</p>
              ) : (
                displayEntities.map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-3 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <span>{COUNTRY_FLAGS[e.country as keyof typeof COUNTRY_FLAGS]}</span>
                      <div>
                        <span className="font-medium">{e.name}</span>
                        <p className="text-xs text-muted-foreground">{e.industry_sector} · {e.employee_count_band} employees</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">Edit</Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <DepartmentManager />
        </TabsContent>

        {/* My Profile & Notifications */}
        <TabsContent value="profile" className="space-y-4 mt-4">
          <Card className="shadow-card">
            <CardHeader><CardTitle>My Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {profileLoading && !isDemoMode ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div>
                    <Label>Full Name</Label>
                    <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user?.email ?? 'demo@example.com'} readOnly className="bg-muted" />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive compliance alerts and reports via email</p>
                </div>
                <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>In-App Notifications</Label>
                  <p className="text-xs text-muted-foreground">Show notification badges and alerts within the app</p>
                </div>
                <Switch checked={notifInApp} onCheckedChange={setNotifInApp} />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSaveProfile} disabled={profileSaving}>
            {profileSaving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
            Save Profile & Preferences
          </Button>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="mt-4">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Button size="sm" onClick={() => setInviteOpen(true)}>
                <UserPlus className="w-4 h-4 mr-1" />Invite
              </Button>
            </CardHeader>
            <CardContent>
              {teamLoading && !isDemoMode ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">Joined</th>
                      <th className="text-right p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamList.map((m) => (
                      <tr key={m.id} className="border-b">
                        <td className="p-2 font-medium">
                          {m.full_name}
                          {m.id === user?.id && <Badge variant="secondary" className="ml-2 text-xs">You</Badge>}
                        </td>
                        <td className="p-2 capitalize">{m.role.replace('_', ' ')}</td>
                        <td className="p-2 text-muted-foreground">{m.last_active}</td>
                        <td className="p-2 text-right">
                          {m.id !== user?.id && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-destructive">Remove</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Remove <strong>{m.full_name}</strong> from the team? They will lose access immediately.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => toast.success(`${m.full_name} removed`)} className="bg-destructive text-destructive-foreground">Remove</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </td>
                      </tr>
                    ))}
                    {teamList.length === 0 && (
                      <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No team members found</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
          <InviteTeamDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Qiwa API', desc: 'Saudi Ministry of Labour', connected: true },
              { name: 'MOHRE', desc: 'UAE Ministry of HR', connected: false },
              { name: 'SAP SuccessFactors', desc: 'HR Management', connected: false },
              { name: 'Oracle HCM', desc: 'HR Management', connected: false },
              { name: 'Workday', desc: 'HR Management', connected: false },
              { name: 'Bayzat', desc: 'HR & Payroll', connected: false },
            ].map((int) => (
              <Card key={int.name} className="shadow-card">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-lg bg-muted mx-auto mb-3 flex items-center justify-center">
                    <span className="text-lg font-bold text-muted-foreground">{int.name[0]}</span>
                  </div>
                  <h3 className="font-semibold">{int.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{int.desc}</p>
                  {int.connected ? (
                    <Badge className="badge-compliant">
                      <Check className="w-3 h-3 mr-1" />Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Coming Soon</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {PLANS.map((plan) => {
              const isCurrent = plan.name.toLowerCase() === displayPlan;
              return (
                <Card key={plan.name} className={`shadow-card ${isCurrent ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{plan.name}</h3>
                      {isCurrent && <Badge className="badge-compliant text-xs">Current</Badge>}
                    </div>
                    <p className="font-jetbrains font-bold text-xl mb-3">{plan.price}</p>
                    <ul className="space-y-1.5 text-sm">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-status-green" />{f}
                        </li>
                      ))}
                    </ul>
                    {!isCurrent && (
                      <Button size="sm" variant="outline" className="w-full mt-3" onClick={() => toast.info('Plan upgrade coming soon')}>
                        {plan.price === 'Custom' ? 'Contact Sales' : 'Upgrade'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="shadow-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" />Payment Method</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 bg-gradient-to-r from-blue-600 to-blue-800 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                  <div>
                    <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                    <p className="text-xs text-muted-foreground">Expires 12/2026</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Update</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader><CardTitle>Billing History</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left p-2">Date</th><th className="text-left p-2">Invoice</th><th className="text-left p-2">Amount</th><th className="text-left p-2">Status</th><th className="text-right p-2"></th></tr></thead>
                <tbody>
                  {INVOICES.map(inv => (
                    <tr key={inv.id} className="border-b">
                      <td className="p-2">{inv.date}</td>
                      <td className="p-2 font-medium">{inv.id}</td>
                      <td className="p-2 font-jetbrains">{inv.amount}</td>
                      <td className="p-2"><Badge className="badge-compliant text-xs">{inv.status}</Badge></td>
                      <td className="p-2 text-right"><Button size="sm" variant="ghost"><Download className="w-4 h-4" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="link" className="text-destructive">Cancel Subscription</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" />Cancel Subscription?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will downgrade your account to the Free plan at the end of your billing period. You'll lose access to premium features.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                <AlertDialogAction onClick={() => toast.info('Subscription cancelled')} className="bg-destructive text-destructive-foreground">Cancel Subscription</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
