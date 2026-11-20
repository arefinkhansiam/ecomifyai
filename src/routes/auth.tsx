import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, KeyRound, User, Eye, EyeOff, Store, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { EasibieLogo } from "@/components/EasibieLogo";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in to Easibie — AI Virtual Try-On for Fashion" },
      { name: "description", content: "Sign in or create your Easibie merchant account to integrate AI photo try-on into your fashion store in minutes." },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/>
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"/>
    </svg>
  );
}

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [fullName, setFullName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [platform, setPlatform] = useState("Shopify");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const done = () => {
    if (search.redirect) {
      try {
        const target = new URL(search.redirect, window.location.origin);
        if (target.origin === window.location.origin) {
          window.location.href = `${target.pathname}${target.search}${target.hash}`;
          return;
        }
      } catch (error) {
        console.warn("[auth] ignored invalid redirect", error);
      }
    }
    navigate({ to: "/dashboard" });
  };

  const friendlyError = (err: any): string => {
    const msg = (err?.message ?? "").toString();
    const code = err?.code ?? err?.error_code ?? "";
    if (code === "invalid_credentials" || /invalid login/i.test(msg)) return "Wrong email or password. You can also try Demo Merchant Login.";
    if (code === "user_already_exists" || /already registered|already exists/i.test(msg)) return "An account with this email already exists. Try signing in.";
    if (code === "weak_password" || /weak/i.test(msg)) return "Password should be at least 6 characters.";
    return msg || "Authentication failed. Try Demo Login.";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, store_name: storeName, platform },
            emailRedirectTo: window.location.origin + "/dashboard",
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Welcome to Easibie!");
          done();
        } else {
          // Direct sign-in attempt
          const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
          if (signInErr) {
            toast.success("Account created! Please sign in.");
            setMode("signin");
          } else {
            toast.success("Welcome to Easibie!");
            done();
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        done();
      }
    } catch (err: any) {
      toast.error(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  // One-click demo merchant login for quick review and testing
  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // Try demo credentials first
      const { error } = await supabase.auth.signInWithPassword({
        email: "demo@easibie.com",
        password: "demo-password-2026",
      });
      if (error) {
        // If demo user doesn't exist in Supabase, sign up demo user or redirect to dashboard directly
        const { error: signUpErr } = await supabase.auth.signUp({
          email: "demo@easibie.com",
          password: "demo-password-2026",
          options: { data: { full_name: "Demo Merchant", store_name: "Atelier Studio" } }
        });
        if (signUpErr) {
          // navigate anyway to dashboard demo view
          toast.success("Entering Demo Merchant Mode...");
          navigate({ to: "/dashboard" });
          return;
        }
      }
      toast.success("Logged in as Demo Merchant!");
      done();
    } catch (e) {
      toast.success("Entering Demo Merchant Mode...");
      navigate({ to: "/dashboard" });
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    setGLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      setGLoading(false);
      return;
    }
    if (result.redirected) return;
    done();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 py-8 relative bg-[#F8FAFC]">
      {/* Ambient Deep Blue & Sky Glow Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-200/40 via-sky-100/20 to-transparent blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-10 w-[450px] h-[250px] bg-blue-100/30 blur-2xl rounded-full" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 w-full max-w-md mx-auto flex items-center justify-between">
        <EasibieLogo size="md" showSubtitle />
        <Link to="/" className="text-[12.5px] font-semibold text-[#64748B] hover:text-[#0B192C] transition">
          ← Back to home
        </Link>
      </div>

      {/* Main Auth Card */}
      <div className="relative z-10 w-full max-w-md mx-auto my-8">
        <div className="bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-[0_10px_35px_-5px_rgba(11,25,44,0.08)]">
          {/* Mode Switcher Pill */}
          <div className="p-1 bg-[#F1F5F9] rounded-full flex gap-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                mode === "signin"
                  ? "bg-white text-[#0B192C] shadow-sm"
                  : "text-[#64748B] hover:text-[#0B192C]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                mode === "signup"
                  ? "bg-white text-[#0B192C] shadow-sm"
                  : "text-[#64748B] hover:text-[#0B192C]"
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-[26px] font-extrabold text-[#0B192C] tracking-tight">
              {mode === "signup" ? "Launch Your Try-On Studio" : "Welcome Back, Retailer"}
            </h1>
            <p className="text-[13px] text-[#64748B] mt-1.5">
              {mode === "signup"
                ? "Start your 14-day free pilot. No developer or credit card required."
                : "Sign in to manage your products, embed widgets, and review analytics."}
            </p>
          </div>

          {/* Quick Demo Merchant Mode Button */}
          {mode === "signin" && (
            <div className="mb-5">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:border-blue-300 text-[#1E40AF] text-[12.5px] font-bold flex items-center justify-center gap-2 transition shadow-sm hover:shadow"
              >
                <Sparkles size={14} className="text-[#2563EB]" />
                Explore Demo Merchant Dashboard (1-Click)
              </button>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="text-[12px] font-bold text-[#0B192C] block mb-1">Your Full Name</label>
                  <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-[#CBD5E1] focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100 transition">
                    <User size={16} className="text-[#64748B] shrink-0" />
                    <input
                      type="text"
                      className="flex-1 bg-transparent text-[14px] text-[#0B192C] outline-none placeholder:text-[#94A3B8]"
                      placeholder="e.g. Liam Vance"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-[#0B192C] block mb-1">Store / Brand Name</label>
                  <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-[#CBD5E1] focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100 transition">
                    <Store size={16} className="text-[#64748B] shrink-0" />
                    <input
                      type="text"
                      className="flex-1 bg-transparent text-[14px] text-[#0B192C] outline-none placeholder:text-[#94A3B8]"
                      placeholder="e.g. Verve London Apparel"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-[#0B192C] block mb-1">Store Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-[#CBD5E1] bg-white text-[13.5px] text-[#0B192C] outline-none focus:border-[#2563EB]"
                  >
                    <option value="Shopify">Shopify / Shopify Plus</option>
                    <option value="WooCommerce">WooCommerce (WordPress)</option>
                    <option value="Custom">Custom Next.js / React / Headless</option>
                    <option value="Magento">Magento / Adobe Commerce</option>
                    <option value="Other">Other CMS</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="text-[12px] font-bold text-[#0B192C] block mb-1">Work Email</label>
              <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-[#CBD5E1] focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100 transition">
                <Mail size={16} className="text-[#64748B] shrink-0" />
                <input
                  type="email"
                  className="flex-1 bg-transparent text-[14px] text-[#0B192C] outline-none placeholder:text-[#94A3B8]"
                  placeholder="merchant@fashionbrand.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#0B192C] block mb-1">Password</label>
              <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-[#CBD5E1] focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100 transition">
                <KeyRound size={16} className="text-[#64748B] shrink-0" />
                <input
                  type={showPw ? "text" : "password"}
                  className="flex-1 bg-transparent text-[14px] text-[#0B192C] outline-none placeholder:text-[#94A3B8]"
                  placeholder={mode === "signup" ? "At least 6 characters" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="text-[#94A3B8] hover:text-[#0B192C] p-1"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full btn-blue-primary !py-3.5 !rounded-xl !text-[14px] font-bold justify-center mt-2"
            >
              {loading ? (
                "Processing..."
              ) : mode === "signup" ? (
                <>Create Free Account <ArrowRight size={15} /></>
              ) : (
                <>Sign In to Dashboard <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="flex-1 h-px bg-[#E2E8F0]" />
            <span className="text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase">or</span>
            <span className="flex-1 h-px bg-[#E2E8F0]" />
          </div>

          <button
            onClick={googleSignIn}
            disabled={gLoading}
            type="button"
            className="w-full py-3 px-4 rounded-xl border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[13.5px] font-semibold text-[#0B192C] flex items-center justify-center gap-2.5 transition"
          >
            <GoogleIcon /> {gLoading ? "Connecting..." : "Continue with Google"}
          </button>

          {/* Value Props Pills */}
          <div className="mt-6 pt-5 border-t border-[#F1F5F9] grid grid-cols-2 gap-2 text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> 14-day free pilot</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> Zero credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> 1-line store embed</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> Instant cancel</span>
          </div>
        </div>
      </div>

      {/* Bottom Legal */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center text-[11.5px] text-[#64748B]">
        Protected with 256-bit SSL encryption. We adhere strictly to the{" "}
        <span className="underline hover:text-[#0B192C]">Biometric Privacy Act</span>.
      </div>
    </div>
  );
}
