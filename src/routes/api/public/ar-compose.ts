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

export const Route = createFileRoute("/api/public/ar-compose")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const data = Input.parse(body);

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          const { data: prod, error } = await supabaseAdmin
            .from("ar_products")
            .select("id, original_image_url, processed_image_url, is_public, status, ar_mode, ar_subtype")
            .eq("id", data.productId)
            .maybeSingle();
          if (error || !prod) return Response.json({ error: "Product not found" }, { status: 404, headers: CORS });
          if (!prod.is_public || prod.status !== "ready") {
            return Response.json({ error: "Product not available" }, { status: 403, headers: CORS });
          }
          const subtype = (data.subtype ?? (prod as any).ar_subtype) as
            | "top" | "bottom" | "accessory" | "jewellery" | null | undefined;

          let productImageUrl = prod.processed_image_url as string | null;
          if (!productImageUrl && prod.original_image_url) {
            const { data: signed } = await supabaseAdmin.storage
              .from("product-images")
              .createSignedUrl(prod.original_image_url, 3600);
            productImageUrl = signed?.signedUrl ?? null;
          }
          if (!productImageUrl) return Response.json({ error: "Product image missing" }, { status: 422, headers: CORS });

          const productDataUrl = await fetchAsDataUrl(productImageUrl);
          const captureDataUrl = data.captureBase64.startsWith("data:")
            ? data.captureBase64
            : `data:image/jpeg;base64,${data.captureBase64}`;

          const key = process.env.LOVABLE_API_KEY;
          if (!key) return Response.json({ error: "AI not configured" }, { status: 500, headers: CORS });

          const fashionPrompt = (() => {
            if (subtype === "bottom") {
              return `Virtual try-on. FIRST image: a person standing. SECOND image: a bottom garment (pants / jeans / trousers / skirt / shorts). Generate a photorealistic image of the SAME person wearing the bottom garment. Preserve the person's face, hair, pose, upper body, skin tone, lighting and background EXACTLY. Replace only the bottom garment with the new one — fit naturally to the legs/waist, realistic folds, accurate length, shadows and shading matching the scene light. Do NOT change shoes, top, accessories or background. Return only the resulting image.`;
            }
            if (subtype === "accessory") {
              return `Virtual try-on. FIRST image: a person. SECOND image: a single accessory (watch / bag / hat / glasses / shoes / belt). Generate a photorealistic image of the SAME person wearing/holding ONLY that accessory in the natural location (watch on wrist, hat on head, glasses on face, bag in hand, shoes on feet). Preserve the person's face, hair, pose, body shape, skin tone, clothing, lighting and background EXACTLY. Match scale, perspective, and shadows. Do NOT change anything else. Return only the resulting image.`;
            }
            if (subtype === "jewellery") {
              return `Virtual jewellery try-on. FIRST image: a person (selfie or upper body). SECOND image: a piece of jewellery (necklace / earrings / ring / bracelet). Place the jewellery photorealistically on the correct body part (necklace on neckline, earrings on earlobes, ring on finger, bracelet on wrist). Match scale, metal reflections, gemstone sparkle, and shadows to the scene lighting. Preserve the person's identity, skin texture, hair, pose, clothing and background EXACTLY. Do NOT change face shape or smooth skin. Return only the resulting image.`;
            }
            // default: top / shirt / dress
            return `Virtual try-on. FIRST image: a person. SECOND image: a top garment (shirt / t-shirt / blouse / jacket / dress). Generate a photorealistic image of the SAME person wearing the top garment. Preserve the person's face, hair, pose, body shape, skin tone, lower-body clothing, lighting and background EXACTLY. The garment must fit naturally with realistic folds, shadows, and shading matching the scene light. Do NOT change anything besides the upper-body garment. Return only the resulting image.`;
          })();
          const prompt =
            data.mode === "fashion"
              ? fashionPrompt
              : data.mode === "makeup"
              ? `Virtual makeup try-on. FIRST image: a selfie of a person's face. SECOND image: a makeup product (lipstick / eyeshadow / foundation / blush / etc.) — use it as the COLOR and FINISH reference. Apply that makeup to the person's face photorealistically. Preserve the person's identity, facial features, pose, hair, skin texture, lighting, and background EXACTLY. Only modify the relevant area (lips for lipstick, eyelids for eyeshadow, cheeks for blush, full face for foundation). Match the product's exact shade, opacity, and finish (matte, glossy, shimmer). No skin smoothing, no face shape changes, no filters. Return only the resulting image.`
              : `Interior visualisation. FIRST image: a real room photo from a phone camera. SECOND image: a product (furniture / decor) on its own (possibly with a background). Place the product naturally inside the room with correct perspective, realistic scale, ground contact shadows, and lighting matching the room. Remove the product's original background. Keep the room background unchanged. Return only the resulting composed image.`;


          const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: captureDataUrl } },
                    { type: "image_url", image_url: { url: productDataUrl } },
                  ],
                },
              ],
              modalities: ["image", "text"],
            }),
          });

          if (r.status === 429) return Response.json({ error: "Busy, try again in a moment" }, { status: 429, headers: CORS });
          if (r.status === 402) return Response.json({ error: "AI credits exhausted" }, { status: 402, headers: CORS });
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            return Response.json({ error: `AI error (${r.status})`, detail: t.slice(0, 200) }, { status: 502, headers: CORS });
          }
          const j = await r.json();
          const msg = j?.choices?.[0]?.message;
          const imageUrl: string | undefined =
            msg?.images?.[0]?.image_url?.url ?? msg?.images?.[0]?.url ?? undefined;
          if (!imageUrl) return Response.json({ error: "No image returned" }, { status: 502, headers: CORS });
          return Response.json({ imageUrl }, { headers: CORS });
        } catch (e: any) {
          return Response.json({ error: e?.message ?? "Bad request" }, { status: 400, headers: CORS });
        }
      },
    },
  },
});
