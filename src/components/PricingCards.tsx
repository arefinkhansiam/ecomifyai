import { CheckCircle2 } from "lucide-react";

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
};

export const PLANS: Plan[] = [
  {
    id: "free", name: "Free Forever", price: "$0", subtitle: "Perfect to get started.",
    features: ["1 AR product", "Basic AR viewer", "Shareable AR link", "Email support"],
    cta: "Get Started Free", href: "/auth?mode=signup", variant: "ghost",
  },
  {
    id: "starter", name: "Starter", price: "$10", subtitle: "For growing stores.",
    features: ["10 AR products", "Advanced AR viewer", "Embed code", "Shopify snippet", "Analytics dashboard", "Priority support"],
    cta: "Start Starter Plan", href: "/checkout?plan=starter", variant: "primary", highlight: true,
  },
  {
    id: "growth", name: "Growth", price: "$39", subtitle: "For serious sellers.",
    features: ["50 AR products", "All Starter features", "Custom branding", "3 team seats", "Advanced analytics", "Dedicated support"],
    cta: "Start Growth Plan", href: "/checkout?plan=growth", variant: "cyan",
  },
];

export function PricingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto">
      {PLANS.map((p) => (
        <div
          key={p.id}
          className="bg-card rounded-2xl p-8 flex flex-col relative glow-card"
          style={p.highlight ? {
            background: "linear-gradient(135deg, rgba(2,132,199,0.08), rgba(6,182,212,0.04))",
            border: "1px solid rgba(2,132,199,0.35)",
            boxShadow: "0 40px 100px -30px rgba(2,132,199,0.45)",
            transform: "scale(1.03)",
          } : undefined}
        >
          {p.highlight && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white text-xs uppercase tracking-wide px-4 py-1 rounded-full font-semibold">
              Most Popular
            </div>
          )}
          <div className="text-sm text-muted mb-2">{p.name}</div>
          <div className="font-display text-5xl font-extrabold text-ink">{p.price}<span className="text-base text-muted font-normal"> / month</span></div>
          <p className="text-sm mt-2">{p.subtitle}</p>
          <ul className="mt-6 space-y-3 flex-1">
            {p.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-ink text-sm">
                <CheckCircle2 size={18} className="text-[var(--success)] shrink-0 mt-0.5" /> {f}
              </li>
            ))}
          </ul>
          <a
            href={p.href}
            className={`mt-8 w-full ${p.variant === "primary" ? "btn-primary" : p.variant === "cyan" ? "btn-cyan" : "btn-ghost"}`}
          >
            {p.cta}
          </a>
        </div>
      ))}
    </div>
  );
}
