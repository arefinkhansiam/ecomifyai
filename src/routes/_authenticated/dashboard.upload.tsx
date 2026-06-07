import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { UploadCloud, Loader2, Sparkles, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/upload")({
  component: UploadPage,
});

type Size = "small" | "medium" | "large";

function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [label, setLabel] = useState("View in AR");
  const [bg, setBg] = useState("#0284C7");
  const [fg, setFg] = useState("#FFFFFF");
  const [radius, setRadius] = useState(12);
  const [size, setSize] = useState<Size>("medium");

  const onFile = (f: File | null) => {
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) { toast.error("Use JPG, PNG or WebP"); return; }
    if (f.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    if (!name) setName(f.name.replace(/\.[^.]+$/, ""));
  };

  const upload = async () => {
    if (!file || !user) return;
    setBusy(true);
    try {
      setStep("Uploading image...");
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file);
      if (upErr) throw upErr;

      setStep("Saving product...");
      const { data: created, error: insErr } = await supabase.from("ar_products").insert({
        user_id: user.id,
        product_name: name || "Untitled Product",
        product_price: price ? Number(price) : null,
        original_image_url: path,
        status: "ready",
        processing_step: "complete",
        processing_progress: 100,
        file_size_bytes: file.size,
        dominant_color: bg,
        button_label: label,
        button_bg_color: bg,
        button_text_color: fg,
        button_border_radius: radius,
        button_size: size,
        is_public: true,
      }).select().single();
      if (insErr) throw insErr;

      toast.success("AR product created!");
      setCreatedId(created.id);
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally { setBusy(false); setStep(""); }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "https://your-domain.com";
  const productId = createdId ?? "PRODUCT_ID";
  const htmlSnippet = `<script src="${origin}/widget.js" data-product-id="${productId}"></script>`;
  const liquidSnippet = `{% comment %} Easibie AR — paste in product template {% endcomment %}\n<script\n  src="${origin}/widget.js"\n  data-product-id="${productId}"\n  data-label="${label}"\n  data-color="${bg}"\n  data-text-color="${fg}"\n></script>`;

  const sizePad = useMemo(() => size === "small" ? "10px 18px" : size === "large" ? "18px 36px" : "14px 28px", [size]);
  const sizeFs = useMemo(() => size === "small" ? "13px" : size === "large" ? "17px" : "15px", [size]);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(null), 1500);
    toast.success("Copied to clipboard");
  };

  return (
    <DashboardShell title="Upload New AR Product">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: image upload */}
        <div className="bg-card rounded-2xl p-6 glow-card">
          <h4 className="text-ink">1. Product image</h4>
          <label className="block mt-4">
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
                  <p className="text-sm mt-1">JPG, PNG or WebP. Max 10MB.</p>
                </>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            </div>
          </label>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">Product name</label>
              <input className="input-base mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Modern Lounge Chair" />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">Price (optional)</label>
              <input className="input-base mt-1" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))} placeholder="299.00" inputMode="decimal" />
            </div>
          </div>
        </div>

        {/* Right: button customization + live preview */}
        <div className="bg-card rounded-2xl p-6 glow-card">
          <h4 className="text-ink">2. Customize your AR button</h4>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">Button label</label>
              <input className="input-base mt-1" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={40} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Background" value={bg} onChange={setBg} />
              <ColorField label="Text color" value={fg} onChange={setFg} />
            </div>
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
          </div>

          <div className="mt-6 rounded-2xl p-8 bg-soft grid place-items-center">
            <div className="text-[11px] uppercase tracking-wider text-muted mb-3">Live preview</div>
            <button
              type="button"
              style={{
                background: bg, color: fg, padding: sizePad, fontSize: sizeFs,
                borderRadius: radius, fontWeight: 600, border: "none",
                boxShadow: "0 6px 20px -6px rgba(2,132,199,0.55)",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              <Sparkles size={16} /> {label || "View in AR"}
            </button>
          </div>

          <button onClick={upload} disabled={!file || busy || !!createdId} className="btn-primary w-full mt-6">
            {busy ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            {busy ? step || "Working..." : createdId ? "Created ✓" : "Create AR Product"}
          </button>
        </div>
      </div>

      {/* Step 3 — embed code (shown after creation) */}
      {createdId && (
        <div className="mt-6 bg-card rounded-2xl p-6 glow-card">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h4 className="text-ink">3. Add it to your store</h4>
              <p className="text-sm">Paste this snippet wherever you want the AR button to appear.</p>
            </div>
            <Link to="/dashboard/products" className="btn-ghost">Go to products →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <CodeBlock title="Any website / WooCommerce / Wix" code={htmlSnippet} onCopy={() => copy(htmlSnippet, "html")} copied={copied === "html"} />
            <CodeBlock title="Shopify (product.liquid)" code={liquidSnippet} onCopy={() => copy(liquidSnippet, "liquid")} copied={copied === "liquid"} />
          </div>

          <details className="mt-5 text-sm text-muted">
            <summary className="cursor-pointer text-ink font-semibold">Where to paste it →</summary>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><b>Shopify:</b> Online Store → Themes → Edit code → Sections/product.liquid. Paste anywhere inside the product info block.</li>
              <li><b>WooCommerce:</b> Edit product → Product short description (Text tab) → Paste the script tag.</li>
              <li><b>Wix:</b> Add an HTML Embed widget on your product page and paste the script.</li>
              <li><b>Plain HTML:</b> Paste the script tag inside the product details section.</li>
            </ul>
          </details>

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

function CodeBlock({ title, code, onCopy, copied }: { title: string; code: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="rounded-2xl border bg-[#0B1220] text-white/90 overflow-hidden" style={{ borderColor: "var(--border)" }}>
      <div className="px-4 py-2.5 flex items-center justify-between text-xs uppercase tracking-wider text-white/60 border-b border-white/10">
        <span>{title}</span>
        <button onClick={onCopy} className="inline-flex items-center gap-1 text-white hover:text-sky-300">
          {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
        </button>
      </div>
      <pre className="px-4 py-4 text-[12.5px] leading-relaxed overflow-x-auto font-mono whitespace-pre-wrap break-all">{code}</pre>
    </div>
  );
}
