## Goal

Align the whole product surface (landing page + dashboard) with the new system: **vendors upload product photos from multiple angles → shoppers upload (or take) their own photo → Gemini composes a photorealistic try-on / room placement / makeup result**. Remove all "live AR camera tracking" framing.

## 1. Landing page (`src/routes/index.tsx`)

Rewrite copy and visuals to describe AI Photo Try-On, not live AR.

- **Hero**
  - Headline: "Try it on. From a photo." (or similar) — emphasises upload-a-photo try-on, not camera AR.
  - Subhead: explain the 2-photo flow (product + shopper photo → AI result).
  - CTA buttons: "Start free" + "See a try-on" (links to `/try-ar` demo page, which we'll also rebrand).
  - Replace the fake "Live AR Demo" phone mock with a **before / after** card pair (shopper photo → composed try-on result) using existing demo assets. Drop the clock / "tap & drag" / tracking dot visuals.

- **"How it works" section** — 3 steps:
  1. Vendor uploads product photos (front / back / side / detail).
  2. Shopper uploads or snaps a photo of themselves / their room / their face.
  3. AI generates a photorealistic try-on in seconds.

- **Features grid** — replace "real-time tracking / pose detection / WebXR" bullets with:
  - Multi-angle product capture
  - AI photo try-on for fashion, jewellery, accessories
  - Room placement for furniture & decor
  - Virtual makeup shade matching
  - One shareable link + QR per product
  - Works on any phone — no AR hardware needed

- **Use cases**: Fashion · Jewellery · Furniture · Makeup (same 4, refreshed copy).

- **FAQ / footer copy**: strip "AR / WebXR / camera tracking" language; talk about "AI try-on", "photo composition", "powered by Gemini".

## 2. Dashboard

Remove dashboard pages and nav entries that belonged to the old live-AR workflow; keep what fits the new flow.

- **Remove from sidebar + delete routes:**
  - `dashboard.scan.tsx` (3D scanning / multi-frame capture flow — not used anymore)
  - `dashboard.create.tsx` if it duplicates upload
  - `dashboard.products.$id.customize.tsx` if its options only configured live-AR placement; otherwise trim to product metadata only

- **Keep / refresh:**
  - `dashboard.index.tsx` — relabel "Ready for AR" → "Ready for try-on"; "Total AR Views" → "Try-on views"; "AR slots" → "Try-on slots".
  - `dashboard.upload.tsx` — already supports multi-angle (`extra_images`). Tighten copy: "Upload product photos (front, back, side, detail) — more angles = better try-on". Show angle guidance.
  - `dashboard.products.tsx` — rename "Preview AR" → "Preview try-on"; "AR link" → "Try-on link". Keep `/ar/view/$productId` route working (just relabel UI).
  - `dashboard.embed.tsx` — relabel "AR widget" → "Try-on widget"; update preview text.
  - `dashboard.analytics.tsx` / `dashboard.behaviour.tsx` — relabel AR session metrics → try-on metrics.
  - `dashboard.billing.tsx`, `dashboard.settings.tsx` — copy pass only.

- **DashboardShell sidebar** (`src/components/DashboardShell.tsx`): drop Scan link, rename labels to "Try-on" terminology.

## 3. Shared marketing / shell components

- `Navbar.tsx`, `Footer.tsx`, `PricingCards.tsx`, `ReviewCarousel.tsx`, `FeatureCard.tsx` — copy pass only: replace "AR" wording with "AI try-on" where it appears in user-facing strings. No structural changes.
- `try-ar.tsx` page — keep route, rewrite as a public demo of the try-on flow (pick a sample product → upload your photo → see result), pointing at the same `/ar/view/$productId` viewer.
- `how-it-works.tsx`, `about.tsx`, `pricing.tsx` — copy pass to match new positioning.

## 4. Not touching

- Backend / DB schema, `ar_products` table, `extra_images` column, signed-URL flow, `ar-compose.ts` Gemini pipeline, `/ar/view/$productId` viewer behaviour. These already implement the new system correctly; this change is **frontend copy + dashboard nav** only.
- Route URLs stay `/ar/...` internally (no URL renames) so existing shared links keep working — only the visible labels change to "Try-on".

## 5. Verification

- Visit `/` on mobile viewport (current 413×769) → confirm new hero + steps + no "Live AR Demo" clock card.
- Visit `/dashboard` → sidebar shows new labels, Scan removed, stats labelled "Try-on".
- Visit `/dashboard/upload` → multi-angle copy is clear.
- Visit `/ar/view/<id>` → viewer still works end-to-end (unchanged).

Ready to switch to build mode and apply the above.
