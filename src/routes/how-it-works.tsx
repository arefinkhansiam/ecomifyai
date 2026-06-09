import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingShell } from "@/components/MarketingShell";
import { UploadCloud, ImagePlus, Wand2, Share2, Sparkles, BarChart2, ShieldCheck, Smartphone } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Easibie Works — AI Photo Try-On in Seconds" },
      { name: "description", content: "From product photo to photoreal AI try-on in under a minute. See exactly how Easibie turns a single photo into a shareable try-on shoppers love." },
    ],
  }),
  component: HowItWorks,
});

const GRAD = "linear-gradient(135deg, #0B1220 0%, #0369A1 50%, #38BDF8 100%)";

function HowItWorks() {
  const steps = [
    { icon: UploadCloud, title: "Upload your product photos", body: "JPG, PNG or WebP — front, back, side and detail shots. The more angles you upload, the more accurate the AI try-on result." },
    { icon: ImagePlus, title: "Shopper uploads their own photo", body: "A selfie, full-body shot, or photo of their room. No app install, no AR headset, works on any phone or laptop browser." },
    { icon: Wand2, title: "AI generates a photoreal try-on", body: "Google Gemini composes a realistic try-on preserving the shopper's face, pose, lighting and background. Usually 10–20 seconds." },
    { icon: Share2, title: "Share, embed, sell", body: "Every product gets a public try-on link, a downloadable QR code and an embed snippet for Shopify, WooCommerce or any custom site." },
  ];
  const perks = [
    { icon: Smartphone, t: "Works on any phone", d: "Browser-based — no app, no AR support needed." },
    { icon: BarChart2, t: "Built-in analytics", d: "Sessions, conversion, devices and bounce — for every product." },
    { icon: ShieldCheck, t: "Private & secure", d: "Shopper photos are processed for the try-on only — never used for training." },
  ];
  return (
    <MarketingShell>
      <section className="relative">
        <div className="absolute inset-0 -z-10 opacity-70" style={{ background: "radial-gradient(ellipse 900px 500px at 50% 0%, rgba(14,165,233,0.22), transparent 70%)" }} />
        <div className="mx-auto max-w-3xl px-6 pt-20 pb-10 text-center">
          <span className="pill"><Sparkles size={14} /> How it works</span>
          <h1 className="mt-5 text-gradient-ocean">From photo to try-on in under a minute.</h1>
          <p className="mt-5 text-lg" style={{ color: "var(--ink-soft)" }}>No 3D software. No developer. No app downloads for your customers.</p>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-5xl px-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {steps.map((s, i) => (
            <div key={i} className="rounded-2xl p-6 relative overflow-hidden"
              style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(14px)", border: "1px solid rgba(2,132,199,0.18)", boxShadow: "0 22px 50px -28px rgba(2,132,199,0.4)" }}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl grid place-items-center text-white shrink-0" style={{ background: GRAD, boxShadow: "0 12px 26px -10px rgba(2,132,199,0.55)" }}>
                  <s.icon size={24} />
                </div>
                <div>
                  <div className="text-[11px] font-bold tracking-widest" style={{ color: "var(--primary)" }}>STEP {String(i+1).padStart(2,"0")}</div>
                  <h3 className="font-display font-bold mt-1 text-ink text-xl">{s.title}</h3>
                  <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16" style={{ background: "linear-gradient(180deg, transparent, rgba(2,132,199,0.06), transparent)" }}>
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-gradient-ocean">Why store owners love it.</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {perks.map((p) => (
              <div key={p.t} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(2,132,199,0.18)", boxShadow: "0 14px 30px -18px rgba(2,132,199,0.3)" }}>
                <div className="w-11 h-11 rounded-xl grid place-items-center text-white" style={{ background: GRAD }}><p.icon size={18} /></div>
                <div className="mt-3 font-display font-bold text-ink">{p.t}</div>
                <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #02060c 0%, #0a1929 30%, #0369A1 70%, #38BDF8 100%)" }}>
        <div className="mx-auto max-w-3xl px-6 text-center relative">
          <h2 className="text-white">Ready to see it on your products?</h2>
          <p className="mt-3 text-white/85">Your first try-on product is free forever.</p>
          <div className="mt-7 flex flex-col sm:flex-row justify-center items-center gap-3">
            <Link to="/auth" search={{ mode: "signup" }} className="btn-primary" style={{ background: "#fff", color: "var(--primary)", minWidth: 220 }}>
              Start Free
            </Link>
            <Link to="/try-ar" className="text-sm font-semibold text-white/90 hover:text-white underline-offset-4 hover:underline px-4 py-2">Try the live demo →</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
