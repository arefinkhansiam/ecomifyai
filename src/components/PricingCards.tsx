import { Check, Crown, Sparkles, Zap, Gem, ArrowRight } from "lucide-react";

export type Plan = {
  id: "free" | "starter" | "pro" | "growth";
  name: string;
  price: string;
  perDay: string;
  subtitle: string;
  features: string[];
  cta: string;
  href: string;
  badge?: string;
  highlight?: boolean;
  icon: typeof Sparkles;
};

export const PLANS: Plan[] = [
  {
    id: "free", name: "Free Forever", price: "$0", perDay: "$0.00", subtitle: "1 try-on product, perfect to start.",
    features: ["1 Try-On product", "Basic Try-On viewer", "Shareable link & QR code", "“Powered by Ecomify” branding", "Email support"],
    cta: "Get Started Free", href: "/auth?mode=signup", icon: Sparkles,
  },
  {
    id: "starter", name: "Starter", price: "$10", perDay: "$0.33", subtitle: "For growing stores.",
    features: ["10 Try-On products", "Button colour customizer", "Remove Ecomify branding", "Embed snippet for any store", "Analytics dashboard", "Priority support"],
    cta: "Start Starter Plan", href: "/checkout?plan=starter", icon: Zap,
  },
  {
    id: "pro", name: "Pro", price: "$99", perDay: "$3.30", subtitle: "Pro tools for serious brands.",
    badge: "Most Popular", highlight: true,
    features: ["Unlimited Try-On products", "Up to 3 variants per product", "Categories & cross-sell", "Custom viewer skin", "Customer feedback signals", "Same-category recommendations", "Watermarked downloads"],
    cta: "Go Pro", href: "/checkout?plan=pro", icon: Gem,
  },
  {
    id: "growth", name: "Growth", price: "$39", perDay: "$1.30", subtitle: "Mid-size sellers.",
    features: ["50 Try-On products", "Everything in Starter", "Custom brand colours & gradient", "Hide all branding", "3 team seats", "Advanced analytics & exports"],
    cta: "Start Growth Plan", href: "/checkout?plan=growth", icon: Crown,
  },
];

const GRAD = "linear-gradient(135deg, #0369A1 0%, #38BDF8 100%)";

export function PricingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-10 max-w-7xl mx-auto">
      {PLANS.map((p) => {
        const highlight = !!p.highlight;
        return (
          <div key={p.id} className="relative">
            {highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-[11px] uppercase tracking-[0.15em] px-4 py-1 rounded-full font-bold text-white shadow-lg" style={{ background: GRAD, boxShadow: "0 10px 25px -8px rgba(56,189,248,0.7)" }}>
                {p.badge}
              </div>
            )}
            <div
              className="rounded-2xl p-6 sm:p-7 flex flex-col h-full relative overflow-hidden"
              style={{
                background: highlight
                  ? "linear-gradient(180deg, rgba(2,132,199,0.18) 0%, rgba(15,23,42,0.95) 100%)"
                  : "rgba(15,23,42,0.85)",
                border: highlight ? "1.5px solid #38BDF8" : "1px solid rgba(56,189,248,0.15)",
                boxShadow: highlight
                  ? "0 0 60px -10px rgba(56,189,248,0.55), inset 0 0 40px rgba(56,189,248,0.08)"
                  : "0 20px 50px -25px rgba(0,0,0,0.6)",
              }}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p.icon size={16} style={{ color: "#38BDF8" }} />
                    <div className="font-display font-bold text-white text-xl">{p.name}</div>
                  </div>
                  <p className="text-xs mt-1 text-white/60">{p.subtitle}</p>
                </div>
                <div className="text-right shrink-0 px-3 py-2 rounded-xl" style={{ background: highlight ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(56,189,248,0.2)" }}>
                  <div className="font-display font-extrabold text-white text-xl leading-none">{p.perDay}</div>
                  <div className="text-[10px] mt-1 text-white/60 uppercase tracking-wider">per day</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-extrabold text-3xl" style={{ background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{p.price}</span>
                  <span className="text-sm text-white/60">/ mo</span>
                </div>
              </div>

              <ul className="mt-5 space-y-2.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-white/85">
                    <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full grid place-items-center" style={{ background: GRAD }}>
                      <Check size={10} strokeWidth={3} color="#fff" />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={p.href}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full font-bold text-sm py-3.5 px-6 transition-transform hover:-translate-y-0.5"
                style={highlight ? {
                  background: GRAD, color: "#fff",
                  boxShadow: "0 14px 35px -10px rgba(56,189,248,0.7)",
                } : {
                  background: "rgba(255,255,255,0.06)", color: "#fff",
                  border: "1px solid rgba(56,189,248,0.35)",
                }}
              >
                {p.cta} <ArrowRight size={14} />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
