import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Loader2, Camera, User as UserIcon, Crown, Shield, Bell, Plug, Gift, Copy, Trash2, Mail, ChevronRight, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: ProfilePage,
});

const GRAD = "linear-gradient(135deg, #0B1220 0%, #0369A1 50%, #38BDF8 100%)";

const COUNTRIES = ["United States", "United Kingdom", "Canada", "Australia", "Bangladesh", "India", "Germany", "France", "Spain", "Brazil", "Japan", "Other"];
const TIMEZONES = ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Asia/Dhaka", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney"];

function Card({ title, icon: Icon, children, accent }: { title: string; icon: any; children: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(14px)", border: "1px solid rgba(2,132,199,0.18)", boxShadow: "0 18px 40px -22px rgba(2,132,199,0.35)" }}>
      <div className="flex items-center gap-2"><Icon size={18} style={{ color: accent || "var(--primary)" }} /><h4 className="text-ink m-0">{title}</h4></div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <div className="text-sm font-semibold text-ink">{label}</div>
        {desc && <div className="text-xs" style={{ color: "var(--ink-soft)" }}>{desc}</div>}
      </div>
      <button onClick={() => onChange(!checked)} className="relative w-11 h-6 rounded-full transition-colors shrink-0" style={{ background: checked ? "var(--primary)" : "#cbd5e1" }}>
        <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform" style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }} />
      </button>
    </div>
  );
}

function ProfilePage() {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [avatarPath, setAvatarPath] = useState<string | null>(null);

  // Notifications
  const [notifyScan, setNotifyScan] = useState(true);
  const [notifyWeekly, setNotifyWeekly] = useState(true);
  const [notifyTips, setNotifyTips] = useState(true);

  // Stats
  const [stats, setStats] = useState<any>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(async ({ data }) => {
      if (!data) return;
      const d: any = data;
      setFullName(d.full_name ?? "");
      setPhone(d.phone ?? "");
      setBusinessName(d.business_name ?? d.store_name ?? "");
      setWebsite(d.website_url ?? "");
      setCountry(d.country ?? "");
      setTimezone(d.timezone ?? "UTC");
      setNotifyScan(d.notify_on_scan ?? true);
      setNotifyWeekly(d.notify_weekly_summary ?? true);
      setNotifyTips(d.notify_product_tips ?? true);
      setAvatarPath(d.avatar_url ?? null);
      if (d.avatar_url) {
        const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(d.avatar_url, 3600);
        setAvatarUrl(signed?.signedUrl ?? null);
      }
    });
    supabase.rpc("get_user_dashboard_stats", { uid: user.id }).then(({ data }) => setStats(data));
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
      await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.id);
      setAvatarPath(path);
      const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
      setAvatarUrl(signed?.signedUrl ?? null);
      toast.success("Avatar updated");
    } catch (e: any) { toast.error(e.message ?? "Upload failed"); }
    finally { setUploading(false); }
  };

  const saveProfile = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName, phone, business_name: businessName, website_url: website, country, timezone,
    } as any).eq("id", user.id);
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Profile saved");
  };

  const saveNotifications = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      notify_on_scan: notifyScan, notify_weekly_summary: notifyWeekly, notify_product_tips: notifyTips,
    } as any).eq("id", user.id);
    if (error) toast.error(error.message); else toast.success("Preferences saved");
  };

  const sendReset = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/auth` });
    if (error) toast.error(error.message); else toast.success("Password reset email sent");
  };

  const sendChangeEmail = async () => {
    toast.info("To change your email, contact support — secure email changes require verification.");
  };

  const deleteAccount = async () => {
    if (!user) return;
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false);
    window.location.href = "/";
    toast.info("Account deletion requested. Contact support to complete deletion.");
  };

  const plan = stats?.plan ?? "free";
  const slotsUsed = stats?.ar_slots_used ?? 0;
  const slotLimit = stats?.plan_limit ?? 1;
  const isPaid = plan !== "free";
  const initial = (fullName || user?.email || "?")[0].toUpperCase();
  const referralLink = typeof window !== "undefined" ? `${window.location.origin}/auth?mode=signup&ref=${user?.id?.slice(0, 8)}` : "";
  const widgetSnippet = `<script src="${typeof window !== "undefined" ? window.location.origin : ""}/widget.js" data-product-id="YOUR_PRODUCT_ID"></script>`;

  return (
    <DashboardShell title="Profile">
      <div className="max-w-4xl space-y-6">
        {/* A — Account */}
        <Card title="Account information" icon={UserIcon}>
          <div className="flex items-center gap-5 flex-wrap">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden grid place-items-center text-white font-display font-extrabold text-3xl" style={{ background: GRAD }}>
                {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initial}
              </div>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full grid place-items-center text-white shadow-lg" style={{ background: GRAD }}>
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
            <Field label="Display name"><input className="input-base" value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
            <Field label="Email">
              <div className="flex gap-2">
                <input className="input-base flex-1" value={user?.email ?? ""} disabled />
                <button onClick={sendChangeEmail} className="btn-ghost text-xs whitespace-nowrap"><Mail size={12} /> Change</button>
              </div>
            </Field>
            <Field label="Phone"><input className="input-base" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" /></Field>
            <Field label="Business name"><input className="input-base" value={businessName} onChange={(e) => setBusinessName(e.target.value)} /></Field>
            <Field label="Website URL"><input className="input-base" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" /></Field>
            <Field label="Country">
              <select className="input-base" value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="">Select…</option>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Timezone">
              <select className="input-base" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                {TIMEZONES.map((tz) => <option key={tz}>{tz}</option>)}
              </select>
            </Field>
          </div>
          <button onClick={saveProfile} disabled={busy} className="btn-primary mt-5">{busy && <Loader2 size={14} className="animate-spin" />} Save profile</button>
        </Card>

        {/* B — Plan & Usage */}
        <Card title="Plan and usage" icon={Crown} accent="#0369A1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wide" style={{ background: isPaid ? GRAD : "#64748B" }}>
              {plan}
            </span>
            {plan !== "growth" && <Link to="/pricing" className="btn-primary text-xs">Upgrade plan</Link>}
          </div>
          <div className="mt-5">
            <div className="text-xs text-muted uppercase tracking-wide">Try-On slots used (permanent)</div>
            <div className="font-display font-extrabold text-2xl mt-1" style={{ background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{slotsUsed} of {slotLimit}</div>
            <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: "#E2E8F0" }}>
              <div className="h-full" style={{ width: `${Math.min(100, (slotsUsed / Math.max(1, slotLimit)) * 100)}%`, background: GRAD }} />
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--ink-soft)" }}>Deleting a Try-On product does not refund your slot.</p>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-5 text-center">
            <Mini label="Products" value={stats?.total_products ?? 0} />
            <Mini label="Embeds" value={stats?.total_embeds ?? 0} />
            <Mini label="Sessions / month" value={stats?.sessions_this_month ?? 0} />
          </div>
          <Link to="/dashboard/billing" className="btn-ghost text-xs mt-5"><ChevronRight size={12} /> Billing history</Link>
        </Card>

        {/* C — Notifications */}
        <Card title="Notification preferences" icon={Bell}>
          <Toggle checked={notifyScan} onChange={setNotifyScan} label="Email me when someone opens my Try-On" />
          <Toggle checked={notifyWeekly} onChange={setNotifyWeekly} label="Weekly analytics summary email" />
          <Toggle checked={notifyTips} onChange={setNotifyTips} label="Product tips and feature updates" />
          <button onClick={saveNotifications} className="btn-primary mt-3">Save preferences</button>
        </Card>

        {/* D — Security */}
        <Card title="Security" icon={Shield}>
          <button onClick={sendReset} className="btn-ghost">Change password (email me a reset link)</button>
          <div className="mt-5">
            <div className="text-xs uppercase tracking-wide text-muted">Active sessions</div>
            <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>Session management coming soon.</p>
          </div>
          <button onClick={() => setShowDelete(true)} className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border" style={{ borderColor: "#EF4444", color: "#EF4444" }}>
            <Trash2 size={14} /> Delete account
          </button>
        </Card>

        {/* E — Integrations */}
        <Card title="Integrations" icon={Plug}>
          <div className="space-y-3">
            <Integration name="Store platform" desc="Embed Try-On buttons directly in product templates." />
            <Integration name="Website widget" desc="Drop-in widget on any commerce site." />
            <div>
              <div className="text-xs uppercase tracking-wide text-muted">Custom embed snippet</div>
              <pre className="mt-2 p-3 rounded-xl text-xs font-mono overflow-x-auto" style={{ background: "#0B1220", color: "#E0F2FE" }}>{widgetSnippet}</pre>
              <button onClick={() => { navigator.clipboard.writeText(widgetSnippet); toast.success("Copied"); }} className="btn-ghost text-xs mt-2"><Copy size={12} /> Copy snippet</button>
            </div>
          </div>
        </Card>

        {/* F — Referral */}
        <Card title="Refer a friend" icon={Gift}>
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>Invite friends, earn free months. Coming soon — share your link to be first in line.</p>
          <div className="mt-3 flex gap-2">
            <input className="input-base flex-1" value={referralLink} readOnly />
            <button onClick={() => { navigator.clipboard.writeText(referralLink); setCopiedRef(true); setTimeout(() => setCopiedRef(false), 1500); }} className="btn-primary text-xs">
              {copiedRef ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
        </Card>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center p-6 bg-black/50" onClick={() => setShowDelete(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-ink">Delete your account?</h3>
            <p className="text-sm mt-3 text-ink">This permanently removes your Try-On products, analytics and profile. This cannot be undone.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowDelete(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={deleteAccount} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ background: "#EF4444" }}>
                <Trash2 size={14} /> Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs text-muted uppercase tracking-wide">{label}</label><div className="mt-1">{children}</div></div>;
}
function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(2,132,199,0.06)", border: "1px solid rgba(2,132,199,0.15)" }}>
      <div className="font-display font-extrabold text-xl text-ink">{value.toLocaleString()}</div>
      <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--muted)" }}>{label}</div>
    </div>
  );
}
function Integration({ name, desc }: { name: string; desc: string }) {
  const [connected, setConnected] = useState(false);
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl" style={{ background: "rgba(2,132,199,0.04)", border: "1px solid rgba(2,132,199,0.12)" }}>
      <div>
        <div className="text-sm font-semibold text-ink">{name}</div>
        <div className="text-xs" style={{ color: "var(--ink-soft)" }}>{desc}</div>
      </div>
      <button onClick={() => { setConnected(!connected); toast.info(connected ? `${name} disconnected (demo)` : `${name} connect flow coming soon`); }} className="btn-ghost text-xs">{connected ? "Disconnect" : "Connect"}</button>
    </div>
  );
}
