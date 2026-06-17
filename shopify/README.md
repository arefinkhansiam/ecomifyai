# Shopify App Store submission — Easibie

This folder holds everything needed to list Easibie on the Shopify App Store
so merchants can install with one click (no typed store handle).

## Files

- `shopify.app.toml` — App manifest consumed by Shopify CLI (`shopify app deploy`).
- `listing.md` — Copy-paste source for the Partner Dashboard listing form,
  including scopes, URLs, GDPR webhook mapping, and the submission checklist.

## How merchants install after approval

1. Merchant finds Easibie on apps.shopify.com or clicks our marketing CTA.
2. Shopify shows the consent screen with our requested scopes.
3. On approval, Shopify redirects to
   `https://easibie.com/api/public/shopify/callback?shop=...&code=...&hmac=...`.
4. Our callback exchanges `code` for a permanent access token, stores it in
   `shopify_stores`, kicks off the initial product sync, then redirects the
   merchant to `/dashboard/shopify?connected=1`.

The merchant never types a store handle — Shopify supplies `shop` for us.

## Deploying the manifest

Run from this folder with Shopify CLI installed locally:

```bash
shopify app deploy --config=shopify/shopify.app.toml
```

Then in Partner Dashboard → Apps → Easibie → Distribution → Submit for review.

## Keeping dev and production apps separate

Keep the existing custom-distribution app for development (current
`SHOPIFY_API_KEY` / `SHOPIFY_API_SECRET`). Create a **second** app in Partners
for the public listing and store its credentials as new secrets when ready
(e.g. `SHOPIFY_PUBLIC_API_KEY`, `SHOPIFY_PUBLIC_API_SECRET`). This prevents
review changes from disrupting merchants already connected to the dev app.
