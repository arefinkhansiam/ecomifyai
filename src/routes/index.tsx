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
          <div className="mt-10 flex items-center justify-center gap-4">
            <div className="flex -space-x-2">
              {["#7C3AED","#06B6D4","#10B981","#F59E0B","#EF4444"].map((c, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-[var(--bg)]" style={{ background: c }} />
              ))}
            </div>
            <div className="text-sm text-muted">Join 10,000+ store owners</div>
            <div className="flex gap-1">{[0,1,2,3,4].map(i => <Star key={i} size={14} className="text-cyan" fill="currentColor" />)}</div>
          </div>
          {/* Hero mockup */}
          <div className="mt-16 flex justify-center">
            <div className="float w-[260px] h-[520px] rounded-[44px] bg-card p-3 relative" style={{ boxShadow: "0 40px 120px rgba(124,58,237,0.25)" }}>
              <div className="w-full h-full rounded-[34px] bg-bg overflow-hidden relative grid place-items-center">
                <div className="absolute top-4 left-4 right-4 flex justify-between text-xs text-muted">
                  <span>9:41</span><span>•••</span>
                </div>
                <div className="w-44 h-44 rounded-2xl gradient-radial grid place-items-center">
                  <Box size={64} className="text-[var(--lavender)]" />
                </div>
                <div className="absolute bottom-6 left-4 right-4">
                  <div className="bg-card rounded-xl p-3">
                    <div className="text-xs text-muted">AR Preview</div>
                    <div className="text-sm font-semibold text-white">Modern Lounge Chair</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-surface py-16">
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
            <h2 className="text-white">Everything You Need to Sell in AR</h2>
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
      <section id="how" className="bg-surface py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-white">How Easibie Works</h2>
            <p className="mt-4">From photo to AR in 3 simple steps.</p>
          </div>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "01", color: "var(--cyan)", icon: Camera, title: "Upload Your Product Photo", desc: "Take a photo or upload an existing one. Any angle, any background." },
              { n: "02", color: "var(--primary)", icon: Sparkles, title: "AI Generates Your AR", desc: "Our system processes the image and creates your AR experience automatically." },
              { n: "03", color: "var(--cyan)", icon: Share2, title: "Share and Sell More", desc: "Copy your AR link or embed code. Customers view it in their space before buying." },
            ].map((s, i) => (
              <motion.div key={s.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="bg-card rounded-2xl p-8 relative">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${s.color}20`, color: s.color }}>{s.n}</div>
                <s.icon size={28} className="mt-4 text-white" />
                <h3 className="mt-4 text-white">{s.title}</h3>
                <p className="mt-2 text-sm">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-white">Simple, Transparent Pricing</h2>
            <p className="mt-4">Start free. Upgrade when you are ready to scale.</p>
          </div>
          <PricingCards />
          <p className="text-center text-sm text-muted mt-8">All plans include a 7-day free trial. No credit card required to start.</p>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 mb-12 text-center">
          <h2 className="text-white">Loved by Store Owners Worldwide</h2>
          <p className="mt-4">Real results from real Easibie users.</p>
        </div>
        <ReviewCarousel />
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.05))" }}>
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          <StatCounter target={10247} suffix="+" label="Stores Using Easibie" />
          <StatCounter target={2400000} suffix="+" label="AR Experiences Delivered" />
          <div className="text-center">
            <div className="font-display font-extrabold text-white text-4xl md:text-5xl">4.9 / 5</div>
            <div className="mt-2 text-sm text-muted">Average Customer Rating</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative" style={{ background: "radial-gradient(ellipse 1000px 400px at center, rgba(124,58,237,0.2), transparent)" }}>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-white">Start Selling in AR Today</h2>
          <p className="mt-4">Join 10,000+ stores already using Easibie. Your first AR product is free forever.</p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link to="/auth" search={{ mode: "signup" }} className="btn-primary">Create Free Account</Link>
            <Link to="/pricing" className="btn-ghost">See Pricing</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
