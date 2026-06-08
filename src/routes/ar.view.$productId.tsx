import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, X, ShoppingCart, RefreshCw, Sparkles } from "lucide-react";
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
      .select("id, product_name, product_price, original_image_url, processed_image_url, button_label, button_bg_color, button_text_color, status, is_public, dominant_color, product_colors, use_gradient, gradient_from, gradient_to, show_branding")
      .eq("id", params.productId)
      .maybeSingle();
    if (error || !data || data.status !== "ready" || !data.is_public) throw notFound();
    let imageUrl: string | null = data.processed_image_url ?? null;
    if (!imageUrl && data.original_image_url) {
      const { data: signed } = await supabase.storage
        .from("product-images")
        .createSignedUrl(data.original_image_url, 3600);
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

function ARCameraView() {
  const { product, imageUrl } = Route.useLoaderData();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<"requesting" | "scanning" | "placed" | "denied" | "unsupported">("requesting");
  const [scale, setScale] = useState(1);

  const startCamera = async () => {
    setPhase("requesting");
    try {
      if (!navigator.mediaDevices?.getUserMedia) { setPhase("unsupported"); return; }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setPhase("scanning");
      setTimeout(() => setPhase("placed"), 2400);
    } catch (e) {
      setPhase("denied");
    }
  };

  useEffect(() => {
    startCamera();
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAndExit = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/";
  };

  const glow = product.dominant_color ?? product.button_bg_color ?? "#0EA5E9";

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden" style={{ fontFamily: "var(--font-body)" }}>
      <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-30" style={{ paddingTop: "calc(env(safe-area-inset-top) + 14px)" }}>
        <div className="glass-dark px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> AR LIVE
        </div>
        <button onClick={stopAndExit} className="glass-dark w-10 h-10 rounded-full grid place-items-center"><X size={18} /></button>
      </div>

      {/* Scanning frame */}
      {phase !== "denied" && phase !== "unsupported" && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none z-10">
          <div className="relative" style={{ width: "min(72vw, 320px)", aspectRatio: "1/1" }}>
            <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
            {phase === "scanning" && (
              <div className="absolute left-0 right-0 ar-scan-line">
                <div className="h-[2px] mx-3 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${glow}, transparent)`, boxShadow: `0 0 18px ${glow}` }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product */}
      {phase === "placed" && imageUrl && (
        <div className="absolute inset-0 grid place-items-center z-20 pointer-events-none">
          <img
            src={imageUrl}
            alt={product.product_name}
            className="float pop-in"
            style={{
              maxWidth: "70vw",
              maxHeight: "55vh",
              transform: `scale(${scale})`,
              filter: `drop-shadow(0 28px 40px ${glow}66) drop-shadow(0 0 30px ${glow}44)`,
            }}
          />
        </div>
      )}

      {/* Status pill */}
      {phase === "scanning" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[140px] z-30 glass-dark px-4 py-2 rounded-full text-xs font-medium">
          Scanning surface…
        </div>
      )}
      {phase === "placed" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[150px] z-30 glass-dark px-4 py-2 rounded-full text-xs font-medium pop-in">
          ✓ Surface detected
        </div>
      )}

      {/* Permission denied / unsupported */}
      {(phase === "denied" || phase === "unsupported") && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-[#0B1220]/95 p-6 text-center">
          <div className="max-w-sm">
            <Camera size={44} className="mx-auto text-sky-300" />
            <h3 className="mt-4 text-white">{phase === "denied" ? "Camera access needed" : "Camera not supported"}</h3>
            <p className="mt-2 text-white/70 text-sm">
              {phase === "denied"
                ? "Allow camera permission to place this product in your real environment."
                : "Open this page on a mobile browser to use AR."}
            </p>
            {phase === "denied" && (
              <button onClick={startCamera} className="btn-primary mt-6 inline-flex"><RefreshCw size={16} /> Retry</button>
            )}
          </div>
        </div>
      )}

      {/* Floating product card */}
      {phase === "placed" && (
        <div className="absolute left-3 right-3 z-30" style={{ bottom: "calc(env(safe-area-inset-bottom) + 18px)" }}>
          <div className="glass-dark rounded-3xl p-4 flex items-center gap-3 pop-in">
            {imageUrl && <img src={imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover bg-white/10" />}
            <div className="flex-1 min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-white/60">Now placed</div>
              <div className="text-white font-semibold truncate" style={{ fontFamily: "var(--font-display)" }}>{product.product_name}</div>
              {product.product_price != null && (
                <div className="text-sky-300 text-sm font-medium mt-0.5">${Number(product.product_price).toFixed(2)}</div>
              )}
            </div>
            <button
              className="rounded-full px-4 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
              style={{ background: product.button_bg_color, color: product.button_text_color }}
            >
              <ShoppingCart size={15} /> Add
            </button>
          </div>
          <div className="flex items-center justify-center gap-3 mt-3">
            <button onClick={() => setScale((s) => Math.max(0.4, s - 0.1))} className="glass-dark w-9 h-9 rounded-full grid place-items-center text-base">−</button>
            <span className="text-[11px] text-white/70 glass-dark px-3 py-1 rounded-full">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale((s) => Math.min(2.2, s + 0.1))} className="glass-dark w-9 h-9 rounded-full grid place-items-center text-base">+</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const base = "absolute w-7 h-7 border-white/90";
  const map: Record<string, string> = {
    tl: "top-0 left-0 border-t-2 border-l-2 rounded-tl-xl",
    tr: "top-0 right-0 border-t-2 border-r-2 rounded-tr-xl",
    bl: "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl",
    br: "bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl",
  };
  return <div className={`${base} ${map[pos]}`} />;
}
