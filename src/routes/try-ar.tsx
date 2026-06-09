import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, UploadCloud, Wand2, Share2 } from "lucide-react";
import { MarketingShell } from "@/components/MarketingShell";
import { InlineTryOnDemo } from "@/components/InlineTryOnDemo";

export const Route = createFileRoute("/try-ar")({
  head: () => ({
    meta: [
      { title: "Try It On — Live AI Photo Try-On Demo | Ecomify" },
      { name: "description", content: "Try our AI photo try-on right now. Pick a sample t-shirt, chair, or lipstick — upload your photo and see the result in seconds. No signup." },
      { property: "og:title", content: "Try It On — Ecomify AI Try-On Demo" },
      { property: "og:description", content: "Photoreal try-on from a single photo. Try a t-shirt, place a chair, swatch a lipstick — instantly." },
    ],
  }),
  component: TryItOnPage,
});

function TryItOnPage() {
  return (
    <MarketingShell>
      <section className="relative">
        <div className="absolute inset-0 -z-10 opacity-70"
          style={{ background: "radial-gradient(ellipse 900px 500px at 50% 0%, rgba(14,165,233,0.22), transparent 70%)" }} />
        <div className="mx-auto max-w-5xl px-6 pt-16 pb-6 text-center">
          <h1 className="mt-4 text-gradient-ocean">See it on you in seconds.</h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg">
            Pick a sample product, upload one photo of yourself or your room, and watch our AI render a photoreal try-on right here. This is exactly what your shoppers see.
          </p>
        </div>

        <div className="mx-auto max-w-5xl px-6 pb-12">
          <InlineTryOnDemo />
        </div>

        <div className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: UploadCloud, t: "1. Pick a product", d: "T-shirt for fashion, armchair for furniture, lipstick for makeup. One tap to switch." },
              { icon: Wand2, t: "2. Upload your photo", d: "A selfie, full-body shot, or room photo. Our AI handles the rest using Google Gemini." },
              { icon: Share2, t: "3. Download or share", d: "Save the result, share it directly from your phone, or come back and try a different product." },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl p-5 border bg-white" style={{ borderColor: "rgba(2,132,199,0.18)", boxShadow: "0 14px 30px -18px rgba(2,132,199,0.25)" }}>
                <div className="w-11 h-11 rounded-xl grid place-items-center text-white" style={{ background: "linear-gradient(135deg,#0369A1,#38BDF8)" }}>
                  <f.icon size={18} />
                </div>
                <div className="mt-3 font-display font-bold text-ink">{f.t}</div>
                <p className="mt-1 text-sm text-muted">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
