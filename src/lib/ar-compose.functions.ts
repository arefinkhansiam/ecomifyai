import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  productId: z.string().uuid(),
  // data URL or base64 string of customer-captured photo
  captureBase64: z.string().min(100).max(15_000_000),
  mode: z.enum(["fashion", "furniture"]),
});

async function fetchAsDataUrl(url: string): Promise<string> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Failed to fetch product image (${r.status})`);
  const ct = r.headers.get("content-type") || "image/jpeg";
  const buf = new Uint8Array(await r.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
  const b64 = btoa(bin);
  return `data:${ct};base64,${b64}`;
}

export const composeArScene = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI service not configured");

    // Load product image (public read OK — anyone with a valid product link can view)
    const { data: prod, error } = await supabase
      .from("ar_products")
      .select("id, product_name, original_image_url, processed_image_url, is_public, status")
      .eq("id", data.productId)
      .maybeSingle();
    if (error || !prod) throw new Error("Product not found");
    if (!prod.is_public || prod.status !== "ready") throw new Error("Product not available");

    // Resolve a usable image URL for the product
    let productImageUrl = prod.processed_image_url as string | null;
    if (!productImageUrl && prod.original_image_url) {
      const { data: signed } = await supabase.storage
        .from("product-images")
        .createSignedUrl(prod.original_image_url, 3600);
      productImageUrl = signed?.signedUrl ?? null;
    }
    if (!productImageUrl) throw new Error("Product image missing");

    const productDataUrl = await fetchAsDataUrl(productImageUrl);

    // Normalise capture
    const captureDataUrl = data.captureBase64.startsWith("data:")
      ? data.captureBase64
      : `data:image/jpeg;base64,${data.captureBase64}`;

    const prompt =
      data.mode === "fashion"
        ? `You are a virtual try-on engine. The FIRST image is a person. The SECOND image is a clothing item (shirt, t-shirt, or top). Generate a photorealistic image of the SAME person wearing the clothing item, preserving the person's face, hair, pose, body shape, lighting, and background exactly. The clothing should fit naturally with realistic folds, shadows and shading. Return only the resulting image.`
        : `You are an interior visualisation engine. The FIRST image is a real room photo from a customer's phone. The SECOND image is a product (furniture or decor) on its own. Place the product naturally inside the room: realistic perspective, scale, shadows, and lighting that match the room. Preserve the room background unchanged. If the product image has a background, remove it before placing. Return only the resulting composed image.`;

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

    if (r.status === 429) throw new Error("AI rate limit reached. Try again in a moment.");
    if (r.status === 402) throw new Error("AI credits exhausted. Add credits in workspace billing.");
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(`AI gateway error (${r.status}): ${t.slice(0, 200)}`);
    }
    const j = await r.json();
    const msg = j?.choices?.[0]?.message;
    const imageUrl: string | undefined =
      msg?.images?.[0]?.image_url?.url ??
      msg?.images?.[0]?.url ??
      undefined;
    if (!imageUrl) throw new Error("AI did not return an image");
    return { imageUrl };
  });
