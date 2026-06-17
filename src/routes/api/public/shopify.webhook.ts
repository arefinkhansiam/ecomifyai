import { createFileRoute } from "@tanstack/react-router";
import { inferTryOnCategory, verifyWebhookHmac } from "@/lib/shopify-helpers.server";

export const Route = createFileRoute("/api/public/shopify/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const hmac = request.headers.get("x-shopify-hmac-sha256");
        if (!verifyWebhookHmac(rawBody, hmac)) {
          return new Response("Invalid HMAC", { status: 401 });
        }
        const topic = request.headers.get("x-shopify-topic") || "";
        const shop = (request.headers.get("x-shopify-shop-domain") || "").toLowerCase();
        if (!shop) return new Response("Missing shop", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: store } = await supabaseAdmin
          .from("shopify_stores")
          .select("id, user_id")
          .eq("shop_domain", shop)
          .maybeSingle();

        if (!store && topic !== "app/uninstalled") {
          return new Response("ok", { status: 200 });
        }

        let payload: any = {};
        try { payload = JSON.parse(rawBody); } catch { /* noop */ }

        try {
          switch (topic) {
            case "products/create":
            case "products/update": {
              if (!store) break;
              const images = (payload.images || []).map((i: any) => ({ url: i.src, alt: i.alt }));
              const variants = (payload.variants || []).map((v: any) => ({
                id: `gid://shopify/ProductVariant/${v.id}`,
                title: v.title,
                sku: v.sku,
                price: v.price,
                available: (v.inventory_quantity ?? 0) > 0,
                inventory: v.inventory_quantity,
              }));
              const prices = (payload.variants || []).map((v: any) => Number(v.price)).filter((n: number) => !Number.isNaN(n));
              const min = prices.length ? Math.min(...prices) : null;
              const max = prices.length ? Math.max(...prices) : null;
              const totalInventory = (payload.variants || []).reduce(
                (sum: number, v: any) => sum + (Number(v.inventory_quantity) || 0), 0,
              );

              await supabaseAdmin.from("shopify_products").upsert(
                {
                  store_id: store.id,
                  user_id: store.user_id,
                  shopify_product_id: `gid://shopify/Product/${payload.id}`,
                  handle: payload.handle,
                  title: payload.title,
                  description: (payload.body_html || "").replace(/<[^>]+>/g, "").slice(0, 4000),
                  vendor: payload.vendor,
                  product_type: payload.product_type,
                  status: payload.status,
                  images,
                  variants,
                  price_min: min,
                  price_max: max,
                  total_inventory: totalInventory,
                  tryon_category: inferTryOnCategory(payload.product_type, payload.title),
                  synced_at: new Date().toISOString(),
                },
                { onConflict: "store_id,shopify_product_id" },
              );
              break;
            }
            case "products/delete": {
              if (!store) break;
              await supabaseAdmin
                .from("shopify_products")
                .delete()
                .eq("store_id", store.id)
                .eq("shopify_product_id", `gid://shopify/Product/${payload.id}`);
              break;
            }
            case "app/uninstalled": {
              await supabaseAdmin
                .from("shopify_stores")
                .update({ uninstalled_at: new Date().toISOString(), sync_status: "uninstalled" })
                .eq("shop_domain", shop);
              break;
            }
          }
        } catch (e: any) {
          // Always 200 to avoid Shopify retry storms on logic errors; log via console for server logs.
          console.error("Shopify webhook error", topic, shop, e?.message);
        }
        return new Response("ok", { status: 200 });
      },
    },
  },
});
