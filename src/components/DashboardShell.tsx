import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Box,
  BarChart2,
  Code2,
  CreditCard,
  Settings,
  Bell,
  HelpCircle,
  Activity,
  Upload,
  ChevronDown,
  ShoppingBag,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { AiChatbot } from "./AiChatbot";

const dashboardTheme = {
  background: "#F8FAFC",
  "--bg": "#F8FAFC",
  "--surface": "#FFFFFF",
  "--card": "#FFFFFF",
  "--border": "#E2E8F0",
  "--ink": "#0B192C",
  "--ink-soft": "#475569",
  "--primary": "#1E40AF",
  "--primary-light": "#EFF6FF",
  "--accent": "#2563EB",
  "--muted": "#64748B",
} as CSSProperties;

const NAV_MAIN = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/products", label: "Store Garments", icon: Box },
  { to: "/dashboard/upload", label: "Add New Try-On", icon: Upload },
  { to: "/dashboard/embed", label: "Embed Code & Widget", icon: Code2 },
  { to: "/dashboard/analytics", label: "Fitting Analytics", icon: BarChart2 },
  { to: "/dashboard/behaviour", label: "Shopper Insights", icon: Activity },
] as const;

const NAV_SALES = [
  { to: "/dashboard/shopify", label: "Shopify Sync", icon: ShoppingBag },
  { to: "/dashboard/billing", label: "Billing & Quota", icon: CreditCard },
  { to: "/dashboard/settings", label: "Store Settings & API", icon: Settings },
] as const;

export function DashboardShell({ title, children }: { title: string; children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const [plan, setPlan] = useState<string>("growth");
  const [storeName, setStoreName] = useState<string>("Atelier Fashion Co.");
  const [storeMenuOpen, setStoreMenuOpen] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>("");
  const [openMenu, setOpenMenu] = useState<null | "profile" | "bell" | "help">(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_plans")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.plan) setPlan(data.plan);
      });
    supabase
      .from("profiles")
      .select("avatar_url, business_name, store_name, full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(async ({ data }: any) => {
        const name = data?.business_name || data?.store_name || data?.full_name;
        if (name) setStoreName(name);
        if (data?.full_name) setFullName(data.full_name);
      });
  }, [user]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  const displayName = fullName || storeName || user?.email?.split("@")[0] || "Fashion Retailer";
  const initial = (displayName?.[0] ?? "E").toUpperCase();

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]" style={dashboardTheme}>
      {/* Sidebar (Crisp White & Deep Blue Accent) */}
      <aside className="hidden md:flex w-64 flex-col fixed left-0 top-0 bottom-0 z-30 bg-white border-r border-[#E2E8F0] shadow-sm">
        {/* Brand Logo & Store Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
          <Link to="/" className="flex items-center gap-2.5 group mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0F2744] via-[#1E40AF] to-[#2563EB] grid place-items-center text-white shadow-sm">
              <Sparkles size={16} />
            </div>
            <div>
              <span className="text-[17px] font-extrabold text-[#0B192C] tracking-tight block leading-none">
                Easibie<span className="text-[#2563EB]">.ai</span>
              </span>
              <span className="text-[9.5px] uppercase font-bold text-[#64748B] tracking-wider">
                Merchant Console
              </span>
            </div>
          </Link>

          {/* Store Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setStoreMenuOpen((v) => !v)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] transition"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-[#1E40AF] text-white text-[11px] font-extrabold grid place-items-center shrink-0">
                  {initial}
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[12px] font-bold text-[#0B192C] truncate">{storeName}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Widget Active
                  </div>
                </div>
              </div>
              <ChevronDown size={14} className="text-[#64748B]" />
            </button>

            {/* Dropdown Menu */}
            {storeMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setStoreMenuOpen(false)} />
                <div className="absolute left-0 right-0 top-12 z-50 bg-white rounded-xl shadow-xl border border-slate-200 py-1 text-[12px]">
                  <div className="px-3 py-2 border-b border-slate-100 text-[#64748B] text-[11px]">
                    Signed in as <strong className="text-[#0B192C]">{user?.email || "merchant@store.com"}</strong>
                  </div>
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setStoreMenuOpen(false)}
                    className="block px-3 py-2 hover:bg-slate-50 text-[#0B192C]"
                  >
                    Store Profile & API
                  </Link>
                  <Link
                    to="/dashboard/billing"
                    onClick={() => setStoreMenuOpen(false)}
                    className="block px-3 py-2 hover:bg-slate-50 text-[#0B192C]"
                  >
                    Plan & Usage Quota
                  </Link>
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={signOut}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-rose-600 font-semibold"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-2 pb-1.5 text-[10px] uppercase font-bold tracking-wider text-[#94A3B8]">
              Virtual Studio
            </div>
            <div className="space-y-1">
              {NAV_MAIN.map((n) => {
                const active = isActive(n.to, "exact" in n ? (n as any).exact : false);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition ${
                      active
                        ? "bg-blue-50 text-[#1E40AF] font-bold border border-blue-200/60 shadow-xs"
                        : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0B192C]"
                    }`}
                  >
                    <n.icon size={16} className={active ? "text-[#2563EB]" : "text-[#64748B]"} />
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-2 pb-1.5 text-[10px] uppercase font-bold tracking-wider text-[#94A3B8]">
              Store & Integration
            </div>
            <div className="space-y-1">
              {NAV_SALES.map((n) => {
                const active = isActive(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition ${
                      active
                        ? "bg-blue-50 text-[#1E40AF] font-bold border border-blue-200/60"
                        : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0B192C]"
                    }`}
                  >
                    <n.icon size={16} className={active ? "text-[#2563EB]" : "text-[#64748B]"} />
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Sidebar Footer: Shopper Studio Quick Link */}
        <div className="p-3 border-t border-[#F1F5F9] bg-[#F8FAFC]">
          <Link
            to="/try-ar"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-[12px] font-bold text-[#0B192C] flex items-center justify-between transition shadow-xs"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-blue-600" /> Preview Shopper Studio
            </span>
            <ExternalLink size={12} className="text-slate-400" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[17px] font-bold text-[#0B192C] tracking-tight">{title}</h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={11} className="text-blue-600" /> Photo Try-On Engine Live
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/embed"
              className="hidden sm:inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#1E40AF] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition"
            >
              <Code2 size={14} /> Get Embed Code
            </Link>

            <Link
              to="/dashboard/upload"
              className="btn-blue-primary text-[12.5px] !py-1.5 !px-3.5 !rounded-lg"
            >
              <Upload size={14} /> Add Product
            </Link>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Profile Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1E40AF] to-[#2563EB] text-white text-[12px] font-bold grid place-items-center shadow-sm">
                {initial}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <AiChatbot />
    </div>
  );
}
