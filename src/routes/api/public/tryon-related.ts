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

          // Prefer vendor-configured alternatives
          const { data: alts } = await supabaseAdmin
            .from("product_alternatives" as any)
            .select("alt_product_id, position")
            .eq("product_id", productId)
            .order("position", { ascending: true })
            .limit(10);

          let altRows: any[] = [];
          if (alts && alts.length > 0) {
            const ids = (alts as any[]).map((a) => a.alt_product_id);
            const { data: prods } = await supabaseAdmin
              .from("ar_products")
              .select("id, product_name, original_image_url, processed_image_url, ar_mode, status, is_public")
              .in("id", ids);
            altRows = (prods ?? [])
              .filter((p: any) => p.status === "ready" && p.is_public)
              .sort((a: any, b: any) => ids.indexOf(a.id) - ids.indexOf(b.id));
          }

          // Fallback to category / mode siblings
          if (altRows.length === 0) {
            const { data: cur } = await supabaseAdmin
              .from("ar_products").select("id, ar_mode, category_id").eq("id", productId).maybeSingle();
            if (cur) {
              const c: any = cur;
              let q = supabaseAdmin
                .from("ar_products")
                .select("id, product_name, original_image_url, processed_image_url, ar_mode")
                .eq("status", "ready").eq("is_public", true).neq("id", productId).limit(6);
              if (c.category_id) q = q.eq("category_id", c.category_id);
              else if (c.ar_mode) q = q.eq("ar_mode", c.ar_mode);
              const { data } = await q;
              altRows = data ?? [];
            }
          }

          const items = await Promise.all(
            altRows.map(async (p: any) => {
              const path = p.processed_image_url || p.original_image_url;
              let imageUrl: string | null = null;
              if (path) {
                const { data: s } = await supabaseAdmin.storage
                  .from("product-images").createSignedUrl(path, 3600);
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
