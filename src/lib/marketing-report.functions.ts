import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({ productId: z.string().uuid() });

export const generateMarketingReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Confirm ownership
    const { data: prod } = await supabase
      .from("ar_products")
      .select("id, product_name, user_id")
      .eq("id", data.productId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!prod) throw new Error("Product not found");

    const { data: sessions } = await supabase
      .from("ar_sessions")
      .select("created_at, country, device_type, os_type, time_spent_seconds, did_interact, camera_used")
      .eq("product_id", data.productId)
      .order("created_at", { ascending: false })
      .limit(1000);

    const rows = sessions ?? [];
    const total = rows.length;
    if (total === 0) {
      return { report: `No customer sessions yet for **${prod.product_name}**. Share your Try-On link or embed the widget on product pages, then run this report again to get tailored marketing recommendations.` };
    }

    const counts = <T extends string | null | undefined>(key: (r: any) => T) =>
      rows.reduce<Record<string, number>>((m, r) => { const k = String(key(r) ?? "unknown"); m[k] = (m[k] ?? 0) + 1; return m; }, {});
    const byCountry = counts((r) => r.country);
    const byDevice = counts((r) => r.device_type);
    const byOs = counts((r) => r.os_type);
    const byHour = rows.reduce<Record<number, number>>((m, r) => { const h = new Date(r.created_at).getUTCHours(); m[h] = (m[h] ?? 0) + 1; return m; }, {});
    const avgTime = rows.reduce((s, r) => s + (r.time_spent_seconds ?? 0), 0) / total;
    const interactRate = rows.filter((r) => r.did_interact).length / total;

    const summary = {
      product: prod.product_name,
      total_sessions: total,
      avg_time_seconds: Math.round(avgTime),
      interaction_rate_percent: Math.round(interactRate * 100),
      top_countries: Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 5),
      device_split: byDevice,
      os_split: byOs,
      hourly_distribution_utc: byHour,
    };

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI service not configured");

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a senior e-commerce marketing analyst. Write concise, actionable reports in plain English using markdown. Sections required: Overview, Best-performing times, Top devices, Top countries, Engagement quality score (0-100 with one-line rationale), 3 Actionable Recommendations (numbered list). Keep under 400 words." },
          { role: "user", content: `Generate a marketing report from these Try-On engagement metrics:\n\n${JSON.stringify(summary, null, 2)}` },
        ],
      }),
    });

    if (r.status === 429) throw new Error("AI rate limit reached. Try again in a moment.");
    if (r.status === 402) throw new Error("AI credits exhausted. Add credits in workspace billing.");
    if (!r.ok) throw new Error(`AI gateway error (${r.status})`);
    const j = await r.json();
    const report: string = j?.choices?.[0]?.message?.content ?? "No report generated.";
    return { report };
  });
