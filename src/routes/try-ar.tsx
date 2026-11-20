import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, UploadCloud, Wand2, Share2 } from "lucide-react";
import { MarketingShell } from "@/components/MarketingShell";
import { InlineTryOnDemo } from "@/components/InlineTryOnDemo";

export const Route = createFileRoute("/try-ar")({
  head: () => ({
    meta: [
      { title: "Try It On — Live AI Photo Try-On Demo | Easibie" },
      { name: "description", content: "Try our AI photo try-on right now. Pick a sample t-shirt, chair, or lipstick — upload your photo and see the result in seconds. No signup." },
      { property: "og:title", content: "Try It On — Easibie AI Try-On Demo" },
      { property: "og:description", content: "Photoreal try-on from a single photo. Try a t-shirt, place a chair, swatch a lipstick — instantly." },
    ],
  }),
  component: TryItOnPage,
});

function TryItOnPage() {
  return (
    <MarketingShell>
      <section className="relative px-4 pt-6">
        <div className="mx-auto max-w-6xl card-soft px-6 md:px-14 pt-16 pb-10 text-center relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-40 blob" style={{ background: "radial-gradient(circle, #C7BEEB, transparent 70%)" }} />
          <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full opacity-40 blob" style={{ background: "radial-gradient(circle, #A99BF0, transparent 70%)" }} />
          <div className="relative">
            <span className="pill"><Sparkles size={12} /> Interactive Fitting Studio</span>
            <h1 className="mt-5 text-ink">See it on you in <span className="italic">seconds.</span></h1>
            <p className="mt-5 max-w-2xl mx-auto text-[16px] text-[#6B6689] leading-relaxed">
              Pick a garment, upload one photo of yourself, and watch our AI drape the piece onto your body with natural fold dynamics. This is the exact interactive experience your shoppers see on product pages.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-12">
          <InlineTryOnDemo />
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-24">
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: UploadCloud, t: "1. Select Garment SKU", d: "Choose any catalog apparel piece with flat-lay or model photography." },
              { icon: Wand2, t: "2. Shopper Uploads Photo", d: "Standard selfie or full-body shot. No mobile app download required." },
              { icon: Share2, t: "3. Photoreal On-Body Drape", d: "Accurate cloth tension and shadow alignment in under 2 seconds." },
            ].map((f) => (
              <div key={f.t} className="card-tile p-6">
                <div className="w-11 h-11 rounded-xl bg-[#F3F0FE] grid place-items-center text-[#1F1747]">
                  <f.icon size={18} />
                </div>
                <div className="mt-4 font-display font-bold text-ink text-[16px]">{f.t}</div>
                <p className="mt-2 text-[13px] text-[#6B6689] leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
