import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Input = z.object({
  productId: z.string().uuid(),
  captureBase64: z.string().min(100).max(15_000_000),
  mode: z.enum(["fashion", "furniture"]),
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
            .select("id, original_image_url, processed_image_url, is_public, status, ar_mode")
            .eq("id", data.productId)
            .maybeSingle();
          if (error || !prod) return Response.json({ error: "Product not found" }, { status: 404, headers: CORS });
          if (!prod.is_public || prod.status !== "ready") {
            return Response.json({ error: "Product not available" }, { status: 403, headers: CORS });
          }

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

          const prompt =
            data.mode === "fashion"
              ? `Virtual try-on. FIRST image: a person. SECOND image: a clothing item (shirt / t-shirt / top). Generate a photorealistic image of the SAME person wearing the clothing item. Preserve the person's face, hair, pose, body shape, skin tone, lighting and background exactly. The clothing must fit naturally with realistic folds, shadows, and shading matching the scene light. Return only the resulting image.`
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
