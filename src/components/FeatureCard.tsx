import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export function FeatureCard({
  icon: Icon, title, description, accent = "primary", delay = 0,
}: { icon: LucideIcon; title: string; description: string; accent?: "primary" | "cyan"; delay?: number }) {
  const gradient = "linear-gradient(135deg, #0B1220 0%, #0369A1 50%, #38BDF8 100%)";
  void accent;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6 }}
      className="rounded-2xl p-6 transition-shadow hover:glow-card relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(2,132,199,0.18)",
        boxShadow: "0 18px 40px -22px rgba(2,132,199,0.35)",
      }}
    >
      <div
        className="w-12 h-12 rounded-xl grid place-items-center mb-4"
        style={{ background: gradient, boxShadow: "0 12px 28px -10px rgba(2,132,199,0.55)" }}
      >
        <Icon size={22} color="#ffffff" strokeWidth={2.2} />
      </div>
      <h3
        className="mb-2 font-display font-bold text-[18px] leading-tight"
        style={{
          backgroundImage: gradient,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {title}
      </h3>
      <p className="text-sm" style={{ color: "var(--ink-soft)" }}>{description}</p>
    </motion.div>
  );
}
