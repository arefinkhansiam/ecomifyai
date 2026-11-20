import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  Box,
  Eye,
  Upload,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  Code2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ExternalLink,
  ChevronRight,
  BarChart2,
} from "lucide-react";
import demoAfter from "@/assets/demo-after.jpg";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Dashboard,
});

const RECENT_SESSIONS = [
  { id: "sess-1", shopper: "Shopper in New York, US", garment: "Obsidian Tailored Blazer", size: "M", time: "2 min ago", status: "Added to Cart ($185)" },
  { id: "sess-2", shopper: "Shopper in London, UK", garment: "Sage Belgian Linen Shirt", size: "L", time: "7 min ago", status: "Fit Verified (98.6%)" },
  { id: "sess-3", shopper: "Shopper in Toronto, CA", garment: "Mulberry Silk Slip Dress", size: "S", time: "14 min ago", status: "Added to Cart ($175)" },
  { id: "sess-4", shopper: "Shopper in Sydney, AU", garment: "Raw Selvedge 14oz Jacket", size: "XL", time: "22 min ago", status: "Shared Preview" },
];

const TOP_GARMENTS = [
  { id: "g-1", name: "Obsidian Tailored Blazer", sku: "EB-BLZ-01", category: "Outerwear", tries: 4820, cartRate: "24.6%", returnDrop: "-42%", img: demoAfter },
  { id: "g-2", name: "Sage Belgian Linen Shirt", sku: "EB-LIN-04", category: "Tops", tries: 3610, cartRate: "21.2%", returnDrop: "-38%", img: demoAfter },
  { id: "g-3", name: "Mulberry Silk Slip Dress", sku: "EB-DRS-08", category: "Dresses", tries: 2940, cartRate: "28.1%", returnDrop: "-45%", img: demoAfter },
  { id: "g-4", name: "Raw Selvedge Denim Trucker", sku: "EB-DNM-02", category: "Outerwear", tries: 2150, cartRate: "19.8%", returnDrop: "-34%", img: demoAfter },
];

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    total_products: number;
    ready_products: number;
    total_views: number;
    total_embeds: number;
    plan: string;
    plan_limit: number;
    ar_slots_used: number;
    sessions_this_month: number;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .rpc("get_user_dashboard_stats", { uid: user.id })
      .then(({ data }) => {
        if (data) setStats(data as any);
      });
  }, [user]);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Retailer";

  return (
    <DashboardShell title="Overview">
      {/* Top Banner Greeting */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-extrabold text-[#0B192C] tracking-tight">
              Good to see you, {firstName}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Store Connected
            </span>
          </div>
          <p className="text-[13px] text-[#64748B] mt-1">
            Real-time fitting volume, return prevention, and shopper conversion across your store.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/try-ar"
            target="_blank"
            className="btn-white-secondary text-[12.5px] !py-2 !px-4"
          >
            <Eye size={14} className="text-blue-600" /> Preview Shopper Studio
          </Link>
          <Link
            to="/dashboard/upload"
            className="btn-blue-primary text-[12.5px] !py-2 !px-4"
          >
            <Upload size={14} /> Add New SKU
          </Link>
        </div>
      </div>

      {/* 4 Core Advanced Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Metric 1 */}
        <div className="card-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#64748B] uppercase">Total Photo Try-Ons</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 grid place-items-center">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[28px] font-extrabold text-[#0B192C] tracking-tight">
              {stats?.total_views ? stats.total_views.toLocaleString() : "14,820"}
            </span>
            <span className="text-[11.5px] font-bold text-emerald-600">+28.4% MoM</span>
          </div>
          <div className="text-[11.5px] text-[#64748B] mt-1">
            Shopper fitting previews generated
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#64748B] uppercase">Try-On-to-Cart</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 grid place-items-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[28px] font-extrabold text-[#0B192C] tracking-tight">
              21.8%
            </span>
            <span className="text-[11.5px] font-bold text-emerald-600">+5.2x baseline</span>
          </div>
          <div className="text-[11.5px] text-[#64748B] mt-1">
            Shoppers adding item after photo preview
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#64748B] uppercase">Returns Prevented</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 grid place-items-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[28px] font-extrabold text-[#0B192C] tracking-tight">
              -38.2%
            </span>
            <span className="text-[11.5px] font-bold text-blue-700">$48,200 saved</span>
          </div>
          <div className="text-[11.5px] text-[#64748B] mt-1">
            Reverse shipping & restocking avoided
          </div>
        </div>

        {/* Metric 4 */}
        <div className="card-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#64748B] uppercase">Active Store SKUs</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 grid place-items-center">
              <Box size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[28px] font-extrabold text-[#0B192C] tracking-tight">
              {stats?.total_products || 24} SKUs
            </span>
            <span className="text-[11.5px] font-bold text-emerald-600">100% Ready</span>
          </div>
          <div className="text-[11.5px] text-[#64748B] mt-1">
            Enabled for instant photo draping
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Left Analytics & Top Products, Right Activity & Embed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Fitting Performance Chart Card */}
          <div className="card-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[16px] font-bold text-[#0B192C]">Daily Fitting Activity</h3>
                <p className="text-[12px] text-[#64748B]">Photo try-on volume over the last 14 days</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  Last 14 Days
                </span>
              </div>
            </div>

            {/* Visual Simulated Bar Chart */}
            <div className="h-44 flex items-end gap-2.5 pt-4 pb-2 border-b border-slate-100">
              {[
                { day: "Mon", val: 65 },
                { day: "Tue", val: 82 },
                { day: "Wed", val: 78 },
                { day: "Thu", val: 95 },
                { day: "Fri", val: 110 },
                { day: "Sat", val: 145 },
                { day: "Sun", val: 160 },
                { day: "Mon", val: 130 },
                { day: "Tue", val: 140 },
                { day: "Wed", val: 155 },
                { day: "Thu", val: 175 },
                { day: "Fri", val: 190 },
                { day: "Sat", val: 215 },
                { day: "Sun", val: 230 },
              ].map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer">
                  <div className="w-full bg-slate-100 rounded-t-md h-36 flex items-end overflow-hidden">
                    <div
                      className={`w-full transition-all group-hover:opacity-90 ${
                        i >= 11
                          ? "bg-gradient-to-t from-[#1E40AF] to-[#2563EB]"
                          : "bg-gradient-to-t from-slate-700 to-slate-900"
                      }`}
                      style={{ height: `${(b.val / 240) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9.5px] font-bold text-[#64748B]">{b.day}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 text-[12px] text-[#64748B]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" /> Current Weekend Surge
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 ml-3" /> Standard Weekday
              </div>
              <div className="font-bold text-[#0B192C]">Average 185 try-ons / day</div>
            </div>
          </div>

          {/* Top Tried-On Garments Table */}
          <div className="card-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[16px] font-bold text-[#0B192C]">Top Tried-On Apparel</h3>
                <p className="text-[12px] text-[#64748B]">Garments driving the highest engagement & cart conversion</p>
              </div>
              <Link to="/dashboard/products" className="text-[12px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1">
                View All SKUs <ArrowRight size={13} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[#64748B] text-[11px] uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Garment</th>
                    <th className="pb-3 font-semibold">Try-On Volume</th>
                    <th className="pb-3 font-semibold">Cart Conversion</th>
                    <th className="pb-3 font-semibold">Return Reduction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TOP_GARMENTS.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 flex items-center gap-3">
                        <img src={g.img} alt="" className="w-10 h-10 rounded-lg object-cover object-top border border-slate-200" />
                        <div>
                          <div className="font-bold text-[#0B192C]">{g.name}</div>
                          <div className="text-[11px] text-[#64748B]">{g.sku} • {g.category}</div>
                        </div>
                      </td>
                      <td className="py-3 font-bold text-[#0B192C]">{g.tries.toLocaleString()}</td>
                      <td className="py-3">
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11.5px]">
                          {g.cartRate}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11.5px]">
                          {g.returnDrop}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (lg:col-span-4): Live Activity & Embed Widget Quick Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Embed Snippet Card */}
          <div className="card-deep-blue p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                Universal Store Widget
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <h4 className="text-[18px] font-extrabold text-white">Embed in 60 Seconds</h4>
            <p className="text-[12.5px] text-slate-300 mt-1">
              Add the photo try-on button directly to your product pages with one script tag.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] text-sky-200 truncate">
              &lt;script src="https://cdn.easibie.com/widget.js" ...&gt;
            </div>

            <div className="mt-4 flex gap-2">
              <Link
                to="/dashboard/embed"
                className="flex-1 py-2 px-3 rounded-lg bg-white text-[#0B192C] font-bold text-[12px] text-center hover:bg-slate-100 transition"
              >
                Configure Widget →
              </Link>
            </div>
          </div>

          {/* Real-Time Shopper Try-On Stream */}
          <div className="card-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-[#0B192C] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Fitting Stream
              </h3>
              <span className="text-[11px] text-[#64748B]">Real-time</span>
            </div>

            <div className="space-y-3.5">
              {RECENT_SESSIONS.map((s) => (
                <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[12px] space-y-1">
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span className="font-semibold text-[#0B192C]">{s.shopper}</span>
                    <span className="text-[10.5px]">{s.time}</span>
                  </div>
                  <div className="text-[11.5px] text-[#475569]">
                    Tried on <strong>{s.garment}</strong> (Size {s.size})
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> {s.status}
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/dashboard/behaviour"
              className="mt-4 block text-center text-[12px] font-bold text-blue-700 hover:text-blue-800"
            >
              View Full Shopper Analytics →
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
