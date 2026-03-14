
-- Create departments table
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, name)
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Users can view departments in their company
CREATE POLICY "Users can view own departments"
ON public.departments FOR SELECT TO authenticated
USING (company_id = get_user_company_id(auth.uid()));

-- Users can insert departments for their company
CREATE POLICY "Users can insert own departments"
ON public.departments FOR INSERT TO authenticated
WITH CHECK (company_id = get_user_company_id(auth.uid()));

-- Users can update departments in their company
CREATE POLICY "Users can update own departments"
ON public.departments FOR UPDATE TO authenticated
USING (company_id = get_user_company_id(auth.uid()));

-- Users can delete departments in their company
CREATE POLICY "Users can delete own departments"
ON public.departments FOR DELETE TO authenticated
USING (company_id = get_user_company_id(auth.uid()));
