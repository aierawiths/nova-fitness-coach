
-- Function to increment login count
CREATE OR REPLACE FUNCTION public.increment_login_count(user_id_input UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET login_count = COALESCE(login_count, 0) + 1,
      last_login_at = now()
  WHERE id = user_id_input;
END;
$$;

-- Function to increment any profile counter
CREATE OR REPLACE FUNCTION public.increment_profile_counter(user_id_input UUID, counter_field TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF counter_field = 'total_workouts_generated' THEN
    UPDATE public.profiles SET total_workouts_generated = COALESCE(total_workouts_generated, 0) + 1 WHERE id = user_id_input;
  ELSIF counter_field = 'total_food_scans' THEN
    UPDATE public.profiles SET total_food_scans = COALESCE(total_food_scans, 0) + 1 WHERE id = user_id_input;
  ELSIF counter_field = 'total_diet_plans_generated' THEN
    UPDATE public.profiles SET total_diet_plans_generated = COALESCE(total_diet_plans_generated, 0) + 1 WHERE id = user_id_input;
  END IF;
END;
$$;
