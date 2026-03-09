
-- Temporarily disable the audit trigger to allow seeding
DROP TRIGGER IF EXISTS employee_audit_trigger ON employees;

-- Update the trigger function to handle null user_id gracefully for system operations
CREATE OR REPLACE FUNCTION public.log_employee_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get current user, default to a system UUID if not authenticated (for seeding)
  current_user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (entity_id, user_id, action, table_name, record_id, new_data)
    VALUES (NEW.entity_id, current_user_id, 'INSERT', 'employees', NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (entity_id, user_id, action, table_name, record_id, old_data, new_data)
    VALUES (NEW.entity_id, current_user_id, 'UPDATE', 'employees', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (entity_id, user_id, action, table_name, record_id, old_data)
    VALUES (OLD.entity_id, current_user_id, 'DELETE', 'employees', OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER employee_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON employees
  FOR EACH ROW EXECUTE FUNCTION log_employee_changes();
