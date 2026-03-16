import { useEffect, useRef, useState } from 'react';

const STATS = [
{ target: 4, label: 'GCC Countries Covered' },
{ target: 12, label: 'Compliance Programs Tracked' },
{ target: 269, label: 'Professions Monitored' },
{ target: 2026, label: 'Regulations Last Updated' }];


function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

export function TractionTicker() {
  return (
    <section
      className="w-full py-6"
      style={{
        background: '#243F63',
        borderTop: '1px solid rgba(45, 212, 191, 0.2)',
        borderBottom: '1px solid rgba(45, 212, 191, 0.2)'
      }}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-white/10">
          {STATS.map((stat) =>
          <StatItem key={stat.label} target={stat.target} label={stat.label} />
          )}
        </div>
      </div>
    </section>);

}

function StatItem({ target, label }: {target: number;label: string;}) {
  const { value, ref } = useCountUp(target);
  return (
    <div ref={ref} className="text-center px-4">
      <p className="font-jetbrains font-bold text-4xl text-white">{value.toLocaleString()}</p>
      <p className="mt-1 text-base text-muted" style={{ color: '#94A3B8', fontFamily: 'DM Sans, sans-serif' }}>
        {label}
      </p>
    </div>);

}