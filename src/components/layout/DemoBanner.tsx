import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function DemoBanner() {
  return (
    <div
      className="w-full py-2.5 px-4 text-center text-sm text-white flex items-center justify-center gap-3 flex-wrap"
      style={{ background: 'hsl(180, 79%, 26%)' }}
    >
      <span>Live Product Demo — Sample data for illustration</span>
      <Button size="sm" variant="secondary" className="h-7 text-xs" asChild>
        <Link to="/#apply">Apply Now <ArrowRight className="w-3 h-3 ml-1" /></Link>
      </Button>
    </div>
  );
}
