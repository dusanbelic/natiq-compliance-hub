import { Server, Globe, Star } from 'lucide-react';

const AVATAR_INITIALS = ['AH', 'SM', 'KR', 'FJ', 'NB'];

const TRUST_BADGES = [
  { icon: Globe, label: 'Arabic RTL Support' },
  { icon: Star, label: 'Vision 2030 Aligned' },
];

export function SocialProofBar() {
  return (
    <section className="py-8 bg-card border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

          {/* Testimonial */}
          <div className="max-w-sm text-center lg:text-left">
            <div className="flex items-start gap-2">
              <span className="text-3xl text-primary leading-none font-serif">"</span>
              <div>
                <p className="text-sm italic text-foreground">
                  Finally a tool that understands the GCC compliance reality, not just a generic HR dashboard.
                </p>
                <p className="text-xs text-muted-foreground mt-2">— HR Director, Series-B Technology Company, Riyadh</p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs"
              >
                <badge.icon className="w-3.5 h-3.5" />
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
