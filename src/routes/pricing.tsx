import { createFileRoute } from "@tanstack/react-router";
import { MarketingShell } from "@/components/MarketingShell";
import { PricingCards } from "@/components/PricingCards";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Ecomify Pricing — Free, Starter and Growth" },
      { name: "description", content: "Simple plans for stores of every size. Start free and upgrade when you scale." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <MarketingShell>
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="pill">Pricing</span>
          <h1 className="mt-6 text-gradient-ocean">Simple, transparent pricing.</h1>
          <p className="mt-6 text-lg">Start free. Upgrade when you are ready to scale.</p>
        </div>
        <div className="mx-auto max-w-6xl px-6">
          <PricingCards />
          <p className="text-center text-sm text-muted mt-10">All plans include a 7-day free trial. No credit card required.</p>
        </div>
      </section>
    </MarketingShell>
  );
}
