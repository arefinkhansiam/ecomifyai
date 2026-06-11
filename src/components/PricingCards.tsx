import { Check, Crown, Sparkles, Zap, Gem, ArrowRight, Infinity as InfinityIcon, X } from "lucide-react";

export type Plan = {
  id: "free" | "starter" | "pro" | "growth";
  name: string;
  price: string;
  perDay: string;
  oldPerDay?: string;
  billed: string;
  features: { icon: "check" | "infinity" | "x"; text: string }[];
  cta: string;
  href: string;
  badge?: string;
  highlight?: boolean;
  bestValue?: boolean;
  discount?: string;
  icon: typeof Sparkles;
};

export const PLANS: Plan[] = [
  {
    id: "free", name: "Free Forever", price: "$0", perDay: "$0.00", billed: "Free forever",
    features: [
      { icon: "check", text: "1 Try-On product" },
      { icon: "check", text: "Shareable link & QR code" },
      { icon: "x", text: "Ecomify branding shown" },
    ],
    cta: "Get Started Free", href: "/auth?mode=signup", icon: Sparkles,
  },
  {
    id: "starter", name: "Starter Monthly", price: "$10", perDay: "$0.33", billed: "$10, billed monthly",
    features: [
      { icon: "check", text: "10 Try-On products" },
      { icon: "check", text: "Remove Ecomify branding" },
      { icon: "check", text: "Analytics dashboard" },
    ],
    cta: "Start Starter Plan", href: "/checkout?plan=starter", icon: Zap,
    badge: "Most Popular", highlight: true,
  },
  {
    id: "pro", name: "Pro Annual", price: "$79", perDay: "$2.60", oldPerDay: "$3.30", billed: "$79/month, billed annually",
    features: [
      { icon: "infinity", text: "Unlimited Try-On products" },
      { icon: "check", text: "Custom viewer skin + analytics" },
    ],
    cta: "Go Pro", href: "/checkout?plan=pro", icon: Gem,
    bestValue: true, discount: "21% OFF",
  },
  {
    id: "growth", name: "Growth Monthly", price: "$39", perDay: "$1.30", billed: "$39, billed monthly",
    features: [
      { icon: "infinity", text: "50 Try-On products" },
      { icon: "check", text: "Custom brand colours & 3 team seats" },
    ],
    cta: "Start Growth Plan", href: "/checkout?plan=growth", icon: Crown,
  },
];

const GRAD = "linear-gradient(135deg, #0369A1 0%, #38BDF8 100%)";

function FeatureIcon({ kind }: { kind: "check" | "infinity" | "x" }) {
  if (kind === "infinity") return <InfinityIcon size={16} style={{ color: "#38BDF8" }} strokeWidth={2.5} />;
  if (kind === "x") return <X size={16} className="text-white/40" strokeWidth={2.5} />;
  return <Check size={16} style={{ color: "#38BDF8" }} strokeWidth={3} />;
}

export function PricingCards() {
  return (
    <div className="flex flex-col gap-5 mt-10 max-w-2xl mx-auto">
      {PLANS.map((p) => {
        const highlight = !!p.highlight;
        const bestValue = !!p.bestValue;
        const accent = highlight ? "#38BDF8" : bestValue ? "#0369A1" : "transparent";
        return (
          <div key={p.id} className="relative pt-3">
            {(p.badge || bestValue) && (
              <div className="rounded-t-2xl px-5 pt-2.5 pb-3 -mb-3 text-center text-[12px] font-bold text-[#02060c] flex items-center justify-center gap-2"
                style={{
                  background: highlight ? "linear-gradient(180deg, #38BDF8 0%, #0EA5E9 100%)" : "linear-gradient(180deg, #0369A1 0%, #075985 100%)",
                  boxShadow: highlight ? "0 0 40px -8px rgba(56,189,248,0.7)" : "0 0 30px -10px rgba(3,105,161,0.6)",
                  color: highlight ? "#02060c" : "#fff",
                }}>
                {p.badge ?? "Best Value"}
                {p.discount && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold" style={{ background: "#e11d48", color: "#fff" }}>
                    {p.discount}
                  </span>
                )}
              </div>
            )}
            <div
              className="rounded-2xl p-5 sm:p-6 relative"
              style={{
                background: "rgba(10,16,28,0.95)",
                border: `1.5px solid ${highlight ? "#38BDF8" : bestValue ? "#0369A1" : "rgba(56,189,248,0.12)"}`,
                boxShadow: highlight
                  ? "0 0 60px -10px rgba(56,189,248,0.55), inset 0 0 40px rgba(56,189,248,0.06)"
                  : bestValue
                  ? "0 0 50px -15px rgba(3,105,161,0.5)"
                  : "0 20px 50px -25px rgba(0,0,0,0.6)",
              }}
            >
              {/* Header row: radio + name/billed + price */}
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: highlight ? "#38BDF8" : "rgba(255,255,255,0.25)", background: highlight ? "#38BDF8" : "transparent" }}>
                  {highlight && <Check size={11} strokeWidth={4} color="#02060c" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-extrabold text-white text-xl sm:text-2xl leading-tight">{p.name}</div>
                  <div className="text-xs sm:text-sm text-white/55 mt-1">{p.billed}</div>
                </div>
                <div className="shrink-0 text-center px-4 py-3 rounded-xl"
                  style={{
                    background: highlight
                      ? "linear-gradient(180deg, #38BDF8 0%, #0EA5E9 100%)"
                      : "linear-gradient(180deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))",
                    border: highlight ? "none" : "1px solid rgba(255,255,255,0.06)",
                    minWidth: 96,
                  }}>
                  {p.oldPerDay && (
                    <div className="text-[11px] text-white/50 line-through leading-none mb-1">{p.oldPerDay}</div>
                  )}
                  <div className="font-display font-extrabold text-2xl leading-none" style={{ color: highlight ? "#02060c" : "#fff" }}>{p.perDay}</div>
                  <div className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: highlight ? "rgba(2,6,12,0.7)" : "rgba(255,255,255,0.6)" }}>per day</div>
                </div>
              </div>

              {/* Divider */}
              <div className="my-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />

              <ul className="space-y-2.5">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-[14px] text-white/85">
                    <FeatureIcon kind={f.icon} />
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex justify-end">
                <a
                  href={p.href}
                  className="inline-flex items-center gap-2 rounded-full font-bold text-xs px-4 py-2 transition-transform hover:-translate-y-0.5"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "#fff",
                    border: `1px solid ${accent === "transparent" ? "rgba(56,189,248,0.3)" : accent}`,
                  }}
                >
                  {p.cta} <ArrowRight size={12} />
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
