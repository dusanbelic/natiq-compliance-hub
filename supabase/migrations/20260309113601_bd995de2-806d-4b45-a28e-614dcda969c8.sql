
-- Function to recalculate compliance scores when employees change
CREATE OR REPLACE FUNCTION public.recalculate_compliance_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_entity_id uuid;
  v_national_count integer;
  v_total_count integer;
  v_ratio numeric;
  v_target numeric;
  v_band compliance_band;
  v_status compliance_status;
  v_country country_code;
  v_rule_id uuid;
BEGIN
  -- Determine the entity_id from the employee record
  IF TG_OP = 'DELETE' THEN
    v_entity_id := OLD.entity_id;
  ELSE
    v_entity_id := NEW.entity_id;
  END IF;

  -- Count qualifying employees
  SELECT 
    COALESCE(SUM(CASE WHEN is_national = true THEN 1 ELSE 0 END), 0),
    COALESCE(COUNT(*), 0)
  INTO v_national_count, v_total_count
  FROM public.employees
  WHERE entity_id = v_entity_id
    AND counts_toward_quota = true;

  -- Calculate ratio
  IF v_total_count > 0 THEN
    v_ratio := (v_national_count::numeric / v_total_count::numeric) * 100;
  ELSE
    v_ratio := 0;
  END IF;

  -- Get entity country
  SELECT country INTO v_country FROM public.entities WHERE id = v_entity_id;

  -- Find matching compliance rule
  SELECT id, target_percentage, band_green_min, band_platinum_min, band_yellow_min
  INTO v_rule_id, v_target
  FROM public.compliance_rules
  WHERE country = v_country
    AND effective_from <= CURRENT_DATE
    AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
  ORDER BY effective_from DESC
  LIMIT 1;

  -- Default target if no rule found
  IF v_target IS NULL THEN
    v_target := CASE v_country
      WHEN 'SA' THEN 15
      WHEN 'AE' THEN 10
      WHEN 'QA' THEN 10
      WHEN 'OM' THEN 10
      ELSE 10
    END;
  END IF;

  -- Determine band and status
  IF v_ratio >= v_target * 1.5 THEN
    v_band := 'PLATINUM';
    v_status := 'COMPLIANT';
  ELSIF v_ratio >= v_target THEN
    v_band := 'GREEN';
    v_status := 'COMPLIANT';
  ELSIF v_ratio >= v_target * 0.8 THEN
    v_band := 'YELLOW';
    v_status := 'AT_RISK';
  ELSE
    v_band := 'RED';
    v_status := 'NON_COMPLIANT';
  END IF;

  -- Upsert the compliance score
  INSERT INTO public.compliance_scores (entity_id, rule_id, national_count, total_count, ratio, band, status, calculated_at)
  VALUES (v_entity_id, v_rule_id, v_national_count, v_total_count, v_ratio, v_band, v_status, now())
  ON CONFLICT (id) DO NOTHING;

  -- Also just insert a new row (latest score wins)
  -- Delete old scores for this entity to keep it clean (keep last 12)
  DELETE FROM public.compliance_scores
  WHERE entity_id = v_entity_id
    AND id NOT IN (
      SELECT id FROM public.compliance_scores
      WHERE entity_id = v_entity_id
      ORDER BY calculated_at DESC
      LIMIT 12
    );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create trigger on employees table
DROP TRIGGER IF EXISTS trg_recalculate_compliance ON public.employees;
CREATE TRIGGER trg_recalculate_compliance
  AFTER INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_compliance_score();
