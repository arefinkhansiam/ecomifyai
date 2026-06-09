## Goal
Make the AR flow actually work end-to-end:

```text
Category → Upload photo or live scan → AI AR-ready product mockup → Live camera AR
```

This will not be marketed as a real downloadable GLB/USDZ generator unless a real 3D API is connected. For now, uploaded/scanned photos will become an AI-cleaned transparent/product mockup used by the live AR overlay, while real `.glb/.gltf` uploads remain the real 3D/WebXR path.

## What I will fix

1. **Upload photo pipeline**
   - Change image uploads from “instant ready” to visible processing.
   - Show clear progress: upload → AI preparing product → ready.
   - Ensure uploaded image products always have a usable AR image: AI-processed image first, raw image fallback if AI fails.
   - After success, show direct “Preview AR” link using the live camera viewer.

2. **Camera scan pipeline**
   - Make scanning capture reliably even when object detection fails.
   - Add an immediate first capture and a manual capture button so users are not stuck waiting.
   - Keep the guided angle steps: front/left/back/detail for clothing/furniture/makeup.
   - Show progress/count clearly while frames are being collected.
   - Lower the scan requirement from a fragile long 40-frame flow to a faster practical multi-angle flow, while still collecting different angles.

3. **AI mockup generation**
   - Update the server AI prompt to create a clean AR-ready product cutout/mockup from scan/photo.
   - Use category/subtype-specific prompts:
     - shirt/top: clean front wearable garment mockup
     - pants/bottom: full lower garment mockup
     - accessories/jewellery: isolated object with transparent/clean background intent
     - makeup: shade/swatch-ready visual reference
     - furniture: clean cutout/object mockup for room placement
   - Save the processed mockup path back to the product so the AR viewer can use it.

4. **Live AR viewer**
   - Keep the no-capture live try-on behavior.
   - Improve body placement math for tops/pants/accessories so overlays stay anchored while the person moves.
   - Keep makeup face-landmark filter and furniture drag/rotate/pinch mode.
   - Make snapshot/share a one-tap action after live try-on/placement.

5. **Remove confusing old capture-composite path from the viewer UI**
   - The public AR viewer should open camera and show live overlay directly.
   - Snapshot is only for saving/sharing the final live try-on photo, not for generating AR.

## Technical notes
- Main files to update:
  - `src/routes/_authenticated/dashboard.upload.tsx`
  - `src/routes/_authenticated/dashboard.scan.tsx`
  - `src/lib/scan-ai.functions.ts`
  - `src/components/LiveAROverlay.tsx`
  - possibly clean unused legacy code in `src/routes/ar.view.$productId.tsx`
- I will keep the existing backend/storage tables and avoid adding paid external 3D services.
- If AI generation fails, users still get a working live AR preview using the uploaded/scanned image instead of a broken product.

## Expected result
- Uploading a product photo shows progress and creates a live AR-ready product.
- Scanning captures frames with visible progress and finishes into an AR-ready product.
- Opening the AR link starts the camera and overlays the selected product directly on body/face/room.
- Users can save/share a snapshot after trying it live.