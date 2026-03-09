-- Notification trigger function for compliance breaches
CREATE OR REPLACE FUNCTION public.notify_compliance_breach()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_entity_name text;
  v_target numeric;
  v_user record;
BEGIN
  IF NEW.status NOT IN ('NON_COMPLIANT', 'AT_RISK') THEN
    RETURN NEW;
  END IF;

  SELECT name INTO v_entity_name FROM public.entities WHERE id = NEW.entity_id;

  SELECT target_percentage INTO v_target
  FROM public.compliance_rules WHERE id = NEW.rule_id;
  IF v_target IS NULL THEN v_target := 10; END IF;

  FOR v_user IN
    SELECT up.id as user_id
    FROM public.user_profiles up
    JOIN public.entities e ON e.company_id = up.company_id
    WHERE e.id = NEW.entity_id AND up.notification_in_app = true
  LOOP
    INSERT INTO public.notifications (user_id, type, title, body, action_url)
    VALUES (
      v_user.user_id,
      CASE WHEN NEW.status = 'NON_COMPLIANT' THEN 'COMPLIANCE_ALERT'::notification_type ELSE 'FORECAST_RISK'::notification_type END,
      CASE WHEN NEW.status = 'NON_COMPLIANT'
        THEN v_entity_name || ' is Non-Compliant'
        ELSE v_entity_name || ' is At Risk'
      END,
      v_entity_name || ' compliance ratio is ' || round(NEW.ratio, 1) || '% (target: ' || v_target || '%). Action recommended.',
      '/compliance'
    );
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_compliance_breach
  AFTER INSERT ON public.compliance_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_compliance_breach();

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
