import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, CreditCard } from "lucide-react";
import { MarketingShell } from "@/components/MarketingShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { PLANS } from "@/components/PricingCards";

const searchSchema = z.object({ plan: z.enum(["starter","growth"]).optional() });

export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Checkout — Easibie" }] }),
  component: Checkout,
});

function Checkout() {
  const { plan = "starter" } = Route.useSearch();
  const planDef = PLANS.find((p) => p.id === plan)!;
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const subscribe = async () => {
    if (!user) { navigate({ to: "/auth", search: { mode: "signup" } }); return; }
    setProcessing(true);
    try {
      const limit = plan === "starter" ? 10 : 50;
      const { data: prof } = await supabase.from("profiles").select("is_free_trial_growth").eq("id", user.id).maybeSingle();
      const free = plan === "growth" && (prof as any)?.is_free_trial_growth === true;
      const { error } = await supabase.from("user_plans").update({
        plan, ar_product_limit: limit, billing_status: free ? "active" : "trialing",
        billing_start_date: new Date().toISOString(),
        billing_end_date: free ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }).eq("user_id", user.id);
      if (error) throw error;
      if (!free) {
        await supabase.from("payment_history").insert({
          user_id: user.id, plan, amount_usd: plan === "starter" ? 10 : 39,
          status: "paid", billing_period_start: new Date().toISOString(),
          billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
      toast.success(`Welcome to ${planDef.name}!`);
      navigate({ to: "/dashboard/billing" });
    } catch (e: any) {
      toast.error(e.message ?? "Checkout failed");
    } finally { setProcessing(false); }
  };

  return (
    <MarketingShell>
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h1 className="text-white">Confirm your plan</h1>
            <p className="mt-3">7-day free trial. Cancel any time from Billing.</p>
            <div className="mt-8 bg-card rounded-2xl p-8">
              <div className="text-sm text-muted">{planDef.name}</div>
              <div className="font-display text-5xl font-extrabold text-white mt-1">{planDef.price}<span className="text-base text-muted font-normal"> / month</span></div>
              <ul className="mt-6 space-y-3">
                {planDef.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-white text-sm">
                    <CheckCircle2 size={18} className="text-[var(--success)] shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-8 h-fit">
            <div className="flex items-center gap-2 text-cyan text-sm"><CreditCard size={16} /> Mock checkout</div>
            <h3 className="text-white mt-2">Payment details</h3>
            <p className="text-sm mt-2">Connect Stripe to take real payments. This demo activates the plan immediately for testing.</p>
            <div className="mt-6 space-y-3">
              <input className="input-base" placeholder="Card number" defaultValue="4242 4242 4242 4242" />
              <div className="grid grid-cols-2 gap-3">
                <input className="input-base" placeholder="MM / YY" defaultValue="12 / 30" />
                <input className="input-base" placeholder="CVC" defaultValue="123" />
              </div>
            </div>
            <button onClick={subscribe} disabled={processing || loading} className="btn-primary w-full mt-6">
              {processing ? <Loader2 className="animate-spin" size={16} /> : `Start ${planDef.name}`}
            </button>
            <p className="text-xs text-muted mt-3 text-center">
              {user ? `Signed in as ${user.email}` : <Link to="/auth" search={{ mode: "signup" }} className="text-cyan">Sign in or create an account first</Link>}
            </p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
