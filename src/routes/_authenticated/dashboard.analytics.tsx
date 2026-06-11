import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, Eye, Heart, MousePointerClick, Share2, ShoppingBag, TrendingUp, Clock, Users, Smartphone, Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/analytics")({
  component: AnalyticsPage,
});

type Event = { product_id: string; event_type: string; created_at: string; metadata: any };
type Sess = { product_id: string; device_type: string | null; os_type: string | null; country: string | null; time_spent_seconds: number; did_interact: boolean; created_at: string };
type Fb = { product_id: string; liked: boolean; created_at: string };

const GRAD_BLUE = "#0EA5E9";
const GRAD_CYAN = "#38BDF8";
const GRAD_DEEP = "#0369A1";
const GRAD_GREEN = "#10B981";
const GRAD_VIOLET = "#7C3AED";
const COLORS = [GRAD_BLUE, GRAD_GREEN, GRAD_VIOLET, "#F59E0B", "#EC4899", "#06B6D4"];

const RANGES = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
] as const;

function AnalyticsPage() {
  const { user } = useAuth();
  const [range, setRange] = useState<typeof RANGES[number]>(RANGES[1]);
  const [products, setProducts] = useState<{ id: string; product_name: string; views_count: number; status: string }[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [sessions, setSessions] = useState<Sess[]>([]);
  const [feedback, setFeedback] = useState<Fb[]>([]);

  useEffect(() => {
    if (!user) return;
    const since = new Date(Date.now() - range.days * 86400000).toISOString();
    (async () => {
      const [{ data: prods }, { data: ev }, { data: ss }, { data: fb }] = await Promise.all([
        supabase.from("ar_products").select("id, product_name, views_count, status").eq("user_id", user.id),
        supabase.from("tryon_events" as any).select("product_id, event_type, created_at, metadata").eq("vendor_id", user.id).gte("created_at", since).limit(5000),
        supabase.from("ar_sessions").select("product_id, device_type, os_type, country, time_spent_seconds, did_interact, created_at").eq("vendor_id", user.id).gte("created_at", since).limit(5000),
        supabase.from("tryon_feedback").select("product_id, liked, created_at").eq("vendor_id", user.id).gte("created_at", since).limit(5000),
      ]);
      setProducts(prods ?? []);
      setEvents((ev as any) ?? []);
      setSessions((ss as any) ?? []);
      setFeedback((fb as any) ?? []);
    })();
  }, [user, range]);

  const productMap = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p.product_name])), [products]);

  const totalViews = sessions.length;
  const totalTryons = events.filter((e) => e.event_type === "tryon_completed").length;
  const totalLikes = events.filter((e) => e.event_type === "like").length + feedback.filter((f) => f.liked).length;
  const totalShares = events.filter((e) => e.event_type === "share").length;
  const totalWishlist = events.filter((e) => e.event_type === "wishlist").length;
  const altPicks = events.filter((e) => e.event_type === "alternative_selected").length;
  const avgTimeSec = sessions.length ? Math.round(sessions.reduce((s, x) => s + (x.time_spent_seconds || 0), 0) / sessions.length) : 0;
  const interactRate = sessions.length ? Math.round((sessions.filter((s) => s.did_interact).length / sessions.length) * 100) : 0;
  const tryonRate = totalViews ? Math.round((totalTryons / totalViews) * 100) : 0;
  const likeRate = totalTryons ? Math.round((totalLikes / totalTryons) * 100) : 0;

  const byDay = Array.from({ length: range.days }, (_, i) => {
    const d = new Date(Date.now() - (range.days - 1 - i) * 86400000);
    const key = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      views: sessions.filter((s) => s.created_at.slice(0, 10) === key).length,
      tryons: events.filter((e) => e.event_type === "tryon_completed" && e.created_at.slice(0, 10) === key).length,
      likes: events.filter((e) => e.event_type === "like" && e.created_at.slice(0, 10) === key).length,
      shares: events.filter((e) => e.event_type === "share" && e.created_at.slice(0, 10) === key).length,
    };
  });

  const deviceData = ["mobile", "tablet", "desktop", "unknown"].map((k) => ({
    name: k, value: sessions.filter((s) => (s.device_type ?? "unknown") === k).length,
  })).filter((d) => d.value > 0);
  const osData = Object.entries(sessions.reduce<Record<string, number>>((acc, s) => {
    const k = s.os_type || "Other"; acc[k] = (acc[k] || 0) + 1; return acc;
  }, {})).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  const countries = Object.entries(sessions.reduce<Record<string, number>>((acc, s) => {
    const k = s.country || "Unknown"; acc[k] = (acc[k] || 0) + 1; return acc;
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const funnel = [
    { stage: "Views", count: totalViews, color: GRAD_VIOLET },
    { stage: "Try-on started", count: events.filter((e) => e.event_type === "tryon_started").length, color: GRAD_BLUE },
    { stage: "Try-on completed", count: totalTryons, color: GRAD_CYAN },
    { stage: "Liked / engaged", count: totalLikes + totalWishlist, color: GRAD_GREEN },
    { stage: "Shared", count: totalShares, color: "#F59E0B" },
  ];

  const productStats = products.map((p) => {
    const ev = events.filter((e) => e.product_id === p.id);
    const fb = feedback.filter((f) => f.product_id === p.id);
    const sess = sessions.filter((s) => s.product_id === p.id);
    const tryons = ev.filter((e) => e.event_type === "tryon_completed").length;
    const likes = ev.filter((e) => e.event_type === "like").length + fb.filter((f) => f.liked).length;
    return {
      id: p.id, name: p.product_name,
      views: sess.length, tryons, likes,
      shares: ev.filter((e) => e.event_type === "share").length,
      score: tryons * 2 + likes * 3 + ev.filter((e) => e.event_type === "share").length * 5,
    };
  }).sort((a, b) => b.score - a.score);

  const topAlts = Object.entries(events.filter((e) => e.event_type === "alternative_selected").reduce<Record<string, number>>((acc, e) => {
    const aid = e.metadata?.altId; if (!aid) return acc; acc[aid] = (acc[aid] || 0) + 1; return acc;
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <DashboardShell title="Analytics">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: "#1A1A1A" }}>Performance</h1>
          <p className="text-[13px] mt-1" style={{ color: "#6B7280" }}>Shopper behaviour, try-on funnel, and product winners.</p>
        </div>
        <div className="inline-flex rounded-md overflow-hidden" style={{ background: "#fff", border: "1px solid #E1E3E5" }}>
          {RANGES.map((r) => (
            <button key={r.key} onClick={() => setRange(r)} className="text-[12px] px-3 py-1.5 font-semibold transition"
              style={{ background: range.key === r.key ? "#1A1A1A" : "transparent", color: range.key === r.key ? "#fff" : "#4A4A4A" }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Total views" value={totalViews} icon={Eye} />
        <Kpi label="Try-ons completed" value={totalTryons} hint={`${tryonRate}% of views`} icon={MousePointerClick} />
        <Kpi label="Likes" value={totalLikes} hint={`${likeRate}% like-rate`} icon={Heart} />
        <Kpi label="Shares" value={totalShares} icon={Share2} />
        <Kpi label="Avg session" value={`${avgTimeSec}s`} icon={Clock} />
        <Kpi label="Interaction rate" value={`${interactRate}%`} icon={Activity} />
        <Kpi label="Wishlist saves" value={totalWishlist} icon={Star} />
        <Kpi label="Alt-picks" value={altPicks} hint="Recommended product chosen" icon={ShoppingBag} />
      </div>


      <Card title="Engagement trend" subtitle={`Views, try-ons, likes & shares over the last ${range.label}`} className="mt-4">
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={byDay}>
              <defs>
                <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GRAD_VIOLET} stopOpacity={0.4} /><stop offset="100%" stopColor={GRAD_VIOLET} stopOpacity={0} /></linearGradient>
                <linearGradient id="gt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GRAD_BLUE} stopOpacity={0.5} /><stop offset="100%" stopColor={GRAD_BLUE} stopOpacity={0} /></linearGradient>
                <linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GRAD_GREEN} stopOpacity={0.5} /><stop offset="100%" stopColor={GRAD_GREEN} stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="day" stroke="#94A3B8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0B1220", border: "1px solid #0EA5E9", borderRadius: 8, color: "#E2E8F0", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="views" stroke={GRAD_VIOLET} fill="url(#gv)" strokeWidth={2} />
              <Area type="monotone" dataKey="tryons" stroke={GRAD_BLUE} fill="url(#gt)" strokeWidth={2} />
              <Area type="monotone" dataKey="likes" stroke={GRAD_GREEN} fill="url(#gl)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card title="Conversion funnel" subtitle="From first view to share" className="lg:col-span-2">
          <div className="space-y-2 mt-3">
            {funnel.map((f, i) => {
              const top = funnel[0].count || 1;
              const pct = Math.max(4, Math.round((f.count / top) * 100));
              const dropPct = i === 0 || funnel[i - 1].count === 0 ? null : Math.round((f.count / funnel[i - 1].count) * 100);
              return (
                <div key={f.stage}>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="font-semibold" style={{ color: "#0B1220" }}>{f.stage}</span>
                    <span style={{ color: "#64748B" }}>{f.count.toLocaleString()} {dropPct !== null && <span className="ml-2" style={{ color: dropPct > 60 ? "#10B981" : dropPct > 25 ? "#F59E0B" : "#EF4444" }}>{dropPct}% retained</span>}</span>
                  </div>
                  <div className="h-7 rounded-md overflow-hidden" style={{ background: "#F1F5F9" }}>
                    <div className="h-full rounded-md flex items-center px-2 text-[10px] font-bold text-white" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${f.color}, ${f.color}cc)` }}>
                      {pct >= 12 ? f.stage : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Devices" subtitle="Where shoppers try-on">
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={deviceData.length ? deviceData : [{ name: "No data", value: 1 }]} dataKey="value" nameKey="name" innerRadius={42} outerRadius={78} paddingAngle={2}>
                  {(deviceData.length ? deviceData : [{}]).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card title="Top countries" subtitle="Shoppers by location" icon={Users}>
          {countries.length === 0 ? <Empty msg="No geo data yet." /> : (
            <ul className="mt-3 space-y-2">
              {countries.map(([c, n], i) => {
                const pct = Math.round((n / countries[0][1]) * 100);
                return (
                  <li key={c} className="flex items-center gap-3">
                    <span className="text-[12px] font-semibold w-6" style={{ color: "#475569" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[12px] flex-1" style={{ color: "#0B1220" }}>{c}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
                      <div className="h-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#0369A1,#38BDF8)" }} />
                    </div>
                    <span className="text-[12px] font-semibold w-12 text-right" style={{ color: "#0B1220" }}>{n}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Operating systems" subtitle="iOS, Android & more" icon={Smartphone}>
          {osData.length === 0 ? <Empty msg="No OS data yet." /> : (
            <div className="h-56 mt-2">
              <ResponsiveContainer>
                <BarChart data={osData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" stroke="#94A3B8" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" stroke="#94A3B8" tick={{ fontSize: 11 }} width={70} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {osData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card title="Product leaderboard" subtitle="Ranked by engagement score (try-ons × 2 + likes × 3 + shares × 5)" icon={TrendingUp} className="mt-4">
        {productStats.length === 0 ? <Empty msg="No product activity yet." /> : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr style={{ color: "#64748B" }}>
                  <th className="text-left font-medium py-2">#</th>
                  <th className="text-left font-medium py-2">Product</th>
                  <th className="text-right font-medium py-2">Views</th>
                  <th className="text-right font-medium py-2">Try-ons</th>
                  <th className="text-right font-medium py-2">Likes</th>
                  <th className="text-right font-medium py-2">Shares</th>
                  <th className="text-right font-medium py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {productStats.map((p, i) => (
                  <tr key={p.id} style={{ borderTop: "1px solid #F1F5F9" }}>
                    <td className="py-2.5 font-semibold" style={{ color: i < 3 ? "#0EA5E9" : "#94A3B8" }}>{String(i + 1).padStart(2, "0")}</td>
                    <td className="py-2.5 font-semibold truncate max-w-[200px]" style={{ color: "#0B1220" }}>{p.name}</td>
                    <td className="text-right py-2.5">{p.views.toLocaleString()}</td>
                    <td className="text-right py-2.5">{p.tryons.toLocaleString()}</td>
                    <td className="text-right py-2.5">{p.likes.toLocaleString()}</td>
                    <td className="text-right py-2.5">{p.shares.toLocaleString()}</td>
                    <td className="text-right py-2.5">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: `linear-gradient(135deg,#0369A1,#38BDF8)` }}>{p.score}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Top alternatives chosen" subtitle="When shoppers don't like the first product, what do they switch to?" className="mt-4">
        {topAlts.length === 0 ? <Empty msg="No alternative selections yet." /> : (
          <ul className="mt-3 divide-y" style={{ borderColor: "#F1F5F9" }}>
            {topAlts.map(([aid, n], i) => (
              <li key={aid} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 grid place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: "linear-gradient(135deg,#7C3AED,#0EA5E9)" }}>{i + 1}</span>
                  <span className="text-[13px] font-semibold" style={{ color: "#0B1220" }}>{productMap[aid] || aid.slice(0, 8)}</span>
                </div>
                <span className="text-[12px] font-bold" style={{ color: "#0EA5E9" }}>{n} picks</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </DashboardShell>
  );
}

function Kpi({ label, value, hint, icon: Icon, gradient }: { label: string; value: number | string; hint?: string; icon: any; gradient: string }) {
  return (
    <div className="relative p-4 rounded-xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-15" style={{ background: gradient }} />
      <div className="flex items-center justify-between relative">
        <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#64748B" }}>{label}</span>
        <div className="w-7 h-7 rounded-lg grid place-items-center text-white" style={{ background: gradient }}>
          <Icon size={13} />
        </div>
      </div>
      <div className="mt-2 text-[26px] font-bold tracking-tight" style={{ color: "#0B1220" }}>{typeof value === "number" ? value.toLocaleString() : value}</div>
      {hint && <div className="text-[11px] mt-0.5" style={{ color: "#64748B" }}>{hint}</div>}
    </div>
  );
}

function Card({ title, subtitle, icon: Icon, children, className = "" }: { title: string; subtitle?: string; icon?: any; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl p-5 ${className}`} style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
      <div className="flex items-start gap-2">
        {Icon && <div className="w-7 h-7 rounded-lg grid place-items-center text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#0369A1,#38BDF8)" }}><Icon size={13} /></div>}
        <div className="flex-1">
          <h3 className="text-[14px] font-semibold m-0" style={{ color: "#0B1220" }}>{title}</h3>
          {subtitle && <p className="text-[12px] m-0 mt-0.5" style={{ color: "#64748B" }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <p className="text-[12px] mt-4 text-center py-6" style={{ color: "#94A3B8" }}>{msg}</p>;
}
