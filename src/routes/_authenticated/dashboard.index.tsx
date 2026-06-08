import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Box, Eye, Code, Upload, ArrowUpRight, Sparkles, TrendingUp, Crown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Dashboard,
});

const GRAD = "linear-gradient(135deg, #0B1220 0%, #0369A1 50%, #38BDF8 100%)";

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ total_products: number; ready_products: number; total_views: number; total_embeds: number; plan: string; plan_limit: number; ar_slots_used: number; sessions_this_month: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("get_user_dashboard_stats", { uid: user.id }).then(({ data }) => {
      if (data) setStats(data as any);
    });
  }, [user]);

  const cards = [
    { label: "Total Products", value: stats?.total_products ?? 0, icon: Box, accent: "#0369A1" },
    { label: "Ready for AR", value: stats?.ready_products ?? 0, icon: Sparkles, accent: "#0369A1" },
    { label: "Total AR Views", value: stats?.total_views ?? 0, icon: Eye, accent: "#0369A1" },
    { label: "Sessions this month", value: stats?.sessions_this_month ?? 0, icon: TrendingUp, accent: "#0369A1" },
  ];

  const plan = stats?.plan ?? "free";
  const isPaid = plan !== "free";
  const slotsUsed = stats?.ar_slots_used ?? 0;
  const slotLimit = stats?.plan_limit ?? 1;
  const pct = Math.min(100, (slotsUsed / Math.max(1, slotLimit)) * 100);

  return (
    <DashboardShell title="Dashboard">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="pill"><Sparkles size={12} /> Command center</span>
          <h1 className="mt-3 text-3xl md:text-4xl font-display font-extrabold leading-tight" style={{ background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""}.
          </h1>
          <p className="mt-2 text-base" style={{ color: "var(--ink-soft)" }}>Upload a product, share the link, watch the views roll in.</p>
        </div>
        <Link to="/dashboard/upload" className="btn-primary"><Upload size={16} /> New AR Product</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(14px)", border: "1px solid rgba(2,132,199,0.15)", boxShadow: "0 18px 40px -22px rgba(2,132,199,0.35)" }}>
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${c.accent}, transparent 70%)` }} />
            <div className="w-11 h-11 rounded-xl grid place-items-center text-white" style={{ background: `linear-gradient(135deg, ${c.accent}, #38BDF8)`, boxShadow: `0 10px 24px -10px ${c.accent}aa` }}>
              <c.icon size={18} />
            </div>
            <div className="font-display font-extrabold text-3xl mt-4" style={{ background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{c.value.toLocaleString()}</div>
            <div className="text-xs mt-1 font-medium" style={{ color: "var(--muted)" }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {[
          { to: "/dashboard/upload", icon: Upload, title: "Upload a product", body: "Drag in a photo, get a live AR link in seconds." },
          { to: "/dashboard/products", icon: Box, title: "Manage products", body: "View, edit and share your AR products." },
          { to: "/dashboard/behaviour", icon: TrendingUp, title: "Customer behaviour", body: "See how visitors engage with your AR." },
        ].map((q) => (
          <Link key={q.to} to={q.to} className="rounded-2xl p-6 transition-transform hover:-translate-y-1 group"
            style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(14px)", border: "1px solid rgba(2,132,199,0.15)", boxShadow: "0 18px 40px -22px rgba(2,132,199,0.35)" }}>
            <div className="w-12 h-12 rounded-2xl grid place-items-center text-white" style={{ background: GRAD }}>
              <q.icon size={20} />
            </div>
            <h3 className="text-ink mt-4">{q.title}</h3>
            <p className="text-sm mt-2">{q.body}</p>
            <div className="mt-4 text-sm font-semibold inline-flex items-center gap-1" style={{ background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              Open <ArrowUpRight size={14} className="text-primary" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl p-6 relative overflow-hidden" style={{ background: GRAD, color: "#fff", boxShadow: "0 25px 60px -25px rgba(2,132,199,0.6)" }}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider opacity-80 flex items-center gap-2">
              {isPaid && <Crown size={12} />} AR slots · {plan}
            </div>
            <div className="font-display text-2xl md:text-3xl font-extrabold mt-1" title="Deleting an AR product does not recover your slot. Each plan allows a fixed number of AR creations total.">
              {slotsUsed} of {slotLimit} AR slots used
            </div>
            <div className="text-xs mt-1 opacity-80">Slots are permanent — deleting a product does not give a slot back.</div>
          </div>
          <Link to="/dashboard/billing" className="rounded-full px-5 py-2.5 text-sm font-semibold text-ink" style={{ background: "#fff" }}>
            {isPaid ? "Manage" : "Upgrade"} →
          </Link>
        </div>
        <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.2)" }}>
          <div className="h-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#38BDF8,#fff)" }} />
        </div>
      </div>
    </DashboardShell>
  );
}
