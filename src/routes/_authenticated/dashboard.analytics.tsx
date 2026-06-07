import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { user } = useAuth();
  const [views, setViews] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: products } = await supabase.from("ar_products").select("id, product_name, views_count").eq("user_id", user.id).order("views_count", { ascending: false }).limit(5);
      setTopProducts(products ?? []);
      const ids = (products ?? []).map((p) => p.id);
      if (ids.length === 0) return;
      const { data: viewsData } = await supabase.from("ar_views").select("device_type, ar_capability, viewed_at").in("product_id", ids);
      setViews(viewsData ?? []);
    })();
  }, [user]);

  const byDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const key = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      views: views.filter((v) => v.viewed_at?.slice(0, 10) === key).length,
    };
  });

  const devicePie = ["mobile","tablet","desktop","unknown"].map((k) => ({
    name: k, value: views.filter((v) => v.device_type === k).length,
  }));
  const COLORS = ["#7C3AED","#06B6D4","#10B981","#F59E0B"];

  return (
    <DashboardShell title="Analytics">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6">
          <h3 className="text-white">Views (last 7 days)</h3>
          <div className="h-64 mt-4">
            <ResponsiveContainer>
              <BarChart data={byDay}>
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ background: "#1C1C27", border: "1px solid #2A2A3A" }} />
                <Bar dataKey="views" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6">
          <h3 className="text-white">Device split</h3>
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
      <div className="bg-card rounded-2xl p-6 mt-6">
        <h3 className="text-white">Top products</h3>
        <ul className="mt-4 divide-y divide-[var(--border)]">
          {topProducts.length === 0 && <li className="py-4 text-sm text-muted">No views yet. Share your AR links to start collecting data.</li>}
          {topProducts.map((p, i) => (
            <li key={p.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-cyan font-display font-bold">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-white">{p.product_name}</span>
              </div>
              <span className="text-sm text-muted">{p.views_count} views</span>
            </li>
          ))}
        </ul>
      </div>
    </DashboardShell>
  );
}
