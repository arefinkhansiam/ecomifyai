import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/", label: "Home" },
  { to: "/how-it-works", label: "Features" },
  { to: "/how-it-works", label: "Use Cases" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "Testimonials" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="fixed top-5 left-0 right-0 z-50 px-4">
      <div className="mx-auto max-w-6xl bg-white rounded-[22px] border border-[#E4DEF7] shadow-[0_10px_40px_-24px_rgba(31,23,71,0.18)] h-[68px] px-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-[10px] grid place-items-center bg-[#1F1747] text-white text-[13px] font-black">E</span>
          <span className="text-[18px] font-extrabold tracking-tight text-ink">Easibie</span>
        </Link>

        <nav className="hidden md:flex items-center gap-9 absolute left-1/2 -translate-x-1/2">
          {links.map((l, i) => (
            <Link
              key={i}
              to={l.to}
              className={`text-[14px] font-medium transition-colors ${
                pathname === l.to ? "text-ink" : "text-[#6B6689] hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="text-[14px] font-medium text-ink">Dashboard</Link>
              <button onClick={signOut} className="btn-primary">Sign out</button>
            </>
          ) : (
            <Link to="/auth" search={{ mode: "signup" }} className="btn-primary">Get started for free</Link>
          )}
        </div>

        <button className="md:hidden text-ink" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#EDEAFB] flex flex-col items-center justify-center gap-8">
          <button onClick={() => setMenuOpen(false)} className="absolute top-6 right-6 text-ink"><X size={24} /></button>
          {links.map((l, i) => (
            <Link key={i} to={l.to} onClick={() => setMenuOpen(false)} className="text-2xl font-bold text-ink">
              {l.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 w-64">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="btn-primary w-full">Dashboard</Link>
                <button onClick={() => { setMenuOpen(false); signOut(); }} className="btn-ghost w-full">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/auth" search={{ mode: "signin" }} onClick={() => setMenuOpen(false)} className="btn-ghost w-full">Login</Link>
                <Link to="/auth" search={{ mode: "signup" }} onClick={() => setMenuOpen(false)} className="btn-primary w-full">Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
