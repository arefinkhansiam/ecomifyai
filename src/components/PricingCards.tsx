import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, Crown, Sparkles, Zap, Gem, ArrowRight, Infinity as InfinityIcon, X } from "lucide-react";
import { useAuth } from "@/lib/use-auth";

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
      { icon: "check", text: "Works on any device" },
      { icon: "x", text: "Ecomify branding shown" },
      { icon: "x", text: "Analytics dashboard" },
      { icon: "x", text: "Custom brand colours" },
      { icon: "x", text: "Priority support" },
    ],
    cta: "Get Started Free", href: "/auth?mode=signup", icon: Sparkles,
  },
  {
    id: "starter", name: "Starter Monthly", price: "$10", perDay: "$0.33", billed: "$10, billed monthly",
    features: [
      { icon: "check", text: "10 Try-On products" },
      { icon: "check", text: "Remove Ecomify branding" },
      { icon: "check", text: "Analytics dashboard" },
      { icon: "check", text: "Shareable link & QR code" },
      { icon: "check", text: "Email support" },
      { icon: "x", text: "Custom viewer skin" },
      { icon: "x", text: "Team seats" },
    ],
    cta: "Start Starter Plan", href: "/checkout?plan=starter", icon: Zap,
    badge: "Most Popular",
  },
  {
    id: "growth", name: "Growth Monthly", price: "$39", perDay: "$1.30", billed: "$39, billed monthly",
    features: [
      { icon: "check", text: "50 Try-On products" },
      { icon: "check", text: "Custom brand colours & gradient" },
      { icon: "check", text: "3 team seats" },
      { icon: "check", text: "Analytics dashboard" },
      { icon: "check", text: "Remove Ecomify branding" },
      { icon: "check", text: "Same-category recommendations" },
      { icon: "x", text: "Custom viewer skin" },
    ],
    cta: "Start Growth Plan", href: "/checkout?plan=growth", icon: Crown,
  },
  {
    id: "pro", name: "Pro Monthly", price: "$79", perDay: "$2.60", oldPerDay: "$3.30", billed: "$79, billed monthly",
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
    cta: "Go Pro", href: "/checkout?plan=pro", icon: Gem,
    bestValue: true, discount: "21% OFF",
  },
];

const GRAD = "linear-gradient(135deg, #0369A1 0%, #38BDF8 100%)";

function FeatureIcon({ kind, active }: { kind: "check" | "infinity" | "x"; active: boolean }) {
  const color = active ? "#38BDF8" : "#7dd3fc";
  if (kind === "infinity") return <InfinityIcon size={16} style={{ color }} strokeWidth={2.5} />;
  if (kind === "x") return <X size={16} className="text-white/40" strokeWidth={2.5} />;
  return <Check size={16} style={{ color }} strokeWidth={3} />;
}

export function PricingCards() {
  const [selected, setSelected] = useState<string>("starter");
  const current = PLANS.find((p) => p.id === selected) ?? PLANS[1];
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCta = (e: React.MouseEvent) => {
    e.preventDefault();
    if (current.id === "free") {
      navigate({ to: "/auth", search: { mode: "signup" } });
      return;
    }
    if (!user) {
      navigate({ to: "/auth", search: { mode: "signup", redirect: current.href } as any });
      return;
    }
    window.location.href = current.href;
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="flex flex-col gap-5">
        {PLANS.map((p) => {
          const isSelected = selected === p.id;
          const bestValue = !!p.bestValue;
          const hasHeader = p.badge || bestValue;
          return (
            <button
              type="button"
              key={p.id}
              onClick={() => setSelected(p.id)}
              className="relative text-left pt-3 group focus:outline-none"
            >
              {hasHeader && (
                <div className="rounded-t-2xl px-5 pt-2.5 pb-3 -mb-3 text-center text-[12px] font-bold flex items-center justify-center gap-2"
                  style={{
                    background: GRAD,
                    boxShadow: "0 0 40px -10px rgba(56,189,248,0.6)",
                    color: "#fff",
                  }}>
                  {p.badge ?? "Best Value"}
                  {p.discount && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold" style={{ background: "#ef4444", color: "#fff", boxShadow: "0 0 12px rgba(239,68,68,0.6)" }}>
                      {p.discount}
                    </span>
                  )}
                </div>
              )}
              <div
                className="rounded-2xl p-5 sm:p-6 relative transition-all"
                style={{
                  background: isSelected
                    ? "linear-gradient(180deg, rgba(3,105,161,0.30) 0%, rgba(10,16,28,0.95) 100%)"
                    : "rgba(10,16,28,0.95)",
                  border: "none",
                  boxShadow: isSelected
                    ? "0 0 60px -10px rgba(56,189,248,0.55), inset 0 0 40px rgba(56,189,248,0.10)"
                    : "0 20px 50px -25px rgba(0,0,0,0.6)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-1 w-5 h-5 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: isSelected ? GRAD : "rgba(255,255,255,0.08)",
                    }}>
                    {isSelected && <Check size={11} strokeWidth={4} color="#fff" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-extrabold text-white text-xl sm:text-2xl leading-tight">{p.name}</div>
                    <div className="text-xs sm:text-sm text-white/55 mt-1">{p.billed}</div>
                  </div>
                  <div className="shrink-0 text-center px-4 py-3 rounded-xl"
                    style={{
                      background: isSelected ? GRAD : "linear-gradient(180deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))",
                      minWidth: 96,
                    }}>
                    {p.oldPerDay && (
                      <div className="text-[11px] leading-none mb-1 line-through" style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.5)" }}>{p.oldPerDay}</div>
                    )}
                    <div className="font-display font-extrabold text-2xl leading-none text-white">{p.perDay}</div>
                    <div className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: isSelected ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)" }}>per day</div>
                  </div>
                </div>

                <div className="my-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />

                <ul className="space-y-2.5">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-[14px] text-white/85">
                      <FeatureIcon kind={f.icon} active={isSelected} />
                      <span>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>

      {/* Single CTA */}
      <a
        href={current.href}
        onClick={handleCta}
        className="mt-7 w-full inline-flex items-center justify-center gap-3 rounded-2xl font-bold text-base py-4 px-6 transition-transform hover:-translate-y-0.5"
        style={{
          background: GRAD,
          color: "#fff",
          boxShadow: "0 25px 60px -15px rgba(56,189,248,0.7)",
        }}
      >
        {user || current.id === "free" ? current.cta : `Log in to ${current.cta}`} <ArrowRight size={18} />
      </a>
      {!user && current.id !== "free" && (
        <p className="text-center text-xs text-white/55 mt-3">You'll need to sign in or create an account to purchase a plan.</p>
      )}
    </div>
  );
}
