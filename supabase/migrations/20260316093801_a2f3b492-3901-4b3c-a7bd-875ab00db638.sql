
-- Demo feedback table
CREATE TABLE public.demo_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_source text,
  challenge_text text,
  would_use text,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.demo_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (public demo)
CREATE POLICY "Anyone can submit demo feedback"
  ON public.demo_feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Resource subscribers table
CREATE TABLE public.resource_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  source text,
  subscribed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resource_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe
CREATE POLICY "Anyone can subscribe"
  ON public.resource_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
