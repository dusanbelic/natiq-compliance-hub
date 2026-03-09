import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { MOCK_NOTIFICATIONS, getRelativeTime } from '@/lib/mockData';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/use-supabase-data';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Radio, TrendingUp, CheckCircle } from 'lucide-react';
import type { NotificationType } from '@/types/database';

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

const TYPE_ICONS: Record<NotificationType, typeof AlertTriangle> = {
  COMPLIANCE_ALERT: AlertTriangle,
  REGULATORY_CHANGE: Radio,
  FORECAST_RISK: TrendingUp,
  SYSTEM: CheckCircle,
};

const TYPE_COLORS: Record<NotificationType, string> = {
  COMPLIANCE_ALERT: 'text-amber bg-amber-light',
  REGULATORY_CHANGE: 'text-primary bg-accent',
  FORECAST_RISK: 'text-amber bg-amber-light',
  SYSTEM: 'text-status-green bg-status-green-light',
};

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const navigate = useNavigate();
  const { isDemoMode } = useAuth();
  const { t, isRTL } = useLanguage();
  
  // Use real data if authenticated, mock data if demo mode
  const { data: liveNotifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications: NotificationItem[] = isDemoMode 
    ? MOCK_NOTIFICATIONS 
    : (liveNotifications || []).map(n => ({
        id: n.id,
        type: n.type as NotificationType,
        title: n.title,
        body: n.body,
        read: n.read ?? false,
        action_url: n.action_url,
        created_at: n.created_at ?? new Date().toISOString(),
      }));

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!isDemoMode && !notification.read) {
      markRead.mutate(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
      onClose();
    }
  };

  const handleMarkAllRead = () => {
    if (!isDemoMode) {
      markAllRead.mutate();
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side={isRTL ? 'left' : 'right'} className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-sora">{t('Notifications')}</SheetTitle>
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={handleMarkAllRead}>
              {t('Mark all read')}
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-4">
            {/* Unread Section */}
            {unreadNotifications.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {t('New')} ({unreadNotifications.length})
                </h3>
                <div className="space-y-2">
                  {unreadNotifications.map((notification) => {
                    const Icon = TYPE_ICONS[notification.type] || CheckCircle;
                    const colorClass = TYPE_COLORS[notification.type] || 'text-muted bg-muted';
                    return (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full text-left p-3 rounded-lg bg-card border border-border hover:shadow-sm transition-shadow"
                      >
                        <div className="flex gap-3">
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', colorClass)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-foreground">{notification.title}</p>
                              <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.body}</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">{getRelativeTime(notification.created_at)}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Read Section */}
            {readNotifications.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {t('Earlier')}
                </h3>
                <div className="space-y-2">
                  {readNotifications.map((notification) => {
                    const Icon = TYPE_ICONS[notification.type] || CheckCircle;
                    return (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-muted-foreground">{notification.title}</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">{getRelativeTime(notification.created_at)}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {notifications.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-status-green mx-auto mb-3" />
                <p className="text-sm font-medium">{t("You're all caught up!")}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('No new notifications')}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
