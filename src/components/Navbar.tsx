import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/", label: "Home" },
  { to: "/how-it-works", label: "Features", caret: true },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "Blog" },
  { to: "/about", label: "Contact" },
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
    <header className="fixed top-4 left-0 right-0 z-50 px-4">
      <div className="mx-auto max-w-6xl bg-white rounded-full border border-[#EEF0F3] shadow-[0_2px_10px_-4px_rgba(15,23,42,0.06)] h-16 px-6 flex items-center justify-between">
        <Link to="/" className="font-display text-[22px] font-black tracking-tight italic text-ink">
          Easibie
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l, i) => (
            <Link
              key={i}
              to={l.to}
              className={`text-[14px] font-medium flex items-center gap-1 transition-colors ${
                pathname === l.to ? "text-ink" : "text-[#6B7280] hover:text-ink"
              }`}
            >
              {l.label}
              {l.caret && <ChevronDown size={14} />}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="text-[14px] font-medium text-ink">Dashboard</Link>
              <button onClick={signOut} className="btn-primary">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/auth" search={{ mode: "signin" }} className="text-[14px] font-medium text-ink">Login</Link>
              <Link to="/auth" search={{ mode: "signup" }} className="btn-primary">Get Started</Link>
            </>
          )}
        </div>

        <button className="md:hidden text-ink" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center gap-8">
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
                <button onClick={() => { setMenuOpen(false); signOut(); }} className="btn-ghost w-full">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/auth" search={{ mode: "signin" }} onClick={() => setMenuOpen(false)} className="btn-ghost w-full">Login</Link>
                <Link to="/auth" search={{ mode: "signup" }} onClick={() => setMenuOpen(false)} className="btn-primary w-full">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
