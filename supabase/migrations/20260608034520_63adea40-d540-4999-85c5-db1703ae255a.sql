
ALTER TABLE public.ar_products
  ADD COLUMN IF NOT EXISTS product_colors jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS show_branding boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS use_gradient boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS gradient_from text,
  ADD COLUMN IF NOT EXISTS gradient_to text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS store_name text;
