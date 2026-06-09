import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingShell } from "@/components/MarketingShell";
import { Sparkles, Heart, Zap, Globe } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Easibie — AI Photo Try-On, for Every Store" },
      { name: "description", content: "We're building the AI try-on layer of e-commerce so every store — big or small — can let shoppers see themselves wearing or using the product before they buy." },
    ],
  }),
  component: About,
});

const GRAD = "linear-gradient(135deg, #0B1220 0%, #0369A1 50%, #38BDF8 100%)";

function About() {
  const values = [
    { icon: Zap, t: "Photoreal, not gimmicky", d: "Try-on quality is the product. We obsess over face preservation, lighting, fit and shadow." },
    { icon: Globe, t: "Built for every store", d: "From a 1-product Etsy shop to a 10,000-SKU Shopify brand. Same simple flow. Same fair price." },
    { icon: Heart, t: "Shopper-first", d: "No app installs, no tracking, no shady data deals. Photos are processed for the try-on and discarded." },
  ];
  return (
    <MarketingShell>
      <section className="relative">
        <div className="absolute inset-0 -z-10 opacity-70" style={{ background: "radial-gradient(ellipse 900px 500px at 50% 0%, rgba(14,165,233,0.22), transparent 70%)" }} />
        <div className="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center">
          <span className="pill"><Sparkles size={14} /> About Easibie</span>
          <h1 className="mt-5 text-gradient-ocean">AI try-on, for every store.</h1>
          <p className="mt-6 text-lg" style={{ color: "var(--ink-soft)" }}>
            Easibie was founded with a simple belief: every online shopper deserves to see themselves with the product before they buy. We made that possible from a single photo — no AR headsets, no 3D modelling, no developer team.
          </p>
        </div>
      </section>

      <section className="pb-10">
        <div className="mx-auto max-w-5xl px-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { k: "10k+", v: "Active stores" },
            { k: "2.4M", v: "Try-ons delivered" },
            { k: "30%", v: "Avg sales lift" },
          ].map((x) => (
            <div key={x.k} className="rounded-2xl p-6 text-center" style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(2,132,199,0.18)", boxShadow: "0 18px 40px -22px rgba(2,132,199,0.35)" }}>
              <div className="font-display text-5xl font-extrabold" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{x.k}</div>
              <div className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>{x.v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16" style={{ background: "linear-gradient(180deg, transparent, rgba(2,132,199,0.06), transparent)" }}>
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-gradient-ocean">What we believe.</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {values.map((v) => (
              <div key={v.t} className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(2,132,199,0.18)", boxShadow: "0 14px 30px -18px rgba(2,132,199,0.3)" }}>
                <div className="w-12 h-12 rounded-xl grid place-items-center text-white" style={{ background: GRAD }}><v.icon size={20} /></div>
                <div className="mt-3 font-display font-bold text-ink text-lg">{v.t}</div>
                <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6 space-y-5 text-[17px]" style={{ color: "var(--ink-soft)" }}>
          <p>We're a small team of designers, engineers and ex-store owners. We obsess over conversion, latency, and the smallest details of every try-on we render.</p>
          <p>Our mission is to make online shopping feel real — wherever your customers happen to be.</p>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #02060c 0%, #0a1929 30%, #0369A1 70%, #38BDF8 100%)" }}>
        <div className="mx-auto max-w-3xl px-6 text-center relative">
          <h2 className="text-white">Join 10,000+ stores using Easibie.</h2>
          <div className="mt-7 flex flex-col sm:flex-row justify-center items-center gap-3">
            <Link to="/auth" search={{ mode: "signup" }} className="btn-primary" style={{ background: "#fff", color: "var(--primary)", minWidth: 220 }}>
              <Sparkles size={16} /> Start Free
            </Link>
            <Link to="/pricing" className="text-sm font-semibold text-white/90 hover:text-white underline-offset-4 hover:underline px-4 py-2">See pricing →</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
