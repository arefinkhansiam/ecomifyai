import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, X, RefreshCw, Share2, Aperture, SwitchCamera, Loader2, Move, RotateCw } from "lucide-react";

type Mode = "fashion" | "furniture" | "makeup";
type Subtype = "top" | "bottom" | "accessory" | "jewellery" | undefined;

type Props = {
  productId: string;
  productName: string;
  productImageUrl: string | null;
  dominantColor?: string | null;
  mode: Mode;
  subtype?: Subtype;
  accent: string;
  fontColor: string;
  overlay: string;
  pageBg: string;
  badge: string;
  showName: boolean;
  showBranding: boolean;
  btnRadius: string;
  onClose: () => void;
  onInteract: () => void;
};

const MP_VISION_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";
const POSE_MODEL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const FACE_MODEL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

const P = {
  L_SHOULDER: 11, R_SHOULDER: 12,
  L_HIP: 23, R_HIP: 24,
  L_KNEE: 25, R_KNEE: 26,
  L_ANKLE: 27, R_ANKLE: 28,
  NOSE: 0,
};

const LIP_OUTER = [61,146,91,181,84,17,314,405,321,375,291,409,270,269,267,0,37,39,40,185];

type Smoothed = { x: number; y: number; v: number } | null;
type ProductImage = HTMLCanvasElement | HTMLImageElement;

export function LiveAROverlay(p: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const productImgRef = useRef<HTMLCanvasElement | HTMLImageElement | null>(null);
  const landmarkerRef = useRef<any>(null);
  const lastTsRef = useRef<number>(0);
  const lastResultRef = useRef<any>(null);
  const smoothRef = useRef<Record<number, Smoothed>>({});
  const lastDetectAtRef = useRef<number>(0);

  const [facing, setFacing] = useState<"user" | "environment">(
    p.mode === "furniture" ? "environment" : "user"
  );
  const [phase, setPhase] = useState<"loading" | "ready" | "denied" | "unsupported">("loading");
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [tracking, setTracking] = useState<boolean>(false);
  const [modelReady, setModelReady] = useState<boolean>(false);
  const [modelStatus, setModelStatus] = useState<string>(p.mode === "furniture" ? "Placement ready" : "Loading tracking model…");
  const [trackingConfidence, setTrackingConfidence] = useState(0);
  const [detectLatency, setDetectLatency] = useState<number | null>(null);
  const [hint, setHint] = useState<string>("");

  const furnRef = useRef({ x: 0.5, y: 0.78, scale: 0.32, rot: 0 });
  const dragRef = useRef<{ active: boolean } | null>(null);

  useEffect(() => {
    productImgRef.current = null;
    if (!p.productImageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { productImgRef.current = makeTransparentCutout(img); };
    img.onerror = () => { console.warn("product image failed to load"); };
    img.src = p.productImageUrl;
  }, [p.productImageUrl]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const startCamera = useCallback(async (f: "user" | "environment") => {
    setPhase("loading");
    stopCamera();
    try {
      if (!navigator.mediaDevices?.getUserMedia) { setPhase("unsupported"); return; }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: f }, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current;
      if (v) {
        v.srcObject = stream;
        await new Promise<void>((res) => {
          if (v.readyState >= 2) return res();
          v.onloadedmetadata = () => res();
        });
        await v.play().catch(() => {});
      }
      setPhase("ready");
    } catch (e) {
      console.error("camera", e);
      setPhase("denied");
    }
  }, []);

  // Init landmarker
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (p.mode === "furniture") { setModelReady(true); setModelStatus("Furniture placement ready"); return; }
      try {
        setModelStatus("Loading MediaPipe vision files…");
        const vision = await import(/* @vite-ignore */ MP_VISION_URL);
        const fileset = await vision.FilesetResolver.forVisionTasks(WASM_BASE);
        if (cancelled) return;
        if (p.mode === "makeup") {
          setModelStatus("Loading face landmarks…");
          landmarkerRef.current = await vision.FaceLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: FACE_MODEL, delegate: "GPU" },
            runningMode: "VIDEO",
            numFaces: 1,
          });
        } else {
          setModelStatus("Loading body pose landmarks…");
          landmarkerRef.current = await vision.PoseLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: POSE_MODEL, delegate: "GPU" },
            runningMode: "VIDEO",
            numPoses: 1,
          });
        }
        if (!cancelled) { setModelReady(true); setModelStatus(p.mode === "makeup" ? "Face tracking ready" : "Body tracking ready"); }
      } catch (e) {
        console.warn("MediaPipe failed, using centered fallback overlay", e);
        if (!cancelled) { setModelReady(true); setModelStatus("Tracking fallback active"); } // unblock UI; fallback overlay will render
      }
    })();
    return () => { cancelled = true; try { landmarkerRef.current?.close?.(); } catch {} };
  }, [p.mode]);

  useEffect(() => {
    startCamera(facing);
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset smoothing when facing flips
  useEffect(() => { smoothRef.current = {}; lastResultRef.current = null; }, [facing, p.mode]);

  // Render loop
  useEffect(() => {
    if (phase !== "ready") return;
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      const vw = v.videoWidth, vh = v.videoHeight;
      if (!vw || !vh) return;
      if (c.width !== vw || c.height !== vh) { c.width = vw; c.height = vh; }
      ctx.clearRect(0, 0, c.width, c.height);

      const flipped = facing === "user";
      let detected = false;
      let confidence = 0;
      let result: any = lastResultRef.current;

      if (landmarkerRef.current && (p.mode === "fashion" || p.mode === "makeup")) {
        const ts = performance.now();
        if (ts - lastTsRef.current > 33) {
          lastTsRef.current = ts;
          try {
            const start = performance.now();
            const r = landmarkerRef.current.detectForVideo(v, ts);
            setDetectLatency(Math.round(performance.now() - start));
            if (p.mode === "fashion" ? r?.landmarks?.[0] : r?.faceLandmarks?.[0]) {
              lastResultRef.current = r;
              lastDetectAtRef.current = ts;
              result = r;
            }
          } catch {}
        }
      }

      // Stale check (>1s without detection = lost)
      const fresh = performance.now() - lastDetectAtRef.current < 800;

      if (p.mode === "fashion" && result?.landmarks?.[0] && fresh) {
        const smoothed = smoothLandmarks(result.landmarks[0], smoothRef.current, c, flipped);
        confidence = poseConfidence(smoothed, p.subtype);
        if (confidence >= 0.58 && drawFashion(ctx, c, smoothed, p.subtype, productImgRef.current)) detected = true;
      } else if (p.mode === "makeup" && result?.faceLandmarks?.[0] && fresh) {
        drawMakeup(ctx, c, result.faceLandmarks[0], flipped, p.dominantColor || p.accent);
        confidence = 1;
        detected = true;
      } else if (p.mode === "furniture" && productImgRef.current) {
        drawFurniture(ctx, c, productImgRef.current, furnRef.current);
        confidence = 1;
        detected = true;
      }

      // Fallback ghost overlay so user knows where to stand
      if (!detected && (p.mode === "fashion") && productImgRef.current) {
        drawGhost(ctx, c, productImgRef.current, p.subtype);
      } else if (!detected && p.mode === "makeup") {
        drawFaceGuide(ctx, c, p.accent);
      }

      setTracking(detected && p.mode !== "furniture");
      setTrackingConfidence(confidence);
    };

    render();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase, facing, p.mode, p.subtype, p.dominantColor, p.accent]);

  useEffect(() => {
    if (phase !== "ready") return setHint("");
    if (p.mode === "furniture") return setHint("Drag to move • pinch to resize • rotate button");
    if (tracking) return setHint("");
    if (!modelReady) return setHint("Loading AI model…");
    if (p.mode === "fashion") setHint(p.subtype === "bottom" ? "Step back so your full legs are visible" : "Step back so your full upper body is visible");
    else setHint("Center your face in the frame");
  }, [phase, tracking, modelReady, p.mode, p.subtype]);

  const flip = () => {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    startCamera(next);
  };

  const snap = () => {
    p.onInteract();
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    const out = document.createElement("canvas");
    out.width = v.videoWidth;
    out.height = v.videoHeight;
    const octx = out.getContext("2d");
    if (!octx) return;
    if (facing === "user") { octx.translate(out.width, 0); octx.scale(-1, 1); }
    octx.drawImage(v, 0, 0, out.width, out.height);
    if (facing === "user") { octx.setTransform(1, 0, 0, 1, 0, 0); }
    octx.drawImage(c, 0, 0, out.width, out.height);
    setSnapshot(out.toDataURL("image/jpeg", 0.92));
  };

  const share = async () => {
    if (!snapshot) return;
    try {
      const blob = await (await fetch(snapshot)).blob();
      const file = new File([blob], `${p.productName || "ecomify-ar"}.jpg`, { type: "image/jpeg" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: p.productName });
        return;
      }
      const a = document.createElement("a");
      a.href = snapshot; a.download = file.name; a.click();
    } catch {}
  };

  // Furniture interactions
  const onPointerDown = (e: React.PointerEvent) => {
    if (p.mode !== "furniture") return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { active: true };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (p.mode !== "furniture" || !dragRef.current?.active) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    furnRef.current.x = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
    furnRef.current.y = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height));
  };
  const onPointerUp = () => { dragRef.current = null; };
  const onWheel = (e: React.WheelEvent) => {
    if (p.mode !== "furniture") return;
    const next = furnRef.current.scale * (e.deltaY > 0 ? 0.94 : 1.06);
    furnRef.current.scale = Math.max(0.1, Math.min(0.95, next));
  };

  const touchRef = useRef<{ d: number; s: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    if (p.mode !== "furniture" || e.touches.length !== 2) return;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    touchRef.current = { d: Math.hypot(dx, dy), s: furnRef.current.scale };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (p.mode !== "furniture" || e.touches.length !== 2 || !touchRef.current) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const d = Math.hypot(dx, dy);
    furnRef.current.scale = Math.max(0.1, Math.min(0.95, touchRef.current.s * (d / touchRef.current.d)));
  };
  const onTouchEnd = () => { touchRef.current = null; };

  const rotateFurn = () => { furnRef.current.rot += Math.PI / 12; };

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: p.pageBg, color: p.fontColor, fontFamily: "var(--font-body)" }}>
      <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: facing === "user" ? "scaleX(-1)" : undefined, display: snapshot ? "none" : "block" }} />
      <canvas ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover touch-none"
        style={{ display: snapshot ? "none" : "block", pointerEvents: p.mode === "furniture" ? "auto" : "none" }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        onWheel={onWheel} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} />
      {snapshot && <img src={snapshot} alt="" className="absolute inset-0 w-full h-full object-contain bg-black" />}

      <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35), transparent 30%, transparent 60%, rgba(0,0,0,0.55))" }} />

      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-30" style={{ paddingTop: "calc(env(safe-area-inset-top) + 14px)" }}>
        <div className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2" style={{ background: p.overlay, color: p.fontColor, backdropFilter: "blur(10px)" }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: tracking ? "#10b981" : p.accent }} />
          {snapshot ? "PREVIEW" : (tracking ? "LIVE • " + p.badge : p.badge)}
        </div>
        {p.showName && (
          <div className="px-3 py-1.5 rounded-full text-xs font-semibold max-w-[55%] truncate" style={{ background: p.overlay, color: p.fontColor, backdropFilter: "blur(10px)" }}>
            {p.productName}
          </div>
        )}
        <button onClick={p.onClose} className="w-10 h-10 rounded-full grid place-items-center" style={{ background: p.overlay, color: p.fontColor, backdropFilter: "blur(10px)" }}><X size={18} /></button>
      </div>

      {!snapshot && hint && (
        <div className="absolute left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 max-w-[85%] text-center" style={{ top: "calc(env(safe-area-inset-top) + 70px)", background: p.overlay, color: p.fontColor, backdropFilter: "blur(10px)" }}>
          {p.mode === "furniture" && <Move size={12} />} {hint}
        </div>
      )}

      {!snapshot && phase === "ready" && (
        <div className="absolute left-3 z-30 px-3 py-2 rounded-2xl text-[10px] leading-relaxed" style={{ top: "calc(env(safe-area-inset-top) + 112px)", background: p.overlay, color: p.fontColor, backdropFilter: "blur(10px)" }}>
          <div>{modelStatus}</div>
          <div>Tracking {Math.round(trackingConfidence * 100)}%{detectLatency !== null ? ` · ${detectLatency}ms` : ""}</div>
        </div>
      )}

      {phase === "loading" && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-black/70 backdrop-blur-sm text-center px-6">
          <div>
            <Loader2 className="animate-spin mx-auto" size={36} style={{ color: p.accent }} />
            <p className="mt-4 text-sm opacity-80">Starting camera…</p>
          </div>
        </div>
      )}

      {!snapshot && phase === "ready" && (
        <div className="absolute left-0 right-0 z-30 flex items-center justify-center gap-4" style={{ bottom: "calc(env(safe-area-inset-bottom) + 24px)" }}>
          {p.mode === "furniture" ? (
            <button onClick={rotateFurn} aria-label="Rotate" className="w-12 h-12 rounded-full grid place-items-center" style={{ background: p.overlay, color: p.fontColor, backdropFilter: "blur(10px)" }}>
              <RotateCw size={18} />
            </button>
          ) : <div className="w-12" />}
          <button onClick={snap} aria-label="Snapshot"
            className="w-20 h-20 rounded-full grid place-items-center transition-transform active:scale-95"
            style={{ background: "#fff", boxShadow: `0 0 0 4px ${p.accent}, 0 18px 40px -10px rgba(0,0,0,0.5)` }}>
            <div className="w-16 h-16 rounded-full grid place-items-center" style={{ background: p.accent }}>
              <Aperture size={28} color="#fff" />
            </div>
          </button>
          <button onClick={flip} aria-label="Flip camera"
            className="w-12 h-12 rounded-full grid place-items-center" style={{ background: p.overlay, color: p.fontColor, backdropFilter: "blur(10px)" }}>
            <SwitchCamera size={18} />
          </button>
        </div>
      )}

      {snapshot && (
        <div className="absolute left-3 right-3 z-30 flex items-center justify-center gap-3" style={{ bottom: "calc(env(safe-area-inset-bottom) + 18px)" }}>
          <button onClick={() => setSnapshot(null)} className="px-5 py-3 rounded-full font-semibold text-sm" style={{ background: p.overlay, color: p.fontColor, backdropFilter: "blur(10px)" }}>
            <RefreshCw size={14} className="inline mr-1.5" /> Retake
          </button>
          <button onClick={share} className="px-6 py-3 rounded-full font-semibold text-sm inline-flex items-center gap-2"
            style={{ background: p.accent, color: "#fff", borderRadius: p.btnRadius, boxShadow: `0 12px 28px -8px ${p.accent}88` }}>
            <Share2 size={15} /> Share / Save
          </button>
        </div>
      )}

      {(phase === "denied" || phase === "unsupported") && (
        <div className="absolute inset-0 z-40 grid place-items-center p-6 text-center bg-black/95">
          <div className="max-w-sm">
            <Camera size={44} className="mx-auto" style={{ color: p.accent }} />
            <h3 className="mt-4 text-white">{phase === "denied" ? "Camera access needed" : "Camera not supported"}</h3>
            <p className="mt-2 text-white/70 text-sm">{phase === "denied" ? "Allow camera permission to continue." : "Open on a mobile browser to use Try-On."}</p>
            {phase === "denied" && (
              <button onClick={() => startCamera(facing)} className="mt-6 px-5 py-2.5 rounded-full inline-flex items-center gap-2" style={{ background: p.accent, color: "#fff" }}><RefreshCw size={16} /> Retry</button>
            )}
          </div>
        </div>
      )}

      {p.showBranding !== false && !snapshot && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider opacity-70" style={{ background: p.overlay, color: p.fontColor }}>
          Powered by <span className="font-bold" style={{ color: p.accent }}>Ecomify</span>
        </div>
      )}
    </div>
  );
}

/* ---------- drawing ---------- */

function smoothLandmarks(lm: any, store: Record<number, Smoothed>, c: HTMLCanvasElement, flipped: boolean) {
  const ALPHA = 0.45; // smoothing factor (higher = more responsive)
  const out: Record<number, { x: number; y: number; v: number }> = {};
  const indices = [P.L_SHOULDER, P.R_SHOULDER, P.L_HIP, P.R_HIP, P.L_KNEE, P.R_KNEE, P.L_ANKLE, P.R_ANKLE, P.NOSE];
  for (const i of indices) {
    if (!lm[i]) continue;
    const x = (flipped ? 1 - lm[i].x : lm[i].x) * c.width;
    const y = lm[i].y * c.height;
    const v = lm[i].visibility ?? 1;
    const prev = store[i];
    const sx = prev ? prev.x + (x - prev.x) * ALPHA : x;
    const sy = prev ? prev.y + (y - prev.y) * ALPHA : y;
    store[i] = { x: sx, y: sy, v };
    out[i] = { x: sx, y: sy, v };
  }
  return out;
}

function poseConfidence(pts: Record<number, { x: number; y: number; v: number }>, subtype: Subtype) {
  const required = subtype === "bottom"
    ? [P.L_HIP, P.R_HIP, P.L_ANKLE, P.R_ANKLE]
    : [P.L_SHOULDER, P.R_SHOULDER, P.L_HIP, P.R_HIP];
  const values = required.map((i) => pts[i]?.v ?? 0).filter((v) => Number.isFinite(v));
  if (!values.length) return 0;
  return Math.max(0, Math.min(1, values.reduce((sum, v) => sum + v, 0) / values.length));
}

function makeTransparentCutout(img: HTMLImageElement): HTMLCanvasElement | HTMLImageElement {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (!w || !h) return img;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return img;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;
  const sample = [[2, 2], [w - 3, 2], [2, h - 3], [w - 3, h - 3]];
  const bg = sample.reduce((acc, [x, y]) => {
    const i = (Math.max(0, Math.min(h - 1, y)) * w + Math.max(0, Math.min(w - 1, x))) * 4;
    acc[0] += px[i]; acc[1] += px[i + 1]; acc[2] += px[i + 2];
    return acc;
  }, [0, 0, 0]).map((v) => v / sample.length);
  for (let i = 0; i < px.length; i += 4) {
    const d = Math.hypot(px[i] - bg[0], px[i + 1] - bg[1], px[i + 2] - bg[2]);
    if (d < 34) px[i + 3] = 0;
    else if (d < 58) px[i + 3] = Math.round(px[i + 3] * ((d - 34) / 24));
  }
  ctx.putImageData(data, 0, 0);
  return c;
}

function drawFashion(
  ctx: CanvasRenderingContext2D,
  c: HTMLCanvasElement,
  pts: Record<number, { x: number; y: number; v: number }>,
  subtype: Subtype,
  img: ProductImage | null,
): boolean {
  if (!img) return false;
  const ls = pts[P.L_SHOULDER], rs = pts[P.R_SHOULDER];
  const lh = pts[P.L_HIP], rh = pts[P.R_HIP];

  if (subtype === "bottom") {
    if (!lh || !rh || Math.min(lh.v, rh.v) < 0.3) return false;
    const la = pts[P.L_ANKLE], ra = pts[P.R_ANKLE];
    const cx = (lh.x + rh.x) / 2;
    const top = (lh.y + rh.y) / 2;
    const ankleY = (la && ra) ? Math.max(la.y, ra.y) : c.height * 0.95;
    const bottom = Math.max(top + 150, ankleY);
    const hipW = Math.hypot(lh.x - rh.x, lh.y - rh.y) * 2.2;
    const h = bottom - top;
    drawProductImage(ctx, img, cx, top + h / 2, Math.max(hipW, h * 0.5), h);
    return true;
  }

  if (subtype === "accessory" || subtype === "jewellery") {
    if (!ls || !rs || Math.min(ls.v, rs.v) < 0.3) return false;
    const nose = pts[P.NOSE];
    const cx = (ls.x + rs.x) / 2;
    const cy = (ls.y + rs.y) / 2 + (nose ? (((ls.y + rs.y) / 2 - nose.y) * 0.2) : 0);
    const w = Math.hypot(ls.x - rs.x, ls.y - rs.y) * 0.6;
    const h = w * (img.height / img.width);
    drawProductImage(ctx, img, cx, cy, w, h);
    return true;
  }

  // Top (t-shirt / shirt)
  if (!ls || !rs || !lh || !rh || Math.min(ls.v, rs.v, lh.v, rh.v) < 0.45) return false;
  const shoulderW = Math.hypot(ls.x - rs.x, ls.y - rs.y);
  const cx = (ls.x + rs.x) / 2;
  const shoulderTop = (ls.y + rs.y) / 2;
  const hipMidY = (lh.y + rh.y) / 2;
  // Tilt to match shoulder line
  const angle = Math.atan2(rs.y - ls.y, rs.x - ls.x);
  const w = shoulderW * 1.95;
  const h = (hipMidY - shoulderTop) * 1.25;
  const centerY = shoulderTop + h * 0.42; // shift slightly down from neckline
  ctx.save();
  ctx.translate(cx, centerY);
  ctx.rotate(angle);
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
  return true;
}

function drawProductImage(ctx: CanvasRenderingContext2D, img: ProductImage, cx: number, cy: number, w: number, h: number) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  ctx.restore();
}

function drawFurniture(ctx: CanvasRenderingContext2D, c: HTMLCanvasElement, img: ProductImage, s: { x: number; y: number; scale: number; rot: number }) {
  const targetW = c.width * s.scale;
  const targetH = targetW * (img.height / img.width);
  ctx.save();
  ctx.translate(c.width * s.x, c.height * s.y);
  ctx.rotate(s.rot);
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 35;
  ctx.shadowOffsetY = 24;
  ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
  ctx.restore();
}

function drawGhost(ctx: CanvasRenderingContext2D, c: HTMLCanvasElement, img: ProductImage, subtype: Subtype) {
  ctx.save();
  ctx.globalAlpha = 0.35;
  let w, h, cx = c.width / 2, cy = c.height / 2;
  if (subtype === "bottom") {
    h = c.height * 0.55; w = h * (img.width / img.height);
    cy = c.height * 0.7;
  } else if (subtype === "accessory" || subtype === "jewellery") {
    w = c.width * 0.25; h = w * (img.height / img.width);
    cy = c.height * 0.45;
  } else {
    w = c.width * 0.55; h = w * (img.height / img.width);
    cy = c.height * 0.48;
  }
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  ctx.restore();
  // Dashed outline guide
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.setLineDash([8, 8]);
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
  ctx.restore();
}

function drawFaceGuide(ctx: CanvasRenderingContext2D, c: HTMLCanvasElement, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.55;
  ctx.setLineDash([6, 8]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(c.width / 2, c.height / 2, c.width * 0.22, c.height * 0.28, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawMakeup(ctx: CanvasRenderingContext2D, c: HTMLCanvasElement, lm: any, flipped: boolean, color: string) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  LIP_OUTER.forEach((i, k) => {
    const x = (flipped ? 1 - lm[i].x : lm[i].x) * c.width;
    const y = lm[i].y * c.height;
    if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
