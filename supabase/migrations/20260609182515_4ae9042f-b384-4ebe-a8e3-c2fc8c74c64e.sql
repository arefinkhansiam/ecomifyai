
-- 1. Add 'pro' to plan enum (user_plans.plan is TEXT in this project, so no enum change needed — just allow it via app logic)
-- Allow unlimited plan: ar_product_limit NULL = unlimited
ALTER TABLE public.user_plans ALTER COLUMN ar_product_limit DROP NOT NULL;

-- 2. is_demo flag on ar_products for landing page seed
ALTER TABLE public.ar_products ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.ar_products ADD COLUMN IF NOT EXISTS category_id UUID;

-- 3. product_categories
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_categories TO authenticated;
GRANT SELECT ON public.product_categories TO anon;
GRANT ALL ON public.product_categories TO service_role;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners manage own categories" ON public.product_categories
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "public can read categories" ON public.product_categories
  FOR SELECT TO anon USING (true);
CREATE TRIGGER tg_product_categories_touch BEFORE UPDATE ON public.product_categories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.ar_products
  ADD CONSTRAINT ar_products_category_fk FOREIGN KEY (category_id)
  REFERENCES public.product_categories(id) ON DELETE SET NULL;

-- 4. product_variants (max 3 per product enforced by trigger)
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.ar_products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  image_url TEXT NOT NULL,
  extra_images TEXT[] NOT NULL DEFAULT '{}',
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT SELECT ON public.product_variants TO anon;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners manage own variants" ON public.product_variants
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "public can read variants of public products" ON public.product_variants
  FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM public.ar_products p WHERE p.id = product_id AND p.is_public = true)
  );
CREATE TRIGGER tg_product_variants_touch BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.enforce_variant_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.product_variants WHERE product_id = NEW.product_id;
  IF v_count >= 3 THEN
    RAISE EXCEPTION 'Max 3 variants per product' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER tg_enforce_variant_limit BEFORE INSERT ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.enforce_variant_limit();

-- 5. tryon_feedback
CREATE TABLE public.tryon_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.ar_products(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liked BOOLEAN NOT NULL,
  comment TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tryon_feedback TO authenticated;
GRANT INSERT ON public.tryon_feedback TO anon, authenticated;
GRANT ALL ON public.tryon_feedback TO service_role;
ALTER TABLE public.tryon_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendor reads own feedback" ON public.tryon_feedback
  FOR SELECT TO authenticated USING (auth.uid() = vendor_id);
CREATE POLICY "anyone can insert feedback for public product" ON public.tryon_feedback
  FOR INSERT TO anon, authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.ar_products p WHERE p.id = product_id AND p.is_public = true)
  );

-- 6. tryon_branding (one row per user)
CREATE TABLE public.tryon_branding (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  button_label TEXT NOT NULL DEFAULT 'Try it on',
  button_bg TEXT NOT NULL DEFAULT '#0EA5E9',
  button_text_color TEXT NOT NULL DEFAULT '#ffffff',
  logo_url TEXT,
  accent_color TEXT NOT NULL DEFAULT '#0EA5E9',
  font TEXT NOT NULL DEFAULT 'Inter',
  viewer_bg TEXT NOT NULL DEFAULT '#0B1220',
  watermark_text TEXT,
  watermark_url TEXT,
  store_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tryon_branding TO authenticated;
GRANT SELECT ON public.tryon_branding TO anon;
GRANT ALL ON public.tryon_branding TO service_role;
ALTER TABLE public.tryon_branding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners manage own branding" ON public.tryon_branding
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "public can read branding" ON public.tryon_branding
  FOR SELECT TO anon USING (true);
CREATE TRIGGER tg_tryon_branding_touch BEFORE UPDATE ON public.tryon_branding
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
