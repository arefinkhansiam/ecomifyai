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
    id: "free", name: "Free Forever", price: "$0", perDay: "$0.00", billed: "Free forever", tagline: "Perfect to get started",
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
    id: "starter", name: "Starter Monthly", price: "$10", perDay: "$0.33", billed: "$10, billed monthly", tagline: "Elevate your business",
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
    id: "growth", name: "Growth Monthly", price: "$39", perDay: "$1.30", billed: "$39, billed monthly", tagline: "Scalability for pros",
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
    id: "pro", name: "Pro Monthly", price: "$49", oldPrice: "$79", perDay: "$1.63", oldPerDay: "$2.60", billed: "$49, billed monthly", tagline: "Unlimited everything for pros",
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

function FeatureRow({ kind, text, accent }: { kind: "check" | "infinity" | "x"; text: string; accent?: boolean }) {
  if (kind === "x") {
    return (
      <li className="flex items-start gap-3 text-[13.5px] text-slate-500">
        <X size={18} strokeWidth={2.5} className="shrink-0 mt-0.5" />
        <span className="line-through opacity-80">{text}</span>
      </li>
    );
  }
  const Icon = kind === "infinity" ? InfinityIcon : Check;
  return (
    <li className={`flex items-start gap-3 text-[13.5px] ${accent ? "text-sky-50 font-semibold" : "text-slate-300"}`}>
      <Icon size={18} strokeWidth={2.75} className={`shrink-0 mt-0.5 ${accent ? "text-sky-300" : "text-sky-500"}`} />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((p) => {
          const isStarter = p.badge === "popular";
          const isPro = p.badge === "best";

          const cardBase = "relative flex flex-col p-7 lg:p-8 rounded-3xl transition-colors";
          let cardStyle: React.CSSProperties = {
            background: "rgba(30, 41, 59, 0.30)",
            border: "1px solid rgb(30, 41, 59)",
          };
          if (isStarter) {
            cardStyle = {
              background: "rgba(30, 41, 59, 0.40)",
              border: "2px solid rgba(14, 165, 233, 0.55)",
              boxShadow: "0 0 40px -15px rgba(14, 165, 233, 0.45)",
            };
          }
          if (isPro) {
            cardStyle = {
              background: "linear-gradient(180deg, rgba(2, 132, 199, 0.22) 0%, rgba(30, 41, 59, 0.30) 100%)",
              border: "1px solid rgba(14, 165, 233, 0.35)",
              boxShadow: "0 30px 70px -30px rgba(14, 165, 233, 0.55)",
            };
          }

          const titleColor = isStarter ? "text-sky-400" : isPro ? "text-sky-300" : "text-slate-400";

          let btnClass = "w-full py-3 px-4 rounded-xl font-semibold text-[13.5px] mb-7 transition-colors";
          let btnStyle: React.CSSProperties = { background: "#1e293b", color: "#fff" };
          if (isStarter) {
            btnStyle = { background: "#0EA5E9", color: "#fff", boxShadow: "0 12px 28px -12px rgba(14,165,233,0.65)" };
          }
          if (isPro) {
            btnClass += " font-bold";
            btnStyle = { background: "#fff", color: "#0F172A", boxShadow: "0 14px 30px -12px rgba(255,255,255,0.25)" };
          }

          return (
            <div key={p.id} className={cardBase} style={cardStyle}>
              {/* Badges */}
              {isStarter && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              {isPro && (
                <div className="absolute -top-3 right-5 bg-white text-sky-900 text-[10px] font-extrabold uppercase tracking-[0.16em] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                  Best Value
                  <span className="text-sky-300">|</span>
                  <span className="text-sky-600">{p.discount}</span>
                </div>
              )}

              {/* Header */}
              <div className="mb-7">
                <h3 className={`text-[15px] font-medium mb-2 ${titleColor}`}>{p.name}</h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-[42px] leading-none font-extrabold text-white tabular-nums">{p.price}</span>
                  <span className="text-slate-500 text-sm">/mo</span>
                </div>
                {p.oldPrice ? (
                  <div className="mt-1.5 text-[11.5px] text-slate-500 line-through">was {p.oldPrice}</div>
                ) : (
                  <p className="text-slate-500 text-[11.5px] mt-2">{p.tagline}</p>
                )}
              </div>

              {/* CTA */}
              <a href={p.href} onClick={go(p)} className={btnClass + " text-center inline-block"} style={btnStyle}>
                {user || p.id === "free" ? p.cta : `Log in to ${p.cta}`}
              </a>

              {/* Features */}
              <ul className="space-y-3.5 mt-1">
                {p.features.map((f, i) => (
                  <FeatureRow key={i} kind={f.icon} text={f.text} accent={isPro && i === 0} />
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {!user && (
        <p className="text-center text-xs text-white/55 mt-8">You'll need to sign in or create an account to purchase a paid plan.</p>
      )}
    </div>
  );
}
