
# Fix scanning, auto-AR for uploads, live customization, polish

Four concrete fixes — each is independent so they all ship together but degrade gracefully if one fails.

---

## 1. Fix the scanner that "doesn't work"

The real bug: the `<video>` element is only rendered when `phase === "scanning"`. The current code calls `getUserMedia` → sets `videoRef.current.srcObject` → then flips phase. So `videoRef.current` is `null` at the moment we try to attach the stream and `play()`. On most devices that means the camera light turns on, no frames render, no detection runs, no frames are captured → "scanning is not working".

Fixes in `src/routes/_authenticated/dashboard.scan.tsx`:
- Always render `<video>` and `<canvas>` (hidden behind the intro card when not scanning) so `videoRef.current` exists before stream attach.
- Flip `setPhase("scanning")` BEFORE attaching the stream, and use a small `requestAnimationFrame` to make sure the element is mounted.
- Wait for `loadedmetadata` before starting the detection/capture loops; today the loops can fire while `videoWidth` is 0.
- Better error handling: surface `NotAllowedError`, `NotFoundError`, and "browser doesn't support camera" as distinct toasts.
- If MediaPipe CDN load fails (offline, blocked CDN, slow network), keep the auto-capture but show a small "auto-detect off — keep product centered" hint instead of silently pretending an object is detected.
- Add a one-shot console log per stage so the next failure is debuggable.

## 2. Random uploaded image → AR ready (same AI pass as scan)

Today uploading a plain photo just stores the raw file. The viewer shows that raw photo, which looks ugly. User wants uploads to behave like scans.

Changes:
- New server fn `generateAiHeroFromImage({ productId })` in `src/lib/scan-ai.functions.ts` (reuses the existing Gemini image-edit prompt; takes the product's `original_image_url` as the source instead of scan frames). Stores the cleaned hero render in `processed_image_url` and creates a `models_3d` row with `preview_url` so the existing viewer + dashboard treat the upload identically to a scan.
- `dashboard.upload.tsx`: after the insert, set `status='processing'`, call the new server fn, then set `status='ready'`. Show the same "AI is preparing your AR preview…" overlay the scan page uses, so uploads visibly produce an AR-ready output.
- If the AI call fails, keep `status='ready'` with the original photo (graceful fallback) and toast a warning — user still gets a working AR product, just without the cleaned hero.

## 3. Customize options that are actually workable

The customization fields ARE wired to the viewer, but the upload page gives no live feedback so users never see what they're tuning. And there's no way to edit after creating.

Changes:
- `dashboard.upload.tsx`: add a sticky right-side **Live AR preview** panel that re-renders on every change — shows the AR page mock (page bg + product image + accent button + font color + branding). Same renderer used in the actual viewer so what-you-see-is-what-you-get.
- Add a `Reset to defaults` button next to the customization section.
- New route `src/routes/_authenticated/dashboard.products.$id.customize.tsx`: a dedicated edit page for an existing product. Loads the row, re-uses the same controls + live preview, saves back to `ar_products`. Linked from the product card via a new pencil button.
- Add 2 small but commonly-asked controls: **AR badge text** (replaces "PLACE IT" / "TRY-ON") and **Show "Powered by Easibie" branding** (already in DB as `show_branding`, just expose it for paid users in the edit page).

## 4. Make the scan UI as polished as the try-on viewer

Match the look of `/ar/view/$productId` (dark glass, blurred pills, big shutter ring, animated processing overlay):

- Full-screen dark gradient backdrop for the scan stage (not the dashboard light background).
- Top bar = blurred-glass pills: live indicator with animated dot, product name, close button — identical to `TopBar` in the viewer.
- Detection bbox pulses sky-blue when nothing detected, locks emerald when an object is in frame.
- Replace the bottom ring with a larger "shutter-ring" style: circular progress with the current angle hint ("Left side", "Top", "Back", "Bottom") inside, plus a thin animated radar sweep behind it.
- "Generating your AR preview…" overlay uses the same gradient + Sparkles loop as the viewer's processing screen, with a 3-step progress (Capturing → Cleaning → Composing).
- Done screen: big checkmark, product hero preview thumbnail, primary `Preview AR` button + secondary `Copy embed code` + `Scan another`.
- Mobile-first sizing: stage uses `100dvh` minus headers; safe-area insets respected; orientation lock hint when in portrait on tablet.

---

## Files changed

- `src/routes/_authenticated/dashboard.scan.tsx` — render order fix, polish, better errors.
- `src/lib/scan-ai.functions.ts` — add `generateAiHeroFromImage` (reuses existing Gemini call).
- `src/routes/_authenticated/dashboard.upload.tsx` — auto-AI for uploaded images, live preview panel.
- `src/routes/_authenticated/dashboard.products.$id.customize.tsx` — new edit page.
- `src/routes/_authenticated/dashboard.products.tsx` — pencil button → customize page.
- `src/components/ArLivePreview.tsx` — small shared component used by upload + customize.

## Out of scope

- Real GLB / USDZ generation (still requires a paid 3D pipeline — flagged earlier).
- Changing the public viewer itself (it already consumes all the customization fields).
- Multi-product batch editing.
