import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle().then(({ data }) => {
      setFullName(data?.full_name ?? user.user_metadata?.full_name ?? "");
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, full_name: fullName, email: user.email });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Profile saved");
  };

  const danger = async () => {
    if (!confirm("Sign out of all sessions?")) return;
    await supabase.auth.signOut({ scope: "global" });
    window.location.href = "/";
  };

  return (
    <DashboardShell title="Settings">
      <div className="max-w-2xl space-y-6">
        <div className="bg-card rounded-2xl p-6">
          <h3 className="text-white">Profile</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">Email</label>
              <input className="input-base mt-1" value={user?.email ?? ""} disabled />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">Full name</label>
              <input className="input-base mt-1" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <button onClick={save} disabled={busy} className="btn-primary">
              {busy && <Loader2 size={14} className="animate-spin" />} Save Changes
            </button>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6">
          <h3 className="text-white">Security</h3>
          <p className="mt-2 text-sm">Sign out from every device and browser.</p>
          <button onClick={danger} className="btn-ghost mt-4" style={{ borderColor: "var(--error)", color: "var(--error)" }}>
            Sign out everywhere
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
