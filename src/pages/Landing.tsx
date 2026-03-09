import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield, TrendingUp, Lightbulb, Users, BarChart3, Globe,
  CheckCircle, ArrowRight, Star, Zap, Clock, FileText,
} from 'lucide-react';

const FEATURES = [
  { icon: Shield, title: 'Real-Time Compliance', desc: 'Track Nitaqat, Emiratisation, Qatarisation, and Omanisation ratios across all entities instantly.' },
  { icon: TrendingUp, title: '90-Day Forecasting', desc: 'AI-powered projections warn you before you breach compliance — not after.' },
  { icon: Lightbulb, title: 'Smart Recommendations', desc: 'Actionable hiring and reclassification suggestions with exact compliance impact.' },
  { icon: Users, title: 'Workforce Management', desc: 'Manage employees, CSV imports, and nationality classifications in one place.' },
  { icon: BarChart3, title: 'Branded Reports', desc: 'Generate compliance certificates, audit packs, and forecast reports as PDF or Excel.' },
  { icon: Globe, title: 'Multi-Entity Support', desc: 'Manage multiple legal entities across Saudi Arabia, UAE, Qatar, and Oman.' },
];

const PLANS = [
  { name: 'Starter', price: 'Free', period: '', features: ['1 entity', '50 employees', 'Basic compliance tracking', 'Email support'], cta: 'Start Free' },
  { name: 'Growth', price: '$199', period: '/mo', features: ['5 entities', '500 employees', 'AI forecasting', 'Recommendations engine', 'CSV import', 'Priority support'], cta: 'Start Free Trial', popular: true },
  { name: 'Scale', price: '$499', period: '/mo', features: ['Unlimited entities', '5,000 employees', 'API access', 'Custom reports', 'Priority support', 'Dedicated CSM'], cta: 'Contact Sales' },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Scale', 'SSO / SAML', 'SLA guarantee', 'Custom integrations', 'On-prem option', 'Dedicated CSM'], cta: 'Contact Sales' },
];

const TESTIMONIALS = [
  { quote: 'NatIQ saved us from a Nitaqat penalty. We caught a ratio drop 60 days before it happened.', name: 'Khalid Al-Rashidi', role: 'HR Director', company: 'TechCo Saudi' },
  { quote: 'We went from 3 spreadsheets and manual calculations to a single dashboard. Compliance is no longer a headache.', name: 'Fatima Al-Maktoum', role: 'CFO', company: 'Gulf Ventures FZE' },
  { quote: 'The AI recommendations helped us find 4 reclassification opportunities we completely missed.', name: 'Ahmed Al-Thani', role: 'HR Manager', company: 'Doha Solutions' },
];

export default function Landing() {
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
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" /> Now with AI-powered forecasting
            </div>
            <h1 className="font-sora font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground leading-tight mb-6">
              GCC Nationalization Compliance,{' '}
              <span className="text-primary">Simplified</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Track Nitaqat, Emiratisation, Qatarisation, and Omanisation in real-time.
              Forecast risks 90 days ahead. Get AI recommendations to stay compliant.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-base px-8" asChild>
                <Link to="/signup">Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8" asChild>
                <Link to="/login">View Demo</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">No credit card required. 14 days free.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            {[
              { value: '4', label: 'GCC Countries' },
              { value: '50+', label: 'Compliance Rules' },
              { value: '90', label: 'Day Forecasts' },
              { value: '<1min', label: 'Setup Time' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-jetbrains font-bold text-3xl text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Country Flags Banner */}
      <section className="border-y bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-center text-sm text-muted-foreground mb-4">Supporting all GCC nationalization programmes</p>
          <div className="flex items-center justify-center gap-8 sm:gap-16 flex-wrap">
            {[
              { flag: '🇸🇦', name: 'Nitaqat', country: 'Saudi Arabia' },
              { flag: '🇦🇪', name: 'Emiratisation', country: 'UAE' },
              { flag: '🇶🇦', name: 'Qatarisation', country: 'Qatar' },
              { flag: '🇴🇲', name: 'Omanisation', country: 'Oman' },
            ].map((p) => (
              <div key={p.country} className="flex items-center gap-2">
                <span className="text-3xl">{p.flag}</span>
                <div>
                  <p className="font-semibold text-sm text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-sora font-bold text-3xl text-foreground mb-4">Everything You Need for Compliance</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Replace spreadsheets and manual processes with an intelligent platform purpose-built for GCC nationalization.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <Card key={f.title} className="shadow-card hover:shadow-elevated transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-sora font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-sora font-bold text-3xl text-foreground mb-4">Up and Running in Minutes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', icon: FileText, title: 'Import Your Workforce', desc: 'Upload a CSV or connect your HRMS. NatIQ auto-maps nationalities.' },
              { step: '2', icon: BarChart3, title: 'See Your Score', desc: 'Instant compliance ratio calculation with Nitaqat band classification.' },
              { step: '3', icon: Lightbulb, title: 'Act on Insights', desc: 'Get AI recommendations to improve your ratio and prevent penalties.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-jetbrains font-bold text-xl">{s.step}</div>
                <h3 className="font-sora font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-sora font-bold text-3xl text-foreground mb-4">Trusted by GCC HR Leaders</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}
                  </div>
                  <p className="text-sm text-foreground mb-4 italic">"{t.quote}"</p>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-sora font-bold text-3xl text-foreground mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">Start free. Scale as you grow.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {PLANS.map((plan) => (
              <Card key={plan.name} className={`shadow-card relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="font-sora font-semibold text-lg mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="font-jetbrains font-bold text-3xl">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.popular ? 'default' : 'outline'} asChild>
                    <Link to="/signup">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-sora font-bold text-3xl text-foreground mb-4">
            Ready to Simplify Compliance?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of companies using NatIQ to stay compliant across the GCC.
          </p>
          <Button size="lg" className="text-base px-8" asChild>
            <Link to="/signup">Start Your Free Trial <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-jetbrains font-bold text-xs">N</span>
              </div>
              <span className="font-sora font-bold text-foreground">NatIQ</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} NatIQ. GCC Nationalization Compliance Platform.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
