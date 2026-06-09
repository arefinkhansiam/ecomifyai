import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const DEMOS = {
  tshirt: {
    url: "/__l5e/assets-v1/9581e0a2-a4ba-4162-a3f2-989de1b4e912/demo-tshirt.jpg",
    mode: "fashion" as const,
    subtype: "top" as const,
  },
  chair: {
    url: "/__l5e/assets-v1/6240ca04-fe61-4006-a8a4-18f94072d970/demo-chair.jpg",
    mode: "furniture" as const,
    subtype: undefined,
  },
  lipstick: {
    url: "/__l5e/assets-v1/8abc5fa8-a667-4974-94eb-4acc4a6527d5/demo-lipstick.jpg",
    mode: "makeup" as const,
    subtype: undefined,
  },
};

const Input = z.object({
  demo: z.enum(["tshirt", "chair", "lipstick"]),
  captureBase64: z.string().min(100).max(15_000_000),
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function fetchAsDataUrl(url: string): Promise<string> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`fetch demo product (${r.status})`);
  const ct = r.headers.get("content-type") || "image/jpeg";
  const buf = new Uint8Array(await r.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
  return `data:${ct};base64,${btoa(bin)}`;
}

export const Route = createFileRoute("/api/public/tryon-demo")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const data = Input.parse(body);
          const demo = DEMOS[data.demo];

          const origin = new URL(request.url).origin;
          const productUrl = demo.url.startsWith("http") ? demo.url : `${origin}${demo.url}`;
          const productDataUrl = await fetchAsDataUrl(productUrl);
          const captureDataUrl = data.captureBase64.startsWith("data:")
            ? data.captureBase64
            : `data:image/jpeg;base64,${data.captureBase64}`;

          const key = process.env.LOVABLE_API_KEY;
          if (!key) return Response.json({ error: "AI not configured" }, { status: 500, headers: CORS });

          let prompt: string;
          if (demo.mode === "fashion") {
            prompt = `Virtual try-on. Image 1: a person standing. Image 2: the product (a t-shirt). Render a photorealistic image of the SAME person wearing this t-shirt. Preserve face, hair, pose, body shape, skin tone, lower-body clothing, lighting and background EXACTLY. The garment must drape naturally with realistic folds, shadows and shading matching scene light. Match the t-shirt's exact colour and any logo. Return only the resulting image.`;
          } else if (demo.mode === "makeup") {
            prompt = `Virtual makeup try-on. Image 1: a selfie of a person's face. Image 2: a lipstick product (use the bullet colour as reference). Apply that lipstick shade photorealistically to the person's lips. Preserve identity, facial features, pose, hair, skin texture, lighting and background EXACTLY. Match the product's exact shade, opacity and finish. No skin smoothing, no face changes, no filters. Return only the resulting image.`;
          } else {
            prompt = `Interior visualisation. Image 1: a real room photo. Image 2: a furniture product. Place this furniture naturally inside the room — correct perspective, realistic scale, ground-contact shadow, lighting matching the room. Remove the product's original background. Keep the room background unchanged. Return only the resulting image.`;
          }

          const content: any[] = [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: captureDataUrl } },
            { type: "image_url", image_url: { url: productDataUrl } },
          ];

          const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image",
              messages: [{ role: "user", content }],
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
