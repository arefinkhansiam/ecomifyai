import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, RotateCcw, Crown, Lock } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { ArLivePreview } from "@/components/ArLivePreview";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard/products/$id/customize")({
  component: CustomizePage,
});

const DEFAULTS = {
  label: "View in AR",
  bg: "#0369A1",
  bg2: "#38BDF8",
  fg: "#FFFFFF",
  radius: 14,
  useGradient: false,
  pageBg: "#000000",
  fontColor: "#FFFFFF",
  accent: "#38BDF8",
  overlay: "rgba(255,255,255,0.14)",
  arRadius: 14,
  arText: "View in Your Space",
  showBranding: true,
  showProductName: true,
  arBadge: "",
};

function CustomizePage() {
  const { id } = useParams({ from: "/_authenticated/dashboard/products/$id/customize" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [thumb, setThumb] = useState<string | null>(null);
  const [plan, setPlan] = useState<"free" | "starter" | "growth">("free");

  // Store button
  const [label, setLabel] = useState(DEFAULTS.label);
  const [useGradient, setUseGradient] = useState(false);
  const [bg, setBg] = useState(DEFAULTS.bg);
  const [bg2, setBg2] = useState(DEFAULTS.bg2);
  const [fg, setFg] = useState(DEFAULTS.fg);
  const [radius, setRadius] = useState(DEFAULTS.radius);

  // AR page
  const [pageBg, setPageBg] = useState(DEFAULTS.pageBg);
  const [fontColor, setFontColor] = useState(DEFAULTS.fontColor);
  const [accent, setAccent] = useState(DEFAULTS.accent);
  const [overlay, setOverlay] = useState(DEFAULTS.overlay);
  const [arRadius, setArRadius] = useState(DEFAULTS.arRadius);
  const [arText, setArText] = useState(DEFAULTS.arText);
  const [showBranding, setShowBranding] = useState(true);
  const [showProductName, setShowProductName] = useState(true);
  const [arBadge, setArBadge] = useState("");

  const isPaid = plan !== "free";

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: planRow }] = await Promise.all([
        supabase.from("ar_products").select("*").eq("id", id).maybeSingle(),
        supabase.from("user_plans").select("plan").eq("user_id", user.id).maybeSingle(),
      ]);
      if (!p || p.user_id !== user.id) { toast.error("Product not found"); navigate({ to: "/dashboard/products" }); return; }
      setPlan(((planRow as any)?.plan ?? "free") as any);
      setProduct(p);

      setLabel(p.button_label ?? DEFAULTS.label);
      setUseGradient(!!p.use_gradient);
      setBg(p.button_bg_color ?? DEFAULTS.bg);
      setBg2(p.gradient_to ?? DEFAULTS.bg2);
      setFg(p.button_text_color ?? DEFAULTS.fg);
      setRadius(p.button_border_radius ?? DEFAULTS.radius);

      const c = (p.ar_customization ?? {}) as any;
      setPageBg(c.page_bg ?? DEFAULTS.pageBg);
      setFontColor(c.font_color ?? DEFAULTS.fontColor);
      setAccent(c.accent_color ?? DEFAULTS.accent);
      setOverlay(c.overlay_color ?? DEFAULTS.overlay);
      setArRadius(c.button_radius ?? DEFAULTS.arRadius);
      setArText(c.custom_button_text ?? DEFAULTS.arText);
      setArBadge(c.ar_badge_text ?? "");
      setShowBranding(p.show_branding !== false);
      setShowProductName(c.show_product_name !== false);

      const path = p.processed_image_url ?? p.original_image_url;
      if (path) {
        const { data: signed } = await supabase.storage.from("product-images").createSignedUrl(path, 3600);
        if (signed?.signedUrl) setThumb(signed.signedUrl);
      }
      setLoading(false);
    })();
  }, [user, id, navigate]);

  const reset = () => {
    setLabel(DEFAULTS.label); setUseGradient(false); setBg(DEFAULTS.bg); setBg2(DEFAULTS.bg2);
    setFg(DEFAULTS.fg); setRadius(DEFAULTS.radius); setPageBg(DEFAULTS.pageBg);
    setFontColor(DEFAULTS.fontColor); setAccent(DEFAULTS.accent); setOverlay(DEFAULTS.overlay);
    setArRadius(DEFAULTS.arRadius); setArText(DEFAULTS.arText); setShowBranding(true);
    setShowProductName(true); setArBadge("");
  };

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("ar_products").update({
        button_label: label,
        button_bg_color: bg,
        button_text_color: fg,
        button_border_radius: radius,
        use_gradient: isPaid ? useGradient : false,
        gradient_from: bg,
        gradient_to: bg2,
        show_branding: isPaid ? showBranding : true,
        ar_customization: isPaid ? {
          page_bg: pageBg, font_color: fontColor, accent_color: accent, overlay_color: overlay,
          button_radius: arRadius, custom_button_text: arText,
          show_product_name: showProductName, ar_badge_text: arBadge || undefined,
        } : {},
      } as any).eq("id", id);
      if (error) throw error;
      toast.success("Saved");
      navigate({ to: "/dashboard/products" });
    } catch (e: any) {
      toast.error(e.message ?? "Could not save");
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <DashboardShell title="Customize"><div className="h-64 grid place-items-center"><Loader2 className="animate-spin text-primary" /></div></DashboardShell>
    );
  }

  const btnBg = useGradient ? `linear-gradient(135deg, ${bg} 0%, ${bg2} 100%)` : bg;

  return (
    <DashboardShell title={`Customize · ${product.product_name}`}>
      <Link to="/dashboard/products" className="btn-ghost mb-4 text-xs"><ArrowLeft size={14} /> Back to products</Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="bg-card rounded-2xl p-6 glow-card space-y-5">
          <h4 className="text-ink">Store button</h4>
          <Field label="Button label">
            <input className="input-base" value={label} maxLength={40} onChange={(e) => setLabel(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <ColorField label="Background" value={bg} onChange={setBg} />
            <ColorField label="Text" value={fg} onChange={setFg} />
          </div>
          <Field label={`Radius · ${radius}px`}>
            <input type="range" min={0} max={30} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full accent-sky-500" />
          </Field>
          <Toggle label="Use gradient" gated={!isPaid} on={useGradient} onChange={(v) => setUseGradient(v)} />
          {useGradient && isPaid && <ColorField label="Gradient end" value={bg2} onChange={setBg2} />}

          <hr style={{ borderColor: "var(--border)" }} />

          <div className="flex items-center justify-between">
            <h4 className="text-ink">AR viewer page</h4>
            {!isPaid && <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "linear-gradient(135deg,#7C3AED,#38BDF8)" }}><Crown size={9} /> Pro</span>}
          </div>
          {!isPaid ? (
            <p className="text-xs" style={{ color: "var(--ink-soft)" }}>Upgrade to fully customize the AR viewer (colors, accent, badge text, branding…).</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <ColorField label="Page bg" value={pageBg} onChange={setPageBg} />
                <ColorField label="Font color" value={fontColor} onChange={setFontColor} />
                <ColorField label="Accent" value={accent} onChange={setAccent} />
                <ColorField label="Overlay" value={overlay} onChange={setOverlay} />
              </div>
              <Field label={`AR button radius · ${arRadius}px`}>
                <input type="range" min={0} max={32} value={arRadius} onChange={(e) => setArRadius(Number(e.target.value))} className="w-full accent-sky-500" />
              </Field>
              <Field label="AR button text">
                <input className="input-base" value={arText} maxLength={40} onChange={(e) => setArText(e.target.value)} />
              </Field>
              <Field label="Badge text (top-left pill)">
                <input className="input-base" value={arBadge} maxLength={20} placeholder="auto (PLACE IT / TRY-ON / 3D AR)" onChange={(e) => setArBadge(e.target.value)} />
              </Field>
              <Toggle label="Show product name on AR page" on={showProductName} onChange={setShowProductName} />
              <Toggle label='Show "Powered by Easibie"' on={showBranding} onChange={setShowBranding} />
            </>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button onClick={reset} className="btn-ghost"><RotateCcw size={14} /> Reset</button>
          </div>
        </div>

        {/* Live preview */}
        <div className="bg-card rounded-2xl p-6 glow-card">
          <div className="text-[11px] uppercase tracking-wider text-muted mb-4 text-center">Live preview</div>
          <ArLivePreview
            productImage={thumb}
            productName={product.product_name}
            buttonLabel={label}
            buttonBg={btnBg}
            buttonFg={fg}
            buttonRadius={radius}
            pageBg={isPaid ? pageBg : "#000000"}
            fontColor={isPaid ? fontColor : "#FFFFFF"}
            accent={isPaid ? accent : bg}
            overlay={isPaid ? overlay : "rgba(255,255,255,0.14)"}
            arButtonRadius={isPaid ? arRadius : radius}
            arButtonText={isPaid ? arText : "View in Your Space"}
            showBranding={isPaid ? showBranding : true}
            showProductName={isPaid ? showProductName : true}
            mode={(product.ar_mode ?? "furniture") as any}
          />
        </div>
      </div>
    </DashboardShell>
  );
}

function Field({ label, children }: any) {
  return (
    <div>
      <label className="text-xs text-muted uppercase tracking-wide">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
function ColorField({ label, value, onChange }: any) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2 border rounded-xl px-2 py-1.5" style={{ borderColor: "var(--border)", background: "#fff" }}>
        <input type="color" value={/^#/.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value)} className="w-9 h-9 rounded cursor-pointer bg-transparent border-0" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 outline-none text-sm font-mono bg-transparent text-ink" />
      </div>
    </Field>
  );
}
function Toggle({ label, on, onChange, gated }: { label: string; on: boolean; onChange: (v: boolean) => void; gated?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-ink flex items-center gap-2">
        {label}{gated && <Lock size={12} className="text-muted" />}
      </div>
      <button onClick={() => { if (gated) { toast.info("Paid feature"); return; } onChange(!on); }}
        disabled={gated}
        className="relative w-11 h-6 rounded-full transition-colors shrink-0"
        style={{ background: on ? "var(--primary)" : "#cbd5e1", opacity: gated ? 0.5 : 1 }}>
        <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
              style={{ transform: on ? "translateX(22px)" : "translateX(2px)" }} />
      </button>
    </div>
  );
}
