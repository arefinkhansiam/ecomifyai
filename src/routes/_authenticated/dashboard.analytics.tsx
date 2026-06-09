import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard/analytics")({
  component: AnalyticsPage,
});

type Event = { product_id: string; event_type: string; created_at: string; metadata: any };

function AnalyticsPage() {
  const { user } = useAuth();
  const [views, setViews] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [productMap, setProductMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: products } = await supabase.from("ar_products").select("id, product_name, views_count").eq("user_id", user.id).order("views_count", { ascending: false }).limit(10);
      setTopProducts(products ?? []);
      const ids = (products ?? []).map((p) => p.id);
      const map: Record<string, string> = {};
      (products ?? []).forEach((p: any) => { map[p.id] = p.product_name; });
      setProductMap(map);
      if (ids.length === 0) return;
      const [{ data: viewsData }, { data: ev }] = await Promise.all([
        supabase.from("ar_views").select("device_type, ar_capability, viewed_at").in("product_id", ids),
        supabase.from("tryon_events" as any)
          .select("product_id, event_type, created_at, metadata")
          .eq("vendor_id", user.id)
          .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString())
          .order("created_at", { ascending: false })
          .limit(2000),
      ]);
      setViews(viewsData ?? []);
      setEvents((ev as any) ?? []);
    })();
  }, [user]);

  const byDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const key = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      views: views.filter((v) => v.viewed_at?.slice(0, 10) === key).length,
      tryons: events.filter((e) => e.event_type === "tryon_completed" && e.created_at.slice(0, 10) === key).length,
      likes: events.filter((e) => e.event_type === "like" && e.created_at.slice(0, 10) === key).length,
    };
  });

  const devicePie = ["mobile","tablet","desktop","unknown"].map((k) => ({
    name: k, value: views.filter((v) => v.device_type === k).length,
  }));
  const COLORS = ["#7C3AED","#06B6D4","#10B981","#F59E0B"];

  const totalTryons = events.filter((e) => e.event_type === "tryon_completed").length;
  const totalLikes = events.filter((e) => e.event_type === "like").length;
  const totalDislikes = events.filter((e) => e.event_type === "dislike").length;
  const totalShares = events.filter((e) => e.event_type === "share").length;
  const altSelections = events.filter((e) => e.event_type === "alternative_selected");
  const conversionRate = totalTryons > 0 ? Math.round((totalLikes / totalTryons) * 100) : 0;

  // Per-product try-on counts
  const productStats = Object.keys(productMap).map((pid) => {
    const eForP = events.filter((e) => e.product_id === pid);
    return {
      id: pid,
      name: productMap[pid],
      tryons: eForP.filter((e) => e.event_type === "tryon_completed").length,
      likes: eForP.filter((e) => e.event_type === "like").length,
      dislikes: eForP.filter((e) => e.event_type === "dislike").length,
    };
  }).sort((a, b) => b.tryons - a.tryons).slice(0, 8);

  // Top alternatives selected
  const altCount: Record<string, number> = {};
  altSelections.forEach((e) => {
    const aid = e.metadata?.altId;
    if (aid) altCount[aid] = (altCount[aid] || 0) + 1;
  });
  const topAlts = Object.entries(altCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <DashboardShell title="Analytics">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Try-ons" value={totalTryons} />
        <Stat label="Likes" value={totalLikes} accent />
        <Stat label="Dislikes" value={totalDislikes} />
        <Stat label="Conversion rate" value={`${conversionRate}%`} accent />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6">
          <h3 className="text-ink">Engagement trend (7 days)</h3>
          <div className="h-64 mt-4">
            <ResponsiveContainer>
              <LineChart data={byDay}>
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0" }} />
                <Legend />
                <Line type="monotone" dataKey="tryons" stroke="#0EA5E9" strokeWidth={2} dot />
                <Line type="monotone" dataKey="likes" stroke="#10B981" strokeWidth={2} dot />
                <Line type="monotone" dataKey="views" stroke="#7C3AED" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6">
          <h3 className="text-ink">Device split</h3>
          <div className="h-64 mt-4">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={devicePie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                  {devicePie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-card rounded-2xl p-6">
          <h3 className="text-ink">Per-product try-on performance</h3>
          {productStats.length === 0 ? (
            <p className="text-sm mt-4 text-muted">No try-on activity yet.</p>
          ) : (
            <div className="h-64 mt-4">
              <ResponsiveContainer>
                <BarChart data={productStats}>
                  <XAxis dataKey="name" stroke="#6B7280" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis stroke="#6B7280" />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0" }} />
                  <Legend />
                  <Bar dataKey="tryons" stackId="a" fill="#0EA5E9" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="likes" stackId="a" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl p-6">
          <h3 className="text-ink">Top alternative selections</h3>
          {topAlts.length === 0 ? (
            <p className="text-sm mt-4 text-muted">No alternative products selected yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--border)]">
              {topAlts.map(([aid, count], i) => (
                <li key={aid} className="py-3 flex items-center justify-between">
                  <span className="text-sm text-ink truncate">{productMap[aid] || aid.slice(0, 8)}</span>
                  <span className="text-sm font-bold text-primary">{count} picks</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 text-xs text-muted">Shares: {totalShares}</div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 mt-6">
        <h3 className="text-ink">Top products by views</h3>
        <ul className="mt-4 divide-y divide-[var(--border)]">
          {topProducts.length === 0 && <li className="py-4 text-sm text-muted">No views yet. Share your Try-On links to start collecting data.</li>}
          {topProducts.map((p, i) => (
            <li key={p.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-primary font-bold">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-ink">{p.product_name}</span>
              </div>
              <span className="text-sm text-muted">{p.views_count} views</span>
            </li>
          ))}
        </ul>
      </div>
    </DashboardShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="rounded-2xl p-4 bg-card border" style={{ borderColor: "var(--border)" }}>
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className="text-2xl font-bold mt-1" style={{ color: accent ? "var(--primary)" : "var(--ink)" }}>{value}</div>
    </div>
  );
}
