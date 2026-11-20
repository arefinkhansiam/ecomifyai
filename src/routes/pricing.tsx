import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { MarketingShell } from "@/components/MarketingShell";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing & Plans — Easibie AI Fashion Try-On" },
      { name: "description", content: "Predictable pricing for fashion e-commerce. 14-day free pilot, no credit card required." },
    ],
  }),
  component: PricingPage,
});

const PLANS = [
  {
    name: "Starter Pilot",
    price: "$0",
    period: "for 14 days",
    desc: "For fashion boutiques validating photo try-on with real shoppers.",
    popular: false,
    features: [
      "250 photo try-on sessions",
      "10 active store garments",
      "Universal embed snippet",
      "Standard fitting report",
      "Community & email support",
    ],
    cta: "Start Free Pilot",
  },
  {
    name: "Growth Brand",
    price: "$49",
    period: "/ month",
    desc: "For growing clothing brands scaling sales and cutting return costs.",
    popular: true,
    features: [
      "2,500 photo try-on sessions / mo",
      "Unlimited active garments",
      "Custom branding & button colors",
      "Shopify & WooCommerce 1-click sync",
      "Advanced sizing analytics & return ROI",
      "Priority GPU processing queue",
    ],
    cta: "Start 14-Day Free Trial",
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/ month",
    desc: "For high-volume apparel brands needing dedicated scale and custom APIs.",
    popular: false,
    features: [
      "10,000+ photo try-ons included",
      "Headless React SDK & webhook access",
      "Sub-second GPU inference latency",
      "Custom drape fine-tuning on your lookbook",
      "Dedicated account manager",
      "99.9% uptime SLA",
    ],
    cta: "Contact Enterprise Sales",
  },
];

function PricingPage() {
  return (
    <MarketingShell>
      {/* HERO */}
      <section className="px-4 pt-12 pb-16 blue-cloud-bg">
        <div className="mx-auto max-w-5xl text-center">
          <span className="pill-blue-badge"><Sparkles size={13} /> Transparent Pricing</span>
          <h1 className="mt-4 text-[38px] sm:text-[52px] font-extrabold text-[#0B192C]">
            Predictable Plans for Fashion Brands
          </h1>
          <p className="mt-4 text-[16px] text-[#475569] max-w-xl mx-auto">
            Boost customer checkout confidence and reduce return shipping costs.
            Start with our 14-day free pilot — cancel anytime.
          </p>
        </div>
      </section>

      {/* PRICING GRID */}
      <section className="px-4 py-16 bg-white">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((p, i) => (
            <div
              key={i}
              className={`card-white p-8 flex flex-col justify-between relative ${
                p.popular ? "border-2 border-[#1E40AF] shadow-xl" : ""
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1E40AF] text-white text-[11px] font-extrabold px-3.5 py-0.5 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <div>
                <span className="text-[12px] font-bold uppercase text-[#64748B]">{p.name}</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[40px] font-extrabold text-[#0B192C]">{p.price}</span>
                  <span className="text-[13px] text-[#64748B]">{p.period}</span>
                </div>
                <p className="text-[13px] text-[#64748B] mt-2">{p.desc}</p>

                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-[13px] text-[#0B192C]">
                  {p.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2.5">
                      <Check size={16} className="text-blue-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className={`w-full !py-3 !rounded-xl !text-[13.5px] font-bold text-center block ${
                    p.popular ? "btn-blue-primary" : "btn-white-secondary"
                  }`}
                >
                  {p.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="px-4 pb-20 bg-white">
        <div className="mx-auto max-w-3xl card-white p-6 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="text-[14px] font-bold text-[#0B192C]">14-Day Risk-Free Guarantee</div>
              <div className="text-[12px] text-[#64748B]">Test on your live store. If returns don't drop, you pay nothing.</div>
            </div>
          </div>
          <Link to="/auth" search={{ mode: "signup" }} className="btn-blue-primary text-[12.5px] !py-2 !px-5 whitespace-nowrap">
            Start Free Pilot
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
