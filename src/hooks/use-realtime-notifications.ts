import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useRealtimeNotifications() {
  const { user, isDemoMode } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isDemoMode || !user) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Refresh notifications query
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          
          // Show toast for new notification
          const notification = payload.new as any;
          toast(notification.title, {
            description: notification.body?.substring(0, 80),
            action: notification.action_url ? {
              label: 'View',
              onClick: () => window.location.href = notification.action_url,
            } : undefined,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isDemoMode, queryClient]);
}
