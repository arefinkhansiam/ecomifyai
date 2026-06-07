import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Box, Eye, Code, Upload, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ total_products: number; ready_products: number; total_views: number; total_embeds: number; plan: string; plan_limit: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("get_user_dashboard_stats", { uid: user.id }).then(({ data }) => {
      if (data) setStats(data as any);
    });
  }, [user]);

  const cards = [
    { label: "Total Products", value: stats?.total_products ?? 0, icon: Box, color: "var(--primary)" },
    { label: "Ready for AR", value: stats?.ready_products ?? 0, icon: Box, color: "var(--cyan)" },
    { label: "Total AR Views", value: stats?.total_views ?? 0, icon: Eye, color: "var(--success)" },
    { label: "Embed Count", value: stats?.total_embeds ?? 0, icon: Code, color: "var(--warning)" },
  ];

  return (
    <DashboardShell title="Dashboard">
      <div>
        <h1 className="text-3xl font-display font-bold">Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""}.</h1>
        <p className="mt-2">Your AR command center. Upload a product, share the link, watch the views roll in.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: `${c.color}22` }}>
                <c.icon size={18} style={{ color: c.color }} />
              </div>
            </div>
            <div className="font-display font-extrabold text-3xl text-white mt-4">{c.value.toLocaleString()}</div>
            <div className="text-xs text-muted mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Link to="/dashboard/upload" className="bg-card rounded-2xl p-6 hover:glow-card transition-shadow group">
          <Upload size={24} className="text-cyan" />
          <h3 className="text-white mt-4">Upload a product</h3>
          <p className="text-sm mt-2">Drag in a photo, get a live AR link in seconds.</p>
          <div className="mt-4 text-cyan text-sm inline-flex items-center gap-1">Get started <ArrowUpRight size={14} /></div>
        </Link>
        <Link to="/dashboard/products" className="bg-card rounded-2xl p-6 hover:glow-card transition-shadow">
          <Box size={24} className="text-[var(--primary)]" />
          <h3 className="text-white mt-4">Manage products</h3>
          <p className="text-sm mt-2">View, edit and share your AR products.</p>
          <div className="mt-4 text-cyan text-sm inline-flex items-center gap-1">Open <ArrowUpRight size={14} /></div>
        </Link>
        <Link to="/dashboard/analytics" className="bg-card rounded-2xl p-6 hover:glow-card transition-shadow">
          <Eye size={24} className="text-[var(--success)]" />
          <h3 className="text-white mt-4">See analytics</h3>
          <p className="text-sm mt-2">Track AR views, devices and trends.</p>
          <div className="mt-4 text-cyan text-sm inline-flex items-center gap-1">View <ArrowUpRight size={14} /></div>
        </Link>
      </div>

      <div className="mt-8 bg-card rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-muted">Plan usage</div>
            <div className="font-display text-2xl font-bold mt-1">
              {stats?.total_products ?? 0} / {stats?.plan_limit ?? 1} AR products
            </div>
          </div>
          <Link to="/dashboard/billing" className="btn-ghost text-xs">Upgrade</Link>
        </div>
        <div className="mt-4 h-2 rounded-full bg-[var(--surface)] overflow-hidden">
          <div className="h-full bg-[var(--primary)]" style={{ width: `${Math.min(100, ((stats?.total_products ?? 0) / Math.max(1, stats?.plan_limit ?? 1)) * 100)}%` }} />
        </div>
      </div>
    </DashboardShell>
  );
}
