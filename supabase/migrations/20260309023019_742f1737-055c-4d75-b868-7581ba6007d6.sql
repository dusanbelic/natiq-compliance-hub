
-- Enums
CREATE TYPE public.plan_type AS ENUM ('starter','growth','scale','enterprise');
CREATE TYPE public.country_code AS ENUM ('SA','AE','QA','OM');
CREATE TYPE public.contract_type AS ENUM ('full_time','part_time','contract','intern');
CREATE TYPE public.compliance_status AS ENUM ('COMPLIANT','AT_RISK','NON_COMPLIANT','UNKNOWN');
CREATE TYPE public.compliance_band AS ENUM ('PLATINUM','GREEN_HIGH','GREEN_LOW','GREEN','YELLOW','RED');
CREATE TYPE public.priority_level AS ENUM ('CRITICAL','IMPORTANT','OPTIONAL');
CREATE TYPE public.effort_level AS ENUM ('LOW','MEDIUM','HIGH');
CREATE TYPE public.recommendation_status AS ENUM ('OPEN','IN_PROGRESS','DONE','DISMISSED');
CREATE TYPE public.impact_level AS ENUM ('HIGH','MEDIUM','LOW');
CREATE TYPE public.confidence_level AS ENUM ('HIGH','MEDIUM','LOW');
CREATE TYPE public.change_type AS ENUM ('TARGET_INCREASE','NEW_REGULATION','FINE_CHANGE','SECTOR_RECLASSIFICATION');
CREATE TYPE public.notification_type AS ENUM ('COMPLIANCE_ALERT','REGULATORY_CHANGE','FORECAST_RISK','SYSTEM');

-- Companies
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  plan public.plan_type DEFAULT 'starter',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Entities
CREATE TABLE public.entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  country public.country_code NOT NULL,
  legal_type TEXT,
  registration_number TEXT,
  industry_sector TEXT,
  employee_count_band TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

-- User Profiles
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id),
  full_name TEXT,
  language_pref TEXT DEFAULT 'en',
  notification_email BOOLEAN DEFAULT true,
  notification_in_app BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- User Roles (separate table per security best practices)
CREATE TYPE public.app_role AS ENUM ('admin','hr_director','hr_manager','cfo','viewer');
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: get user's company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.user_profiles WHERE id = _user_id
$$;

-- Employees
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  nationality TEXT NOT NULL,
  is_national BOOLEAN DEFAULT false,
  job_title TEXT,
  department TEXT,
  contract_type public.contract_type DEFAULT 'full_time',
  counts_toward_quota BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  salary_band TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Compliance Rules (public read)
CREATE TABLE public.compliance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country public.country_code NOT NULL,
  program_name TEXT NOT NULL,
  industry_sector TEXT,
  company_size_min INT,
  company_size_max INT,
  target_percentage NUMERIC(5,2) NOT NULL,
  band_green_min NUMERIC(5,2),
  band_platinum_min NUMERIC(5,2),
  band_yellow_min NUMERIC(5,2),
  effective_from DATE NOT NULL,
  effective_to DATE,
  source_url TEXT,
  notes TEXT
);
ALTER TABLE public.compliance_rules ENABLE ROW LEVEL SECURITY;

-- Compliance Scores
CREATE TABLE public.compliance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  rule_id UUID REFERENCES public.compliance_rules(id),
  calculated_at TIMESTAMPTZ DEFAULT now(),
  national_count INT NOT NULL,
  total_count INT NOT NULL,
  ratio NUMERIC(5,2) NOT NULL DEFAULT 0,
  band public.compliance_band,
  status public.compliance_status DEFAULT 'UNKNOWN'
);
ALTER TABLE public.compliance_scores ENABLE ROW LEVEL SECURITY;

-- Forecasts
CREATE TABLE public.forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  horizon_days INT NOT NULL DEFAULT 90,
  projected_ratio_30d NUMERIC(5,2),
  projected_ratio_60d NUMERIC(5,2),
  projected_ratio_90d NUMERIC(5,2),
  risk_date DATE,
  confidence public.confidence_level,
  scenario_inputs JSONB
);
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;

-- Recommendations
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
  priority public.priority_level,
  title TEXT NOT NULL,
  description TEXT,
  impact_score INT,
  effort_level public.effort_level,
  compliance_gain NUMERIC(5,2),
  action_type TEXT,
  status public.recommendation_status DEFAULT 'OPEN',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- Regulatory Changes (public read)
CREATE TABLE public.regulatory_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country public.country_code NOT NULL,
  program TEXT NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT now(),
  effective_date DATE,
  headline TEXT NOT NULL,
  summary TEXT,
  impact_level public.impact_level,
  source_url TEXT,
  affects_sectors TEXT[],
  change_type public.change_type
);
ALTER TABLE public.regulatory_changes ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ═══ RLS POLICIES ═══

-- Companies: users can only see their own company
CREATE POLICY "Users can view own company" ON public.companies
  FOR SELECT TO authenticated
  USING (id = public.get_user_company_id(auth.uid()));

-- Entities: users can CRUD entities in their company
CREATE POLICY "Users can view own entities" ON public.entities
  FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert own entities" ON public.entities
  FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

-- User Profiles: users can view/update own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- User Roles: users can view own roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Employees: access via entity's company
CREATE POLICY "Users can view own employees" ON public.employees
  FOR SELECT TO authenticated
  USING (entity_id IN (SELECT id FROM public.entities WHERE company_id = public.get_user_company_id(auth.uid())));

CREATE POLICY "Users can insert employees" ON public.employees
  FOR INSERT TO authenticated
  WITH CHECK (entity_id IN (SELECT id FROM public.entities WHERE company_id = public.get_user_company_id(auth.uid())));

CREATE POLICY "Users can update employees" ON public.employees
  FOR UPDATE TO authenticated
  USING (entity_id IN (SELECT id FROM public.entities WHERE company_id = public.get_user_company_id(auth.uid())));

CREATE POLICY "Users can delete employees" ON public.employees
  FOR DELETE TO authenticated
  USING (entity_id IN (SELECT id FROM public.entities WHERE company_id = public.get_user_company_id(auth.uid())));

-- Compliance Rules: public read for all authenticated users
CREATE POLICY "Anyone can read compliance rules" ON public.compliance_rules
  FOR SELECT TO authenticated
  USING (true);

-- Compliance Scores: via entity
CREATE POLICY "Users can view own scores" ON public.compliance_scores
  FOR SELECT TO authenticated
  USING (entity_id IN (SELECT id FROM public.entities WHERE company_id = public.get_user_company_id(auth.uid())));

-- Forecasts: via entity
CREATE POLICY "Users can view own forecasts" ON public.forecasts
  FOR SELECT TO authenticated
  USING (entity_id IN (SELECT id FROM public.entities WHERE company_id = public.get_user_company_id(auth.uid())));

-- Recommendations: via entity
CREATE POLICY "Users can view own recommendations" ON public.recommendations
  FOR SELECT TO authenticated
  USING (entity_id IN (SELECT id FROM public.entities WHERE company_id = public.get_user_company_id(auth.uid())));

CREATE POLICY "Users can update own recommendations" ON public.recommendations
  FOR UPDATE TO authenticated
  USING (entity_id IN (SELECT id FROM public.entities WHERE company_id = public.get_user_company_id(auth.uid())));

-- Regulatory Changes: public read
CREATE POLICY "Anyone can read regulatory changes" ON public.regulatory_changes
  FOR SELECT TO authenticated
  USING (true);

-- Notifications: own only
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- ═══ AUTO-CREATE PROFILE ON SIGNUP ═══
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, language_pref)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'en');
  
  -- Default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'hr_manager');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
