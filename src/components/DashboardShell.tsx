import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Box, BarChart2, Link as LinkIcon, CreditCard, Settings, Bell, HelpCircle, Crown, Activity, Upload, ChevronDown, BookOpen, MessageCircleQuestion, ShoppingBag } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { AiChatbot } from "./AiChatbot";

const dashboardTheme = {
  background: "#F5F5F5",
  "--bg": "#F5F5F5",
  "--surface": "#FFFFFF",
  "--card": "#FFFFFF",
  "--border": "#D4D4D4",
  "--ink": "#0A0A0A",
  "--ink-soft": "#404040",
  "--primary": "#0A0A0A",
  "--primary-light": "#525252",
  "--accent": "#171717",
  "--muted": "#6B7280",
  "--gradient-ocean": "linear-gradient(135deg, #000000 0%, #1F1F1F 55%, #4B5563 100%)",
  "--gradient-soft": "linear-gradient(180deg, #FFFFFF 0%, #F4F4F5 100%)",
  "--shadow-ocean": "0 24px 55px -28px rgba(0,0,0,0.42)",
  "--shadow-soft": "0 16px 45px -26px rgba(0,0,0,0.28)",
} as CSSProperties;

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

const FAQ_ITEMS = [
  { q: "How do I add try-on to my Shopify store?", a: "Open Embed & Share, copy the Shopify Liquid snippet, and paste it into sections/main-product.liquid." },
  { q: "Why is my product stuck on processing?", a: "Processing usually completes in 30–90 seconds. If it stays longer, re-upload the image with a clean background." },
  { q: "Can I customize the Try-On button look?", a: "Yes — open any product, hit Edit, and use the Store button section to change color, gradient, radius, and glow." },
  { q: "How are analytics tracked?", a: "Every try-on session, view, interaction and dwell-time is recorded automatically from the widget." },
];

export function DashboardShell({ title, children }: { title: string; children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const [plan, setPlan] = useState<string>("free");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>("My Store");
  const [storeMenuOpen, setStoreMenuOpen] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>("");

  const [openMenu, setOpenMenu] = useState<null | "profile" | "bell" | "help">(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_plans").select("plan").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data?.plan) setPlan(data.plan);
    });
    supabase.from("profiles").select("avatar_url, business_name, store_name, full_name").eq("id", user.id).maybeSingle().then(async ({ data }: any) => {
      const path = data?.avatar_url;
      const name = data?.business_name || data?.store_name || data?.full_name;
      if (name) setStoreName(name);
      if (data?.full_name) setFullName(data.full_name);
      if (path) {
        const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
        setAvatarUrl(signed?.signedUrl ?? null);
      }
    });
  }, [user]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = "/"; };
  const isActive = (to: string, exact?: boolean) => exact ? pathname === to : pathname.startsWith(to);
  const isPaid = plan !== "free";
  const displayName = fullName || storeName || user?.email?.split("@")[0] || "Account";
  const initial = (displayName?.[0] ?? "?").toUpperCase();

  return (
    <div className="min-h-screen flex dashboard-mono" style={dashboardTheme}>
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col fixed left-0 top-0 bottom-0 z-30"
        style={{ background: "linear-gradient(180deg,#000000 0%,#111111 52%,#242424 100%)", borderRight: "1px solid rgba(255,255,255,0.10)" }}>
        {/* Store switcher */}
        <div className="px-3 pt-4 pb-3 relative">
          <button
            onClick={() => setStoreMenuOpen((v) => !v)}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition"
            style={{ color: "#E3E3E3" }}
          >
            <div className="w-7 h-7 rounded-md grid place-items-center text-[11px] font-bold flex-shrink-0" style={{ background: "#FFFFFF", color: "#000000", boxShadow: "0 4px 12px -6px rgba(255,255,255,0.55)" }}>
              {initial}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-[13px] font-semibold truncate">{displayName}</div>
              <div className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.5)" }}>Easibie Studio</div>
            </div>
            <ChevronDown size={14} className="opacity-60" style={{ transform: storeMenuOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
          </button>
          {storeMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setStoreMenuOpen(false)} />
              <div className="absolute left-3 right-3 top-[68px] z-50 rounded-lg overflow-hidden shadow-2xl"
                style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.18)" }}>
                <div className="px-3 py-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="text-[12px] font-semibold" style={{ color: "#E0F2FE" }}>{displayName}</div>
                  <div className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{user?.email}</div>
                </div>
                <div className="py-1">
                  <Link to="/dashboard/settings" onClick={() => setStoreMenuOpen(false)} className="block px-3 py-2 text-[12px] hover:bg-white/5" style={{ color: "#E0F2FE" }}>Profile settings</Link>
                  <Link to="/dashboard/billing" onClick={() => setStoreMenuOpen(false)} className="block px-3 py-2 text-[12px] hover:bg-white/5" style={{ color: "#E0F2FE" }}>Plan & billing</Link>
                  <Link to="/dashboard/embed" onClick={() => setStoreMenuOpen(false)} className="block px-3 py-2 text-[12px] hover:bg-white/5" style={{ color: "#E0F2FE" }}>Embed & share</Link>
                  
                </div>
                <div className="border-t py-1" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <button
                    onClick={async () => { setStoreMenuOpen(false); await supabase.auth.signOut(); window.location.href = "/"; }}
                    className="w-full text-left px-3 py-2 text-[12px] hover:bg-white/5"
                    style={{ color: "#FCA5A5" }}
                  >
                    Log out
                  </button>
                </div>
              </div>
            </>
          )}
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
        <div className="px-3 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
          {!isPaid && (
            <Link to="/dashboard/billing" className="flex items-center justify-between px-2.5 py-2 rounded-md mb-2 text-[12px] font-medium transition" style={{ color: "#000", background: "#FFFFFF", border: "1px solid rgba(255,255,255,0.55)" }}>
              <span className="flex items-center gap-2"><Crown size={13} style={{ color: "#111111" }} /> Upgrade plan</span>
              <span style={{ color: "#000000" }}>→</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="px-4 sm:px-6 md:px-8 h-14 flex items-center justify-between sticky top-0 z-20"
          style={{ background: "#FFFFFF", borderBottom: "1px solid #E1E3E5" }}>
          <h2 className="text-[15px] font-semibold" style={{ color: "#1A1A1A", letterSpacing: "-0.01em" }}>{title}</h2>
          <div className="flex items-center gap-1.5 relative" ref={popRef}>
            {/* Notifications */}
            <button onClick={() => setOpenMenu(openMenu === "bell" ? null : "bell")} className="w-9 h-9 rounded-md grid place-items-center hover:bg-[#F1F2F4] transition relative" title="Notifications">
              <Bell size={16} style={{ color: "#4A4A4A" }} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "#111111" }} />
            </button>
            {/* FAQ / Help */}
            <button onClick={() => setOpenMenu(openMenu === "help" ? null : "help")} className="w-9 h-9 rounded-md grid place-items-center hover:bg-[#F1F2F4] transition" title="FAQ & Help">
              <HelpCircle size={16} style={{ color: "#4A4A4A" }} />
            </button>

            {/* Profile chip with name (desktop) */}
            <button onClick={() => setOpenMenu(openMenu === "profile" ? null : "profile")} className="ml-1 flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-[#F1F2F4] transition">
              <span className="w-7 h-7 rounded-full overflow-hidden grid place-items-center text-[11px] font-semibold" style={{ background: "#111111", color: "#fff" }}>
                {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initial}
              </span>
              <span className="hidden sm:inline text-[13px] font-semibold max-w-[140px] truncate" style={{ color: "#1A1A1A" }}>{displayName}</span>
              <ChevronDown size={13} className="hidden sm:inline" style={{ color: "#6B7280" }} />
            </button>

            {/* Popovers */}
            {openMenu === "bell" && (
              <div className="absolute right-0 top-12 w-80 rounded-xl overflow-hidden z-50" style={{ background: "#fff", border: "1px solid #E1E3E5", boxShadow: "0 20px 50px -20px rgba(2,132,199,0.35)" }}>
                <div className="px-4 py-3 text-[13px] font-semibold" style={{ background: "linear-gradient(135deg,#0B1220,#0369A1)", color: "#fff" }}>Notifications</div>
                <div className="divide-y" style={{ borderColor: "#F1F2F4" }}>
                  <NotifItem title="Welcome to Easibie" body="Upload your first product to start tracking try-ons." />
                  <NotifItem title="Tip: Glowing button" body="Turn on the glowing CTA in product customize for higher CTR." />
                  <NotifItem title="Analytics live" body="Customer engagement is now being tracked in real time." />
                </div>
                <div className="px-4 py-2 text-center text-[11px]" style={{ color: "#6B7280", background: "#F8FAFC" }}>You're all caught up.</div>
              </div>
            )}
            {openMenu === "help" && (
              <div className="absolute right-0 top-12 w-96 max-w-[92vw] rounded-xl overflow-hidden z-50" style={{ background: "#fff", border: "1px solid #E1E3E5", boxShadow: "0 20px 50px -20px rgba(2,132,199,0.35)" }}>
                <div className="px-4 py-3 flex items-center gap-2 text-[13px] font-semibold" style={{ background: "linear-gradient(135deg,#0B1220,#0369A1)", color: "#fff" }}>
                  <MessageCircleQuestion size={14} /> FAQ &amp; Help
                </div>
                <div className="max-h-80 overflow-y-auto p-2">
                  {FAQ_ITEMS.map((f) => (
                    <details key={f.q} className="rounded-lg p-2 hover:bg-[#F8FAFC]">
                      <summary className="cursor-pointer text-[12.5px] font-semibold list-none flex items-start gap-2" style={{ color: "#0B1220" }}>
                        <BookOpen size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#0EA5E9" }} /> {f.q}
                      </summary>
                      <p className="mt-1.5 pl-5 text-[12px] leading-relaxed" style={{ color: "#475569" }}>{f.a}</p>
                    </details>
                  ))}
                </div>
                <a href="mailto:support@easibie.app" className="block px-4 py-2.5 text-center text-[12px] font-semibold" style={{ background: "linear-gradient(135deg,#0369A1,#38BDF8)", color: "#fff" }}>Contact support</a>
              </div>
            )}
            {openMenu === "profile" && (
              <div className="absolute right-0 top-12 w-64 rounded-xl overflow-hidden z-50" style={{ background: "#fff", border: "1px solid #E1E3E5", boxShadow: "0 20px 50px -20px rgba(2,132,199,0.35)" }}>
                <div className="px-4 py-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg,#0B1220,#0369A1)", color: "#fff" }}>
                  <span className="w-10 h-10 rounded-full overflow-hidden grid place-items-center text-[14px] font-bold" style={{ background: "linear-gradient(135deg,#38BDF8,#0EA5E9)" }}>
                    {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold truncate">{displayName}</div>
                    <div className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.65)" }}>{user?.email}</div>
                  </div>
                </div>
                <div className="py-1">
                  <Link to="/dashboard/billing" onClick={() => setOpenMenu(null)} className="flex items-center justify-between px-4 py-2.5 text-[13px] font-medium hover:bg-[#F8FAFC]" style={{ color: "#0B1220" }}>
                    <span>Plan upgrade</span>
                    {!isPaid && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "linear-gradient(135deg,#0369A1,#38BDF8)", color: "#fff" }}>FREE</span>}
                  </Link>
                  <Link to="/dashboard/settings" onClick={() => setOpenMenu(null)} className="block px-4 py-2.5 text-[13px] font-medium hover:bg-[#F8FAFC]" style={{ color: "#0B1220" }}>
                    Profile update
                  </Link>
                  <button onClick={signOut} className="w-full text-left px-4 py-2.5 text-[13px] font-medium hover:bg-[#FEF2F2]" style={{ color: "#DC2626" }}>
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8" style={{ background: "#F5F5F5" }}>
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
      <AiChatbot />
    </div>
  );
}

function NotifItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="px-4 py-2.5 hover:bg-[#F8FAFC]">
      <div className="text-[12.5px] font-semibold" style={{ color: "#0B1220" }}>{title}</div>
      <div className="text-[11.5px] mt-0.5" style={{ color: "#64748B" }}>{body}</div>
    </div>
  );
}

export function DashboardLayoutRoute() {
  return <Outlet />;
}
