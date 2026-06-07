import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export function FeatureCard({
  icon: Icon, title, description, accent = "primary", delay = 0,
}: { icon: LucideIcon; title: string; description: string; accent?: "primary" | "cyan"; delay?: number }) {
  const color = accent === "cyan" ? "var(--cyan)" : "var(--primary)";
  const bg = accent === "cyan" ? "rgba(6,182,212,0.15)" : "rgba(124,58,237,0.15)";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className="bg-card rounded-2xl p-8 transition-shadow hover:glow-card"
    >
      <div className="w-12 h-12 rounded-xl grid place-items-center mb-5" style={{ background: bg }}>
        <Icon size={24} style={{ color }} />
      </div>
      <h3 className="text-white mb-2">{title}</h3>
      <p className="text-sm">{description}</p>
    </motion.div>
  );
}
