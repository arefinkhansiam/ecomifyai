ALTER TABLE public.ar_products DROP CONSTRAINT IF EXISTS ar_products_ar_mode_chk;
ALTER TABLE public.ar_products ADD CONSTRAINT ar_products_ar_mode_chk
  CHECK (ar_mode = ANY (ARRAY['fashion'::text, 'furniture'::text, 'full_3d'::text, 'scan_ai'::text, 'makeup'::text, 'object_3d'::text]));