import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingShell } from "@/components/MarketingShell";
import { Sparkles, Heart, Zap, Globe, ArrowRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Easibie — AI Virtual Photo Try-On for Fashion" },
      { name: "description", content: "We are building the intelligent fitting layer of fashion e-commerce. Helping retailers reduce returns and shoppers shop with confidence." },
    ],
  }),
  component: About,
});

function About() {
  const values = [
    { icon: Zap, t: "Photoreal, not gimmicky", d: "Try-on quality is our primary focus. We obsess over fabric drape physics, lighting, texture preservation, and shadow accuracy." },
    { icon: Globe, t: "Built for every fashion store", d: "From an independent boutique to a global apparel enterprise. Same 1-line embed snippet. Same predictable pricing." },
    { icon: ShieldCheck, t: "Privacy-first architecture", d: "No biometric profiling, no permanent face storage, no data brokerage. Shopper photos are processed in temporary memory and purged." },
  ];
  return (
    <MarketingShell>
      {/* HERO */}
      <section className="px-4 pt-12 pb-16 blue-cloud-bg">
        <div className="mx-auto max-w-5xl text-center">
          <span className="pill-blue-badge"><Sparkles size={13} /> Our Mission</span>
          <h1 className="mt-4 text-[38px] sm:text-[52px] font-extrabold text-[#0B192C]">
            Empowering Modern Fashion E-Commerce
          </h1>
          <p className="mt-4 text-[16px] text-[#475569] max-w-2xl mx-auto leading-relaxed">
            Easibie was founded with a clear vision: every fashion shopper should be able to see how clothing looks on their real body before purchasing. We turn standard photos into realistic virtual fits in under 2 seconds.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="px-4 py-16 bg-white">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { k: "420+", v: "Fashion Retailers Powered" },
            { k: "248k+", v: "Photo Try-Ons Delivered" },
            { k: "-38%", v: "Average Return Rate Drop" },
          ].map((x) => (
            <div key={x.k} className="card-white p-8 text-center">
              <div className="text-[48px] font-extrabold tracking-tight text-[#0B192C]">{x.k}</div>
              <div className="mt-2 text-[13.5px] font-semibold text-[#64748B]">{x.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VALUES */}
      <section className="px-4 pb-24 bg-white">
        <div className="mx-auto max-w-4xl text-center mb-12">
          <span className="pill-blue-badge">Our Core Principles</span>
          <h2 className="mt-3 text-[32px] font-extrabold text-[#0B192C]">Why Brands Choose Easibie</h2>
        </div>
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <div key={i} className="card-white p-7">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E40AF] grid place-items-center mb-4">
                <v.icon size={22} />
              </div>
              <h3 className="text-[18px] font-bold text-[#0B192C]">{v.t}</h3>
              <p className="mt-2 text-[13.5px] text-[#475569] leading-relaxed">{v.d}</p>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
