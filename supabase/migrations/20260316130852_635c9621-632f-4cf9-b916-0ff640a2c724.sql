-- Create salary_bands table mirroring departments
CREATE TABLE public.salary_bands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, name)
);

-- Enable RLS
ALTER TABLE public.salary_bands ENABLE ROW LEVEL SECURITY;

-- RLS policies mirroring departments
CREATE POLICY "Users can view own salary bands" ON public.salary_bands
  FOR SELECT TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert own salary bands" ON public.salary_bands
  FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update own salary bands" ON public.salary_bands
  FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete own salary bands" ON public.salary_bands
  FOR DELETE TO authenticated
  USING (company_id = get_user_company_id(auth.uid()));

-- Seed default bands for demo company
INSERT INTO public.salary_bands (name, company_id) VALUES
  ('Junior', 'c0000000-0000-0000-0000-000000000001'),
  ('Mid', 'c0000000-0000-0000-0000-000000000001'),
  ('Senior', 'c0000000-0000-0000-0000-000000000001'),
  ('Management', 'c0000000-0000-0000-0000-000000000001'),
  ('Executive', 'c0000000-0000-0000-0000-000000000001');