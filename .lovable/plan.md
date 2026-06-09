# Plan — Try-On platform polish, premium customization & new $99 plan

Scope is large but cleanly grouped. I'll execute in this order so each layer builds on the previous.

---

## 1. Global theme cleanup (every page consistent)

The new Try-On colour palette (sky/indigo gradient, ink/cloud text) is applied on the landing + dashboard shells but missing on:
- `/ar/view/$productId` (the actual try-on viewer — still dark `#0B1220` slate)
- `/ar/$token` not-ready screen
- `/try-ar` demo page
- `/auth`, `/checkout`, `/about`, `/how-it-works`, `/pricing` (partial)

**Action:** Promote the palette tokens in `src/styles.css` and refactor each page to use the same `MarketingShell` wrapper or shared gradient background + token classes. No more hard-coded `#0B1220` / `bg-slate-900` in routes.

---

## 2. Dashboard — make it look genuinely professional

Current dashboard is functional but flat. Upgrade:
- **Sidebar:** add product logo, user avatar w/ plan badge, section dividers ("Workspace", "Try-On", "Account"), subtle active-state highlight.
- **Topbar:** breadcrumb + quick search + "Upgrade" CTA when on free/starter.
- **Cards:** swap flat cards for soft-shadow, gradient-accent cards with mini sparkline icons. Use consistent `Card` from shadcn with custom variant.
- **Empty states:** illustrated empty states on Products/Analytics when no data.
- **Typography:** display font for page titles, refined hierarchy.
- Apply to: `dashboard.index`, `dashboard.products`, `dashboard.upload`, `dashboard.embed`, `dashboard.analytics`, `dashboard.behaviour`, `dashboard.billing`, `dashboard.settings`.

Also remove every remaining "AR" label → "Try-On" across dashboard + customize page.

---

## 3. New **Pro** plan at $99/mo

Insert between Starter and Growth (or as a 4th card — I'll make it 4 cards).

| Feature | Free | Starter $10 | **Pro $99** | Growth $39→ keep as-is |
|---|---|---|---|---|
| Products | 1 | 10 | **Unlimited products** | 50 |
| Variants per product | 1 | 1 | **Up to 3 variants (same product, e.g. colours)** | 1 |
| Product **categories** | — | — | **Yes (organise + cross-sell)** | — |
| Custom Try-On button | — | basic colour | **Full branding (logo, font, colours, copy)** | gradient only |
| Custom Try-On interface skin | — | — | **Yes** | — |
| Customer feedback after result | — | — | **Yes ("Did you like it?")** | — |
| Same-category recommendations on "No" | — | — | **Yes** | — |
| Watermark on downloads | Easibie | Easibie | **Your store name + link** | Easibie removed |
| Remove all Easibie branding | — | yes | yes | yes |

DB migration:
- `user_plans.plan` enum: add `'pro'`; `ar_product_limit` allow NULL = unlimited.
- New `product_categories` table (user_id, name, slug).
- New `product_variants` table (product_id, label, image_url, extra_images[]). Cap 3 via trigger.
- New `tryon_feedback` table (product_id, session_id, liked bool, comment, created_at).
- New `tryon_branding` table (user_id, button_label, button_bg, button_text_color, logo_url, accent_color, font, viewer_bg, watermark_text, watermark_url). One row per user.

(Grants + RLS per project rules.)

---

## 4. Customizable Try-On button + viewer (Pro only)

- New dashboard page **`dashboard.branding.tsx`**: live preview + form (button label, colours, logo upload, accent, font, viewer background, watermark text & link). Gated by `plan === 'pro'` or `'growth'` per the table.
- `public/widget.js` + embed snippet read branding JSON from `/api/public/tryon-branding?user=...` and apply at runtime.
- `/ar/view/$productId` reads vendor branding (via public server fn) and themes the viewer + button accordingly. Falls back to Easibie defaults.

---

## 5. Variants + categories on product upload

- `dashboard.upload.tsx`: add "Category" select (load user's categories + "+ New") and "Variants" section (add up to 3 — each: label + main image + optional extra angles). Free/Starter see disabled UI with "Upgrade to Pro" tooltip.
- `dashboard.products.tsx`: group by category, show variant thumbnails on each product card.
- `/ar/view/$productId`: variant switcher chip row above the action buttons; switching variant re-composes with that variant's images.

---

## 6. Customer feedback + same-category cross-sell

After the AI result returns in `/ar/view/$productId`:
- Show "Did you like it?" 👍 / 👎.
- POST to `/api/public/tryon-feedback` (insert into `tryon_feedback`).
- On 👎: fetch up to 6 other public products in the same category → show as carousel "Try these instead". Tapping one swaps the viewer to that product.

Vendor sees aggregated feedback in `dashboard.analytics` (likes / dislikes / like rate per product).

---

## 7. Download + share (with smart watermark)

In `/ar/view/$productId` after result:
- **Download** button → canvas composites the AI image + a subtle bottom-right watermark (store name + website). For Pro/Growth users it's their store; for Free/Starter it stays "Try-on by Easibie · easibie.app".
- **Share** button → uses Web Share API (`navigator.share`) with the composed file; fallback = copy link + downloadable image.

---

## 8. Landing page — fix demo + before/after

- Replace the wrong/placeholder before-after image pair with two correct generated assets: a real person photo + the same person wearing a sample t-shirt (Gemini-generated, saved as project assets).
- **Working live demo section:** "Try it yourself" — ships with a built-in sample t-shirt product (seeded `is_demo = true` row). User clicks "Upload your photo" → instantly runs through `ar-compose` with that demo product → shows the AI result inline, no signup needed. Same flow as `/ar/view` but inlined on `/`.
- Fix `/try-ar` page (currently broken) — make it the same demo but a dedicated, larger page with 3 sample products to pick from (t-shirt, sofa, lipstick).

---

## 9. Verification (per layer)

After each layer I'll: refresh the relevant route in the preview, click through, watch console + network for errors, and confirm the visual/behavioural change. Final pass: full walkthrough on mobile viewport (413×769).

---

## Order of execution

1. DB migration (plans + categories + variants + feedback + branding).
2. Global theme tokens + page-by-page colour cleanup.
3. Dashboard professional polish + "AR" → "Try-On" sweep.
4. Pricing cards (4 plans).
5. Branding page + viewer theming + variants/categories on upload & products.
6. Feedback + cross-sell + download/share with watermark.
7. Landing demo fix + before/after assets + `/try-ar` repair.
8. End-to-end verification.

Ready to go. Reply "go" (or tell me what to drop/change) and I'll start with the migration.
