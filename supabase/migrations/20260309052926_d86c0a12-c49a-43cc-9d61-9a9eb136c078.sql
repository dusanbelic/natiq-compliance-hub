
-- Update handle_new_user to assign new users to the demo company
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, language_pref, company_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'en',
    'c0000000-0000-0000-0000-000000000001'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'hr_manager');
  
  RETURN NEW;
END;
$function$;

-- Also update existing users who have no company assigned
UPDATE public.user_profiles 
SET company_id = 'c0000000-0000-0000-0000-000000000001' 
WHERE company_id IS NULL;
