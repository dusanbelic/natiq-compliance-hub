import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useEntity } from '@/contexts/EntityContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePermissions } from '@/hooks/use-permissions';
import { COUNTRY_FLAGS, MOCK_DASHBOARD_DATA } from '@/lib/mockData';
import {
  Home,
  BarChart3,
  TrendingUp,
  Lightbulb,
  Users,
  Radio,
  FileText,
  Settings,
  ChevronLeft,
  ChevronDown,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const NAV_ITEMS = [
  { icon: Home, label: 'Dashboard', path: '/dashboard', minRole: 'viewer' as const },
  { icon: BarChart3, label: 'Compliance Score', path: '/compliance', minRole: 'viewer' as const },
  { icon: TrendingUp, label: 'Forecast', path: '/forecast', minRole: 'viewer' as const },
  { icon: Lightbulb, label: 'Recommendations', path: '/recommendations', minRole: 'viewer' as const },
  { icon: Users, label: 'Employees', path: '/employees', minRole: 'viewer' as const },
  { icon: Radio, label: 'Regulatory Monitor', path: '/regulatory', minRole: 'viewer' as const },
  { icon: FileText, label: 'Reports', path: '/reports', minRole: 'viewer' as const },
  { icon: Settings, label: 'Settings', path: '/settings', minRole: 'hr_manager' as const },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { entities, selectedEntityId, setSelectedEntityId, selectedEntity } = useEntity();
  const { profile, signOut, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const { canViewSettings } = usePermissions();
  const [entityDropdownOpen, setEntityDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar text-sidebar-foreground transition-all duration-300 relative',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header with Logo */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-jetbrains font-bold text-sm">N</span>
            </div>
            <span className="text-white font-sora font-bold text-xl tracking-tight">NatIQ</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-jetbrains font-bold text-sm">N</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'absolute -right-3 top-4 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors',
            collapsed && 'rotate-180'
          )}
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Entity Selector */}
      <div className="p-3 border-b border-sidebar-border">
        <DropdownMenu open={entityDropdownOpen} onOpenChange={setEntityDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'w-full flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-left',
                collapsed && 'justify-center'
              )}
            >
              <span className="text-lg">{COUNTRY_FLAGS[selectedEntity.country]}</span>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedEntity.name}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-60" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {entities.map((entity) => {
              const data = MOCK_DASHBOARD_DATA[entity.id];
              const isAtRisk = data?.score.status === 'AT_RISK' || data?.score.status === 'NON_COMPLIANT';
              return (
                <DropdownMenuItem
                  key={entity.id}
                  onClick={() => {
                    setSelectedEntityId(entity.id);
                    setEntityDropdownOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-2 cursor-pointer',
                    selectedEntityId === entity.id && 'bg-accent'
                  )}
                >
                  <span className="text-lg">{COUNTRY_FLAGS[entity.country]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entity.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {data?.score.ratio.toFixed(1)}% · {data?.score.status}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      isAtRisk ? 'bg-amber' : 'bg-status-green'
                    )}
                  />
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-1">
          {NAV_ITEMS.filter(item => {
            if (item.path === '/settings' && !canViewSettings) return false;
            return true;
          }).map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  collapsed && 'justify-center px-2'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r" />
                )}
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="text-sm">{t(item.label)}</span>}
              </NavLink>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-2">

        {/* Help */}
        <button
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          <HelpCircle className="w-5 h-5" />
          {!collapsed && <span className="text-sm">{t('Help & Support')}</span>}
        </button>

        {/* User Profile */}
        <UserProfileBadge collapsed={collapsed} profile={profile} isDemoMode={isDemoMode} />

        {/* Sign Out */}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            'w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3 text-sm">{t('Sign Out')}</span>}
        </Button>
      </div>
    </aside>
  );
}
