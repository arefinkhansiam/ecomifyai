## Goal

Add three explicit AR modes selectable by the vendor at upload time. Customer's AR viewer auto-loads the right mode and reports session data.

```text
Vendor upload → picks AR Mode → asset processed → embed code
                       │
                       ├── fashion  → photo (garment)
                       ├── furniture→ photo (auto bg-remove)
                       └── full_3d  → GLB / GLTF + optional USDZ

Customer click AR button
        │
        ├── fashion  → front cam → capture selfie → Replicate IDM-VTON → result
        ├── furniture→ back cam  → capture frame  → composite product via canvas → result
        └── full_3d  → model-viewer (WebXR / Quick Look / Scene Viewer)
```

## External services required

| Service       | Why                                  | How                              |
|---------------|--------------------------------------|----------------------------------|
| Replicate     | IDM-VTON virtual try-on (Fashion)    | Standard connector (gateway)     |
| Remove.bg     | Auto background removal (Furniture)  | Secret `REMOVEBG_API_KEY`        |

I'll request both right after this plan is approved. Nothing else changes until they're linked.

## Database (one migration)

Add to `ar_products`:
- `ar_mode` text — `fashion` | `furniture` | `full_3d`
- `model_usdz_url` text — optional iOS Quick Look file
- `processed_asset_url` already exists; reuse for bg-removed image

Add storage bucket `ar-models` (private, signed URLs) for `.glb` / `.usdz` uploads.

Backfill existing rows: `ar_mode = 'full_3d'` when a `model_url` is present, else `'furniture'`.

## Upload flow (`dashboard.upload.tsx`)

Stepper:
1. **Product Info** — name + category. Mode picker shown as 3 cards (Fashion / Furniture / Full 3D), preselected from category but always overridable.
2. **Asset Upload** — input adapts to mode:
   - fashion → single garment image (PNG/JPG)
   - furniture → product image; after upload, server fn calls Remove.bg, stores result in `processed_asset_url`
   - full_3d → GLB upload (required) + optional USDZ
3. **Customization** — existing panel (free = button color only; growth = full).
4. **Embed Code** — existing.

## Server functions (new)

- `src/lib/ar-fashion.functions.ts` → `runVirtualTryOn({ productId, personImageBase64 })`
  Uploads selfie + garment to Replicate `/v1/files` via gateway, kicks off IDM-VTON prediction, polls, returns result URL. Stores nothing server-side (privacy).
- `src/lib/ar-furniture.functions.ts` → `removeBackground({ productId })`
  Pulls source image from storage, POSTs to Remove.bg, writes result back to `product-images/processed/`, updates `processed_asset_url`.

Both gated by `requireSupabaseAuth`.

## Customer AR viewer (`ar.view.$productId.tsx`)

Switch on `product.ar_mode`:

- **fashion** — front camera + circular capture button. On capture: show loading state, call `runVirtualTryOn`, render result with Share / Retake / Close.
- **furniture** — back camera + capture button. On capture: freeze frame, overlay `processed_asset_url` PNG, allow drag/pinch/rotate, Share / Retake / Close.
- **full_3d** — existing `<model-viewer>` path, plus scale slider and a Share button that links to the AR page URL.

Top bar (all modes): product name only, close button. All chrome styled from `ar_customization`. Session tracking continues to fire (`ar_mode`, `camera_used`, `did_interact`, `time_spent_seconds`).

## Widget (`public/widget.js`)

No mode-specific change — it still opens the viewer in a fullscreen iframe. Already passes session/customization data. Verify it picks up the new `ar_mode` from the product payload it fetches.

## Out of scope (call out so it's not assumed)

- Real WebXR plane detection / hit-testing for Furniture (would need AR-Quick-Look / a heavy SLAM lib). MVP uses freeze-frame composite which is what spec describes: "AI places product on captured image".
- Real-time floor-grid overlay before capture — added as a follow-up if you want it.

## Files touched (estimate)

- migration (1)
- `src/lib/ar-fashion.functions.ts` (new)
- `src/lib/ar-furniture.functions.ts` (new)
- `src/routes/_authenticated/dashboard.upload.tsx`
- `src/routes/ar.view.$productId.tsx`
- `src/components/PricingCards.tsx` (mention 3 AR modes on Growth)
- `src/integrations/supabase/types.ts` (regenerated)
- `public/widget.js` (small)

## Order of execution

1. You approve plan.
2. I request **Replicate connector** + **Remove.bg API key**.
3. Once linked: migration → upload flow → server fns → viewer modes → widget verify → smoke test.

Approve to proceed and I'll trigger the connector / secret prompts.