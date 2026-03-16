import { Linkedin, Twitter, Mail } from 'lucide-react';

// ─── EDIT THESE VALUES to update the team section ───────────────────────
const FOUNDER = {
  initials: 'FN',
  name: 'Founder Name',
  title: 'Founder & CEO',
  bio: 'Background in [sector]. Previously [Company]. Passionate about building software that solves real operational problems in the GCC.',
  linkedin: '#',
  twitter: '#',
  email: 'hello@natiq.io',
};
// ────────────────────────────────────────────────────────────────────────

export function TeamSection() {
  return (
    <section className="py-20 bg-card">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-sm font-semibold tracking-widest text-primary mb-4">THE TEAM</p>
        <h2 className="font-sora font-bold text-3xl sm:text-4xl mb-4" style={{ color: '#1B3A5C' }}>
          Built by people who understand the problem
        </h2>
        <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
          NatIQ was born from direct experience watching GCC HR teams struggle with compliance spreadsheets.
          We're building the tool we wished existed.
        </p>

        {/* Founder Card */}
        <div className="bg-card border rounded-xl shadow-sm max-w-[480px] mx-auto p-8">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#1B3A5C' }}>
            <span className="text-white font-sora font-bold text-xl">{FOUNDER.initials}</span>
          </div>
          <h3 className="font-sora font-bold text-xl" style={{ color: '#1B3A5C' }}>{FOUNDER.name}</h3>
          <p className="text-sm text-primary font-medium mt-1">{FOUNDER.title}</p>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{FOUNDER.bio}</p>
          <div className="flex items-center justify-center gap-4 mt-5">
            <a href={FOUNDER.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href={FOUNDER.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href={`mailto:${FOUNDER.email}`} className="text-muted-foreground hover:text-primary transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        <a
          href="mailto:hello@natiq.io?subject=NatIQ%20-%20Joining%20the%20team"
          className="inline-block mt-8 text-primary text-sm font-medium hover:underline"
        >
          We're hiring →
        </a>
      </div>
    </section>
  );
}
