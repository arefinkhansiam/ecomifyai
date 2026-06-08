
-- Add scan_ai mode and embed token + view counters to ar_products
ALTER TABLE public.ar_products DROP CONSTRAINT IF EXISTS ar_products_ar_mode_chk;
ALTER TABLE public.ar_products ADD CONSTRAINT ar_products_ar_mode_chk
  CHECK (ar_mode = ANY (ARRAY['fashion','furniture','full_3d','scan_ai']));

ALTER TABLE public.ar_products ADD COLUMN IF NOT EXISTS embed_token text UNIQUE;
ALTER TABLE public.ar_products ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

-- Backfill embed tokens for existing rows
UPDATE public.ar_products SET embed_token = replace(gen_random_uuid()::text, '-', '') WHERE embed_token IS NULL;

-- Default for new rows
ALTER TABLE public.ar_products ALTER COLUMN embed_token SET DEFAULT replace(gen_random_uuid()::text, '-', '');

CREATE INDEX IF NOT EXISTS idx_ar_products_embed_token ON public.ar_products(embed_token);

-- ============================================================
-- scan_frames
-- ============================================================
CREATE TABLE IF NOT EXISTS public.scan_frames (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.ar_products(id) ON DELETE CASCADE,
  frame_url text NOT NULL,
  frame_number integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_scan_frames_product ON public.scan_frames(product_id, frame_number);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.scan_frames TO authenticated;
GRANT ALL ON public.scan_frames TO service_role;

ALTER TABLE public.scan_frames ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage scan frames"
  ON public.scan_frames FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ar_products p WHERE p.id = scan_frames.product_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.ar_products p WHERE p.id = scan_frames.product_id AND p.user_id = auth.uid()));

-- ============================================================
-- models_3d
-- ============================================================
CREATE TABLE IF NOT EXISTS public.models_3d (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.ar_products(id) ON DELETE CASCADE,
  preview_url text,
  glb_url text,
  usdz_url text,
  processing_status text NOT NULL DEFAULT 'pending'
    CHECK (processing_status = ANY (ARRAY['pending','generating','converting','done','failed'])),
  external_task_id text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_models_3d_product ON public.models_3d(product_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.models_3d TO authenticated;
GRANT ALL ON public.models_3d TO service_role;

ALTER TABLE public.models_3d ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage 3d models"
  ON public.models_3d FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ar_products p WHERE p.id = models_3d.product_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.ar_products p WHERE p.id = models_3d.product_id AND p.user_id = auth.uid()));

CREATE TRIGGER trg_models_3d_updated_at BEFORE UPDATE ON public.models_3d
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================
-- Public viewer helper: bump view count by token
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_view_by_token(p_token text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.ar_products SET view_count = view_count + 1 WHERE embed_token = p_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_view_by_token(text) TO anon, authenticated;
