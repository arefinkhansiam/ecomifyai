import { CheckCircle2, Crown, Sparkles, Zap } from "lucide-react";

export type Plan = {
  id: "free" | "starter" | "growth";
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
  variant: "ghost" | "primary" | "cyan";
  icon: typeof Sparkles;
};

export const PLANS: Plan[] = [
  {
    id: "free", name: "Free Forever", price: "$0", subtitle: "Perfect to get started.",
    features: [
      "1 AR product",
      "Basic AR viewer",
      "Shareable AR link & QR code",
      "Solid-color button only",
      "“Powered by Easibie” branding",
      "Email support",
    ],
    cta: "Get Started Free", href: "/auth?mode=signup", variant: "ghost", icon: Sparkles,
  },
  {
    id: "starter", name: "Starter", price: "$10", subtitle: "For growing stores.",
    features: [
      "10 AR products",
      "Advanced AR viewer + color variants",
      "Gradient button customizer",
      "Remove “Powered by Easibie” branding",
      "Embed code + Shopify snippet",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Start Starter Plan", href: "/checkout?plan=starter", variant: "primary", highlight: true, icon: Zap,
  },
  {
    id: "growth", name: "Growth", price: "$39", subtitle: "For serious sellers.",
    features: [
      "50 AR products",
      "Everything in Starter",
      "Custom brand colors & full gradient control",
      "Hide branding across all products",
      "3 team seats",
      "Advanced analytics & exports",
      "Dedicated support",
    ],
    cta: "Start Growth Plan", href: "/checkout?plan=growth", variant: "cyan", icon: Crown,
  },
];

const GRAD = "linear-gradient(135deg, #0B1220 0%, #0369A1 50%, #38BDF8 100%)";

export function PricingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto">
      {PLANS.map((p) => (
        <div
          key={p.id}
          className="rounded-2xl p-8 flex flex-col relative transition-transform hover:-translate-y-1"
          style={p.highlight ? {
            background: GRAD, color: "#fff",
            boxShadow: "0 40px 100px -30px rgba(2,132,199,0.6)",
            transform: "scale(1.03)",
          } : {
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(2,132,199,0.18)",
            boxShadow: "0 18px 40px -22px rgba(2,132,199,0.35)",
          }}
        >
          {p.highlight && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold text-ink" style={{ background: "#fff" }}>
              ★ Most Popular
            </div>
          )}
          <div className="w-12 h-12 rounded-2xl grid place-items-center mb-4" style={{ background: p.highlight ? "rgba(255,255,255,0.18)" : GRAD, color: "#fff" }}>
            <p.icon size={20} />
          </div>
          <div className="text-sm font-semibold uppercase tracking-wider opacity-80">{p.name}</div>
          <div className="font-display text-5xl font-extrabold mt-1" style={p.highlight ? { color: "#fff" } : { background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            {p.price}<span className="text-base font-normal opacity-70"> / mo</span>
          </div>
          <p className="text-sm mt-2" style={{ color: p.highlight ? "rgba(255,255,255,0.85)" : "var(--ink-soft)" }}>{p.subtitle}</p>
          <ul className="mt-6 space-y-3 flex-1">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm" style={{ color: p.highlight ? "#fff" : "var(--ink)" }}>
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: p.highlight ? "#7DD3FC" : "var(--success)" }} /> {f}
              </li>
            ))}
          </ul>
          <a
            href={p.href}
            className={`mt-8 w-full ${p.variant === "primary" ? "" : p.variant === "cyan" ? "btn-cyan" : "btn-ghost"}`}
            style={p.variant === "primary" ? {
              background: "#fff", color: "var(--primary)", padding: "14px 30px", borderRadius: 999,
              fontWeight: 700, fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            } : undefined}
          >
            {p.cta}
          </a>
        </div>
      ))}
    </div>
  );
}
