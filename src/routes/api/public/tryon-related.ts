import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/tryon-related")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const productId = url.searchParams.get("productId");
          if (!productId) return Response.json({ items: [] }, { headers: CORS });
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: cur } = await supabaseAdmin
            .from("ar_products")
            .select("id, ar_mode, category_id, user_id")
            .eq("id", productId)
            .maybeSingle();
          if (!cur) return Response.json({ items: [] }, { headers: CORS });
          const c: any = cur;
          let q = supabaseAdmin
            .from("ar_products")
            .select("id, product_name, original_image_url, processed_image_url, ar_mode")
            .eq("status", "ready")
            .eq("is_public", true)
            .neq("id", productId)
            .limit(6);
          if (c.category_id) q = q.eq("category_id", c.category_id);
          else if (c.ar_mode) q = q.eq("ar_mode", c.ar_mode);
          const { data } = await q;
          const items = await Promise.all(
            (data ?? []).map(async (p: any) => {
              const path = p.processed_image_url || p.original_image_url;
              let imageUrl: string | null = null;
              if (path) {
                const { data: s } = await supabaseAdmin.storage
                  .from("product-images")
                  .createSignedUrl(path, 3600);
                imageUrl = s?.signedUrl ?? null;
              }
              return { id: p.id, name: p.product_name, imageUrl };
            }),
          );
          return Response.json({ items }, { headers: CORS });
        } catch (e: any) {
          return Response.json({ items: [], error: e?.message }, { status: 200, headers: CORS });
        }
      },
    },
  },
});
