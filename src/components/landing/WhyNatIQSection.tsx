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

        <div className="grid md:grid-cols-3 gap-6">
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
      </div>
    </section>
  );
}
