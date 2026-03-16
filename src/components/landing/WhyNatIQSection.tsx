const EXPERTISE_CARDS = [
  {
    title: 'GCC Regulatory Intelligence',
    body: 'We track MHRSD, MOHRE, the Qatar Ministry of Labour, and Oman\'s Ministry of Manpower — monitoring every circular, ministerial decision, and quota change across all four countries.',
  },
  {
    title: 'Built for the Region',
    body: 'Full Arabic RTL support, GCC-native payment methods, data hosted in AWS Bahrain for regional data residency. Not a global tool retrofitted for the Gulf.',
  },
  {
    title: 'Compliance, Not Just Data',
    body: 'NatIQ doesn\'t just show you your ratio. It tells you exactly what to hire, reclassify, or fix — ranked by compliance impact and effort. The difference between a dashboard and a decision tool.',
  },
];

// Replace placeholder logos with real press logos when coverage is secured.
const PRESS_ITEMS = [
  { quote: '"A much-needed compliance tool for the GCC market"' },
  { quote: '"Solving a real pain point for HR teams across the Gulf"' },
  { quote: '"Bringing automation to workforce nationalization"' },
  { quote: '"The regulatory intelligence layer GCC HR teams have been missing"' },
];

// Remove or replace if not applicable — only show real affiliations.
const ECOSYSTEM_LOGOS = ['Hub71', 'Flat6Labs', 'Wamda'];

export function WhyNatIQSection() {
  return (
    <section className="py-20" style={{ background: '#F1F5F9' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-sm font-semibold tracking-widest text-primary mb-4 text-center">WHY NATIQ</p>
        <h2 className="font-sora font-bold text-3xl sm:text-4xl text-center mb-12" style={{ color: '#1B3A5C' }}>
          Domain expertise meets modern software
        </h2>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Expertise */}
          <div className="space-y-4">
            <h3 className="font-sora font-semibold text-lg mb-4" style={{ color: '#1B3A5C' }}>Domain Expertise</h3>
            {EXPERTISE_CARDS.map((card) => (
              <div
                key={card.title}
                className="bg-card rounded-r-lg p-5 border-l-[3px] border-primary"
              >
                <h4 className="font-sora font-semibold text-sm mb-2">{card.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>

          {/* Right: Recognition */}
          <div>
            <h3 className="font-sora font-semibold text-lg mb-4" style={{ color: '#1B3A5C' }}>Recognition</h3>
            <div className="bg-card rounded-lg p-6 border">
              <h4 className="font-sora font-semibold text-sm mb-4">Press & Recognition</h4>
              <div className="space-y-4">
                {PRESS_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    {/* Replace with real press logo */}
                    <div className="w-[100px] h-8 rounded bg-muted flex-shrink-0" />
                    <p className="text-sm text-muted-foreground italic">{item.quote}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t">
                <p className="text-xs text-muted-foreground mb-3">Featured in</p>
                <div className="flex items-center gap-6">
                  {ECOSYSTEM_LOGOS.map((name) => (
                    <span
                      key={name}
                      className="text-sm font-semibold opacity-60 hover:opacity-100 transition-opacity cursor-default"
                      style={{ color: '#64748B' }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Backed by design partners across Saudi Arabia and the UAE.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
