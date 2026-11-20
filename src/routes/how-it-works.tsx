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
    { icon: UploadCloud, title: "Upload your product photos", body: "JPG, PNG or WebP — front, back, side and detail shots. The more angles you upload, the more accurate the AI try-on result." },
    { icon: ImagePlus, title: "Shopper uploads their own photo", body: "A selfie, full-body shot, or photo of their room. No app install, works on any phone or laptop browser." },
    { icon: Wand2, title: "AI generates a photoreal try-on", body: "Our engine composes a realistic try-on preserving the shopper's face, pose, lighting and background. Usually 10–20 seconds." },
    { icon: Share2, title: "Share, embed, sell", body: "Every product gets a public try-on link, a downloadable QR code and an embed snippet for any online store." },
  ];
  const perks = [
    { icon: Smartphone, t: "Works on any phone", d: "Browser-based — no app or special device support needed." },
    { icon: BarChart2, t: "Built-in analytics", d: "Sessions, conversion, devices and bounce — for every product." },
    { icon: ShieldCheck, t: "Private & secure", d: "Shopper photos are processed for the try-on only — never used for training." },
  ];
  return (
    <MarketingShell>
      {/* HERO */}
      <section className="px-4 pt-6">
        <div className="mx-auto max-w-6xl card-soft px-6 md:px-14 pt-20 pb-14 text-center relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-40 blob" style={{ background: "radial-gradient(circle, #C7BEEB, transparent 70%)" }} />
          <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full opacity-40 blob" style={{ background: "radial-gradient(circle, #A99BF0, transparent 70%)" }} />
          <div className="relative">
            <span className="pill"><Sparkles size={12} /> How it works</span>
            <h1 className="mt-5 text-ink">From photo to try-on<br />in <span className="italic">under a minute.</span></h1>
            <p className="mt-6 text-[16px] text-[#6B6689] max-w-xl mx-auto">
              No complex software. No developer. No app downloads for your customers.
            </p>
            <Link to="/auth" search={{ mode: "signup" }} className="btn-primary mt-8">Try it for free</Link>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-4xl text-center mb-14">
          <span className="pill"><Check size={12} /> Four simple steps</span>
          <h2 className="mt-5 text-ink">A workflow anyone can master</h2>
        </div>
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-5">
          {steps.map((s, i) => (
            <div key={i} className="card-tile p-7">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F3F0FE] grid place-items-center text-[#1F1747] shrink-0">
                  <s.icon size={20} />
                </div>
                <div>
                  <div className="text-[11px] font-bold tracking-widest text-[#8A83AB]">STEP {String(i + 1).padStart(2, "0")}</div>
                  <h4 className="mt-1 text-ink">{s.title}</h4>
                  <p className="mt-2 text-[13.5px] text-[#6B6689]">{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PERKS */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl text-center mb-12">
          <span className="pill"><Sparkles size={12} /> Why owners love it</span>
          <h2 className="mt-5 text-ink">Built for real storefronts</h2>
        </div>
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-5">
          {perks.map((p) => (
            <div key={p.t} className="card-tile p-6">
              <div className="w-11 h-11 rounded-xl bg-[#F3F0FE] grid place-items-center text-[#1F1747]"><p.icon size={18} /></div>
              <h4 className="mt-5 text-ink">{p.t}</h4>
              <p className="mt-2 text-[13px] text-[#6B6689]">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl card-soft p-14 text-center relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-40 blob" style={{ background: "radial-gradient(circle, #C7BEEB, transparent 70%)" }} />
          <div className="relative">
            <h2 className="text-ink">Ready to see it on <span className="italic">your products?</span></h2>
            <p className="mt-4 text-[15px] text-[#6B6689]">Your first try-on product is free forever.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth" search={{ mode: "signup" }} className="btn-primary">Start Free <ArrowRight size={14} /></Link>
              <Link to="/try-ar" className="btn-ghost">Try the live demo</Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
