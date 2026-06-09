import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCw, Sparkles, SwitchCamera, Loader2, Share2, Aperture, ImagePlus, Download, ThumbsUp, ThumbsDown, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/ar/view/$productId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Try-On Viewer — Ecomify" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" },
      { name: "description", content: "Try this product on virtually with Ecomify." },
    ],
  }),
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("ar_products")
      .select("id, user_id, product_name, original_image_url, processed_image_url, button_label, button_bg_color, button_text_color, status, is_public, dominant_color, product_colors, show_branding, ar_customization, ar_mode, ar_subtype")
      .eq("id", params.productId)
      .maybeSingle();
    if (error || !data || data.status !== "ready" || !data.is_public) throw notFound();
    let imageUrl: string | null = null;
    const imagePath = data.processed_image_url || data.original_image_url;
    if (imagePath) {
      const { data: signed } = await supabase.storage.from("product-images").createSignedUrl(imagePath, 3600);
      imageUrl = signed?.signedUrl ?? imagePath;
    }
    // Fetch vendor branding (watermark + page customization)
    const { data: branding } = await supabase
      .from("tryon_branding").select("*").eq("user_id", (data as any).user_id).maybeSingle();
    return { product: data as any, imageUrl, branding: (branding as any) ?? null };
  },
  notFoundComponent: () => <NotReady />,
  errorComponent: () => <NotReady />,
  component: ARRouter,
});

function NotReady() {
  return (
    <div className="min-h-screen grid place-items-center bg-soft text-center px-6">
      <div>
        <Sparkles size={48} className="text-primary mx-auto" />
        <h2 className="mt-4 text-ink">Try-on experience not available</h2>
        <p className="mt-2">This product link is invalid or still processing.</p>
        <a href="/" className="btn-primary mt-6">Back to home</a>
      </div>
    </div>
  );
}

type Customization = {
  page_bg?: string;
  overlay_color?: string;
  font_color?: string;
  accent_color?: string;
  button_radius?: number;
  button_shadow?: boolean;
  custom_button_text?: string;
  default_camera?: "front" | "back";
  show_product_name?: boolean;
  font_family?: string;
};

function useCustomization(product: any, branding: any) {
  const c: Customization = (product.ar_customization || {}) as Customization;
  const fontFamily = c.font_family || branding?.font_family || branding?.font || "Inter";
  return {
    pageBg: c.page_bg || branding?.viewer_bg || "#000000",
    fontColor: c.font_color || "#FFFFFF",
    overlay: c.overlay_color || "rgba(255,255,255,0.14)",
    accent: c.accent_color || product.dominant_color || "#38BDF8",
    btnRadius: (c.button_radius ?? product.button_border_radius ?? 12) + "px",
    showName: c.show_product_name !== false,
    defaultCam: (c.default_camera || "back") as "front" | "back",
    fontFamily,
    headerTitle: branding?.header_title as string | null,
    headerSubtitle: branding?.header_subtitle as string | null,
    watermarkPosition: (branding?.watermark_position ?? "bottom-right") as "bottom-right" | "bottom-left" | "center",
    watermarkOpacity: (branding?.watermark_opacity ?? 70) as number,
    showPlatformWatermark: !!branding?.show_platform_watermark,
    watermarkText: branding?.watermark_text || branding?.store_name || null,
  };
}

function useSessionTracker(product: any, camera: "front" | "back", arMode: string) {
  const startedAt = useRef<number>(Date.now());
  const sessionId = useRef<string>(typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
  const didInteract = useRef(false);
  const sent = useRef(false);

  const send = (closedManually: boolean) => {
    if (sent.current) return;
    sent.current = true;
    const payload = {
      product_id: product.id,
      session_id: sessionId.current,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      time_spent_seconds: Math.max(0, Math.round((Date.now() - startedAt.current) / 1000)),
      camera_used: camera,
      ar_mode: arMode,
      did_interact: didInteract.current,
      did_close_manually: closedManually,
    };
    try {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      if (navigator.sendBeacon && navigator.sendBeacon("/api/public/track-ar-session", blob)) return;
    } catch {}
    fetch("/api/public/track-ar-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
  };

  useEffect(() => {
    const onUnload = () => send(false);
    window.addEventListener("pagehide", onUnload);
    return () => window.removeEventListener("pagehide", onUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    markInteract: () => { didInteract.current = true; },
    sendSession: send,
    sessionId: sessionId.current,
  };
}

function exitView() {
  if (window.history.length > 1) window.history.back();
  else window.location.href = "/";
}

function TopBar({ name, showName, overlay, fontColor, accent, onClose, badge }: any) {
  return (
    <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-30" style={{ paddingTop: "calc(env(safe-area-inset-top) + 14px)" }}>
      <div className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2" style={{ background: overlay, color: fontColor, backdropFilter: "blur(10px)" }}>
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: accent }} /> {badge}
      </div>
      {showName && (
        <div className="px-3 py-1.5 rounded-full text-xs font-semibold max-w-[55%] truncate" style={{ background: overlay, color: fontColor, backdropFilter: "blur(10px)" }}>
          {name}
        </div>
      )}
      <button onClick={onClose} className="w-10 h-10 rounded-full grid place-items-center" style={{ background: overlay, color: fontColor, backdropFilter: "blur(10px)" }}><X size={18} /></button>
    </div>
  );
}

function ARRouter() {
  const { product } = Route.useLoaderData();
  const raw = (product.ar_mode || "furniture") as string;
  // 3D mode removed — fall back to furniture (scene-based) placement
  const mode: "fashion" | "furniture" | "makeup" =
    raw === "fashion" ? "fashion" : raw === "makeup" ? "makeup" : "furniture";
  return <CameraComposeView mode={mode} />;
}

/* ============================================================
   Image-based try-on / scene placement
   ============================================================ */
function CameraComposeView({ mode }: { mode: "fashion" | "furniture" | "makeup" }) {
  const { product, imageUrl, branding } = Route.useLoaderData();
  const subtype: "top" | "bottom" | "accessory" | "jewellery" | undefined = (product as any).ar_subtype ?? undefined;
  const cust = useCustomization(product, branding);
  const initialFacing: "user" | "environment" =
    (mode === "fashion" || mode === "makeup") ? "user" : (cust.defaultCam === "front" ? "user" : "environment");
  const [facing, setFacing] = useState<"user" | "environment">(initialFacing);
  const camLabel: "front" | "back" = facing === "user" ? "front" : "back";
  const tracker = useSessionTracker(product, camLabel, mode);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [phase, setPhase] = useState<"requesting" | "ready" | "capturing" | "processing" | "result" | "denied" | "unsupported">("requesting");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | "liked" | "disliked">(null);
  const [related, setRelated] = useState<Array<{ id: string; name: string; imageUrl: string | null }>>([]);
  const [savedWishlist, setSavedWishlist] = useState(false);

  const logEvent = (eventType: string, metadata?: any) => {
    fetch("/api/public/tryon-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, sessionId: tracker.sessionId, eventType, metadata }),
      keepalive: true,
    }).catch(() => {});
  };

  const startCamera = async (m: "user" | "environment" = facing) => {
    setPhase("requesting");
    setErrorMsg(null);
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (!navigator.mediaDevices?.getUserMedia) { setPhase("unsupported"); return; }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: m }, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setPhase("ready");
    } catch { setPhase("denied"); }
  };

  useEffect(() => {
    startCamera(initialFacing);
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flipCamera = () => {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    startCamera(next);
  };

  const composeWith = async (dataUrl: string) => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setPhase("processing");
    logEvent("tryon_started", { mode });
    try {
      const r = await fetch("/api/public/ar-compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, captureBase64: dataUrl, mode, subtype }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || `Error (${r.status})`);
      setResultUrl(j.imageUrl);
      setPhase("result");
      logEvent("tryon_completed");
    } catch (e: any) {
      setErrorMsg(e?.message || "Something went wrong");
      setPhase("ready");
      startCamera(facing);
    }
  };

  const capture = async () => {
    if (!videoRef.current) return;
    tracker.markInteract();
    setPhase("capturing");
    const v = videoRef.current;
    const w = v.videoWidth || 720;
    const h = v.videoHeight || 1280;
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvasRef.current = canvas;
    const maxDim = 1024;
    const scale = Math.min(1, maxDim / Math.max(w, h));
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) { setPhase("ready"); return; }
    if (facing === "user") { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    await composeWith(dataUrl);
  };

  const onPickPhoto = async (file: File | null) => {
    if (!file) return;
    if (!/^image\//.test(file.type)) { setErrorMsg("Please pick an image file"); return; }
    if (file.size > 8 * 1024 * 1024) { setErrorMsg("Image too large (max 8MB)"); return; }
    tracker.markInteract();
    const reader = new FileReader();
    reader.onload = async () => {
      const src = String(reader.result || "");
      try {
        const img = new Image();
        img.onload = async () => {
          const maxDim = 1280;
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const c = document.createElement("canvas");
          c.width = w; c.height = h;
          const cx = c.getContext("2d");
          if (!cx) { await composeWith(src); return; }
          cx.drawImage(img, 0, 0, w, h);
          await composeWith(c.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = () => composeWith(src);
        img.src = src;
      } catch { await composeWith(src); }
    };
    reader.readAsDataURL(file);
  };

  const retake = () => {
    setResultUrl(null);
    setErrorMsg(null);
    setFeedback(null);
    setRelated([]);
    setSavedWishlist(false);
    startCamera(facing);
  };

  // Compose result + watermark using vendor settings
  const composeWatermarkedBlob = async (): Promise<{ blob: Blob; url: string } | null> => {
    if (!resultUrl) return null;
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(); img.src = resultUrl; });
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      // Build watermark text
      const lines: string[] = [];
      if (cust.watermarkText) lines.push(cust.watermarkText);
      if (cust.showPlatformWatermark) lines.push("Powered by Ecomify");

      if (lines.length > 0) {
        const pad = Math.round(Math.min(c.width, c.height) * 0.025);
        const fontSize = Math.round(Math.min(c.width, c.height) * 0.028);
        ctx.font = `600 ${fontSize}px ${cust.fontFamily}, sans-serif`;
        const widths = lines.map((l) => ctx.measureText(l).width);
        const boxW = Math.max(...widths) + pad * 1.4;
        const boxH = fontSize * (lines.length * 1.4 + 0.5);

        const pos = cust.watermarkPosition;
        let x = c.width - boxW - pad;
        let y = c.height - boxH - pad;
        if (pos === "bottom-left") { x = pad; }
        if (pos === "center") { x = (c.width - boxW) / 2; y = (c.height - boxH) / 2; }

        const opacity = Math.max(0, Math.min(1, cust.watermarkOpacity / 100));
        ctx.fillStyle = `rgba(11,18,32,${0.55 * opacity})`;
        const r = Math.min(boxH / 2, 24);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + boxW, y, x + boxW, y + boxH, r);
        ctx.arcTo(x + boxW, y + boxH, x, y + boxH, r);
        ctx.arcTo(x, y + boxH, x, y, r);
        ctx.arcTo(x, y, x + boxW, y, r);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.textBaseline = "top";
        lines.forEach((l, i) => {
          ctx.fillText(l, x + pad * 0.7, y + pad * 0.5 + i * fontSize * 1.4);
        });
      }
      const blob: Blob = await new Promise((res) => c.toBlob((b) => res(b!), "image/png", 0.95));
      return { blob, url: URL.createObjectURL(blob) };
    } catch {
      const r = await fetch(resultUrl);
      const blob = await r.blob();
      return { blob, url: URL.createObjectURL(blob) };
    }
  };

  const download = async () => {
    logEvent("download");
    const wm = await composeWatermarkedBlob();
    if (!wm) return;
    const a = document.createElement("a");
    a.href = wm.url;
    a.download = `${product.product_name || "ecomify-tryon"}.png`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(wm.url), 5000);
  };

  const share = async () => {
    logEvent("share");
    const wm = await composeWatermarkedBlob();
    if (!wm) return;
    const file = new File([wm.blob], `${product.product_name || "ecomify-tryon"}.png`, { type: "image/png" });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: product.product_name, text: "Check out my virtual try-on" });
        return;
      }
    } catch {}
    const a = document.createElement("a");
    a.href = wm.url;
    a.download = file.name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(wm.url), 5000);
  };

  const submitFeedback = async (liked: boolean) => {
    setFeedback(liked ? "liked" : "disliked");
    logEvent(liked ? "like" : "dislike");
    try {
      await fetch("/api/public/tryon-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, sessionId: tracker.sessionId, liked }),
      });
    } catch {}
    if (!liked) {
      try {
        const r = await fetch(`/api/public/tryon-related?productId=${product.id}`);
        const j = await r.json();
        setRelated(j.items ?? []);
      } catch {}
    }
  };

  const saveToWishlist = () => {
    try {
      const key = "ecomify_wishlist";
      const cur = JSON.parse(localStorage.getItem(key) || "[]");
      if (!cur.includes(product.id)) {
        cur.push(product.id);
        localStorage.setItem(key, JSON.stringify(cur));
      }
      setSavedWishlist(true);
      logEvent("wishlist");
    } catch {}
  };

  const close = () => { tracker.sendSession(true); streamRef.current?.getTracks().forEach((t) => t.stop()); exitView(); };

  const customBadge = (product.ar_customization as any)?.ar_badge_text as string | undefined;
  const defaultBadge =
    mode === "fashion"
      ? (subtype === "bottom" ? "PANTS TRY-ON" : subtype === "accessory" ? "ACCESSORY" : subtype === "jewellery" ? "JEWELLERY" : "TRY-ON")
      : mode === "makeup" ? "MAKEUP" : "PLACE IT";
  const badge = customBadge?.trim() ? customBadge.trim().toUpperCase() : defaultBadge;
  const captureHint =
    mode === "fashion"
      ? (subtype === "bottom" ? "Stand so legs are in frame, then capture"
        : subtype === "accessory" ? "Show the body part (wrist / face / feet) and capture"
        : subtype === "jewellery" ? "Show neck / hand / ear close to camera, then capture"
        : "Stand in frame, then capture")
      : mode === "makeup"  ? "Center your face, then capture"
      :                      "Aim at the spot, then capture";

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: cust.pageBg, color: cust.fontColor, fontFamily: `'${cust.fontFamily}', system-ui, sans-serif` }}>
      {phase === "result" && resultUrl ? (
        <img src={resultUrl} alt="Try-on result" className="absolute inset-0 w-full h-full object-contain bg-black transition-opacity duration-500" />
      ) : (
        <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" style={{ transform: facing === "user" ? "scaleX(-1)" : undefined }} />
      )}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35), transparent 30%, transparent 60%, rgba(0,0,0,0.55))" }} />

      <TopBar name={product.product_name} showName={cust.showName} overlay={cust.overlay} fontColor={cust.fontColor} accent={cust.accent} onClose={close} badge={phase === "result" ? "RESULT" : badge} />

      {/* Header title / subtitle */}
      {(cust.headerTitle || cust.headerSubtitle) && phase === "ready" && (
        <div className="absolute left-4 right-4 z-30 text-center pointer-events-none" style={{ top: "calc(env(safe-area-inset-top) + 70px)" }}>
          {cust.headerTitle && <div className="text-lg font-bold" style={{ color: cust.fontColor }}>{cust.headerTitle}</div>}
          {cust.headerSubtitle && <div className="text-xs opacity-80 mt-0.5" style={{ color: cust.fontColor }}>{cust.headerSubtitle}</div>}
        </div>
      )}

      {/* Garment preview thumbnail */}
      {phase === "ready" && imageUrl && (
        <div className="absolute z-30 left-4 top-32 w-16 h-20 rounded-xl overflow-hidden border-2 shadow-lg" style={{ borderColor: cust.fontColor }}>
          <img src={imageUrl} alt="" className="w-full h-full object-contain bg-white/10" />
        </div>
      )}

      {/* Hint */}
      {phase === "ready" && (
        <div className="absolute left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full text-xs font-medium" style={{ bottom: "calc(env(safe-area-inset-bottom) + 180px)", background: cust.overlay, color: cust.fontColor, backdropFilter: "blur(10px)" }}>
          {captureHint}
        </div>
      )}

      {/* Processing overlay */}
      {(phase === "capturing" || phase === "processing") && (
        <div className="absolute inset-0 z-40 grid place-items-center text-center px-6" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div>
            <div className="w-16 h-16 mx-auto rounded-full grid place-items-center" style={{ background: cust.accent + "33", border: `2px solid ${cust.accent}` }}>
              <Loader2 className="animate-spin" size={28} style={{ color: cust.accent }} />
            </div>
            <h3 className="mt-5" style={{ color: cust.fontColor }}>
              {mode === "fashion" ? "Trying it on…" : mode === "makeup" ? "Applying makeup…" : "Placing it in your space…"}
            </h3>
            <p className="mt-2 text-sm opacity-70">This usually takes 10–20 seconds.</p>
          </div>
        </div>
      )}

      {errorMsg && phase === "ready" && (
        <div className="absolute left-4 right-4 z-40 mt-2 p-3 rounded-xl text-sm" style={{ background: "rgba(220,38,38,0.95)", color: "#fff", top: "calc(env(safe-area-inset-top) + 110px)" }}>
          {errorMsg}
        </div>
      )}

      {/* Bottom controls */}
      {phase === "ready" && (
        <div className="absolute left-0 right-0 z-30 flex flex-col items-center gap-3" style={{ bottom: "calc(env(safe-area-inset-bottom) + 18px)" }}>
          <label className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            style={{ background: cust.overlay, color: cust.fontColor, backdropFilter: "blur(10px)" }}>
            <ImagePlus size={14} /> Upload your photo instead
            <input type="file" accept="image/*" hidden onChange={(e) => onPickPhoto(e.target.files?.[0] ?? null)} />
          </label>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12" />
            <button onClick={capture} aria-label="Capture"
              className="w-20 h-20 rounded-full grid place-items-center transition-transform active:scale-95"
              style={{ background: "#fff", boxShadow: `0 0 0 4px ${cust.accent}, 0 18px 40px -10px rgba(0,0,0,0.5)` }}>
              <div className="w-16 h-16 rounded-full grid place-items-center" style={{ background: cust.accent }}>
                <Aperture size={28} color="#fff" />
              </div>
            </button>
            <button onClick={flipCamera} aria-label="Flip camera"
              className="w-12 h-12 rounded-full grid place-items-center" style={{ background: cust.overlay, color: cust.fontColor, backdropFilter: "blur(10px)" }}>
              <SwitchCamera size={18} />
            </button>
          </div>
        </div>
      )}

      {phase === "result" && (
        <div className="absolute left-0 right-0 z-30 flex flex-col items-center gap-3 px-3 transition-all duration-500" style={{ bottom: "calc(env(safe-area-inset-bottom) + 14px)" }}>
          {feedback === null && (
            <div className="px-4 py-2.5 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2" style={{ background: cust.overlay, color: cust.fontColor, backdropFilter: "blur(10px)" }}>
              <span>How does it look?</span>
              <button onClick={() => submitFeedback(true)} className="px-3 py-1.5 rounded-full inline-flex items-center gap-1" style={{ background: cust.accent, color: "#fff" }}>
                <ThumbsUp size={12} /> Like
              </button>
              <button onClick={() => submitFeedback(false)} className="px-3 py-1.5 rounded-full inline-flex items-center gap-1" style={{ background: "rgba(255,255,255,0.18)", color: cust.fontColor }}>
                <ThumbsDown size={12} /> Not for me
              </button>
            </div>
          )}

          {feedback === "disliked" && related.length > 0 && (
            <div className="w-full max-w-md p-3 rounded-2xl animate-in fade-in slide-in-from-bottom-2" style={{ background: cust.overlay, backdropFilter: "blur(10px)" }}>
              <div className="text-xs font-semibold mb-2" style={{ color: cust.fontColor }}>Try these instead</div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {related.map((r) => (
                  <a key={r.id} href={`/ar/view/${r.id}`}
                    onClick={() => logEvent("alternative_selected", { altId: r.id })}
                    className="shrink-0 w-24 text-center">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/10 border" style={{ borderColor: cust.fontColor + "33" }}>
                      {r.imageUrl && <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="text-[10px] mt-1 truncate" style={{ color: cust.fontColor }}>{r.name}</div>
                    <div className="text-[9px] mt-0.5 px-1.5 py-0.5 rounded-full inline-block" style={{ background: cust.accent, color: "#fff" }}>Try on</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {feedback === "liked" && (
            <div className="px-4 py-2.5 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2" style={{ background: cust.overlay, color: cust.fontColor, backdropFilter: "blur(10px)" }}>
              <span>Glad you like it</span>
              <button onClick={saveToWishlist} disabled={savedWishlist}
                className="px-3 py-1.5 rounded-full inline-flex items-center gap-1"
                style={{ background: savedWishlist ? "rgba(255,255,255,0.2)" : cust.accent, color: "#fff" }}>
                <Heart size={12} /> {savedWishlist ? "Saved" : "Save to wishlist"}
              </button>
              <button onClick={share} className="px-3 py-1.5 rounded-full inline-flex items-center gap-1" style={{ background: "rgba(255,255,255,0.18)", color: cust.fontColor }}>
                <Share2 size={12} /> Share
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button onClick={retake} className="px-4 py-2.5 rounded-full font-semibold text-sm" style={{ background: cust.overlay, color: cust.fontColor, backdropFilter: "blur(10px)" }}>
              <RefreshCw size={14} className="inline mr-1.5" /> Retake
            </button>
            <button onClick={download} className="px-4 py-2.5 rounded-full font-semibold text-sm inline-flex items-center gap-2" style={{ background: cust.overlay, color: cust.fontColor, backdropFilter: "blur(10px)" }}>
              <Download size={15} /> Download
            </button>
            {feedback !== "liked" && (
              <button onClick={share} className="px-5 py-2.5 rounded-full font-semibold text-sm inline-flex items-center gap-2" style={{ background: cust.accent, color: "#fff", borderRadius: cust.btnRadius, boxShadow: `0 12px 28px -8px ${cust.accent}88` }}>
                <Share2 size={15} /> Share
              </button>
            )}
          </div>
        </div>
      )}

      {(phase === "denied" || phase === "unsupported") && (
        <div className="absolute inset-0 z-40 grid place-items-center p-6 text-center" style={{ background: "rgba(11,18,32,0.95)" }}>
          <div className="max-w-sm">
            <Camera size={44} className="mx-auto" style={{ color: cust.accent }} />
            <h3 className="mt-4 text-white">{phase === "denied" ? "Camera access needed" : "Camera not supported"}</h3>
            <p className="mt-2 text-white/70 text-sm">
              {phase === "denied" ? "Allow camera permission to continue." : "Open on a mobile browser to use Try-On."}
            </p>
            <div className="mt-6 flex flex-col items-center gap-2">
              {phase === "denied" && (
                <button onClick={() => startCamera()} className="btn-primary inline-flex"><RefreshCw size={16} /> Retry camera</button>
              )}
              <label className="px-5 py-3 rounded-full font-semibold text-sm inline-flex items-center gap-2 cursor-pointer"
                style={{ background: cust.accent, color: "#fff", borderRadius: cust.btnRadius }}>
                <ImagePlus size={15} /> Upload a photo instead
                <input type="file" accept="image/*" hidden onChange={(e) => onPickPhoto(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          </div>
        </div>
      )}

      {product.show_branding !== false && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider opacity-70" style={{ background: cust.overlay, color: cust.fontColor }}>
          Powered by <span className="font-bold" style={{ color: cust.accent }}>Ecomify</span>
        </div>
      )}
    </div>
  );
}
