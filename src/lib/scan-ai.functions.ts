import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({ productId: z.string().uuid() });

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
      .from("ar_products").select("id, user_id, product_name")
      .eq("id", productId).maybeSingle();
    if (!product || product.user_id !== userId) throw new Error("Not found");

    // mark generating
    const { data: existing } = await supabase
      .from("models_3d").select("id").eq("product_id", productId).maybeSingle();
    const modelRow = existing?.id
      ? (await supabase.from("models_3d").update({ processing_status: "generating", error_message: null }).eq("id", existing.id).select().single()).data
      : (await supabase.from("models_3d").insert({ product_id: productId, processing_status: "generating" }).select().single()).data;

    await supabase.from("ar_products").update({
      status: "processing", processing_step: "ai_preview", processing_progress: 60,
    }).eq("id", productId);

    try {
      // Pick frame ~middle
      const { data: frames } = await supabase
        .from("scan_frames").select("frame_url, frame_number")
        .eq("product_id", productId).order("frame_number", { ascending: true });
      if (!frames || frames.length === 0) throw new Error("No scan frames");
      const primary = frames[Math.floor(frames.length / 2)];

      // Sign the frame so we can fetch its bytes
      const { data: signed } = await supabase.storage
        .from("product-images").createSignedUrl(primary.frame_url, 600);
      if (!signed?.signedUrl) throw new Error("Could not read scan frame");
      const imgRes = await fetch(signed.signedUrl);
      const imgBuf = await imgRes.arrayBuffer();
      const imgB64 = Buffer.from(imgBuf).toString("base64");
      const dataUrl = `data:image/jpeg;base64,${imgB64}`;

      // Lovable AI Gateway: image edit via Gemini
      const apiKey = process.env.LOVABLE_API_KEY;
      if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

      const ai = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{
            role: "user",
            content: [
              { type: "text", text: "Recreate this product as a clean studio 3D-style hero render: centered, soft neutral background, subtle ground shadow, even product lighting, photoreal materials, no people, no text. Keep the exact product shape and color." },
              { type: "image_url", image_url: { url: dataUrl } },
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
      const mime = m[1];
      const bytes = Buffer.from(m[2], "base64");
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
      await supabase.from("models_3d").update({
        processing_status: "failed", error_message: String(e?.message ?? e),
      }).eq("id", modelRow!.id);
      await supabase.from("ar_products").update({
        status: "failed", error_message: String(e?.message ?? e),
      }).eq("id", productId);
      throw e;
    }
  });
