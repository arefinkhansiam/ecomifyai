import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles, Play, Star, UploadCloud, ImagePlus, Wand2, Share2,
  Shirt, Sofa, Gem, Brush, Smartphone, BarChart2, Link as LinkIcon, ShieldCheck,
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
      { title: "Ecomify — AI Photo Try-On for E-Commerce" },
      { name: "description", content: "Upload product photos. Shoppers upload their own photo. Our AI generates a photoreal try-on in seconds — fashion, jewellery, furniture and makeup." },
      { property: "og:title", content: "Ecomify — AI Photo Try-On for E-Commerce" },
      { property: "og:description", content: "Photoreal try-on from a single photo. No app, no complex modeling." },
    ],
  }),
  component: Landing,
});

const GRAD = "linear-gradient(135deg, #0B1220 0%, #0369A1 50%, #38BDF8 100%)";

function Landing() {
  return (
    <MarketingShell>
      {/* HERO — bold dark Higgsfield-style with cyan gradient */}
      <section className="relative min-h-[calc(100vh-72px)] flex items-center overflow-hidden" style={{ background: "linear-gradient(180deg, #02060c 0%, #050d1a 40%, #07111f 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 900px 600px at 50% 0%, rgba(56,189,248,0.22), transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 600px 400px at 80% 80%, rgba(3,105,161,0.25), transparent 70%)" }} />
        <div className="mx-auto max-w-6xl px-6 py-20 text-center relative w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}
            className="mx-auto mb-12 relative rounded-3xl overflow-hidden max-w-2xl"
            style={{ boxShadow: "0 60px 120px -30px rgba(56,189,248,0.5)", border: "1px solid rgba(56,189,248,0.25)" }}
          >
            <div className="grid grid-cols-2">
              <img src={demoBefore} alt="Shopper photo" className="w-full h-[260px] sm:h-[340px] object-cover" />
              <img src={demoAfter} alt="AI try-on result" className="w-full h-[260px] sm:h-[340px] object-cover" />
            </div>
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-white" style={{ background: "rgba(2,6,12,0.7)", backdropFilter: "blur(8px)" }}>Before</div>
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-white" style={{ background: GRAD }}>After</div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2" style={{ background: "rgba(2,6,12,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(56,189,248,0.3)" }}>
              <Sparkles size={12} style={{ color: "#38BDF8" }} /> Powered by Gemini 2.5
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[44px] sm:text-[68px] md:text-[88px]"
            style={{ backgroundImage: "linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
          >
            Try It On.<br/>From One Photo.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-6 max-w-2xl mx-auto text-[16px] sm:text-[18px] text-white/65"
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
                <img key={i} src={src} alt="" loading="lazy" className="w-9 h-9 rounded-full object-cover border-2" style={{ borderColor: "#0a1929" }} />
              ))}
            </div>
            <div className="text-sm font-medium text-white/80">10,000+ stores</div>
            <div className="flex gap-1">{[0,1,2,3,4].map(i => <Star key={i} size={14} style={{ color: "#38BDF8" }} fill="currentColor" />)}</div>
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
            <h2 className="text-gradient-ocean">How Ecomify Works</h2>
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

      {/* PRICING — dark */}
      <section id="pricing" className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #02060c 0%, #050d1a 50%, #02060c 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 800px 500px at 50% 0%, rgba(56,189,248,0.15), transparent 70%)" }} />
        <div className="mx-auto max-w-7xl px-6 relative">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display font-extrabold uppercase tracking-tight text-3xl sm:text-5xl" style={{ backgroundImage: "linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Pick Your Plan</h2>
            <p className="mt-4 text-white/65">Start free. Upgrade when you are ready to scale.</p>
          </div>
          <PricingCards />
          <p className="text-center text-sm text-white/50 mt-10">All plans include a 7-day free trial. No credit card required.</p>
        </div>
      </section>

      {/* REVIEWS — dark Higgsfield-style */}
      <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #02060c 0%, #050d1a 100%)" }}>
        <div className="mx-auto max-w-6xl px-6 mb-10 text-center">
          <h2 className="font-display font-extrabold uppercase tracking-tight text-3xl sm:text-5xl text-white leading-[1.05]">
            Community of <span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>10,000+ </span>stores
          </h2>
          <p className="mt-3 text-sm text-white/60">Real results from real Ecomify users.</p>
        </div>
        <ReviewCarousel />
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, rgba(2,132,199,0.10), rgba(6,182,212,0.05))" }}>
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          <StatCounter target={10247} suffix="+" label="Stores Using Ecomify" />
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
          <p className="mt-4 text-white/80">Join 10,000+ stores already using Ecomify. Your first try-on product is free forever.</p>
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
