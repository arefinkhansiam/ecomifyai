import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Upload, RotateCcw, RefreshCw, Hand, Sparkles, ImageIcon, X } from "lucide-react";
import { MarketingShell } from "@/components/MarketingShell";

export const Route = createFileRoute("/try-ar")({
  head: () => ({
    meta: [
      { title: "Try AR — Place Any Product In Your Room | Easibie" },
      { name: "description", content: "Open your camera or upload a product photo and preview it live in your real-world space. Drag, rotate, and zoom in real time." },
      { property: "og:title", content: "Try AR — Easibie" },
      { property: "og:description", content: "Photo-to-AR live preview in your browser." },
    ],
  }),
  component: TryARPage,
});

type Transform = { x: number; y: number; scale: number; rotation: number };
const INITIAL: Transform = { x: 0, y: 0, scale: 1, rotation: 0 };

function TryARPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [productSrc, setProductSrc] = useState<string | null>(null);
  const [transform, setTransform] = useState<Transform>(INITIAL);
  const [mode, setMode] = useState<"idle" | "ar" | "fallback">("idle");
  const [arSupported, setArSupported] = useState(true);

  useEffect(() => {
    const supported = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
    setArSupported(supported);
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } }, audio: false,
      });
      setStream(s);
      setMode("ar");
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
    } catch (e: any) {
      setCameraError(e?.message ?? "Camera access denied");
      setMode("fallback");
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setMode("idle");
    setTransform(INITIAL);
  };

  const onFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return;
    const url = URL.createObjectURL(f);
    setProductSrc(url);
    setTransform(INITIAL);
    if (mode === "idle") setMode("fallback");
  };

  // Pointer interactions: drag with 1 finger / mouse, pinch with 2 fingers
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const gestureStart = useRef<{ dist: number; angle: number; t: Transform } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      gestureStart.current = { dist, angle, t: { ...transform } };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    const prev = pointers.current.get(e.pointerId)!;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      setTransform((t) => ({ ...t, x: t.x + (e.clientX - prev.x), y: t.y + (e.clientY - prev.y) }));
    } else if (pointers.current.size === 2 && gestureStart.current) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      const g = gestureStart.current;
      setTransform({
        ...g.t,
        scale: Math.max(0.2, Math.min(4, g.t.scale * (dist / g.dist))),
        rotation: g.t.rotation + (angle - g.angle),
      });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gestureStart.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    if (!productSrc) return;
    e.preventDefault();
    setTransform((t) => ({ ...t, scale: Math.max(0.2, Math.min(4, t.scale * (e.deltaY < 0 ? 1.08 : 0.92))) }));
  };

  const reset = () => setTransform(INITIAL);
  const placeAgain = () => setTransform({ ...INITIAL, scale: 0.9 });

  return (
    <MarketingShell>
      <section className="relative">
        <div className="absolute inset-0 -z-10 opacity-60"
          style={{ background: "radial-gradient(ellipse 900px 500px at 50% 0%, rgba(14,165,233,0.25), transparent 70%)" }} />
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-6 text-center">
          <span className="pill"><Sparkles size={14} /> Photo → AR</span>
          <h1 className="mt-4">Place any product in your space</h1>
          <p className="mt-4 max-w-2xl mx-auto">
            Open your camera or upload a product photo. Drag to move, pinch or scroll to scale, twist to rotate. Works on mobile and desktop.
          </p>
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-20">
          <div className="rounded-3xl overflow-hidden border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            {/* Stage */}
            <div
              ref={stageRef}
              className="relative w-full select-none touch-none"
              style={{ height: "min(72vh, 640px)", background: "#000" }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onWheel={onWheel}
            >
              {mode === "ar" && (
                <video ref={videoRef} playsInline muted autoPlay
                  className="absolute inset-0 w-full h-full object-cover" />
              )}
              {mode === "fallback" && (
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 50%, #082f49 100%)" }} />
              )}
              {mode === "idle" && (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center px-6">
                    <Hand size={48} className="mx-auto text-[var(--cyan)]" />
                    <p className="mt-4 text-white/90">Start the camera or upload a product to begin.</p>
                  </div>
                </div>
              )}

              {productSrc && mode !== "idle" && (
                <img
                  src={productSrc}
                  alt="AR product"
                  draggable={false}
                  className="absolute left-1/2 top-1/2 max-w-[60%] max-h-[70%] pointer-events-none"
                  style={{
                    transform: `translate(-50%, -50%) translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
                    filter: "drop-shadow(0 30px 40px rgba(0,0,0,.55))",
                    transition: pointers.current.size ? "none" : "transform .15s ease-out",
                  }}
                />
              )}

              {/* HUD */}
              <div className="absolute top-3 left-3 flex gap-2">
                {mode === "ar" && (
                  <span className="px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide bg-black/50 text-white backdrop-blur">
                    ● LIVE CAMERA
                  </span>
                )}
                {mode === "fallback" && (
                  <span className="px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide bg-black/50 text-white backdrop-blur">
                    2D PREVIEW
                  </span>
                )}
              </div>
              {mode === "ar" && (
                <button onClick={stopCamera}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 justify-center p-4 border-t" style={{ borderColor: "var(--border)" }}>
              {mode !== "ar" ? (
                <button onClick={startCamera} disabled={!arSupported} className="btn-primary">
                  <Camera size={16} /> {arSupported ? "Open Camera" : "Camera Not Supported"}
                </button>
              ) : (
                <button onClick={stopCamera} className="btn-ghost">
                  <X size={16} /> Stop Camera
                </button>
              )}
              <button onClick={() => fileRef.current?.click()} className="btn-ghost">
                <Upload size={16} /> {productSrc ? "Change Product" : "Upload Product"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden
                onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
              <button onClick={placeAgain} disabled={!productSrc} className="btn-ghost">
                <RefreshCw size={16} /> Place Again
              </button>
              <button onClick={reset} disabled={!productSrc} className="btn-ghost">
                <RotateCcw size={16} /> Reset
              </button>
            </div>

            {cameraError && (
              <div className="px-4 pb-4 text-center text-sm text-[var(--error)]">
                {cameraError}. Showing 2D preview instead.
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            {[
              { icon: Camera, t: "Live Camera AR", d: "Uses your device camera with one tap. Works in modern mobile and desktop browsers." },
              { icon: ImageIcon, t: "Upload Any Photo", d: "JPG, PNG, or WebP. Transparent PNGs look best for clean placement." },
              { icon: Hand, t: "Touch & Mouse", d: "Drag to move, pinch or scroll to zoom, twist with two fingers to rotate." },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl p-5 border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <f.icon size={20} className="text-[var(--cyan)]" />
                <div className="mt-3 font-display text-white text-lg">{f.t}</div>
                <p className="mt-1 text-sm">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
