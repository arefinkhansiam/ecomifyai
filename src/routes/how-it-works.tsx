import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell } from "@/components/MarketingShell";
import { Camera, Sparkles, Share2 } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Easibie Works — From Photo to AR in Seconds" },
      { name: "description", content: "See exactly how Easibie turns a product photo into a live, shareable AR experience your customers can view in their own space." },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  const steps = [
    { icon: Camera, title: "Upload your product photo", body: "JPG, PNG or WebP. Any background. We accept files up to 10MB. Our processing pipeline scans the photo for shape, edges and dominant color." },
    { icon: Sparkles, title: "Our AI generates your AR experience", body: "The platform removes the background, computes spatial dimensions, picks a dominant color and produces a model-viewer ready scene with a poster and fallback layout." },
    { icon: Share2, title: "Share with a link, QR code or embed", body: "Every product gets a public AR viewer URL, a downloadable QR code and an embed snippet you can drop into Shopify, WooCommerce or any custom site." },
  ];
  return (
    <MarketingShell>
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="pill">How It Works</span>
          <h1 className="mt-6 text-white">From photo to AR in under a minute</h1>
          <p className="mt-6 text-lg">No 3D software. No developer. No app downloads for your customers.</p>
        </div>
        <div className="mx-auto max-w-5xl px-6 mt-16 space-y-6">
          {steps.map((s, i) => (
            <div key={i} className="bg-card rounded-2xl p-8 flex flex-col md:flex-row gap-6">
              <div className="w-16 h-16 rounded-2xl grid place-items-center shrink-0" style={{ background: "rgba(124,58,237,0.15)" }}>
                <s.icon size={28} className="text-[var(--lavender)]" />
              </div>
              <div>
                <div className="text-xs text-cyan font-bold tracking-widest">STEP {String(i+1).padStart(2,"0")}</div>
                <h3 className="text-white mt-1">{s.title}</h3>
                <p className="mt-2">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
