import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import { MarketingShell } from "@/components/MarketingShell";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in to Easibie" },
      { name: "description", content: "Sign in or create an Easibie account to start building AR experiences." },
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
        toast.success("Account created. Welcome to Easibie.");
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
      <section className="min-h-[80vh] grid place-items-center px-6 py-16">
        <div className="w-full max-w-md bg-card rounded-2xl p-8">
          <div className="flex items-center gap-2 text-cyan text-sm">
            <Sparkles size={16} /> {mode === "signup" ? "Create your account" : "Welcome back"}
          </div>
          <h1 className="mt-3 text-3xl text-white font-display font-bold">
            {mode === "signup" ? "Start free in 30 seconds" : "Sign in to Easibie"}
          </h1>
          <p className="mt-2 text-sm">
            {mode === "signup" ? "No credit card required. 1 AR product on us." : "Pick up where you left off."}
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs text-muted uppercase tracking-wide">Full name</label>
                <input className="input-base mt-1" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">Email</label>
              <input type="email" className="input-base mt-1" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">Password</label>
              <input type="password" className="input-base mt-1" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <button disabled={loading} type="submit" className="btn-primary w-full">
              {loading ? <Loader2 className="animate-spin" size={16} /> : mode === "signup" ? "Create Account" : "Sign In"}
            </button>
          </form>
          <div className="mt-6 text-sm text-center text-muted">
            {mode === "signup" ? (
              <>Already have an account?{" "}
                <button onClick={() => setMode("signin")} className="text-cyan hover:underline">Sign in</button></>
            ) : (
              <>Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-cyan hover:underline">Get started free</button></>
            )}
          </div>
          <div className="mt-6 text-center text-xs text-muted">
            <Link to="/" className="hover:text-white">← Back to home</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
