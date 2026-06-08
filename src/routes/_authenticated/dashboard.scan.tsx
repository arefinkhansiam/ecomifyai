import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2, Sparkles, ScanLine, X } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { generate3dPreview } from "@/lib/scan-ai.functions";

export const Route = createFileRoute("/_authenticated/dashboard/scan")({
  ssr: false,
  component: ScanPage,
});

const TOTAL_FRAMES = 40;
const CAPTURE_INTERVAL_MS = 2000;
const DETECT_INTERVAL_MS = 500;

type Phase = "intro" | "scanning" | "uploading" | "generating" | "done" | "error";

function ScanPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const generate = useServerFn(generate3dPreview);

  const [phase, setPhase] = useState<Phase>("intro");
  const [productName, setProductName] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [objectVisible, setObjectVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const detectTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captureTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef(0);
  const productIdRef = useRef<string | null>(null);
  const objectVisibleRef = useRef(false);

  useEffect(() => () => stopAll(), []);

  const stopAll = () => {
    detectTimerRef.current && clearInterval(detectTimerRef.current);
    captureTimerRef.current && clearInterval(captureTimerRef.current);
    detectTimerRef.current = null;
    captureTimerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const start = async () => {
    if (!user) return;
    setError(null);
    if (!productName.trim()) { toast.error("Add a product name first"); return; }

    // Create product row
    const { data: created, error: insErr } = await supabase.from("ar_products").insert({
      user_id: user.id,
      product_name: productName.trim(),
      ar_mode: "scan_ai",
      status: "processing",
      processing_step: "scanning",
      processing_progress: 0,
      is_public: true,
    } as any).select("id").single();
    if (insErr || !created) { toast.error(insErr?.message ?? "Could not start scan"); return; }
    setProductId(created.id);
    productIdRef.current = created.id;

    // Start camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e: any) {
      setError("Camera permission denied. Allow camera access in your browser settings.");
      setPhase("error");
      return;
    }

    setPhase("scanning");

    // Load MediaPipe object detector from CDN
    try {
      const vision: any = await import(/* @vite-ignore */ ("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs" as string));
      const fileset = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm",
      );
      detectorRef.current = await vision.ObjectDetector.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
        },
        scoreThreshold: 0.35,
        runningMode: "VIDEO",
      });
    } catch (e) {
      // If detector fails, treat object as always visible — keep the flow working.
      detectorRef.current = null;
    }

    // Detection loop
    detectTimerRef.current = setInterval(() => {
      const v = videoRef.current;
      if (!v || v.readyState < 2) return;
      if (!detectorRef.current) { objectVisibleRef.current = true; setObjectVisible(true); return; }
      try {
        const r = detectorRef.current.detectForVideo(v, performance.now());
        const visible = (r?.detections?.length ?? 0) > 0;
        objectVisibleRef.current = visible;
        setObjectVisible(visible);
      } catch {/* ignore */}
    }, DETECT_INTERVAL_MS);

    // Capture loop
    captureTimerRef.current = setInterval(() => { void tickCapture(); }, CAPTURE_INTERVAL_MS);
  };

  const tickCapture = async () => {
    if (!objectVisibleRef.current) return;
    if (countRef.current >= TOTAL_FRAMES) return;
    const v = videoRef.current, c = canvasRef.current, pid = productIdRef.current, uid = user?.id;
    if (!v || !c || !pid || !uid) return;
    c.width = v.videoWidth || 1280; c.height = v.videoHeight || 720;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const blob: Blob | null = await new Promise((res) => c.toBlob((b) => res(b), "image/jpeg", 0.85));
    if (!blob) return;

    const n = countRef.current + 1;
    const path = `scans/${uid}/${pid}/frame_${String(n).padStart(3, "0")}.jpg`;
    const { error: upErr } = await supabase.storage.from("product-images")
      .upload(path, blob, { contentType: "image/jpeg", upsert: true });
    if (upErr) return;
    await supabase.from("scan_frames").insert({ product_id: pid, frame_url: path, frame_number: n });
    countRef.current = n;
    setCount(n);
    await supabase.from("ar_products").update({
      processing_progress: Math.round((n / TOTAL_FRAMES) * 50),
    }).eq("id", pid);
    if (n >= TOTAL_FRAMES) await finishScan();
  };

  const finishScan = async () => {
    stopAll();
    setPhase("generating");
    try {
      await generate({ data: { productId: productIdRef.current! } });
      setPhase("done");
      toast.success("AR Ready!");
    } catch (e: any) {
      setError(String(e?.message ?? e));
      setPhase("error");
    }
  };

  const hint = (() => {
    if (count < 10) return "Slowly rotate the product to the left";
    if (count < 20) return "Now tilt up slightly";
    if (count < 30) return "Show the back of the product";
    return "Almost done — show the bottom";
  })();

  const pct = Math.round((count / TOTAL_FRAMES) * 100);

  return (
    <DashboardShell title="Scan with Camera">
      {phase === "intro" && (
        <div className="max-w-xl mx-auto bg-card rounded-2xl p-6 glow-card">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl grid place-items-center text-white" style={{ background: "linear-gradient(135deg,#0369A1,#38BDF8)" }}>
              <ScanLine size={22} />
            </span>
            <div>
              <h3 className="text-ink">Scan a real product</h3>
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>Place your product on a clean surface. We'll capture {TOTAL_FRAMES} angles and turn it into an AR-ready preview.</p>
            </div>
          </div>
          <div className="mt-5">
            <label className="text-xs text-muted uppercase tracking-wide">Product name</label>
            <input className="input-base mt-1" placeholder="e.g. Velvet Lounge Chair" value={productName} onChange={(e) => setProductName(e.target.value)} />
          </div>
          <button onClick={start} className="btn-primary mt-6 w-full justify-center">
            <Camera size={16} /> Start camera scan
          </button>
          <ul className="mt-6 text-xs space-y-2" style={{ color: "var(--ink-soft)" }}>
            <li>• Use good lighting</li>
            <li>• Rotate slowly — we auto-capture every 2 seconds</li>
            <li>• Keep the whole product in frame</li>
          </ul>
        </div>
      )}

      {(phase === "scanning" || phase === "generating") && (
        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-black aspect-[3/4] sm:aspect-video">
            <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            {/* viewport overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-6 rounded-2xl border-2"
                style={{ borderColor: objectVisible ? "#10B981" : "rgba(255,255,255,0.45)", transition: "border-color .2s" }} />
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: objectVisible ? "rgba(16,185,129,0.85)" : "rgba(0,0,0,0.55)", color: "#fff" }}>
                  {objectVisible ? "Product detected" : "Place product in frame"}
                </span>
                <button onClick={() => { stopAll(); setPhase("intro"); setCount(0); countRef.current = 0; }}
                  className="w-9 h-9 rounded-full grid place-items-center text-white" style={{ background: "rgba(0,0,0,0.55)" }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* progress ring */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <ProgressRing pct={pct} label={`${count}/${TOTAL_FRAMES}`} />
            </div>

            {phase === "generating" && (
              <div className="absolute inset-0 grid place-items-center" style={{ background: "rgba(0,0,0,0.78)" }}>
                <div className="text-center text-white">
                  <Sparkles size={42} className="mx-auto animate-pulse" />
                  <div className="font-display text-xl mt-3">Generating your AR preview…</div>
                  <div className="text-xs opacity-70 mt-1">AI is cleaning up the scan</div>
                </div>
              </div>
            )}
          </div>

          {phase === "scanning" && (
            <div className="mt-5 bg-card rounded-2xl p-5 glow-card text-center">
              <div className="text-sm font-semibold text-ink">{hint}</div>
              <div className="mt-1 text-xs" style={{ color: "var(--ink-soft)" }}>Capturing every 2 seconds while product is in view</div>
            </div>
          )}
        </div>
      )}

      {phase === "done" && (
        <div className="max-w-xl mx-auto bg-card rounded-2xl p-8 text-center glow-card">
          <span className="w-14 h-14 rounded-2xl grid place-items-center text-white mx-auto" style={{ background: "linear-gradient(135deg,#10B981,#34D399)" }}>
            <Sparkles size={26} />
          </span>
          <h3 className="text-ink mt-4">Your AR product is ready</h3>
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>You can preview it, copy the embed code, or scan another product.</p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <button className="btn-primary" onClick={() => navigate({ to: "/dashboard/products" })}>Go to My Products</button>
            <button className="btn-ghost" onClick={() => { setPhase("intro"); setCount(0); countRef.current = 0; setProductName(""); setProductId(null); productIdRef.current = null; }}>
              Scan another
            </button>
          </div>
        </div>
      )}

      {phase === "error" && (
        <div className="max-w-xl mx-auto bg-card rounded-2xl p-8 text-center">
          <h3 className="text-ink">Something went wrong</h3>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button className="btn-primary mt-6" onClick={() => { setPhase("intro"); setError(null); setCount(0); countRef.current = 0; }}>
            Try again
          </button>
        </div>
      )}
    </DashboardShell>
  );
}

function ProgressRing({ pct, label }: { pct: number; label: string }) {
  const r = 36, c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <div className="relative w-24 h-24 grid place-items-center">
      <svg width={88} height={88} className="rotate-[-90deg]">
        <circle cx={44} cy={44} r={r} stroke="rgba(255,255,255,0.25)" strokeWidth={6} fill="none" />
        <circle cx={44} cy={44} r={r} stroke="#38BDF8" strokeWidth={6} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div className="absolute text-white text-sm font-bold">{label}</div>
    </div>
  );
}
