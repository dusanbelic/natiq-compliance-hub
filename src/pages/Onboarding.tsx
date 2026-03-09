import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COUNTRY_FLAGS, COUNTRY_NAMES, INDUSTRY_SECTORS, EMPLOYEE_COUNT_BANDS } from '@/lib/mockData';
import { Check, ChevronRight, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { Country } from '@/types/database';

const STEPS = ['Set Up Entity', 'Add Employees', 'Complete'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [entity, setEntity] = useState({ name: '', country: '' as Country | '', industry: '', size: '' });

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
    else {
      toast.success('Setup complete!');
      navigate('/dashboard');
    }
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

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`ml-2 text-sm ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
                {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 mx-4 text-muted-foreground" />}
              </div>
            ))}
          </div>

          <Card className="shadow-card">
            {step === 0 && (
              <>
                <CardHeader><CardTitle>Let's set up your first legal entity</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Entity Name</Label><Input placeholder="e.g. Acme Saudi Arabia LLC" value={entity.name} onChange={(e) => setEntity({...entity, name: e.target.value})} /></div>
                  <div><Label>Country</Label>
                    <Select value={entity.country} onValueChange={(v) => setEntity({...entity, country: v as Country})}>
                      <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                      <SelectContent>
                        {(['SA', 'AE', 'QA', 'OM'] as Country[]).map((c) => <SelectItem key={c} value={c}>{COUNTRY_FLAGS[c]} {COUNTRY_NAMES[c]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Industry Sector</Label>
                    <Select value={entity.industry} onValueChange={(v) => setEntity({...entity, industry: v})}>
                      <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                      <SelectContent>{INDUSTRY_SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Employee Count</Label>
                    <Select value={entity.size} onValueChange={(v) => setEntity({...entity, size: v})}>
                      <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>{EMPLOYEE_COUNT_BANDS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={nextStep}>Continue</Button>
                </CardContent>
              </>
            )}

            {step === 1 && (
              <>
                <CardHeader><CardTitle>Add your employees</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-medium mb-2">Drop your CSV file here</p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                    <Button variant="outline">Download Sample CSV</Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">You can add more employees later</p>
                  <Button className="w-full" onClick={nextStep}>Skip for now</Button>
                </CardContent>
              </>
            )}

            {step === 2 && (
              <>
                <CardHeader className="text-center"><CardTitle>🎉 You're all set!</CardTitle></CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-status-green-light mx-auto flex items-center justify-center">
                    <Check className="w-12 h-12 text-status-green" />
                  </div>
                  <p className="text-muted-foreground">Your entity has been created. View your dashboard to see your compliance score.</p>
                  <Button className="w-full" onClick={nextStep}>View your Dashboard →</Button>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
