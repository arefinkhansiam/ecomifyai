import { Check } from "lucide-react";
import { Crown, Sparkles, Zap, Gem } from "lucide-react";

export type Plan = {
  id: "free" | "starter" | "pro" | "growth";
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
  variant: "ghost" | "primary" | "cyan" | "pro";
  icon: typeof Sparkles;
};

export const PLANS: Plan[] = [
  {
    id: "free", name: "Free Forever", price: "$0", subtitle: "Perfect to get started.",
    features: [
      "1 Try-On product",
      "Basic Try-On viewer",
      "Shareable link & QR code",
      "“Powered by Easibie” branding",
      "Email support",
    ],
    cta: "Get Started Free", href: "/auth?mode=signup", variant: "ghost", icon: Sparkles,
  },
  {
    id: "starter", name: "Starter", price: "$10", subtitle: "For growing stores.",
    features: [
      "10 Try-On products",
      "Basic button colour customizer",
      "Remove “Powered by Easibie” branding",
      "Embed code + Shopify snippet",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Start Starter Plan", href: "/checkout?plan=starter", variant: "primary", icon: Zap,
  },
  {
    id: "pro", name: "Pro", price: "$99", subtitle: "Pro tools for serious brands.",
    features: [
      "Unlimited Try-On products",
      "Up to 3 variants per product",
      "Product categories & cross-sell",
      "Full Try-On button branding",
      "Custom Try-On viewer skin",
      "Customer feedback signals",
      "Same-category recommendations",
      "Your store watermark on downloads",
    ],
    cta: "Go Pro", href: "/checkout?plan=pro", variant: "pro", highlight: true, icon: Gem,
  },
  {
    id: "growth", name: "Growth", price: "$39", subtitle: "Mid-size sellers.",
    features: [
      "50 Try-On products",
      "Everything in Starter",
      "Custom brand colors & gradient",
      "Hide all branding",
      "3 team seats",
      "Advanced analytics & exports",
    ],
    cta: "Start Growth Plan", href: "/checkout?plan=growth", variant: "cyan", icon: Crown,
  },
];

const GRAD = "linear-gradient(135deg, #0B1220 0%, #0369A1 50%, #38BDF8 100%)";

export function PricingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-12 max-w-7xl mx-auto">
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
              Most Popular
            </div>
          )}
          <div className="text-sm font-semibold uppercase tracking-wider opacity-80">{p.name}</div>
          <div className="font-display text-5xl font-extrabold mt-1 flex items-baseline gap-1" style={p.highlight ? { color: "#fff" } : { color: "#0B1220" }}>
            <span style={p.highlight ? { color: "#fff" } : { background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{p.price}</span>
            <span className="text-base font-medium" style={{ color: p.highlight ? "rgba(255,255,255,0.75)" : "var(--ink-soft)" }}>/ mo</span>
          </div>
          <p className="text-sm mt-2" style={{ color: p.highlight ? "rgba(255,255,255,0.85)" : "var(--ink-soft)" }}>{p.subtitle}</p>
          <ul className="mt-6 space-y-3 flex-1">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: p.highlight ? "#fff" : "var(--ink)" }}>
                <span
                  className="shrink-0 mt-0.5 w-4 h-4 rounded-full grid place-items-center"
                  style={{ background: p.highlight ? "rgba(255,255,255,0.2)" : GRAD, color: "#fff" }}
                >
                  <Check size={10} strokeWidth={3} />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <a
            href={p.href}
            className={`mt-8 w-full ${p.variant === "cyan" ? "btn-cyan" : p.variant === "ghost" ? "btn-ghost" : ""}`}
            style={p.variant === "pro" ? {
              background: "#fff", color: "var(--primary)", padding: "14px 30px", borderRadius: 999,
              fontWeight: 700, fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            } : p.variant === "primary" ? {
              background: GRAD, color: "#fff", padding: "14px 30px", borderRadius: 999,
              fontWeight: 700, fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 18px 40px -18px rgba(2,132,199,0.6)",
            } : undefined}
          >
            {p.cta}
          </a>
        </div>
      ))}
    </div>
  );
}
