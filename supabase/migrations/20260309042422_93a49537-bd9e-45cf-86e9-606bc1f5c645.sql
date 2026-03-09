-- Create audit_logs table for tracking changes
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view audit logs for their company's entities
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    entity_id IN (
      SELECT id FROM public.entities WHERE company_id = get_user_company_id(auth.uid())
    )
  );

-- Policy: Users can insert audit logs for their company's entities
CREATE POLICY "Users can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    entity_id IN (
      SELECT id FROM public.entities WHERE company_id = get_user_company_id(auth.uid())
    )
  );

-- Create trigger function for employee changes
CREATE OR REPLACE FUNCTION public.log_employee_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (entity_id, user_id, action, table_name, record_id, new_data)
    VALUES (NEW.entity_id, auth.uid(), 'INSERT', 'employees', NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (entity_id, user_id, action, table_name, record_id, old_data, new_data)
    VALUES (NEW.entity_id, auth.uid(), 'UPDATE', 'employees', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (entity_id, user_id, action, table_name, record_id, old_data)
    VALUES (OLD.entity_id, auth.uid(), 'DELETE', 'employees', OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for employees table
DROP TRIGGER IF EXISTS employee_audit_trigger ON public.employees;
CREATE TRIGGER employee_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.log_employee_changes();

-- Index for faster lookups
CREATE INDEX idx_audit_logs_entity_id ON public.audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);