
ALTER TABLE public.ar_products
  ADD COLUMN IF NOT EXISTS ar_mode TEXT NOT NULL DEFAULT 'furniture';

UPDATE public.ar_products
  SET ar_mode = CASE
    WHEN glb_url IS NOT NULL OR usdz_url IS NOT NULL THEN 'full_3d'
    ELSE 'furniture'
  END;

ALTER TABLE public.ar_products
  ADD CONSTRAINT ar_products_ar_mode_chk
  CHECK (ar_mode IN ('fashion','furniture','full_3d'));
