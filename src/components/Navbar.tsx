import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MoreVertical, X, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";


const links = [
  { to: "/", label: "Home" },
  { to: "/try-ar", label: "Try It On" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About Us" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <>
      {/* Desktop: subtle gradient overlay at the very top so page starts with brand gradient */}
      <div
        className="hidden md:block fixed top-0 left-0 right-0 z-40 pointer-events-none h-32"
        style={{ background: "linear-gradient(180deg, rgba(2,132,199,0.32) 0%, rgba(56,189,248,0.16) 40%, rgba(56,189,248,0) 100%)" }}
      />
      <header className="fixed top-3 md:top-4 left-0 right-0 z-50 px-3 md:px-10 pointer-events-none">
        <div
          className="pointer-events-auto mx-auto max-w-[1400px] grid grid-cols-3 items-center px-4 md:px-7 h-14 md:h-20 rounded-full transition-all bg-white/90 md:bg-white/15 border border-white/85 md:border-white/30 shadow-[0_14px_40px_-18px_rgba(2,132,199,0.3)] md:shadow-[0_18px_50px_-22px_rgba(2,132,199,0.45)]"
          style={{
            backdropFilter: "blur(22px) saturate(180%)",
            WebkitBackdropFilter: "blur(22px) saturate(180%)",
          }}
        >
          {/* Left spacer (keeps logo perfectly centered) */}
          <div className="justify-self-start" />

          {/* Centered logo */}
          <Link to="/" className="flex items-center justify-self-center font-display font-extrabold tracking-tight text-[22px] md:text-[30px] leading-none">
            <span
              style={{
                backgroundImage: "linear-gradient(135deg, #0B1220 0%, #0369A1 45%, #38BDF8 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                letterSpacing: "-0.02em",
              }}
            >
              ECOMIFY
            </span>
          </Link>

          {/* Right: 3-dot menu button (both desktop & mobile) */}
          <div className="justify-self-end flex items-center gap-2">
            {user && (
              <button
                onClick={() => setOpen((o) => !o)}
                className="hidden md:flex w-9 h-9 rounded-full bg-[var(--primary)] items-center justify-center text-white font-display font-bold text-sm"
                aria-label="Account"
              >
                {user.email?.[0].toUpperCase()}
              </button>
            )}
            <button
              onClick={() => setMenuOpen(true)}
              className="w-10 h-10 md:w-11 md:h-11 rounded-full grid place-items-center bg-white/80 md:bg-white/25 border border-white/70 md:border-white/40 hover:bg-white transition shadow-sm"
              aria-label="Open menu"
              style={{ color: "var(--ink)" }}
            >
              <MoreVertical size={20} />
            </button>
            {open && user && (
              <div className="absolute right-4 top-20 w-52 rounded-xl bg-card p-2 shadow-2xl border border-[var(--border)]">
                <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--surface)] text-ink text-sm">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link to="/dashboard/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--surface)] text-ink text-sm">
                  <Settings size={16} /> Settings
                </Link>
                <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--surface)] text-ink text-sm">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-8"
            style={{ background: "rgba(10,10,15,0.98)", backdropFilter: "blur(20px)" }}
          >
            <button onClick={() => setMenuOpen(false)} className="absolute top-6 right-6 text-white">
              <X size={28} />
            </button>
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)} className="font-display text-2xl font-bold text-white">
                {l.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 w-64 mt-4">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="btn-primary w-full">Dashboard</Link>
                  <button onClick={() => { setMenuOpen(false); signOut(); }} className="btn-ghost w-full text-white border-white/30">Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/auth" search={{ mode: "signin" }} onClick={() => setMenuOpen(false)} className="btn-ghost w-full text-white border-white/30">Sign In</Link>
                  <Link to="/auth" search={{ mode: "signup" }} onClick={() => setMenuOpen(false)} className="btn-primary w-full">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
