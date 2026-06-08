
# AR Scan-to-3D Module (integrated with existing AR system)

I'll extend the current `ar_products` table and dashboard rather than create parallel tables, so vendors get one unified product list. A new "Scan with camera" mode joins the existing Furniture / Fashion / Full-3D modes.

## What gets built

### 1. Vendor scan flow (`/dashboard/scan`)
- Vendor enters product name → product row created with `status='scanning'`, `ar_mode='scan_ai'`.
- Browser opens back camera (`getUserMedia { facingMode: "environment" }`).
- MediaPipe Object Detector (CDN `@mediapipe/tasks-vision`) runs every 500 ms on the live feed; green bbox when an object is in frame, otherwise "Place product in front of camera".
- Auto-capture one JPEG every 2 s while an object is detected, uploaded to `product-images` bucket at `scans/{productId}/frame_{n}.jpg`, URL recorded in `scan_frames`.
- Circular progress ring 0→40 frames; rotation hint text changes every 10 frames ("rotate left", "tilt up", "show bottom", "show back").
- After 40 frames camera stops, status flips to `processing`.

### 2. AI 3D preview generation
- A `createServerFn` picks frame #20 as the primary shot.
- Calls Lovable AI Gateway (`google/gemini-2.5-flash-image`) to produce a clean studio "3D-style" hero render (turntable look on transparent background). Result PNG saved to `models_3d.preview_url`.
- Also stores the cleaned hero image as the product's `model_url` fallback so the existing viewer keeps working.
- `processing_status` flows: `pending → generating → done | failed`; product `status` → `ready` on success.
- A clear banner in the viewer: "AI 3D preview — real GLB/USDZ coming when a 3D service is connected." Real TripoSR/Meshy integration is left as a single swap-in point in this function (one TODO, one place).

### 3. Embed token & widget
- Add `embed_token` (unique, `crypto.randomUUID()`) and `view_count` to `ar_products` (no separate `ar_widgets` table — same purpose, less duplication).
- Public viewer route: `/ar/$token`.
  - Loads `<model-viewer>` from Google CDN.
  - `src` = GLB if present, else the AI preview image rendered in a 360° spin frame; `ios-src` = USDZ when present.
  - Attributes: `ar`, `ar-modes="webxr scene-viewer quick-look"`, `camera-controls`, `auto-rotate`, `shadow-intensity="1"`.
  - Shows product name + description overlay, increments `view_count`.
- Dashboard card gets two new buttons: **Preview AR** (opens `/ar/$token`) and **Copy embed code** (copies the `<iframe>` snippet with `allow="xr-spatial-tracking; camera"`).

### 4. Dashboard polish
- Status badges: Scanning / Processing / Ready / Failed.
- Toast notification when status flips to Ready.
- Loading skeletons, dark modern theme using existing tokens.

## Database changes (single migration)

- `ar_products`: add `embed_token text unique default`, `view_count int default 0`; extend `ar_mode` to include `'scan_ai'`.
- New table `scan_frames` (`id`, `product_id` FK, `frame_url`, `frame_number`, `created_at`) with RLS scoped to product owner + GRANTs.
- New table `models_3d` (`id`, `product_id` FK, `preview_url`, `glb_url`, `usdz_url`, `processing_status`, `external_task_id`, timestamps) with RLS + GRANTs.
- Backfill `embed_token` for existing rows.

## Server functions / routes

- `src/lib/scan.functions.ts` — `createScanProduct`, `saveScanFrame`, `finalizeScan` (triggers AI step).
- `src/lib/scan-ai.functions.ts` — `generate3dPreview` (Lovable AI image edit on frame #20).
- `src/routes/ar.$token.tsx` — public viewer (server fn loads product + increments view count via `supabaseAdmin`, no auth required).

## Technical notes

- MediaPipe runs entirely client-side; no key needed.
- Lovable AI Gateway is used for the "3D preview" image (no external HF/Replicate dependency).
- USDZ conversion intentionally skipped; iPhone falls back to the 3D viewer until a real GLB pipeline is plugged in.
- Public viewer uses a server fn that loads `supabaseAdmin` inside the handler to keep the import graph client-safe.
- Embed `<iframe>` includes `allow="xr-spatial-tracking; camera"` — required for AR in iframes.

## Out of scope this turn

- Real photogrammetry / TripoSR call (left as a single TODO inside `generate3dPreview`).
- GLB → USDZ conversion.
- Browser push notifications on long jobs (AI preview takes seconds, not minutes).
