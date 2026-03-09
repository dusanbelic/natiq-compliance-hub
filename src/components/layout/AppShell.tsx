import { useState, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useEntity } from '@/contexts/EntityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_NOTIFICATIONS, COUNTRY_FLAGS, MOCK_DASHBOARD_DATA } from '@/lib/mockData';
import { useNotifications } from '@/hooks/use-supabase-data';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NotificationDrawer } from './NotificationDrawer';
import { MobileNav } from './MobileNav';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppShell() {
  const navigate = useNavigate();
  const { atRiskEntities } = useEntity();
  const { isDemoMode } = useAuth();
  const { isRTL, t } = useLanguage();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  // Real-time notifications subscription
  useRealtimeNotifications();

  // Use live notifications when authenticated, mock when in demo
  const { data: liveNotifications } = useNotifications();

  const unreadCount = useMemo(() => {
    if (isDemoMode) {
      return MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
    }
    return (liveNotifications || []).filter((n) => !n.read).length;
  }, [isDemoMode, liveNotifications]);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className={cn('flex flex-col h-screen overflow-hidden', isRTL && 'flex-row-reverse')}>
      {/* Alert Banner for At-Risk Entities */}
      {atRiskEntities.map((entity) => {
        const data = MOCK_DASHBOARD_DATA[entity.id];
        if (!data) return null;

        const isNonCompliant = data.score.status === 'NON_COMPLIANT';
        return (
          <div
            key={entity.id}
            className={cn(
              'flex items-center justify-between px-4 py-2 text-sm',
              isNonCompliant
                ? 'bg-status-red-light text-status-red'
                : 'bg-amber-light text-amber'
            )}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>
                <strong>{COUNTRY_FLAGS[entity.country]} {entity.name}</strong>
                {' '}is below minimum compliance ({data.score.ratio.toFixed(1)}% / {data.score.target.toFixed(1)}% required).
              </span>
            </div>
            <Button
              variant="link"
              size="sm"
              className={cn(
                'h-auto p-0 font-semibold',
                isNonCompliant ? 'text-status-red' : 'text-amber'
              )}
              onClick={() => navigate('/recommendations')}
            >
              {t('View Recommendations')} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        );
      })}

      {/* Main Layout */}
      <div className={cn('flex flex-1 overflow-hidden', isRTL && 'flex-row-reverse')}>
        {/* Sidebar - Desktop only */}
        <div className="hidden lg:block">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
            onNotificationClick={() => setNotificationDrawerOpen(true)}
            unreadCount={unreadCount}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header
            onMenuClick={toggleSidebar}
            onNotificationClick={() => setNotificationDrawerOpen(true)}
            unreadCount={unreadCount}
          />

          <main className="flex-1 overflow-y-auto bg-background pb-20 lg:pb-0">
            <div className="max-w-[1280px] mx-auto p-4 lg:p-6">
              <div className="page-enter">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />

      {/* Notification Drawer */}
      <NotificationDrawer
        open={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
      />
    </div>
  );
}
