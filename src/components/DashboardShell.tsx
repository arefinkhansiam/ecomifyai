import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Box, Upload, BarChart2, Link as LinkIcon, CreditCard, Settings, LogOut, Bell, HelpCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/products", label: "My AR Products", icon: Box },
  { to: "/dashboard/upload", label: "Upload New", icon: Upload },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/dashboard/embed", label: "Embed and Share", icon: LinkIcon },
  { to: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function DashboardShell({ title, children }: { title: string; children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const [plan, setPlan] = useState<string>("free");

  useEffect(() => {
    if (!user) return;
    supabase.from("user_plans").select("plan").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data?.plan) setPlan(data.plan);
    });
  }, [user]);

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = "/"; };
  const isActive = (to: string, exact?: boolean) => exact ? pathname === to : pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-bg text-white flex">
      {/* sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-surface fixed left-0 top-0 bottom-0 p-5">
        <Link to="/" className="font-display text-xl font-extrabold">
          <span className="text-cyan">E</span>ASIBIE
        </Link>
        <div className="mt-6 p-3 rounded-xl bg-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--primary)] grid place-items-center font-display font-bold">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{user?.user_metadata?.full_name ?? user?.email}</div>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider"
              style={{ background: "rgba(124,58,237,0.2)", color: "var(--lavender)" }}>{plan}</span>
          </div>
        </div>
        <nav className="mt-6 flex-1 space-y-1">
          {NAV.map((n) => {
            const active = isActive(n.to, "exact" in n ? (n as any).exact : false);
            return (
              <Link
                key={n.to}
                to={n.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
                style={{
                  background: active ? "rgba(124,58,237,0.15)" : "transparent",
                  color: active ? "var(--primary)" : "var(--muted)",
                  borderLeft: active ? "3px solid var(--primary)" : "3px solid transparent",
                }}
              >
                <n.icon size={18} /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="bg-card rounded-xl p-4">
          <div className="text-xs text-muted">Need help?</div>
          <Link to="/how-it-works" className="text-sm font-semibold text-white mt-1 inline-flex items-center gap-1">
            <HelpCircle size={14} /> Visit help center
          </Link>
        </div>
        <button onClick={signOut} className="mt-3 flex items-center gap-2 text-sm text-muted hover:text-white px-3 py-2">
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* main */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        <header className="bg-surface px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="font-display text-xl font-bold text-white">{title}</h2>
          <div className="flex items-center gap-4">
            <Bell size={18} className="text-muted" />
            <div className="w-9 h-9 rounded-full bg-[var(--primary)] grid place-items-center text-sm font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8">{children}</main>
        {/* mobile bottom tab bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-[var(--border)] flex justify-around py-2 z-20"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)" }}>
          {NAV.slice(0, 5).map((n) => {
            const active = isActive(n.to, "exact" in n ? (n as any).exact : false);
            return (
              <Link key={n.to} to={n.to} className="flex flex-col items-center gap-1 text-[10px]"
                style={{ color: active ? "var(--primary)" : "var(--muted)" }}>
                <n.icon size={20} /> {n.label.split(" ")[0]}
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
