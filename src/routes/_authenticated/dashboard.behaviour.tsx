import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { generateMarketingReport } from "@/lib/marketing-report.functions";
import { BarChart3, Globe2, Smartphone, Clock, Sparkles, Info, Download, FlaskConical, X, Loader2, Crown, Copy, Check } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard/behaviour")({
  component: BehaviourPage,
});

const GRAD = "linear-gradient(135deg, #0B1220 0%, #0369A1 50%, #38BDF8 100%)";

type Sess = {
  id: string; product_id: string; session_id: string; created_at: string;
  country: string | null; device_type: string | null; os_type: string | null;
  time_spent_seconds: number; did_interact: boolean; camera_used: string | null;
};

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
    if (n === 0) return { n: 0, avg: 0, interact: 0, devices: [], countries: [], byDay: [] as any[] };
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

  const COLORS = ["#0369A1", "#38BDF8", "#7C3AED", "#EC4899", "#10B981", "#F59E0B"];

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
    <DashboardShell title="Customer Behaviour">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold" style={{ background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>How customers experience your Try-On</h1>
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>Silent tracking through your embedded Try-On button. No personal data collected.</p>
        </div>
        <button onClick={() => setShowInfo(true)} className="btn-ghost text-xs"><Info size={14} /> How tracking works</button>
      </div>

      {!isStarterPlus && (
        <div className="rounded-2xl p-8 text-center mb-6" style={{ background: GRAD, color: "#fff" }}>
          <Crown size={36} className="mx-auto" />
          <h2 className="mt-3 text-white">Customer Behaviour is a paid feature</h2>
          <p className="mt-2 opacity-90">Upgrade to Starter or Growth to start seeing how visitors engage with your Try-On.</p>
          <a href="/pricing" className="inline-block mt-5 rounded-full px-6 py-2.5 font-semibold text-ink" style={{ background: "#fff" }}>View plans</a>
        </div>
      )}

      {isStarterPlus && products.length === 0 && (
        <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(2,132,199,0.18)" }}>
          <Sparkles size={36} className="mx-auto text-primary" />
          <h3 className="mt-3 text-ink">No Try-On products yet</h3>
          <p className="mt-2">Create a Try-On product, embed it, then come back to see customer behaviour.</p>
        </div>
      )}

      {isStarterPlus && products.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className="input-base max-w-sm">
              {products.map((p) => <option key={p.id} value={p.id}>{p.product_name}</option>)}
            </select>
            <div className="flex gap-2">
              {isGrowth && (
                <>
                  <button onClick={exportCsv} className="btn-ghost text-xs"><Download size={14} /> Export CSV</button>
                  <button onClick={runReport} className="btn-primary text-xs"><FlaskConical size={14} /> Generate Marketing Report</button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {[
              { label: "Sessions", value: metrics.n, icon: BarChart3 },
              { label: "Avg time (s)", value: metrics.avg, icon: Clock },
              { label: "Interaction rate", value: `${metrics.interact}%`, icon: Sparkles },
              { label: "Devices tracked", value: metrics.devices.length, icon: Smartphone },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(2,132,199,0.15)", boxShadow: "0 18px 40px -22px rgba(2,132,199,0.35)" }}>
                <div className="w-10 h-10 rounded-xl grid place-items-center text-white" style={{ background: GRAD }}><c.icon size={16} /></div>
                <div className="font-display font-extrabold text-2xl mt-3" style={{ background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{typeof c.value === "number" ? c.value.toLocaleString() : c.value}</div>
                <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{c.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(2,132,199,0.15)" }}>
              <h4 className="text-ink m-0 flex items-center gap-2"><BarChart3 size={16} className="text-primary" /> Sessions (last 7 days)</h4>
              <div className="h-64 mt-4">
                <ResponsiveContainer><BarChart data={metrics.byDay}><XAxis dataKey="day" stroke="#64748B" /><YAxis stroke="#64748B" /><Tooltip /><Bar dataKey="sessions" fill="#0369A1" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(2,132,199,0.15)" }}>
              <h4 className="text-ink m-0 flex items-center gap-2"><Smartphone size={16} className="text-primary" /> Device split</h4>
              <div className="h-64 mt-4">
                {metrics.devices.length === 0 ? <p className="text-sm text-muted mt-10 text-center">No data yet.</p> :
                <ResponsiveContainer><PieChart><Pie data={metrics.devices} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>{metrics.devices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Legend /></PieChart></ResponsiveContainer>}
              </div>
            </div>
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(2,132,199,0.15)" }}>
              <h4 className="text-ink m-0 flex items-center gap-2"><Globe2 size={16} className="text-primary" /> Top countries</h4>
              <ul className="mt-4 divide-y" style={{ borderColor: "var(--border)" }}>
                {metrics.countries.length === 0 && <li className="py-4 text-sm text-muted">No geo data yet.</li>}
                {metrics.countries.map((c) => (
                  <li key={c.name} className="py-2.5 flex items-center justify-between text-sm text-ink"><span>{c.name}</span><span className="text-muted">{c.value}</span></li>
                ))}
              </ul>
            </div>
            {isGrowth && (
              <>
                <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(2,132,199,0.15)" }}>
                  <h4 className="text-ink m-0">Per-customer timeline</h4>
                  <ul className="mt-4 max-h-64 overflow-auto divide-y" style={{ borderColor: "var(--border)" }}>
                    {sessions.slice(0, 50).map((s) => (
                      <li key={s.id} className="py-2 text-sm flex items-center justify-between gap-3">
                        <span className="text-ink font-mono text-xs truncate">{s.session_id.slice(0, 8)}</span>
                        <span className="text-muted text-xs">{new Date(s.created_at).toLocaleString()}</span>
                        <span className="text-ink text-xs">{s.time_spent_seconds}s · {s.device_type ?? "?"}</span>
                      </li>
                    ))}
                    {sessions.length === 0 && <li className="py-4 text-sm text-muted">No sessions yet.</li>}
                  </ul>
                </div>
                <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: GRAD, color: "#fff" }}>
                  <span className="text-[10px] uppercase tracking-wider opacity-80">Coming soon</span>
                  <h4 className="text-white mt-1">Behaviour heatmap</h4>
                  <p className="text-sm opacity-90 mt-1">Visualize where customers tap, compare and dwell inside your Try-On experience.</p>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {showInfo && (
        <div className="fixed inset-0 z-50 grid place-items-center p-6 bg-black/50" onClick={() => setShowInfo(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-ink">How customer tracking works</h3>
            <p className="text-sm mt-3 text-ink">Customer Behaviour Tracking works automatically through your embedded Try-On button. When a customer clicks your Try-On button on your website, our widget silently records their session data including device type, time spent in Try-On, whether they interacted with the experience, and where they came from. No personal data is collected. This data helps you understand which products drive the most engagement and where to focus your marketing.</p>
            <button onClick={() => setShowInfo(false)} className="btn-primary mt-5">Got it</button>
          </div>
        </div>
      )}

      {reportOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center p-6 bg-black/50" onClick={() => !reportLoading && setReportOpen(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-ink m-0">Marketing report</h3>
              <button onClick={() => setReportOpen(false)} className="text-muted"><X size={18} /></button>
            </div>
            {reportLoading ? (
              <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-primary" /><p className="text-sm mt-3">Analyzing customer sessions…</p></div>
            ) : (
              <>
                <div className="mt-4 prose prose-sm max-w-none whitespace-pre-wrap text-ink">{reportText}</div>
                <button onClick={() => { navigator.clipboard.writeText(reportText); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="btn-ghost mt-5 text-xs">
                  {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy report</>}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
