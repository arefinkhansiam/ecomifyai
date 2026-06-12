import { useNavigate } from "@tanstack/react-router";
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
  icon?: any;
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
    cta: "Start for free", href: "/auth?mode=signup",
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
    cta: "Get Started", href: "/checkout?plan=starter", badge: "popular",
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
    cta: "Try Growth", href: "/checkout?plan=growth",
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
    cta: "Upgrade to Pro", href: "/checkout?plan=pro", badge: "best", discount: "21% OFF",
  },
];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {PLANS.map((p) => {
          const isPro = p.badge === "best";

          return (
            <div
              key={p.id}
              className="relative flex flex-col p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "#0A0A0A",
                border: isPro ? "1px solid rgba(56,189,248,0.55)" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isPro
                  ? "0 20px 50px -20px rgba(14,165,233,0.45)"
                  : "0 10px 30px -16px rgba(0,0,0,0.5)",
              }}
            >
              {p.badge === "popular" && (
                <div className="absolute -top-3 left-6 text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full"
                  style={{ background: "#fff", color: "#0A0A0A" }}>
                  Most Popular
                </div>
              )}
              {isPro && (
                <div className="absolute -top-3 left-6 text-white text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full"
                  style={{ background: "linear-gradient(90deg, #0EA5E9, #0284C7)" }}>
                  Best Value · {p.discount}
                </div>
              )}

              {/* Header row: name + price */}
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-display text-[22px] font-bold text-white leading-tight">{p.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-[26px] font-extrabold text-white tabular-nums leading-none">{p.price}</span>
                  <span className="text-[12px] text-white/50">/mo</span>
                </div>
              </div>

              {/* Tagline in accent */}
              <p
                className="text-[13.5px] font-medium mb-1"
                style={{
                  background: "linear-gradient(90deg, #38BDF8, #0EA5E9)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {p.tagline}
              </p>

              {p.oldPrice && (
                <p className="text-[11px] text-white/40 line-through mb-1">was {p.oldPrice}/mo</p>
              )}

              {/* CTA — pill outlined like Shopify */}
              <a
                href={p.href}
                onClick={go(p)}
                className="w-full py-3 px-4 mt-5 mb-7 rounded-full font-semibold text-[13.5px] text-center inline-block transition-all duration-200"
                style={
                  isPro
                    ? {
                        background: "linear-gradient(90deg, #0EA5E9, #0284C7)",
                        color: "#fff",
                        border: "1px solid transparent",
                        boxShadow: "0 10px 24px -10px rgba(14,165,233,0.55)",
                      }
                    : {
                        background: "transparent",
                        color: "#fff",
                        border: "1.5px solid rgba(255,255,255,0.85)",
                      }
                }
              >
                {user || p.id === "free" ? p.cta : `Log in to ${p.cta}`}
              </a>

              {/* Features list — no icons, just rows divided by hairlines (Shopify-style) */}
              <ul className="flex-1 flex flex-col">
                {p.features.map((f, i) => (
                  <li
                    key={i}
                    className={`py-3 text-[13.5px] leading-snug ${f.icon === "x" ? "text-white/35 line-through" : "text-white/85"}`}
                    style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)" }}
                  >
                    {f.icon === "infinity" ? "Unlimited — " : ""}
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {!user && (
        <p className="text-center text-xs text-white/40 mt-8">You'll need to sign in or create an account to purchase a paid plan.</p>
      )}
    </div>
  );
}
