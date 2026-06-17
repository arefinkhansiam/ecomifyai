
-- Shopify stores table
CREATE TABLE public.shopify_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  scopes TEXT,
  shop_name TEXT,
  shop_email TEXT,
  currency TEXT,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uninstalled_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT NOT NULL DEFAULT 'idle',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX shopify_stores_user_id_idx ON public.shopify_stores(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shopify_stores TO authenticated;
GRANT ALL ON public.shopify_stores TO service_role;

ALTER TABLE public.shopify_stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own shopify stores"
  ON public.shopify_stores FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER shopify_stores_touch_updated
  BEFORE UPDATE ON public.shopify_stores
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Shopify products cache
CREATE TABLE public.shopify_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.shopify_stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shopify_product_id TEXT NOT NULL,
  handle TEXT,
  title TEXT NOT NULL,
  description TEXT,
  vendor TEXT,
  product_type TEXT,
  status TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  price_min NUMERIC(12,2),
  price_max NUMERIC(12,2),
  currency TEXT,
  total_inventory INT,
  tryon_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  tryon_category TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, shopify_product_id)
);

CREATE INDEX shopify_products_user_id_idx ON public.shopify_products(user_id);
CREATE INDEX shopify_products_store_id_idx ON public.shopify_products(store_id);
CREATE INDEX shopify_products_tryon_idx ON public.shopify_products(user_id) WHERE tryon_enabled = TRUE;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shopify_products TO authenticated;
GRANT ALL ON public.shopify_products TO service_role;

ALTER TABLE public.shopify_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own shopify products"
  ON public.shopify_products FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER shopify_products_touch_updated
  BEFORE UPDATE ON public.shopify_products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
