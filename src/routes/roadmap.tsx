import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MarketingShell } from "@/components/MarketingShell";
import {
  Camera,
  Layers,
  ShoppingBag,
  Sliders,
  Check,
  Sparkles,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Technology Roadmap & Spatial AR — Easibie" },
      {
        name: "description",
        content:
          "Explore Easibie's future vision: Live Camera AR body tracking (v2.0), Apple Vision Pro USDZ spatial quick look, multi-layer wardrobe stacking, and contactless sizing.",
      },
    ],
  }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid work email.");
      return;
    }
    setJoined(true);
    toast.success("You have been added to the v2.0 Live Camera AR Closed Beta waitlist!");
  };

  return (
    <MarketingShell>
      {/* HERO */}
      <section className="px-4 pt-12 pb-16 blue-cloud-bg border-b border-[#E2E8F0]">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[12px] font-semibold mb-4">
            <Clock size={14} className="text-blue-700" />
            <span>Product Engineering Roadmap</span>
          </div>
          <h1 className="text-[36px] sm:text-[48px] font-bold text-[#0F172A] tracking-tight">
            The Future of Spatial Fitting & Computer Vision
          </h1>
          <p className="mt-4 text-[16px] text-[#475569] max-w-2xl mx-auto leading-relaxed">
            AI Photo Try-On is live and production-ready today. Here is our engineering pipeline
            for real-time live camera tracking, spatial AR, and multi-layer wardrobe composition.
          </p>
        </div>
      </section>

      {/* DETAILED ROADMAP CARDS */}
      <section className="px-4 py-20 bg-white">
        <div className="mx-auto max-w-5xl space-y-10">
          {/* Item 1: Live Camera AR (v2.0) */}
          <div className="card-white p-8 border-l-4 border-l-blue-600">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                In Closed Beta • Expected Q3 2026
              </span>
              <span className="text-[12px] font-semibold text-slate-500">Milestone: v2.0 Release</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 grid place-items-center shrink-0">
                <Camera size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-[22px] font-bold text-[#0F172A]">Real-Time Live Camera AR Fitting</h2>
                <p className="text-[14px] text-[#475569] mt-2 leading-relaxed">
                  Shoppers will be able to stand in front of their webcam or smartphone camera and see garments drape in real time at 60 frames per second.
                  Built directly with browser-native WebAssembly and WebGPU, requiring zero app downloads or plug-ins.
                </p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px] text-[#0F172A]">
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="font-bold block text-blue-700">33-Point Skeleton Tracking</span>
                    Shoulder, chest, elbow, and waistline joint tracking in real-time.
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="font-bold block text-blue-700">&lt; 16ms Latency</span>
                    Sub-frame inference on modern mobile Safari and Chrome browsers.
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="font-bold block text-blue-700">Automatic Fallback</span>
                    Seamlessly reverts to Photo Try-On if device camera is unsupported.
                  </div>
                </div>

                {/* Beta Waitlist Box */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  {joined ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-[13px] font-semibold">
                      ✓ You are registered for the v2.0 Live Camera AR Closed Beta. Our team will reach out with early sandbox keys.
                    </div>
                  ) : (
                    <form onSubmit={handleJoin} className="flex flex-wrap gap-2 max-w-md">
                      <input
                        type="email"
                        placeholder="merchant@fashionstore.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-base text-[13px] flex-1"
                        required
                      />
                      <button type="submit" className="btn-blue-primary text-[13px] !py-2 !px-4 whitespace-nowrap">
                        Request Beta Access
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Item 2: Apple Vision Pro Spatial Quick Look (USDZ) */}
          <div className="card-white p-8 border-l-4 border-l-indigo-600">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                In Development • Expected Q3 2026
              </span>
              <span className="text-[12px] font-semibold text-slate-500">Spatial AR</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 grid place-items-center shrink-0">
                <Layers size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-[22px] font-bold text-[#0F172A]">Apple Vision Pro & USDZ Spatial Quick Look</h2>
                <p className="text-[14px] text-[#475569] mt-2 leading-relaxed">
                  Support for high-polygon USDZ assets on Apple Vision Pro and iOS devices. Shoppers can inspect microscopic fabric weaves,
                  stitch tension, and drape fluidity floating in their physical space.
                </p>
                <div className="mt-4 flex gap-4 text-[12px] text-[#64748B]">
                  <span>• PBR Metallic-Roughness Textures</span>
                  <span>• Subsurface Fabric Scattering</span>
                  <span>• 4K Texture Resolution Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Item 3: Multi-Garment Stacking */}
          <div className="card-white p-8 border-l-4 border-l-sky-500">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-sky-100 text-sky-800">
                R&D Phase • Expected Q4 2026
              </span>
              <span className="text-[12px] font-semibold text-slate-500">Composite Outfitting</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 grid place-items-center shrink-0">
                <ShoppingBag size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-[22px] font-bold text-[#0F172A]">Multi-Garment Wardrobe Stacking</h2>
                <p className="text-[14px] text-[#475569] mt-2 leading-relaxed">
                  Enable full-outfit try-ons. Shoppers can stack an undershirt, tailored blazer, trousers, and outerwear
                  in a single cohesive composite photo render, ensuring color and silhouette harmony across their complete look.
                </p>
              </div>
            </div>
          </div>

          {/* Item 4: Contactless Body Scan */}
          <div className="card-white p-8 border-l-4 border-l-emerald-600">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Research Lab • Patent Pending
              </span>
              <span className="text-[12px] font-semibold text-slate-500">Biometric Accuracy</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center shrink-0">
                <Sliders size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-[22px] font-bold text-[#0F172A]">Contactless Body Measurement Extraction</h2>
                <p className="text-[14px] text-[#475569] mt-2 leading-relaxed">
                  Extract chest, natural waistline, hips, and inseam measurements directly from a front and profile photograph
                  with sub-centimeter accuracy, eliminating size-chart confusion forever.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ETHICS & PRIVACY COMMITMENT */}
      <section className="px-4 pb-20 bg-white">
        <div className="mx-auto max-w-4xl card-white p-6 md:p-8 bg-slate-50 border border-slate-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 mx-auto grid place-items-center mb-3">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-[17px] font-bold text-[#0F172A]">Our Architectural Privacy Commitment</h3>
          <p className="mt-2 text-[13px] text-[#475569] max-w-xl mx-auto leading-relaxed">
            All computer vision pipelines run with strict zero-retention defaults. Raw camera frames are processed locally in browser memory
            wherever hardware acceleration permits, and remote inferences are purged immediately after rendering.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
