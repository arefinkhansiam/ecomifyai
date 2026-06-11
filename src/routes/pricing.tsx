import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Tag, ShieldCheck } from "lucide-react";
import { MarketingShell } from "@/components/MarketingShell";
import { PricingCards } from "@/components/PricingCards";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Ecomify Pricing — Free, Starter, Growth, Pro" },
      { name: "description", content: "Simple plans for stores of every size. Start free and upgrade when you scale." },
    ],
  }),
  component: PricingPage,
});



const COMPARE: { label: string; free: boolean | string; pro: boolean | string }[] = [
  { label: "Try-On products", free: "1", pro: "Unlimited" },
  { label: "Access to all features", free: false, pro: true },
  { label: "Remove Ecomify branding", free: false, pro: true },
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
      <section className="relative overflow-hidden pt-20 pb-12" style={{ background: "linear-gradient(180deg, #02060c 0%, #050d1a 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 900px 500px at 50% 0%, rgba(56,189,248,0.18), transparent 70%)" }} />
        <div className="mx-auto max-w-5xl px-6 text-center relative">
          <h1 className="font-display font-extrabold uppercase tracking-tight text-4xl sm:text-6xl" style={{ backgroundImage: "linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            Pick Your Plan
          </h1>
          <p className="mt-4 text-white/70">You're one step away. Pick a plan to start selling try-ons.</p>

          {/* Promo ticket */}
          <div className="mt-10 mx-auto max-w-2xl rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(3,105,161,0.35), rgba(56,189,248,0.25))", border: "1px solid rgba(56,189,248,0.4)", boxShadow: "0 30px 70px -25px rgba(56,189,248,0.55)" }}>
            <div className="py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-white flex items-center justify-center gap-2" style={{ background: "rgba(2,6,12,0.4)" }}>
              <Tag size={12} style={{ color: "#38BDF8" }} /> <span style={{ color: "#38BDF8" }}>launch_promo</span> is applied
            </div>
            <div className="grid grid-cols-2 divide-x" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <div className="py-6">
                <div className="font-display font-extrabold text-3xl" style={{ color: "#38BDF8" }}>21% OFF</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-white/60">Limited promo</div>
              </div>
              <div className="py-6">
                <div className="font-display font-extrabold text-3xl text-white tabular-nums">{m} : {sec}</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-white/60">minutes · seconds</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CARDS */}
      <section className="py-12 relative" style={{ background: "linear-gradient(180deg, #050d1a 0%, #02060c 100%)" }}>
        <div className="mx-auto max-w-7xl px-6 relative">
          <PricingCards />
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="py-20 relative" style={{ background: "linear-gradient(180deg, #02060c 0%, #050d1a 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 800px 500px at 50% 0%, rgba(56,189,248,0.12), transparent 70%)" }} />
        <div className="mx-auto max-w-4xl px-6 relative">
          <h2 className="text-center font-display font-extrabold uppercase tracking-tight text-3xl sm:text-5xl leading-[1.05]" style={{ backgroundImage: "linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            Unlock Full Try-On Capabilities
          </h2>
          <div className="mt-12 relative">
            {/* Glow on Pro column */}
            <div className="grid grid-cols-[1.6fr_1fr_1fr] items-center text-sm">
              <div className="text-white/60 font-semibold uppercase tracking-wider text-xs py-4">What you'll get</div>
              <div className="text-center font-bold text-white/70 py-4">Free</div>
              <div className="text-center font-bold py-4 rounded-t-2xl" style={{ color: "#38BDF8", background: "linear-gradient(180deg, rgba(56,189,248,0.15), transparent)", border: "1.5px solid #38BDF8", borderBottom: "none", boxShadow: "0 -10px 40px -10px rgba(56,189,248,0.4)" }}>Pro</div>
              {COMPARE.map((row, i) => (
                <div key={row.label} className="contents">
                  <div className="py-4 text-white/85 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>{row.label}</div>
                  <div className="py-4 text-center text-white/40 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    {typeof row.free === "boolean" ? (row.free ? <Check size={16} className="inline" style={{ color: "#38BDF8" }} /> : <span>–</span>) : row.free}
                  </div>
                  <div
                    className="py-4 text-center"
                    style={{
                      borderLeft: "1.5px solid #38BDF8",
                      borderRight: "1.5px solid #38BDF8",
                      borderTop: i === 0 ? "none" : "1px solid rgba(56,189,248,0.15)",
                      borderBottom: i === COMPARE.length - 1 ? "1.5px solid #38BDF8" : undefined,
                      background: "linear-gradient(180deg, rgba(56,189,248,0.05), rgba(56,189,248,0.02))",
                      borderBottomLeftRadius: i === COMPARE.length - 1 ? 16 : 0,
                      borderBottomRightRadius: i === COMPARE.length - 1 ? 16 : 0,
                    }}
                  >
                    {typeof row.pro === "boolean" ? (row.pro ? <Check size={16} className="inline" style={{ color: "#38BDF8" }} /> : <span className="text-white/40">–</span>) : <span className="text-white font-semibold">{row.pro}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-white/60">
            <ShieldCheck size={14} style={{ color: "#38BDF8" }} /> 7-day free trial · cancel anytime · pay safe & secure
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20" style={{ background: "linear-gradient(180deg, #050d1a 0%, #02060c 100%)" }}>
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center font-display font-extrabold uppercase tracking-tight text-3xl sm:text-5xl mb-10 leading-[1.05]" style={{ backgroundImage: "linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
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
              <details key={f.q} className="group rounded-2xl px-5 py-4" style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(56,189,248,0.15)" }}>
                <summary className="flex items-center justify-between cursor-pointer list-none text-white font-semibold">
                  {f.q}
                  <span className="text-white/50 group-open:rotate-180 transition-transform">⌄</span>
                </summary>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
