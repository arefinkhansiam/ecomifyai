import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, KeyRound, User, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional(), redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in to Ecomify" },
      { name: "description", content: "Sign in or create your Ecomify account to launch AI-powered Try-On experiences in minutes." },
    ],
  }),
  component: AuthPage,
});

const GRAD = "linear-gradient(135deg, #0369A1 0%, #06B6D4 50%, #38BDF8 100%)";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
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
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signup");
  const [fullName, setFullName] = useState("");
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
    if (code === "invalid_credentials" || /invalid login/i.test(msg)) return "Wrong email or password. Please try again.";
    if (code === "user_already_exists" || /already registered|already exists/i.test(msg)) return "An account with this email already exists. Try signing in instead.";
    if (code === "weak_password" || /weak|pwned/i.test(msg)) return "That password is too weak. Use at least 8 characters with letters and numbers.";
    if (code === "email_address_invalid" || /invalid.*email/i.test(msg)) return "Please enter a valid email address.";
    if (code === "over_email_send_rate_limit" || /rate limit/i.test(msg)) return "Too many attempts. Please wait a moment and try again.";
    if (/network|fetch/i.test(msg)) return "Network issue. Check your connection and try again.";
    return msg || "Authentication failed. Please try again.";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Welcome to Ecomify!");
          done();
        } else {
          // Email confirmation required — try direct sign in
          const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
          if (signInErr) {
            toast.success("Account created. Please check your email to confirm, then sign in.");
            setMode("signin");
          } else {
            toast.success("Welcome to Ecomify!");
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

  const googleSignIn = async () => {
    setGLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) { toast.error(result.error.message ?? "Google sign-in failed"); setGLoading(false); return; }
    if (result.redirected) return;
    done();
  };

  const inputWrap = "flex items-center gap-3 rounded-2xl px-4 py-4 transition-colors focus-within:border-[#38BDF8]";
  const inputWrapStyle: React.CSSProperties = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(56,189,248,0.22)" };

  return (
    <div className="min-h-screen flex flex-col px-5 py-6 relative overflow-hidden" style={{
      background: `
        radial-gradient(ellipse 80% 45% at 50% 0%, rgba(3,105,161,0.35), transparent 70%),
        radial-gradient(ellipse 60% 40% at 100% 100%, rgba(56,189,248,0.12), transparent 70%),
        linear-gradient(180deg, #02060c 0%, #060d18 55%, #0B1220 100%)
      `,
    }}>
      {/* top label + progress bars */}
      <div className="w-full max-w-md mx-auto">
        <p className="text-center text-sm" style={{ color: "rgba(148,163,184,0.9)" }}>
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-1 rounded-full" style={{ background: GRAD, boxShadow: "0 0 12px rgba(56,189,248,0.6)" }} />
          ))}
        </div>
      </div>

      <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center py-8">
        <h1 className="font-display font-extrabold uppercase tracking-tight text-center leading-[1.05] text-[34px] sm:text-[40px]"
          style={{ backgroundImage: "linear-gradient(180deg, #ffffff 0%, #7dd3fc 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          {mode === "signup" ? <>Create account<br />to start selling</> : <>Sign in to<br />your dashboard</>}
        </h1>

        <form onSubmit={submit} className="mt-9 space-y-4">
          {mode === "signup" && (
            <div className={inputWrap} style={inputWrapStyle}>
              <User size={18} className="shrink-0" style={{ color: "#7dd3fc" }} />
              <input className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-500 text-[15px]"
                placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required />
            </div>
          )}
          <div className={inputWrap} style={inputWrapStyle}>
            <Mail size={18} className="shrink-0" style={{ color: "#7dd3fc" }} />
            <input type="email" className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-500 text-[15px]"
              placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </div>
          <div className={inputWrap} style={inputWrapStyle}>
            <KeyRound size={18} className="shrink-0" style={{ color: "#7dd3fc" }} />
            <input type={showPw ? "text" : "password"} className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-500 text-[15px]"
              placeholder={mode === "signup" ? "Password (min 8 characters)" : "Password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={8} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="shrink-0" style={{ color: "rgba(148,163,184,0.8)" }} aria-label="Toggle password visibility">
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button disabled={loading} type="submit"
            className="w-full py-4 rounded-2xl font-bold text-base text-white transition-transform active:scale-[0.99]"
            style={{ background: GRAD, boxShadow: "0 16px 40px -12px rgba(56,189,248,0.55), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
            {loading ? "Please wait…" : "Continue"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <span className="flex-1 h-px" style={{ background: "rgba(148,163,184,0.25)" }} />
          <span className="text-xs font-semibold tracking-widest" style={{ color: "rgba(148,163,184,0.8)" }}>OR</span>
          <span className="flex-1 h-px" style={{ background: "rgba(148,163,184,0.25)" }} />
        </div>

        <button onClick={googleSignIn} disabled={gLoading}
          className="w-full py-4 rounded-2xl font-semibold text-[15px] text-white flex items-center justify-center gap-3 transition-colors"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(148,163,184,0.25)" }}>
          <GoogleIcon /> {gLoading ? "Connecting…" : "Continue with Google"}
        </button>

        <div className="mt-7 text-sm text-center" style={{ color: "rgba(148,163,184,0.9)" }}>
          {mode === "signup" ? (
            <>Already have an account?{" "}
              <button onClick={() => setMode("signin")} className="font-semibold underline underline-offset-4" style={{ color: "#7dd3fc" }}>Sign in</button></>
          ) : (
            <>New to Ecomify?{" "}
              <button onClick={() => setMode("signup")} className="font-semibold underline underline-offset-4" style={{ color: "#7dd3fc" }}>Create a free account</button></>
          )}
        </div>
      </div>

      <div className="w-full max-w-md mx-auto text-center text-xs leading-relaxed" style={{ color: "rgba(100,116,139,0.9)" }}>
        By continuing, I acknowledge the <span className="underline">Privacy Policy</span> and agree to the <span className="underline">Terms of Use</span>.
        <div className="mt-3"><Link to="/" className="hover:text-white" style={{ color: "rgba(148,163,184,0.7)" }}>← Back to home</Link></div>
      </div>
    </div>
  );
}
