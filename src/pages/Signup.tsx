import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Eye, EyeOff, Check } from 'lucide-react';
import { INDUSTRY_SECTORS, COUNTRY_FLAGS, COUNTRY_NAMES } from '@/lib/mockData';
import type { Country } from '@/types/database';

const COUNTRIES: Country[] = ['SA', 'AE', 'QA', 'OM'];
const HEADCOUNT_OPTIONS = ['1-49', '50-199', '200-999', '1000+'];

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPartner = searchParams.get('partner') === 'true';
  const { signUp, enterDemoMode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    fullName: '',
    email: '',
    password: '',
    countries: [] as Country[],
    industry: '',
    headcount: '',
  });

  const handleCountryToggle = (country: Country) => {
    setFormData((prev) => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter((c) => c !== country)
        : [...prev.countries, country],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.countries.length === 0) {
      toast.error('Please select at least one country');
      return;
    }

    setLoading(true);

    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.fullName,
      company_name: formData.companyName,
      countries: formData.countries,
      industry: formData.industry,
      headcount: formData.headcount,
      is_design_partner: isPartner,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Account created! Check your email to verify.');
      navigate('/onboarding');
    }
  };

  const handleDemoMode = () => {
    enterDemoMode();
    toast.success('Welcome to NatIQ Demo!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[55%] bg-secondary p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full border-2 border-white" />
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full border-2 border-white" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-jetbrains font-bold text-xl">N</span>
            </div>
            <span className="text-white font-sora font-bold text-4xl tracking-tight">NatIQ</span>
          </div>

          <h1 className="text-white font-sora font-bold text-4xl leading-tight mb-6">
            Start your free<br />14-day trial
          </h1>
          <p className="text-white/80 text-lg mb-8">
            No credit card required. Get instant access to<br />
            GCC compliance tracking and AI forecasting.
          </p>

          <div className="space-y-4">
            {[
              'Full access to all features',
              'Unlimited team members',
              'AI-powered recommendations',
              'Regulatory change alerts',
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-white/90">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          Trusted by 500+ companies across the GCC
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-card overflow-y-auto">
        <div className="w-full max-w-lg space-y-6">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-6">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-jetbrains font-bold text-lg">N</span>
            </div>
            <span className="text-foreground font-sora font-bold text-2xl">NatIQ</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="font-sora font-bold text-2xl text-foreground">Start your free trial</h2>
            <p className="text-muted-foreground mt-1">No credit card required. 14 days free.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Acme Corp"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Countries of Operation</Label>
              <div className="grid grid-cols-2 gap-2">
                {COUNTRIES.map((country) => (
                  <label
                    key={country}
                    className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted cursor-pointer"
                  >
                    <Checkbox
                      checked={formData.countries.includes(country)}
                      onCheckedChange={() => handleCountryToggle(country)}
                    />
                    <span className="text-lg">{COUNTRY_FLAGS[country]}</span>
                    <span className="text-sm">{COUNTRY_NAMES[country]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Industry Sector</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_SECTORS.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Approximate Headcount</Label>
                <Select
                  value={formData.headcount}
                  onValueChange={(value) => setFormData({ ...formData, headcount: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {HEADCOUNT_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleDemoMode}>
            <span className="mr-2">🚀</span>
            Explore Demo First
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
