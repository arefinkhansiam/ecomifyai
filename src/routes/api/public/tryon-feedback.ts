import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const FeedbackInput = z.object({
  productId: z.string().uuid(),
  sessionId: z.string().min(4).max(80),
  liked: z.boolean(),
  comment: z.string().max(500).optional(),
});

export const Route = createFileRoute("/api/public/tryon-feedback")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const data = FeedbackInput.parse(body);
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin.from("tryon_feedback").insert({
            product_id: data.productId,
            session_id: data.sessionId,
            liked: data.liked,
            comment: data.comment ?? null,
          });
          if (error) return Response.json({ error: error.message }, { status: 500, headers: CORS });
          return Response.json({ ok: true }, { headers: CORS });
        } catch (e: any) {
          return Response.json({ error: e?.message ?? "Bad request" }, { status: 400, headers: CORS });
        }
      },
    },
  },
});
