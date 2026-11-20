import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { EasibieLogo } from "./EasibieLogo";

const NAV_LINKS = [
  { to: "/how-it-works", label: "How It Works" },
  { to: "/try-ar", label: "Photo Studio" },
  { to: "/for-stores", label: "For Stores" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
] as const;

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const isActive = (to: string) => pathname === to;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
      <div className="mx-auto max-w-6xl h-16 px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo with Professional Easibie Logo Component */}
        <EasibieLogo size="md" showSubtitle />

        {/* Center Desktop Dedicated Links */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-[13.5px] font-semibold transition-colors ${
                  active
                    ? "text-[#1E40AF] font-bold"
                    : "text-[#475569] hover:text-[#0F172A]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Action Buttons */}
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
                className="text-[12.5px] font-semibold text-[#64748B] hover:text-[#0F172A] px-2 py-1"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth"
                search={{ mode: "signin" }}
                className="text-[13px] font-semibold text-[#0F172A] hover:text-[#1E40AF] px-3 py-1.5 transition"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="btn-blue-primary text-[13px] !py-2 !px-4"
              >
                Get Started Free →
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-[#0F172A] p-1.5 rounded-lg hover:bg-slate-100"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col p-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <EasibieLogo size="md" showSubtitle />
            <button
              onClick={() => setMenuOpen(false)}
              className="text-[#0F172A] p-2 rounded-lg hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex flex-col gap-4 py-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`text-[16px] font-semibold transition ${
                  isActive(link.to) ? "text-blue-700 font-bold" : "text-[#0F172A]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-3">
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
