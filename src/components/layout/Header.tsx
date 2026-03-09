import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useEntity } from '@/contexts/EntityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { COUNTRY_FLAGS } from '@/lib/mockData';
import { Globe, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onMenuClick: () => void;
  onNotificationClick: () => void;
  unreadCount: number;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/compliance': 'Compliance Score',
  '/forecast': 'Forecast',
  '/recommendations': 'Recommendations',
  '/employees': 'Employees',
  '/regulatory': 'Regulatory Monitor',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/onboarding': 'Get Started',
};

export function Header({ onMenuClick, onNotificationClick, unreadCount }: HeaderProps) {
  const location = useLocation();
  const { selectedEntity } = useEntity();
  const { language, toggleLanguage, t } = useLanguage();
  const { profile } = useAuth();

  // Get page title from path
  const pathKey = Object.keys(PAGE_TITLES).find(
    (key) => location.pathname === key || location.pathname.startsWith(key + '/')
  );
  const pageTitle = pathKey ? PAGE_TITLES[pathKey] : 'NatIQ';

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      {/* Left: Page Title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="font-sora font-semibold text-lg text-foreground">
          {t(pageTitle)}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />
        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="flex items-center gap-2"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">
            {language === 'en' ? 'EN' : 'عربي'}
          </span>
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onNotificationClick}
          className="relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount}
            </span>
          )}
        </Button>

        {/* Entity Pill */}
        <div className="hidden md:flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1 rounded-full">
          <span>{COUNTRY_FLAGS[selectedEntity.country]}</span>
          <span className="text-xs font-medium truncate max-w-32">
            {selectedEntity.name}
          </span>
        </div>

        {/* User Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-secondary-foreground text-sm font-medium">
                {profile?.full_name?.charAt(0) || 'U'}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5 border-b border-border">
              <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {profile?.role?.replace('_', ' ') || 'Manager'}
              </p>
            </div>
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Account Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
