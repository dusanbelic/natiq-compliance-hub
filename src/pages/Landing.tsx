import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ComplianceRing } from '@/components/ComplianceRing';
import { ArrowRight, ArrowDown, Zap, Gift, Phone, Trophy, Check, Loader2, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { TractionTicker } from '@/components/landing/TractionTicker';
import { TeamSection } from '@/components/landing/TeamSection';
import { SocialProofBar } from '@/components/landing/SocialProofBar';
import { WhyNatIQSection } from '@/components/landing/WhyNatIQSection';

const applicationSchema = z.object({
  full_name: z.string().trim().min(1, 'Name is required').max(100),
  work_email: z.string().trim().email('Invalid email').max(255),
  company_name: z.string().trim().min(1, 'Company name is required').max(100),
  job_title: z.string().max(100).optional(),
  countries: z.array(z.string()).min(1, 'Select at least one country'),
  headcount_band: z.string().optional(),
  biggest_challenge: z.string().max(1000).optional(),
  referral_source: z.string().optional()
});

const COUNTRIES_LIST = [
{ code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
{ code: 'AE', flag: '🇦🇪', name: 'UAE' },
{ code: 'QA', flag: '🇶🇦', name: 'Qatar' },
{ code: 'OM', flag: '🇴🇲', name: 'Oman' }];


export default function Landing() {
  const productRef = useRef<HTMLDivElement>(null);
  const partnerRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    full_name: '', work_email: '', company_name: '', job_title: '',
    countries: [] as string[], headcount_band: '', biggest_challenge: '', referral_source: ''
  });

  const toggleCountry = (code: string) => {
    setForm((prev) => ({
      ...prev,
      countries: prev.countries.includes(code) ? prev.countries.filter((c) => c !== code) : [...prev.countries, code]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = applicationSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {fieldErrors[err.path[0] as string] = err.message;});
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const { error } = await supabase.from('design_partner_applications' as any).insert({
        full_name: form.full_name, work_email: form.work_email, company_name: form.company_name,
        job_title: form.job_title || null, countries: form.countries,
        headcount_band: form.headcount_band || null, biggest_challenge: form.biggest_challenge || null,
        referral_source: form.referral_source || null
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      if (err?.message?.includes('duplicate')) toast.error('This email has already applied.');else
      toast.error('Something went wrong, please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-jetbrains font-bold text-sm">N</span>
            </div>
            <span className="font-sora font-bold text-xl text-foreground">NatIQ</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => productRef.current?.scrollIntoView({ behavior: 'smooth' })} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Product</button>
            <Link to="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
            <button onClick={() => partnerRef.current?.scrollIntoView({ behavior: 'smooth' })} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Design Partners</button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild><Link to="/login">Sign In</Link></Button>
            <Button size="sm" onClick={() => partnerRef.current?.scrollIntoView({ behavior: 'smooth' })}>Apply for Early Access</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: '#1B3A5C' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-[55%] text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-6" style={{ background: 'hsl(180, 79%, 26%)', color: '#fff' }}>
                <Zap className="w-4 h-4" /> GCC Nationalization Compliance
              </div>
              <h1 className="font-sora font-bold text-4xl sm:text-5xl lg:text-[52px] text-white leading-tight mb-6">
                Stop guessing.<br />Start knowing.
              </h1>
              <p className="text-lg sm:text-xl mb-8 max-w-xl" style={{ color: '#CBD5E1' }}>
                NatIQ tracks your Saudisation, Emiratisation, and Qatarisation ratios in real time and tells you exactly what to do to stay compliant.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Button size="lg" className="text-base px-8 rounded-full" onClick={() => partnerRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                  Apply for Early Access <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <button onClick={() => productRef.current?.scrollIntoView({ behavior: 'smooth' })} className="text-white underline text-base flex items-center gap-1">
                  See how it works <ArrowDown className="w-4 h-4" />
                </button>
              </div>
              {/* View Live Demo */}
              <div className="mt-4">
                <Button variant="outline" size="lg" className="rounded-full border-primary/40 text-primary hover:bg-primary/10 hover:text-primary" asChild>
                  <Link to="/demo"><Play className="w-4 h-4 mr-2" /> View Live Demo</Link>
                </Button>
              </div>
              <p className="text-sm mt-4" style={{ color: '#94A3B8' }}>
                Currently accepting 20 design partners · Free for 12 months · No payment required
              </p>
            </div>
            <div className="lg:w-[45%] flex justify-center">
              <div className="bg-card rounded-2xl shadow-elevated p-6 space-y-4 transform rotate-3" style={{ minWidth: 300 }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-jetbrains font-bold text-xs">N</span>
                  </div>
                  <span className="font-sora font-bold text-foreground">NatIQ Dashboard</span>
                </div>
                <div className="flex items-center justify-center"><ComplianceRing value={21.4} size={140} strokeWidth={12} status="COMPLIANT" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <span className="text-lg">🇸🇦</span>
                    <p className="font-jetbrains font-bold text-sm text-foreground">21.4%</p>
                    <p className="text-xs badge-compliant inline-block px-1.5 py-0.5 rounded mt-1">GREEN</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <span className="text-lg">🇦🇪</span>
                    <p className="font-jetbrains font-bold text-sm text-foreground">8.2%</p>
                    <p className="text-xs badge-at-risk inline-block px-1.5 py-0.5 rounded mt-1">AMBER</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Traction Ticker */}
      <TractionTicker />

      {/* Problem */}
      <section className="py-20 bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-semibold tracking-widest text-primary mb-4">THE PROBLEM</p>
          <h2 className="font-sora font-bold text-3xl sm:text-4xl mb-12" style={{ color: '#1B3A5C' }}>
            68% of GCC HR teams track compliance on spreadsheets
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
            { emoji: '📋', title: 'Quarterly rule changes you miss', desc: 'Nitaqat bands shift. Targets increase annually. Most companies find out when the fine arrives.' },
            { emoji: '⏰', title: 'Hours lost every month', desc: 'Manual headcount audits, government portal logins, cross-referencing contracts. All manual. All error-prone.' },
            { emoji: '💰', title: "Fines you didn't see coming", desc: 'SAR 10,000 per month per quota gap in Saudi. AED 96,000 per year per unfilled position in UAE.' }].
            map((p) =>
            <Card key={p.title} className="shadow-card text-left">
                <CardContent className="p-6">
                  <span className="text-3xl mb-3 block">{p.emoji}</span>
                  <h3 className="font-sora font-semibold mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Product */}
      <section ref={productRef} className="py-20" style={{ background: '#F1F5F9' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-semibold tracking-widest text-primary mb-4">THE SOLUTION</p>
          <h2 className="font-sora font-bold text-3xl mb-12">From spreadsheet chaos to clarity in minutes</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
            { step: '1', title: 'Import', desc: 'Upload a CSV or connect your HRMS. Compliance score calculated instantly.' },
            { step: '2', title: 'Monitor', desc: 'Live dashboard across every GCC country, entity, and regulatory programme.' },
            { step: '3', title: 'Act', desc: 'AI tells you what to hire, reclassify, or fix, ranked by compliance impact.' }].
            map((s, i) =>
            <div key={s.step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-jetbrains font-bold text-xl mb-4">{s.step}</div>
                <h3 className="font-sora font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-base leading-snug">{s.desc}</p>
                {i < 2 && <ArrowRight className="w-5 h-5 text-primary mt-4 hidden md:block rotate-0" />}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Countries */}
      <section className="py-20 bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-sora font-bold text-3xl mb-12">All four GCC nationalization programs, one platform</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
            { flag: '🇸🇦', country: 'Saudi Arabia', program: 'Nitaqat / Saudisation', stat: 'Fines from SAR 10,000/month' },
            { flag: '🇦🇪', country: 'UAE', program: 'Emiratisation (Nafis)', stat: 'Target: 10% for 50+ employee companies' },
            { flag: '🇶🇦', country: 'Qatar', program: 'Qatarisation', stat: '20-50% target by sector' },
            { flag: '🇴🇲', country: 'Oman', program: 'Omanisation', stat: '5-75% sector-dependent' }].
            map((c) =>
            <Card key={c.country} className="shadow-card hover:-translate-y-1 hover:shadow-elevated transition-all cursor-default">
                <CardContent className="p-6 text-center">
                  <span className="text-4xl mb-3 block">{c.flag}</span>
                  <h3 className="font-sora font-bold text-xl">{c.country}</h3>
                  <p className="text-base text-primary font-medium mt-1">{c.program}</p>
                  <p className="text-sm text-muted-foreground mt-2">{c.stat}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <TeamSection />

      {/* Why NatIQ */}
      <WhyNatIQSection />

      {/* Design Partner Section */}
      <section ref={partnerRef} id="apply" className="py-20" style={{ background: '#1B3A5C' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-sora font-bold text-3xl sm:text-[40px] text-white mb-4">Join our Design Partner Programme</h2>
          <p className="text-lg mb-12" style={{ color: '#CBD5E1' }}>
            We are working with 20 companies to shape the product. Design partners get NatIQ free for 12 months and direct founder access.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
            { icon: Gift, label: 'Free for 12 months', desc: 'Full platform access from day one, no billing ever' },
            { icon: Phone, label: 'Direct founder access', desc: 'Weekly calls while we build together' },
            { icon: Trophy, label: 'Founding customer status', desc: 'Locked-in pricing forever after public launch' }].
            map((b) =>
            <div key={b.label} className="text-center">
                <b.icon className="w-8 h-8 text-white mx-auto mb-3" />
                <h3 className="font-bold text-white mb-1">{b.label}</h3>
                <p className="text-sm" style={{ color: '#CBD5E1' }}>{b.desc}</p>
              </div>
            )}
          </div>

          {/* Form */}
          {submitted ?
          <Card className="max-w-xl mx-auto rounded-2xl">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary mx-auto flex items-center justify-center">
                  <Check className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-sora font-bold text-2xl">Application received! 🎉</h3>
                <p className="text-muted-foreground">We'll be in touch within 48 hours.</p>
                <div className="flex gap-3 justify-center pt-4">
                  <Button variant="outline" asChild>
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://natiq.io')}`} target="_blank" rel="noopener noreferrer">
                      Share on LinkedIn
                    </a>
                  </Button>
                  <Button variant="outline" onClick={() => {navigator.clipboard.writeText('https://natiq.io');toast.success('Copied!');}}>
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card> :

          <Card className="max-w-xl mx-auto rounded-2xl">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  <div>
                    <Label>Full Name *</Label>
                    <Input value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} onBlur={() => {if (!form.full_name) setErrors((p) => ({ ...p, full_name: 'Required' }));else setErrors((p) => {const n = { ...p };delete n.full_name;return n;});}} />
                    {errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name}</p>}
                  </div>
                  <div>
                    <Label>Work Email *</Label>
                    <Input type="email" value={form.work_email} onChange={(e) => setForm((p) => ({ ...p, work_email: e.target.value }))} />
                    {errors.work_email && <p className="text-xs text-destructive mt-1">{errors.work_email}</p>}
                  </div>
                  <div>
                    <Label>Company Name *</Label>
                    <Input value={form.company_name} onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))} />
                    {errors.company_name && <p className="text-xs text-destructive mt-1">{errors.company_name}</p>}
                  </div>
                  <div>
                    <Label>Job Title</Label>
                    <Input value={form.job_title} onChange={(e) => setForm((p) => ({ ...p, job_title: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Countries of Operation *</Label>
                    <div className="flex gap-3 mt-2 flex-wrap">
                      {COUNTRIES_LIST.map((c) =>
                    <label key={c.code} className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-muted">
                          <Checkbox checked={form.countries.includes(c.code)} onCheckedChange={() => toggleCountry(c.code)} />
                          <span>{c.flag}</span><span className="text-sm">{c.name}</span>
                        </label>
                    )}
                    </div>
                    {errors.countries && <p className="text-xs text-destructive mt-1">{errors.countries}</p>}
                  </div>
                  <div>
                    <Label>Approximate headcount</Label>
                    <Select value={form.headcount_band} onValueChange={(v) => setForm((p) => ({ ...p, headcount_band: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_50">Under 50</SelectItem>
                        <SelectItem value="50_199">50-199</SelectItem>
                        <SelectItem value="200_999">200-999</SelectItem>
                        <SelectItem value="1000_plus">1,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Biggest compliance challenge right now</Label>
                    <Textarea value={form.biggest_challenge} onChange={(e) => setForm((p) => ({ ...p, biggest_challenge: e.target.value }))} placeholder="e.g. We track Nitaqat on spreadsheets and always find out about quota changes too late" rows={3} />
                  </div>
                  <div>
                    <Label>How did you hear about NatIQ?</Label>
                    <Select value={form.referral_source} onValueChange={(v) => setForm((p) => ({ ...p, referral_source: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {submitting ? 'Submitting...' : 'Apply for Early Access'} {!submitting && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </form>
              </CardContent>
            </Card>
          }
        </div>
      </section>

      {/* Social Proof Bar */}
      <SocialProofBar />

      {/* Footer */}
      <footer className="py-12" style={{ background: '#0F172A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-jetbrains font-bold text-xs">N</span>
                </div>
                <span className="font-sora font-bold text-white">NatIQ</span>
              </div>
              <p className="text-sm" style={{ color: '#94A3B8' }}>Nationalization compliance, simplified.</p>
              <p className="text-xs mt-2" style={{ color: '#64748B' }}>© 2025 NatIQ. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <Link to="/dashboard" className="text-sm hover:text-white" style={{ color: '#94A3B8' }}>Dashboard</Link>
              <Link to="/login" className="text-sm hover:text-white" style={{ color: '#94A3B8' }}>Sign In</Link>
              <button onClick={() => partnerRef.current?.scrollIntoView({ behavior: 'smooth' })} className="text-sm hover:text-white" style={{ color: '#94A3B8' }}>Apply for Access</button>
              <Link to="/resources" className="text-sm hover:text-white" style={{ color: '#94A3B8' }}>Resources</Link>
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Get in touch</p>
              <a href="mailto:hello@natiq.io" className="text-sm hover:text-white" style={{ color: '#94A3B8' }}>hello@natiq.io</a>
            </div>
          </div>
        </div>
      </footer>
    </div>);

}