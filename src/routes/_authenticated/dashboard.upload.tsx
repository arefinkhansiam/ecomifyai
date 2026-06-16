import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { generateAiHeroFromImage } from "@/lib/scan-ai.functions";
import { ArLivePreview } from "@/components/ArLivePreview";
import { ColorControl } from "@/components/ColorControl";
import { UploadCloud, Loader2, Sparkles, Copy, Check, X, Plus, Lock, Crown, Shirt, Sofa, Box, Sparkle } from "lucide-react";

type ArMode = "fashion" | "furniture" | "makeup";
type ClothingSub = "top" | "bottom" | "accessory" | "jewellery";
const MODE_INFO: Record<ArMode, { label: string; desc: string; Icon: any; accept: string; hint: string }> = {
  fashion:   { label: "Fashion try-on",   desc: "Shirts, pants, accessories, jewellery", Icon: Shirt,   accept: "image/jpeg,image/png,image/webp", hint: "Upload garment / accessory photo (JPG / PNG / WebP)" },
  furniture: { label: "Furniture / Decor", desc: "Place in customer's room",             Icon: Sofa,    accept: "image/jpeg,image/png,image/webp", hint: "Upload product photo (JPG / PNG / WebP)" },
  makeup:    { label: "Makeup try-on",    desc: "Lipstick, eyeshadow, blush",            Icon: Sparkle, accept: "image/jpeg,image/png,image/webp", hint: "Upload product / swatch photo (JPG / PNG / WebP)" },
};

const FONT_OPTIONS = ["Inter", "Space Grotesk", "Plus Jakarta Sans", "DM Sans", "Manrope"];

type UploadSearch = { mode?: ArMode; subtype?: ClothingSub };

export const Route = createFileRoute("/_authenticated/dashboard/upload")({
  validateSearch: (s: Record<string, unknown>): UploadSearch => {
    const m = s.mode as ArMode | undefined;
    const sub = s.subtype as ClothingSub | undefined;
    const okMode = m && ["fashion", "furniture", "makeup"].includes(m) ? m : undefined;
    const okSub = sub && ["top", "bottom", "accessory", "jewellery"].includes(sub) ? sub : undefined;
    return { mode: okMode, subtype: okSub };
  },
  component: UploadPage,
});

type Size = "small" | "medium" | "large";
type TimelineStep = { label: string; status: "pending" | "active" | "done" | "error"; at?: string; error?: string };
type UploadLog = { label: string; value: string; at: string };

const stamp = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const initialTimeline = (): TimelineStep[] => [
  { label: "Upload", status: "pending" },
  { label: "Scanning", status: "pending" },
  { label: "Angle capture", status: "pending" },
  { label: "Mockup generation", status: "pending" },
  { label: "Try-On render", status: "pending" },
];

const PRESET_COLORS = ["#0B1220", "#0EA5E9", "#38BDF8", "#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#FFFFFF"];
const GRADIENT_PRESETS = [
  { name: "Ocean", from: "#0369A1", to: "#38BDF8" },
  { name: "Sunset", from: "#F59E0B", to: "#EF4444" },
  { name: "Violet", from: "#7C3AED", to: "#EC4899" },
  { name: "Forest", from: "#065F46", to: "#10B981" },
  { name: "Midnight", from: "#0B1220", to: "#4338CA" },
  { name: "Candy", from: "#EC4899", to: "#38BDF8" },
];

function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const generateHero = useServerFn(generateAiHeroFromImage);
  const [plan, setPlan] = useState<"free" | "starter" | "growth">("free");
  const [file, setFile] = useState<File | null>(null);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineStep[]>(initialTimeline);
  const [logs, setLogs] = useState<UploadLog[]>([]);
  const [arMode, setArMode] = useState<ArMode>(search.mode ?? "furniture");
  const [subtype] = useState<ClothingSub | undefined>(search.subtype);

  // If user came from /dashboard/create, lock the mode picker to that choice.
  const modeLocked = !!search.mode;

  const [colors, setColors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("#0EA5E9");

  const [label, setLabel] = useState("View Try-On");
  const [useGradient, setUseGradient] = useState(false);
  const [bg, setBg] = useState("#0369A1");
  const [bg2, setBg2] = useState("#38BDF8");
  const [fg, setFg] = useState("#FFFFFF");
  const [radius, setRadius] = useState(14);
  const [size, setSize] = useState<Size>("medium");
  const [showBranding, setShowBranding] = useState(true);

  // Try-On Page customization (paid)
  const [pageBg, setPageBg] = useState("#000000");
  const [fontColor, setFontColor] = useState("#FFFFFF");
  const [accentColor, setAccentColor] = useState("#38BDF8");
  const [overlayColor, setOverlayColor] = useState("rgba(255,255,255,0.14)");
  const [arButtonRadius, setArButtonRadius] = useState(14);
  const [arButtonShadow, setArButtonShadow] = useState(true);
  const [customButtonText, setCustomButtonText] = useState("View in Your Space");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [defaultCamera, setDefaultCamera] = useState<"front" | "back">("back");
  const [showProductName, setShowProductName] = useState(true);

  const isPaid = plan !== "free";

  const log = (label: string, value: string) => setLogs((items) => [{ label, value, at: stamp() }, ...items].slice(0, 8));
  const markStep = (label: string, status: TimelineStep["status"], error?: string) => {
    setTimeline((items) => items.map((item) => item.label === label ? { ...item, status, at: stamp(), error } : item));
  };

  useEffect(() => {
    if (!user) return;
    supabase.from("user_plans").select("plan").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      const p = (data?.plan as any) ?? "free";
      setPlan(p);
    });
  }, [user]);

  const onFile = (f: File | null) => {
    if (!f) return;
    const isModel = false;
    const okType = isModel
      ? /\.(glb|gltf)$/i.test(f.name) || f.type === "model/gltf-binary" || f.type === "model/gltf+json"
      : ["image/jpeg", "image/png", "image/webp"].includes(f.type);
    if (!okType) { toast.error(isModel ? "Upload a .glb or .gltf file" : "Use JPG, PNG or WebP"); return; }
    const maxMb = isModel ? 50 : 10;
    if (f.size > maxMb * 1024 * 1024) { toast.error(`Max ${maxMb}MB`); return; }
    setFile(f);
    setPreview(isModel ? null : URL.createObjectURL(f));
    if (!name) setName(f.name.replace(/\.[^.]+$/, ""));
  };

  const onExtraFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const okType = (f: File) => ["image/jpeg", "image/png", "image/webp"].includes(f.type);
    const next: File[] = [];
    Array.from(files).forEach((f) => {
      if (!okType(f)) { toast.error("Extra angles must be JPG / PNG / WebP"); return; }
      if (f.size > 10 * 1024 * 1024) { toast.error(`${f.name} too large (max 10MB)`); return; }
      next.push(f);
    });
    const combined = [...extraFiles, ...next].slice(0, 4);
    setExtraFiles(combined);
    setExtraPreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const removeExtra = (idx: number) => {
    const next = extraFiles.filter((_, i) => i !== idx);
    setExtraFiles(next);
    setExtraPreviews(next.map((f) => URL.createObjectURL(f)));
  };



  const addColor = () => {
    if (colors.includes(newColor)) return;
    setColors([...colors, newColor]);
  };

  const upload = async () => {
    if (!file || !user) return;
    setBusy(true);
    setTimeline(initialTimeline());
    setLogs([]);
    try {
      const isModel = false;
      setStep("Uploading image...");
      markStep("Upload", "active");
      log("Upload", `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, {
        contentType: file.type || (undefined),
      });
      if (upErr) throw upErr;
      markStep("Upload", "done");

      // Upload any vendor multi-angle photos (back/side/detail) in parallel
      const extraPaths: string[] = [];
      if (!isModel && extraFiles.length > 0) {
        log("Angles", `Uploading ${extraFiles.length} extra angle${extraFiles.length === 1 ? "" : "s"}`);
        const results = await Promise.all(extraFiles.map(async (f) => {
          const e = f.name.split(".").pop();
          const p = `${user.id}/${crypto.randomUUID()}.${e}`;
          const { error } = await supabase.storage.from("product-images").upload(p, f, { contentType: f.type });
          if (error) { log("Angle error", error.message); return null; }
          return p;
        }));
        for (const p of results) if (p) extraPaths.push(p);
      }


      setStep("Saving product...");
      markStep("Scanning", isModel ? "done" : "active");
      const { data: created, error: insErr } = await supabase.from("ar_products").insert({
        user_id: user.id,
        product_name: name || "Untitled Product",
        original_image_url: isModel ? null : path,
        processed_image_url: isModel ? null : path,
        glb_url: isModel ? path : null,
        ar_mode: arMode,
        ar_subtype: subtype ?? null,
        status: isModel ? "ready" : "processing",
        processing_step: isModel ? "complete" : "image_uploaded",
        processing_progress: isModel ? 100 : 25,
        file_size_bytes: file.size,
        dominant_color: bg,
        button_label: label,
        button_bg_color: bg,
        button_text_color: fg,
        button_border_radius: radius,
        button_size: size,
        is_public: true,
        product_colors: colors,
        extra_images: extraPaths,

        use_gradient: useGradient,
        gradient_from: bg,
        gradient_to: bg2,
        show_branding: showBranding,
        ar_customization: {
          page_bg: pageBg,
          font_color: fontColor,
          accent_color: accentColor,
          overlay_color: overlayColor,
          button_radius: arButtonRadius,
          button_shadow: arButtonShadow,
          custom_button_text: customButtonText,
          font_family: fontFamily,
          default_camera: arMode === "fashion" ? "front" : defaultCamera,
          show_product_name: showProductName,
        },
      } as any).select().single();
      if (insErr) throw insErr;
      log("Product", `Created ${created.id}`);

      // For image uploads, run the same AI hero pass so plain uploads become
        // Try-On-ready (clean studio render) just like camera scans.
      if (!isModel) {
        markStep("Scanning", "done");
        markStep("Angle capture", "done");
        markStep("Mockup generation", "active");
        setStep("AI is preparing your Try-On preview...");
        log("AI", "Generating Try-On-ready mockup");
        try {
          const result = await generateHero({ data: { productId: created.id } });
          markStep("Mockup generation", "done");
          log("Mockup", result.ok ? "AI mockup ready" : `Raw image fallback · ${result.reason}`);
        } catch (e) {
          console.warn("[upload] AI hero failed, keeping raw image", e);
          markStep("Mockup generation", "error", e instanceof Error ? e.message : String(e));
          toast.warning("Try-On preview kept the original image (AI cleanup unavailable).");
        }
      }

      markStep("Try-On render", "done");

      toast.success("Try-On product created");
      setCreatedId(created.id);
    } catch (e: any) {
      const msg = e.message ?? "Upload failed";
      markStep("Upload", "error", msg);
      log("Error", msg);
      toast.error(e.message ?? "Upload failed");
    } finally { setBusy(false); setStep(""); }
  };


  const origin = typeof window !== "undefined" ? window.location.origin : "https://your-domain.com";
  const productId = createdId ?? "PRODUCT_ID";
  const htmlSnippet = `<script src="${origin}/widget.js" data-product-id="${productId}"></script>`;
  const liquidSnippet = `{% comment %} Easibie Try-On — paste in product template {% endcomment %}\n<script\n  src="${origin}/widget.js"\n  data-product-id="${productId}"\n  data-label="${label}"\n></script>`;

  const sizePad = useMemo(() => size === "small" ? "10px 18px" : size === "large" ? "18px 36px" : "14px 28px", [size]);
  const sizeFs = useMemo(() => size === "small" ? "13px" : size === "large" ? "17px" : "15px", [size]);
  const btnBg = useGradient ? `linear-gradient(135deg, ${bg} 0%, ${bg2} 100%)` : bg;

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(null), 1500);
    toast.success("Copied to clipboard");
  };

  return (
    <DashboardShell title="New Try-On Product">
      <div className="mb-6 rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg,#0369A1,#38BDF8)", boxShadow: "0 18px 40px -18px rgba(2,132,199,0.55)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: "rgba(255,255,255,0.15)" }}><Sparkles size={18} /></div>
          <div className="flex-1">
            <div className="text-sm font-bold">Tip — upload multiple angles for best results</div>
            <div className="text-xs opacity-80">Front, back, side and detail photos help our AI generate accurate try-ons.</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: image upload + colors */}
        <div className="bg-card rounded-2xl p-6 glow-card">
          {modeLocked ? (
            <div className="p-3 rounded-xl flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, rgba(2,132,199,0.08), rgba(56,189,248,0.04))", border: "1px solid rgba(2,132,199,0.18)" }}>
              <div className="text-sm">
                <div className="font-semibold text-ink">{MODE_INFO[arMode].label}{subtype ? ` · ${subtype}` : ""}</div>
                <div className="text-[11px]" style={{ color: "var(--ink-soft)" }}>{MODE_INFO[arMode].desc}</div>
              </div>
            </div>
          ) : (
            <>
              <h4 className="text-ink">1. Choose Try-On mode</h4>
              <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>How will customers experience this product?</p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(Object.keys(MODE_INFO) as ArMode[]).map((m) => {
                  const info = MODE_INFO[m];
                  const active = arMode === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setArMode(m); setFile(null); setPreview(null); }}
                      className="text-left p-3 rounded-xl border transition-all"
                      style={{
                        borderColor: active ? "var(--primary)" : "var(--border)",
                        background: active ? "linear-gradient(135deg, rgba(2,132,199,0.10), rgba(56,189,248,0.06))" : "#fff",
                        boxShadow: active ? "0 8px 24px -12px rgba(2,132,199,0.45)" : "none",
                      }}
                    >
                      <div className="mt-2 text-sm font-semibold text-ink">{info.label}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-soft)" }}>{info.desc}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <h4 className="text-ink mt-6">2. Product image</h4>
          <label className="block mt-3">
            <div
              className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors hover:border-primary bg-soft"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0] ?? null); }}
            >
              {preview ? (
                <img src={preview} alt="preview" className="max-h-60 mx-auto object-contain" />
              ) : (
                <>
                  <UploadCloud size={48} className="mx-auto text-primary" />
                  <div className="mt-4 font-display text-lg text-ink">Drop a photo here</div>
                  <p className="text-sm mt-1">{MODE_INFO[arMode].hint}. Max 10MB.</p>
                </>
              )}
              <input type="file" accept={MODE_INFO[arMode].accept} hidden onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            </div>
          </label>

          {true && (
            <div className="mt-5 p-4 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.05), rgba(56,189,248,0.05))", border: "1px solid rgba(124,58,237,0.18)" }}>
              <div className="text-sm font-semibold text-ink">Extra angles (optional · max 4)</div>
              <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
                Add back, side or detail photos. The more angles you upload, the more accurate the AI try-on / placement will look.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {extraPreviews.map((src, i) => (
                  <div key={src} className="relative w-20 h-20 rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                    <img src={src} alt={`angle ${i + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeExtra(i)}
                      className="absolute -top-1 -right-1 h-5 px-1.5 rounded-full bg-black text-white grid place-items-center text-[9px]">Remove</button>
                  </div>
                ))}
                {extraFiles.length < 4 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed grid place-items-center cursor-pointer text-primary"
                    style={{ borderColor: "var(--primary)" }}>
                    <span className="text-xs font-semibold">Add</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => onExtraFiles(e.target.files)} />
                  </label>
                )}
              </div>
            </div>
          )}



          <div className="mt-6">
            <label className="text-xs text-muted uppercase tracking-wide">Product name</label>
            <input className="input-base mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Modern Lounge Chair" />
          </div>

          {/* Available colors removed — variants live on the product page */}
        </div>

        {/* Right: button customization + live preview */}
        <div className="bg-card rounded-2xl p-6 glow-card">
          <h4 className="text-ink">2. Customize your Try-On button</h4>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">Button label</label>
              <input className="input-base mt-1" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={40} />
            </div>

            <div className="p-4 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(2,132,199,0.06), rgba(56,189,248,0.06))", border: "1px solid rgba(2,132,199,0.15)" }}>
              <Toggle label="Use gradient" checked={useGradient} onChange={setUseGradient} hint="Blend two colors smoothly." />

              {useGradient && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {GRADIENT_PRESETS.map((g) => (
                    <button key={g.name} type="button" onClick={() => { setBg(g.from); setBg2(g.to); }}
                      className="w-9 h-9 rounded-full border-2 transition-transform hover:scale-110"
                      title={g.name}
                      style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})`, borderColor: bg === g.from && bg2 === g.to ? "var(--primary)" : "rgba(255,255,255,0.7)" }} />
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ColorControl label={useGradient ? "Gradient start" : "Background"} value={bg} onChange={setBg} />
              {useGradient
                ? <ColorControl label="Gradient end" value={bg2} onChange={setBg2} />
                : <ColorControl label="Text color" value={fg} onChange={setFg} />
              }
            </div>
            {useGradient && <ColorControl label="Text color" value={fg} onChange={setFg} />}

            <div>
              <label className="text-xs text-muted uppercase tracking-wide flex justify-between">
                <span>Border radius</span><span>{radius}px</span>
              </label>
              <input type="range" min={0} max={30} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full mt-2 accent-sky-500" />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">Size</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["small", "medium", "large"] as const).map((s) => (
                  <button key={s} onClick={() => setSize(s)} className="px-3 py-2 rounded-lg text-sm font-medium capitalize border"
                    style={{ borderColor: size === s ? "var(--primary)" : "var(--border)", background: size === s ? "rgba(2,132,199,.08)" : "#fff", color: size === s ? "var(--primary)" : "var(--ink)" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(2,132,199,0.06), rgba(56,189,248,0.06))", border: "1px solid rgba(2,132,199,0.15)" }}>
              <Toggle label='Show "Powered by Easibie"' checked={showBranding} onChange={setShowBranding} hint="Controls the viewer and store button badge." />
            </div>

            {/* Try-On Page customization */}
            <div className="p-4 rounded-xl space-y-4" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.05), rgba(56,189,248,0.05))", border: "1px solid rgba(124,58,237,0.18)" }}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-ink flex items-center gap-2">Try-On Page Customization</div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <ColorControl label="Page background" value={pageBg} onChange={setPageBg} />
                <ColorControl label="Font color" value={fontColor} onChange={setFontColor} />
                <ColorControl label="Accent" value={accentColor} onChange={setAccentColor} />
                <ColorControl label="Overlay UI" value={overlayColor} onChange={setOverlayColor} allowAlpha />
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wide">Font family</label>
                <select className="input-base mt-1" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                  {FONT_OPTIONS.map((font) => <option key={font} value={font}>{font}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wide flex justify-between"><span>Try-On button radius</span><span>{arButtonRadius}px</span></label>
                <input type="range" min={0} max={32} value={arButtonRadius} onChange={(e) => setArButtonRadius(Number(e.target.value))} className="w-full mt-2 accent-sky-500" />
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wide">Custom button text</label>
                <input className="input-base mt-1" value={customButtonText} onChange={(e) => setCustomButtonText(e.target.value)} maxLength={40} placeholder="View in Your Space" />
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wide">Default camera</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["back", "front"] as const).map((c) => (
                    <button key={c} onClick={() => setDefaultCamera(c)} className="px-3 py-2 rounded-lg text-sm font-medium capitalize border"
                      style={{ borderColor: defaultCamera === c ? "var(--primary)" : "var(--border)", background: defaultCamera === c ? "rgba(2,132,199,.08)" : "#fff", color: defaultCamera === c ? "var(--primary)" : "var(--ink)" }}>
                      {c} camera
                    </button>
                  ))}
                </div>
              </div>
              <Toggle label="Try-On button shadow" checked={arButtonShadow} onChange={setArButtonShadow} />
              <Toggle label="Show product name on Try-On page" checked={showProductName} onChange={setShowProductName} />
            </div>
          </div>

          <div className="mt-6">
            <div className="text-[11px] uppercase tracking-wider text-muted mb-3 text-center">Live Try-On preview</div>
            <ArLivePreview
              productImage={preview}
              productName={name || "Your product"}
              buttonLabel={label || "View Try-On"}
              buttonBg={btnBg}
              buttonFg={fg}
              buttonRadius={radius}
              pageBg={pageBg}
              fontColor={fontColor}
              accent={accentColor}
              overlay={overlayColor}
              arButtonRadius={arButtonRadius}
              arButtonText={customButtonText}
              showBranding={showBranding}
              showProductName={showProductName}
              mode={arMode}
              fontFamily={fontFamily}
            />
          </div>


          <button onClick={upload} disabled={!file || busy || !!createdId} className="btn-primary w-full mt-6">
            {busy ? step || "Working..." : createdId ? "Created" : "Create Try-On Product"}
          </button>

          {(busy || createdId || logs.length > 0) && (
            <div className="mt-5 grid grid-cols-1 gap-3">
              <UploadTimeline steps={timeline} />
              <UploadDiagnostics items={logs} />
            </div>
          )}
        </div>
      </div>

      {createdId && (
        <div className="mt-6 bg-card rounded-2xl p-6 glow-card">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h4 className="text-ink">3. Add it to your store</h4>
              <p className="text-sm">Paste this snippet wherever you want your Try-On button to appear.</p>
            </div>
            <Link to="/dashboard/products" className="btn-ghost">Go to products →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <CodeBlock title="Any website" code={htmlSnippet} onCopy={() => copy(htmlSnippet, "html")} copied={copied === "html"} />
            <CodeBlock title="Store platform template" code={liquidSnippet} onCopy={() => copy(liquidSnippet, "liquid")} copied={copied === "liquid"} />
          </div>

          <button onClick={() => navigate({ to: "/dashboard/upload", reloadDocument: true })} className="btn-ghost mt-5">+ Create another product</button>
        </div>
      )}
    </DashboardShell>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-muted uppercase tracking-wide">{label}</label>
      <div className="mt-1 flex items-center gap-2 border rounded-xl px-2 py-1.5" style={{ borderColor: "var(--border)", background: "#fff" }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-9 h-9 rounded cursor-pointer bg-transparent border-0" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 outline-none text-sm font-mono bg-transparent text-ink" />
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 min-h-11">
      <div className="min-w-0">
        <div className="text-sm text-ink leading-snug">{label}</div>
        {hint && <div className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>{hint}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border p-[3px] transition-colors duration-200"
        style={{ background: checked ? "var(--primary)" : "#e2e8f0", borderColor: checked ? "var(--primary)" : "#cbd5e1" }}
      >
        <span
          className="block h-6 w-6 rounded-full bg-white transition-transform duration-200"
          style={{ transform: checked ? "translateX(24px)" : "translateX(0px)", boxShadow: "0 2px 6px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)" }}
        />
      </button>
    </div>
  );
}

function UploadTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="rounded-2xl p-4 bg-soft" style={{ border: "1px solid var(--border)" }}>
      <div className="text-[11px] uppercase tracking-wider font-semibold text-muted">Build progress</div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {steps.map((step) => (
          <div key={step.label} className="flex items-start gap-2 text-xs" style={{ color: "var(--ink-soft)" }}>
            <span className="mt-0.5 w-2.5 h-2.5 rounded-full shrink-0" style={{ background: step.status === "done" ? "#10B981" : step.status === "active" ? "#38BDF8" : step.status === "error" ? "#EF4444" : "#CBD5E1" }} />
            <span><span className="font-semibold text-ink">{step.label}</span>{step.at ? ` · ${step.at}` : ""}{step.error ? <span className="block text-red-600 mt-0.5">{step.error}</span> : null}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UploadDiagnostics({ items }: { items: UploadLog[] }) {
  return (
    <div className="rounded-2xl p-4 bg-soft" style={{ border: "1px solid var(--border)" }}>
      <div className="text-[11px] uppercase tracking-wider font-semibold text-muted">Diagnostics</div>
      <div className="mt-3 space-y-2 text-xs" style={{ color: "var(--ink-soft)" }}>
        {items.length ? items.map((item, i) => (
          <div key={`${item.at}-${item.label}-${i}`} className="flex justify-between gap-3">
            <span><span className="font-semibold text-ink">{item.label}</span> · {item.value}</span>
            <span className="shrink-0 opacity-70">{item.at}</span>
          </div>
        )) : <div>No diagnostics yet.</div>}
      </div>
    </div>
  );
}

function CodeBlock({ title, code, onCopy, copied }: { title: string; code: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="rounded-2xl border bg-[#0B1220] text-white/90 overflow-hidden" style={{ borderColor: "var(--border)" }}>
      <div className="px-4 py-2.5 flex items-center justify-between text-xs uppercase tracking-wider text-white/60 border-b border-white/10">
        <span>{title}</span>
        <button onClick={onCopy} className="inline-flex items-center gap-1 text-white hover:text-sky-300">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="px-4 py-4 text-[12.5px] leading-relaxed overflow-x-auto font-mono whitespace-pre-wrap break-all">{code}</pre>
    </div>
  );
}
