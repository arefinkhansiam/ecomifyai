import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Payload = z.object({
  product_id: z.string().uuid(),
  session_id: z.string().min(1).max(128),
  user_agent: z.string().max(1024).optional().nullable(),
  referrer: z.string().max(2048).optional().nullable(),
  time_spent_seconds: z.number().int().min(0).max(86400).optional().default(0),
  camera_used: z.enum(["front", "back", "unknown"]).optional().nullable(),
  ar_mode: z.string().max(64).optional().nullable(),
  did_interact: z.boolean().optional().default(false),
  did_close_manually: z.boolean().optional().default(false),
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function parseDevice(ua: string | null | undefined): { device: string; os: string } {
  const u = (ua || "").toLowerCase();
  let device = "desktop";
  if (/ipad|tablet/.test(u)) device = "tablet";
  else if (/mobi|android|iphone/.test(u)) device = "mobile";
  let os = "other";
  if (/iphone|ipad|ios/.test(u)) os = "iOS";
  else if (/android/.test(u)) os = "Android";
  else if (/windows/.test(u)) os = "Windows";
  else if (/mac os|macintosh/.test(u)) os = "macOS";
  else if (/linux/.test(u)) os = "Linux";
  return { device, os };
}

async function lookupCountry(ip: string | null): Promise<string | null> {
  if (!ip || ip === "unknown") return null;
  try {
    const r = await fetch(`https://ipapi.co/${ip}/country_name/`, { signal: AbortSignal.timeout(2000) });
    if (!r.ok) return null;
    const t = (await r.text()).trim();
    return t && t.length < 64 ? t : null;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/public/track-ar-session")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const json = await request.json();
          const data = Payload.parse(json);
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          // Resolve vendor_id from product
          const { data: prod } = await supabaseAdmin
            .from("ar_products")
            .select("user_id")
            .eq("id", data.product_id)
            .maybeSingle();
          if (!prod) return new Response(JSON.stringify({ error: "Unknown product" }), { status: 404, headers: { ...CORS, "Content-Type": "application/json" } });

          const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || null;
          const country = await lookupCountry(ip);
          const { device, os } = parseDevice(data.user_agent);

          await supabaseAdmin.from("ar_sessions").insert({
            product_id: data.product_id,
            vendor_id: prod.user_id,
            session_id: data.session_id,
            user_agent: data.user_agent ?? null,
            referrer: data.referrer ?? null,
            country,
            time_spent_seconds: data.time_spent_seconds ?? 0,
            camera_used: data.camera_used ?? null,
            ar_mode: data.ar_mode ?? null,
            did_interact: data.did_interact ?? false,
            did_close_manually: data.did_close_manually ?? false,
            device_type: device,
            os_type: os,
          });

          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: e?.message ?? "bad request" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
        }
      },
    },
  },
});
