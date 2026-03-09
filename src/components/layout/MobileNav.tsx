import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, BarChart3, TrendingUp, Lightbulb, Users, Settings, FileText, Radio } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/compliance', icon: BarChart3, label: 'Score' },
  { to: '/forecast', icon: TrendingUp, label: 'Forecast' },
  { to: '/recommendations', icon: Lightbulb, label: 'Actions' },
  { to: '/employees', icon: Users, label: 'Team' },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-40 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
