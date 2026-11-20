import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/use-auth";
import { MarketingShell } from "@/components/MarketingShell";
import {
  Sparkles, Camera, Wand2, Share2, ArrowRight, Check, Star, Shield,
  Palette, Layers, BarChart3, Globe, Users, Zap, MessageCircle, Sliders, CheckCircle2,
} from "lucide-react";
import demoBefore from "@/assets/demo-before.jpg";
import demoAfter from "@/assets/demo-after.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Easibie — AI Try-On, Simplified" },
      { name: "description", content: "AI-powered virtual try-on for modern commerce. Turn a single product photo into a photoreal try-on experience — in seconds." },
      { property: "og:title", content: "Easibie — AI Try-On, Simplified" },
      { property: "og:description", content: "AI-powered virtual try-on for modern commerce." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/dashboard" replace />;
  return (
    <MarketingShell>
      {/* ─────────── HERO ─────────── */}
      <section className="px-4 pt-6">
        <div className="mx-auto max-w-6xl card-soft px-6 md:px-14 pt-16 md:pt-20 pb-12 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-40 blob" style={{ background: "radial-gradient(circle, #C7BEEB, transparent 70%)" }} />
          <div className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full opacity-40 blob" style={{ background: "radial-gradient(circle, #A99BF0, transparent 70%)" }} />

          <div className="text-center relative">
            <div className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink">
              <span className="rating-stars text-[13px]">★★★★★</span>
              <span className="text-[#6B6689]">1,200+ Fashion Stores Live</span>
            </div>
            <h1 className="mt-5 text-ink font-extrabold leading-[1.02] tracking-[-0.04em]">
              AI-powered try-on<br />simplified with <span className="italic">Easibie</span>
            </h1>
            <p className="mt-6 text-[16px] text-[#6B6689] max-w-xl mx-auto">
              Enhance your storefront by leveraging AI to let shoppers preview clothing on their own photo — driving conversion, cutting returns by up to 38%, and delighting every customer.
            </p>
            <div className="mt-8">
              <Link to="/auth" search={{ mode: "signup" }} className="btn-primary">Get started for free</Link>
            </div>
          </div>

          {/* Product mock grid */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 rise">
            <CalendarCard />
            <TryOnTypeCard />
            <TimeSlotCard />
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-4">
            <SessionCard />
            <StylePanel />
          </div>
        </div>
      </section>

      {/* ─────────── ONE STOP SOLUTION ─────────── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="pill"><Sparkles size={12} /> One Stop Solution</span>
          <h2 className="mt-5 text-ink">Why Easibie?</h2>
          <p className="mt-5 text-[15px] text-[#6B6689] max-w-xl mx-auto">
            Whether you're a boutique label or a 10,000-SKU fashion brand, Easibie streamlines virtual try-on with zero 3D modeling required.
          </p>
        </div>

        <div className="mt-14 mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <WhyCard title="1-Click storefront connections" desc="Connect Shopify, WooCommerce, or custom storefronts with a single lightweight script tag that loads in milliseconds.">
            <ConnectionsGraphic />
          </WhyCard>
          <WhyCard title="Automatically detects garment context" desc="Sell across global markets? Easibie auto-detects international sizing, fabric drape physics, and skin-tone diversity effortlessly.">
            <WorldGraphic />
          </WhyCard>
          <WhyCard title="Add styling team members" desc="Carefully crafted for merchandising and styling teams with multi-user permissions, brand presets, and analytics.">
            <TeamGraphic />
          </WhyCard>
        </div>
      </section>

      {/* ─────────── LODGING-STYLE USE-CASE ─────────── */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl card-soft p-8 md:p-12 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              {[
                { icon: Palette, label: "Tailoring", active: true },
                { icon: Layers, label: "Streetwear" },
                { icon: Sparkles, label: "Eveningwear" },
                { icon: Users, label: "Athleisure" },
              ].map((t, i) => (
                <div key={i} className={`flex flex-col items-center gap-1 ${t.active ? "text-ink" : "text-[#8A83AB]"}`}>
                  <div className={`w-11 h-11 rounded-xl grid place-items-center ${t.active ? "bg-[#1F1747] text-white" : "bg-white border border-[#E4DEF7]"}`}>
                    <t.icon size={17} />
                  </div>
                  <span className="text-[11px] font-semibold">{t.label}</span>
                </div>
              ))}
            </div>
            <h2 className="text-ink">Fashion and apparel try-on made effortless.</h2>
            <p className="mt-4 text-[15px] text-[#6B6689] max-w-md">
              Streamline your storefront with Easibie — embed virtual fitting rooms on product pages, eliminate sizing doubts, and protect margins by cutting reverse logistics.
            </p>
            <Link to="/auth" search={{ mode: "signup" }} className="btn-primary mt-7">Get started for free</Link>
          </div>
          <PropertyMock />
        </div>
      </section>

      {/* ─────────── SOME MORE FEATURES ─────────── */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="pill"><Check size={12} /> Everything Covered</span>
          <h2 className="mt-5 text-ink">Some more Easibie features</h2>
        </div>
        <div className="mx-auto max-w-6xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATS.map((f) => (
            <FeatureTile key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* ─────────── PRICING ─────────── */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="pill"><Zap size={12} /> Pay as you grow</span>
          <h2 className="mt-5 text-ink">Pricing</h2>
          <p className="mt-4 text-[15px] text-[#6B6689] max-w-lg mx-auto">
            Choose a plan that fits your catalog size, offering predictable value to reduce returns and scale checkout conversions.
          </p>
        </div>
        <div className="mx-auto max-w-6xl mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map((t) => (
            <PricingTile key={t.name} {...t} />
          ))}
        </div>
      </section>

      {/* ─────────── TESTIMONIALS ─────────── */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="pill"><MessageCircle size={12} /> Reviews</span>
          <h2 className="mt-5 text-ink">What fashion brands say about Easibie</h2>
          <p className="mt-4 text-[15px] text-[#6B6689] max-w-lg mx-auto">
            Hear from retail founders and e-commerce leaders who have transformed customer checkout confidence with Easibie.
          </p>
        </div>
        <div className="mx-auto max-w-6xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
      </section>

      {/* ─────────── CTA ─────────── */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl card-soft p-14 text-center relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-40 blob" style={{ background: "radial-gradient(circle, #C7BEEB, transparent 70%)" }} />
          <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full opacity-40 blob" style={{ background: "radial-gradient(circle, #A99BF0, transparent 70%)" }} />
          <div className="relative">
            <h2 className="text-ink">Scale your <span className="italic">fashion brand</span></h2>
            <p className="mt-4 text-[15px] text-[#6B6689] max-w-md mx-auto">
              The ultimate AI virtual fitting room designed to eliminate sizing doubt and boost online apparel sales.
            </p>
            <Link to="/auth" search={{ mode: "signup" }} className="btn-primary mt-8">Get started for free</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

/* ─────────── HERO MOCKS ─────────── */

function CalendarCard() {
  return (
    <div className="rounded-2xl bg-white border border-[#E4DEF7] p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-[13px] font-bold text-ink">AI Drape Simulator</div>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#F3F0FE] text-[#1F1747]">1.4s Drape</span>
      </div>
      
      <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-900 border border-[#E4DEF7] mb-3">
        <img
          src={demoAfter}
          alt="AI Drape Result"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded">
          ✦ Tailored Blazer
        </div>
        <div className="absolute bottom-2 right-2 bg-white/95 text-ink text-[10.5px] font-bold px-2 py-0.5 rounded shadow-xs">
          Match: 99.4%
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#6B6689] pt-1">
        <span>True to body shape</span>
        <span className="font-semibold text-emerald-700 flex items-center gap-1">
          <Check size={12} /> Seams Aligned
        </span>
      </div>
    </div>
  );
}

function TryOnTypeCard() {
  return (
    <div className="rounded-2xl bg-white border border-[#E4DEF7] p-5 flex flex-col">
      <div className="text-[13px] font-bold text-ink mb-4">Shopper Fitting Mode</div>
      <label className="flex items-start gap-3 p-3 rounded-xl border border-[#1F1747] bg-[#F3F0FE]/40 mb-2 cursor-pointer">
        <span className="w-4 h-4 rounded-full border-[3px] border-[#1F1747] mt-0.5 shrink-0" />
        <div>
          <div className="text-[12.5px] font-bold text-ink flex items-center gap-1.5">
            Instant photo try-on
            <span className="text-[9.5px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">Active</span>
          </div>
          <div className="text-[11px] text-[#6B6689] mt-0.5">Shoppers upload a snapshot to see realistic garment draping in 1.4s.</div>
        </div>
      </label>
      <label className="flex items-start gap-3 p-3 rounded-xl border border-[#E4DEF7] cursor-pointer hover:bg-slate-50 transition">
        <span className="w-4 h-4 rounded-full border-2 border-[#C7BEEB] mt-0.5 shrink-0" />
        <div>
          <div className="text-[12.5px] font-semibold text-ink">In-store hangtag QR</div>
          <div className="text-[11px] text-[#8A83AB] mt-0.5">Shoppers scan physical tags to preview fits on mobile.</div>
        </div>
      </label>
      <div className="mt-auto pt-4">
        <Link
          to="/auth"
          search={{ mode: "signup" }}
          className="w-full bg-[#F3F0FE] border border-[#E4DEF7] hover:border-[#1F1747] rounded-xl px-3 py-2.5 text-[12px] font-semibold text-ink flex items-center justify-between transition"
        >
          Start your journey with AI
          <span className="w-6 h-6 rounded-full bg-[#1F1747] text-white grid place-items-center"><ArrowRight size={12} /></span>
        </Link>
      </div>
    </div>
  );
}

function TimeSlotCard() {
  const metrics = [
    { label: "Shoulder & Collar Fit", val: "99.4%" },
    { label: "Chest & Bust Tension", val: "98.8%" },
    { label: "Fabric Fold Realism", val: "97.9%" },
    { label: "Sleeve Inseam Drop", val: "96.5%" },
    { label: "Return Cost Saved", val: "-38%" },
  ];
  return (
    <div className="rounded-2xl bg-white border border-[#E4DEF7] p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="text-[13px] font-bold text-ink">Garment Fit Confidence</div>
          <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">98.6% Avg</span>
        </div>
        <div className="text-[11px] text-[#8A83AB] mb-3">
          Neural alignment calibration breakdown
        </div>
      </div>
      <div className="space-y-2">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={`px-3 py-2 rounded-xl text-[11.5px] flex items-center justify-between transition ${
              i === 0
                ? "bg-[#1F1747] text-white font-bold"
                : "bg-white border border-[#E4DEF7] text-[#4B4368] font-medium"
            }`}
          >
            <span>{m.label}</span>
            <span className={i === 0 ? "text-emerald-300 font-extrabold" : "text-blue-700 font-bold"}>
              {m.val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionCard() {
  return (
    <div className="rounded-2xl bg-white border border-[#E4DEF7] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[12px] font-bold text-ink">
          <Camera size={14} className="text-[#6C5CE7]" /> Live Fitting Activity
        </div>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          ● 420+ Stores Live
        </span>
      </div>
      <div className="flex gap-2 mb-3">
        {["Tailored Blazers", "Silk Dresses", "Raw Denim"].map((t, i) => (
          <div
            key={t}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold ${
              i === 0
                ? "bg-[#1F1747] text-white"
                : "bg-[#F3F0FE] text-[#4B4368] border border-[#E4DEF7]"
            }`}
          >
            {t}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 pt-3 border-t border-[#E4DEF7]">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
          alt="Sarah Jenkins"
          className="w-10 h-10 rounded-full object-cover border border-[#E4DEF7]"
        />
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-bold text-ink truncate">Elena Rowe</div>
          <div className="text-[10.5px] text-[#8A83AB] truncate">Head of E-Commerce • Atelier V</div>
        </div>
        <span className="text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
          Verified Brand
        </span>
      </div>
    </div>
  );
}

function StylePanel() {
  return (
    <div className="rounded-2xl bg-white border border-[#E4DEF7] p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[13px] font-bold text-ink">Storefront Widget Style</div>
        <span className="text-[10.5px] font-semibold text-[#8A83AB]">Live Customizer</span>
      </div>
      <div className="text-[11px] text-[#8A83AB] mb-3">Customize button & modal styling to match your brand</div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-[#1F1747] bg-[#F3F0FE]/30">
          <span className="text-[11.5px] font-mono font-bold text-ink">#1F1747</span>
          <span className="w-5 h-5 rounded-full bg-[#1F1747] border border-white shadow-xs" />
        </div>
        <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-[#E4DEF7]">
          <span className="text-[11.5px] font-mono font-bold text-ink">#6C5CE7</span>
          <span className="w-5 h-5 rounded-full bg-[#6C5CE7] border border-white shadow-xs" />
        </div>
      </div>

      <div className="pt-2 border-t border-[#E4DEF7]/70 flex items-center justify-between">
        <span className="text-[11px] text-[#8A83AB]">Button Preview:</span>
        <button className="px-3.5 py-1.5 rounded-full text-[11.5px] font-bold bg-[#1F1747] text-white shadow-xs flex items-center gap-1.5">
          <Sparkles size={11} /> Try It On With Easibie
        </button>
      </div>
    </div>
  );
}

/* ─────────── WHY EASIBIE ─────────── */

function WhyCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="card-tile p-6">
      <div className="h-44 rounded-xl bg-[#F3F0FE] border border-[#E4DEF7] overflow-hidden">{children}</div>
      <h4 className="mt-5 text-ink">{title}</h4>
      <p className="mt-2 text-[13px] text-[#6B6689]">{desc}</p>
    </div>
  );
}

function ConnectionsGraphic() {
  return (
    <div className="h-full grid place-items-center relative">
      <div className="grid grid-cols-3 grid-rows-3 gap-3 w-40 h-40">
        <div />
        <div className="w-10 h-10 rounded-full bg-[#38BDF8] grid place-items-center text-white text-[10px] font-bold">S</div>
        <div />
        <div className="w-10 h-10 rounded-full bg-[#F59E0B] grid place-items-center text-white text-[10px] font-bold">W</div>
        <div className="w-12 h-12 rounded-full bg-white border border-[#E4DEF7] grid place-items-center text-ink text-[10px] font-bold shadow float">✚</div>
        <div className="w-10 h-10 rounded-full bg-[#22C55E] grid place-items-center text-white text-[10px] font-bold">R</div>
        <div />
        <div className="w-10 h-10 rounded-full bg-[#6C5CE7] grid place-items-center text-white text-[10px] font-bold">E</div>
        <div />
      </div>
    </div>
  );
}

function WorldGraphic() {
  return (
    <div className="h-full grid place-items-center">
      <div className="relative w-52 h-32">
        <svg viewBox="0 0 200 100" className="w-full h-full opacity-70">
          {Array.from({length: 15}).map((_, y) => (
            Array.from({length: 30}).map((_, x) => (
              <circle key={`${x}-${y}`} cx={x*7} cy={y*7} r="1" fill="#A99BF0" />
            ))
          ))}
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#1F1747] grid place-items-center text-white float">
          <Globe size={16} />
        </div>
      </div>
    </div>
  );
}

function TeamGraphic() {
  return (
    <div className="h-full p-4 flex flex-col justify-center">
      <div className="text-[11px] font-semibold text-ink mb-2 flex items-center gap-1"><Users size={12} /> Styling & Merch Team</div>
      <div className="text-[10px] text-[#8A83AB] mb-3">Members (2/30)</div>
      {[
        { n: "Sarah Jenkins", t: "Catalog Lead • Active", r: "Admin", c: "#F59E0B" },
        { n: "David Chen", t: "Merchandise Stylist", r: "Staff", c: "#6C5CE7" },
      ].map((m) => (
        <div key={m.n} className="flex items-center gap-2 py-1.5">
          <div className="w-7 h-7 rounded-full" style={{ background: m.c }} />
          <div className="flex-1">
            <div className="text-[11px] font-bold text-ink leading-none">{m.n}</div>
            <div className="text-[9px] text-[#8A83AB] mt-0.5">{m.t}</div>
          </div>
          <span className="text-[9px] font-bold text-[#6B6689]">{m.r}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────── LODGING / USE CASE MOCK ─────────── */

function PropertyMock() {
  return (
    <div className="relative">
      <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-[#E4DEF7] relative shadow-md">
        <img
          src={demoAfter}
          alt="Easibie On-Body Drape Simulation"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute top-4 left-4 pill text-[10.5px] font-bold bg-white/95 text-ink shadow-xs">
          ✦ Photo Try-On · Live
        </div>
        <div className="absolute bottom-4 right-4 pill text-[10.5px] font-bold bg-slate-900/90 text-white border-white/20">
          1.4s Fast Drape
        </div>
      </div>
      <div className="absolute -top-4 -right-4 bg-white rounded-2xl border border-[#E4DEF7] px-4 py-3 shadow-md float">
        <div className="text-[10px] font-semibold text-[#8A83AB] uppercase tracking-wider">Storefront Results</div>
        <div className="text-[12.5px] font-extrabold text-ink flex items-center gap-1.5 mt-1">
          <Check size={14} className="text-[#22C55E]" /> -38% Returns Prevented
        </div>
      </div>
      <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl border border-[#E4DEF7] px-4 py-3 shadow-md flex items-center gap-2.5 float-y">
        <span className="w-8 h-8 rounded-lg bg-[#1F1747] text-white grid place-items-center">
          <Camera size={15} />
        </span>
        <div>
          <div className="text-[10px] font-semibold text-[#8A83AB]">Drape preview</div>
          <div className="text-[12.5px] font-bold text-ink">Photoreal on-body fit</div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── FEATURE TILES ─────────── */

const FEATS = [
  { icon: Shield, title: "Zero biometric storage", desc: "Customer photos are processed in temporary encrypted RAM and purged immediately after draping." },
  { icon: Users, title: "Instant multi-size drape", desc: "Shoppers preview how tailoring, sleeve lengths, and waistlines fit on their personal posture." },
  { icon: Wand2, title: "Photoreal fabric physics", desc: "Neural networks simulate weave tension, wool fold lines, and natural ambient lighting realistically." },
  { icon: Layers, title: "1-Click Shopify & store embed", desc: "Drop a single script tag into your product page template with zero developer friction." },
  { icon: Globe, title: "Global sizing intelligence", desc: "Supports international sizing charts, multi-currency stores, and diverse shopper body shapes seamlessly." },
  { icon: Shield, title: "In-store hangtag QR generator", desc: "Print QR codes on showroom tags so shoppers can scan and try on garments with their phone." },
];

function FeatureTile({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="card-tile p-6">
      <div className="w-11 h-11 rounded-xl bg-[#F3F0FE] grid place-items-center text-[#1F1747]">
        <Icon size={18} />
      </div>
      <h4 className="mt-5 text-ink text-[16px]">{title}</h4>
      <p className="mt-2 text-[13px] text-[#6B6689]">{desc}</p>
    </div>
  );
}

/* ─────────── PRICING ─────────── */

const TIERS: Tier[] = [
  {
    name: "Starter Pilot", price: "Free", note: "For fashion boutiques validating photo try-on with real shoppers.",
    highlight: false,
    features: ["250 photo try-on sessions", "10 active store garments", "Universal embed snippet", "Standard sizing report", "Community support", "Mobile & desktop optimized"],
  },
  {
    name: "Growth", price: "$18.99", note: "For emerging apparel brands scaling sales and reducing returns.",
    highlight: false,
    features: ["2,500 try-on sessions / mo", "Unlimited active garments", "Custom brand button colors", "Shopify 1-click sync", "Return reduction metrics", "Priority GPU queue"],
  },
  {
    name: "Elite", price: "$28.99", note: "For established clothing brands wanting full white-label experience.",
    highlight: true, popular: true,
    features: ["10,000 try-on sessions", "No Easibie branding", "In-store QR code generator", "Advanced fabric drape tuning", "Custom CSS styling", "Multi-seat team portal", "Priority support"],
  },
  {
    name: "Enterprise", price: "$39.99", note: "For high-volume retail teams needing custom APIs, SLAs, and dedicated compute.",
    highlight: false,
    features: ["Unlimited try-on sessions", "Headless React SDK", "Dedicated GPU cluster", "Custom AI drape training", "Dedicated account manager", "99.9% uptime SLA", "Custom invoicing"],
  },
];

type Tier = { name: string; price: string; note: string; highlight: boolean; popular?: boolean; features: string[] };

function PricingTile({ name, price, note, highlight, popular, features }: Tier) {
  return (
    <div className={`p-6 rounded-2xl relative flex flex-col ${highlight ? "bg-[#1F1747] text-white shadow-xl" : "bg-white border border-[#E4DEF7]"}`}>
      {popular && (
        <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-white text-[#1F1747] px-2.5 py-1 rounded-full shadow-xs">Popular</span>
      )}
      <div className={`text-[13px] font-bold uppercase tracking-wide ${highlight ? "text-[#C7BEEB]" : "text-[#6B6689]"}`}>{name}</div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className={`text-[36px] font-extrabold tracking-tight ${highlight ? "text-white" : "text-ink"}`}>{price}</span>
        {price !== "Free" && <span className={`text-[13px] ${highlight ? "text-[#C7BEEB]" : "text-[#8A83AB]"}`}>/month</span>}
      </div>
      <p className={`mt-3 text-[12.5px] ${highlight ? "text-[#D8D2F5]" : "text-[#6B6689]"}`}>{note}</p>
      <Link
        to="/auth"
        search={{ mode: "signup" }}
        className={`mt-5 w-full py-3 rounded-full text-[13px] font-bold text-center block transition ${highlight ? "bg-white text-[#1F1747] hover:bg-slate-100" : "bg-[#1F1747] text-white hover:bg-black"}`}
      >
        Get started for free
      </Link>
      <ul className="mt-6 space-y-2.5 flex-1">
        {features.map((f) => (
          <li key={f} className={`flex items-center gap-2 text-[13px] ${highlight ? "text-[#E8E4F9]" : "text-[#4B4368]"}`}>
            <Check size={13} className={highlight ? "text-[#C7BEEB]" : "text-[#1F1747]"} />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────── TESTIMONIALS ─────────── */

const TESTIMONIALS = [
  {
    name: "Marcus Vela",
    role: "Founder • Atelier V Menswear",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    brand: "Shopify Plus Brand",
    body: "Easibie transformed our product pages! Sizing returns dropped by 39% in our first month. Shoppers love uploading a photo and seeing the drape before completing checkout.",
  },
  {
    name: "Elena Rowe",
    role: "Head of E-Commerce • Northbeam Silk",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    brand: "Luxury Apparel",
    body: "Easibie has been a game-changer for our eveningwear line. Shoppers were always hesitant about slip dress sizing. Letting them preview it on their own body skyrocketed our checkout conversion rate.",
  },
  {
    name: "Raj Patel",
    role: "Co-Founder • Loop Denim Co.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    brand: "Contemporary Denim",
    body: "Installing the Shopify script took less than two minutes. The return cost savings directly boosted our net margins, and customer satisfaction has never been higher.",
  },
];

function TestimonialCard({ name, role, body, avatar, brand }: any) {
  return (
    <div className="card-tile p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <img
            src={avatar}
            alt={name}
            className="w-11 h-11 rounded-full object-cover border border-[#E4DEF7] shadow-xs"
          />
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-bold text-ink truncate">{name}</div>
            <div className="text-[11px] text-[#8A83AB] truncate">{role}</div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3F0FE] text-[#1F1747] shrink-0">
            {brand}
          </span>
        </div>
        <p className="text-[13px] text-[#4B4368] leading-relaxed italic">"{body}"</p>
      </div>
      <div className="mt-5 pt-3 border-t border-[#E4DEF7]/60 flex items-center justify-between text-[11px] text-[#8A83AB]">
        <div className="rating-stars text-[13px]">★★★★★</div>
        <span className="font-semibold text-emerald-700 flex items-center gap-1">
          <Check size={12} /> Verified Merchant
        </span>
      </div>
    </div>
  );
}
