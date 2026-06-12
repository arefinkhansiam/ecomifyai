import { useNavigate } from "@tanstack/react-router";
import { Check, X, Infinity as InfinityIcon, Sparkles, Zap, Crown, Gem, ShieldCheck } from "lucide-react";
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
        <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-slate-100">
          <X size={11} strokeWidth={3} className="text-slate-400" />
        </span>
        <span className="line-through opacity-80">{text}</span>
      </li>
    );
  }
  const Icon = kind === "infinity" ? InfinityIcon : Check;
  return (
    <li className="flex items-start gap-3 text-[13.5px] text-slate-700">
      <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-[18px] h-[18px] rounded-full" style={{ background: "rgba(14,165,233,0.12)" }}>
        <Icon size={11} strokeWidth={3.25} style={{ color: "#0284C7" }} />
      </span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5 items-stretch">
        {PLANS.map((p) => {
          const isStarter = p.badge === "popular";
          const isPro = p.badge === "best";
          const Icon = p.icon;

          // Card surface
          const cardBase = "group relative flex flex-col p-7 lg:p-8 rounded-[20px] transition-all duration-300 hover:-translate-y-1";
          let cardStyle: React.CSSProperties = {
            background: "#ffffff",
            border: "1px solid #E2E8F0",
            boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.08)",
          };
          if (isStarter) {
            cardStyle = {
              background: "#ffffff",
              border: "1px solid rgba(14,165,233,0.35)",
              boxShadow: "0 1px 2px rgba(14,165,233,0.08), 0 18px 40px -18px rgba(14,165,233,0.30)",
            };
          }
          if (isPro) {
            cardStyle = {
              background: "linear-gradient(180deg, #0C2340 0%, #0F2F5C 100%)",
              border: "1px solid rgba(56,189,248,0.40)",
              boxShadow: "0 24px 60px -24px rgba(2,132,199,0.55), 0 2px 0 rgba(255,255,255,0.04) inset",
              transform: "translateY(-4px)",
            };
          }

          // Typography colors
          const titleColor = isPro ? "text-sky-300" : "text-slate-500";
          const priceColor = isPro ? "text-white" : "text-slate-900";
          const taglineColor = isPro ? "text-sky-100/70" : "text-slate-500";
          const dividerColor = isPro ? "rgba(255,255,255,0.10)" : "#EEF2F7";

          // CTA
          let btnClass = "w-full py-3 px-4 rounded-xl font-semibold text-[13.5px] mb-6 transition-all duration-200 text-center inline-block";
          let btnStyle: React.CSSProperties = { background: "#F1F5F9", color: "#0F172A" };
          if (isStarter) {
            btnStyle = { background: "linear-gradient(180deg, #0EA5E9 0%, #0284C7 100%)", color: "#fff", boxShadow: "0 10px 24px -10px rgba(14,165,233,0.55)" };
          }
          if (isPro) {
            btnStyle = { background: "#ffffff", color: "#0C2340", boxShadow: "0 10px 24px -10px rgba(255,255,255,0.35)" };
          }

          return (
            <div key={p.id} className={cardBase} style={cardStyle}>
              {/* Badges */}
              {isStarter && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full shadow-md"
                  style={{ background: "linear-gradient(90deg, #0EA5E9, #0284C7)" }}>
                  Most Popular
                </div>
              )}
              {isPro && (
                <div className="absolute -top-3 right-5 text-[10px] font-bold uppercase tracking-[0.16em] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md"
                  style={{ background: "linear-gradient(90deg, #FBBF24, #F59E0B)", color: "#3B2A05" }}>
                  Best Value · {p.discount}
                </div>
              )}

              {/* Icon chip */}
              <div className="mb-5">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl"
                  style={{
                    background: isPro ? "rgba(56,189,248,0.15)" : "rgba(14,165,233,0.10)",
                    border: isPro ? "1px solid rgba(56,189,248,0.30)" : "1px solid rgba(14,165,233,0.20)",
                  }}>
                  <Icon size={18} style={{ color: isPro ? "#7DD3FC" : "#0284C7" }} strokeWidth={2.25} />
                </div>
              </div>

              {/* Header */}
              <div className="mb-6">
                <h3 className={`text-[13px] font-semibold uppercase tracking-[0.12em] mb-3 ${titleColor}`}>{p.name}</h3>
                <div className="flex items-baseline gap-1.5">
                  <span className={`font-display text-[44px] leading-none font-extrabold tabular-nums ${priceColor}`}>{p.price}</span>
                  <span className={`text-sm ${isPro ? "text-sky-200/60" : "text-slate-400"}`}>/mo</span>
                  {p.oldPrice && (
                    <span className={`ml-2 text-[12px] line-through ${isPro ? "text-sky-200/40" : "text-slate-400"}`}>{p.oldPrice}</span>
                  )}
                </div>
                <p className={`text-[12px] mt-2.5 ${taglineColor}`}>{p.tagline}</p>
              </div>

              {/* CTA */}
              <a href={p.href} onClick={go(p)} className={btnClass} style={btnStyle}>
                {user || p.id === "free" ? p.cta : `Log in to ${p.cta}`}
              </a>

              {/* Divider */}
              <div className="h-px w-full mb-5" style={{ background: dividerColor }} />

              <p className={`text-[10.5px] uppercase tracking-[0.14em] font-semibold mb-4 ${isPro ? "text-sky-200/60" : "text-slate-400"}`}>
                What's included
              </p>

              {/* Features */}
              <ul className="space-y-3 flex-1">
                {p.features.map((f, i) => (
                  isPro ? (
                    <li key={i} className={`flex items-start gap-3 text-[13.5px] ${f.icon === "x" ? "text-slate-400" : "text-sky-50"}`}>
                      <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-[18px] h-[18px] rounded-full"
                        style={{ background: f.icon === "x" ? "rgba(255,255,255,0.06)" : "rgba(125,211,252,0.18)" }}>
                        {f.icon === "x" ? (
                          <X size={11} strokeWidth={3} className="text-slate-400" />
                        ) : f.icon === "infinity" ? (
                          <InfinityIcon size={11} strokeWidth={3.25} style={{ color: "#7DD3FC" }} />
                        ) : (
                          <Check size={11} strokeWidth={3.25} style={{ color: "#7DD3FC" }} />
                        )}
                      </span>
                      <span className={f.icon === "x" ? "line-through opacity-70" : ""}>{f.text}</span>
                    </li>
                  ) : (
                    <FeatureRow key={i} kind={f.icon} text={f.text} />
                  )
                ))}
              </ul>

              {isPro && (
                <div className="mt-6 pt-5 flex items-center gap-2 text-[11px] text-sky-100/60" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <ShieldCheck size={13} style={{ color: "#7DD3FC" }} />
                  7-day free trial · cancel anytime
                </div>
              )}
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
