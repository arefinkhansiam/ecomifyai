import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getShopifyOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: store } = await supabase
      .from("shopify_stores")
      .select("id, shop_domain, shop_name, shop_email, currency, installed_at, last_synced_at, sync_status, uninstalled_at, scopes")
      .eq("user_id", userId)
      .order("installed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!store || store.uninstalled_at) {
      return { store: null, products: [], counts: { total: 0, enabled: 0 } };
    }

    const { data: products } = await supabase
      .from("shopify_products")
      .select("id, shopify_product_id, title, handle, vendor, product_type, status, images, price_min, price_max, currency, total_inventory, tryon_enabled, tryon_category")
      .eq("user_id", userId)
      .eq("store_id", store.id)
      .order("title", { ascending: true })
      .limit(500);

    const list = products || [];
    return {
      store,
      products: list,
      counts: { total: list.length, enabled: list.filter((p) => p.tryon_enabled).length },
    };
  });

export const toggleTryOnProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ productId: z.string().uuid(), enabled: z.boolean() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    if (data.enabled) {
      // Plan-aware limit: free = 5, others unlimited
      const { data: plan } = await supabase.from("user_plans").select("plan").eq("user_id", userId).maybeSingle();
      const planName = (plan?.plan as string) || "free";
      if (planName === "free") {
        const { count } = await supabase
          .from("shopify_products")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("tryon_enabled", true);
        if ((count ?? 0) >= 5) {
          throw new Error("Free plan limit reached (5 try-on products). Upgrade to enable more.");
        }
      }
    }

    const { error } = await supabase
      .from("shopify_products")
      .update({ tryon_enabled: data.enabled })
      .eq("id", data.productId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const disconnectShopifyStore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("shopify_stores").delete().eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const resyncShopifyProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: store } = await supabase
      .from("shopify_stores")
      .select("id, shop_domain, access_token")
      .eq("user_id", userId)
      .is("uninstalled_at", null)
      .maybeSingle();
    if (!store) throw new Error("No connected Shopify store");

    const { shopifyGraphQL, inferTryOnCategory } = await import("@/lib/shopify-helpers.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const PRODUCTS_QUERY = `query($cursor: String) {
      products(first: 50, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id title handle descriptionHtml vendor productType status totalInventory
          priceRangeV2 { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
          images(first: 10) { nodes { url altText } }
          variants(first: 25) { nodes { id title sku price availableForSale inventoryQuantity selectedOptions { name value } } }
        }
      }
    }`;

    await supabaseAdmin.from("shopify_stores").update({ sync_status: "syncing" }).eq("id", store.id);
    let cursor: string | null = null;
    let total = 0;
    try {
      do {
        const data: any = await shopifyGraphQL(store.shop_domain, store.access_token, PRODUCTS_QUERY, { cursor });
        const conn = data.products;
        const rows = conn.nodes.map((p: any) => {
          const images = (p.images?.nodes || []).map((i: any) => ({ url: i.url, alt: i.altText }));
          const variants = (p.variants?.nodes || []).map((v: any) => ({
            id: v.id, title: v.title, sku: v.sku, price: v.price,
            available: v.availableForSale, inventory: v.inventoryQuantity, options: v.selectedOptions,
          }));
          const min = p.priceRangeV2?.minVariantPrice?.amount;
          const max = p.priceRangeV2?.maxVariantPrice?.amount;
          return {
            store_id: store.id,
            user_id: userId,
            shopify_product_id: String(p.id),
            handle: p.handle, title: p.title,
            description: (p.descriptionHtml || "").replace(/<[^>]+>/g, "").slice(0, 4000),
            vendor: p.vendor, product_type: p.productType, status: p.status,
            images, variants,
            price_min: min ? Number(min) : null,
            price_max: max ? Number(max) : null,
            currency: p.priceRangeV2?.minVariantPrice?.currencyCode,
            total_inventory: p.totalInventory ?? null,
            tryon_category: inferTryOnCategory(p.productType, p.title),
            synced_at: new Date().toISOString(),
          };
        });
        if (rows.length) {
          const { error } = await supabaseAdmin.from("shopify_products").upsert(rows, { onConflict: "store_id,shopify_product_id" });
          if (error) throw new Error(error.message);
          total += rows.length;
        }
        cursor = conn.pageInfo.hasNextPage ? conn.pageInfo.endCursor : null;
      } while (cursor);

      await supabaseAdmin.from("shopify_stores").update({ sync_status: "ready", last_synced_at: new Date().toISOString() }).eq("id", store.id);
      return { ok: true, synced: total };
    } catch (e: any) {
      await supabaseAdmin.from("shopify_stores").update({ sync_status: "error" }).eq("id", store.id);
      throw new Error(e?.message || "Sync failed");
    }
  });
