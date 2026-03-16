CREATE TABLE public.design_partner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  work_email text NOT NULL UNIQUE,
  company_name text NOT NULL,
  job_title text,
  countries text[],
  headcount_band text,
  biggest_challenge text,
  referral_source text,
  status text NOT NULL DEFAULT 'pending',
  internal_notes text,
  applied_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.design_partner_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can apply" ON public.design_partner_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);