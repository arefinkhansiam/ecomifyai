import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/", label: "Home" },
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
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all"
        style={{
          background: scrolled ? "rgba(10,10,15,0.92)" : "rgba(10,10,15,0.6)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 1px 0 rgba(124,58,237,0.2)",
        }}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 h-16 md:h-[72px]">
          <Link to="/" className="font-display text-[22px] font-extrabold tracking-tight">
            <span className="text-cyan">E</span>
            <span className="text-white">ASIBIE</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm font-medium transition-colors"
                style={{ color: pathname === l.to ? "#fff" : "var(--muted)" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setOpen((o) => !o)}
                  className="flex items-center gap-2"
                >
                  <div className="w-9 h-9 rounded-full bg-[var(--primary)] grid place-items-center text-white font-display font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                </button>
                {open && (
                  <div className="absolute right-0 top-12 w-48 rounded-xl bg-card p-2 shadow-2xl">
                    <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--surface)] text-white text-sm">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link to="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--surface)] text-white text-sm">
                      <Settings size={16} /> Settings
                    </Link>
                    <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--surface)] text-white text-sm">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/auth" search={{ mode: "signin" }} className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium hover:border-[var(--primary)] transition-colors">
                  Sign In
                </Link>
                <Link to="/auth" search={{ mode: "signup" }} className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary-light)] transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>
          <button className="md:hidden text-white" onClick={() => setMenuOpen(true)}>
            <Menu size={26} />
          </button>
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
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="btn-primary w-full">Dashboard</Link>
              ) : (
                <>
                  <Link to="/auth" search={{ mode: "signin" }} onClick={() => setMenuOpen(false)} className="btn-ghost w-full">Sign In</Link>
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
