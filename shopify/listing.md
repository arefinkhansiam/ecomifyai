# Easibie — Shopify App Store Listing

Use this as the source of truth for the Partner Dashboard listing form.

## App basics

- **Name:** Easibie — Virtual Try-On & AR
- **Handle / URL slug:** easibie
- **Tagline (≤70 chars):** Let shoppers try on your products in AR — straight from product pages.
- **Category:** Store design → Product display
- **Subcategory:** Augmented reality
- **Pricing model:** Free to install · Free plan (5 try-on products) · Paid plans for unlimited products and analytics

## App URLs

| Field | Value |
| --- | --- |
| App URL | https://easibie.com/dashboard/shopify |
| Preferences URL | https://easibie.com/dashboard/shopify |
| Allowed redirection URL(s) | https://easibie.com/api/public/shopify/callback |
| Webhook endpoint | https://easibie.com/api/public/shopify/webhook |
| Privacy policy | https://easibie.com/privacy |
| Support email | support@easibie.com |
| Support URL | https://easibie.com/support |

## Required scopes (least privilege)

| Scope | Why we need it |
| --- | --- |
| `read_products` | Pull product titles, descriptions, images, variants for try-on. |
| `read_inventory` | Hide out-of-stock variants from the try-on widget. |
| `read_orders` | Attribute conversions to try-on sessions in analytics. |
| `write_script_tags` | Inject the Easibie try-on widget script into the storefront. |

Do NOT request `write_products`, `read_customers`, or `read_all_orders` — they slow review and are not used.

## GDPR / mandatory compliance webhooks

All three are wired to `https://easibie.com/api/public/shopify/webhook` and handled in
`src/routes/api/public/shopify.webhook.ts`:

- `customers/data_request` — return any stored customer data within 30 days.
- `customers/redact` — delete customer-linked try-on events.
- `shop/redact` — purge `shopify_stores` and `shopify_products` 48h after uninstall.

## Distribution: zero-typing install

Once listed, merchants click **Add app** inside their Shopify admin or App Store listing.
Shopify itself appends `?shop={shop}.myshopify.com` to our App URL, so the merchant never
types their store handle. Our `/dashboard/shopify` route reads `shop` from the URL and
auto-redirects to `/api/public/shopify/install?shop=...` to start OAuth.

## Submission checklist

- [ ] Production app created in Partners dashboard (separate from current dev app)
- [ ] `shopify/shopify.app.toml` `client_id` filled with production Client ID
- [ ] Production `SHOPIFY_API_KEY` + `SHOPIFY_API_SECRET` added as runtime secrets
- [ ] Listing screenshots (1600×900, ≥3) — try-on demo, dashboard, analytics
- [ ] App icon (1200×1200 PNG, transparent background)
- [ ] Demo video (≤60s, hosted on YouTube unlisted)
- [ ] Test instructions for Shopify reviewers (sample store login + walkthrough)
- [ ] Privacy policy live at /privacy
- [ ] GDPR webhooks return 200 within 5s (verified with test payloads)
- [ ] App passes Shopify's automated checks (HMAC verification, OAuth, billing API if paid)
- [ ] Submitted via Partners → Apps → Distribution → Submit for review
