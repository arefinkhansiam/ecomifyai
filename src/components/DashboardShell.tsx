import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Box, BarChart2, Link as LinkIcon, CreditCard, Settings, LogOut, Bell, HelpCircle, Sparkles, Crown, Activity, Upload } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/products", label: "My Try-Ons", icon: Box },
  { to: "/dashboard/upload", label: "New Try-On", icon: Upload },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/dashboard/behaviour", label: "Customer Behaviour", icon: Activity },
  { to: "/dashboard/embed", label: "Embed and Share", icon: LinkIcon },
  { to: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { to: "/dashboard/settings", label: "Profile", icon: Settings },
] as const;

const GRAD = "linear-gradient(135deg, #0B1220 0%, #0369A1 50%, #38BDF8 100%)";

export function DashboardShell({ title, children }: { title: string; children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const [plan, setPlan] = useState<string>("free");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_plans").select("plan").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data?.plan) setPlan(data.plan);
    });
    supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle().then(async ({ data }) => {
      const path = (data as any)?.avatar_url;
      if (path) {
        const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
        setAvatarUrl(signed?.signedUrl ?? null);
      }
    });
  }, [user]);

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = "/"; };
  const isActive = (to: string, exact?: boolean) => exact ? pathname === to : pathname.startsWith(to);
  const isPaid = plan !== "free";
  const initial = user?.email?.[0].toUpperCase() ?? "?";

  return (
    <div className="min-h-screen flex relative" style={{
      background: `
        radial-gradient(ellipse 70% 50% at 0% 0%, rgba(56,189,248,0.18), transparent 60%),
        radial-gradient(ellipse 60% 50% at 100% 100%, rgba(2,132,199,0.15), transparent 60%),
        linear-gradient(180deg, #F6FAFE 0%, #EAF4FB 50%, #F6FAFE 100%)
      `,
    }}>
      {/* sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed left-0 top-0 bottom-0 p-5 z-30"
        style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(24px) saturate(160%)", borderRight: "1px solid rgba(2,132,199,0.15)" }}>
        <Link to="/" className="font-display text-2xl font-extrabold flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl grid place-items-center text-white" style={{ background: GRAD, boxShadow: "0 8px 20px -6px rgba(2,132,199,0.5)" }}>
            <Sparkles size={16} />
          </span>
          <span style={{ background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>EASIBIE</span>
        </Link>
        <div className="mt-6 p-3 rounded-2xl flex items-center gap-3" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(2,132,199,0.15)", boxShadow: "0 10px 30px -18px rgba(2,132,199,0.35)" }}>
          <div className="w-11 h-11 rounded-full overflow-hidden grid place-items-center text-white font-display font-bold" style={{ background: GRAD }}>
            {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate text-ink">{user?.user_metadata?.full_name ?? user?.email}</div>
            <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold text-white" style={{ background: isPaid ? GRAD : "#64748B" }}>
              {isPaid && <Crown size={9} />} {plan}
            </span>
          </div>
        </div>
        <nav className="mt-6 flex-1 space-y-1">
          {NAV.map((n) => {
            const active = isActive(n.to, "exact" in n ? (n as any).exact : false);
            return (
              <Link key={n.to} to={n.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: active ? GRAD : "transparent",
                  color: active ? "#fff" : "var(--ink-soft)",
                  boxShadow: active ? "0 10px 24px -10px rgba(2,132,199,0.55)" : "none",
                }}>
                <n.icon size={18} /> {n.label}
              </Link>
            );
          })}
        </nav>
        {!isPaid && (
          <Link to="/pricing" className="rounded-2xl p-4 text-white mb-3 block" style={{ background: GRAD, boxShadow: "0 18px 40px -18px rgba(2,132,199,0.55)" }}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider"><Crown size={12} /> Upgrade</div>
            <div className="text-sm mt-1 font-semibold">Unlock gradient buttons, hide branding & more.</div>
          </Link>
        )}
        <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(2,132,199,0.15)" }}>
          <Link to="/how-it-works" className="text-xs font-semibold text-ink inline-flex items-center gap-2"><HelpCircle size={14} className="text-primary" /> Help center</Link>
        </div>
        <button onClick={signOut} className="mt-3 flex items-center gap-2 text-sm text-muted hover:text-primary px-3 py-2 transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* main */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20"
          style={{ background: "rgba(246,250,254,0.8)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(2,132,199,0.1)" }}>
          <h2 className="font-display text-xl md:text-2xl font-extrabold" style={{ background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            {title}
          </h2>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full grid place-items-center transition" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(2,132,199,0.15)" }}>
              <Bell size={16} className="text-primary" />
            </button>
            <Link to="/dashboard/settings" className="w-9 h-9 rounded-full overflow-hidden grid place-items-center text-sm font-bold text-white" style={{ background: GRAD }}>
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initial}
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-28 md:pb-8">{children}</main>
        {/* mobile bottom tab bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around py-2 z-20"
          style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(2,132,199,0.18)", paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)" }}>
          {NAV.slice(0, 5).map((n) => {
            const active = isActive(n.to, "exact" in n ? (n as any).exact : false);
            return (
              <Link key={n.to} to={n.to} className="flex flex-col items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg"
                style={{ color: active ? "var(--primary)" : "var(--muted)" }}>
                <span className="w-9 h-9 rounded-xl grid place-items-center" style={{ background: active ? GRAD : "transparent", color: active ? "#fff" : "var(--muted)" }}>
                  <n.icon size={18} />
                </span>
                {n.label.split(" ")[0]}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function DashboardLayoutRoute() {
  return <Outlet />;
}
