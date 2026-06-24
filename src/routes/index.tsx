import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/use-auth";
import { Tag, Check as CheckIcon } from "lucide-react";
import {
  Sparkles, Play, Star, UploadCloud, ImagePlus, Wand2, Share2,
  Shirt, Sofa, Gem, Brush, Smartphone, BarChart2, Link as LinkIcon, ShieldCheck,
  Palette, Layers, Zap, Eye, Cpu, Globe2, Wand, MousePointer2,
} from "lucide-react";
import { MarketingShell } from "@/components/MarketingShell";
import { FeatureCard } from "@/components/FeatureCard";
import { PricingCards } from "@/components/PricingCards";
import { StatCounter } from "@/components/StatCounter";
import { ReviewCarousel } from "@/components/ReviewCarousel";
import { InlineTryOnDemo } from "@/components/InlineTryOnDemo";
import demoBefore from "@/assets/demo-before.jpg";
import demoAfter from "@/assets/demo-after.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Easibie — AI Photo Try-On for E-Commerce" },
      { name: "description", content: "Upload product photos. Shoppers upload their own photo. Our AI generates a photoreal try-on in seconds — fashion, jewellery, furniture and makeup." },
      { property: "og:title", content: "Easibie — AI Photo Try-On for E-Commerce" },
      { property: "og:description", content: "Photoreal try-on from a single photo. No app, no complex modeling." },
    ],
  }),
  component: Landing,
});

const GRAD = "linear-gradient(135deg, #0B1220 0%, #0369A1 50%, #38BDF8 100%)";

function Landing() {
  const { user, loading } = useAuth();
  // Signed-in users land directly in the dashboard
  if (!loading && user) return <Navigate to="/dashboard" replace />;
  return (
    <MarketingShell>
      {/* HERO — white → ocean-blue gradient */}
      <section className="relative min-h-[calc(100vh-72px)] flex items-center overflow-hidden" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #E0F2FE 45%, #7DD3FC 100%)" }}>
        {/* 3D animated blobs */}
        <div aria-hidden className="absolute -top-32 -left-24 w-[420px] h-[420px] blob opacity-60" style={{ background: "radial-gradient(circle at 30% 30%, #38BDF8, #0369A1 70%)" }} />
        <div aria-hidden className="absolute -bottom-32 -right-24 w-[480px] h-[480px] blob opacity-50" style={{ background: "radial-gradient(circle at 60% 40%, #A78BFA, #EC4899 70%)", animationDelay: "-6s" }} />
        <div aria-hidden className="absolute top-1/3 right-10 w-[260px] h-[260px] blob opacity-40 hidden md:block" style={{ background: "radial-gradient(circle at 50% 50%, #34D399, #06B6D4 70%)", animationDelay: "-12s" }} />
        {/* floating 3D shapes */}
        <motion.div aria-hidden className="absolute top-24 right-[12%] hidden md:block" animate={{ y: [0, -18, 0], rotate: [0, 10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
          <div className="w-20 h-20 rounded-2xl shadow-2xl gradient-shift" style={{ backgroundImage: "linear-gradient(135deg,#0EA5E9,#A78BFA,#EC4899)", transform: "rotate(15deg) perspective(600px) rotateY(20deg)" }} />
        </motion.div>
        <motion.div aria-hidden className="absolute bottom-32 left-[8%] hidden md:block" animate={{ y: [0, 16, 0], rotate: [0, -8, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}>
          <div className="w-16 h-16 rounded-full pulse-glow" style={{ background: "linear-gradient(135deg,#FBBF24,#F97316)" }} />
        </motion.div>
        <motion.div aria-hidden className="absolute top-40 left-[14%] hidden lg:block spin-slow" animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
          <div className="w-12 h-12 rounded-xl gradient-shift" style={{ backgroundImage: "linear-gradient(135deg,#34D399,#06B6D4,#0369A1)" }} />
        </motion.div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 900px 600px at 50% 0%, rgba(255,255,255,0.7), transparent 70%)" }} />
        <div className="mx-auto max-w-6xl px-6 pt-32 md:pt-36 pb-20 text-center relative w-full">
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[44px] sm:text-[68px] md:text-[88px] order-1"
            style={{ backgroundImage: "linear-gradient(180deg, #0B1220 0%, #0369A1 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
          >
            Try It On.<br/>From One Photo.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-12 relative rounded-3xl overflow-hidden max-w-2xl"
            style={{ boxShadow: "0 60px 120px -30px rgba(3,105,161,0.45)", border: "1px solid rgba(3,105,161,0.2)" }}
          >
            <div className="grid grid-cols-2">
              <img src={demoBefore} alt="Shopper photo" className="w-full h-[260px] sm:h-[340px] object-cover" />
              <img src={demoAfter} alt="AI try-on result" className="w-full h-[260px] sm:h-[340px] object-cover" />
            </div>
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-white" style={{ background: "rgba(2,6,12,0.7)", backdropFilter: "blur(8px)" }}>Before</div>
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-white" style={{ background: GRAD }}>After</div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-8 max-w-2xl mx-auto text-[16px] sm:text-[18px] text-slate-700"
          >
            The best AI try-on for e-commerce — turn product photos into photoreal try-ons your shoppers can see on themselves in seconds.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-10 flex justify-center"
          >
            <Link
              to="/try-ar"
              className="inline-flex items-center gap-3 rounded-full font-bold text-base px-8 py-4 transition-transform hover:-translate-y-0.5"
              style={{ background: GRAD, color: "#fff", boxShadow: "0 25px 60px -15px rgba(56,189,248,0.7), 0 0 0 2px rgba(56,189,248,0.4)" }}
            >
              Try it yourself <Play size={16} fill="currentColor" />
            </Link>
          </motion.div>

          <div className="mt-12 flex items-center justify-center gap-4 flex-wrap">
            <div className="flex -space-x-3">
              {[
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=faces",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=faces",
              ].map((src, i) => (
                <img key={i} src={src} alt="" loading="lazy" className="w-9 h-9 rounded-full object-cover border-2" style={{ borderColor: "#ffffff" }} />
              ))}
            </div>
            <div className="text-sm font-medium text-slate-700">10,000+ stores</div>
            <div className="flex gap-1">{[0,1,2,3,4].map(i => <Star key={i} size={14} style={{ color: "#0369A1" }} fill="currentColor" />)}</div>
          </div>
        </div>

      </section>

      {/* STATS */}
      <section className="bg-surface/60 backdrop-blur-sm py-16">
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
          <StatCounter target={10000} suffix="+" label="Active Stores" />
          <StatCounter target={2400000} suffix="+" label="Try-Ons Generated" />
          <StatCounter target={30} suffix="%" label="Avg Sales Increase" />
          <StatCounter target={5} suffix="s" label="To Generate a Try-On" />
        </div>
      </section>

      {/* LIVE TRY-IT-YOURSELF DEMO */}
      <section id="demo" className="py-20" style={{ background: "linear-gradient(180deg, transparent, rgba(2,132,199,0.08), transparent)" }}>
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="mt-5 text-gradient-ocean">Try It Yourself, Right Here.</h2>
            <p className="mt-4">Pick a sample product, upload one photo of yourself or your room — see the AI result in seconds.</p>
          </div>
          <InlineTryOnDemo />
        </div>
      </section>


      {/* HOW IT WORKS */}
      <section id="how" className="py-24" style={{ background: "linear-gradient(180deg, transparent, rgba(2,132,199,0.06), transparent)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-gradient-ocean">How Easibie Works</h2>
            <p className="mt-4">Three photos. One AI. Zero hardware.</p>
          </div>
          <div className="mt-16 relative">
            <div className="hidden md:block absolute top-7 left-[16.66%] right-[16.66%] h-[2px]" style={{ background: "linear-gradient(90deg, #0B1220, #0369A1, #38BDF8)" }} />
            <div className="md:hidden absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px]" style={{ background: "linear-gradient(180deg, #0B1220, #0369A1, #38BDF8)" }} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 relative">
              {[
                { n: 1, icon: UploadCloud, title: "Upload product photos", desc: "Add front, back, side and detail shots. More angles = a more accurate try-on." },
                { n: 2, icon: ImagePlus, title: "Shopper adds their photo", desc: "They snap or upload one photo of themselves, their face, or their room." },
                { n: 3, icon: Wand2, title: "AI generates the try-on", desc: "Gemini composes a photorealistic result in seconds — share, embed, sell." },
              ].map((s, i) => (
                <motion.div key={s.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                  className="flex flex-col items-center text-center relative">
                  <div className="w-14 h-14 rounded-full grid place-items-center font-display font-extrabold text-xl text-white relative z-10"
                    style={{ background: GRAD, boxShadow: "0 14px 30px -8px rgba(2,132,199,0.55)", border: "4px solid #ffffff" }}>{s.n}</div>
                  <div className="mt-6 w-full rounded-2xl p-6"
                    style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(14px)", border: "1px solid rgba(2,132,199,0.18)", boxShadow: "0 18px 40px -22px rgba(2,132,199,0.35)" }}>
                    <div className="w-12 h-12 rounded-xl grid place-items-center mx-auto" style={{ background: GRAD, boxShadow: "0 12px 28px -10px rgba(2,132,199,0.55)" }}>
                      <s.icon size={22} color="#ffffff" strokeWidth={2.2} />
                    </div>
                    <h3 className="mt-4 font-display font-bold text-[18px] leading-tight"
                      style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{s.title}</h3>
                    <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-gradient-ocean">Built for Every Catalogue</h2>
            <p className="mt-4">One pipeline. Four ways to try on.</p>
          </div>
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Shirt, t: "Fashion", d: "T-shirts, dresses, jackets, bottoms — fit them onto the shopper's own photo." },
              { icon: Gem, t: "Jewellery & Accessories", d: "Place necklaces, rings, watches, bags and glasses with realistic scale and shadow." },
              { icon: Sofa, t: "Furniture & Decor", d: "Drop sofas, chairs and lamps into a photo of the shopper's actual room." },
              { icon: Brush, t: "Makeup", d: "Match lipstick, eyeshadow and blush shades to a selfie — finish and opacity preserved." },
            ].map((u) => (
              <div key={u.t} className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(14px)", border: "1px solid rgba(2,132,199,0.18)", boxShadow: "0 18px 40px -22px rgba(2,132,199,0.35)" }}>
                <div className="w-11 h-11 rounded-xl grid place-items-center text-white" style={{ background: GRAD }}>
                  <u.icon size={18} />
                </div>
                <div className="mt-3 font-display font-bold text-ink">{u.t}</div>
                <p className="mt-1 text-sm" style={{ color: "var(--ink-soft)" }}>{u.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24" style={{ background: "linear-gradient(180deg, transparent, rgba(2,132,199,0.06), transparent)" }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-gradient-ocean">Everything You Need to Sell</h2>
            <p className="mt-4">No complex pipeline. No specialist. Just upload and share.</p>
          </div>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={UploadCloud} title="Multi-Angle Capture" description="Add as many angles as you have — front, back, side, detail. Our AI uses them all to render an accurate try-on." accent="primary" delay={0} />
            <FeatureCard icon={Wand2} title="AI Photo Composition" description="Powered by Google Gemini. Photorealistic results that preserve the shopper's face, pose, lighting and background." accent="cyan" delay={0.1} />
            <FeatureCard icon={Smartphone} title="Works On Any Phone" description="No headset. No app install. Shoppers upload a photo from any browser and see results in seconds." accent="primary" delay={0.2} />
            <FeatureCard icon={LinkIcon} title="One Link + QR Per Product" description="Share a try-on link or scan-to-try QR code. Embed the widget on any online store." accent="cyan" delay={0.3} />
            <FeatureCard icon={BarChart2} title="Try-On Analytics" description="Track sessions, devices, conversions and bounce — see which products move the needle." accent="primary" delay={0.4} />
            <FeatureCard icon={ShieldCheck} title="Private & Secure" description="Shopper photos are processed for the try-on and never used for training. Enterprise-grade storage." accent="cyan" delay={0.5} />
          </div>
        </div>
      </section>

      {/* PROOF / WHY IT WORKS */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl p-8 md:p-14 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0B1220 0%, #0369A1 55%, #38BDF8 100%)", boxShadow: "0 40px 100px -30px rgba(2,132,199,0.55)" }}>
            <div className="relative">
              <span className="pill" style={{ background: "rgba(255,255,255,0.14)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.25)" }}>Why photo try-on wins</span>
              <h2 className="mt-6 text-white">Better than camera filters. Easier than a fitting room.</h2>
              <p className="mt-5 text-white/85 text-[17px] leading-relaxed max-w-3xl">
                Camera-based previews are fiddly: shoppers have to install apps, stand a certain distance away and hold still. Photo try-on just works — one photo of the shopper, one photo of your product, one shareable result.
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { t: "Higher conversion", d: "Shoppers who see themselves wearing a product convert at significantly higher rates." },
                  { t: "Fewer returns", d: "Realistic fit and shade preview cuts wrong-size and wrong-colour returns." },
                  { t: "Zero friction", d: "No app, no special device support required. If the shopper can upload a photo, they can try on." },
                ].map((f) => (
                  <div key={f.t} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}>
                    <div className="font-display font-bold text-white">{f.t}</div>
                    <p className="mt-2 text-sm text-white/85">{f.d}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/auth" search={{ mode: "signup" }} className="btn-primary" style={{ background: "#fff", color: "var(--primary)" }}>Start Free — No Card</Link>
                <Link to="/try-ar" className="btn-ghost" style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.35)" }}>See It in Action</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING — white, monday/slack inspired */}
      <section id="pricing" className="py-24 relative" style={{ background: "#FFFFFF" }}>
        <div className="mx-auto max-w-7xl px-6 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-extrabold tracking-tight text-slate-900 text-4xl sm:text-6xl leading-[1.05]">
              Choose a plan built for your store.
            </h2>
            <p className="mt-5 text-[17px] text-slate-600">
              Or start with the basics for free, and upgrade at any time.
            </p>
          </div>
          <PricingCards />
          <p className="text-center text-sm text-slate-500 mt-10">All paid plans include a 7-day free trial. Sign in required to purchase.</p>
        </div>
      </section>




      {/* UNLOCK FULL TRY-ON CAPABILITIES — comparison table */}
      <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 800px 500px at 50% 0%, rgba(56,189,248,0.10), transparent 70%)" }} />
        <div className="mx-auto max-w-4xl px-6 relative">
          <h2 className="text-center font-display font-extrabold uppercase tracking-tight text-3xl sm:text-5xl leading-[1.05]" style={{ backgroundImage: "linear-gradient(180deg, #0B1220 0%, #0369A1 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            Unlock Full Try-On Capabilities
          </h2>
          <div className="mt-12 relative">
            <div className="grid grid-cols-[1.6fr_1fr_1fr] items-center text-sm">
              <div className="text-slate-500 font-semibold uppercase tracking-wider text-xs py-4">What you'll get</div>
              <div className="text-center font-bold text-slate-600 py-4">Free</div>
              <div className="text-center font-bold py-4 rounded-t-2xl" style={{ color: "#0284C7", background: "linear-gradient(180deg, rgba(56,189,248,0.10), transparent)", border: "1.5px solid #38BDF8", borderBottom: "none", boxShadow: "0 -10px 40px -10px rgba(56,189,248,0.25)" }}>Pro</div>
              {[
                { label: "Try-On products", free: "1", pro: "Unlimited" },
                { label: "Access to all features", free: false, pro: true },
                { label: "Remove Easibie branding", free: false, pro: true },
                { label: "Custom viewer skin", free: false, pro: true },
                { label: "Brand colours & gradient", free: false, pro: true },
                { label: "Same-category recommendations", free: false, pro: true },
                { label: "Analytics dashboard", free: false, pro: true },
                { label: "Watermarked downloads", free: false, pro: true },
                { label: "Priority support", free: false, pro: true },
                { label: "Team seats", free: "1", pro: "Unlimited" },
              ].map((row, i, arr) => (
                <div key={row.label} className="contents">
                  <div className="py-4 text-slate-700 border-t" style={{ borderColor: "rgba(2,132,199,0.10)" }}>{row.label}</div>
                  <div className="py-4 text-center text-slate-400 border-t" style={{ borderColor: "rgba(2,132,199,0.10)" }}>
                    {typeof row.free === "boolean" ? (row.free ? <span style={{ color: "#0284C7" }}>✓</span> : <span>–</span>) : row.free}
                  </div>
                  <div
                    className="py-4 text-center"
                    style={{
                      borderLeft: "1.5px solid #38BDF8",
                      borderRight: "1.5px solid #38BDF8",
                      borderTop: "1px solid rgba(56,189,248,0.12)",
                      borderBottom: i === arr.length - 1 ? "1.5px solid #38BDF8" : undefined,
                      background: "linear-gradient(180deg, rgba(56,189,248,0.04), rgba(56,189,248,0.01))",
                      borderBottomLeftRadius: i === arr.length - 1 ? 16 : 0,
                      borderBottomRightRadius: i === arr.length - 1 ? 16 : 0,
                    }}
                  >
                    {typeof row.pro === "boolean" ? (row.pro ? <span style={{ color: "#0284C7" }}>✓</span> : <span className="text-slate-400">–</span>) : <span className="text-slate-800 font-semibold">{row.pro}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={14} style={{ color: "#0284C7" }} /> 7-day free trial · cancel anytime · pay safe & secure
          </div>
        </div>
      </section>


      {/* BEST PRICES IN INDUSTRY — professional table */}
      <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 50%, #FFFFFF 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 700px 400px at 50% 0%, rgba(56,189,248,0.12), transparent 70%)" }} />
        <div className="mx-auto max-w-4xl px-6 relative">
          <h2 className="text-center font-display font-extrabold uppercase tracking-tight text-3xl sm:text-5xl leading-[1.05]">
            <span className="block" style={{ backgroundImage: "linear-gradient(180deg, #0B1220 0%, #0369A1 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Best Prices</span>
            <span className="block" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>In Try-On Industry</span>
          </h2>
          <p className="mt-4 text-center text-slate-600 max-w-xl mx-auto">Create more with the lowest cost per try-on. Transparent pricing — no hidden fees.</p>

          <div className="mt-12 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 30px 80px -25px rgba(56,189,248,0.25)", border: "1px solid rgba(224,242,254,0.80)" }}>
            <div className="grid grid-cols-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500" style={{ background: "rgba(224,242,254,0.60)" }}>
              <div className="px-3 sm:px-5 py-4">Plan</div>
              <div className="px-3 sm:px-5 py-4 text-center">Monthly</div>
              <div className="px-3 sm:px-5 py-4 text-center">Per try-on</div>
              <div className="px-3 sm:px-5 py-4 text-center">Value</div>
            </div>
            {[
              { plan: "Free", monthly: "$0", per: "$0.00", value: "1 try-on", highlight: false },
              { plan: "Starter", monthly: "$10", per: "$0.05", value: "20 / $1", highlight: false },
              { plan: "Growth", monthly: "$39", per: "$0.043", value: "23 / $1", highlight: false },
              { plan: "Pro", monthly: "$49", per: "$0.020", value: "50 / $1", highlight: true },
            ].map((row) => (
              <div key={row.plan} className="grid grid-cols-4 text-sm items-center" style={{
                borderTop: "1px solid rgba(2,132,199,0.08)",
                background: row.highlight ? "linear-gradient(90deg, rgba(56,189,248,0.08), rgba(3,105,161,0.10))" : "transparent",
              }}>
                <div className="px-3 sm:px-5 py-4 font-display font-bold text-slate-800 flex items-center gap-2">
                  {row.plan}
                  {row.highlight && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: GRAD, color: "#fff" }}>Best</span>}
                </div>
                <div className="px-3 sm:px-5 py-4 text-center text-slate-700 tabular-nums">{row.monthly}</div>
                <div className="px-3 sm:px-5 py-4 text-center tabular-nums font-semibold" style={{ color: row.highlight ? "#0284C7" : "rgba(15,23,42,0.85)" }}>{row.per}</div>
                <div className="px-3 sm:px-5 py-4 text-center text-slate-600 tabular-nums text-xs sm:text-sm">{row.value}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">Pro delivers up to <span style={{ color: "#0284C7" }} className="font-bold">2.3× more try-ons per dollar</span> than Starter.</p>
        </div>
      </section>


      {/* REVIEWS — dark Higgsfield-style */}
      <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #02060c 0%, #050d1a 100%)" }}>
        <div className="mx-auto max-w-6xl px-6 mb-10 text-center">
          <h2 className="font-display font-extrabold uppercase tracking-tight text-3xl sm:text-5xl text-white leading-[1.05]">
            Community of <span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>10,000+ </span>stores
          </h2>
          <p className="mt-3 text-sm text-white/60">Real results from real Easibie users.</p>
        </div>
        <ReviewCarousel />
      </section>

      {/* FAQ */}
      <section className="py-20 relative" style={{ background: "linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 100%)" }}>
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center font-display font-extrabold uppercase tracking-tight text-3xl sm:text-5xl mb-10 leading-[1.05]" style={{ backgroundImage: "linear-gradient(180deg, #0B1220 0%, #0369A1 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {[
              { q: "How does the free trial work?", a: "Every paid plan starts with a 7-day free trial. No card required up front — you only pay when the trial ends." },
              { q: "Can I change my plan later?", a: "Yes. Upgrade or downgrade anytime from your dashboard. Changes apply at the next billing cycle." },
              { q: "How many try-ons can I generate?", a: "Free plan covers 1 product. Starter covers 10, Growth covers 50, Pro is unlimited." },
              { q: "Will the try-ons work on my store?", a: "Yes. We provide a one-line embed snippet that works on Shopify, WooCommerce, Wix, Squarespace and any custom site." },
              { q: "Is my shopper data safe?", a: "Yes. Shopper photos are processed for the try-on only and never used for training. Enterprise-grade storage." },
              { q: "Do you offer refunds?", a: "If something is broken, contact support and we'll make it right. Otherwise, cancel anytime to stop future charges." },
            ].map((f) => (
              <details key={f.q} className="group rounded-2xl px-5 py-4" style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(56,189,248,0.20)", boxShadow: "0 4px 20px -8px rgba(2,132,199,0.15)" }}>
                <summary className="flex items-center justify-between cursor-pointer list-none text-slate-800 font-semibold">
                  {f.q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">⌄</span>
                </summary>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, rgba(2,132,199,0.10), rgba(6,182,212,0.05))" }}>
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          <StatCounter target={10247} suffix="+" label="Stores Using Easibie" />
          <StatCounter target={2400000} suffix="+" label="Try-Ons Delivered" />
          <div className="text-center">
            <div className="font-display font-extrabold text-gradient-ocean text-4xl md:text-5xl">4.9 / 5</div>
            <div className="mt-2 text-sm text-muted">Average Customer Rating</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #02060c 0%, #0a1929 30%, #0369A1 70%, #38BDF8 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 1000px 400px at center, rgba(255,255,255,0.10), transparent)" }} />
        <div className="mx-auto max-w-3xl px-6 text-center relative">
          <h2 className="text-white">Start Selling Try-Ons Today</h2>
          <p className="mt-4 text-white/80">Join 10,000+ stores already using Easibie. Your first try-on product is free forever.</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3">
            <Link to="/auth" search={{ mode: "signup" }} className="btn-primary" style={{ background: "#fff", color: "var(--primary)", minWidth: 220 }}>
              Create Free Account
            </Link>
            <Link to="/pricing" className="text-sm font-semibold text-white/90 hover:text-white underline-offset-4 hover:underline px-4 py-2">See pricing →</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

function PromoTicket() {
  const [s, setS] = useState(15 * 60);
  useEffect(() => {
    const id = setInterval(() => setS((v) => (v > 0 ? v - 1 : 15 * 60)), 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");

  return (
    <div className="mt-10 mx-auto max-w-xl relative">
      {/* perforated ticket */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full" style={{ background: "#02060c" }} />
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full" style={{ background: "#02060c" }} />
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 55%, #ef4444 100%)",
          boxShadow: "0 30px 70px -20px rgba(239,68,68,0.55), 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      >
        <div className="py-3 text-center text-[12px] sm:text-[13px] font-bold tracking-wide flex items-center justify-center gap-2"
          style={{ background: "rgba(0,0,0,0.25)", color: "#fde047" }}>
          <CheckIcon size={14} strokeWidth={3} /> <span className="text-white/90"><span style={{ color: "#fde047" }} className="font-extrabold">easibie_promo</span> is applied</span>
        </div>
        <div className="grid grid-cols-2 relative">
          <div className="absolute left-1/2 top-2 bottom-2 border-l-2 border-dashed" style={{ borderColor: "rgba(255,255,255,0.35)" }} />
          <div className="py-6 sm:py-7 text-center">
            <div className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight" style={{ color: "#fde047", textShadow: "0 2px 18px rgba(253,224,71,0.45)" }}>21% OFF</div>
            <div className="mt-1 text-[11px] text-white/75">With limited-offer promocode</div>
          </div>
          <div className="py-6 sm:py-7 text-center">
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-white tabular-nums tracking-tight">
              {m} <span className="text-white/60">:</span> {sec}
            </div>
            <div className="mt-1 flex items-center justify-center gap-6 text-[10px] uppercase tracking-[0.18em] text-white/70">
              <span>minutes</span><span>seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

