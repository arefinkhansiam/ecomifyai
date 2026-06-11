import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM = `You are Ecomify Assistant — a friendly, concise support agent inside the Ecomify Try-On dashboard.
Ecomify lets store owners turn product photos into AR/virtual try-ons for Shopify, WooCommerce, Wix, Squarespace, Webflow, or any custom website.

Core capabilities you help with:
- Uploading product photos and creating new try-ons (Dashboard → New Try-On).
- Customizing the Try-On button (colors, gradient, glow) under each product → Edit.
- Sharing try-ons via direct link, QR code, Universal website script, Shopify Liquid snippet, or iframe (each product card → Share).
- Reading analytics: views, try-ons completed, like rate, share rate, funnel, geo, devices, leaderboard.
- Billing & plans: Free (1 product), Starter $10 (10), Growth $39 (50, brand colors, recommendations), Pro $79 (unlimited).
- Profile, integrations, and notification preferences.

Style: short answers (2-4 sentences max), step-by-step when needed, use plain language. If unsure, say so and suggest Contact support.
Never invent features or prices. Never expose internal IDs.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) return new Response("Messages required", { status: 400 });
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
