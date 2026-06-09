import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MarketingShell } from "@/components/MarketingShell";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional() });

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

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        toast.success("Account created. Welcome to Ecomify.");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarketingShell>
      <section className="relative min-h-[calc(100vh-72px)] grid place-items-center px-6 py-16 overflow-hidden">
        {/* Premium gradient backdrop */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, #02060c 0%, #0a1929 22%, #0f3050 45%, #15649e 68%, #38bdf8 88%, #e0f2fe 100%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 900px 600px at 50% 0%, rgba(56,189,248,0.28), transparent 70%)" }} />
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full opacity-40 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)" }} />
        <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #38BDF8 0%, transparent 70%)" }} />

        <div className="relative w-full max-w-md">
          {/* Glow ring */}
          <div className="absolute -inset-[1.5px] rounded-[28px] opacity-90" style={{ background: "linear-gradient(135deg, #38BDF8, #06B6D4 45%, #0369A1)" }} />
          <div className="relative rounded-[26px] p-8 sm:p-10" style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(24px)", boxShadow: "0 40px 90px -30px rgba(2,132,199,0.55)" }}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]">
              <span className="px-3 py-1 rounded-full text-white" style={{ background: "linear-gradient(135deg,#0369A1,#06B6D4,#38BDF8)" }}>
                {mode === "signup" ? "Create account" : "Welcome back"}
              </span>
            </div>
            <h1 className="mt-5 text-[34px] leading-[1.05] font-display font-extrabold tracking-tight text-gradient-ocean">
              {mode === "signup" ? "Start free in 30 seconds." : "Sign in to Ecomify."}
            </h1>
            <p className="mt-3 text-sm" style={{ color: "var(--ink-soft)" }}>
              {mode === "signup" ? "No credit card. 1 Try-On product on us — forever." : "Pick up exactly where you left off."}
            </p>

            <form onSubmit={submit} className="mt-7 space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="text-[11px] text-muted uppercase tracking-[0.14em] font-semibold">Full name</label>
                  <input className="input-base mt-1.5" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
              )}
              <div>
                <label className="text-[11px] text-muted uppercase tracking-[0.14em] font-semibold">Email</label>
                <input type="email" className="input-base mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="text-[11px] text-muted uppercase tracking-[0.14em] font-semibold">Password</label>
                <input type="password" className="input-base mt-1.5" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <button disabled={loading} type="submit" className="btn-cyan w-full" style={{ marginTop: 8 }}>
                {loading ? "Please wait…" : mode === "signup" ? "Create Free Account" : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-sm text-center" style={{ color: "var(--ink-soft)" }}>
              {mode === "signup" ? (
                <>Already have an account?{" "}
                  <button onClick={() => setMode("signin")} className="font-semibold" style={{ color: "var(--primary)" }}>Sign in</button></>
              ) : (
                <>New to Ecomify?{" "}
                  <button onClick={() => setMode("signup")} className="font-semibold" style={{ color: "var(--primary)" }}>Create a free account</button></>
              )}
            </div>
            <div className="mt-5 text-center text-xs text-muted">
              <Link to="/" className="hover:text-ink">← Back to home</Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
