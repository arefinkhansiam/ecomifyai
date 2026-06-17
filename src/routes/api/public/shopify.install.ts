import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAppUrl, isValidShopDomain, newNonce, signState, SHOPIFY_SCOPES } from "@/lib/shopify-helpers.server";

export const Route = createFileRoute("/api/public/shopify/install")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        let shopRaw = (url.searchParams.get("shop") || "").trim().toLowerCase();
        const userId = url.searchParams.get("user_id") || "";

        // Normalize: strip protocol, path, trailing slash
        shopRaw = shopRaw.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/\s+/g, "");

        let shop: string;
        if (shopRaw.endsWith(".myshopify.com")) {
          shop = shopRaw;
        } else if (!shopRaw.includes(".")) {
          // Bare handle, e.g. "piwpet"
          shop = `${shopRaw}.myshopify.com`;
        } else {
          // Custom domain like "piwpet.com" — extract first label as best guess
          const handle = shopRaw.split(".")[0];
          shop = `${handle}.myshopify.com`;
        }

        if (!isValidShopDomain(shop)) {
          return new Response(
            "Invalid shop domain. Enter your Shopify store handle (e.g. 'piwpet') or full myshopify URL (e.g. 'piwpet.myshopify.com'). Custom domains are not accepted here.",
            { status: 400 },
          );
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
