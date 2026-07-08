import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/use-auth";
import { MarketingShell } from "@/components/MarketingShell";
import {
  Search, Bell, Moon, LayoutDashboard, ShoppingBag, Heart, Users, Compass,
  FileText, Lock, TrendingUp, TrendingDown, ChevronDown, ArrowUpRight,
  Shield, Smartphone, BarChart3, Link as LinkIcon,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Easibie — AI Photo Try-On for E-Commerce" },
      { name: "description", content: "The ultimate AI try-on platform designed to revolutionize the way you sell fashion, jewellery, furniture and makeup online." },
      { property: "og:title", content: "Easibie — AI Photo Try-On for E-Commerce" },
      { property: "og:description", content: "Precision AI try-on at your fingertips." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/dashboard" replace />;
  return (
    <MarketingShell>
      {/* HERO */}
      <section className="px-4 pt-4">
        <div className="mx-auto max-w-6xl rounded-[28px] bg-white border border-[#EEF0F3] px-6 md:px-14 pt-16 md:pt-24 pb-10">
          <h1 className="text-center text-ink font-black leading-[1.05] tracking-[-0.035em]">
            Precision Try-On at<br />
            <span className="text-[#2563EB]">Your Fingertips</span>
          </h1>
          <p className="mt-6 text-center text-[15px] md:text-[16px] text-[#6B7280] max-w-xl mx-auto">
            The ultimate AI Try-On platform designed to revolutionize
            the way you sell online.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/auth" search={{ mode: "signup" }} className="btn-primary">Get Started</Link>
            <Link to="/about" className="px-5 py-3 rounded-full bg-white border border-[#E5E7EB] text-[14px] font-semibold text-ink hover:border-[#9CA3AF] transition">Contact Us</Link>
          </div>

          {/* Dashboard mock */}
          <div className="mt-14">
            <DashboardMock />
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="px-4 py-20">
        <h2 className="text-center text-ink">
          Trusted by these<br />
          <span className="text-[#2563EB]">& 1000 More</span>
        </h2>
        <div className="mt-12 mx-auto max-w-5xl grid grid-cols-3 md:grid-cols-6 gap-8 items-center justify-items-center opacity-70">
          {["Framer","slack","GitHub","asana","Google","stripe"].map((b) => (
            <div key={b} className="text-[22px] font-bold text-[#9CA3AF]">{b}</div>
          ))}
        </div>
      </section>

      {/* Discover better experience */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-ink">Discover a Better Experience</h2>
          <p className="mt-4 text-[15px] text-[#6B7280] max-w-md mx-auto">
            The ultimate AI Try-On platform designed to revolutionize the way you sell online.
          </p>
        </div>

        <div className="mt-16 mx-auto max-w-6xl grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-ink">The Best Dashboard you'll ever use.</h2>
            <p className="mt-4 text-[15px] text-[#6B7280] max-w-md">
              Join countless satisfied users who have embraced Easibie as the go-to solution for
              maximizing productivity and efficiency.
            </p>
            <ul className="mt-6 space-y-3">
              {["Engagement","Productivity","Retention"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-[15px] text-ink font-medium">
                  <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white grid place-items-center text-[11px]">✓</span>
                  {t}
                </li>
              ))}
            </ul>
            <button className="mt-8 btn-primary">Learn More</button>
          </div>
          <div>
            <DashboardMock compact />
          </div>
        </div>

        <div className="mt-24 mx-auto max-w-6xl grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <CircleStat />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-ink">Enjoy the Convenience of Modern Tools, Including Video Genius</h2>
            <p className="mt-4 text-[15px] text-[#6B7280] max-w-md">
              Join countless satisfied users who have embraced Easibie as the go-to solution for
              maximizing productivity and efficiency.
            </p>
            <button className="mt-8 btn-primary">Learn More</button>
          </div>
        </div>
      </section>

      {/* Best Feature Always */}
      <section className="px-4 py-20 bg-[#F3F4F6]">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-ink">Best Feature <span className="text-[#2563EB]">Always</span></h2>
          <p className="mt-4 text-[15px] text-[#6B7280] max-w-lg mx-auto">
            Easibie protects your brand with a world-class try-on system that detects fit issues
            and prevents returns. Safeguard your account.
          </p>
        </div>

        <div className="mt-14 mx-auto max-w-6xl grid md:grid-cols-3 gap-6">
          <FeatureCard title="Secure Interface" desc="Gain a comparative edge with our AI try-on tools, ensuring your store converts.">
            <div className="flex items-center justify-center">
              <CircleStat small />
            </div>
          </FeatureCard>
          <FeatureCard title="Multi-Device Access" desc="Gain a comparative edge with our AI try-on tools, ensuring your store converts.">
            <TeamGraph />
          </FeatureCard>
          <FeatureCard title="90% Accurate Report" desc="Gain a comparative edge with our AI try-on tools, ensuring your store converts.">
            <MiniEarnings />
          </FeatureCard>
        </div>
      </section>

      {/* Scale your Business */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-ink">Scale your <span className="text-[#2563EB]">Business</span></h2>
          <p className="mt-4 text-[15px] text-[#6B7280] max-w-md mx-auto">
            The ultimate AI Try-On platform designed to revolutionize the way you sell online.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/auth" search={{ mode: "signup" }} className="btn-primary">Get Started</Link>
            <Link to="/about" className="px-5 py-3 rounded-full bg-white border border-[#E5E7EB] text-[14px] font-semibold text-ink hover:border-[#9CA3AF] transition">Contact Us</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

function DashboardMock({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-2xl border border-[#EEF0F3] bg-white shadow-[0_20px_50px_-30px_rgba(15,23,42,0.15)] overflow-hidden">
      <div className="flex">
        {/* sidebar */}
        <aside className="w-[180px] shrink-0 border-r border-[#F1F2F5] p-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-lg bg-[#E9E5FF] grid place-items-center text-[#7C6BE8] text-xs font-bold">◐</div>
            <span className="font-bold text-ink text-[15px]">Fintech</span>
          </div>
          <ul className="space-y-1 text-[13px]">
            {[
              { icon: LayoutDashboard, label: "Dashboard", active: true },
              { icon: ShoppingBag, label: "Sale" },
              { icon: Heart, label: "Favorite" },
              { icon: Users, label: "Community" },
              { icon: Compass, label: "Explore" },
              { icon: FileText, label: "Document" },
              { icon: Lock, label: "Privacy" },
            ].map(({ icon: Icon, label, active }) => (
              <li key={label}>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${active ? "bg-[#EDE7FF] text-[#7C6BE8] font-semibold" : "text-[#6B7280]"}`}>
                  <Icon size={15} />
                  {label}
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* main */}
        <div className="flex-1 p-5">
          {/* search bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-[#F1F2F5] bg-[#FAFAFB]">
              <Search size={14} className="text-[#9CA3AF]" />
              <input placeholder="Search (Ctrl+/)" className="bg-transparent outline-none text-[13px] flex-1 text-[#6B7280]" />
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full border border-[#F1F2F5] grid place-items-center"><Moon size={14} className="text-[#6B7280]" /></button>
              <button className="w-8 h-8 rounded-full border border-[#F1F2F5] grid place-items-center relative">
                <Bell size={14} className="text-[#6B7280]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] grid place-items-center font-bold">4</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-[#E5E7EB]" />
            </div>
          </div>

          <div className={`grid ${compact ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
            {/* Earnings card */}
            <div className="rounded-xl border border-[#F1F2F5] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-ink text-[14px]">Earning Reports</div>
                  <div className="text-[11px] text-[#9CA3AF] mt-0.5">Weekly Earnings Overview</div>
                </div>
                <div className="text-[#9CA3AF]">⋯</div>
              </div>
              <div className="mt-4 flex items-end gap-4">
                <div>
                  <div className="text-[22px] font-black text-ink">$468.780</div>
                  <div className="text-[11px] text-[#10B981] font-semibold mt-1">↑ 4.2%</div>
                </div>
                <div className="flex-1 flex items-end justify-end gap-1 h-16">
                  {[30,50,40,60,45,90,55].map((h,i)=>(
                    <div key={i} className="w-3 rounded-t-sm" style={{ height: `${h}%`, background: i===5?"#2563EB":"#E9E5FF" }} />
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
                {[
                  { l: "Earnings", v: "$545.69", c: "#F59E0B" },
                  { l: "Profit", v: "$256.34", c: "#10B981" },
                  { l: "Expense", v: "$74.19", c: "#EF4444" },
                ].map((s) => (
                  <div key={s.l} className="rounded-lg border border-[#F1F2F5] p-2">
                    <div className="text-[#9CA3AF]">{s.l}</div>
                    <div className="font-bold text-ink text-[13px] mt-0.5">{s.v}</div>
                    <div className="h-0.5 mt-2 rounded-full" style={{ background: s.c }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Tracker card */}
            {!compact && (
              <div className="rounded-xl border border-[#F1F2F5] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-ink text-[14px]">Tracker list</div>
                    <div className="text-[11px] text-[#9CA3AF] mt-0.5">Last 7 Days</div>
                  </div>
                  <div className="text-[#9CA3AF]">⋯</div>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex-1 space-y-2 text-[11px]">
                    <div className="font-black text-[22px] text-ink leading-none">164</div>
                    <div className="text-[#9CA3AF]">Total Tickets</div>
                    <Row label="New Tickets" v="142" />
                    <Row label="Open Tickets" v="28" />
                    <Row label="Response Time" v="1 Day" />
                  </div>
                  <CircleStat small />
                </div>
              </div>
            )}
          </div>

          {!compact && (
            <div className="mt-4 rounded-xl border border-[#F1F2F5] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-ink text-[14px]">Projects</div>
                <div className="flex-1 max-w-[200px] ml-4 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#F1F2F5]">
                  <Search size={12} className="text-[#9CA3AF]" />
                  <input placeholder="Search" className="bg-transparent outline-none text-[12px] flex-1" />
                </div>
              </div>
              <div className="grid grid-cols-[24px_1fr_120px_120px_120px] gap-3 text-[11px] text-[#9CA3AF] pb-2 border-b border-[#F1F2F5]">
                <div /><div>Name ⇅</div><div>Leader ⇅</div><div>Team</div><div>Status ⇅</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, v }: { label: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-t border-[#F1F2F5] pt-1.5">
      <span className="text-[#6B7280]">{label}</span>
      <span className="font-semibold text-ink">{v}</span>
    </div>
  );
}

function CircleStat({ small = false }: { small?: boolean }) {
  const size = small ? 96 : 160;
  const stroke = small ? 8 : 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="grid place-items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} stroke="#EEF0F3" strokeWidth={stroke} fill="none" />
          <circle cx={size/2} cy={size/2} r={r} stroke="#A78BFA" strokeWidth={stroke} fill="none"
            strokeDashoffset={c*0.15} strokeLinecap="round" style={{ strokeDasharray: "6 8" }} />

        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className={`font-black text-ink ${small ? "text-lg" : "text-3xl"}`}>85%</div>
            {!small && <div className="text-[11px] text-[#9CA3AF] mt-1">Completed Task</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border border-[#EEF0F3] p-6">
      <div className="h-40 mb-6">{children}</div>
      <div className="flex items-center gap-2 mb-2">
        <LinkIcon size={14} className="text-[#2563EB]" />
        <h3 className="text-[16px] font-bold text-ink">{title}</h3>
      </div>
      <p className="text-[13px] text-[#6B7280]">{desc}</p>
    </div>
  );
}

function TeamGraph() {
  return (
    <div className="h-full grid place-items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#E5E7EB] grid place-items-center text-[10px] text-[#6B7280]">Shakib</div>
        <div className="flex gap-8">
          <div className="w-10 h-10 rounded-full bg-[#E5E7EB] grid place-items-center text-[9px] text-[#6B7280]">Hazard</div>
          <div className="w-10 h-10 rounded-full bg-[#E5E7EB] grid place-items-center text-[9px] text-[#6B7280]">David L</div>
        </div>
      </div>
    </div>
  );
}

function MiniEarnings() {
  return (
    <div className="h-full rounded-xl border border-[#F1F2F5] p-3">
      <div className="text-[12px] font-bold text-ink">Earning Reports</div>
      <div className="text-[10px] text-[#9CA3AF]">Weekly Earnings Overview</div>
      <div className="mt-2 flex items-end gap-3">
        <div>
          <div className="text-[16px] font-black text-ink">$468.780</div>
          <div className="text-[9px] text-[#10B981] font-semibold">↑ 4.2%</div>
        </div>
        <div className="flex-1 flex items-end justify-end gap-1 h-10">
          {[30,50,40,60,45,90,55].map((h,i)=>(
            <div key={i} className="w-2 rounded-t-sm" style={{ height: `${h}%`, background: i===5?"#2563EB":"#E9E5FF" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
