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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {PLANS.map((p) => {
          const isPro = p.badge === "best";
          const isPopular = p.badge === "popular";

          return (
            <div
              key={p.id}
              className="relative flex flex-col p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
              style={{
                background: isPro
                  ? "linear-gradient(180deg, #0B1220 0%, #050810 100%)"
                  : "#0A0A0A",
                border: isPro
                  ? "1px solid rgba(56,189,248,0.6)"
                  : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isPro
                  ? "0 30px 70px -25px rgba(14,165,233,0.55), inset 0 1px 0 rgba(255,255,255,0.06)"
                  : "0 14px 40px -20px rgba(0,0,0,0.6)",
              }}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full whitespace-nowrap"
                  style={{ background: "#fff", color: "#0A0A0A", boxShadow: "0 6px 18px -6px rgba(0,0,0,0.4)" }}>
                  Most Popular
                </div>
              )}
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full whitespace-nowrap"
                  style={{ background: "linear-gradient(90deg, #0EA5E9, #0284C7)", boxShadow: "0 8px 20px -6px rgba(14,165,233,0.6)" }}>
                  Best Value · {p.discount}
                </div>
              )}

              {/* Plan name */}
              <h3 className="font-display text-[15px] font-bold uppercase tracking-[0.18em] text-white/70 mb-4">
                {p.name}
              </h3>

              {/* Price block */}
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="font-display text-[44px] font-extrabold text-white tabular-nums leading-none tracking-tight">
                  {p.price}
                </span>
                <span className="text-[13px] font-medium text-white/45">/month</span>
              </div>

              {p.oldPrice && (
                <p className="text-[12px] text-white/40 line-through mb-2 tabular-nums">was {p.oldPrice}/mo</p>
              )}

              {/* Tagline */}
              <p
                className="text-[14px] font-semibold mb-6 leading-snug"
                style={{
                  background: "linear-gradient(90deg, #7DD3FC, #0EA5E9)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {p.tagline}
              </p>

              {/* CTA */}
              <a
                href={p.href}
                onClick={go(p)}
                className="w-full py-3.5 px-4 mb-7 rounded-full font-semibold text-[14px] text-center inline-block transition-all duration-200 hover:scale-[1.02]"
                style={
                  isPro
                    ? {
                        background: "linear-gradient(90deg, #38BDF8, #0284C7)",
                        color: "#fff",
                        boxShadow: "0 12px 28px -10px rgba(14,165,233,0.7)",
                      }
                    : {
                        background: "#fff",
                        color: "#0A0A0A",
                        boxShadow: "0 6px 18px -8px rgba(255,255,255,0.4)",
                      }
                }
              >
                {user || p.id === "free" ? p.cta : `Sign in to ${p.cta}`}
              </a>

              {/* Divider label */}
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40 mb-3">
                What's included
              </div>

              {/* Features */}
              <ul className="flex-1 flex flex-col gap-2.5">
                {p.features.map((f, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2.5 text-[13.5px] leading-snug ${
                      f.icon === "x" ? "text-white/35" : "text-white/85"
                    }`}
                  >
                    <span
                      className="mt-[3px] shrink-0 w-4 h-4 rounded-full grid place-items-center text-[10px] font-bold"
                      style={
                        f.icon === "x"
                          ? { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }
                          : f.icon === "infinity"
                          ? { background: "linear-gradient(135deg, #38BDF8, #0284C7)", color: "#fff" }
                          : { background: "rgba(14,165,233,0.18)", color: "#7DD3FC" }
                      }
                    >
                      {f.icon === "x" ? "✕" : f.icon === "infinity" ? "∞" : "✓"}
                    </span>
                    <span className={f.icon === "x" ? "line-through" : ""}>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {!user && (
        <p className="text-center text-[13px] text-white/45 mt-10">
          You'll need to sign in or create an account to purchase a paid plan.
        </p>
      )}
    </div>
  );
}
