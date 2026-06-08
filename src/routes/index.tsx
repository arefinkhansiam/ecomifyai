import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Play, Star, UploadCloud, Box, Smartphone, BarChart2, Link as LinkIcon, ShieldCheck, Camera, Share2 } from "lucide-react";
import { MarketingShell } from "@/components/MarketingShell";
import { FeatureCard } from "@/components/FeatureCard";
import { PricingCards } from "@/components/PricingCards";
import { StatCounter } from "@/components/StatCounter";
import { ReviewCarousel } from "@/components/ReviewCarousel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Easibie — AI-Powered AR for E-Commerce" },
      { name: "description", content: "Upload a product photo and get a live AR experience in seconds. No 3D, no app. Just better sales." },
      { property: "og:title", content: "Easibie — AI-Powered AR for E-Commerce" },
      { property: "og:description", content: "Upload a product photo and get a live AR experience in seconds." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <MarketingShell>
      {/* HERO */}
      <section className="relative min-h-[calc(100vh-72px)] flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, #02060c 0%, #0a1929 18%, #0f3050 38%, #15649e 58%, #38bdf8 75%, #e0f2fe 92%, #f6fafe 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 900px 600px at 50% 0%, rgba(56,189,248,0.22), transparent 70%)' }} />
        <div className="mx-auto max-w-5xl px-6 py-20 text-center relative">
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-8 text-white"
          >
            Let Your Customers See Products in Their Space Before They Buy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-6 max-w-2xl mx-auto text-[18px] text-white/80"
          >
            Easibie transforms any product photo into a stunning AR experience in seconds. No 3D modeling. No developer needed. Just upload, generate, and sell more.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link to="/auth" search={{ mode: "signup" }} className="btn-primary">Start for Free</Link>
            <a href="#how" className="btn-ghost"><Play size={16} /> Watch Demo</a>
          </motion.div>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <div className="flex -space-x-3">
              {[
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=faces",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=faces",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  loading="lazy"
                  className="w-9 h-9 rounded-full object-cover border-2 border-white"
                  style={{ boxShadow: "0 4px 10px rgba(2,132,199,0.25)" }}
                />
              ))}
            </div>
            <div className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.92)" }}>Join 10,000+ store owners</div>
            <div className="flex gap-1">{[0,1,2,3,4].map(i => <Star key={i} size={14} className="text-cyan" fill="currentColor" />)}</div>
          </div>
          {/* Hero mockup with live 3D / AR demo */}
          <div className="mt-16 flex justify-center">
            <div className="float w-[280px] h-[560px] rounded-[44px] bg-card p-3 relative" style={{ boxShadow: "0 40px 120px rgba(2,132,199,0.4)" }}>
              <div className="w-full h-full rounded-[34px] bg-bg overflow-hidden relative">
                <div className="absolute top-4 left-4 right-4 flex justify-between text-xs text-muted z-10">
                  <span>9:41</span><span>•••</span>
                </div>
                <model-viewer
                  src="https://modelviewer.dev/shared-assets/models/glTF-Sample-Models/2.0/SheenChair/glTF-Binary/SheenChair.glb"
                  ios-src="/models/demo-ar.usdz"
                  alt="Easibie AR demo"
                  ar
                  ar-modes="webxr scene-viewer quick-look"
                  camera-controls
                  auto-rotate
                  shadow-intensity="1"
                  exposure="0.9"
                  touch-action="pan-y"
                  style={{ width: "100%", height: "100%", background: "linear-gradient(180deg, #f6fafe 0%, #e0f2fe 100%)", "--poster-color": "transparent" } as any}
                />
                <div className="absolute bottom-6 left-4 right-4 z-10">
                  <div className="bg-card/95 backdrop-blur-md rounded-xl p-3 shadow-lg">
                    <div className="text-[10px] uppercase tracking-wider text-muted">Live AR Demo · Tap & drag</div>
                    <div className="text-sm font-semibold text-ink">Modern Lounge Chair</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-surface/60 backdrop-blur-sm py-16">
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
          <StatCounter target={10000} suffix="+" label="Active Stores" />
          <StatCounter target={2400000} suffix="+" label="AR Views Generated" />
          <StatCounter target={30} suffix="%" label="Avg Sales Increase" />
          <StatCounter target={3} suffix="s" label="To Generate AR" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-gradient-ocean">Everything You Need to Sell in AR</h2>
            <p className="mt-4">No technical skills required. Easibie handles everything from photo to AR in seconds.</p>
          </div>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={UploadCloud} title="One-Click Photo Upload" description="Upload any product photo from your phone or computer. Our AI scans and processes it instantly." accent="primary" delay={0} />
            <FeatureCard icon={Box} title="Instant AR Generation" description="Our AI converts your 2D photo into an interactive AR model in under 3 seconds." accent="cyan" delay={0.1} />
            <FeatureCard icon={Smartphone} title="Customer AR View" description="Scan a QR or tap a link and see your product placed in their real room." accent="primary" delay={0.2} />
            <FeatureCard icon={BarChart2} title="AR Analytics Dashboard" description="Track views, devices, and impact on conversion right in your dashboard." accent="cyan" delay={0.3} />
            <FeatureCard icon={LinkIcon} title="Embed Anywhere" description="One-line embed code or Shopify snippet. Works on any website." accent="primary" delay={0.4} />
            <FeatureCard icon={ShieldCheck} title="Secure and Scalable" description="Enterprise-grade security. Your images and AR data stay protected." accent="cyan" delay={0.5} />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24" style={{ background: "linear-gradient(180deg, transparent, rgba(2,132,199,0.06), transparent)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-gradient-ocean">How Easibie Works</h2>
            <p className="mt-4">From photo to AR in 3 simple steps.</p>
          </div>
          <div className="mt-16 relative">
            {/* connecting line — desktop horizontal */}
            <div className="hidden md:block absolute top-7 left-[16.66%] right-[16.66%] h-[2px]" style={{ background: "linear-gradient(90deg, #0B1220, #0369A1, #38BDF8)" }} />
            {/* connecting line — mobile vertical */}
            <div className="md:hidden absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px]" style={{ background: "linear-gradient(180deg, #0B1220, #0369A1, #38BDF8)" }} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 relative">
              {[
                { n: 1, icon: Camera, title: "Upload Your Product Photo", desc: "Take a photo or upload an existing one. Any angle, any background." },
                { n: 2, icon: Sparkles, title: "AI Generates Your AR", desc: "Our system processes the image and creates your AR experience automatically." },
                { n: 3, icon: Share2, title: "Share and Sell More", desc: "Copy your AR link or embed code. Customers view it in their space before buying." },
              ].map((s, i) => {
                const grad = "linear-gradient(135deg, #0B1220 0%, #0369A1 50%, #38BDF8 100%)";
                return (
                  <motion.div key={s.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                    className="flex flex-col items-center text-center relative">
                    {/* numbered circle */}
                    <div className="w-14 h-14 rounded-full grid place-items-center font-display font-extrabold text-xl text-white relative z-10"
                      style={{ background: grad, boxShadow: "0 14px 30px -8px rgba(2,132,199,0.55)", border: "4px solid #ffffff" }}>
                      {s.n}
                    </div>
                    <div className="mt-6 w-full rounded-2xl p-6"
                      style={{
                        background: "rgba(255,255,255,0.88)",
                        backdropFilter: "blur(14px)",
                        border: "1px solid rgba(2,132,199,0.18)",
                        boxShadow: "0 18px 40px -22px rgba(2,132,199,0.35)",
                      }}>
                      <div className="w-12 h-12 rounded-xl grid place-items-center mx-auto" style={{ background: grad, boxShadow: "0 12px 28px -10px rgba(2,132,199,0.55)" }}>
                        <s.icon size={22} color="#ffffff" strokeWidth={2.2} />
                      </div>
                      <h3 className="mt-4 font-display font-bold text-[18px] leading-tight"
                        style={{ backgroundImage: grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                        {s.title}
                      </h3>
                      <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>{s.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS AR */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl p-8 md:p-14 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0B1220 0%, #0369A1 55%, #38BDF8 100%)",
              boxShadow: "0 40px 100px -30px rgba(2,132,199,0.55)",
            }}>
            <div className="absolute -right-10 -top-10 opacity-20 pointer-events-none">
              <Box size={260} color="#ffffff" strokeWidth={1} />
            </div>
            <div className="relative">
              <span className="pill" style={{ background: "rgba(255,255,255,0.14)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.25)" }}>What is AR?</span>
              <h2 className="mt-6 text-white">What is Augmented Reality (AR)?</h2>
              <p className="mt-5 text-white/85 text-[17px] leading-relaxed max-w-3xl">
                Augmented Reality (AR) is a technology that overlays digital information — like images, 3D models, or data — onto the real world through a device's camera.
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { t: "How it works", d: "Uses computer vision to detect surfaces and place digital objects accurately in your environment." },
                  { t: "Visual Try-on", d: "Customers can see how products look in their actual space before making a purchase decision." },
                  { t: "Better Engagement", d: "Reduces return rates and increases customer confidence through interactive visualization." },
                ].map((f) => (
                  <div key={f.t} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}>
                    <div className="font-display font-bold text-white">{f.t}</div>
                    <p className="mt-2 text-sm text-white/85">{f.d}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/auth" search={{ mode: "signup" }} className="btn-primary">Launch Your Store Free</Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* PRICING */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-gradient-ocean">Simple, Transparent Pricing</h2>
            <p className="mt-4">Start free. Upgrade when you are ready to scale.</p>
          </div>
          <PricingCards />
          <p className="text-center text-sm text-muted mt-8">All plans include a 7-day free trial. No credit card required to start.</p>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 mb-12 text-center">
          <h2 className="text-gradient-ocean">Loved by Store Owners Worldwide</h2>
          <p className="mt-4">Real results from real Easibie users.</p>
        </div>
        <ReviewCarousel />
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, rgba(2,132,199,0.10), rgba(6,182,212,0.05))" }}>
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          <StatCounter target={10247} suffix="+" label="Stores Using Easibie" />
          <StatCounter target={2400000} suffix="+" label="AR Experiences Delivered" />
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
          <h2 className="text-white">Start Selling in AR Today</h2>
          <p className="mt-4 text-white/80">Join 10,000+ stores already using Easibie. Your first AR product is free forever.</p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link to="/auth" search={{ mode: "signup" }} className="btn-primary">Create Free Account</Link>
            <Link to="/pricing" className="btn-ghost">See Pricing</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
