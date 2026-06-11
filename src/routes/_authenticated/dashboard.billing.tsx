import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { CheckCircle2, CreditCard } from "lucide-react";
import { PLANS } from "@/components/PricingCards";

export const Route = createFileRoute("/_authenticated/dashboard/billing")({
  component: BillingPage,
});

function BillingPage() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_plans").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => setPlan(data));
    supabase.from("payment_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setHistory(data ?? []));
  }, [user]);

  const current = PLANS.find((p) => p.id === (plan?.plan ?? "free")) ?? PLANS[0];

  return (
    <DashboardShell title="Billing">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-2xl p-6 lg:col-span-2">
          <div className="text-xs text-muted uppercase tracking-wide">Current plan</div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <div className="font-display text-3xl font-bold text-white">{current.name}</div>
              <div className="text-sm text-muted">{current.price} / month · status: {plan?.billing_status ?? "active"}</div>
            </div>
            <Link to="/pricing" className="btn-primary text-xs">Change Plan</Link>
          </div>
          <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2">
            {current.features.map((f) => (
              <li key={f.text} className="flex items-center gap-2 text-sm text-white">
                <CheckCircle2 size={16} className="text-[var(--success)]" /> {f.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-card rounded-2xl p-6">
          <div className="flex items-center gap-2 text-cyan text-sm"><CreditCard size={16} /> Payment method</div>
          <div className="mt-3 font-display text-white">•••• •••• •••• 4242</div>
          <div className="text-xs text-muted mt-1">Expires 12 / 30</div>
          <button className="btn-ghost text-xs mt-4 w-full">Update</button>
        </div>
      </div>
      <div className="bg-card rounded-2xl p-6 mt-6">
        <h3 className="text-white">Payment history</h3>
        {history.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No payments yet.</p>
        ) : (
          <table className="w-full mt-4 text-sm">
            <thead>
              <tr className="text-left text-muted text-xs uppercase">
                <th className="py-2">Date</th><th>Plan</th><th>Amount</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-t border-[var(--border)]">
                  <td className="py-3 text-white">{new Date(h.created_at).toLocaleDateString()}</td>
                  <td>{h.plan}</td>
                  <td>${h.amount_usd}</td>
                  <td><span className="text-[var(--success)]">{h.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardShell>
  );
}
