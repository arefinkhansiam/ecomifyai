import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAppUrl, isValidShopDomain, newNonce, signState, SHOPIFY_SCOPES } from "@/lib/shopify-helpers.server";

export const Route = createFileRoute("/api/public/shopify/install")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const shopRaw = (url.searchParams.get("shop") || "").trim().toLowerCase();
        const userId = url.searchParams.get("user_id") || "";
        const shop = shopRaw.endsWith(".myshopify.com") ? shopRaw : `${shopRaw}.myshopify.com`;

        if (!isValidShopDomain(shop)) {
          return new Response("Invalid shop domain. Use yourstore.myshopify.com", { status: 400 });
        }
        if (!userId || userId.length < 8) {
          return new Response("Missing user_id", { status: 400 });
        }
        const apiKey = process.env.SHOPIFY_API_KEY;
        if (!apiKey) return new Response("Shopify app not configured", { status: 500 });

        const nonce = newNonce();
        const state = signState(userId, nonce);
        const redirectUri = `${getAppUrl()}/api/public/shopify/callback`;

        const authUrl = new URL(`https://${shop}/admin/oauth/authorize`);
        authUrl.searchParams.set("client_id", apiKey);
        authUrl.searchParams.set("scope", SHOPIFY_SCOPES);
        authUrl.searchParams.set("redirect_uri", redirectUri);
        authUrl.searchParams.set("state", state);

        return Response.redirect(authUrl.toString(), 302);
      },
    },
  },
});
