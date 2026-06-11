import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { ArLivePreview } from "@/components/ArLivePreview";
import { ColorControl } from "@/components/ColorControl";
import { GradientBuilder, gradientToCSS, parseGradient, type GradientValue } from "@/components/GradientBuilder";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard/products/$id/customize")({
  component: CustomizePage,
});

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "Space Grotesk", label: "Space Grotesk" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans" },
  { value: "DM Sans", label: "DM Sans" },
  { value: "Manrope", label: "Manrope" },
];

const DEFAULTS = {
  label: "Try it on",
  bg: "#0369A1",
  fg: "#FFFFFF",
  radius: 14,
  useGradient: false,
  gradient: { stops: [{ color: "#0369A1", position: 0 }, { color: "#38BDF8", position: 100 }], direction: "diagonal" as const, angle: 135 } as GradientValue,
  pageBg: "#0B1220",
  fontColor: "#FFFFFF",
  accent: "#38BDF8",
  overlay: "rgba(255,255,255,0.14)",
  arRadius: 14,
  arText: "View in Your Space",
  showBranding: true,
  showProductName: true,
  arBadge: "",
  fontFamily: "Inter",
  fontSize: 16,
  headerTitle: "",
  headerSubtitle: "",
  bgType: "solid" as "solid" | "gradient" | "image",
  bgValue: "#0B1220",
  buttonShadow: true,
  watermarkPosition: "bottom-right" as "bottom-right" | "bottom-left" | "center",
  watermarkOpacity: 70,
  showPlatformWatermark: false,
};

function CustomizePage() {
  const { id } = useParams({ from: "/_authenticated/dashboard/products/$id/customize" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [thumb, setThumb] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");

  // Store button
  const [label, setLabel] = useState(DEFAULTS.label);
  const [useGradient, setUseGradient] = useState(false);
  const [bg, setBg] = useState(DEFAULTS.bg);
  const [gradient, setGradient] = useState<GradientValue>(DEFAULTS.gradient);
  const [fg, setFg] = useState(DEFAULTS.fg);
  const [radius, setRadius] = useState(DEFAULTS.radius);
  const [buttonShadow, setButtonShadow] = useState(true);
  const [buttonGlow, setButtonGlow] = useState(true);

  // Try-On page
  const [pageBg, setPageBg] = useState(DEFAULTS.pageBg);
  const [fontColor, setFontColor] = useState(DEFAULTS.fontColor);
  const [accent, setAccent] = useState(DEFAULTS.accent);
  const [overlay, setOverlay] = useState(DEFAULTS.overlay);
  const [arRadius, setArRadius] = useState(DEFAULTS.arRadius);
  const [arText, setArText] = useState(DEFAULTS.arText);
  const [showBranding, setShowBranding] = useState(true);
  const [showProductName, setShowProductName] = useState(true);
  const [arBadge, setArBadge] = useState("");

  // Page customization
  const [fontFamily, setFontFamily] = useState(DEFAULTS.fontFamily);
  const [fontSize, setFontSize] = useState(DEFAULTS.fontSize);
  const [headerTitle, setHeaderTitle] = useState("");
  const [headerSubtitle, setHeaderSubtitle] = useState("");
  const [bgType, setBgType] = useState<"solid" | "gradient" | "image">("solid");
  const [bgSolid, setBgSolid] = useState(DEFAULTS.pageBg);
  const [bgGradient, setBgGradient] = useState<GradientValue>(DEFAULTS.gradient);
  const [bgImage, setBgImage] = useState<string>("");

  // Watermark
  const [watermarkPosition, setWatermarkPosition] = useState<"bottom-right" | "bottom-left" | "center">("bottom-right");
  const [watermarkOpacity, setWatermarkOpacity] = useState(70);
  const [showPlatformWatermark, setShowPlatformWatermark] = useState(false);

  // Alternatives
  const [alternatives, setAlternatives] = useState<Array<{ id: string; name: string; image: string | null }>>([]);
  const [allProducts, setAllProducts] = useState<Array<{ id: string; name: string; image: string | null }>>([]);
  const [showAltPicker, setShowAltPicker] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: branding }, { data: alts }, { data: allP }] = await Promise.all([
        supabase.from("ar_products").select("*").eq("id", id).maybeSingle(),
        supabase.from("tryon_branding").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("product_alternatives" as any).select("alt_product_id, position").eq("product_id", id).order("position"),
        supabase.from("ar_products").select("id, product_name, original_image_url, processed_image_url").eq("user_id", user.id).eq("status", "ready").neq("id", id).limit(50),
      ]);
      if (!p || p.user_id !== user.id) { toast.error("Product not found"); navigate({ to: "/dashboard/products" }); return; }
      setProduct(p);

      setLabel(p.button_label ?? DEFAULTS.label);
      setUseGradient(!!p.use_gradient);
      setBg(p.button_bg_color ?? DEFAULTS.bg);
      if (p.gradient_from || p.gradient_to) {
        setGradient({ stops: [{ color: p.gradient_from || DEFAULTS.bg, position: 0 }, { color: p.gradient_to || "#38BDF8", position: 100 }], direction: "diagonal", angle: 135 });
      }
      setFg(p.button_text_color ?? DEFAULTS.fg);
      setRadius(p.button_border_radius ?? DEFAULTS.radius);

      const c = (p.ar_customization ?? {}) as any;
      if (c.gradient_data) setGradient(parseGradient(c.gradient_data));
      setPageBg(c.page_bg ?? DEFAULTS.pageBg);
      setFontColor(c.font_color ?? DEFAULTS.fontColor);
      setAccent(c.accent_color ?? DEFAULTS.accent);
      setOverlay(c.overlay_color ?? DEFAULTS.overlay);
      setArRadius(c.button_radius ?? DEFAULTS.arRadius);
      setArText(c.custom_button_text ?? DEFAULTS.arText);
      setArBadge(c.ar_badge_text ?? "");
      setShowBranding(p.show_branding !== false);
      setShowProductName(c.show_product_name !== false);
      setButtonShadow(c.button_shadow !== false);
      setButtonGlow(c.button_glow !== false);

      // Branding-level
      const b = (branding as any) ?? {};
      setFontFamily(b.font_family ?? DEFAULTS.fontFamily);
      setFontSize(b.font_size ?? DEFAULTS.fontSize);
      setHeaderTitle(b.header_title ?? "");
      setHeaderSubtitle(b.header_subtitle ?? "");
      setBgType((b.background_type ?? "solid") as any);
      if (b.background_type === "gradient" && b.background_value) {
        try { setBgGradient(parseGradient(JSON.parse(b.background_value))); } catch {}
      } else if (b.background_type === "image") {
        setBgImage(b.background_value ?? "");
      } else {
        setBgSolid(b.background_value ?? DEFAULTS.pageBg);
      }
      setWatermarkPosition((b.watermark_position ?? "bottom-right") as any);
      setWatermarkOpacity(b.watermark_opacity ?? 70);
      setShowPlatformWatermark(b.show_platform_watermark ?? false);

      const path = p.processed_image_url ?? p.original_image_url;
      if (path) {
        const { data: signed } = await supabase.storage.from("product-images").createSignedUrl(path, 3600);
        if (signed?.signedUrl) setThumb(signed.signedUrl);
      }

      // Resolve alternatives
      const altIds = (alts ?? []).map((a: any) => a.alt_product_id);
      const all = (allP ?? []) as any[];
      const allMap: Record<string, any> = {};
      await Promise.all(all.map(async (pp) => {
        const pth = pp.processed_image_url ?? pp.original_image_url;
        let img: string | null = null;
        if (pth) {
          const { data: s } = await supabase.storage.from("product-images").createSignedUrl(pth, 3600);
          img = s?.signedUrl ?? null;
        }
        allMap[pp.id] = { id: pp.id, name: pp.product_name, image: img };
      }));
      setAllProducts(Object.values(allMap));
      setAlternatives(altIds.map((aid: string) => allMap[aid]).filter(Boolean));

      setLoading(false);
    })();
  }, [user, id, navigate]);

  const reset = () => {
    setLabel(DEFAULTS.label); setUseGradient(false); setBg(DEFAULTS.bg); setGradient(DEFAULTS.gradient);
    setFg(DEFAULTS.fg); setRadius(DEFAULTS.radius); setPageBg(DEFAULTS.pageBg);
    setFontColor(DEFAULTS.fontColor); setAccent(DEFAULTS.accent); setOverlay(DEFAULTS.overlay);
    setArRadius(DEFAULTS.arRadius); setArText(DEFAULTS.arText); setShowBranding(true);
    setShowProductName(true); setArBadge(""); setButtonShadow(true);
    setFontFamily(DEFAULTS.fontFamily); setFontSize(DEFAULTS.fontSize);
    setHeaderTitle(""); setHeaderSubtitle("");
    setBgType("solid"); setBgSolid(DEFAULTS.pageBg);
    setWatermarkPosition("bottom-right"); setWatermarkOpacity(70); setShowPlatformWatermark(false);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const btnBg = useGradient ? gradientToCSS(gradient) : bg;
      // Save product-level
      const { error } = await supabase.from("ar_products").update({
        button_label: label,
        button_bg_color: bg,
        button_text_color: fg,
        button_border_radius: radius,
        use_gradient: useGradient,
        gradient_from: gradient.stops[0]?.color,
        gradient_to: gradient.stops[gradient.stops.length - 1]?.color,
        show_branding: showBranding,
        ar_customization: {
          page_bg: bgType === "solid" ? bgSolid : bgType === "gradient" ? gradientToCSS(bgGradient) : bgImage,
          font_color: fontColor, accent_color: accent, overlay_color: overlay,
          button_radius: arRadius, custom_button_text: arText,
          show_product_name: showProductName, ar_badge_text: arBadge || undefined,
          button_shadow: buttonShadow,
          button_glow: buttonGlow,
          font_family: fontFamily,
          gradient_data: gradient,
        },
      } as any).eq("id", id);
      if (error) throw error;

      // Save vendor branding row
      const bgValueStr = bgType === "gradient" ? JSON.stringify(bgGradient) : bgType === "image" ? bgImage : bgSolid;
      await supabase.from("tryon_branding").upsert({
        user_id: user.id,
        button_label: label,
        button_bg: bg,
        button_text_color: fg,
        accent_color: accent,
        font: fontFamily,
        font_family: fontFamily,
        font_size: fontSize,
        viewer_bg: bgSolid,
        header_title: headerTitle || null,
        header_subtitle: headerSubtitle || null,
        background_type: bgType,
        background_value: bgValueStr,
        button_radius: radius,
        button_shadow: buttonShadow,
        watermark_position: watermarkPosition,
        watermark_opacity: watermarkOpacity,
        show_platform_watermark: showPlatformWatermark,
      } as any, { onConflict: "user_id" });

      // Save alternatives
      await supabase.from("product_alternatives" as any).delete().eq("product_id", id);
      if (alternatives.length > 0) {
        await supabase.from("product_alternatives" as any).insert(
          alternatives.slice(0, 10).map((a, i) => ({
            product_id: id, alt_product_id: a.id, user_id: user.id, position: i,
          })) as any,
        );
      }

      toast.success("All changes saved");
    } catch (e: any) {
      toast.error(e.message ?? "Could not save");
    } finally { setSaving(false); }
  };

  const previewPageBg = useMemo(() => {
    if (bgType === "gradient") return gradientToCSS(bgGradient);
    if (bgType === "image" && bgImage) return `url(${bgImage}) center/cover`;
    return bgSolid;
  }, [bgType, bgGradient, bgImage, bgSolid]);

  const addAlternative = (p: { id: string; name: string; image: string | null }) => {
    if (alternatives.length >= 10) { toast.info("Up to 10 alternatives"); return; }
    if (alternatives.some((a) => a.id === p.id)) return;
    setAlternatives([...alternatives, p]);
    setShowAltPicker(false);
  };
  const removeAlternative = (idx: number) => setAlternatives(alternatives.filter((_, i) => i !== idx));
  const moveAlternative = (idx: number, dir: -1 | 1) => {
    const next = [...alternatives];
    const t = idx + dir;
    if (t < 0 || t >= next.length) return;
    [next[idx], next[t]] = [next[t], next[idx]];
    setAlternatives(next);
  };

  if (loading) {
    return <DashboardShell title="Customize"><div className="h-64 grid place-items-center text-sm text-muted">Loading customization</div></DashboardShell>;
  }

  const btnBg = useGradient ? gradientToCSS(gradient) : bg;

  return (
    <DashboardShell title={`Customize · ${product.product_name}`}>
      <Link to="/dashboard/products" className="btn-ghost mb-4 text-xs">Back to products</Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="bg-card rounded-2xl p-6 glow-card space-y-5">
          {/* Store button */}
          <Section title="Store button">
            <Field label="Button label">
              <input className="input-base" value={label} maxLength={40} onChange={(e) => setLabel(e.target.value)} />
            </Field>
            <Toggle label="Use gradient background" on={useGradient} onChange={setUseGradient} />
            {!useGradient ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ColorControl label="Background" value={bg} onChange={setBg} />
                <ColorControl label="Text" value={fg} onChange={setFg} />
              </div>
            ) : (
              <>
                <GradientBuilder value={gradient} onChange={setGradient} />
                <ColorControl label="Text color" value={fg} onChange={setFg} />
              </>
            )}
            <Field label={`Radius · ${radius}px`}>
              <input type="range" min={0} max={30} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full accent-sky-500" />
            </Field>
            <Toggle label="Button shadow" on={buttonShadow} onChange={setButtonShadow} />
          </Section>

          <Section title="Try-On viewer">
            <Field label="Header title">
              <input className="input-base" value={headerTitle} maxLength={60} placeholder="Optional" onChange={(e) => setHeaderTitle(e.target.value)} />
            </Field>
            <Field label="Header subtitle">
              <input className="input-base" value={headerSubtitle} maxLength={120} placeholder="Optional" onChange={(e) => setHeaderSubtitle(e.target.value)} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Font family">
                <select className="input-base" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                  {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </Field>
              <Field label={`Font size · ${fontSize}px`}>
                <input type="range" min={12} max={22} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-sky-500" />
              </Field>
            </div>

            <Field label="Background">
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {(["solid", "gradient", "image"] as const).map((t) => (
                  <button key={t} onClick={() => setBgType(t)}
                    className="px-2 py-1.5 rounded-lg text-[11px] font-semibold border capitalize"
                    style={{
                      borderColor: bgType === t ? "var(--primary)" : "var(--border)",
                      background: bgType === t ? "color-mix(in oklab, var(--primary) 10%, white)" : "#fff",
                      color: bgType === t ? "var(--primary)" : "var(--ink-soft)",
                    }}>{t}</button>
                ))}
              </div>
              {bgType === "solid" && <ColorControl value={bgSolid} onChange={setBgSolid} />}
              {bgType === "gradient" && <GradientBuilder value={bgGradient} onChange={setBgGradient} />}
              {bgType === "image" && (
                <input className="input-base" placeholder="https://image-url.jpg" value={bgImage} onChange={(e) => setBgImage(e.target.value)} />
              )}
            </Field>

              <div className="grid grid-cols-1 gap-3">
              <ColorControl label="Font color" value={fontColor} onChange={setFontColor} />
              <ColorControl label="Accent" value={accent} onChange={setAccent} />
              <ColorControl label="Overlay" value={overlay} onChange={setOverlay} allowAlpha />
            </div>
            <Field label={`Try-On button radius · ${arRadius}px`}>
              <input type="range" min={0} max={32} value={arRadius} onChange={(e) => setArRadius(Number(e.target.value))} className="w-full accent-sky-500" />
            </Field>
            <Field label="Try-On button text">
              <input className="input-base" value={arText} maxLength={40} onChange={(e) => setArText(e.target.value)} />
            </Field>
            <Field label="Badge text">
              <input className="input-base" value={arBadge} maxLength={20} placeholder="auto (TRY-ON / PLACE IT)" onChange={(e) => setArBadge(e.target.value)} />
            </Field>
            <Toggle label="Show product name" on={showProductName} onChange={setShowProductName} />
          </Section>

              {/* Watermark */}
              <Section title="Watermark">
                <Field label="Position">
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["bottom-left", "bottom-right", "center"] as const).map((pos) => (
                      <button key={pos} onClick={() => setWatermarkPosition(pos)}
                        className="px-2 py-1.5 rounded-lg text-[11px] font-semibold border capitalize"
                        style={{
                          borderColor: watermarkPosition === pos ? "var(--primary)" : "var(--border)",
                          background: watermarkPosition === pos ? "color-mix(in oklab, var(--primary) 10%, white)" : "#fff",
                          color: watermarkPosition === pos ? "var(--primary)" : "var(--ink-soft)",
                        }}>{pos.replace("-", " ")}</button>
                    ))}
                  </div>
                </Field>
                <Field label={`Opacity · ${watermarkOpacity}%`}>
                  <input type="range" min={0} max={100} value={watermarkOpacity} onChange={(e) => setWatermarkOpacity(Number(e.target.value))} className="w-full accent-sky-500" />
                </Field>
                <Toggle label='Show "Powered by Ecomify" watermark' on={showPlatformWatermark} onChange={setShowPlatformWatermark} />
              </Section>

              {/* Alternatives */}
              <Section title={`Rejected product alternatives · ${alternatives.length}/10`}>
                <p className="text-[11px]" style={{ color: "var(--ink-soft)" }}>
                  Products shown when a shopper says &quot;Not for me&quot;.
                </p>
                <div className="space-y-2">
                  {alternatives.map((a, i) => (
                    <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg border" style={{ borderColor: "var(--border)" }}>
                      <button onClick={() => moveAlternative(i, -1)} className="text-xs text-muted hover:text-ink px-1" disabled={i === 0}>Move</button>
                      <div className="w-10 h-10 rounded bg-soft overflow-hidden">
                        {a.image && <img src={a.image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 text-sm truncate text-ink">{a.name}</div>
                      <button onClick={() => removeAlternative(i)} className="text-xs text-muted hover:text-red-500 px-1">Remove</button>
                    </div>
                  ))}
                </div>
                {alternatives.length < 10 && (
                  <button onClick={() => setShowAltPicker(!showAltPicker)} className="btn-ghost w-full justify-center text-sm">
                    Add alternative
                  </button>
                )}
                {showAltPicker && (
                  <div className="border rounded-xl p-2 max-h-60 overflow-y-auto space-y-1" style={{ borderColor: "var(--border)" }}>
                    {allProducts.filter((p) => !alternatives.some((a) => a.id === p.id)).map((p) => (
                      <button key={p.id} onClick={() => addAlternative(p)}
                        className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-soft text-left">
                        <div className="w-8 h-8 rounded bg-soft overflow-hidden">
                          {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="text-sm truncate text-ink flex-1">{p.name}</div>
                      </button>
                    ))}
                    {allProducts.length === 0 && (
                      <div className="text-xs text-muted p-2 text-center">No other products yet.</div>
                    )}
                  </div>
                )}
              </Section>

              <Toggle label='Show "Powered by Ecomify" badge on viewer' on={showBranding} onChange={setShowBranding} />

          <div className="flex gap-2 pt-2 sticky bottom-0 bg-card -mx-6 px-6 pb-2">
            <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button onClick={reset} className="btn-ghost">Reset</button>
          </div>
        </div>

        {/* Live preview */}
        <div className="bg-card rounded-2xl p-6 glow-card lg:sticky lg:top-4 self-start">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] uppercase tracking-wider text-muted">Live preview</div>
            <div className="inline-flex rounded-lg border p-0.5" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setPreviewDevice("mobile")}
                className="px-2 py-1 rounded-md text-[11px] inline-flex items-center gap-1"
                style={{
                  background: previewDevice === "mobile" ? "var(--primary)" : "transparent",
                  color: previewDevice === "mobile" ? "#fff" : "var(--ink-soft)",
                }}>
                Mobile
              </button>
              <button onClick={() => setPreviewDevice("desktop")}
                className="px-2 py-1 rounded-md text-[11px] inline-flex items-center gap-1"
                style={{
                  background: previewDevice === "desktop" ? "var(--primary)" : "transparent",
                  color: previewDevice === "desktop" ? "#fff" : "var(--ink-soft)",
                }}>
                Desktop
              </button>
            </div>
          </div>
          <ArLivePreview
            productImage={thumb}
            productName={product.product_name}
            buttonLabel={label}
            buttonBg={btnBg}
            buttonFg={fg}
            buttonRadius={radius}
            pageBg={bgType === "image" && bgImage ? `url(${bgImage}) center/cover` : (bgType === "gradient" ? gradientToCSS(bgGradient) : bgSolid)}
            fontColor={fontColor}
            accent={accent}
            overlay={overlay}
            arButtonRadius={arRadius}
            arButtonText={arText}
            showBranding={showBranding}
            showProductName={showProductName}
            mode={(product.ar_mode ?? "furniture") as any}
            fontFamily={fontFamily}
            headerTitle={headerTitle}
            headerSubtitle={headerSubtitle}
            buttonShadow={buttonShadow}
            device={previewDevice}
            badgeText={arBadge}
          />
        </div>
      </div>
    </DashboardShell>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-ink text-sm font-bold uppercase tracking-wider" style={{ color: "var(--ink)" }}>{title}</h4>
      {children}
      <hr style={{ borderColor: "var(--border)" }} />
    </div>
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
function Toggle({ label, on, onChange, gated }: { label: string; on: boolean; onChange: (v: boolean) => void; gated?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 min-h-11">
      <div className="text-sm text-ink flex items-center gap-2 leading-snug min-w-0">
        {label}{gated && <span className="text-xs text-muted">Locked</span>}
      </div>
      <button onClick={() => { if (gated) { toast.info("Pro feature"); return; } onChange(!on); }}
        disabled={gated}
        type="button"
        role="switch"
        aria-checked={on}
        className="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border p-[3px] transition-colors duration-200"
        style={{
          background: on ? "var(--primary)" : "#e2e8f0",
          borderColor: on ? "var(--primary)" : "#cbd5e1",
          opacity: gated ? 0.5 : 1,
        }}>
        <span
          className="block h-6 w-6 rounded-full bg-white transition-transform duration-200"
          style={{
            transform: on ? "translateX(24px)" : "translateX(0px)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)",
          }}
        />
      </button>
    </div>
  );
}
