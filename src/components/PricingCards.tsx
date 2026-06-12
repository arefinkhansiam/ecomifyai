import { useNavigate } from "@tanstack/react-router";
import { Check, Info } from "lucide-react";
import { useAuth } from "@/lib/use-auth";

export type Plan = {
  id: "free" | "starter" | "pro" | "growth";
  name: string;
  tagline: string;
  price: string;
  oldPrice?: string;
  unit: string;
  promo?: string;
  features: string[];
  footerLabel: string;
  cta: string;
  href: string;
  badge?: "best";
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "A simpler way to launch your first try-on",
    price: "$0",
    unit: "free forever",
    features: [
      "1 Try-On product",
      "Shareable link & QR code",
      "Works on any device",
      "Email support",
    ],
    footerLabel: "Basic AI",
    cta: "Get started",
    href: "/auth?mode=signup",
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Elevate your store with branded try-ons",
    price: "$10",
    oldPrice: "$13",
    unit: "per month, when paying monthly",
    promo: "Launch promo · 21% off",
    features: [
      "10 Try-On products",
      "Remove Ecomify branding",
      "Analytics dashboard",
      "Shareable link & QR code",
    ],
    footerLabel: "Standard AI",
    cta: "Get started",
    href: "/checkout?plan=starter",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Scale with unlimited AI-powered try-ons",
    price: "$49",
    oldPrice: "$79",
    unit: "per month, when paying monthly",
    promo: "Launch promo · 21% off",
    features: [
      "Unlimited Try-On products",
      "Custom brand colours & gradient",
      "Unlimited team seats",
      "Advanced analytics dashboard",
    ],
    footerLabel: "Advanced AI",
    cta: "Get started",
    href: "/checkout?plan=pro",
    badge: "best",
  },
  {
    id: "growth",
    name: "Growth+",
    tagline: "Maximize performance on the most comprehensive plan",
    price: "Contact us",
    unit: "for pricing",
    features: [
      "Everything in Pro",
      "50+ Try-On products",
      "Same-category recommendations",
      "Priority 24/7 support",
    ],
    footerLabel: "Enterprise-Grade AI",
    cta: "Contact sales",
    href: "/checkout?plan=growth",
  },
];

const OCEAN_DEEP = "#0369A1";
const PREMIUM_GRADIENT = "linear-gradient(135deg, #0B1220 0%, #0F2A44 45%, #0369A1 100%)";
const PREMIUM_GRADIENT_HOVER = "linear-gradient(135deg, #050912 0%, #0B2138 45%, #0284C7 100%)";

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
    <div className="mx-auto max-w-[1280px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5 items-stretch">
        {PLANS.map((p) => {
          const isBest = p.badge === "best";
          const isContact = p.id === "growth";

          return (
            <div key={p.id} className="relative flex group">
              {isBest && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 -top-4 text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-white px-4 py-1.5 rounded-full z-10 whitespace-nowrap"
                  style={{
                    background: PREMIUM_GRADIENT,
                    boxShadow: "0 10px 30px -8px rgba(3,105,161,0.55), 0 2px 6px rgba(11,18,32,0.25)",
                  }}
                >
                  Best Value
                </div>
              )}

              <div
                className="relative flex flex-col w-full bg-white rounded-2xl overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-1.5"
                style={{
                  border: isBest ? `1.5px solid ${OCEAN_DEEP}` : "1px solid #E8ECF1",
                  boxShadow: isBest
                    ? "0 30px 70px -28px rgba(3,105,161,0.35), 0 8px 22px -12px rgba(11,18,32,0.18)"
                    : "0 1px 2px rgba(11,18,32,0.04), 0 8px 24px -16px rgba(11,18,32,0.10)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = isBest
                    ? "0 40px 90px -30px rgba(3,105,161,0.45), 0 14px 32px -14px rgba(11,18,32,0.22)"
                    : "0 24px 60px -28px rgba(11,18,32,0.25), 0 6px 18px -10px rgba(3,105,161,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = isBest
                    ? "0 30px 70px -28px rgba(3,105,161,0.35), 0 8px 22px -12px rgba(11,18,32,0.18)"
                    : "0 1px 2px rgba(11,18,32,0.04), 0 8px 24px -16px rgba(11,18,32,0.10)";
                }}
              >
                <div className="p-7 lg:p-8 flex flex-col flex-1">
                  <h3
                    className="font-display text-[22px] font-extrabold leading-tight tracking-tight"
                    style={{ color: "#0B1220" }}
                  >
                    {p.name}
                  </h3>
                  <p className="mt-2 text-[13.5px] text-slate-600 leading-snug min-h-[42px]">
                    {p.tagline}
                  </p>

                  <div className="mt-5 h-7 flex items-center">
                    {p.promo && (
                      <span
                        className="inline-flex items-center text-[10.5px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full"
                        style={{
                          color: OCEAN_DEEP,
                          background: "rgba(2,132,199,0.08)",
                          border: "1px solid rgba(2,132,199,0.22)",
                        }}
                      >
                        {p.promo}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 min-h-[72px]">
                    {isContact ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="font-display text-[28px] font-extrabold leading-none tracking-tight"
                          style={{ color: "#0B1220" }}
                        >
                          {p.price}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        {p.oldPrice && (
                          <span className="font-display text-[20px] font-bold text-slate-400 line-through leading-none tabular-nums">
                            {p.oldPrice}
                          </span>
                        )}
                        <span
                          className="font-display text-[44px] font-extrabold leading-none tabular-nums tracking-tight"
                          style={{ color: "#0B1220" }}
                        >
                          {p.price}
                        </span>
                        <span className="text-[12px] font-semibold text-slate-500">USD</span>
                      </div>
                    )}
                    <p className="mt-2.5 text-[12px] text-slate-500 flex items-center gap-1.5">
                      {p.unit}
                      {!isContact && <Info size={12} className="text-slate-400" />}
                    </p>
                  </div>

                  <a
                    href={p.href}
                    onClick={go(p)}
                    className="mt-6 w-full text-center py-3.5 rounded-full font-bold text-[12.5px] tracking-[0.12em] uppercase transition-all duration-300 relative overflow-hidden"
                    style={{
                      background: PREMIUM_GRADIENT,
                      color: "#fff",
                      border: "1px solid rgba(11,18,32,0.6)",
                      boxShadow: "0 10px 24px -10px rgba(3,105,161,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = PREMIUM_GRADIENT_HOVER;
                      e.currentTarget.style.boxShadow =
                        "0 16px 34px -10px rgba(3,105,161,0.6), inset 0 1px 0 rgba(255,255,255,0.18)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = PREMIUM_GRADIENT;
                      e.currentTarget.style.boxShadow =
                        "0 10px 24px -10px rgba(3,105,161,0.45), inset 0 1px 0 rgba(255,255,255,0.12)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {p.cta}
                  </a>

                  <div className="mt-7 h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(11,18,32,0.10), transparent)" }} />

                  <ul className="mt-6 space-y-3.5 flex-1">
                    {p.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-[13.5px] text-slate-700 leading-snug"
                      >
                        <span
                          className="mt-0.5 shrink-0 inline-flex items-center justify-center rounded-full"
                          style={{
                            width: 18,
                            height: 18,
                            background: "rgba(3,105,161,0.10)",
                          }}
                        >
                          <Check size={11} style={{ color: OCEAN_DEEP }} strokeWidth={3.5} />
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!user && (
        <p className="text-center text-[13px] text-slate-500 mt-10">
          You'll need to sign in or create an account to purchase a paid plan.
        </p>
      )}
    </div>
  );
}
