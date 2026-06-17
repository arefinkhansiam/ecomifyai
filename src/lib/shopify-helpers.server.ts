import { createHmac, timingSafeEqual, randomBytes } from "crypto";

export const SHOPIFY_SCOPES = "read_products,read_inventory,read_orders,write_script_tags";

export function getAppUrl(): string {
  // Prefer custom domain; fall back to env
  return process.env.PUBLIC_APP_URL || "https://easibie.com";
}

export function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
}

export function signState(userId: string, nonce: string): string {
  const secret = process.env.SHOPIFY_API_SECRET!;
  const payload = `${userId}.${nonce}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${userId}.${nonce}.${sig}`;
}

export function verifyState(state: string): { userId: string; nonce: string } | null {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) return null;
  const parts = state.split(".");
  if (parts.length !== 3) return null;
  const [userId, nonce, sig] = parts;
  const expected = createHmac("sha256", secret).update(`${userId}.${nonce}`).digest("hex");
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return { userId, nonce };
  } catch {
    return null;
  }
}

export function newNonce(): string {
  return randomBytes(16).toString("hex");
}

// Verify Shopify OAuth callback HMAC (query params, drop hmac & signature, sort, urlencoded)
export function verifyOAuthHmac(url: URL): boolean {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) return false;
  const hmac = url.searchParams.get("hmac");
  if (!hmac) return false;
  const entries: [string, string][] = [];
  url.searchParams.forEach((v, k) => {
    if (k !== "hmac" && k !== "signature") entries.push([k, v]);
  });
  entries.sort(([a], [b]) => a.localeCompare(b));
  const message = entries.map(([k, v]) => `${k}=${v}`).join("&");
  const digest = createHmac("sha256", secret).update(message).digest("hex");
  try {
    const a = Buffer.from(digest, "hex");
    const b = Buffer.from(hmac, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// Verify webhook HMAC (raw body + base64 header)
export function verifyWebhookHmac(rawBody: string, header: string | null): boolean {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret || !header) return false;
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  try {
    const a = Buffer.from(digest);
    const b = Buffer.from(header);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

const SHOPIFY_API_VERSION = "2024-10";

export async function shopifyGraphQL<T = any>(
  shop: string,
  accessToken: string,
  query: string,
  variables?: Record<string, any>,
): Promise<T> {
  const res = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify GraphQL ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as any;
  if (json.errors) {
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors).slice(0, 300)}`);
  }
  return json.data as T;
}

export async function exchangeCodeForToken(shop: string, code: string) {
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as { access_token: string; scope: string };
}

export function inferTryOnCategory(productType: string | null | undefined, title: string): string | null {
  const t = `${productType || ""} ${title}`.toLowerCase();
  if (/(ring|necklace|bracelet|earring|jewel|watch)/.test(t)) return "jewelry";
  if (/(glasses|sunglasses|eyewear|spectacle)/.test(t)) return "eyewear";
  if (/(lipstick|makeup|foundation|mascara|cosmetic|blush)/.test(t)) return "makeup";
  if (/(sofa|chair|table|furniture|lamp|bed|desk)/.test(t)) return "furniture";
  if (/(shirt|dress|jacket|pant|jean|hoodie|tee|cloth|apparel|skirt|sweater)/.test(t)) return "clothing";
  return null;
}
