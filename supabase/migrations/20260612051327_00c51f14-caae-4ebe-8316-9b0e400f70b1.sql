
-- 1. Hide embed_token from anon (column-level revoke)
REVOKE SELECT (embed_token) ON public.ar_products FROM anon;

-- 2. product_variants: also require status='ready'
DROP POLICY IF EXISTS "public can read variants of public products" ON public.product_variants;
CREATE POLICY "public can read variants of public products" ON public.product_variants
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ar_products p
    WHERE p.id = product_variants.product_id
      AND p.is_public = true
      AND p.status = 'ready'
  ));

-- 3. tryon_feedback: also require status='ready'
DROP POLICY IF EXISTS "anyone can insert feedback for public product" ON public.tryon_feedback;
CREATE POLICY "anyone can insert feedback for public product" ON public.tryon_feedback
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.ar_products p
    WHERE p.id = tryon_feedback.product_id
      AND p.is_public = true
      AND p.status = 'ready'
  ));

-- 4. user_plans: prevent users from self-editing billing-sensitive fields
DROP POLICY IF EXISTS "Users update own plan" ON public.user_plans;
-- (No replacement policy: all plan/billing changes must go through service_role server flow.)
