import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, BarChart3, Users, FileText, MoreHorizontal, TrendingUp, Lightbulb, Radio, Settings } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PRIMARY_ITEMS = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/compliance', icon: BarChart3, label: 'Score' },
  { to: '/employees', icon: Users, label: 'Team' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];

const MORE_ITEMS = [
  { to: '/forecast', icon: TrendingUp, label: 'Forecast' },
  { to: '/recommendations', icon: Lightbulb, label: 'Actions' },
  { to: '/regulatory', icon: Radio, label: 'Regulatory' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = MORE_ITEMS.some(item => location.pathname === item.to || location.pathname.startsWith(item.to + '/'));

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-40 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {PRIMARY_ITEMS.map(({ to, icon: Icon, label }) => {
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
        {/* More menu */}
        <DropdownMenu open={moreOpen} onOpenChange={setMoreOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors',
                isMoreActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="mb-2">
            {MORE_ITEMS.map(({ to, icon: Icon, label }) => (
              <DropdownMenuItem key={to} asChild>
                <NavLink to={to} className="flex items-center gap-2" onClick={() => setMoreOpen(false)}>
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
