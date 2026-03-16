import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Clock, Menu, X } from 'lucide-react';

export default function NitaqatArticle() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav — matches Landing page */}
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-jetbrains font-bold text-sm">N</span>
            </div>
            <span className="font-sora font-bold text-xl text-foreground">NatIQ</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-base text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/resources" className="text-base text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
            <Link to="/demo" className="text-base text-muted-foreground hover:text-foreground transition-colors">Demo</Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex"><Link to="/login">Sign In</Link></Button>
            <Button size="sm" asChild className="hidden sm:inline-flex"><Link to="/#apply">Apply for Early Access</Link></Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-card px-4 py-3 space-y-2">
            <Link to="/" className="block w-full py-2 text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/resources" className="block w-full py-2 text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Resources</Link>
            <Link to="/demo" className="block w-full py-2 text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Demo</Link>
            <div className="flex gap-2 pt-2 border-t">
              <Button variant="ghost" size="sm" asChild className="flex-1"><Link to="/login">Sign In</Link></Button>
              <Button size="sm" asChild className="flex-1"><Link to="/#apply">Apply</Link></Button>
            </div>
          </div>
        )}
      </nav>

      {/* Header */}
      <section className="py-16" style={{ background: '#1B3A5C' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Badge className="bg-primary text-primary-foreground mb-4">Saudi Arabia</Badge>
          <h1 className="font-sora font-bold text-3xl sm:text-4xl text-white mb-4 leading-tight">
            How Nitaqat Actually Works: A Plain-English Guide for HR Directors in 2025
          </h1>
          <div className="flex items-center gap-4 text-sm" style={{ color: '#94A3B8' }}>
            <span>NatIQ Team</span>
            <span>·</span>
            <span>March 2026</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 8 min read</span>
          </div>
        </div>
      </section>

      {/* Article */}
      <article className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-lg prose-slate max-w-none">

          <h2 className="font-sora font-bold text-2xl mt-0 mb-4" style={{ color: '#1B3A5C' }}>What is Nitaqat and why does it matter</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Nitaqat is Saudi Arabia's mandatory workforce nationalization programme, managed by the Ministry of Human Resources and Social Development through the Qiwa platform. Every private sector company with 10 or more employees must maintain a minimum percentage of Saudi nationals in their workforce. The percentage varies by sector, company size, and type of activity. Getting it wrong costs more than most companies realise: drop into the Red band and you lose the ability to issue new work visas, renew permits, and participate in government tenders. For a growing company in Saudi Arabia, that is an operational crisis.
          </p>

          <h2 className="font-sora font-bold text-2xl mt-10 mb-4" style={{ color: '#1B3A5C' }}>The five Nitaqat bands explained</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Nitaqat classifies every private sector company into one of five colour-coded bands based on its Saudisation ratio. <strong>Platinum</strong> is the highest, awarded to companies above approximately 26.5 percent. These companies get the fastest visa processing, priority hiring rights, and unrestricted employee transfers. <strong>High Green</strong> and <strong>Medium Green</strong> companies are compliant and can operate normally, apply for new visas, and renew work permits. <strong>Low Green</strong> is the critical floor: companies between roughly 16.2 and 19.3 percent are technically compliant but cannot apply for new visas or change employee professions. <strong>Red</strong> is non-compliant: visa blocks, permit freezes, restricted access to Qiwa, and potential fines. The Yellow band was officially removed in November 2019, so companies that were Yellow were automatically moved to Red. Many HR teams still refer to Yellow — it no longer exists in the official system.
          </p>

          <h2 className="font-sora font-bold text-2xl mt-10 mb-4" style={{ color: '#1B3A5C' }}>How the ratio is calculated</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            MHRSD calculates your Saudisation ratio by dividing the number of qualifying Saudi nationals by your total qualifying workforce, then multiplying by 100. The word <em>qualifying</em> matters. Not every employee counts the same way. Saudi nationals earning SAR 4,000 or more per month count as one full employee. Saudi nationals earning between SAR 2,000 and SAR 3,999 count as half an employee. Those earning below SAR 2,000 do not count at all. Saudi nationals with disabilities count as four employees. Part-time Saudi workers count as 0.5. Foreign investors who own private businesses in Saudi Arabia now count as Saudi nationals following an April 2024 MHRSD change. The same applies to offspring of Saudi women married to non-Saudis and non-Saudi widows of Saudi citizens.
          </p>

          <h2 className="font-sora font-bold text-2xl mt-10 mb-4" style={{ color: '#1B3A5C' }}>The 2025 sector changes you cannot afford to miss</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Several sectors have seen significant target increases in 2025. Engineering firms with five or more engineers must now have 30 percent Saudi engineers from July 27 2025 — and the minimum qualifying salary for engineers is SAR 7,000 per month. Accounting firms with five or more accountants face a phased plan starting at 40 percent from October 27 2025, rising by 10 percent annually until reaching 70 percent in 2028. Hospitals must achieve 65 percent Saudisation from July 27 2025. Community pharmacies face a 35 percent target and other pharmacy businesses face 55 percent. Dental clinics with three or more dental professionals must reach 45 percent from July 27 2025, rising to 55 percent from January 27 2026. In the consulting sector, companies must ensure 40 percent of key roles including financial consultants, business consultants, cybersecurity specialists, and project managers are Saudi nationals, effective since May 2024.
          </p>

          <h2 className="font-sora font-bold text-2xl mt-10 mb-4" style={{ color: '#1B3A5C' }}>What happens when you fall into Red</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            The consequences are immediate and compound quickly. MHRSD blocks your company on the Qiwa and Muqeem portals, which means you cannot issue new work visas, renew existing iqamas, transfer employees between branches, or change employee professions. You lose eligibility for government contracts. Companies that persist in non-compliance face financial penalties, public disclosure of their non-compliance status on the Ministry website, and in extreme cases commercial registration suspension. More than 200,000 companies were closed in 2014 for persistent non-compliance when Nitaqat enforcement was tightened. The programme has become significantly more sophisticated since then.
          </p>

          <h2 className="font-sora font-bold text-2xl mt-10 mb-4" style={{ color: '#1B3A5C' }}>Practical steps to maintain compliance</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Check your status on Qiwa every week — Nitaqat recalculates quarterly and a single departure can shift your band without warning. Set calendar reminders for the quarterly recalculation dates. When hiring, always calculate the compliance impact of each new hire before issuing the offer. A new Saudi national hire raises your ratio; a new expat hire dilutes it. Track contract end dates for all expat employees — an unexpected cluster of departures can push you from Green to Red within a single calculation cycle. Build a buffer above the minimum. Low Green means you are one resignation away from Red. Target Medium Green or higher as your operating baseline. And when regulations change — which they do frequently, often with 30 to 60 days notice — assess the impact on your specific sector and headcount immediately.
          </p>

          <h2 className="font-sora font-bold text-2xl mt-10 mb-4" style={{ color: '#1B3A5C' }}>The bottom line</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Nitaqat compliance is not a once-a-year HR task. It is a continuous operational responsibility that directly affects your company's ability to hire, grow, and win contracts in Saudi Arabia. The companies that treat it as strategic — building compliance into their workforce planning, not scrambling to fix it when something breaks — are the ones who avoid the fines, the visa blocks, and the regulator conversations. NatIQ was built to make that continuous monitoring automatic rather than manual.
          </p>
        </div>
      </article>

      {/* CTA */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8 text-center">
              <h3 className="font-sora font-bold text-xl mb-3" style={{ color: '#1B3A5C' }}>
                Track your Nitaqat status automatically
              </h3>
              <p className="text-muted-foreground mb-6">
                NatIQ calculates your compliance ratio in real time and tells you exactly what to do to stay in the Green band.
              </p>
              <Button size="lg" className="rounded-full px-8" asChild>
                <Link to="/#apply">Apply for Early Access <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">© 2025 NatIQ. All rights reserved.</p>
          <Link to="/resources" className="text-sm text-primary hover:underline">← Back to Resources</Link>
        </div>
      </footer>
    </div>
  );
}
