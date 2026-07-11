import { createFileRoute } from "@tanstack/react-router";
import { Check, Sparkles, ShieldCheck } from "lucide-react";
import { MarketingShell } from "@/components/MarketingShell";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Easibie Pricing — Free, Pro, Elite" },
      { name: "description", content: "Simple plans for stores of every size. Start free and upgrade when you scale." },
    ],
  }),
  component: PricingPage,
});

type Tier = { name: string; price: string; note: string; highlight: boolean; popular?: boolean; features: string[] };

const TIERS: Tier[] = [
  {
    name: "Free", price: "Free", note: "For individuals starting out with basic try-ons.",
    highlight: false,
    features: ["Unlimited previews", "1 product", "Shareable link & QR", "Email notifications", "Time zone compliant", "Mobile & desktop"],
  },
  {
    name: "Pro", price: "$18.99", note: "For individuals with advanced try-on needs.",
    highlight: false,
    features: ["10 products", "Unlimited services", "Unlimited reminders", "Add questions", "Multi-locale", "Cancel & reschedule", "Custom duration"],
  },
  {
    name: "Elite", price: "$28.99", note: "For companies (several team members).",
    highlight: true, popular: true,
    features: ["Everything before +", "No Easibie branding", "Custom brand colours", "Team seats up to 5", "Advanced analytics", "Zoom / calendar links", "Upsell services"],
  },
  {
    name: "Pro+", price: "$39.99", note: "For teams needing extra features, security, admin control, and support.",
    highlight: false,
    features: ["Elite +", "No Easibie branding", "SMS notification", "Abandoned booking", "Custom vendor", "Booking deposit", "Team portal"],
  },
];

const COMPARE = [
  { label: "Try-On products", free: "1", pro: "Unlimited" },
  { label: "Access to all features", free: false, pro: true },
  { label: "Remove Easibie branding", free: false, pro: true },
  { label: "Custom viewer skin", free: false, pro: true },
  { label: "Brand colours & gradient", free: false, pro: true },
  { label: "Analytics dashboard", free: false, pro: true },
  { label: "Priority support", free: false, pro: true },
  { label: "Team seats", free: "1", pro: "Unlimited" },
] as const;

function PricingPage() {
  return (
    <MarketingShell>
      {/* HERO */}
      <section className="px-4 pt-6">
        <div className="mx-auto max-w-6xl card-soft px-6 md:px-14 pt-20 pb-14 text-center relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-40 blob" style={{ background: "radial-gradient(circle, #C7BEEB, transparent 70%)" }} />
          <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full opacity-40 blob" style={{ background: "radial-gradient(circle, #A99BF0, transparent 70%)" }} />
          <div className="relative">
            <span className="pill"><Sparkles size={12} /> Pay as you grow</span>
            <h1 className="mt-5 text-ink">Pick your <span className="italic">plan</span></h1>
            <p className="mt-6 text-[16px] text-[#6B6689] max-w-xl mx-auto">
              Choose a plan that fits your needs, offering flexibility and value to support your growth and success with Easibie.
            </p>
          </div>
        </div>
      </section>

      {/* PRICING GRID */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map((t) => (
            <PricingTile key={t.name} {...t} />
          ))}
        </div>
      </section>

      {/* COMPARE */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl text-center mb-12">
          <span className="pill">Compare</span>
          <h2 className="mt-5 text-ink">Unlock full <span className="italic">try-on capabilities</span></h2>
        </div>
        <div className="mx-auto max-w-4xl card-soft p-8">
          <div className="grid grid-cols-[1.6fr_1fr_1fr] text-sm">
            <div className="text-[11px] text-[#8A83AB] font-bold uppercase tracking-wider py-4">What you'll get</div>
            <div className="text-center text-[12px] font-bold text-[#6B6689] py-4">Free</div>
            <div className="text-center text-[12px] font-bold text-white py-3 bg-[#1F1747] rounded-t-2xl">Pro</div>
            {COMPARE.map((row, i) => (
              <div key={row.label} className="contents">
                <div className="py-4 text-[13px] text-[#4B4368] border-t border-[#E4DEF7]">{row.label}</div>
                <div className="py-4 text-center border-t border-[#E4DEF7] text-[#8A83AB]">
                  {typeof row.free === "boolean" ? (row.free ? <Check size={15} className="inline text-[#1F1747]" /> : "–") : row.free}
                </div>
                <div
                  className={`py-4 text-center bg-[#F3F0FE] border-l border-r border-[#1F1747] ${i === COMPARE.length - 1 ? "rounded-b-2xl border-b" : ""}`}
                  style={{ color: "#1F1747", fontWeight: 600 }}
                >
                  {typeof row.pro === "boolean" ? (row.pro ? <Check size={15} className="inline" /> : "–") : row.pro}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-[12px] text-[#8A83AB]">
            <ShieldCheck size={14} /> 7-day free trial · cancel anytime
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl text-center mb-10">
          <span className="pill">FAQ</span>
          <h2 className="mt-5 text-ink">Frequently asked <span className="italic">questions</span></h2>
        </div>
        <div className="mx-auto max-w-3xl space-y-3">
          {[
            { q: "How does the free trial work?", a: "Every paid plan starts with a 7-day free trial. No card required up front — you only pay when the trial ends." },
            { q: "Can I change my plan later?", a: "Yes. Upgrade or downgrade anytime from your dashboard. Changes apply at the next billing cycle." },
            { q: "How many try-ons can I generate?", a: "Free plan covers 1 product. Pro covers 10, Elite covers 50, Pro+ is unlimited." },
            { q: "Will the try-ons work on my store?", a: "Yes. We provide a one-line embed snippet that works on Shopify, WooCommerce, Wix, Squarespace and any custom site." },
            { q: "Is my shopper data safe?", a: "Yes. Shopper photos are processed for the try-on only and never used for training." },
            { q: "Do you offer refunds?", a: "If something is broken, contact support and we'll make it right. Otherwise, cancel anytime to stop future charges." },
          ].map((f) => (
            <details key={f.q} className="card-tile group px-6 py-4">
              <summary className="flex items-center justify-between cursor-pointer list-none text-ink font-semibold text-[14px]">
                {f.q}
                <span className="text-[#8A83AB] group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-[13px] text-[#6B6689] leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}

function PricingTile({ name, price, note, highlight, popular, features }: Tier) {
  return (
    <div className={`p-6 rounded-2xl relative flex flex-col ${highlight ? "bg-[#1F1747] text-white" : "bg-white border border-[#E4DEF7]"}`}>
      {popular && (
        <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-white text-[#1F1747] px-2.5 py-1 rounded-full">Popular</span>
      )}
      <div className={`text-[13px] font-bold uppercase tracking-wide ${highlight ? "text-[#C7BEEB]" : "text-[#6B6689]"}`}>{name}</div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className={`text-[36px] font-extrabold tracking-tight ${highlight ? "text-white" : "text-ink"}`}>{price}</span>
        {price !== "Free" && <span className={`text-[13px] ${highlight ? "text-[#C7BEEB]" : "text-[#8A83AB]"}`}>/month</span>}
      </div>
      <p className={`mt-3 text-[12.5px] ${highlight ? "text-[#D8D2F5]" : "text-[#6B6689]"}`}>{note}</p>
      <button className={`mt-5 w-full py-3 rounded-full text-[13px] font-bold ${highlight ? "bg-white text-[#1F1747]" : "bg-[#1F1747] text-white"}`}>
        Get started for free
      </button>
      <ul className="mt-6 space-y-2.5 flex-1">
        {features.map((f) => (
          <li key={f} className={`flex items-center gap-2 text-[13px] ${highlight ? "text-[#E8E4F9]" : "text-[#4B4368]"}`}>
            <Check size={13} className={highlight ? "text-[#C7BEEB]" : "text-[#1F1747]"} />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
