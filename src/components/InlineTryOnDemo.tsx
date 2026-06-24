import { useRef, useState } from "react";
import { UploadCloud, Sparkles, Loader2, RefreshCw, Download, Share2, Shirt, Sofa } from "lucide-react";
import tshirtAsset from "@/assets/demo-tshirt.jpg.asset.json";
import chairAsset from "@/assets/demo-chair.jpg.asset.json";

type DemoKey = "tshirt" | "chair";
const DEMOS: Record<DemoKey, { label: string; img: string; icon: any; hint: string }> = {
  tshirt: { label: "Sky Blue T-Shirt", img: tshirtAsset.url, icon: Shirt, hint: "Upload a photo of yourself (upper body, front-facing)" },
  chair: { label: "Boucle Armchair", img: chairAsset.url, icon: Sofa, hint: "Upload a photo of the room where you'd like to place it" },
};

async function downscale(file: File, maxDim = 1280): Promise<string> {
  // Prefer EXIF-aware createImageBitmap when available
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" } as any);
      const s = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
      const w = Math.round(bitmap.width * s);
      const h = Math.round(bitmap.height * s);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, w, h);
        bitmap.close?.();
        return c.toDataURL("image/jpeg", 0.85);
      }
    } catch { /* fall back below */ }
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * s);
        const h = Math.round(img.height * s);
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        const ctx = c.getContext("2d");
        if (!ctx) return resolve(String(reader.result));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => resolve(String(reader.result));
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function InlineTryOnDemo({ compact = false }: { compact?: boolean }) {
  const [demo, setDemo] = useState<DemoKey>("tshirt");
  const [phase, setPhase] = useState<"idle" | "processing" | "result" | "error">("idle");
  const [result, setResult] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const d = DEMOS[demo];

  const onPick = async (f: File | null) => {
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type.toLowerCase())) { setErr("Unsupported format. Use JPG, PNG, or WEBP."); return; }
    if (f.size > 15 * 1024 * 1024) { setErr("Image too large (max 15MB)"); return; }
    setErr(null);
    const captureBase64 = await downscale(f);
    setUserPhoto(captureBase64);
    setPhase("processing");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 90_000);
    try {
      const r = await fetch("/api/public/tryon-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo, captureBase64 }),
        signal: ctrl.signal,
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || `AI error (${r.status})`);
      if (j?.fallback) {
        const reason: string = j?.reason || "";
        const friendly =
          reason === "credits_exhausted"
            ? "AI try-on is temporarily unavailable (out of credits). Please try again later."
            : reason === "busy"
            ? "AI is busy right now — please try again in a moment."
            : "AI try-on couldn't complete. Please try again.";
        setErr(friendly);
        setPhase("idle");
        setUserPhoto(null);
        return;
      }
      setResult(j.imageUrl);
      setPhase("result");

    } catch (e: any) {
      setResult(captureBase64);
      const msg = e?.name === "AbortError"
        ? "AI is taking too long — showing your photo so the flow completes."
        : (e?.message || "AI unavailable — showing your uploaded photo so the flow completes.");
      setErr(msg);
      setPhase("result");
    } finally {
      clearTimeout(timer);
    }
  };

  const reset = () => { setResult(null); setUserPhoto(null); setPhase("idle"); setErr(null); if (fileRef.current) fileRef.current.value = ""; };

  const download = async () => {
    if (!result) return;
    const blob = await (await fetch(result)).blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `easibie-tryon-${demo}.png`;
    a.click();
  };

  const share = async () => {
    if (!result) return;
    try {
      const blob = await (await fetch(result)).blob();
      const file = new File([blob], `easibie-tryon-${demo}.png`, { type: blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Easibie try-on", text: "Made with Easibie AI try-on" });
        return;
      }
      await navigator.clipboard.writeText(window.location.origin);
      alert("Link copied to clipboard");
    } catch {}
  };

  return (
    <div className="rounded-3xl overflow-hidden border bg-white" style={{ borderColor: "rgba(2,132,199,0.18)", boxShadow: "0 30px 80px -30px rgba(2,132,199,0.45)" }}>
      {/* Demo product selector */}
      <div className="flex gap-2 p-3 border-b bg-gradient-to-r from-sky-50 to-cyan-50" style={{ borderColor: "rgba(2,132,199,0.12)" }}>
        {(Object.keys(DEMOS) as DemoKey[]).map((k) => {
          const D = DEMOS[k]; const Icon = D.icon; const active = k === demo;
          return (
            <button key={k} onClick={() => { setDemo(k); reset(); }}
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: active ? "linear-gradient(135deg,#0369A1,#38BDF8)" : "white",
                color: active ? "white" : "var(--ink)",
                border: active ? "none" : "1px solid var(--border)",
                boxShadow: active ? "0 8px 20px -8px rgba(2,132,199,0.5)" : "none",
              }}>
              <Icon size={16} /> <span className="truncate">{D.label}</span>
            </button>
          );
        })}
      </div>

      <div className={`grid ${compact ? "grid-cols-1" : "md:grid-cols-2"}`}>
        {/* Product preview */}
        <div className="p-6 bg-gradient-to-br from-slate-50 to-sky-50 grid place-items-center min-h-[300px]">
          <img src={d.img} alt={d.label} loading="lazy" className="max-h-[340px] w-auto object-contain drop-shadow-xl rounded-xl" />
        </div>

        {/* User / result panel */}
        <div
          className="p-6 grid place-items-center min-h-[300px] relative bg-white"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) onPick(f);
          }}
          style={dragOver ? { background: "rgba(56,189,248,0.08)", outline: "2px dashed #38BDF8", outlineOffset: "-12px" } : undefined}
        >
          {phase === "idle" && (
            <label className="cursor-pointer text-center group">
              <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" hidden onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
              <div className="w-20 h-20 mx-auto rounded-2xl grid place-items-center mb-4 transition-transform group-hover:scale-105"
                style={{ background: "linear-gradient(135deg,#0369A1,#38BDF8)", boxShadow: "0 14px 30px -8px rgba(2,132,199,0.45)" }}>
                <UploadCloud size={32} color="white" />
              </div>
              <div className="font-display font-bold text-lg text-ink">Try it on yourself</div>
              <p className="text-sm text-muted mt-1 max-w-xs mx-auto">{d.hint}</p>
              <p className="text-[11px] text-muted mt-1">Drop a JPG, PNG or WEBP here, or</p>
              <span className="inline-flex mt-2 btn-primary"><Sparkles size={14} /> Upload Photo</span>
              {err && <p className="text-xs text-error mt-3">{err}</p>}
            </label>
          )}

          {phase === "processing" && (
            <div className="text-center">
              {userPhoto && <img src={userPhoto} alt="" className="w-32 h-32 object-cover rounded-2xl mx-auto opacity-60 mb-4" />}
              <Loader2 className="animate-spin mx-auto text-primary" size={32} />
              <div className="mt-3 font-display font-bold">AI is working its magic…</div>
              <p className="text-sm text-muted mt-1">Usually 10–20 seconds</p>
            </div>
          )}

          {phase === "result" && result && (
            <div className="w-full text-center">
              <img src={result} alt="Try-on result" className="w-full max-h-[340px] object-contain rounded-2xl mx-auto" />
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <button onClick={download} className="btn-ghost text-sm" style={{ padding: "10px 18px" }}><Download size={14} /> Download</button>
                <button onClick={share} className="btn-ghost text-sm" style={{ padding: "10px 18px" }}><Share2 size={14} /> Share</button>
                <button onClick={reset} className="btn-primary text-sm" style={{ padding: "10px 18px" }}><RefreshCw size={14} /> Try Another</button>
              </div>
            </div>
          )}

          {phase === "error" && (
            <div className="text-center">
              <p className="text-error font-semibold">{err || "Something went wrong"}</p>
              <button onClick={reset} className="btn-primary mt-4"><RefreshCw size={14} /> Try Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
