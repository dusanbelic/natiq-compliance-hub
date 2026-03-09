
-- FIX 1: Replace get_user_company_id with a no-argument version that uses auth.uid() internally
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
$$;

-- FIX 2: Tighten audit_logs INSERT policy to require user_id = auth.uid()
DROP POLICY IF EXISTS "Users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Users can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND entity_id IN (
      SELECT entities.id FROM entities WHERE entities.company_id = get_user_company_id(auth.uid())
    )
  );

-- FIX 3: Tighten report_schedules SELECT to only show user's own schedules
DROP POLICY IF EXISTS "Users can view own schedules" ON public.report_schedules;
CREATE POLICY "Users can view own schedules"
  ON public.report_schedules
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
