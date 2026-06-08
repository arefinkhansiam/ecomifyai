import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Loader2, Camera, Store, User as UserIcon, Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, store_name, avatar_url").eq("id", user.id).maybeSingle().then(async ({ data }) => {
      setFullName(data?.full_name ?? user.user_metadata?.full_name ?? "");
      setStoreName((data as any)?.store_name ?? "");
      const path = data?.avatar_url ?? null;
      setAvatarPath(path);
      if (path) {
        const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
        setAvatarUrl(signed?.signedUrl ?? null);
      }
    });
  }, [user]);

  const onAvatar = async (f: File | null) => {
    if (!f || !user) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) { toast.error("Use JPG, PNG or WebP"); return; }
    if (f.size > 4 * 1024 * 1024) { toast.error("Max 4MB"); return; }
    setUploading(true);
    try {
      const ext = f.name.split(".").pop();
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, f, { upsert: true });
      if (error) throw error;
      await supabase.from("profiles").upsert({ id: user.id, avatar_url: path, email: user.email });
      setAvatarPath(path);
      const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
      setAvatarUrl(signed?.signedUrl ?? null);
      toast.success("Avatar updated");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally { setUploading(false); }
  };

  const save = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id, full_name: fullName, email: user.email, store_name: storeName, avatar_url: avatarPath,
    } as any);
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
      <div className="max-w-3xl space-y-6">
        {/* Avatar + identity */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(14px)", border: "1px solid rgba(2,132,199,0.18)", boxShadow: "0 18px 40px -22px rgba(2,132,199,0.35)" }}>
          <div className="flex items-center gap-2 text-ink"><UserIcon size={18} className="text-primary" /><h4 className="text-ink m-0">Profile</h4></div>
          <div className="mt-5 flex items-center gap-5 flex-wrap">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden grid place-items-center text-white font-display font-extrabold text-3xl"
                style={{ background: "linear-gradient(135deg,#0B1220 0%,#0369A1 50%,#38BDF8 100%)" }}>
                {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : (user?.email?.[0].toUpperCase() ?? "?")}
              </div>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full grid place-items-center text-white shadow-lg"
                style={{ background: "linear-gradient(135deg,#0369A1,#38BDF8)" }}>
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </button>
              <input ref={fileRef} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => onAvatar(e.target.files?.[0] ?? null)} />
            </div>
            <div>
              <div className="font-display font-bold text-ink text-lg">{fullName || user?.email}</div>
              <div className="text-sm" style={{ color: "var(--ink-soft)" }}>{user?.email}</div>
              <button onClick={() => fileRef.current?.click()} className="mt-2 text-xs font-semibold text-primary">Change photo</button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">Full name</label>
              <input className="input-base mt-1" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">Email</label>
              <input className="input-base mt-1" value={user?.email ?? ""} disabled />
            </div>
          </div>
        </div>

        {/* Store */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(14px)", border: "1px solid rgba(2,132,199,0.18)", boxShadow: "0 18px 40px -22px rgba(2,132,199,0.35)" }}>
          <div className="flex items-center gap-2"><Store size={18} className="text-primary" /><h4 className="text-ink m-0">Store</h4></div>
          <div className="mt-4">
            <label className="text-xs text-muted uppercase tracking-wide">Store name</label>
            <input className="input-base mt-1" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="My Awesome Store" />
          </div>
          <button onClick={save} disabled={busy} className="btn-primary mt-5">
            {busy && <Loader2 size={14} className="animate-spin" />} Save Changes
          </button>
        </div>

        {/* Security */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(14px)", border: "1px solid rgba(2,132,199,0.18)", boxShadow: "0 18px 40px -22px rgba(2,132,199,0.35)" }}>
          <div className="flex items-center gap-2"><Shield size={18} className="text-primary" /><h4 className="text-ink m-0">Security</h4></div>
          <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>Sign out from every device and browser.</p>
          <button onClick={danger} className="btn-ghost mt-4" style={{ borderColor: "var(--error)", color: "var(--error)" }}>
            Sign out everywhere
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
