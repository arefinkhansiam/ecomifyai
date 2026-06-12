import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, CreditCard } from "lucide-react";
import { MarketingShell } from "@/components/MarketingShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { PLANS } from "@/components/PricingCards";

const searchSchema = z.object({ plan: z.enum(["starter","pro","growth"]).optional() });

export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Checkout — Ecomify" }] }),
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
      const limit = plan === "starter" ? 10 : plan === "pro" ? 9999 : 50;
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
          user_id: user.id, plan, amount_usd: plan === "starter" ? 10 : plan === "pro" ? 49 : 39,
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
      <section className="py-20 px-6" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #E0F2FE 100%)" }}>
        <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h1 className="text-slate-800 font-display font-extrabold text-3xl">Confirm your plan</h1>
            <p className="mt-3 text-slate-600">7-day free trial. Cancel any time from Billing.</p>
            <div className="mt-8 rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(224,242,254,0.80)", boxShadow: "0 4px 24px -8px rgba(2,132,199,0.15)" }}>
              <div className="text-sm text-slate-500">{planDef.name}</div>
              <div className="font-display text-5xl font-extrabold text-slate-800 mt-1">{planDef.price}<span className="text-base text-slate-400 font-normal"> / month</span></div>
              <ul className="mt-6 space-y-3">
                {planDef.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2 text-slate-700 text-sm">
                    <CheckCircle2 size={18} className="text-sky-500 shrink-0 mt-0.5" /> {f.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="rounded-2xl p-8 h-fit" style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(224,242,254,0.80)", boxShadow: "0 4px 24px -8px rgba(2,132,199,0.15)" }}>
            <div className="flex items-center gap-2 text-sky-600 text-sm"><CreditCard size={16} /> Mock checkout</div>
            <h3 className="text-slate-800 mt-2 font-display font-bold text-lg">Payment details</h3>
            <p className="text-sm mt-2 text-slate-500">Connect Stripe to take real payments. This demo activates the plan immediately for testing.</p>
            <div className="mt-6 space-y-3">
              <input className="w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="Card number" defaultValue="4242 4242 4242 4242" />
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="MM / YY" defaultValue="12 / 30" />
                <input className="w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300" placeholder="CVC" defaultValue="123" />
              </div>
            </div>
            <button onClick={subscribe} disabled={processing || loading} className="w-full mt-6 py-3 px-4 rounded-xl font-semibold text-sm transition-colors" style={{ background: "#0EA5E9", color: "#fff", boxShadow: "0 12px 28px -12px rgba(14,165,233,0.50)" }}>
              {processing ? <Loader2 className="animate-spin mx-auto" size={16} /> : `Start ${planDef.name}`}
            </button>
            <p className="text-xs text-slate-400 mt-3 text-center">
              {user ? `Signed in as ${user.email}` : <Link to="/auth" search={{ mode: "signup" }} className="text-sky-600 hover:underline">Sign in or create an account first</Link>}
            </p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
