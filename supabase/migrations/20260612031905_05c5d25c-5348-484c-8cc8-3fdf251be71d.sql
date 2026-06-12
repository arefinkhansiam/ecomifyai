
-- Tighten public read policies to only expose data tied to public, ready products

-- product_alternatives: only when both source and alt are public+ready
DROP POLICY IF EXISTS "public can read alternatives" ON public.product_alternatives;
CREATE POLICY "public can read alternatives of public products"
ON public.product_alternatives
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (SELECT 1 FROM public.ar_products p
          WHERE p.id = product_alternatives.product_id
            AND p.is_public = true AND p.status = 'ready')
  AND EXISTS (SELECT 1 FROM public.ar_products a
              WHERE a.id = product_alternatives.alt_product_id
                AND a.is_public = true AND a.status = 'ready')
);

-- product_categories: remove anon read (not used by any public UI; owners still manage via authenticated policies)
DROP POLICY IF EXISTS "public can read categories" ON public.product_categories;

-- tryon_branding: only branding of vendors with at least one public, ready product
DROP POLICY IF EXISTS "public can read branding" ON public.tryon_branding;
CREATE POLICY "public can read branding of public vendors"
ON public.tryon_branding
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (SELECT 1 FROM public.ar_products p
          WHERE p.user_id = tryon_branding.user_id
            AND p.is_public = true AND p.status = 'ready')
);
