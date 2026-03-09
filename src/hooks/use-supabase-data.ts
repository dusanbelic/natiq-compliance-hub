import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Employee, Notification } from '@/types/database';
import type { Tables } from '@/integrations/supabase/types';

// ─── Employees ──────────────────────────────────────────────────────────────

export function useEmployees(entityId: string) {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['employees', entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('entity_id', entityId)
        .order('full_name');
      if (error) throw error;
      return data as Tables<'employees'>[];
    },
    enabled: !isDemoMode && !!entityId,
  });
}

export function useAddEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employee: Omit<Tables<'employees'>, 'id' | 'created_at'> & { id?: string }) => {
      const { data, error } = await supabase
        .from('employees')
        .insert(employee as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees', variables.entity_id] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Tables<'employees'>> & { id: string }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

// ─── Entities ───────────────────────────────────────────────────────────────

export function useEntities() {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['entities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Tables<'entities'>[];
    },
    enabled: !isDemoMode,
  });
}

// ─── Compliance Rules ───────────────────────────────────────────────────────

export function useComplianceRules() {
  return useQuery({
    queryKey: ['compliance_rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_rules')
        .select('*')
        .order('country');
      if (error) throw error;
      return data as Tables<'compliance_rules'>[];
    },
  });
}

// ─── Compliance Scores ──────────────────────────────────────────────────────

export function useComplianceScores(entityId: string) {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['compliance_scores', entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_scores')
        .select('*')
        .eq('entity_id', entityId)
        .order('calculated_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0] as Tables<'compliance_scores'> | undefined;
    },
    enabled: !isDemoMode && !!entityId,
  });
}

// ─── Recommendations ────────────────────────────────────────────────────────

export function useRecommendations(entityId: string) {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['recommendations', entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('entity_id', entityId)
        .order('priority');
      if (error) throw error;
      return data as Tables<'recommendations'>[];
    },
    enabled: !isDemoMode && !!entityId,
  });
}

export function useUpdateRecommendationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('recommendations')
        .update({ status: status as any })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}

// ─── Regulatory Changes ─────────────────────────────────────────────────────

export function useRegulatoryChanges() {
  return useQuery({
    queryKey: ['regulatory_changes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regulatory_changes')
        .select('*')
        .order('detected_at', { ascending: false });
      if (error) throw error;
      return data as Tables<'regulatory_changes'>[];
    },
  });
}

// ─── Forecasts ──────────────────────────────────────────────────────────────

export function useForecasts(entityId: string) {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['forecasts', entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forecasts')
        .select('*')
        .eq('entity_id', entityId)
        .order('generated_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0] as Tables<'forecasts'> | undefined;
    },
    enabled: !isDemoMode && !!entityId,
  });
}

// ─── Notifications ──────────────────────────────────────────────────────────

export function useNotifications() {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Tables<'notifications'>[];
    },
    enabled: !isDemoMode,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ─── User Profile ───────────────────────────────────────────────────────────

export function useUserProfile() {
  const { isDemoMode, user } = useAuth();

  return useQuery({
    queryKey: ['user_profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data as Tables<'user_profiles'>;
    },
    enabled: !isDemoMode && !!user?.id,
  });
}

// ─── Company ────────────────────────────────────────────────────────────────

export function useCompany() {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['company'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .limit(1)
        .single();
      if (error) throw error;
      return data as Tables<'companies'>;
    },
    enabled: !isDemoMode,
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Tables<'companies'>> & { id: string }) => {
      const { error } = await supabase
        .from('companies')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
    },
  });
}

// ─── Update User Profile ────────────────────────────────────────────────────

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; full_name?: string; language_pref?: string; notification_email?: boolean; notification_in_app?: boolean }) => {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user_profile', variables.id] });
    },
  });
}

// ─── Team Members ───────────────────────────────────────────────────────────

export function useTeamMembers() {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['team_members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, company_id, created_at')
        .order('created_at');
      if (error) throw error;
      return data as Array<{ id: string; full_name: string | null; company_id: string | null; created_at: string | null }>;
    },
    enabled: !isDemoMode,
  });
}

export function useTeamMemberRoles(userIds: string[]) {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['team_member_roles', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return [];
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);
      if (error) throw error;
      return data as Array<{ user_id: string; role: string }>;
    },
    enabled: !isDemoMode && userIds.length > 0,
  });
}

// ─── Audit Logs ─────────────────────────────────────────────────────────────
// Note: audit_logs table is created via migration and triggers are set up

export interface AuditLog {
  id: string;
  entity_id: string | null;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

export function useAuditLogs(entityId?: string) {
  const { isDemoMode } = useAuth();

  return useQuery({
    queryKey: ['audit_logs', entityId],
    queryFn: async (): Promise<AuditLog[]> => {
      // Since audit_logs isn't in the generated types yet, we use fetch
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/audit_logs?select=*&order=created_at.desc&limit=100${entityId ? `&entity_id=eq.${entityId}` : ''}`;
      const res = await fetch(url, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      if (!res.ok) return [];
      return (await res.json()) as AuditLog[];
    },
    enabled: !isDemoMode,
  });
}
