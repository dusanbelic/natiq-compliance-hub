import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { COUNTRY_FLAGS, COUNTRY_NAMES, INDUSTRY_SECTORS, EMPLOYEE_COUNT_BANDS, getNationalityFlag } from '@/lib/mockData';
import { Check, ChevronRight, Upload, Database, Users, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Country } from '@/types/database';

const STEPS = ['Set Up Entity', 'Add Employees', 'Complete'];

interface ManualEmployee {
  id: string;
  name: string;
  nationality: string;
  role: string;
}

// Map nationality code to whether they're a "national" of common GCC countries
const NATIONAL_CODES: Record<string, string[]> = {
  SA: ['SA'],
  AE: ['AE'],
  QA: ['QA'],
  OM: ['OM'],
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { isDemoMode } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [entity, setEntity] = useState({ name: '', country: '' as Country | '', industry: '', size: '' });
  const [createdEntityId, setCreatedEntityId] = useState<string | null>(null);
  const [employeeTab, setEmployeeTab] = useState('csv');
  const [manualEmployees, setManualEmployees] = useState<ManualEmployee[]>([
    { id: '1', name: '', nationality: '', role: '' },
  ]);

  const handleCreateEntity = async () => {
    if (!entity.name || !entity.country) return;

    if (isDemoMode) {
      setStep(1);
      return;
    }

    setSaving(true);
    try {
      // Get current user's company_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) throw new Error('No company found');

      const { data: newEntity, error } = await supabase
        .from('entities')
        .insert({
          company_id: profile.company_id,
          name: entity.name,
          country: entity.country as Country,
          industry_sector: entity.industry || null,
          employee_count_band: entity.size || null,
        })
        .select()
        .single();

      if (error) throw error;
      setCreatedEntityId(newEntity.id);
      toast.success('Entity created successfully');
      setStep(1);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create entity');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveManual = async () => {
    const filled = manualEmployees.filter(e => e.name && e.nationality);
    if (filled.length === 0) {
      toast.error('Please fill in at least one employee');
      return;
    }

    if (isDemoMode || !createdEntityId) {
      toast.success(`${filled.length} employee(s) saved`);
      setStep(2);
      return;
    }

    setSaving(true);
    try {
      const countryNationals = NATIONAL_CODES[entity.country] || [];
      const rows = filled.map(e => ({
        entity_id: createdEntityId,
        full_name: e.name,
        nationality: e.nationality,
        is_national: countryNationals.includes(e.nationality),
        job_title: e.role || null,
        contract_type: 'full_time' as const,
        counts_toward_quota: true,
      }));

      const { error } = await supabase.from('employees').insert(rows);
      if (error) throw error;

      toast.success(`${filled.length} employee(s) added`);
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save employees');
    } finally {
      setSaving(false);
    }
  };

  const addManualEmployee = () => {
    if (manualEmployees.length >= 10) {
      toast.info('Maximum 10 employees in quick add. Import CSV for more.');
      return;
    }
    setManualEmployees([...manualEmployees, { id: Date.now().toString(), name: '', nationality: '', role: '' }]);
  };

  const removeManualEmployee = (id: string) => {
    if (manualEmployees.length > 1) {
      setManualEmployees(manualEmployees.filter(e => e.id !== id));
    }
  };

  const updateManualEmployee = (id: string, field: keyof ManualEmployee, value: string) => {
    setManualEmployees(manualEmployees.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-14 border-b bg-card flex items-center px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-jetbrains font-bold text-sm">N</span>
          </div>
          <span className="font-sora font-bold text-xl">NatIQ</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`ml-1 sm:ml-2 text-xs sm:text-sm ${i <= step ? 'text-foreground' : 'text-muted-foreground'} hidden xs:inline`}>{s}</span>
                {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 mx-1 sm:mx-4 text-muted-foreground" />}
              </div>
            ))}
          </div>

          <Card className="shadow-card">
            {/* Step 1: Entity Setup */}
            {step === 0 && (
              <>
                <CardHeader><CardTitle>Let's set up your first legal entity</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Entity Name *</Label>
                    <Input placeholder="e.g. Acme Saudi Arabia LLC" value={entity.name} onChange={(e) => setEntity({...entity, name: e.target.value})} />
                  </div>
                  <div>
                    <Label>Country *</Label>
                    <Select value={entity.country} onValueChange={(v) => setEntity({...entity, country: v as Country})}>
                      <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                      <SelectContent>
                        {(['SA', 'AE', 'QA', 'OM'] as Country[]).map((c) => (
                          <SelectItem key={c} value={c}>{COUNTRY_FLAGS[c]} {COUNTRY_NAMES[c]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Industry Sector</Label>
                    <Select value={entity.industry} onValueChange={(v) => setEntity({...entity, industry: v})}>
                      <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                      <SelectContent>{INDUSTRY_SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Employee Count</Label>
                    <Select value={entity.size} onValueChange={(v) => setEntity({...entity, size: v})}>
                      <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>{EMPLOYEE_COUNT_BANDS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={handleCreateEntity} disabled={!entity.name || !entity.country || saving}>
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Continue'}
                  </Button>
                </CardContent>
              </>
            )}

            {/* Step 2: Add Employees */}
            {step === 1 && (
              <>
                <CardHeader><CardTitle>Add your employees</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Tabs value={employeeTab} onValueChange={setEmployeeTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="csv" className="flex items-center gap-1">
                        <Upload className="w-4 h-4" />CSV
                      </TabsTrigger>
                      <TabsTrigger value="hrms" className="flex items-center gap-1">
                        <Database className="w-4 h-4" />HRMS
                      </TabsTrigger>
                      <TabsTrigger value="manual" className="flex items-center gap-1">
                        <Users className="w-4 h-4" />Manual
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="csv" className="space-y-4 mt-4">
                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                        <p className="font-medium mb-2">Drop your CSV file here</p>
                        <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                        <Button variant="outline">Download Sample CSV</Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="hrms" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { name: 'Qiwa API', active: true },
                          { name: 'SAP SuccessFactors', active: false },
                          { name: 'Oracle HCM', active: false },
                          { name: 'Workday', active: false },
                          { name: 'Bayzat', active: false },
                          { name: 'Custom API', active: false },
                        ].map((sys) => (
                          <div key={sys.name} className={`p-3 sm:p-4 rounded-lg border text-center ${sys.active ? 'border-primary bg-accent' : 'opacity-50'}`}>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-muted mx-auto mb-2 flex items-center justify-center">
                              <Database className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <p className="text-xs sm:text-sm font-medium">{sys.name}</p>
                            {sys.active ? (
                              <Button size="sm" className="mt-2">Connect</Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Coming Soon</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="manual" className="space-y-4 mt-4">
                      <p className="text-sm text-muted-foreground">Quick-add up to 10 employees. You can add more later.</p>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {manualEmployees.map((emp, idx) => (
                          <div key={emp.id} className="flex gap-2 items-center">
                            <span className="text-xs text-muted-foreground w-4">{idx + 1}</span>
                            <Input
                              placeholder="Full Name"
                              value={emp.name}
                              onChange={(e) => updateManualEmployee(emp.id, 'name', e.target.value)}
                              className="flex-1"
                            />
                            <Select value={emp.nationality} onValueChange={(v) => updateManualEmployee(emp.id, 'nationality', v)}>
                              <SelectTrigger className="w-28"><SelectValue placeholder="Nat." /></SelectTrigger>
                              <SelectContent>
                                {['SA', 'AE', 'QA', 'OM', 'IN', 'EG', 'PK', 'PH', 'GB'].map((n) => (
                                  <SelectItem key={n} value={n}>{getNationalityFlag(n)} {n}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Role"
                              value={emp.role}
                              onChange={(e) => updateManualEmployee(emp.id, 'role', e.target.value)}
                              className="w-32"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              onClick={() => removeManualEmployee(emp.id)}
                              disabled={manualEmployees.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" onClick={addManualEmployee} disabled={manualEmployees.length >= 10}>
                        <Plus className="w-4 h-4 mr-1" />Add Another
                      </Button>
                      <Button className="w-full" onClick={handleSaveManual} disabled={saving}>
                        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save & Continue'}
                      </Button>
                    </TabsContent>
                  </Tabs>

                  <p className="text-sm text-muted-foreground text-center">You can add more employees later</p>
                  <Button variant="outline" className="w-full" onClick={() => setStep(2)}>
                    Skip for now
                  </Button>
                </CardContent>
              </>
            )}

            {/* Step 3: Complete */}
            {step === 2 && (
              <>
                <CardHeader className="text-center"><CardTitle>🎉 You're all set!</CardTitle></CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-status-green-light mx-auto flex items-center justify-center">
                    <Check className="w-12 h-12 text-status-green" />
                  </div>
                  <p className="text-muted-foreground">
                    Your entity <strong>{entity.name || 'New Entity'}</strong> has been created. View your dashboard to see your compliance score.
                  </p>
                  <Button className="w-full" onClick={() => { toast.success('Setup complete!'); navigate('/dashboard'); }}>
                    View your Dashboard →
                  </Button>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
