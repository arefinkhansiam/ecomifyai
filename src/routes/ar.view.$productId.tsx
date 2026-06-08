import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCw, Sparkles, SwitchCamera } from "lucide-react";
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
      .select("id, product_name, original_image_url, processed_image_url, button_label, button_bg_color, button_text_color, status, is_public, dominant_color, product_colors, show_branding, ar_customization")
      .eq("id", params.productId)
      .maybeSingle();
    if (error || !data || data.status !== "ready" || !data.is_public) throw notFound();
    let imageUrl: string | null = data.processed_image_url ?? null;
    if (!imageUrl && data.original_image_url) {
      const { data: signed } = await supabase.storage.from("product-images").createSignedUrl(data.original_image_url, 3600);
      imageUrl = signed?.signedUrl ?? null;
    }
    return { product: data as any, imageUrl };
  },
  notFoundComponent: () => <NotReady />,
  errorComponent: () => <NotReady />,
  component: ARCameraView,
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

function ARCameraView() {
  const { product, imageUrl } = Route.useLoaderData();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAt = useRef<number>(Date.now());
  const sessionId = useRef<string>(typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
  const didInteract = useRef(false);

  const c: Customization = (product.ar_customization || {}) as Customization;
  const pageBg = c.page_bg || "#000000";
  const fontColor = c.font_color || "#FFFFFF";
  const overlay = c.overlay_color || "rgba(255,255,255,0.14)";
  const accent = c.accent_color || product.dominant_color || "#38BDF8";
  const btnRadius = (c.button_radius ?? product.button_border_radius ?? 12) + "px";
  const btnText = c.custom_button_text || product.button_label || "View in AR";
  const showName = c.show_product_name !== false;
  const defaultCam = c.default_camera || "back";

  const [facing, setFacing] = useState<"user" | "environment">(defaultCam === "front" ? "user" : "environment");
  const [phase, setPhase] = useState<"requesting" | "scanning" | "placed" | "denied" | "unsupported">("requesting");
  const [scale, setScale] = useState(1);
  const productColors: string[] = Array.isArray(product.product_colors) ? product.product_colors : [];
  const [selectedColor, setSelectedColor] = useState<string | null>(productColors[0] ?? null);

  const startCamera = async (mode: "user" | "environment" = facing) => {
    setPhase("requesting");
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (!navigator.mediaDevices?.getUserMedia) { setPhase("unsupported"); return; }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setPhase("scanning");
      setTimeout(() => setPhase("placed"), 2000);
    } catch {
      setPhase("denied");
    }
  };

  const flipCamera = () => {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    startCamera(next);
  };

  const sendSession = (closedManually: boolean) => {
    const payload = {
      product_id: product.id,
      session_id: sessionId.current,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      time_spent_seconds: Math.max(0, Math.round((Date.now() - startedAt.current) / 1000)),
      camera_used: facing === "user" ? "front" : "back",
      ar_mode: "model-viewer",
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
    startCamera(defaultCam === "front" ? "user" : "environment");
    const onUnload = () => sendSession(false);
    window.addEventListener("pagehide", onUnload);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      window.removeEventListener("pagehide", onUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAndExit = () => {
    sendSession(true);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/";
  };

  const onInteract = () => { didInteract.current = true; };

  const shadow = c.button_shadow === false ? "none" : `0 12px 28px -8px ${accent}88`;

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: pageBg, color: fontColor, fontFamily: "var(--font-body)" }}>
      <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" style={{ transform: facing === "user" ? "scaleX(-1)" : undefined }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35), transparent 30%, transparent 60%, rgba(0,0,0,0.55))" }} />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-30" style={{ paddingTop: "calc(env(safe-area-inset-top) + 14px)" }}>
        <div className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2" style={{ background: overlay, color: fontColor, backdropFilter: "blur(10px)" }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: accent }} /> AR LIVE
        </div>
        {showName && (
          <div className="px-3 py-1.5 rounded-full text-xs font-semibold max-w-[55%] truncate" style={{ background: overlay, color: fontColor, backdropFilter: "blur(10px)" }}>
            {product.product_name}
          </div>
        )}
        <button onClick={stopAndExit} className="w-10 h-10 rounded-full grid place-items-center" style={{ background: overlay, color: fontColor, backdropFilter: "blur(10px)" }}><X size={18} /></button>
      </div>

      {/* Scanning frame */}
      {phase !== "denied" && phase !== "unsupported" && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none z-10">
          <div className="relative" style={{ width: "min(72vw, 320px)", aspectRatio: "1/1" }}>
            <Corner pos="tl" color={fontColor} /><Corner pos="tr" color={fontColor} /><Corner pos="bl" color={fontColor} /><Corner pos="br" color={fontColor} />
            {phase === "scanning" && (
              <div className="absolute left-0 right-0 ar-scan-line">
                <div className="h-[2px] mx-3 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, boxShadow: `0 0 18px ${accent}` }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product */}
      {phase === "placed" && imageUrl && (
        <div className="absolute inset-0 grid place-items-center z-20" onPointerDown={onInteract} onWheel={onInteract}>
          <img
            src={imageUrl}
            alt={product.product_name}
            className="float pop-in select-none"
            draggable={false}
            style={{
              maxWidth: "70vw",
              maxHeight: "55vh",
              transform: `scale(${scale})`,
              filter: `drop-shadow(0 28px 40px ${accent}66) drop-shadow(0 0 30px ${accent}44)`,
              touchAction: "none",
            }}
          />
        </div>
      )}

      {phase === "scanning" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[140px] z-30 px-4 py-2 rounded-full text-xs font-medium" style={{ background: overlay, color: fontColor, backdropFilter: "blur(10px)" }}>
          Scanning surface…
        </div>
      )}

      {(phase === "denied" || phase === "unsupported") && (
        <div className="absolute inset-0 z-40 grid place-items-center p-6 text-center" style={{ background: "rgba(11,18,32,0.95)" }}>
          <div className="max-w-sm">
            <Camera size={44} className="mx-auto" style={{ color: accent }} />
            <h3 className="mt-4 text-white">{phase === "denied" ? "Camera access needed" : "Camera not supported"}</h3>
            <p className="mt-2 text-white/70 text-sm">
              {phase === "denied" ? "Allow camera permission to place this product in your real environment." : "Open this page on a mobile browser to use AR."}
            </p>
            {phase === "denied" && (
              <button onClick={() => startCamera()} className="btn-primary mt-6 inline-flex"><RefreshCw size={16} /> Retry</button>
            )}
          </div>
        </div>
      )}

      {/* Bottom controls */}
      {phase === "placed" && (
        <div className="absolute left-3 right-3 z-30" style={{ bottom: "calc(env(safe-area-inset-bottom) + 14px)" }}>
          {productColors.length > 0 && (
            <div className="rounded-full px-3 py-2 inline-flex items-center gap-2 mb-2 pop-in" style={{ background: overlay, backdropFilter: "blur(10px)" }}>
              <span className="text-[10px] uppercase tracking-wider opacity-70">Color</span>
              {productColors.map((col) => (
                <button key={col} onClick={() => { setSelectedColor(col); onInteract(); }}
                  className="w-6 h-6 rounded-full border-2 transition-transform"
                  style={{ background: col, borderColor: selectedColor === col ? fontColor : "rgba(255,255,255,0.3)", transform: selectedColor === col ? "scale(1.1)" : "scale(1)" }} />
              ))}
            </div>
          )}

          <div className="rounded-2xl p-3 flex items-center gap-3 pop-in" style={{ background: overlay, backdropFilter: "blur(14px)" }}>
            {imageUrl && <img src={imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover bg-white/10 shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider opacity-60">Now placed</div>
              {showName && <div className="font-semibold truncate text-sm" style={{ fontFamily: "var(--font-display)" }}>{product.product_name}</div>}
            </div>
            <button onClick={onInteract}
              className="px-3 py-2 text-xs font-semibold inline-flex items-center gap-1.5 shrink-0"
              style={{ background: accent, color: product.button_text_color || "#fff", borderRadius: btnRadius, boxShadow: shadow, border: "none" }}>
              <Sparkles size={13} /> {btnText}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-2">
            <button onClick={() => { onInteract(); setScale((s) => Math.max(0.4, s - 0.1)); }} className="w-8 h-8 rounded-full grid place-items-center text-sm" style={{ background: overlay, color: fontColor, backdropFilter: "blur(10px)" }}>−</button>
            <span className="text-[10px] px-2.5 py-1 rounded-full font-mono" style={{ background: overlay, color: fontColor, backdropFilter: "blur(10px)" }}>{Math.round(scale * 100)}%</span>
            <button onClick={() => { onInteract(); setScale((s) => Math.min(2.2, s + 0.1)); }} className="w-8 h-8 rounded-full grid place-items-center text-sm" style={{ background: overlay, color: fontColor, backdropFilter: "blur(10px)" }}>+</button>
            <button onClick={flipCamera} title="Switch camera" className="ml-1 w-8 h-8 rounded-full grid place-items-center" style={{ background: overlay, color: fontColor, backdropFilter: "blur(10px)" }}><SwitchCamera size={14} /></button>
            {product.show_branding !== false && (
              <a href="https://easibie.com" target="_blank" rel="noreferrer"
                className="ml-2 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider opacity-70 hover:opacity-100"
                style={{ background: overlay, color: fontColor, backdropFilter: "blur(10px)" }}>
                Powered by <span className="font-bold" style={{ color: accent }}>Easibie</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Corner({ pos, color }: { pos: "tl" | "tr" | "bl" | "br"; color: string }) {
  const base = { position: "absolute" as const, width: 28, height: 28 };
  const sides: Record<string, React.CSSProperties> = {
    tl: { top: 0, left: 0, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}`, borderTopLeftRadius: 12 },
    tr: { top: 0, right: 0, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}`, borderTopRightRadius: 12 },
    bl: { bottom: 0, left: 0, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}`, borderBottomLeftRadius: 12 },
    br: { bottom: 0, right: 0, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}`, borderBottomRightRadius: 12 },
  };
  return <div style={{ ...base, ...sides[pos], opacity: 0.9 }} />;
}
