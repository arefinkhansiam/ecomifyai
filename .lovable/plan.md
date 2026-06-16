
# Easibie v2 — Customization, Conversion & Analytics Overhaul

This is a large multi-area change. I'll ship it in clearly-scoped phases so you can review as we go. Confirming the plan first so we agree on scope and order before I touch code.

## Phase 1 — Cleanup & Removals
- **Strip all emojis** from the entire app (buttons, toasts, empty states, errors, analytics labels, tooltips, headings, marketing copy).
- **Remove Full 3D AR Try-On mode**: delete `model-viewer` usage, `.usdz` assets, `models_3d` table reads, and all "AR / 3D" UI. Keep only:
  - Image-based AI Try-On (existing Gemini compose flow)
  - Scene-based product placement preview (furniture/makeup mode reuses same pipeline)
- Rename remaining "AR" labels to "Try-On" everywhere user-facing.

## Phase 2 — Advanced Color System (shared component)
New `ColorControl` component used everywhere a color is picked:
- HSL color wheel + saturation/lightness area
- HEX input
- RGB inputs (R, G, B)
- Opacity slider (0–100%)
- "Save to palette" button

New **Brand Palette** (per-vendor, stored in DB):
- Table `vendor_palettes` (vendor_id, name, colors jsonb, created_at)
- Sidebar of saved swatches in every color control; click to apply
- Used by: buttons, text, background, accent, overlay, camera/Try-On buttons

## Phase 3 — Advanced Gradient Builder
New `GradientBuilder` component:
- Unlimited color stops (add/remove, drag position 0–100)
- Each stop uses the `ColorControl` above
- Direction: horizontal / vertical / diagonal / radial
- Live preview bar
- Save gradient presets → table `vendor_gradients`

## Phase 4 — Try-On Viewer Page Customization
Expanded customize dashboard with:
- Header text editor (title + subtitle)
- Font family selector — 5 curated fonts (Inter, Space Grotesk, Playfair Display, DM Sans, Manrope)
- Font size slider
- Background: solid / gradient / uploaded image (Supabase Storage)
- Per-button border-radius slider
- Per-button shadow toggle
- All wired to a single `tryon_branding` row per product (extend existing table)

## Phase 5 — Real-Time Preview Panel
- Split layout: controls on left, live mock of Try-On viewer on right
- Updates on every change with no save
- Desktop / Mobile toggle (frame switches 1440 vs 390 px)

## Phase 6 — Watermark & Download
- "Download Photo" button on Try-On viewer
- Canvas-composited export (jpg)
- Vendor watermark: logo or name; position (BR/BL/center); opacity slider
- "Powered by Easibie" watermark — default OFF, vendor toggle
- Settings live on `tryon_branding`

## Phase 7 — Like / Not For Me + Alternatives
- Two buttons on viewer page (text-only, no emoji)
- **Not For Me**: smooth fade-out, horizontal carousel of vendor-configured alternatives, each card has image + name + "Try On" button
- **Like**: shows "Save to Wishlist" + "Share" actions
- New dashboard section **Rejected Product Alternatives**: up to 10 alternatives per product
- New table `product_alternatives` (product_id, alt_product_id, position)
- All interactions logged to `tryon_feedback` + new `tryon_events` table

## Phase 8 — Analytics
Vendor dashboard additions:
- Per-product: total try-ons, likes, dislikes, try-on→purchase conversion
- Alternatives: which fallbacks get most-selected, replacement performance
- Behavior: engagement patterns, interaction trends (line chart over time)
- Powered by `tryon_events` + existing `ar_sessions`

## Phase 9 — UX Pass
- Mobile-first audit of all new screens
- Smooth Framer-Motion transitions on Like / Not-For-Me and alternatives carousel
- Loading skeletons, no spinners

---

## Technical Notes
- New tables (migration, one batch): `vendor_palettes`, `vendor_gradients`, `product_alternatives`, `tryon_events`. Extend `tryon_branding` with font/header/background/watermark columns.
- Color/Gradient components are pure React (no new deps; replace `react-colorful` usage where needed — keep it as the underlying HSL wheel).
- Download = `html2canvas`-free pure `<canvas>` composite (image + watermark) to keep Worker bundle slim.
- All copy passes through a small `noEmoji()` lint helper during build to prevent regressions.

---

## Suggested Delivery Order
1. Phase 1 (cleanup) + Phase 2 (color system) + Phase 3 (gradients) — foundation
2. Phase 4 + Phase 5 — customization + live preview
3. Phase 6 — watermark/download
4. Phase 7 — like/dislike + alternatives
5. Phase 8 + 9 — analytics + polish

This is roughly 4–6 large iterations. **Approve the plan and I'll start with Phase 1 + 2 + 3 in the next turn.** If you'd rather I reorder (e.g. Like/Dislike first), tell me now.
