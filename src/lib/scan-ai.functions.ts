import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({ productId: z.string().uuid() });

const DEFAULT_PROMPT = "Recreate this product as a clean AR-ready hero render: isolate the product, remove the original background and replace it with a soft neutral studio backdrop with a subtle ground shadow, even product lighting, photoreal materials, sharp edges, no people, no text, no watermarks. Keep the exact product shape, proportions, color and details.";

function promptForCategory(mode?: string | null, subtype?: string | null): string {
  if (mode === "fashion") {
    if (subtype === "bottom")    return "Isolate the bottom garment (pants / jeans / trousers / skirt / shorts) as a clean front-facing flat-lay style AR-ready cutout on a soft neutral backdrop. Remove the original background, mannequin or person. Keep exact fabric color, pattern, stitching, length and shape. Photoreal, even lighting, subtle ground shadow, no text or watermarks.";
    if (subtype === "accessory") return "Isolate this fashion accessory (watch / bag / hat / glasses / shoes / belt) as a clean product render on a soft neutral backdrop. Remove the original background. Keep exact color, material, shape and details. Photoreal, even studio lighting, subtle ground shadow, no text or watermarks.";
    if (subtype === "jewellery") return "Isolate this jewellery piece (necklace / earring / ring / bracelet) as a clean product render on a soft neutral backdrop. Remove the original background. Preserve exact metal finish, gemstone color and sparkle, and proportions. Photoreal, soft studio lighting, sharp details, no text or watermarks.";
    return "Isolate the top garment (shirt / t-shirt / blouse / jacket / dress) as a clean front-facing flat-lay style AR-ready cutout on a soft neutral backdrop. Remove any mannequin, person or background. Keep exact fabric color, pattern, stitching and shape. Photoreal, even lighting, subtle ground shadow, no text or watermarks.";
  }
  if (mode === "makeup") {
    return "Recreate this makeup product as a clean studio AR-ready hero render on a soft neutral backdrop. Remove the original background. Keep the exact shade, finish (matte / glossy / shimmer), packaging color and label. Photoreal, soft lighting, subtle ground shadow, no people, no extra text.";
  }
  if (mode === "furniture") {
    return "Isolate this furniture / decor item as a clean AR-ready product render on a soft neutral backdrop, ready to be placed in a room. Remove the original background and any people. Keep exact shape, material, color and proportions. Photoreal, even lighting, subtle ground shadow, no text or watermarks.";
  }
  return DEFAULT_PROMPT;
}

async function callGeminiHero(dataUrl: string | string[], prompt: string = DEFAULT_PROMPT): Promise<{ mime: string; bytes: Buffer }> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");
  const imageUrls = Array.isArray(dataUrl) ? dataUrl : [dataUrl];
  const ai = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          ...imageUrls.map((url) => ({ type: "image_url", image_url: { url } })),
        ],
      }],
      modalities: ["image", "text"],
    }),
  });
  if (!ai.ok) {
    const t = await ai.text();
    throw new Error(`AI error ${ai.status}: ${t.slice(0, 200)}`);
  }
  const aiJson: any = await ai.json();
  const img = aiJson?.choices?.[0]?.message?.images?.[0]?.image_url?.url
    ?? aiJson?.choices?.[0]?.message?.content?.find?.((c: any) => c?.image_url)?.image_url?.url;
  if (!img || typeof img !== "string") throw new Error("AI returned no image");
  const m = img.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (!m) throw new Error("AI image not a data URL");
  return { mime: m[1], bytes: Buffer.from(m[2], "base64") };
}

function pickAngleFrames(frames: Array<{ frame_url: string; frame_number: number }>) {
  if (frames.length <= 4) return frames;
  const indexes = [0, Math.floor((frames.length - 1) / 3), Math.floor(((frames.length - 1) * 2) / 3), frames.length - 1];
  return Array.from(new Set(indexes)).map((i) => frames[i]);
}

async function storagePathToDataUrl(supabase: any, path: string, fallbackMime = "image/jpeg") {
  const { data: signed } = await supabase.storage.from("product-images").createSignedUrl(path, 600);
  if (!signed?.signedUrl) throw new Error("Could not read source image");
  const imgRes = await fetch(signed.signedUrl);
  if (!imgRes.ok) throw new Error(`Could not fetch image (${imgRes.status})`);
  const imgBuf = await imgRes.arrayBuffer();
  const mime = imgRes.headers.get("content-type") || fallbackMime;
  return `data:${mime};base64,${Buffer.from(imgBuf).toString("base64")}`;
}

/**
 * Picks the middle frame from a scan, runs it through Lovable AI Gateway
 * (Gemini image edit) to produce a clean studio "3D-style" hero preview,
 * uploads the result to storage, and updates models_3d + ar_products.
 *
 * NOTE: This produces an AI preview image, not a real GLB. Swap the inner
 * call for TripoSR / Meshy / CSM when a paid 3D service is connected — the
 * rest of the pipeline (storage path, models_3d row, status flow) stays.
 */
export const generate3dPreview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { productId } = data;

    // verify ownership
    const { data: product } = await supabase
      .from("ar_products").select("id, user_id, product_name, ar_mode, ar_subtype")
      .eq("id", productId).maybeSingle();
    if (!product || product.user_id !== userId) throw new Error("Not found");

    // mark generating
    const { data: existing } = await supabase
      .from("models_3d").select("id").eq("product_id", productId).maybeSingle();
    const modelRow = existing?.id
      ? (await supabase.from("models_3d").update({ processing_status: "generating", error_message: null }).eq("id", existing.id).select().single()).data
      : (await supabase.from("models_3d").insert({ product_id: productId, processing_status: "generating" }).select().single()).data;

    await supabase.from("ar_products").update({
      status: "processing", processing_step: "mockup_generation", processing_progress: 72, error_message: null,
    }).eq("id", productId);

    try {
      const { data: frames } = await supabase
        .from("scan_frames").select("frame_url, frame_number")
        .eq("product_id", productId).order("frame_number", { ascending: true });
      if (!frames || frames.length === 0) throw new Error("No scan frames");
      const chosenFrames = pickAngleFrames(frames);
      const dataUrls = await Promise.all(chosenFrames.map((frame) => storagePathToDataUrl(supabase, frame.frame_url)));

      const { mime, bytes } = await callGeminiHero(dataUrls, `${promptForCategory((product as any).ar_mode, (product as any).ar_subtype)} Use all supplied scan angles as reference views for one accurate front-facing AR-ready mockup.`);
      const ext = mime === "image/jpeg" ? "jpg" : "png";

      const path = `${userId}/${productId}/preview.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images")
        .upload(path, bytes, { contentType: mime, upsert: true });
      if (upErr) throw upErr;

      await supabase.from("models_3d").update({
        preview_url: path, processing_status: "done",
      }).eq("id", modelRow!.id);

      await supabase.from("ar_products").update({
        processed_image_url: path,
        status: "ready",
        processing_step: "complete",
        processing_progress: 100,
      }).eq("id", productId);

      return { ok: true, previewPath: path };
    } catch (e: any) {
      const { data: fallbackFrames } = await supabase
        .from("scan_frames").select("frame_url, frame_number")
        .eq("product_id", productId).order("frame_number", { ascending: true }).limit(1);
      const fallbackPath = fallbackFrames?.[0]?.frame_url;
      await supabase.from("models_3d").update({
        processing_status: "failed", error_message: String(e?.message ?? e),
      }).eq("id", modelRow!.id);
      if (fallbackPath) {
        await supabase.from("ar_products").update({
          processed_image_url: fallbackPath,
          status: "ready",
          processing_step: "complete_with_fallback",
          processing_progress: 100,
          error_message: String(e?.message ?? e),
        }).eq("id", productId);
        return { ok: false as const, previewPath: fallbackPath, reason: String(e?.message ?? e) };
      }
      await supabase.from("ar_products").update({ status: "failed", error_message: String(e?.message ?? e) }).eq("id", productId);
      throw e;
    }
  });

/**
 * Generate the same AI hero render from a single uploaded product image.
 * Used by the upload page so plain photos become AR-ready like scans.
 * On failure, returns ok:false but does NOT mark the product failed — the
 * caller keeps the raw image as a graceful fallback.
 */
export const generateAiHeroFromImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { productId } = data;

    const { data: product } = await supabase
      .from("ar_products").select("id, user_id, original_image_url, ar_mode, ar_subtype")
      .eq("id", productId).maybeSingle();
    if (!product || product.user_id !== userId) throw new Error("Not found");
    if (!product.original_image_url) return { ok: false, reason: "no_image" as const };

    const { data: existing } = await supabase
      .from("models_3d").select("id").eq("product_id", productId).maybeSingle();
    const modelRow = existing?.id
      ? (await supabase.from("models_3d").update({ processing_status: "generating", error_message: null }).eq("id", existing.id).select().single()).data
      : (await supabase.from("models_3d").insert({ product_id: productId, processing_status: "generating" }).select().single()).data;

    await supabase.from("ar_products").update({
      status: "processing", processing_step: "mockup_generation", processing_progress: 70, error_message: null,
    }).eq("id", productId);

    try {
      const dataUrl = await storagePathToDataUrl(supabase, product.original_image_url);

      const { mime, bytes } = await callGeminiHero(dataUrl, promptForCategory((product as any).ar_mode, (product as any).ar_subtype));
      const ext = mime === "image/jpeg" ? "jpg" : "png";
      const path = `${userId}/${productId}/preview.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images")
        .upload(path, bytes, { contentType: mime, upsert: true });
      if (upErr) throw upErr;

      await supabase.from("models_3d").update({ preview_url: path, processing_status: "done", error_message: null }).eq("id", modelRow!.id);

      await supabase.from("ar_products").update({
        processed_image_url: path,
        status: "ready",
        processing_step: "complete",
        processing_progress: 100,
        error_message: null,
      }).eq("id", productId);
      return { ok: true as const, previewPath: path };
    } catch (e: any) {
      await supabase.from("models_3d").update({ processing_status: "failed", error_message: String(e?.message ?? e) }).eq("id", modelRow!.id);
      await supabase.from("ar_products").update({
        processed_image_url: product.original_image_url,
        status: "ready",
        processing_step: "complete_with_fallback",
        processing_progress: 100,
        error_message: String(e?.message ?? e),
      }).eq("id", productId);
      return { ok: false as const, reason: String(e?.message ?? e) };
    }
  });

