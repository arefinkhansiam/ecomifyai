
-- ============ PROFILES additions ============
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS notify_on_scan BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_weekly_summary BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_product_tips BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS ar_slots_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_free_trial_growth BOOLEAN NOT NULL DEFAULT FALSE;

-- Sequence for signup numbering
CREATE SEQUENCE IF NOT EXISTS public.profile_sequence_seq START 1;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_sequence_number INTEGER;

-- Backfill seq numbers for existing users in created_at order
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE user_sequence_number IS NULL ORDER BY created_at ASC LOOP
    UPDATE public.profiles SET user_sequence_number = nextval('public.profile_sequence_seq') WHERE id = r.id;
  END LOOP;
END $$;

-- Backfill ar_slots_used from existing products count
UPDATE public.profiles p
SET ar_slots_used = COALESCE((SELECT COUNT(*) FROM public.ar_products ap WHERE ap.user_id = p.id), 0)
WHERE ar_slots_used = 0;

-- ============ AR_PRODUCTS additions ============
ALTER TABLE public.ar_products
  ADD COLUMN IF NOT EXISTS ar_customization JSONB NOT NULL DEFAULT '{}'::jsonb;

-- ============ PLAN LIMIT UPDATES ============
-- Update existing plans to new limits: free=1, starter=10, growth=50
UPDATE public.user_plans SET ar_product_limit = 1 WHERE plan = 'free';
UPDATE public.user_plans SET ar_product_limit = 10 WHERE plan = 'starter';
UPDATE public.user_plans SET ar_product_limit = 50 WHERE plan = 'growth';

-- ============ AR_SESSIONS table ============
CREATE TABLE IF NOT EXISTS public.ar_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.ar_products(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  ip_hash TEXT,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  camera_used TEXT,
  ar_mode TEXT,
  did_interact BOOLEAN NOT NULL DEFAULT FALSE,
  did_close_manually BOOLEAN NOT NULL DEFAULT FALSE,
  device_type TEXT,
  os_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ar_sessions_vendor ON public.ar_sessions(vendor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_product ON public.ar_sessions(product_id, created_at DESC);

GRANT SELECT ON public.ar_sessions TO authenticated;
GRANT ALL ON public.ar_sessions TO service_role;

ALTER TABLE public.ar_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors view own sessions" ON public.ar_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = vendor_id);

-- ============ SLOT ENFORCEMENT TRIGGER ============
CREATE OR REPLACE FUNCTION public.enforce_ar_slot_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_used INT;
  v_limit INT;
BEGIN
  SELECT ar_slots_used INTO v_used FROM public.profiles WHERE id = NEW.user_id;
  SELECT ar_product_limit INTO v_limit FROM public.user_plans WHERE user_id = NEW.user_id;
  IF v_used IS NULL THEN v_used := 0; END IF;
  IF v_limit IS NULL THEN v_limit := 1; END IF;
  IF v_used >= v_limit THEN
    RAISE EXCEPTION 'AR slot limit reached for your plan (% of %). Upgrade to create more.', v_used, v_limit
      USING ERRCODE = 'check_violation';
  END IF;
  UPDATE public.profiles SET ar_slots_used = ar_slots_used + 1 WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ar_products_slot_enforce ON public.ar_products;
CREATE TRIGGER ar_products_slot_enforce
BEFORE INSERT ON public.ar_products
FOR EACH ROW EXECUTE FUNCTION public.enforce_ar_slot_limit();

-- ============ UPDATE handle_new_user trigger ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seq INT;
  v_plan TEXT := 'free';
  v_limit INT := 1;
  v_free_growth BOOLEAN := FALSE;
BEGIN
  v_seq := nextval('public.profile_sequence_seq');
  IF v_seq <= 10 THEN
    v_plan := 'growth';
    v_limit := 50;
    v_free_growth := TRUE;
  END IF;

  INSERT INTO public.profiles (id, full_name, email, user_sequence_number, is_free_trial_growth)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, v_seq, v_free_growth)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_plans (user_id, plan, ar_product_limit)
  VALUES (NEW.id, v_plan, v_limit)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============ Dashboard stats fn update (add ar_slots_used) ============
CREATE OR REPLACE FUNCTION public.get_user_dashboard_stats(uid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result JSON;
BEGIN
  SELECT json_build_object(
    'total_products', (SELECT COUNT(*) FROM public.ar_products WHERE user_id = uid),
    'ready_products', (SELECT COUNT(*) FROM public.ar_products WHERE user_id = uid AND status = 'ready'),
    'total_views', (SELECT COALESCE(SUM(views_count),0) FROM public.ar_products WHERE user_id = uid),
    'total_embeds', (SELECT COALESCE(SUM(embed_count),0) FROM public.ar_products WHERE user_id = uid),
    'plan', (SELECT plan FROM public.user_plans WHERE user_id = uid),
    'plan_limit', (SELECT ar_product_limit FROM public.user_plans WHERE user_id = uid),
    'ar_slots_used', (SELECT ar_slots_used FROM public.profiles WHERE id = uid),
    'sessions_this_month', (SELECT COUNT(*) FROM public.ar_sessions WHERE vendor_id = uid AND created_at >= date_trunc('month', now()))
  ) INTO result;
  RETURN result;
END; $$;
