import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { generateMarketingReport } from "@/lib/marketing-report.functions";
import { BarChart3, Globe2, Smartphone, Clock, Sparkles, Info, Download, FlaskConical, X, Loader2, Crown, Copy, Check, Users, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard/behaviour")({
  component: BehaviourPage,
});

type Sess = {
  id: string; product_id: string; session_id: string; created_at: string;
  country: string | null; device_type: string | null; os_type: string | null;
  time_spent_seconds: number; did_interact: boolean; camera_used: string | null;
};

const COLORS = ["#0EA5E9", "#10B981", "#7C3AED", "#F59E0B", "#EC4899", "#06B6D4"];

function BehaviourPage() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<"free" | "starter" | "growth">("free");
  const [products, setProducts] = useState<{ id: string; product_name: string }[]>([]);
  const [productId, setProductId] = useState<string>("");
  const [sessions, setSessions] = useState<Sess[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportText, setReportText] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchReport = useServerFn(generateMarketingReport);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_plans").select("plan").eq("user_id", user.id).maybeSingle().then(({ data }) => setPlan(((data?.plan as any) ?? "free")));
    supabase.from("ar_products").select("id, product_name").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => {
      const list = data ?? [];
      setProducts(list);
      if (list.length && !productId) setProductId(list[0].id);
    });
  }, [user]);

  useEffect(() => {
    if (!productId) return;
    const limit = plan === "growth" ? 1000 : 100;
    supabase.from("ar_sessions").select("*").eq("product_id", productId).order("created_at", { ascending: false }).limit(limit).then(({ data }) => {
      setSessions((data ?? []) as Sess[]);
    });
  }, [productId, plan]);

  const metrics = useMemo(() => {
    const n = sessions.length;
    if (n === 0) return { n: 0, avg: 0, interact: 0, devices: [] as any[], countries: [] as any[], byDay: [] as any[] };
    const avg = Math.round(sessions.reduce((s, r) => s + (r.time_spent_seconds || 0), 0) / n);
    const interact = Math.round((sessions.filter((s) => s.did_interact).length / n) * 100);
    const tally = <K extends keyof Sess>(k: K) => Object.entries(sessions.reduce<Record<string, number>>((m, r) => { const v = String(r[k] ?? "unknown"); m[v] = (m[v] ?? 0) + 1; return m; }, {})).map(([name, value]) => ({ name, value }));
    const devices = tally("device_type");
    const countries = tally("country").sort((a, b) => b.value - a.value).slice(0, 6);
    const byDay = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(Date.now() - (6 - i) * 86400000);
      const key = d.toISOString().slice(0, 10);
      return { day: d.toLocaleDateString(undefined, { weekday: "short" }), sessions: sessions.filter((s) => s.created_at.slice(0, 10) === key).length };
    });
    return { n, avg, interact, devices, countries, byDay };
  }, [sessions]);

  const exportCsv = () => {
    if (sessions.length === 0) return;
    const rows = [["created_at", "session_id", "country", "device_type", "os_type", "time_spent_seconds", "did_interact", "camera_used"], ...sessions.map((s) => [s.created_at, s.session_id, s.country ?? "", s.device_type ?? "", s.os_type ?? "", String(s.time_spent_seconds), String(s.did_interact), s.camera_used ?? ""])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `tryon-sessions-${productId.slice(0, 8)}.csv`; a.click();
  };

  const runReport = async () => {
    setReportOpen(true); setReportLoading(true); setReportText("");
    try {
      const res = await fetchReport({ data: { productId } });
      setReportText(res.report);
    } catch (e: any) { toast.error(e.message ?? "Failed to generate report"); setReportOpen(false); }
    finally { setReportLoading(false); }
  };

  const isStarterPlus = plan === "starter" || plan === "growth";
  const isGrowth = plan === "growth";

  return (
    <DashboardShell title="Customers">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: "#1A1A1A" }}>Customer behaviour</h1>
          <p className="text-[13px] mt-1" style={{ color: "#6B7280" }}>Silent tracking through your embedded Try-On button. No personal data collected.</p>
        </div>
        <button onClick={() => setShowInfo(true)} className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-md font-semibold" style={{ background: "#fff", border: "1px solid #E1E3E5", color: "#1A1A1A" }}><Info size={13} /> How tracking works</button>
      </div>

      {!isStarterPlus && (
        <Card title="Upgrade required" subtitle="Customer Behaviour is included on Starter and Growth.">
          <div className="py-6 text-center">
            <Crown size={28} style={{ color: "#0EA5E9" }} className="mx-auto" />
            <p className="mt-2 text-[13px]" style={{ color: "#4A4A4A" }}>Upgrade to start seeing how visitors engage with your Try-On.</p>
            <a href="/dashboard/billing" className="inline-block mt-4 rounded-md px-4 py-2 text-[12px] font-semibold text-white" style={{ background: "#1A1A1A" }}>View plans</a>
          </div>
        </Card>
      )}

      {isStarterPlus && products.length === 0 && (
        <Card title="No Try-On products yet" subtitle="Create a Try-On product, embed it, then come back to see customer behaviour.">
          <div className="py-8 text-center"><Sparkles size={28} style={{ color: "#0EA5E9" }} className="mx-auto" /></div>
        </Card>
      )}

      {isStarterPlus && products.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className="text-[12px] px-3 py-1.5 rounded-md" style={{ background: "#fff", border: "1px solid #E1E3E5", color: "#1A1A1A", maxWidth: 320 }}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.product_name}</option>)}
            </select>
            <div className="flex gap-2">
              {isGrowth && (
                <>
                  <button onClick={exportCsv} className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-md font-semibold" style={{ background: "#fff", border: "1px solid #E1E3E5", color: "#1A1A1A" }}><Download size={13} /> Export CSV</button>
                  <button onClick={runReport} className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-md font-semibold text-white" style={{ background: "#1A1A1A" }}><FlaskConical size={13} /> Generate marketing report</button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi label="Sessions" value={metrics.n} icon={BarChart3} />
            <Kpi label="Avg time" value={`${metrics.avg}s`} icon={Clock} />
            <Kpi label="Interaction rate" value={`${metrics.interact}%`} icon={Activity} />
            <Kpi label="Devices tracked" value={metrics.devices.length} icon={Smartphone} />
          </div>

          <Card title="Sessions" subtitle="Last 7 days" className="mt-4">
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={metrics.byDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="day" stroke="#94A3B8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="sessions" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <Card title="Device split" subtitle="Where customers try on">
              <div className="h-56">
                {metrics.devices.length === 0 ? <Empty msg="No data yet." /> :
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={metrics.devices} dataKey="value" nameKey="name" innerRadius={42} outerRadius={78} paddingAngle={2}>
                        {metrics.devices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                }
              </div>
            </Card>

            <Card title="Top countries" subtitle="Shoppers by location" icon={Globe2}>
              {metrics.countries.length === 0 ? <Empty msg="No geo data yet." /> : (
                <ul className="mt-3 space-y-2">
                  {metrics.countries.map((c, i) => {
                    const pct = Math.round((c.value / metrics.countries[0].value) * 100);
                    return (
                      <li key={c.name} className="flex items-center gap-3">
                        <span className="text-[12px] font-semibold w-6" style={{ color: "#475569" }}>{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-[12px] flex-1" style={{ color: "#0B1220" }}>{c.name}</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
                          <div className="h-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#0369A1,#38BDF8)" }} />
                        </div>
                        <span className="text-[12px] font-semibold w-12 text-right" style={{ color: "#0B1220" }}>{c.value}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>

          {isGrowth && (
            <Card title="Per-customer timeline" subtitle="Recent sessions" icon={Users} className="mt-4">
              {sessions.length === 0 ? <Empty msg="No sessions yet." /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr style={{ color: "#64748B" }}>
                        <th className="text-left font-medium py-2">Session</th>
                        <th className="text-left font-medium py-2">When</th>
                        <th className="text-right font-medium py-2">Time</th>
                        <th className="text-right font-medium py-2">Device</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.slice(0, 50).map((s) => (
                        <tr key={s.id} style={{ borderTop: "1px solid #F1F5F9" }}>
                          <td className="py-2.5 font-mono" style={{ color: "#1A1A1A" }}>{s.session_id.slice(0, 8)}</td>
                          <td className="py-2.5" style={{ color: "#6B7280" }}>{new Date(s.created_at).toLocaleString()}</td>
                          <td className="text-right py-2.5" style={{ color: "#1A1A1A" }}>{s.time_spent_seconds}s</td>
                          <td className="text-right py-2.5" style={{ color: "#1A1A1A" }}>{s.device_type ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {showInfo && (
        <div className="fixed inset-0 z-50 grid place-items-center p-6 bg-black/50" onClick={() => setShowInfo(false)}>
          <div className="rounded-xl p-6 max-w-lg" style={{ background: "#fff", border: "1px solid #E1E3E5" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[16px] font-semibold m-0" style={{ color: "#1A1A1A" }}>How customer tracking works</h3>
            <p className="text-[13px] mt-3" style={{ color: "#4A4A4A" }}>Customer Behaviour Tracking works automatically through your embedded Try-On button. When a customer clicks your Try-On button, our widget silently records device type, time spent, whether they interacted, and where they came from. No personal data is collected.</p>
            <button onClick={() => setShowInfo(false)} className="mt-5 px-4 py-2 rounded-md text-[12px] font-semibold text-white" style={{ background: "#1A1A1A" }}>Got it</button>
          </div>
        </div>
      )}

      {reportOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center p-6 bg-black/50" onClick={() => !reportLoading && setReportOpen(false)}>
          <div className="rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" style={{ background: "#fff", border: "1px solid #E1E3E5" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold m-0" style={{ color: "#1A1A1A" }}>Marketing report</h3>
              <button onClick={() => setReportOpen(false)} style={{ color: "#6B7280" }}><X size={18} /></button>
            </div>
            {reportLoading ? (
              <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto" style={{ color: "#0EA5E9" }} /><p className="text-[13px] mt-3" style={{ color: "#6B7280" }}>Analyzing customer sessions…</p></div>
            ) : (
              <>
                <div className="mt-4 text-[13px] whitespace-pre-wrap" style={{ color: "#1A1A1A" }}>{reportText}</div>
                <button onClick={() => { navigator.clipboard.writeText(reportText); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="inline-flex items-center gap-1.5 mt-5 text-[12px] px-3 py-1.5 rounded-md font-semibold" style={{ background: "#fff", border: "1px solid #E1E3E5", color: "#1A1A1A" }}>
                  {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy report</>}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function Kpi({ label, value, hint, icon: Icon }: { label: string; value: number | string; hint?: string; icon: any }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: "#FFFFFF", border: "1px solid #E1E3E5" }}>
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium" style={{ color: "#6B7280" }}>{label}</span>
        <Icon size={14} style={{ color: "#9CA3AF" }} />
      </div>
      <div className="mt-2 text-[24px] font-semibold tracking-tight" style={{ color: "#1A1A1A" }}>{typeof value === "number" ? value.toLocaleString() : value}</div>
      {hint && <div className="text-[11px] mt-0.5" style={{ color: "#9CA3AF" }}>{hint}</div>}
    </div>
  );
}

function Card({ title, subtitle, icon: Icon, children, className = "" }: { title: string; subtitle?: string; icon?: any; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl ${className}`} style={{ background: "#FFFFFF", border: "1px solid #E1E3E5" }}>
      <div className="px-5 py-4 flex items-start gap-2" style={{ borderBottom: "1px solid #F1F2F4" }}>
        {Icon && <Icon size={15} style={{ color: "#6B7280" }} className="mt-0.5" />}
        <div className="flex-1">
          <h3 className="text-[14px] font-semibold m-0" style={{ color: "#1A1A1A" }}>{title}</h3>
          {subtitle && <p className="text-[12px] m-0 mt-0.5" style={{ color: "#6B7280" }}>{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <p className="text-[12px] mt-4 text-center py-6" style={{ color: "#94A3B8" }}>{msg}</p>;
}
