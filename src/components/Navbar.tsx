import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ArrowRight, Sparkles, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/#how-it-works", label: "How It Works" },
  { to: "/#photo-studio", label: "Photo Try-On" },
  { to: "/#embed-widget", label: "Store Embed" },
  { to: "/#roadmap", label: "Roadmap (AR)" },
  { to: "/#pricing", label: "Pricing" },
  { to: "/try-ar", label: "Live Studio" },
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
      <div className="mx-auto max-w-6xl bg-white/95 backdrop-blur-md rounded-full border border-[#E2E8F0] shadow-[0_4px_24px_-4px_rgba(11,25,44,0.08)] h-[60px] px-6 flex items-center justify-between">
        {/* Brand Logo - Easibie in Deep Blue */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0F2744] via-[#1E40AF] to-[#2563EB] grid place-items-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V7Z" stroke="white" strokeWidth="2"/>
              <path d="M9 5V3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V5" stroke="white" strokeWidth="2"/>
              <circle cx="12" cy="13" r="3" fill="#60A5FA"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[19px] font-extrabold tracking-tight text-[#0B192C] leading-none">
              Easibie<span className="text-[#2563EB]">.ai</span>
            </span>
            <span className="text-[9.5px] font-semibold text-[#64748B] tracking-wider uppercase">
              Virtual Try-On
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          {links.map((l, i) => (
            <a
              key={i}
              href={l.to}
              className="text-[13.5px] font-semibold text-[#475569] hover:text-[#1E40AF] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="btn-blue-primary text-[13px] !py-2 !px-4"
              >
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              <button
                onClick={signOut}
                className="text-[12.5px] font-semibold text-[#64748B] hover:text-[#0B192C] px-2 py-1"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth"
                search={{ mode: "signin" }}
                className="text-[13px] font-bold text-[#0B192C] hover:text-[#1E40AF] px-3 py-1.5 transition"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="btn-blue-primary text-[13px] !py-2 !px-5"
              >
                Get Started <ArrowRight size={14} className="inline ml-1" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-[#0B192C] p-1.5"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center gap-6 p-6">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-6 right-6 text-[#0B192C] p-2"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#1E40AF] grid place-items-center text-white">
              <Sparkles size={18} />
            </div>
            <span className="text-[22px] font-extrabold text-[#0B192C]">Easibie.ai</span>
          </div>
          {links.map((l, i) => (
            <a
              key={i}
              href={l.to}
              onClick={() => setMenuOpen(false)}
              className="text-[17px] font-bold text-[#0B192C] hover:text-[#2563EB]"
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
            <Link
              to="/auth"
              search={{ mode: "signin" }}
              onClick={() => setMenuOpen(false)}
              className="btn-white-secondary text-center !w-full"
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              onClick={() => setMenuOpen(false)}
              className="btn-blue-primary text-center !w-full"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
