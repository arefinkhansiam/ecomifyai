DROP POLICY IF EXISTS "Public view ready products" ON public.ar_products;
CREATE POLICY "Public view ready products" ON public.ar_products
  FOR SELECT TO anon
  USING (status = 'ready' AND is_public = true);
REVOKE SELECT (embed_token) ON public.ar_products FROM anon;