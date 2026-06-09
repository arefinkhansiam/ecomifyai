import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Sparkles, ScanLine, X, Check, Copy, ExternalLink, ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { generate3dPreview } from "@/lib/scan-ai.functions";

type ArMode = "fashion" | "furniture" | "makeup" | "full_3d";
type ClothingSub = "top" | "bottom" | "accessory" | "jewellery";
type ScanSearch = { mode?: ArMode; subtype?: ClothingSub };

export const Route = createFileRoute("/_authenticated/dashboard/scan")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): ScanSearch => {
    const m = s.mode as ArMode | undefined;
    const sub = s.subtype as ClothingSub | undefined;
    return {
      mode: m && ["fashion", "furniture", "makeup", "full_3d"].includes(m) ? m : undefined,
      subtype: sub && ["top", "bottom", "accessory", "jewellery"].includes(sub) ? sub : undefined,
    };
  },
  component: ScanPage,
});

const TOTAL_FRAMES = 12;
const FRAMES_PER_ANGLE = 3;
const CAPTURE_INTERVAL_MS = 1500;
const DETECT_INTERVAL_MS = 500;

type Phase = "intro" | "scanning" | "generating" | "done" | "error";
type GenStep = "capturing" | "cleaning" | "composing";
type Diagnostic = { label: string; value: string; at: string };
type TimelineStep = { label: string; status: "pending" | "active" | "done" | "error"; at?: string; error?: string };

const stamp = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const initialTimeline = (): TimelineStep[] => [
  { label: "Upload", status: "pending" },
  { label: "Scanning", status: "pending" },
  { label: "Angle capture", status: "pending" },
  { label: "Mockup generation", status: "pending" },
  { label: "AR render", status: "pending" },
];

function ScanPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const generate = useServerFn(generate3dPreview);
  // Category passed from /dashboard/create. Falls back to legacy "scan_ai" flow.
  const arMode: ArMode = search.mode ?? "furniture";
  const subtype = search.subtype;

  const [phase, setPhase] = useState<Phase>("intro");
  const [productName, setProductName] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [objectVisible, setObjectVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoDetect, setAutoDetect] = useState(true);
  const [genStep, setGenStep] = useState<GenStep>("capturing");
  const [previewThumb, setPreviewThumb] = useState<string | null>(null);
  const [embedToken, setEmbedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [timeline, setTimeline] = useState<TimelineStep[]>(initialTimeline);
  const [detectConfidence, setDetectConfidence] = useState(0);
  const [captureLatency, setCaptureLatency] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const detectTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captureTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef(0);
  const productIdRef = useRef<string | null>(null);
  const objectVisibleRef = useRef(false);
  const confidenceRef = useRef(0);

  useEffect(() => () => stopAll(), []);

  const stopAll = () => {
    if (detectTimerRef.current) clearInterval(detectTimerRef.current);
    if (captureTimerRef.current) clearInterval(captureTimerRef.current);
    detectTimerRef.current = null;
    captureTimerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const addDiagnostic = (label: string, value: string) => {
    setDiagnostics((items) => [{ label, value, at: stamp() }, ...items].slice(0, 8));
  };

  const markStep = (label: string, status: TimelineStep["status"], errorMsg?: string) => {
    setTimeline((items) => items.map((item) =>
      item.label === label ? { ...item, status, at: stamp(), error: errorMsg } : item,
    ));
  };

  const waitForVideoReady = (v: HTMLVideoElement) =>
    new Promise<void>((resolve) => {
      if (v.readyState >= 2 && v.videoWidth > 0) return resolve();
      const on = () => { v.removeEventListener("loadeddata", on); resolve(); };
      v.addEventListener("loadeddata", on);
    });

  const start = async () => {
    if (!user) return;
    setError(null);
    setDiagnostics([]);
    setTimeline(initialTimeline());
    addDiagnostic("Scan", "Starting product scan");
    if (!productName.trim()) { toast.error("Add a product name first"); return; }

    // Camera supported?
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Your browser doesn't support camera access. Try Chrome/Safari on mobile.");
      setPhase("error"); return;
    }

    // Create product row first
    const { data: created, error: insErr } = await supabase.from("ar_products").insert({
      user_id: user.id,
      product_name: productName.trim(),
      ar_mode: arMode,
      ar_subtype: subtype ?? null,
      status: "processing",
      processing_step: "scanning_camera",
      processing_progress: 5,
      is_public: true,
    } as any).select("id").single();
    if (insErr || !created) { toast.error(insErr?.message ?? "Could not start scan"); return; }
    markStep("Upload", "done");
    markStep("Scanning", "active");
    setProductId(created.id);
    productIdRef.current = created.id;

    // CRITICAL: mount the video element FIRST, then attach the stream.
    setPhase("scanning");
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => requestAnimationFrame(() => r(null)));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current;
      if (!v) throw new Error("Video element not ready");
      v.srcObject = stream;
      await v.play().catch(() => {});
      await waitForVideoReady(v);
      addDiagnostic("Camera", `${v.videoWidth}×${v.videoHeight} ready`);
      console.log("[scan] camera ready", v.videoWidth, "x", v.videoHeight);
    } catch (e: any) {
      const name = e?.name ?? "";
      const msg =
        name === "NotAllowedError" ? "Camera permission was denied. Enable it in your browser settings and try again."
        : name === "NotFoundError" ? "No camera found on this device."
        : name === "NotReadableError" ? "Camera is already in use by another app."
        : `Couldn't start camera: ${e?.message ?? name ?? "unknown"}`;
      setError(msg);
      addDiagnostic("Camera error", msg);
      markStep("Scanning", "error", msg);
      setPhase("error");
      stopAll();
      return;
    }

    // Try MediaPipe. If unavailable, run without auto-detect.
    try {
      const url = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";
      const vision: any = await import(/* @vite-ignore */ url);
      const fileset = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm",
      );
      detectorRef.current = await vision.ObjectDetector.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
        },
        scoreThreshold: 0.3,
        runningMode: "VIDEO",
      });
      setAutoDetect(true);
      addDiagnostic("Model", "Object detector loaded");
      console.log("[scan] detector ready");
    } catch (e) {
      console.warn("[scan] detector unavailable, fallback to always-capture", e);
      detectorRef.current = null;
      setAutoDetect(false);
      objectVisibleRef.current = true;
      setObjectVisible(true);
      setDetectConfidence(1);
      confidenceRef.current = 1;
      addDiagnostic("Model", "Detector fallback active");
    }

    // Detection loop
    detectTimerRef.current = setInterval(() => {
      const v = videoRef.current;
      if (!v || v.readyState < 2) return;
      if (!detectorRef.current) {
        objectVisibleRef.current = true; setObjectVisible(true); return;
      }
      try {
        const r = detectorRef.current.detectForVideo(v, performance.now());
        const topScore = Math.max(0, ...(r?.detections ?? []).map((d: any) => d?.categories?.[0]?.score ?? 0));
        const visible = topScore > 0.18 || (r?.detections?.length ?? 0) > 0;
        objectVisibleRef.current = visible;
        confidenceRef.current = topScore;
        setDetectConfidence(topScore);
        setObjectVisible(visible);
      } catch {/* ignore */}
    }, DETECT_INTERVAL_MS);

    captureTimerRef.current = setInterval(() => { void tickCapture(); }, CAPTURE_INTERVAL_MS);
    // Immediate first capture so the user sees progress right away
    setTimeout(() => { void tickCapture(true); }, 600);
  };

  const manualCapture = () => { void tickCapture(true); };

  const tickCapture = async (force = false) => {
    if (!force && !objectVisibleRef.current) {
      addDiagnostic("Detection", `Waiting for product · confidence ${Math.round(confidenceRef.current * 100)}%`);
      return;
    }
    if (countRef.current >= TOTAL_FRAMES) return;
    const v = videoRef.current, c = canvasRef.current, pid = productIdRef.current, uid = user?.id;
    if (!v || !c || !pid || !uid) return;
    if (!v.videoWidth || !v.videoHeight) return;
    const started = performance.now();
    markStep("Angle capture", "active");
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const blob: Blob | null = await new Promise((res) => c.toBlob((b) => res(b), "image/jpeg", 0.85));
    if (!blob) return;

    const n = countRef.current + 1;
    const path = `scans/${uid}/${pid}/frame_${String(n).padStart(3, "0")}.jpg`;
    const { error: upErr } = await supabase.storage.from("product-images")
      .upload(path, blob, { contentType: "image/jpeg", upsert: true });
    if (upErr) { console.warn("[scan] upload err", upErr); addDiagnostic("Upload error", upErr.message); return; }
    await supabase.from("scan_frames").insert({ product_id: pid, frame_url: path, frame_number: n });
    const ms = Math.round(performance.now() - started);
    setCaptureLatency(ms);
    countRef.current = n;
    setCount(n);
    addDiagnostic("Captured", `${angleForCount(n - 1)} frame ${n}/${TOTAL_FRAMES} · ${ms}ms · confidence ${Math.round(confidenceRef.current * 100)}%`);
    await supabase.from("ar_products").update({
      processing_step: `angle_${angleForCount(n - 1).toLowerCase().replace(/\W+/g, "_")}`,
      processing_progress: Math.max(10, Math.round((n / TOTAL_FRAMES) * 60)),
    }).eq("id", pid);
    if (n >= TOTAL_FRAMES) { markStep("Angle capture", "done"); await finishScan(); }
  };

  const finishScan = async () => {
    stopAll();
    setPhase("generating");
    setGenStep("cleaning");
    markStep("Scanning", "done");
    markStep("Mockup generation", "active");
    addDiagnostic("Mockup", "AI generation started");
    // 3-step animation timing
    setTimeout(() => setGenStep("composing"), 1500);
    try {
      await generate({ data: { productId: productIdRef.current! } });
      // fetch token + thumb
      const { data } = await supabase.from("ar_products")
        .select("embed_token, processed_image_url")
        .eq("id", productIdRef.current!).maybeSingle();
      if (data?.embed_token) setEmbedToken(data.embed_token);
      if (data?.processed_image_url) {
        const { data: signed } = await supabase.storage.from("product-images")
          .createSignedUrl(data.processed_image_url, 3600);
        if (signed?.signedUrl) setPreviewThumb(signed.signedUrl);
      }
      markStep("Mockup generation", "done");
      markStep("AR render", "done");
      addDiagnostic("AR", "Live AR viewer ready");
      setPhase("done");
      toast.success("AR Ready!");
    } catch (e: any) {
      const message = String(e?.message ?? e);
      setError(message);
      addDiagnostic("Mockup error", message);
      markStep("Mockup generation", "error", message);
      setPhase("error");
    }
  };

  const reset = () => {
    stopAll();
    setPhase("intro"); setCount(0); countRef.current = 0; setProductName("");
    setProductId(null); productIdRef.current = null;
    setPreviewThumb(null); setEmbedToken(null); setError(null);
    setDiagnostics([]); setTimeline(initialTimeline()); setDetectConfidence(0); confidenceRef.current = 0; setCaptureLatency(null);
  };

  const cancel = () => { stopAll(); setPhase("intro"); setCount(0); countRef.current = 0; };

  // Per-category scan guidance. Different products need different angles.
  const guidance = (() => {
    if (arMode === "fashion" && subtype === "jewellery") {
      return [
        { until: 10, hint: "Lay it flat on a clean surface, top view",  label: "Top" },
        { until: 20, hint: "Tilt 45° — show the clasp/details",          label: "Side" },
        { until: 30, hint: "Flip to back — show the closure",            label: "Back" },
        { until: 40, hint: "Close-up of any stones or engravings",       label: "Detail" },
      ];
    }
    if (arMode === "fashion") {
      return [
        { until: 10, hint: "Lay the item flat — full front view",       label: "Front" },
        { until: 20, hint: "Smooth out wrinkles, rotate slowly left",   label: "Left" },
        { until: 30, hint: "Flip to back side, full view",              label: "Back" },
        { until: 40, hint: "Close-ups of tag, fabric, stitching",       label: "Detail" },
      ];
    }
    if (arMode === "makeup") {
      return [
        { until: 10, hint: "Front of the product, label visible",        label: "Front" },
        { until: 20, hint: "Open it — show the actual color / swatch",   label: "Swatch" },
        { until: 30, hint: "Rotate slowly, capture every side",          label: "Side" },
        { until: 40, hint: "Close-up of the shade / finish",             label: "Detail" },
      ];
    }
    // furniture / generic object
    return [
      { until: 10, hint: "Front view — keep whole product in frame",   label: "Front" },
      { until: 20, hint: "Rotate to the left side",                    label: "Left" },
      { until: 30, hint: "Now show the back",                          label: "Back" },
      { until: 40, hint: "Top-down and any unique details",            label: "Top" },
    ];
  })();
  function angleForCount(frameIndex: number) {
    const index = Math.min(guidance.length - 1, Math.floor(frameIndex / FRAMES_PER_ANGLE));
    return guidance[index]?.label ?? "Angle";
  }
  const step = guidance.find((g) => count < g.until) ?? guidance[guidance.length - 1];
  const hint = step.hint;
  const angleLabel = step.label;
  const pct = Math.round((count / TOTAL_FRAMES) * 100);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const viewerUrl = embedToken ? `${origin}/ar/${embedToken}` : `${origin}/ar/view/${productId}`;
  const embedSnippet = `<iframe src="${viewerUrl}" width="100%" height="550" frameborder="0" allow="xr-spatial-tracking; camera" allowfullscreen></iframe>`;
  const copyEmbed = async () => {
    await navigator.clipboard.writeText(embedSnippet);
    setCopied(true); toast.success("Embed code copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const isCameraPhase = phase === "scanning" || phase === "generating";

  return (
    <DashboardShell title="Scan with Camera">
      {/* Always render the camera elements so refs exist when we attach the stream. */}
      <div className={isCameraPhase ? "block" : "hidden"}>
        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden aspect-[3/4] sm:aspect-video"
               style={{ background: "radial-gradient(ellipse at center, #0F172A 0%, #020617 100%)" }}>
            <video ref={videoRef} playsInline muted autoPlay
              className="absolute inset-0 w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />

            {/* darkening vignette */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45), transparent 25%, transparent 65%, rgba(0,0,0,0.6))" }} />

            {/* Detection frame */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-6 rounded-2xl border-2 transition-all"
                style={{
                  borderColor: objectVisible ? "#10B981" : "rgba(255,255,255,0.5)",
                  boxShadow: objectVisible ? "0 0 0 6px rgba(16,185,129,0.18)" : "0 0 0 6px rgba(255,255,255,0.06)",
                  animation: objectVisible ? "none" : "pulse 1.8s ease-in-out infinite",
                }} />
              {/* corner ticks */}
              {([
                { t: 24, l: 24 }, { t: 24, r: 24 }, { b: 24, l: 24 }, { b: 24, r: 24 },
              ] as any[]).map((p, i) => (
                <div key={i} className="absolute w-5 h-5"
                  style={{
                    top: p.t, bottom: p.b, left: p.l, right: p.r,
                    borderTop: p.t !== undefined ? `3px solid ${objectVisible ? "#10B981" : "#fff"}` : undefined,
                    borderBottom: p.b !== undefined ? `3px solid ${objectVisible ? "#10B981" : "#fff"}` : undefined,
                    borderLeft: p.l !== undefined ? `3px solid ${objectVisible ? "#10B981" : "#fff"}` : undefined,
                    borderRight: p.r !== undefined ? `3px solid ${objectVisible ? "#10B981" : "#fff"}` : undefined,
                  }} />
              ))}
            </div>

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4"
                 style={{ paddingTop: "calc(env(safe-area-inset-top) + 14px)" }}>
              <div className="px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-2 text-white"
                   style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)" }}>
                <span className="w-2 h-2 rounded-full animate-pulse"
                      style={{ background: objectVisible ? "#10B981" : "#38BDF8" }} />
                {objectVisible ? "PRODUCT DETECTED" : autoDetect ? "PLACE PRODUCT IN FRAME" : "AUTO-DETECT OFF · KEEP CENTERED"}
              </div>
              <div className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-white max-w-[40%] truncate"
                   style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)" }}>
                {productName}
              </div>
              <button onClick={cancel} aria-label="Cancel"
                className="w-9 h-9 rounded-full grid place-items-center text-white"
                style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)" }}>
                <X size={16} />
              </button>
            </div>

            {/* Shutter ring — tap to manually capture an extra angle */}
            <button onClick={manualCapture} aria-label="Capture angle"
              className="absolute left-1/2 -translate-x-1/2 active:scale-95 transition-transform"
              style={{ bottom: "calc(env(safe-area-inset-bottom) + 28px)" }}>
              <ShutterRing pct={pct} count={count} total={TOTAL_FRAMES} angle={angleLabel} />
            </button>

            {/* Generating overlay */}
            {phase === "generating" && (
              <div className="absolute inset-0 grid place-items-center text-center px-6"
                   style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(8px)" }}>
                <div>
                  <div className="w-20 h-20 mx-auto rounded-full grid place-items-center"
                       style={{ background: "rgba(56,189,248,0.18)", border: "2px solid #38BDF8", boxShadow: "0 0 40px rgba(56,189,248,0.45)" }}>
                    <Sparkles size={32} className="text-white animate-pulse" />
                  </div>
                  <h3 className="mt-5 font-display text-white text-2xl">Generating your AR preview…</h3>
                  <div className="mt-5 flex items-center justify-center gap-2 text-xs text-white/80">
                    <StepDot done label="Capturing" />
                    <StepDot done={genStep !== "capturing"} label="Cleaning" active={genStep === "cleaning"} />
                    <StepDot done={genStep === "composing"} label="Composing" active={genStep === "composing"} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {phase === "scanning" && (
            <div className="mt-5 rounded-2xl p-5 text-center text-white"
                 style={{ background: "linear-gradient(135deg,#0B1220,#1E293B)" }}>
              <div className="text-sm font-semibold">{hint}</div>
              <div className="mt-1 text-xs opacity-70">
                {autoDetect ? "Auto-capturing every 2 seconds while product is detected" : "Auto-detect off — capturing every 2 seconds"}
              </div>
            </div>
          )}
        </div>
      </div>

      {phase === "intro" && (
        <div className="max-w-xl mx-auto bg-card rounded-2xl p-6 glow-card">
          {search.mode && (
            <Link to="/dashboard/create" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mb-3">
              <ArrowLeft size={12} /> Change category
            </Link>
          )}
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl grid place-items-center text-white"
                  style={{ background: "linear-gradient(135deg,#0369A1,#38BDF8)" }}>
              <ScanLine size={22} />
            </span>
            <div>
              <h3 className="text-ink">
                Scan a {arMode === "fashion" ? (subtype ?? "fashion item") : arMode === "makeup" ? "makeup product" : arMode === "furniture" ? "furniture piece" : "product"}
              </h3>
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                Follow the on-screen direction for each angle. We capture {TOTAL_FRAMES} frames and turn it into an AR-ready preview.
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: "rgba(2,132,199,0.06)", border: "1px solid rgba(2,132,199,0.18)", color: "var(--ink-soft)" }}>
            <div className="font-semibold text-ink mb-1">You'll be guided through:</div>
            <ol className="space-y-0.5 ml-1">
              {guidance.map((g, i) => (
                <li key={i}>{i + 1}. <span className="font-medium text-ink">{g.label}</span> — {g.hint}</li>
              ))}
            </ol>
          </div>
          <div className="mt-5">
            <label className="text-xs text-muted uppercase tracking-wide">Product name</label>
            <input className="input-base mt-1" placeholder="e.g. Velvet Lounge Chair"
              value={productName} onChange={(e) => setProductName(e.target.value)} />
          </div>
          <button onClick={start} className="btn-primary mt-6 w-full justify-center">
            <Camera size={16} /> Start camera scan
          </button>
          <ul className="mt-6 text-xs space-y-2" style={{ color: "var(--ink-soft)" }}>
            <li>• Use good, even lighting</li>
            <li>• Rotate slowly — we auto-capture every 2 seconds</li>
            <li>• Keep the whole product in the frame</li>
          </ul>
        </div>
      )}

      {/* Done */}
      {phase === "done" && (
        <div className="max-w-xl mx-auto bg-card rounded-2xl p-8 text-center glow-card">
          <span className="w-14 h-14 rounded-2xl grid place-items-center text-white mx-auto"
                style={{ background: "linear-gradient(135deg,#10B981,#34D399)" }}>
            <Check size={26} />
          </span>
          <h3 className="text-ink mt-4">Your AR product is ready</h3>
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
            Preview it, copy the embed code, or scan another product.
          </p>
          {previewThumb && (
            <div className="mt-5 mx-auto w-40 h-40 rounded-2xl overflow-hidden border bg-soft"
                 style={{ borderColor: "var(--border)" }}>
              <img src={previewThumb} alt="" className="w-full h-full object-contain" />
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <a href={viewerUrl} target="_blank" rel="noreferrer" className="btn-primary">
              <ExternalLink size={14} /> Preview AR
            </a>
            <button className="btn-ghost" onClick={copyEmbed}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy embed"}
            </button>
            <button className="btn-ghost" onClick={reset}>Scan another</button>
            <button className="btn-ghost" onClick={() => navigate({ to: "/dashboard/products" })}>My products</button>
          </div>
        </div>
      )}

      {/* Error */}
      {phase === "error" && (
        <div className="max-w-xl mx-auto bg-card rounded-2xl p-8 text-center">
          <h3 className="text-ink">Something went wrong</h3>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button className="btn-primary mt-6" onClick={reset}>Try again</button>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.55 } }
      `}</style>
    </DashboardShell>
  );
}

function StepDot({ label, done, active }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{
        background: done ? "rgba(16,185,129,0.18)" : active ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.08)",
        border: `1px solid ${done ? "#10B981" : active ? "#38BDF8" : "rgba(255,255,255,0.15)"}`,
      }}>
      <span className="w-1.5 h-1.5 rounded-full"
        style={{ background: done ? "#10B981" : active ? "#38BDF8" : "rgba(255,255,255,0.4)" }} />
      {label}
    </span>
  );
}

function ShutterRing({ pct, count, total, angle }: { pct: number; count: number; total: number; angle: string }) {
  const r = 54, c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <div className="relative w-36 h-36 grid place-items-center">
      <svg width={140} height={140} className="rotate-[-90deg]">
        <circle cx={70} cy={70} r={r} stroke="rgba(255,255,255,0.18)" strokeWidth={8} fill="none" />
        <circle cx={70} cy={70} r={r} stroke="url(#g)" strokeWidth={8} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .4s ease" }} />
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center text-white">
        <div className="text-2xl font-bold leading-none">{count}<span className="text-white/50 text-base">/{total}</span></div>
        <div className="text-[10px] uppercase tracking-widest mt-1 opacity-80">{angle}</div>
      </div>
    </div>
  );
}
