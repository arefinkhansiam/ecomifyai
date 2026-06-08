
-- 1. Realtime authorization: restrict subscriptions to per-user channel
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can subscribe to own ar_products channel" ON realtime.messages;
CREATE POLICY "Users can subscribe to own ar_products channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (realtime.topic() = ('ar_products:' || auth.uid()::text))
);

-- 2. Storage policies — product-images UPDATE, qr-codes UPDATE/DELETE
DROP POLICY IF EXISTS "Users update own product images" ON storage.objects;
CREATE POLICY "Users update own product images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users update own qr" ON storage.objects;
CREATE POLICY "Users update own qr"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'qr-codes' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'qr-codes' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users delete own qr" ON storage.objects;
CREATE POLICY "Users delete own qr"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'qr-codes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. SECURITY DEFINER functions: lock down EXECUTE
-- increment_view_by_token: only called by server (admin); revoke from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.increment_view_by_token(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_view_by_token(text) TO service_role;

-- increment_ar_views: unused on client; restrict
REVOKE EXECUTE ON FUNCTION public.increment_ar_views(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_ar_views(uuid, text, text) TO service_role;

-- get_user_dashboard_stats: called by authenticated clients only
REVOKE EXECUTE ON FUNCTION public.get_user_dashboard_stats(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_dashboard_stats(uuid) TO authenticated;

-- Trigger functions: not callable from the API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_ar_slot_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- 4. Function search_path: set on touch_updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$function$;

-- 5. Tighten overly-permissive RLS: ar_views INSERT should require product to exist & be public
DROP POLICY IF EXISTS "Anyone insert view" ON public.ar_views;
CREATE POLICY "Anyone insert view"
ON public.ar_views FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ar_products p
    WHERE p.id = ar_views.product_id AND p.is_public = true AND p.status = 'ready'
  )
);
