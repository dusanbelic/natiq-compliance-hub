import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ReportSchedule {
  id: string;
  entity_id: string;
  user_id: string;
  enabled: boolean;
  frequency: 'weekly' | 'monthly';
  recipients: string[];
  report_types: string[];
  last_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useReportSchedule(entityId: string) {
  const { isDemoMode, user } = useAuth();

  return useQuery({
    queryKey: ['report_schedule', entityId],
    queryFn: async (): Promise<ReportSchedule | null> => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/report_schedules?select=*&entity_id=eq.${entityId}&user_id=eq.${user!.id}&limit=1`;
      const res = await fetch(url, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      if (!res.ok) return null;
      const rows = await res.json();
      return rows[0] ?? null;
    },
    enabled: !isDemoMode && !!entityId && !!user?.id,
  });
}

export function useUpsertReportSchedule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (schedule: {
      entity_id: string;
      enabled: boolean;
      frequency: string;
      recipients: string[];
    }) => {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/report_schedules`;

      // Try upsert via POST with on_conflict
      const res = await fetch(`${url}?on_conflict=entity_id,user_id`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify({
          entity_id: schedule.entity_id,
          user_id: user!.id,
          enabled: schedule.enabled,
          frequency: schedule.frequency,
          recipients: schedule.recipients,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report_schedule', variables.entity_id] });
    },
  });
}
