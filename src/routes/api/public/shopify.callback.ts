import { createFileRoute } from "@tanstack/react-router";
import {
  exchangeCodeForToken,
  getAppUrl,
  isValidShopDomain,
  shopifyGraphQL,
  verifyOAuthHmac,
  verifyState,
  inferTryOnCategory,
} from "@/lib/shopify-helpers.server";

const SHOP_QUERY = `{
  shop { name email currencyCode myshopifyDomain }
}`;

const PRODUCTS_QUERY = `query($cursor: String) {
  products(first: 50, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    nodes {
      id title handle descriptionHtml vendor productType status totalInventory
      priceRangeV2 { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
      featuredImage { url altText }
      images(first: 10) { nodes { url altText } }
      variants(first: 25) { nodes { id title sku price availableForSale inventoryQuantity selectedOptions { name value } } }
    }
  }
}`;

async function syncAllProducts(args: {
  shop: string;
  accessToken: string;
  storeId: string;
  userId: string;
  supabaseAdmin: any;
}) {
  const { shop, accessToken, storeId, userId, supabaseAdmin } = args;
  let cursor: string | null = null;
  let totalSynced = 0;

  do {
    const data: any = await shopifyGraphQL(shop, accessToken, PRODUCTS_QUERY, { cursor });
    const conn = data.products;
    const rows = conn.nodes.map((p: any) => {
      const images = (p.images?.nodes || []).map((i: any) => ({ url: i.url, alt: i.altText }));
      const variants = (p.variants?.nodes || []).map((v: any) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        price: v.price,
        available: v.availableForSale,
        inventory: v.inventoryQuantity,
        options: v.selectedOptions,
      }));
      const min = p.priceRangeV2?.minVariantPrice?.amount;
      const max = p.priceRangeV2?.maxVariantPrice?.amount;
      const currency = p.priceRangeV2?.minVariantPrice?.currencyCode;
      const category = inferTryOnCategory(p.productType, p.title);
      return {
        store_id: storeId,
        user_id: userId,
        shopify_product_id: String(p.id),
        handle: p.handle,
        title: p.title,
        description: (p.descriptionHtml || "").replace(/<[^>]+>/g, "").slice(0, 4000),
        vendor: p.vendor,
        product_type: p.productType,
        status: p.status,
        images,
        variants,
        price_min: min ? Number(min) : null,
        price_max: max ? Number(max) : null,
        currency,
        total_inventory: p.totalInventory ?? null,
        tryon_category: category,
        synced_at: new Date().toISOString(),
      };
    });
    if (rows.length) {
      const { error } = await supabaseAdmin
        .from("shopify_products")
        .upsert(rows, { onConflict: "store_id,shopify_product_id" });
      if (error) throw new Error(error.message);
      totalSynced += rows.length;
    }
    cursor = conn.pageInfo.hasNextPage ? conn.pageInfo.endCursor : null;
  } while (cursor);

  return totalSynced;
}

export const Route = createFileRoute("/api/public/shopify/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const shop = (url.searchParams.get("shop") || "").toLowerCase();
        const code = url.searchParams.get("code") || "";
        const state = url.searchParams.get("state") || "";

        if (!isValidShopDomain(shop)) return new Response("Invalid shop", { status: 400 });
        if (!verifyOAuthHmac(url)) return new Response("Invalid HMAC", { status: 401 });
        const stateData = verifyState(state);
        if (!stateData) return new Response("Invalid state", { status: 401 });
        if (!code) return new Response("Missing code", { status: 400 });

        try {
          const { access_token, scope } = await exchangeCodeForToken(shop, code);

          const shopInfo: any = await shopifyGraphQL(shop, access_token, SHOP_QUERY);
          const s = shopInfo.shop || {};

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          const { data: store, error: upErr } = await supabaseAdmin
            .from("shopify_stores")
            .upsert(
              {
                user_id: stateData.userId,
                shop_domain: shop,
                access_token,
                scopes: scope,
                shop_name: s.name ?? null,
                shop_email: s.email ?? null,
                currency: s.currencyCode ?? null,
                installed_at: new Date().toISOString(),
                uninstalled_at: null,
                sync_status: "syncing",
              },
              { onConflict: "shop_domain" },
            )
            .select("id")
            .single();

          if (upErr || !store) {
            return new Response(`Failed to save store: ${upErr?.message}`, { status: 500 });
          }

          // Sync products inline (small/medium stores). For very large stores, this could be moved to a background job.
          try {
            const count = await syncAllProducts({
              shop,
              accessToken: access_token,
              storeId: store.id,
              userId: stateData.userId,
              supabaseAdmin,
            });
            await supabaseAdmin
              .from("shopify_stores")
              .update({ sync_status: "ready", last_synced_at: new Date().toISOString() })
              .eq("id", store.id);

            const dest = new URL(`${getAppUrl()}/dashboard/shopify`);
            dest.searchParams.set("connected", "1");
            dest.searchParams.set("synced", String(count));
            return Response.redirect(dest.toString(), 302);
          } catch (syncErr: any) {
            await supabaseAdmin
              .from("shopify_stores")
              .update({ sync_status: "error" })
              .eq("id", store.id);
            const dest = new URL(`${getAppUrl()}/dashboard/shopify`);
            dest.searchParams.set("connected", "1");
            dest.searchParams.set("sync_error", syncErr?.message?.slice(0, 200) ?? "sync failed");
            return Response.redirect(dest.toString(), 302);
          }
        } catch (e: any) {
          return new Response(`OAuth error: ${e?.message ?? "unknown"}`, { status: 500 });
        }
      },
    },
  },
});
