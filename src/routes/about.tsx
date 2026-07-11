import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingShell } from "@/components/MarketingShell";
import { Sparkles, Heart, Zap, Globe, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Easibie — AI Photo Try-On, for Every Store" },
      { name: "description", content: "We're building the AI try-on layer of e-commerce so every store can let shoppers see themselves wearing or using the product before they buy." },
    ],
  }),
  component: About,
});

function About() {
  const values = [
    { icon: Zap, t: "Photoreal, not gimmicky", d: "Try-on quality is the product. We obsess over face preservation, lighting, fit and shadow." },
    { icon: Globe, t: "Built for every store", d: "From a 1-product shop to a 10,000-SKU brand. Same simple flow. Same fair price." },
    { icon: Heart, t: "Shopper-first", d: "No app installs, no tracking, no shady data deals. Photos are processed for the try-on and discarded." },
  ];
  return (
    <MarketingShell>
      {/* HERO */}
      <section className="px-4 pt-6">
        <div className="mx-auto max-w-6xl card-soft px-6 md:px-14 pt-20 pb-14 text-center relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-40 blob" style={{ background: "radial-gradient(circle, #C7BEEB, transparent 70%)" }} />
          <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full opacity-40 blob" style={{ background: "radial-gradient(circle, #A99BF0, transparent 70%)" }} />
          <div className="relative">
            <span className="pill"><Sparkles size={12} /> About Easibie</span>
            <h1 className="mt-5 text-ink">AI try-on,<br /><span className="italic">for every store.</span></h1>
            <p className="mt-6 text-[16px] text-[#6B6689] max-w-2xl mx-auto">
              Easibie was founded with a simple belief: every online shopper deserves to see themselves with the product before they buy. We made that possible from a single photo — no headsets, no complex modelling, no developer team.
            </p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { k: "10k+", v: "Active stores" },
            { k: "2.4M", v: "Try-ons delivered" },
            { k: "30%", v: "Avg sales lift" },
          ].map((x) => (
            <div key={x.k} className="card-tile p-8 text-center">
              <div className="text-[54px] font-extrabold tracking-[-0.04em] text-ink">{x.k}</div>
              <div className="mt-2 text-[13px] text-[#6B6689]">{x.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VALUES */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl text-center mb-12">
          <span className="pill">Our principles</span>
          <h2 className="mt-5 text-ink">What we believe</h2>
        </div>
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-5">
          {values.map((v) => (
            <div key={v.t} className="card-tile p-6">
              <div className="w-11 h-11 rounded-xl bg-[#F3F0FE] grid place-items-center text-[#1F1747]"><v.icon size={18} /></div>
              <h4 className="mt-5 text-ink">{v.t}</h4>
              <p className="mt-2 text-[13px] text-[#6B6689]">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STORY */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl card-soft p-10 md:p-14">
          <h2 className="text-ink">A small team, <span className="italic">obsessed</span> with the details.</h2>
          <p className="mt-6 text-[15px] text-[#4B4368]">We're a small team of designers, engineers and ex-store owners. We obsess over conversion, latency, and the smallest details of every try-on we render.</p>
          <p className="mt-4 text-[15px] text-[#4B4368]">Our mission is to make online shopping feel real — wherever your customers happen to be.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl card-soft p-14 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-40 blob" style={{ background: "radial-gradient(circle, #C7BEEB, transparent 70%)" }} />
          <div className="relative">
            <h2 className="text-ink">Join 10,000+ <span className="italic">stores</span> using Easibie</h2>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth" search={{ mode: "signup" }} className="btn-primary">Start Free <ArrowRight size={14} /></Link>
              <Link to="/pricing" className="btn-ghost">See pricing</Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
