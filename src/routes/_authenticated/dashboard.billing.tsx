import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { CheckCircle2, CreditCard, Sparkles, Crown, Zap, Gem, X, Check, ArrowRight, Loader2 } from "lucide-react";
import { PLANS, type Plan } from "@/components/PricingCards";

export const Route = createFileRoute("/_authenticated/dashboard/billing")({
  component: BillingPage,
});

const GRAD = "linear-gradient(135deg, #0B1220 0%, #0369A1 50%, #38BDF8 100%)";
const GRAD_TEXT: React.CSSProperties = {
  background: "linear-gradient(135deg,#0B1220 0%,#0369A1 50%,#0EA5E9 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

const ICONS: Record<Plan["id"], typeof Sparkles> = { free: Sparkles, starter: Zap, growth: Crown, pro: Gem };

function BillingPage() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const refresh = async () => {
    if (!user) return;
    const { data: p } = await supabase.from("user_plans").select("*").eq("user_id", user.id).maybeSingle();
    setPlan(p);
    const { data: h } = await supabase.from("payment_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setHistory(h ?? []);
  };

  useEffect(() => { refresh(); }, [user]);

  const current = PLANS.find((p) => p.id === (plan?.plan ?? "free")) ?? PLANS[0];

  return (
    <DashboardShell title="Billing">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Current plan card */}
        <div className="rounded-2xl p-6 lg:col-span-2" style={{ background: "#fff", border: "1px solid #E2E8F0", boxShadow: "0 10px 30px -18px rgba(2,132,199,0.3)" }}>
          <div className="text-[11px] font-bold uppercase tracking-wider" style={GRAD_TEXT}>Current plan</div>
          <div className="flex items-start justify-between mt-2 gap-4">
            <div>
              <div className="font-display text-3xl font-bold" style={GRAD_TEXT}>{current.name}</div>
              <div className="text-sm mt-1" style={{ color: "#475569" }}>
                <span className="font-semibold" style={{ color: "#0369A1" }}>{current.price}</span> / month · status: <span className="font-semibold" style={{ color: "#10B981" }}>{plan?.billing_status ?? "active"}</span>
              </div>
            </div>
            <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold text-white whitespace-nowrap" style={{ background: GRAD, boxShadow: "0 12px 28px -10px rgba(2,132,199,0.55)" }}>
              Change plan <ArrowRight size={14} />
            </button>
          </div>
          <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
            {current.features.map((f) => (
              <li key={f.text} className="flex items-center gap-2 text-[13px]" style={{ color: "#0B1220" }}>
                <CheckCircle2 size={15} style={{ color: "#10B981" }} /> {f.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Payment method */}
        <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #E2E8F0", boxShadow: "0 10px 30px -18px rgba(2,132,199,0.3)" }}>
          <div className="flex items-center gap-2 text-[13px] font-bold" style={GRAD_TEXT}>
            <CreditCard size={15} style={{ color: "#0369A1" }} /> Payment method
          </div>
          <div className="mt-3 font-display text-lg font-bold" style={{ color: "#0B1220" }}>•••• •••• •••• 4242</div>
          <div className="text-xs mt-1" style={{ color: "#64748B" }}>Expires 12 / 30</div>
          <button className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-semibold" style={{ border: "1px solid #0369A1", color: "#0369A1", background: "#fff" }}>
            Update
          </button>
        </div>
      </div>

      {/* History */}
      <div className="rounded-2xl p-6 mt-5" style={{ background: "#fff", border: "1px solid #E2E8F0" }}>
        <h3 className="text-[15px] font-semibold m-0" style={{ color: "#0B1220" }}>Payment history</h3>
        {history.length === 0 ? (
          <p className="mt-4 text-[13px]" style={{ color: "#64748B" }}>No payments yet.</p>
        ) : (
          <table className="w-full mt-4 text-[13px]">
            <thead>
              <tr style={{ color: "#64748B" }} className="text-left text-[11px] uppercase tracking-wide">
                <th className="py-2 font-semibold">Date</th><th className="font-semibold">Plan</th><th className="font-semibold">Amount</th><th className="font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} style={{ borderTop: "1px solid #F1F5F9" }}>
                  <td className="py-3" style={{ color: "#0B1220" }}>{new Date(h.created_at).toLocaleDateString()}</td>
                  <td style={{ color: "#0B1220" }}>{h.plan}</td>
                  <td style={{ color: "#0B1220" }}>${h.amount_usd}</td>
                  <td><span style={{ color: "#10B981", fontWeight: 600 }}>{h.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && <ChangePlanModal current={current.id} onClose={() => setOpen(false)} onChanged={() => { setOpen(false); refresh(); }} />}
    </DashboardShell>
  );
}

function ChangePlanModal({ current, onClose, onChanged }: { current: Plan["id"]; onClose: () => void; onChanged: () => void }) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<Plan["id"]>(current === "free" ? "starter" : current);
  const [busy, setBusy] = useState(false);

  const apply = async () => {
    if (!user || selected === current) return onClose();
    setBusy(true);
    try {
      if (selected === "free") {
        const { error } = await supabase.from("user_plans").upsert({ user_id: user.id, plan: "free", billing_status: "active" }, { onConflict: "user_id" });
        if (error) throw error;
        toast.success("Switched to Free plan");
        onChanged();
      } else {
        // Paid plans → go through checkout (in-dashboard navigation)
        window.location.href = `/checkout?plan=${selected}`;
      }
    } catch (e: any) {
      toast.error(e.message ?? "Could not change plan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" style={{ background: "rgba(11,18,32,0.55)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: "#fff", boxShadow: "0 30px 80px -20px rgba(2,132,199,0.5)" }} onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: GRAD, color: "#fff", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">Choose your plan</div>
            <div className="text-[18px] font-bold">Change plan</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full grid place-items-center" style={{ background: "rgba(255,255,255,0.15)" }}><X size={16} /></button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PLANS.map((p) => {
            const Icon = ICONS[p.id];
            const isCurrent = p.id === current;
            const isSelected = p.id === selected;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className="text-left rounded-xl p-4 transition relative"
                style={{
                  background: isSelected ? "linear-gradient(180deg,#F0F9FF,#FFFFFF)" : "#fff",
                  border: isSelected ? "2px solid #0EA5E9" : "1px solid #E2E8F0",
                  boxShadow: isSelected ? "0 12px 30px -12px rgba(14,165,233,0.4)" : "none",
                }}
              >
                {isCurrent && <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "#ECFEFF", color: "#0369A1" }}>Current</span>}
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-lg grid place-items-center text-white flex-shrink-0" style={{ background: GRAD }}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-[14px]" style={{ color: "#0B1220" }}>{p.name}</div>
                    <div className="font-display font-extrabold text-[20px] mt-0.5" style={GRAD_TEXT}>{p.price}<span className="text-[11px] font-medium" style={{ color: "#64748B" }}> /mo</span></div>
                  </div>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {p.features.slice(0, 4).map((f) => (
                    <li key={f.text} className="flex items-start gap-1.5 text-[11.5px]" style={{ color: f.icon === "x" ? "#94A3B8" : "#475569" }}>
                      {f.icon === "x" ? <X size={11} className="mt-0.5 flex-shrink-0" /> : <Check size={11} className="mt-0.5 flex-shrink-0" style={{ color: "#10B981" }} />}
                      <span className={f.icon === "x" ? "line-through" : ""}>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="px-5 pb-5 pt-2 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-[11.5px]" style={{ color: "#64748B" }}>Paid plans open secure checkout. Cancel anytime.</div>
          <div className="flex gap-2">
            <button onClick={onClose} disabled={busy} className="px-4 py-2 rounded-full text-[12.5px] font-semibold" style={{ border: "1px solid #E2E8F0", color: "#475569" }}>Cancel</button>
            <button onClick={apply} disabled={busy || selected === current} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[12.5px] font-bold text-white disabled:opacity-50" style={{ background: GRAD, boxShadow: "0 10px 24px -10px rgba(14,165,233,0.6)" }}>
              {busy ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
              {selected === current ? "Already on this plan" : selected === "free" ? "Switch to Free" : `Continue to checkout`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
