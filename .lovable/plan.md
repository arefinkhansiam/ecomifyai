## Plan

1. Add scan diagnostics and progress timeline
   - Show model loading status, camera readiness, detection confidence, frame count, capture angle, capture/upload latency, and errors on the scan screen.
   - Add a timeline for upload → scanning → angle capture → mockup generation → AR render, each with timestamps.
   - Persist key processing status in the existing product fields so the product page can show what failed instead of looking stuck.

2. Make scanning capture reliable with automatic multi-angle steps
   - Replace the current 12 generic frame count with required angle stages: front, left/side, back, detail/top.
   - Auto-capture frames per angle on a timer, even if object detection is weak, with detection confidence shown as diagnostic data.
   - Keep a manual capture button as fallback and advance only after each required angle has enough frames.
   - Fix the displayed guidance/progress so it matches the actual required frame counts.

3. Complete upload-to-AR-ready asset flow
   - When a user uploads an image, create the product as processing, then run AI cleanup/mockup generation before marking it ready.
   - Always store a usable AR asset: AI-processed preview when successful, raw uploaded image fallback when AI fails.
   - Create/update the model record and keep status/error messages clear.
   - Add visible upload progress states and timestamps on the upload page.

4. Improve server-side AI mockup generation robustness
   - Update the AI gateway call to the correct Lovable AI header pattern and improve error handling.
   - For scan products, choose the best available captured frames by angle instead of only the middle frame.
   - Generate category-specific AR-ready product renders for fashion, makeup, and furniture; for true GLB/USDZ, keep uploaded 3D models supported and treat image-based generation as an AR-ready mockup asset.

5. Fix AR viewer live placement behavior
   - Ensure processed image URLs are signed before passing to the live AR overlay so uploaded/scanned assets actually render.
   - Add AR diagnostics overlay for model loaded/tracking confidence when trying on.
   - Tune t-shirt placement using shoulders plus hips/torso proportions, with fallback ghost visible until body landmarks lock.
   - Keep furniture mode direct-camera with drag, rotate, wheel/pinch resize, no capture step.
   - Keep makeup mode face-landmark lipstick/filter placement and snapshot/share.

6. Validate
   - Verify the route loads without console errors.
   - Check scan/upload UI shows progress instead of appearing stuck.
   - Check AR viewer opens camera and uses the product image/mockup for fashion, makeup, and furniture modes.