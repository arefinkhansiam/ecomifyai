
CREATE OR REPLACE FUNCTION public.get_user_dashboard_stats(uid uuid DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  result JSON;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;
  SELECT json_build_object(
    'total_products', (SELECT COUNT(*) FROM public.ar_products WHERE user_id = v_uid),
    'ready_products', (SELECT COUNT(*) FROM public.ar_products WHERE user_id = v_uid AND status = 'ready'),
    'total_views', (SELECT COALESCE(SUM(views_count),0) FROM public.ar_products WHERE user_id = v_uid),
    'total_embeds', (SELECT COALESCE(SUM(embed_count),0) FROM public.ar_products WHERE user_id = v_uid),
    'plan', (SELECT plan FROM public.user_plans WHERE user_id = v_uid),
    'plan_limit', (SELECT ar_product_limit FROM public.user_plans WHERE user_id = v_uid),
    'ar_slots_used', (SELECT ar_slots_used FROM public.profiles WHERE id = v_uid),
    'sessions_this_month', (SELECT COUNT(*) FROM public.ar_sessions WHERE vendor_id = v_uid AND created_at >= date_trunc('month', now()))
  ) INTO result;
  RETURN result;
END;
$function$;
