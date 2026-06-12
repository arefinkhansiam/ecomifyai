import { useNavigate } from "@tanstack/react-router";
import { Check, X, Infinity as InfinityIcon, Sparkles, Zap, Crown, Gem } from "lucide-react";
import { useAuth } from "@/lib/use-auth";

export type Plan = {
  id: "free" | "starter" | "pro" | "growth";
  name: string;
  price: string;
  perDay: string;
  oldPrice?: string;
  oldPerDay?: string;
  billed: string;
  tagline: string;
  features: { icon: "check" | "infinity" | "x"; text: string }[];
  cta: string;
  href: string;
  badge?: "popular" | "best";
  discount?: string;
  icon: typeof Sparkles;
};

export const PLANS: Plan[] = [
  {
    id: "free", name: "Free", price: "$0", perDay: "$0.00", billed: "Free forever", tagline: "Perfect to get started",
    features: [
      { icon: "check", text: "1 Try-On product" },
      { icon: "check", text: "Shareable link & QR code" },
      { icon: "check", text: "Works on any device" },
      { icon: "x", text: "Ecomify branding shown" },
      { icon: "x", text: "Analytics dashboard" },
      { icon: "x", text: "Custom brand colours" },
      { icon: "x", text: "Priority support" },
    ],
    cta: "Start for free", href: "/auth?mode=signup", icon: Sparkles,
  },
  {
    id: "starter", name: "Starter", price: "$10", perDay: "$0.33", billed: "$10, billed monthly", tagline: "Elevate your business",
    features: [
      { icon: "check", text: "10 Try-On products" },
      { icon: "check", text: "Remove Ecomify branding" },
      { icon: "check", text: "Analytics dashboard" },
      { icon: "check", text: "Shareable link & QR code" },
      { icon: "check", text: "Email support" },
      { icon: "x", text: "Custom viewer skin" },
      { icon: "x", text: "Team seats" },
    ],
    cta: "Get Started", href: "/checkout?plan=starter", icon: Zap, badge: "popular",
  },
  {
    id: "growth", name: "Growth", price: "$39", perDay: "$1.30", billed: "$39, billed monthly", tagline: "Scalability for pros",
    features: [
      { icon: "check", text: "50 Try-On products" },
      { icon: "check", text: "Custom brand colours & gradient" },
      { icon: "check", text: "3 team seats" },
      { icon: "check", text: "Analytics dashboard" },
      { icon: "check", text: "Remove Ecomify branding" },
      { icon: "check", text: "Same-category recommendations" },
      { icon: "x", text: "Custom viewer skin" },
    ],
    cta: "Try Growth", href: "/checkout?plan=growth", icon: Crown,
  },
  {
    id: "pro", name: "Pro", price: "$49", oldPrice: "$79", perDay: "$1.63", oldPerDay: "$2.60", billed: "$49, billed monthly", tagline: "Unlimited everything for pros",
    features: [
      { icon: "infinity", text: "Unlimited Try-On products" },
      { icon: "check", text: "Custom viewer skin" },
      { icon: "check", text: "Custom brand colours & gradient" },
      { icon: "check", text: "Unlimited team seats" },
      { icon: "check", text: "Advanced analytics dashboard" },
      { icon: "check", text: "Same-category recommendations" },
      { icon: "check", text: "Watermarked downloads" },
      { icon: "check", text: "24/7 Priority support" },
    ],
    cta: "Upgrade to Pro", href: "/checkout?plan=pro", icon: Gem, badge: "best", discount: "21% OFF",
  },
];

function FeatureRow({ kind, text }: { kind: "check" | "infinity" | "x"; text: string }) {
  if (kind === "x") {
    return (
      <li className="flex items-start gap-3 text-[13.5px] text-slate-400">
        <X size={16} strokeWidth={2.5} className="shrink-0 mt-0.5 text-slate-300" />
        <span className="line-through opacity-80">{text}</span>
      </li>
    );
  }
  const Icon = kind === "infinity" ? InfinityIcon : Check;
  return (
    <li className="flex items-start gap-3 text-[13.5px] text-slate-700">
      <Icon size={16} strokeWidth={2.75} className="shrink-0 mt-0.5" style={{ color: "#0EA5E9" }} />
      <span>{text}</span>
    </li>
  );
}

export function PricingCards() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const go = (p: Plan) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (p.id === "free") {
      navigate({ to: "/auth", search: { mode: "signup" } });
      return;
    }
    if (!user) {
      navigate({ to: "/auth", search: { mode: "signup", redirect: p.href } as any });
      return;
    }
    window.location.href = p.href;
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {PLANS.map((p) => {
          const isPopular = p.badge === "popular";
          const isPro = p.badge === "best";

          const cardStyle: React.CSSProperties = isPro
            ? {
                background: "#ffffff",
                border: "2px solid #0EA5E9",
                boxShadow: "0 20px 50px -20px rgba(14,165,233,0.40)",
              }
            : {
                background: "#ffffff",
                border: "1px solid #E2E8F0",
                boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 10px 30px -16px rgba(15,23,42,0.08)",
              };

          let btnStyle: React.CSSProperties = {
            background: "#ffffff",
            color: "#0F172A",
            border: "1px solid #E2E8F0",
          };
          if (isPopular) btnStyle = { background: "#0F172A", color: "#fff", border: "1px solid #0F172A" };
          if (isPro) btnStyle = { background: "linear-gradient(180deg, #0EA5E9 0%, #0284C7 100%)", color: "#fff", border: "1px solid #0284C7", boxShadow: "0 10px 24px -10px rgba(14,165,233,0.55)" };

          return (
            <div key={p.id} className="relative flex flex-col p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1" style={cardStyle}>
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full"
                  style={{ background: "linear-gradient(90deg, #0EA5E9, #0284C7)" }}>
                  Best Value · {p.discount}
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-3">{p.name}</h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-[44px] leading-none font-extrabold tabular-nums text-slate-900">{p.price}</span>
                  <span className="text-sm text-slate-400">/mo</span>
                </div>
                <div className="mt-2 h-5 flex items-center gap-2">
                  {p.oldPrice ? (
                    <>
                      <span className="text-[12px] line-through text-slate-400">was {p.oldPrice}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(14,165,233,0.10)", color: "#0284C7" }}>SAVE 38%</span>
                    </>
                  ) : (
                    <span className="text-[12px] text-slate-500">{p.tagline}</span>
                  )}
                </div>
              </div>

              {/* CTA */}
              <a href={p.href} onClick={go(p)} className="w-full py-3 px-4 rounded-xl font-semibold text-[13.5px] mb-6 text-center inline-block transition-all duration-200" style={btnStyle}>
                {user || p.id === "free" ? p.cta : `Log in to ${p.cta}`}
              </a>

              <div className="h-px w-full mb-5" style={{ background: "#EEF2F7" }} />

              <p className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-slate-400 mb-4">What's included</p>

              <ul className="space-y-3 flex-1">
                {p.features.map((f, i) => (
                  <FeatureRow key={i} kind={f.icon} text={f.text} />
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {!user && (
        <p className="text-center text-xs text-slate-400 mt-8">You'll need to sign in or create an account to purchase a paid plan.</p>
      )}
    </div>
  );
}
