import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCw, Sparkles, SwitchCamera, Loader2, Share2, Aperture } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/ar/view/$productId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "AR Viewer — Easibie" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" },
      { name: "description", content: "View this product in your space with Easibie AR." },
    ],
  }),
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("ar_products")
      .select("id, product_name, original_image_url, processed_image_url, glb_url, usdz_url, button_label, button_bg_color, button_text_color, status, is_public, dominant_color, product_colors, show_branding, ar_customization, ar_mode")
      .eq("id", params.productId)
      .maybeSingle();
    if (error || !data || data.status !== "ready" || !data.is_public) throw notFound();
    let imageUrl: string | null = data.processed_image_url ?? null;
    if (!imageUrl && data.original_image_url) {
      const { data: signed } = await supabase.storage.from("product-images").createSignedUrl(data.original_image_url, 3600);
      imageUrl = signed?.signedUrl ?? null;
    }
    let glbUrl: string | null = null;
    if (data.glb_url) {
      const { data: signed } = await supabase.storage.from("product-images").createSignedUrl(data.glb_url, 3600);
      glbUrl = signed?.signedUrl ?? null;
    }
    let usdzUrl: string | null = null;
    if (data.usdz_url) {
      const { data: signed } = await supabase.storage.from("product-images").createSignedUrl(data.usdz_url, 3600);
      usdzUrl = signed?.signedUrl ?? null;
    }
    return { product: data as any, imageUrl, glbUrl, usdzUrl };
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
        <h2 className="mt-4 text-ink">AR experience not available</h2>
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
};

function useCustomization(product: any) {
  const c: Customization = (product.ar_customization || {}) as Customization;
  return {
    pageBg: c.page_bg || "#000000",
    fontColor: c.font_color || "#FFFFFF",
    overlay: c.overlay_color || "rgba(255,255,255,0.14)",
    accent: c.accent_color || product.dominant_color || "#38BDF8",
    btnRadius: (c.button_radius ?? product.button_border_radius ?? 12) + "px",
    showName: c.show_product_name !== false,
    defaultCam: (c.default_camera || "back") as "front" | "back",
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

  return { markInteract: () => { didInteract.current = true; }, sendSession: send };
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
  if (raw === "full_3d" || raw === "object_3d") return <Full3DView />;
  const mode: "fashion" | "furniture" | "makeup" =
    raw === "fashion" ? "fashion" : raw === "makeup" ? "makeup" : "furniture";
  return <CameraComposeView mode={mode} />;
}

/* ============================================================
   Fashion + Furniture + Makeup: camera → capture → AI compose
   ============================================================ */
function CameraComposeView({ mode }: { mode: "fashion" | "furniture" | "makeup" }) {
  const { product, imageUrl } = Route.useLoaderData();
  const cust = useCustomization(product);
  const initialFacing: "user" | "environment" = (mode === "fashion" || mode === "makeup") ? "user" : (cust.defaultCam === "front" ? "user" : "environment");
  const [facing, setFacing] = useState<"user" | "environment">(initialFacing);
  const camLabel: "front" | "back" = facing === "user" ? "front" : "back";
  const tracker = useSessionTracker(product, camLabel, mode);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [phase, setPhase] = useState<"requesting" | "ready" | "capturing" | "processing" | "result" | "denied" | "unsupported">("requesting");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startCamera = async (mode: "user" | "environment" = facing) => {
    setPhase("requesting");
    setErrorMsg(null);
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (!navigator.mediaDevices?.getUserMedia) { setPhase("unsupported"); return; }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 1280 } },
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

  const capture = async () => {
    if (!videoRef.current) return;
    tracker.markInteract();
    setPhase("capturing");
    const v = videoRef.current;
    const w = v.videoWidth || 720;
    const h = v.videoHeight || 1280;
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvasRef.current = canvas;
    // Cap to keep payload under ~3MB
    const maxDim = 1024;
    const scale = Math.min(1, maxDim / Math.max(w, h));
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) { setPhase("ready"); return; }
    if (facing === "user") { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    streamRef.current?.getTracks().forEach((t) => t.stop());
    setPhase("processing");

    try {
      const r = await fetch("/api/public/ar-compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, captureBase64: dataUrl, mode }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || `AI error (${r.status})`);
      setResultUrl(j.imageUrl);
      setPhase("result");
    } catch (e: any) {
      setErrorMsg(e?.message || "Something went wrong");
      setPhase("ready");
      startCamera(facing);
    }
  };

  const retake = () => {
    setResultUrl(null);
    setErrorMsg(null);
    startCamera(facing);
  };

  const share = async () => {
    if (!resultUrl) return;
    try {
      const blob = await (await fetch(resultUrl)).blob();
      const file = new File([blob], `${product.product_name || "easibie-ar"}.png`, { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: product.product_name });
        return;
      }
      const a = document.createElement("a");
      a.href = resultUrl;
      a.download = file.name;
      a.click();
    } catch {}
  };

  const close = () => { tracker.sendSession(true); streamRef.current?.getTracks().forEach((t) => t.stop()); exitView(); };

  const customBadge = (product.ar_customization as any)?.ar_badge_text as string | undefined;
  const defaultBadge = mode === "fashion" ? "TRY-ON" : mode === "makeup" ? "MAKEUP" : "PLACE IT";
  const badge = customBadge?.trim() ? customBadge.trim().toUpperCase() : defaultBadge;
  const captureHint =
    mode === "fashion" ? "Stand in frame, then capture" :
    mode === "makeup"  ? "Center your face, then capture" :
                         "Aim at the spot, then capture";

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: cust.pageBg, color: cust.fontColor, fontFamily: "var(--font-body)" }}>
      {/* Camera feed or result */}
      {phase === "result" && resultUrl ? (
        <img src={resultUrl} alt="AR result" className="absolute inset-0 w-full h-full object-contain bg-black" />
      ) : (
        <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" style={{ transform: facing === "user" ? "scaleX(-1)" : undefined }} />
      )}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35), transparent 30%, transparent 60%, rgba(0,0,0,0.55))" }} />

      <TopBar name={product.product_name} showName={cust.showName} overlay={cust.overlay} fontColor={cust.fontColor} accent={cust.accent} onClose={close} badge={phase === "result" ? "RESULT" : badge} />

      {/* Garment preview thumbnail (fashion only, while in ready) */}
      {phase === "ready" && mode === "fashion" && imageUrl && (
        <div className="absolute z-30 left-4 top-20 w-16 h-20 rounded-xl overflow-hidden border-2 shadow-lg" style={{ borderColor: cust.fontColor }}>
          <img src={imageUrl} alt="" className="w-full h-full object-cover bg-white/10" />
        </div>
      )}
      {phase === "ready" && mode === "furniture" && imageUrl && (
        <div className="absolute z-30 left-4 top-20 w-20 h-20 rounded-xl overflow-hidden border-2 shadow-lg" style={{ borderColor: cust.fontColor }}>
          <img src={imageUrl} alt="" className="w-full h-full object-contain bg-white/10" />
        </div>
      )}

      {/* Hint */}
      {phase === "ready" && (
        <div className="absolute left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full text-xs font-medium" style={{ top: "calc(env(safe-area-inset-top) + 70px)", background: cust.overlay, color: cust.fontColor, backdropFilter: "blur(10px)" }}>
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
            <h3 className="mt-5" style={{ color: cust.fontColor, fontFamily: "var(--font-display)" }}>
              {mode === "fashion" ? "Trying it on…" : mode === "makeup" ? "Applying makeup…" : "Placing it in your space…"}
            </h3>
            <p className="mt-2 text-sm opacity-70">This usually takes 10–20 seconds.</p>
          </div>
        </div>
      )}

      {/* Error toast */}
      {errorMsg && phase === "ready" && (
        <div className="absolute left-4 right-4 z-40 mt-2 p-3 rounded-xl text-sm" style={{ background: "rgba(220,38,38,0.95)", color: "#fff", top: "calc(env(safe-area-inset-top) + 110px)" }}>
          {errorMsg}
        </div>
      )}

      {/* Bottom controls */}
      {phase === "ready" && (
        <div className="absolute left-0 right-0 z-30 flex items-center justify-center gap-4" style={{ bottom: "calc(env(safe-area-inset-bottom) + 24px)" }}>
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
      )}

      {phase === "result" && (
        <div className="absolute left-3 right-3 z-30 flex items-center justify-center gap-3" style={{ bottom: "calc(env(safe-area-inset-bottom) + 18px)" }}>
          <button onClick={retake} className="px-5 py-3 rounded-full font-semibold text-sm" style={{ background: cust.overlay, color: cust.fontColor, backdropFilter: "blur(10px)" }}>
            <RefreshCw size={14} className="inline mr-1.5" /> Retake
          </button>
          <button onClick={share} className="px-6 py-3 rounded-full font-semibold text-sm inline-flex items-center gap-2" style={{ background: cust.accent, color: "#fff", borderRadius: cust.btnRadius, boxShadow: `0 12px 28px -8px ${cust.accent}88` }}>
            <Share2 size={15} /> Share
          </button>
        </div>
      )}

      {(phase === "denied" || phase === "unsupported") && (
        <div className="absolute inset-0 z-40 grid place-items-center p-6 text-center" style={{ background: "rgba(11,18,32,0.95)" }}>
          <div className="max-w-sm">
            <Camera size={44} className="mx-auto" style={{ color: cust.accent }} />
            <h3 className="mt-4 text-white">{phase === "denied" ? "Camera access needed" : "Camera not supported"}</h3>
            <p className="mt-2 text-white/70 text-sm">
              {phase === "denied" ? "Allow camera permission to continue." : "Open on a mobile browser to use AR."}
            </p>
            {phase === "denied" && (
              <button onClick={() => startCamera()} className="btn-primary mt-6 inline-flex"><RefreshCw size={16} /> Retry</button>
            )}
          </div>
        </div>
      )}

      {product.show_branding !== false && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider opacity-70" style={{ background: cust.overlay, color: cust.fontColor }}>
          Powered by <span className="font-bold" style={{ color: cust.accent }}>Easibie</span>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Full 3D: model-viewer with WebXR / Quick Look / Scene Viewer
   ============================================================ */
function Full3DView() {
  const { product, glbUrl, usdzUrl } = Route.useLoaderData();
  const cust = useCustomization(product);
  const tracker = useSessionTracker(product, "back", "model-viewer");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (document.querySelector('script[data-model-viewer]')) { setLoaded(true); return; }
    const s = document.createElement("script");
    s.type = "module";
    s.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
    s.setAttribute("data-model-viewer", "true");
    s.onload = () => setLoaded(true);
    document.head.appendChild(s);
  }, []);

  const close = () => { tracker.sendSession(true); exitView(); };

  if (!glbUrl) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-black text-white text-center p-6">
        <div>
          <Sparkles size={44} className="mx-auto text-sky-400" />
          <h3 className="mt-4">No 3D model uploaded</h3>
          <p className="mt-2 text-white/70 text-sm">Ask the seller to upload a GLB file for full 3D AR.</p>
          <button onClick={close} className="mt-6 px-5 py-2 rounded-full bg-white/15">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: cust.pageBg, color: cust.fontColor, fontFamily: "var(--font-body)" }}>
      <TopBar name={product.product_name} showName={cust.showName} overlay={cust.overlay} fontColor={cust.fontColor} accent={cust.accent} onClose={close} badge="3D AR" />
      {loaded ? (
        // @ts-ignore — web component
        <model-viewer
          src={glbUrl}
          ios-src={usdzUrl || undefined}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          touch-action="pan-y"
          shadow-intensity="1"
          exposure="1"
          auto-rotate
          interaction-prompt="auto"
          style={{ width: "100%", height: "100%", background: cust.pageBg }}
          onLoad={() => tracker.markInteract()}
        >
          <button
            slot="ar-button"
            style={{
              position: "absolute", bottom: "calc(env(safe-area-inset-bottom) + 28px)", left: "50%", transform: "translateX(-50%)",
              background: cust.accent, color: "#fff", border: "none", padding: "14px 28px",
              borderRadius: cust.btnRadius, fontWeight: 700, boxShadow: `0 18px 40px -10px ${cust.accent}cc`,
              fontFamily: "var(--font-display)", letterSpacing: ".3px",
            }}
          >
            View in your space
          </button>
        </model-viewer>
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <Loader2 className="animate-spin" size={32} style={{ color: cust.accent }} />
        </div>
      )}
      {product.show_branding !== false && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider opacity-70" style={{ background: cust.overlay, color: cust.fontColor }}>
          Powered by <span className="font-bold" style={{ color: cust.accent }}>Easibie</span>
        </div>
      )}
    </div>
  );
}
