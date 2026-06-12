import { useNavigate } from "@tanstack/react-router";
import { Check, X, Infinity as InfinityIcon } from "lucide-react";
import { useAuth } from "@/lib/use-auth";

export type Plan = {
  id: "free" | "starter" | "pro" | "growth";
  name: string;
  tagline: string;
  price: string;
  oldPrice?: string;
  unit: string;
  features: string[];
  excluded?: string[];
  unlimitedFirst?: boolean;
  cta: string;
  href: string;
  badge?: "best";
  badgeText?: string;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Perfect to get started",
    price: "$0",
    unit: "/month",
    features: [
      "1 Try-On product",
      "Shareable link & QR code",
      "Works on any device",
    ],
    excluded: [
      "Ecomify branding shown",
      "Analytics dashboard",
      "Custom brand colours",
      "Priority support",
    ],
    cta: "Start for free",
    href: "/auth?mode=signup",
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Elevate your business",
    price: "$10",
    unit: "/month",
    features: [
      "10 Try-On products",
      "Remove Ecomify branding",
      "Analytics dashboard",
      "Shareable link & QR code",
      "Email support",
    ],
    excluded: [
      "Custom viewer skin",
      "Team seats",
    ],
    cta: "Sign in to Get Started",
    href: "/checkout?plan=starter",
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Scalability for pros",
    price: "$39",
    unit: "/month",
    features: [
      "50 Try-On products",
      "Custom brand colours & gradient",
      "3 team seats",
      "Analytics dashboard",
      "Remove Ecomify branding",
      "Same-category recommendations",
    ],
    excluded: [
      "Custom viewer skin",
    ],
    cta: "Sign in to Try Growth",
    href: "/checkout?plan=growth",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Unlimited everything for pros",
    price: "$49",
    oldPrice: "was $79/mo",
    unit: "/month",
    features: [
      "Unlimited Try-On products",
      "Custom viewer skin",
      "Custom brand colours & gradient",
      "Unlimited team seats",
      "Advanced analytics dashboard",
      "Same-category recommendations",
      "Watermarked downloads",
      "24/7 Priority support",
    ],
    unlimitedFirst: true,
    cta: "Sign in to Upgrade to Pro",
    href: "/checkout?plan=pro",
    badge: "best",
    badgeText: "Best Value · 21% off",
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

          return (
            <div key={p.id} className="relative flex group">
              {isBest && p.badgeText && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 -top-4 text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-white px-4 py-1.5 rounded-full z-10 whitespace-nowrap"
                  style={{
                    background: PREMIUM_GRADIENT,
                    boxShadow: "0 10px 30px -8px rgba(3,105,161,0.55), 0 2px 6px rgba(11,18,32,0.25)",
                  }}
                >
                  {p.badgeText}
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
              >
                <div className="p-7 lg:p-8 flex flex-col flex-1">
                  <h3
                    className="font-display text-[13px] font-extrabold uppercase tracking-[0.2em]"
                    style={{ color: "#0B1220" }}
                  >
                    {p.name}
                  </h3>

                  <div className="mt-5">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className="font-display text-[44px] font-extrabold leading-none tabular-nums tracking-tight"
                        style={{ color: "#0B1220" }}
                      >
                        {p.price}
                      </span>
                      <span className="text-[13px] font-medium text-slate-500">{p.unit}</span>
                    </div>
                  </div>

                  <p
                    className="mt-3 text-[14px] font-semibold leading-snug"
                    style={{ color: OCEAN_DEEP }}
                  >
                    {p.tagline}
                  </p>

                  {p.oldPrice && (
                    <div className="mt-1.5 text-[12.5px] text-slate-400 line-through">
                      {p.oldPrice}
                    </div>
                  )}

                  <a
                    href={p.href}
                    onClick={go(p)}
                    className="mt-6 w-full text-center py-3.5 rounded-full font-bold text-[12.5px] tracking-[0.08em] transition-all duration-300 relative overflow-hidden"
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

                  <div className="mt-7 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    What's included
                  </div>

                  <ul className="mt-4 space-y-3 flex-1">
                    {p.features.map((f, i) => {
                      const showInfinity = p.unlimitedFirst && i === 0;
                      return (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-[13.5px] text-slate-700 leading-snug"
                        >
                          <span
                            className="mt-0.5 shrink-0 inline-flex items-center justify-center rounded-full"
                            style={{
                              width: 18,
                              height: 18,
                              background: showInfinity ? OCEAN_DEEP : "rgba(3,105,161,0.10)",
                            }}
                          >
                            {showInfinity ? (
                              <InfinityIcon size={11} color="#fff" strokeWidth={3} />
                            ) : (
                              <Check size={11} style={{ color: OCEAN_DEEP }} strokeWidth={3.5} />
                            )}
                          </span>
                          <span>{f}</span>
                        </li>
                      );
                    })}
                    {p.excluded?.map((f, i) => (
                      <li
                        key={`x-${i}`}
                        className="flex items-start gap-3 text-[13.5px] leading-snug text-slate-400 line-through"
                      >
                        <span
                          className="mt-0.5 shrink-0 inline-flex items-center justify-center rounded-full"
                          style={{
                            width: 18,
                            height: 18,
                            background: "rgba(148,163,184,0.18)",
                          }}
                        >
                          <X size={11} className="text-slate-400" strokeWidth={3} />
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
