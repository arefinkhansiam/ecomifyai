import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Tag, ShieldCheck, Sparkles, Clock, Zap } from "lucide-react";
import { MarketingShell } from "@/components/MarketingShell";
import { PricingCards } from "@/components/PricingCards";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Easibie Pricing — Free, Starter, Growth, Pro" },
      { name: "description", content: "Simple plans for stores of every size. Start free and upgrade when you scale." },
    ],
  }),
  component: PricingPage,
});



const COMPARE: { label: string; free: boolean | string; pro: boolean | string }[] = [
  { label: "Try-On products", free: "1", pro: "Unlimited" },
  { label: "Access to all features", free: false, pro: true },
  { label: "Remove Easibie branding", free: false, pro: true },
  { label: "Custom viewer skin", free: false, pro: true },
  { label: "Brand colours & gradient", free: false, pro: true },
  { label: "Same-category recommendations", free: false, pro: true },
  { label: "Analytics dashboard", free: false, pro: true },
  { label: "Watermarked downloads", free: false, pro: true },
  { label: "Priority support", free: false, pro: true },
  { label: "Team seats", free: "1", pro: "Unlimited" },
];

function useCountdown(targetMinutes = 15) {
  const [s, setS] = useState(targetMinutes * 60);
  useEffect(() => {
    const id = setInterval(() => setS((v) => (v > 0 ? v - 1 : targetMinutes * 60)), 1000);
    return () => clearInterval(id);
  }, [targetMinutes]);
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return { m, sec };
}

function PricingPage() {
  const { m, sec } = useCountdown(15);
  return (
    <MarketingShell>
      {/* HEADER + PROMO */}
      <section className="relative overflow-hidden pt-20 pb-12" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #E0F2FE 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 900px 500px at 50% 0%, rgba(56,189,248,0.18), transparent 70%)" }} />
        <div className="mx-auto max-w-5xl px-6 text-center relative">
          <h1 className="font-display font-extrabold uppercase tracking-tight text-4xl sm:text-6xl" style={{ backgroundImage: "linear-gradient(180deg, #0B1220 0%, #0369A1 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            Pick Your Plan
          </h1>
          <p className="mt-4 text-slate-600">You're one step away. Pick a plan to start selling try-ons.</p>

          {/* Premium promo ticket */}
          <div className="mt-10 mx-auto max-w-3xl relative group">
            {/* Glow halo */}
            <div
              className="absolute -inset-1 rounded-[28px] opacity-70 blur-2xl pointer-events-none transition-opacity group-hover:opacity-90"
              style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.55), rgba(3,105,161,0.5), rgba(14,165,233,0.45))" }}
            />
            <div
              className="relative rounded-[24px] overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0B1220 0%, #0F2A44 55%, #0369A1 100%)",
                border: "1px solid rgba(56,189,248,0.45)",
                boxShadow: "0 30px 80px -25px rgba(3,105,161,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              {/* shimmer overlay */}
              <div
                className="absolute inset-0 opacity-[0.18] pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 0%, rgba(56,189,248,0.6), transparent 40%), radial-gradient(circle at 80% 100%, rgba(125,211,252,0.45), transparent 45%)",
                }}
              />
              {/* Header */}
              <div className="relative flex items-center justify-center gap-2 py-3 px-4 text-[11px] font-bold uppercase tracking-[0.22em] border-b" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
                <Sparkles size={13} className="text-sky-300" />
                <span className="text-sky-300">launch_promo</span>
                <span className="text-white/60">is applied</span>
              </div>

              <div className="relative grid grid-cols-1 sm:grid-cols-[1.1fr_auto_1fr] items-center gap-0">
                {/* Discount */}
                <div className="py-7 px-6 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: "rgba(56,189,248,0.15)", color: "#7DD3FC", border: "1px solid rgba(56,189,248,0.35)" }}>
                    <Zap size={11} /> Save big today
                  </div>
                  <div className="mt-2 font-display font-extrabold text-5xl sm:text-6xl tracking-tight leading-none" style={{ backgroundImage: "linear-gradient(135deg, #FFFFFF 0%, #7DD3FC 60%, #38BDF8 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                    21% OFF
                  </div>
                  <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-sky-200/70">Limited launch promo</div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block h-24 w-px mx-auto" style={{ background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.18), transparent)" }} />

                {/* Countdown */}
                <div className="py-7 px-6 text-center sm:text-right">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-200/80">
                    <Clock size={11} /> Ends in
                  </div>
                  <div className="mt-2 flex items-center justify-center sm:justify-end gap-2 tabular-nums">
                    <span className="font-display font-extrabold text-4xl sm:text-5xl text-white px-3 py-1.5 rounded-xl min-w-[64px] sm:min-w-[78px]" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>{m}</span>
                    <span className="font-display font-extrabold text-3xl sm:text-4xl text-sky-300 animate-pulse">:</span>
                    <span className="font-display font-extrabold text-4xl sm:text-5xl text-white px-3 py-1.5 rounded-xl min-w-[64px] sm:min-w-[78px]" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>{sec}</span>
                  </div>
                  <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-sky-200/70">minutes · seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CARDS — white, monday/slack inspired */}
      <section className="py-20 relative" style={{ background: "#FFFFFF" }}>
        <div className="mx-auto max-w-7xl px-6 relative">
          <PricingCards />
        </div>
      </section>


      {/* COMPARISON TABLE */}
      <section className="py-20 relative" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 800px 500px at 50% 0%, rgba(56,189,248,0.10), transparent 70%)" }} />
        <div className="mx-auto max-w-4xl px-6 relative">
          <h2 className="text-center font-display font-extrabold uppercase tracking-tight text-3xl sm:text-5xl leading-[1.05]" style={{ backgroundImage: "linear-gradient(180deg, #0B1220 0%, #0369A1 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            Unlock Full Try-On Capabilities
          </h2>
          <div className="mt-12 relative">
            {/* Glow on Pro column */}
            <div className="grid grid-cols-[1.6fr_1fr_1fr] items-center text-sm">
              <div className="text-slate-500 font-semibold uppercase tracking-wider text-xs py-4">What you'll get</div>
              <div className="text-center font-bold text-slate-600 py-4">Free</div>
              <div className="text-center font-bold py-4 rounded-t-2xl" style={{ color: "#0284C7", background: "linear-gradient(180deg, rgba(56,189,248,0.10), transparent)", border: "1.5px solid #38BDF8", borderBottom: "none", boxShadow: "0 -10px 40px -10px rgba(56,189,248,0.25)" }}>Pro</div>
              {COMPARE.map((row, i) => (
                <div key={row.label} className="contents">
                  <div className="py-4 text-slate-700 border-t" style={{ borderColor: "rgba(2,132,199,0.10)" }}>{row.label}</div>
                  <div className="py-4 text-center text-slate-400 border-t" style={{ borderColor: "rgba(2,132,199,0.10)" }}>
                    {typeof row.free === "boolean" ? (row.free ? <Check size={16} className="inline" style={{ color: "#0284C7" }} /> : <span>–</span>) : row.free}
                  </div>
                  <div
                    className="py-4 text-center"
                    style={{
                      borderLeft: "1.5px solid #38BDF8",
                      borderRight: "1.5px solid #38BDF8",
                      borderTop: i === 0 ? "none" : "1px solid rgba(56,189,248,0.12)",
                      borderBottom: i === COMPARE.length - 1 ? "1.5px solid #38BDF8" : undefined,
                      background: "linear-gradient(180deg, rgba(56,189,248,0.04), rgba(56,189,248,0.01))",
                      borderBottomLeftRadius: i === COMPARE.length - 1 ? 16 : 0,
                      borderBottomRightRadius: i === COMPARE.length - 1 ? 16 : 0,
                    }}
                  >
                    {typeof row.pro === "boolean" ? (row.pro ? <Check size={16} className="inline" style={{ color: "#0284C7" }} /> : <span className="text-slate-400">–</span>) : <span className="text-slate-800 font-semibold">{row.pro}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={14} style={{ color: "#0284C7" }} /> 7-day free trial · cancel anytime · pay safe & secure
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20" style={{ background: "linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 100%)" }}>
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center font-display font-extrabold uppercase tracking-tight text-3xl sm:text-5xl mb-10 leading-[1.05]" style={{ backgroundImage: "linear-gradient(180deg, #0B1220 0%, #0369A1 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {[
              { q: "How does the free trial work?", a: "Every paid plan starts with a 7-day free trial. No card required up front — you only pay when the trial ends." },
              { q: "Can I change my plan later?", a: "Yes. Upgrade or downgrade anytime from your dashboard. Changes apply at the next billing cycle." },
              { q: "How many try-ons can I generate?", a: "Free plan covers 1 product. Starter covers 10, Growth covers 50, Pro is unlimited." },
              { q: "Will the try-ons work on my store?", a: "Yes. We provide a one-line embed snippet that works on Shopify, WooCommerce, Wix, Squarespace and any custom site." },
              { q: "Is my shopper data safe?", a: "Yes. Shopper photos are processed for the try-on only and never used for training. Enterprise-grade storage." },
              { q: "Do you offer refunds?", a: "If something is broken, contact support and we'll make it right. Otherwise, cancel anytime to stop future charges." },
            ].map((f) => (
              <details key={f.q} className="group rounded-2xl px-5 py-4" style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(56,189,248,0.20)", boxShadow: "0 4px 20px -8px rgba(2,132,199,0.15)" }}>
                <summary className="flex items-center justify-between cursor-pointer list-none text-slate-800 font-semibold">
                  {f.q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">⌄</span>
                </summary>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
