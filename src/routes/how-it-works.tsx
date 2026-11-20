import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingShell } from "@/components/MarketingShell";
import { UploadCloud, ImagePlus, Wand2, Share2, Sparkles, BarChart2, ShieldCheck, Smartphone, ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Easibie Works — AI Photo Try-On in Seconds" },
      { name: "description", content: "From product photo to photoreal AI try-on in under a minute. See exactly how Easibie turns a single photo into a shareable try-on shoppers love." },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  const steps = [
    { icon: UploadCloud, title: "1. Merchant Syncs Product Photos", body: "Upload standard garment photography from your store or sync directly from Shopify. No 3D meshes or mannequins required." },
    { icon: ImagePlus, title: "2. Shopper Uploads a Snapshot", body: "A full-body or upper-body photo taken from any mobile camera. Works client-side without app downloads." },
    { icon: Wand2, title: "3. Neural Engine Drapes the Garment", body: "Our proprietary AI aligns cloth folds, stretching, shadows, and perspective to the shopper's exact body posture in 1.8 seconds." },
    { icon: Share2, title: "4. Confident Checkout & Lower Returns", body: "Shoppers view the before/after fit slider, verify their recommended size, and add the piece to their cart with total confidence." },
  ];
  const perks = [
    { icon: Smartphone, t: "Works on any device", d: "Runs in iOS Safari, Chrome, Android, and Desktop browsers seamlessly." },
    { icon: BarChart2, t: "Built-in ROI analytics", d: "Track try-on sessions, cart conversions, size trends, and return drop." },
    { icon: ShieldCheck, t: "Biometric privacy guarantee", d: "Photos are processed in temporary RAM and never retained or sold." },
  ];
  return (
    <MarketingShell>
      {/* HERO */}
      <section className="px-4 pt-10 pb-16 blue-cloud-bg">
        <div className="mx-auto max-w-5xl card-white p-8 md:p-14 text-center relative overflow-hidden">
          <span className="pill-blue-badge"><Sparkles size={13} /> The Technology Behind Easibie</span>
          <h1 className="mt-4 text-[36px] sm:text-[50px] font-extrabold text-[#0B192C]">
            From Photo to Try-On in <span className="bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">under 2 seconds.</span>
          </h1>
          <p className="mt-4 text-[16px] text-[#475569] max-w-xl mx-auto">
            No 3D modeling pipelines. No developer hours. No cumbersome app downloads for your shoppers.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/auth" search={{ mode: "signup" }} className="btn-blue-primary text-[14px]">
              Start 14-Day Free Pilot →
            </Link>
            <Link to="/try-ar" className="btn-white-secondary text-[14px]">
              Test Live Studio
            </Link>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="px-4 py-20 bg-white">
        <div className="mx-auto max-w-4xl text-center mb-14">
          <span className="pill-blue-badge"><Check size={13} /> Four Simple Steps</span>
          <h2 className="mt-3 text-[32px] font-extrabold text-[#0B192C]">A streamlined workflow for fashion brands</h2>
        </div>
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="card-white p-7">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E40AF] grid place-items-center shrink-0">
                  <s.icon size={22} />
                </div>
                <div>
                  <div className="text-[11px] font-bold tracking-widest text-blue-700 uppercase">STEP {String(i + 1).padStart(2, "0")}</div>
                  <h4 className="mt-1 text-[18px] font-bold text-[#0B192C]">{s.title}</h4>
                  <p className="mt-2 text-[13.5px] text-[#475569] leading-relaxed">{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PERKS */}
      <section className="px-4 pb-24 bg-white">
        <div className="mx-auto max-w-6xl pt-8 border-t border-slate-100">
          <div className="grid sm:grid-cols-3 gap-6">
            {perks.map((p, i) => (
              <div key={i} className="card-white p-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E40AF] grid place-items-center mb-3">
                  <p.icon size={20} />
                </div>
                <h4 className="text-[16px] font-bold text-[#0B192C]">{p.t}</h4>
                <p className="mt-1.5 text-[13px] text-[#64748B] leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
