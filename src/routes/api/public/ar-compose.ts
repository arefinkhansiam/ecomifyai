import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Input = z.object({
  productId: z.string().uuid(),
  captureBase64: z.string().min(100).max(15_000_000),
  mode: z.enum(["fashion", "furniture", "makeup"]),
  subtype: z.enum(["top", "bottom", "accessory", "jewellery"]).optional(),
});

async function fetchAsDataUrl(url: string): Promise<string> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`fetch product (${r.status})`);
  const ct = r.headers.get("content-type") || "image/jpeg";
  const buf = new Uint8Array(await r.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
  return `data:${ct};base64,${btoa(bin)}`;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function normalizeCapture(input: string) {
  return input.startsWith("data:") ? input : `data:image/jpeg;base64,${input}`;
}

function successfulFallback(captureDataUrl: string, reason?: string) {
  return Response.json({ imageUrl: captureDataUrl, fallback: true, reason }, { headers: CORS });
}

export const Route = createFileRoute("/api/public/ar-compose")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let parsedBody: unknown = null;
        try {
          parsedBody = await request.json();
          const data = Input.parse(parsedBody);
          const captureDataUrl = normalizeCapture(data.captureBase64);

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          const { data: prod, error } = await supabaseAdmin
            .from("ar_products")
            .select("id, original_image_url, processed_image_url, extra_images, is_public, status, ar_mode, ar_subtype")
            .eq("id", data.productId)
            .maybeSingle();
          if (error || !prod) return Response.json({ error: "Product not found" }, { status: 404, headers: CORS });
          if (!prod.is_public || prod.status !== "ready") {
            return Response.json({ error: "Product not available" }, { status: 403, headers: CORS });
          }
          const subtype = (data.subtype ?? (prod as any).ar_subtype) as
            | "top" | "bottom" | "accessory" | "jewellery" | null | undefined;

          // Collect every available product angle: processed hero + original + vendor-uploaded extras.
          const paths: string[] = [];
          if ((prod as any).processed_image_url) paths.push((prod as any).processed_image_url);
          if (prod.original_image_url && prod.original_image_url !== (prod as any).processed_image_url) {
            paths.push(prod.original_image_url);
          }
          const extras = ((prod as any).extra_images as string[] | null) ?? [];
          for (const p of extras) if (p && !paths.includes(p)) paths.push(p);

          if (paths.length === 0) return successfulFallback(captureDataUrl, "product_image_missing");

          const signed = await Promise.all(paths.map(async (p) => {
            // If already a fully-qualified URL, use as-is.
            if (/^https?:\/\//i.test(p)) return p;
            const { data: s } = await supabaseAdmin.storage.from("product-images").createSignedUrl(p, 3600);
            return s?.signedUrl ?? null;
          }));
          const productUrls = signed.filter((u): u is string => !!u).slice(0, 5);
          if (productUrls.length === 0) return successfulFallback(captureDataUrl, "product_image_unavailable");

          const productDataUrls = await Promise.all(productUrls.map(fetchAsDataUrl));

          const key = process.env.LOVABLE_API_KEY;
          if (!key) return successfulFallback(captureDataUrl, "AI not configured");

          const angleNote = productDataUrls.length > 1
            ? `Images 2 through ${productDataUrls.length + 1} are MULTIPLE ANGLES (front / back / side / detail) of the SAME product — use them together to understand the product's true shape, colour, fabric/material, and details from every side.`
            : `Image 2 is the product.`;

          const fashionPrompt = (() => {
            if (subtype === "bottom") {
              return `Virtual try-on. Image 1: a customer photo. ${angleNote} Render a photorealistic image of the SAME person wearing this bottom garment (pants / jeans / trousers / skirt / shorts). Work even if the photo is low quality, cropped, blurry, dim, or the full body is not perfectly visible: infer the missing fit naturally and keep the original photo as much as possible. Preserve the person's face, hair, pose, upper body, skin tone, lighting and background EXACTLY. Replace ONLY the bottom garment — natural fit, accurate length, realistic folds, shadows matching the scene light. Use all reference angles to keep colour, pattern and back details accurate. Do NOT change shoes, top, accessories or background. Return only the resulting image.`;
            }
            if (subtype === "accessory") {
              return `Virtual try-on. Image 1: a customer photo. ${angleNote} Place this accessory (watch / bag / hat / glasses / shoes / belt) on the SAME person in its natural location. Work even if the photo is low quality, cropped, blurry, dim, or the target body part is only partly visible: infer placement naturally and keep the original photo as much as possible. Preserve face, hair, pose, body shape, skin tone, clothing, lighting and background EXACTLY. Match scale, perspective and shadows. Use all reference angles for accurate shape and details. Return only the resulting image.`;
            }
            if (subtype === "jewellery") {
              return `Virtual jewellery try-on. Image 1: a customer photo. ${angleNote} Place the jewellery photorealistically on the correct body part. Work even if the photo is low quality, cropped, blurry, dim, or the target body part is only partly visible: infer placement naturally and keep the original photo as much as possible. Match metal reflections, gemstone sparkle, scale and scene shadows. Preserve identity, skin texture, hair, pose, clothing and background EXACTLY. Use all reference angles for accurate detail. Return only the resulting image.`;
            }
            return `Virtual try-on. Image 1: a customer photo. ${angleNote} Render a photorealistic image of the SAME person wearing this top garment (shirt / t-shirt / blouse / jacket / dress). Work even if the photo is low quality, cropped, blurry, dim, or the body is not perfectly visible: infer the visible fit naturally and keep the original photo as much as possible. Preserve face, hair, pose, body shape, skin tone, lower-body clothing, lighting and background EXACTLY. The garment must drape naturally with realistic folds, shadows and shading matching scene light. Use all reference angles to keep colour, pattern and back details accurate. Return only the resulting image.`;
          })();

          const prompt =
            data.mode === "fashion"
              ? fashionPrompt
              : data.mode === "makeup"
              ? `Virtual makeup try-on. Image 1: a selfie of a person's face. ${angleNote} Use the product as the COLOR + FINISH reference. Apply that makeup photorealistically to the person (lips for lipstick, eyelids for eyeshadow, cheeks for blush, full face for foundation). Preserve identity, facial features, pose, hair, skin texture, lighting and background EXACTLY. Match the product's exact shade, opacity and finish (matte / glossy / shimmer). No skin smoothing, no face changes, no filters. Return only the resulting image.`
              : `Interior visualisation. Image 1: a real room photo. ${angleNote} Place this furniture / decor item naturally inside the room — correct perspective, realistic scale, ground-contact shadow, lighting matching the room. Remove the product's original background. Keep the room background unchanged. Use all reference angles to render the product from the correct viewing angle for the room scene. Return only the resulting image.`;

          const content: any[] = [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: captureDataUrl } }];
          for (const u of productDataUrls) content.push({ type: "image_url", image_url: { url: u } });

          const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image",
              messages: [{ role: "user", content }],
              modalities: ["image", "text"],
            }),
          });

          if (r.status === 429) { console.warn("[ar-compose] gateway 429 busy"); return successfulFallback(captureDataUrl, "busy"); }
          if (r.status === 402) { console.warn("[ar-compose] gateway 402 credits"); return successfulFallback(captureDataUrl, "credits_exhausted"); }
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            console.error("[ar-compose] gateway error", r.status, t.slice(0, 400));
            return successfulFallback(captureDataUrl, `AI error (${r.status}): ${t.slice(0, 120)}`);
          }
          const j = await r.json();
          const msg = j?.choices?.[0]?.message;
          const imageUrl: string | undefined =
            msg?.images?.[0]?.image_url?.url ?? msg?.images?.[0]?.url ?? undefined;
          if (!imageUrl) {
            console.error("[ar-compose] no image in response", JSON.stringify(j).slice(0, 500));
            return successfulFallback(captureDataUrl, "no_image_returned");
          }
          return Response.json({ imageUrl, anglesUsed: productDataUrls.length }, { headers: CORS });

        } catch (e: any) {
          const fallback = (parsedBody as any)?.captureBase64 ? normalizeCapture(String((parsedBody as any).captureBase64)) : null;
          if (fallback) return successfulFallback(fallback, e?.message ?? "Bad request");
          return Response.json({ error: e?.message ?? "Bad request" }, { status: 400, headers: CORS });
        }
      },
    },
  },
});
