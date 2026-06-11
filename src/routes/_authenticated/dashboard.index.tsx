import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Box, Eye, Upload, ArrowRight, TrendingUp, Crown, ArrowUpRight, MoreHorizontal, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ total_products: number; ready_products: number; total_views: number; total_embeds: number; plan: string; plan_limit: number; ar_slots_used: number; sessions_this_month: number } | null>(null);
  const [customizedCount, setCustomizedCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("get_user_dashboard_stats", { uid: user.id }).then(({ data }) => {
      if (data) setStats(data as any);
    });
    supabase.from("tryon_branding").select("id", { count: "exact", head: true }).eq("user_id", user.id).then(({ count }) => {
      setCustomizedCount(count ?? 0);
    });
  }, [user]);

  const plan = stats?.plan ?? "free";
  const isPaid = plan !== "free";
  const slotsUsed = stats?.ar_slots_used ?? 0;
  const slotLimit = stats?.plan_limit ?? 1;
  const pct = Math.min(100, (slotsUsed / Math.max(1, slotLimit)) * 100);

  const metrics = [
    { label: "Total try-ons", value: stats?.total_products ?? 0, delta: "+0%", icon: Box },
    { label: "Ready", value: stats?.ready_products ?? 0, delta: "Live", icon: TrendingUp },
    { label: "Try-on views", value: stats?.total_views ?? 0, delta: "+0%", icon: Eye },
    { label: "Sessions this month", value: stats?.sessions_this_month ?? 0, delta: "+0%", icon: TrendingUp },
  ];

  const firstName = user?.user_metadata?.full_name?.split(" ")[0];

  return (
    <DashboardShell title="Home">
      {/* Greeting + primary CTA */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: "#1A1A1A" }}>
            Good to see you{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "#6B7280" }}>Here's what's happening with your store today.</p>
        </div>
        <Link to="/dashboard/upload" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold transition hover:opacity-90"
          style={{ background: "#1A1A1A", color: "#fff", boxShadow: "0 1px 0 rgba(0,0,0,0.05), inset 0 -1px 0 rgba(255,255,255,0.10)" }}>
          <Upload size={14} /> New try-on
        </Link>
      </div>

      {/* Metric tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="p-4 rounded-xl"
            style={{ background: "#FFFFFF", border: "1px solid #E1E3E5" }}>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium" style={{ color: "#6B7280" }}>{m.label}</span>
              <m.icon size={14} style={{ color: "#9CA3AF" }} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[24px] font-semibold tracking-tight" style={{ color: "#1A1A1A" }}>{m.value.toLocaleString()}</span>
              <span className="text-[11px] font-medium" style={{ color: "#008060" }}>{m.delta}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two column: tasks + plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-4">
        <div className="lg:col-span-2 rounded-xl" style={{ background: "#FFFFFF", border: "1px solid #E1E3E5" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E1E3E5" }}>
            <div>
              <h3 className="text-[14px] font-semibold m-0" style={{ color: "#1A1A1A" }}>Setup guide</h3>
              <p className="text-[12px] m-0 mt-0.5" style={{ color: "#6B7280" }}>Use this personalised guide to get your store up and running.</p>
            </div>
            <button className="w-7 h-7 rounded-md grid place-items-center hover:bg-[#F1F2F4]"><MoreHorizontal size={15} style={{ color: "#6B7280" }} /></button>
          </div>
          <ul>
            {[
              { to: "/dashboard/upload", title: "Upload your first product", body: "Add product photos from every angle." },
              { to: "/dashboard/products", title: "Customize your try-on", body: "Edit name, colors, and branding." },
              { to: "/dashboard/embed", title: "Add the widget to your store", body: "Copy the Shopify or universal embed code." },
              { to: "/dashboard/analytics", title: "Track shopper behaviour", body: "See views, sessions, and recommendations." },
            ].map((s, i) => (
              <li key={s.to}>
                <Link to={s.to} className="flex items-start gap-3 px-5 py-3 hover:bg-[#FAFBFB] transition"
                  style={{ borderBottom: i < 3 ? "1px solid #F1F2F4" : "none" }}>
                  <span className="mt-0.5 w-5 h-5 rounded-full grid place-items-center text-[10px] font-semibold flex-shrink-0"
                    style={{ background: "#FFFFFF", border: "1.5px dashed #C9CCD1", color: "#6B7280" }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold" style={{ color: "#1A1A1A" }}>{s.title}</div>
                    <div className="text-[12px]" style={{ color: "#6B7280" }}>{s.body}</div>
                  </div>
                  <ArrowRight size={14} style={{ color: "#9CA3AF" }} className="mt-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Plan card */}
        <div className="rounded-xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #E1E3E5" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #E1E3E5" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold m-0" style={{ color: "#1A1A1A" }}>Your plan</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                style={{ background: isPaid ? "#E3F1DF" : "#F1F2F4", color: isPaid ? "#0C5132" : "#4A4A4A" }}>
                {isPaid && <Crown size={9} />} {plan}
              </span>
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="text-[12px]" style={{ color: "#6B7280" }}>Try-on slots used</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-[22px] font-semibold" style={{ color: "#1A1A1A" }}>{slotsUsed}</span>
              <span className="text-[12px]" style={{ color: "#6B7280" }}>of {slotLimit}</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "#F1F2F4" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#1A1A1A" }} />
            </div>
            <p className="text-[11px] mt-3" style={{ color: "#9CA3AF" }}>Slots are permanent — deleting a product does not give a slot back.</p>
            <Link to="/dashboard/billing" className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: "#005BD3" }}>
              {isPaid ? "Manage plan" : "Upgrade plan"} <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom row: quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {[
          { to: "/dashboard/products", title: "Try-on products", body: "Manage and edit your try-on catalog." },
          { to: "/dashboard/analytics", title: "Analytics", body: "Sessions, views, conversions, recommendations." },
          { to: "/dashboard/embed", title: "Embed & share", body: "Shopify Liquid, universal script, iframe." },
        ].map((q) => (
          <Link key={q.to} to={q.to} className="p-4 rounded-xl transition hover:border-[#1A1A1A]"
            style={{ background: "#FFFFFF", border: "1px solid #E1E3E5" }}>
            <h4 className="text-[13px] font-semibold m-0" style={{ color: "#1A1A1A" }}>{q.title}</h4>
            <p className="text-[12px] m-0 mt-1" style={{ color: "#6B7280" }}>{q.body}</p>
            <div className="mt-3 text-[12px] font-semibold inline-flex items-center gap-1" style={{ color: "#005BD3" }}>
              Open <ArrowRight size={12} />
            </div>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
