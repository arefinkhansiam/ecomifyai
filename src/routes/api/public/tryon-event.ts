import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const Input = z.object({
  productId: z.string().uuid(),
  sessionId: z.string().min(4).max(80).optional(),
  eventType: z.enum(["tryon_started", "tryon_completed", "like", "dislike", "share", "wishlist", "alternative_selected", "download"]),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const Route = createFileRoute("/api/public/tryon-event")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const data = Input.parse(await request.json());
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: prod } = await supabaseAdmin
            .from("ar_products").select("user_id").eq("id", data.productId).maybeSingle();
          if (!prod) return Response.json({ error: "Product not found" }, { status: 404, headers: CORS });
          const { error } = await supabaseAdmin.from("tryon_events" as any).insert({
            product_id: data.productId,
            vendor_id: (prod as any).user_id,
            session_id: data.sessionId ?? null,
            event_type: data.eventType,
            metadata: data.metadata ?? {},
          } as any);
          if (error) return Response.json({ error: error.message }, { status: 500, headers: CORS });
          return Response.json({ ok: true }, { headers: CORS });
        } catch (e: any) {
          return Response.json({ error: e?.message ?? "Bad request" }, { status: 400, headers: CORS });
        }
      },
    },
  },
});
