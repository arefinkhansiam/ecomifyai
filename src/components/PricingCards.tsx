import { useNavigate } from "@tanstack/react-router";
import { Check, Sparkles, Info } from "lucide-react";
import { useAuth } from "@/lib/use-auth";

export type Plan = {
  id: "free" | "starter" | "pro" | "growth";
  name: string;
  tagline: string;
  price: string;        // numeric price, e.g. "$0", "$10"
  oldPrice?: string;    // strikethrough price
  unit: string;         // e.g. "free forever" or "per user / month, when paying monthly"
  promo?: string;       // e.g. "50% OFF FOR 3 MONTHS"
  features: string[];
  footerLabel: string;  // e.g. "Basic AI"
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

const OCEAN = "#0284C7";
const OCEAN_DEEP = "#0369A1";

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
    <div className="mx-auto max-w-[1240px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 items-stretch">
        {PLANS.map((p) => {
          const isBest = p.badge === "best";
          const isContact = p.id === "growth";

          return (
            <div key={p.id} className="relative flex">
              {/* BEST VALUE top tab */}
              {isBest && (
                <div
                  className="absolute left-0 right-0 -top-9 mx-auto text-center text-[11px] font-extrabold uppercase tracking-[0.18em] text-white py-2.5 rounded-t-2xl z-10"
                  style={{ background: OCEAN_DEEP }}
                >
                  Best Value
                </div>
              )}

              <div
                className="relative flex flex-col w-full bg-white"
                style={{
                  border: isBest ? `2px solid ${OCEAN_DEEP}` : "1px solid #E5E7EB",
                  borderRadius: isBest ? 16 : 12,
                  marginTop: isBest ? 0 : 1,
                  boxShadow: isBest ? "0 24px 60px -28px rgba(2,132,199,0.45)" : "none",
                  zIndex: isBest ? 5 : 1,
                }}
              >
                <div className="p-7 pb-6 flex flex-col flex-1">
                  {/* Name + tagline */}
                  <h3 className="font-display text-[22px] font-extrabold text-slate-900 leading-tight">
                    {p.name}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] text-slate-600 leading-snug min-h-[40px]">
                    {p.tagline}
                  </p>

                  {/* Promo pill */}
                  <div className="mt-5 h-7 flex items-center">
                    {p.promo && (
                      <span
                        className="inline-flex items-center text-[10.5px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
                        style={{
                          color: OCEAN_DEEP,
                          background: "rgba(2,132,199,0.10)",
                          border: "1px solid rgba(2,132,199,0.25)",
                        }}
                      >
                        {p.promo}
                      </span>
                    )}
                  </div>

                  {/* Price block */}
                  <div className="mt-3 min-h-[68px]">
                    {isContact ? (
                      <div className="flex items-center gap-2">
                        <span className="font-display text-[26px] font-extrabold text-slate-900 leading-none">
                          {p.price}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        {p.oldPrice && (
                          <span className="font-display text-[22px] font-extrabold text-slate-400 line-through leading-none tabular-nums">
                            {p.oldPrice}
                          </span>
                        )}
                        <span className="font-display text-[40px] font-extrabold text-slate-900 leading-none tabular-nums tracking-tight">
                          {p.price}
                        </span>
                        <span className="text-[12px] font-semibold text-slate-500">USD</span>
                      </div>
                    )}
                    <p className="mt-2 text-[12px] text-slate-500 flex items-center gap-1.5">
                      {p.unit}
                      {!isContact && <Info size={12} className="text-slate-400" />}
                    </p>
                  </div>

                  {/* CTA */}
                  <a
                    href={p.href}
                    onClick={go(p)}
                    className="mt-5 w-full text-center py-3 rounded-full font-bold text-[13px] tracking-wide uppercase transition-all duration-200"
                    style={
                      isBest
                        ? {
                            background: OCEAN_DEEP,
                            color: "#fff",
                            border: `2px solid ${OCEAN_DEEP}`,
                          }
                        : {
                            background: "transparent",
                            color: OCEAN_DEEP,
                            border: `2px solid ${OCEAN}`,
                          }
                    }
                  >
                    {p.cta}
                  </a>

                  {/* Features */}
                  <ul className="mt-6 space-y-3 flex-1">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-slate-700 leading-snug">
                        <Check size={16} className="mt-0.5 shrink-0" style={{ color: OCEAN_DEEP }} strokeWidth={3} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tinted footer row */}
                <div
                  className="px-7 py-3.5 flex items-center gap-2 text-[12.5px] font-semibold"
                  style={{
                    background: isBest ? "rgba(2,132,199,0.10)" : "rgba(2,132,199,0.05)",
                    color: OCEAN_DEEP,
                    borderTop: "1px solid rgba(2,132,199,0.15)",
                    borderBottomLeftRadius: isBest ? 14 : 11,
                    borderBottomRightRadius: isBest ? 14 : 11,
                  }}
                >
                  <Sparkles size={14} />
                  {p.footerLabel}
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
