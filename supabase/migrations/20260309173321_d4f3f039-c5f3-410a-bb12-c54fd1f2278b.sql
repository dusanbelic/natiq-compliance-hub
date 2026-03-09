
-- Report schedules table
CREATE TABLE public.report_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  frequency text NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('weekly', 'monthly')),
  recipients text[] NOT NULL DEFAULT '{}',
  report_types text[] NOT NULL DEFAULT '{"compliance"}',
  last_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_id, user_id)
);

ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own schedules"
  ON public.report_schedules FOR SELECT TO authenticated
  USING (entity_id IN (
    SELECT id FROM public.entities WHERE company_id = get_user_company_id(auth.uid())
  ));

CREATE POLICY "Users can insert own schedules"
  ON public.report_schedules FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    entity_id IN (SELECT id FROM public.entities WHERE company_id = get_user_company_id(auth.uid()))
  );

CREATE POLICY "Users can update own schedules"
  ON public.report_schedules FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own schedules"
  ON public.report_schedules FOR DELETE TO authenticated
  USING (user_id = auth.uid());
