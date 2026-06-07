
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User plans
CREATE TABLE public.user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','starter','growth')),
  ar_product_limit INTEGER NOT NULL DEFAULT 1,
  billing_status TEXT DEFAULT 'active' CHECK (billing_status IN ('active','cancelled','expired','trialing')),
  billing_start_date TIMESTAMPTZ DEFAULT NOW(),
  billing_end_date TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_plans TO authenticated;
GRANT ALL ON public.user_plans TO service_role;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own plan" ON public.user_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own plan" ON public.user_plans FOR UPDATE USING (auth.uid() = user_id);

-- AR products
CREATE TABLE public.ar_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  original_image_url TEXT,
  processed_image_url TEXT,
  glb_url TEXT,
  usdz_url TEXT,
  qr_code_url TEXT,
  ar_viewer_url TEXT,
  dominant_color TEXT DEFAULT '#7C3AED',
  image_width INTEGER,
  image_height INTEGER,
  file_size_bytes BIGINT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','ready','failed')),
  error_message TEXT,
  processing_step TEXT DEFAULT 'queued',
  processing_progress INTEGER DEFAULT 0 CHECK (processing_progress >= 0 AND processing_progress <= 100),
  views_count INTEGER NOT NULL DEFAULT 0,
  embed_count INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ar_products_user_id ON public.ar_products(user_id);
CREATE INDEX idx_ar_products_status ON public.ar_products(status);
CREATE INDEX idx_ar_products_created_at ON public.ar_products(created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ar_products TO authenticated;
GRANT SELECT ON public.ar_products TO anon;
GRANT ALL ON public.ar_products TO service_role;
ALTER TABLE public.ar_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own products" ON public.ar_products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own products" ON public.ar_products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own products" ON public.ar_products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own products" ON public.ar_products FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public view ready products" ON public.ar_products FOR SELECT USING (status = 'ready' AND is_public = TRUE);

-- AR views
CREATE TABLE public.ar_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.ar_products(id) ON DELETE CASCADE,
  viewer_ip_hash TEXT,
  device_type TEXT CHECK (device_type IN ('mobile','tablet','desktop','unknown')),
  browser TEXT,
  ar_capability TEXT CHECK (ar_capability IN ('webxr','scene-viewer','quick-look','fallback','none')),
  country_code TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ar_views_product_id ON public.ar_views(product_id);
CREATE INDEX idx_ar_views_viewed_at ON public.ar_views(viewed_at DESC);
GRANT SELECT, INSERT ON public.ar_views TO authenticated;
GRANT INSERT ON public.ar_views TO anon;
GRANT ALL ON public.ar_views TO service_role;
ALTER TABLE public.ar_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners view product views" ON public.ar_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ar_products WHERE ar_products.id = ar_views.product_id AND ar_products.user_id = auth.uid())
);
CREATE POLICY "Anyone insert view" ON public.ar_views FOR INSERT WITH CHECK (TRUE);

-- Payment history
CREATE TABLE public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  amount_usd DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('paid','pending','failed','refunded')),
  stripe_payment_intent_id TEXT,
  invoice_url TEXT,
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_payment_history_user_id ON public.payment_history(user_id);
GRANT SELECT, INSERT ON public.payment_history TO authenticated;
GRANT ALL ON public.payment_history TO service_role;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own payments" ON public.payment_history FOR SELECT USING (auth.uid() = user_id);

-- New user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_plans (user_id, plan, ar_product_limit)
  VALUES (NEW.id, 'free', 1)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER user_plans_touch BEFORE UPDATE ON public.user_plans FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER ar_products_touch BEFORE UPDATE ON public.ar_products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RPCs
CREATE OR REPLACE FUNCTION public.increment_ar_views(p_product_id UUID, p_device TEXT, p_capability TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.ar_products SET views_count = views_count + 1 WHERE id = p_product_id;
  INSERT INTO public.ar_views (product_id, device_type, ar_capability) VALUES (p_product_id, p_device, p_capability);
END; $$;

CREATE OR REPLACE FUNCTION public.get_user_dashboard_stats(uid UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result JSON;
BEGIN
  SELECT json_build_object(
    'total_products', (SELECT COUNT(*) FROM public.ar_products WHERE user_id = uid),
    'ready_products', (SELECT COUNT(*) FROM public.ar_products WHERE user_id = uid AND status = 'ready'),
    'total_views', (SELECT COALESCE(SUM(views_count),0) FROM public.ar_products WHERE user_id = uid),
    'total_embeds', (SELECT COALESCE(SUM(embed_count),0) FROM public.ar_products WHERE user_id = uid),
    'plan', (SELECT plan FROM public.user_plans WHERE user_id = uid),
    'plan_limit', (SELECT ar_product_limit FROM public.user_plans WHERE user_id = uid)
  ) INTO result;
  RETURN result;
END; $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.ar_products;
