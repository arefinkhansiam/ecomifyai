import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Box, BarChart2, Link as LinkIcon, CreditCard, Settings, LogOut, Bell, HelpCircle, Crown, Activity, Upload, Search, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

const NAV_MAIN = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/products", label: "Try-On Products", icon: Box },
  { to: "/dashboard/upload", label: "New Try-On", icon: Upload },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/dashboard/behaviour", label: "Customers", icon: Activity },
] as const;

const NAV_SALES = [
  { to: "/dashboard/embed", label: "Embed & Share", icon: LinkIcon },
  { to: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { to: "/dashboard/settings", label: "Profile", icon: Settings },
] as const;

const ALL_NAV = [...NAV_MAIN, ...NAV_SALES];

export function DashboardShell({ title, children }: { title: string; children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const [plan, setPlan] = useState<string>("free");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>("My Store");

  useEffect(() => {
    if (!user) return;
    supabase.from("user_plans").select("plan").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data?.plan) setPlan(data.plan);
    });
    supabase.from("profiles").select("avatar_url, business_name, store_name, full_name").eq("id", user.id).maybeSingle().then(async ({ data }: any) => {
      const path = data?.avatar_url;
      const name = data?.business_name || data?.store_name || data?.full_name;
      if (name) setStoreName(name);
      if (path) {
        const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
        setAvatarUrl(signed?.signedUrl ?? null);
      }
    });
  }, [user]);

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = "/"; };
  const isActive = (to: string, exact?: boolean) => exact ? pathname === to : pathname.startsWith(to);
  const isPaid = plan !== "free";
  const initial = (storeName?.[0] ?? user?.email?.[0] ?? "?").toUpperCase();

  return (
    <div className="min-h-screen flex" style={{ background: "#F1F2F4" }}>
      {/* Sidebar - Shopify Polaris style */}
      <aside className="hidden md:flex w-60 flex-col fixed left-0 top-0 bottom-0 z-30"
        style={{ background: "#1A1A1A", borderRight: "1px solid #2A2A2A" }}>
        {/* Store switcher */}
        <div className="px-3 pt-3 pb-2">
          <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition" style={{ color: "#E3E3E3" }}>
            <div className="w-7 h-7 rounded-md grid place-items-center text-[11px] font-bold flex-shrink-0" style={{ background: "#0284C7", color: "#fff" }}>
              {initial}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-[13px] font-semibold truncate">{storeName}</div>
            </div>
            <ChevronDown size={14} className="opacity-60" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)" }}>
            <Search size={13} style={{ color: "#9CA3AF" }} />
            <input placeholder="Search" className="bg-transparent text-[13px] outline-none flex-1 min-w-0" style={{ color: "#E3E3E3" }} />
            <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.08)", color: "#9CA3AF" }}>⌘K</kbd>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 pb-3">
          <div className="space-y-0.5">
            {NAV_MAIN.map((n) => {
              const active = isActive(n.to, "exact" in n ? (n as any).exact : false);
              return (
                <Link key={n.to} to={n.to}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] font-medium transition"
                  style={{ background: active ? "rgba(255,255,255,0.10)" : "transparent", color: active ? "#FFFFFF" : "#C9CCD1" }}>
                  <n.icon size={15} strokeWidth={2} /> {n.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-4 px-2 pb-1 text-[10px] uppercase tracking-wider font-semibold" style={{ color: "#6B7280" }}>Sales channels</div>
          <div className="space-y-0.5">
            {NAV_SALES.map((n) => {
              const active = isActive(n.to);
              return (
                <Link key={n.to} to={n.to}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] font-medium transition"
                  style={{ background: active ? "rgba(255,255,255,0.10)" : "transparent", color: active ? "#FFFFFF" : "#C9CCD1" }}>
                  <n.icon size={15} strokeWidth={2} /> {n.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer / plan */}
        <div className="px-3 py-3 border-t" style={{ borderColor: "#2A2A2A" }}>
          {!isPaid && (
            <Link to="/dashboard/billing" className="flex items-center justify-between px-2.5 py-2 rounded-md mb-2 text-[12px] font-medium hover:bg-white/5 transition" style={{ color: "#E3E3E3" }}>
              <span className="flex items-center gap-2"><Crown size={13} style={{ color: "#FBBF24" }} /> Upgrade plan</span>
              <span style={{ color: "#9CA3AF" }}>→</span>
            </Link>
          )}
          <button onClick={signOut} className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium hover:bg-white/5 transition" style={{ color: "#9CA3AF" }}>
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="px-4 sm:px-6 md:px-8 h-14 flex items-center justify-between sticky top-0 z-20"
          style={{ background: "#FFFFFF", borderBottom: "1px solid #E1E3E5" }}>
          <h2 className="text-[15px] font-semibold" style={{ color: "#1A1A1A", letterSpacing: "-0.01em" }}>{title}</h2>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-md grid place-items-center hover:bg-[#F1F2F4] transition" title="Notifications">
              <Bell size={15} style={{ color: "#4A4A4A" }} />
            </button>
            <button className="w-8 h-8 rounded-md grid place-items-center hover:bg-[#F1F2F4] transition" title="Help">
              <HelpCircle size={15} style={{ color: "#4A4A4A" }} />
            </button>
            <Link to="/dashboard/settings" className="w-8 h-8 rounded-full overflow-hidden grid place-items-center text-[12px] font-semibold ml-1" style={{ background: "#0284C7", color: "#fff" }}>
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initial}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8" style={{ background: "#F1F2F4" }}>
          <div className="max-w-[1100px] mx-auto">{children}</div>
        </main>

        {/* Mobile bottom tab */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around z-20"
          style={{ background: "#FFFFFF", borderTop: "1px solid #E1E3E5", paddingBottom: "calc(env(safe-area-inset-bottom) + 6px)", paddingTop: "6px" }}>
          {ALL_NAV.slice(0, 5).map((n) => {
            const active = isActive(n.to, "exact" in n ? (n as any).exact : false);
            return (
              <Link key={n.to} to={n.to} className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium"
                style={{ color: active ? "#1A1A1A" : "#6B7280" }}>
                <n.icon size={18} strokeWidth={active ? 2.4 : 2} />
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
