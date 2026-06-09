
-- Extend tryon_branding
ALTER TABLE public.tryon_branding
  ADD COLUMN IF NOT EXISTS header_title TEXT,
  ADD COLUMN IF NOT EXISTS header_subtitle TEXT,
  ADD COLUMN IF NOT EXISTS font_family TEXT NOT NULL DEFAULT 'Inter',
  ADD COLUMN IF NOT EXISTS font_size INT NOT NULL DEFAULT 16,
  ADD COLUMN IF NOT EXISTS background_type TEXT NOT NULL DEFAULT 'solid',
  ADD COLUMN IF NOT EXISTS background_value TEXT NOT NULL DEFAULT '#0B1220',
  ADD COLUMN IF NOT EXISTS button_radius INT NOT NULL DEFAULT 12,
  ADD COLUMN IF NOT EXISTS button_shadow BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS watermark_position TEXT NOT NULL DEFAULT 'bottom-right',
  ADD COLUMN IF NOT EXISTS watermark_opacity INT NOT NULL DEFAULT 70,
  ADD COLUMN IF NOT EXISTS show_platform_watermark BOOLEAN NOT NULL DEFAULT false;

-- Vendor palettes
CREATE TABLE IF NOT EXISTS public.vendor_palettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_palettes TO authenticated;
GRANT ALL ON public.vendor_palettes TO service_role;
ALTER TABLE public.vendor_palettes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners manage own palettes" ON public.vendor_palettes
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER tg_vendor_palettes_touch BEFORE UPDATE ON public.vendor_palettes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Vendor gradients
CREATE TABLE IF NOT EXISTS public.vendor_gradients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stops JSONB NOT NULL DEFAULT '[]'::jsonb,
  direction TEXT NOT NULL DEFAULT 'diagonal',
  angle INT NOT NULL DEFAULT 135,
  css TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_gradients TO authenticated;
GRANT ALL ON public.vendor_gradients TO service_role;
ALTER TABLE public.vendor_gradients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners manage own gradients" ON public.vendor_gradients
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER tg_vendor_gradients_touch BEFORE UPDATE ON public.vendor_gradients
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Product alternatives
CREATE TABLE IF NOT EXISTS public.product_alternatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.ar_products(id) ON DELETE CASCADE,
  alt_product_id UUID NOT NULL REFERENCES public.ar_products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, alt_product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_alternatives TO authenticated;
GRANT SELECT ON public.product_alternatives TO anon;
GRANT ALL ON public.product_alternatives TO service_role;
ALTER TABLE public.product_alternatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners manage own alternatives" ON public.product_alternatives
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "public can read alternatives" ON public.product_alternatives
  FOR SELECT TO anon USING (true);

-- Try-On events
CREATE TABLE IF NOT EXISTS public.tryon_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.ar_products(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  event_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tryon_events TO authenticated;
GRANT ALL ON public.tryon_events TO service_role;
ALTER TABLE public.tryon_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors read own events" ON public.tryon_events
  FOR SELECT TO authenticated USING (auth.uid() = vendor_id);
CREATE INDEX IF NOT EXISTS tryon_events_product_idx ON public.tryon_events(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS tryon_events_vendor_idx ON public.tryon_events(vendor_id, created_at DESC);
