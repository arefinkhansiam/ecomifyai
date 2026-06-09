import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { Shirt, Sofa, Sparkle, Box, Camera, UploadCloud, ChevronRight, Gem, Watch, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/create")({
  component: CreatePage,
});

type Category = "clothing" | "furniture" | "makeup" | "object_3d";
type ClothingSub = "top" | "bottom" | "accessory" | "jewellery";

const CATEGORIES: { id: Category; label: string; desc: string; Icon: any; tint: string }[] = [
  { id: "clothing",  label: "Clothing & Fashion", desc: "Shirts, pants, bags, jewellery — try-on with the front camera",  Icon: Shirt,  tint: "linear-gradient(135deg,#0369A1,#38BDF8)" },
  { id: "furniture", label: "Furniture & Decor",  desc: "Place it in the customer's room with the back camera",            Icon: Sofa,   tint: "linear-gradient(135deg,#7C3AED,#EC4899)" },
  { id: "makeup",    label: "Makeup & Beauty",    desc: "Lipstick, eyeshadow, blush, foundation — facial try-on",         Icon: Sparkle,tint: "linear-gradient(135deg,#EC4899,#F59E0B)" },
  { id: "object_3d", label: "3D Object Viewer",   desc: "Upload an existing .glb / .gltf model for WebXR / AR Quick Look", Icon: Box,    tint: "linear-gradient(135deg,#10B981,#34D399)" },
];

const CLOTHING_SUBS: { id: ClothingSub; label: string; Icon: any; example: string }[] = [
  { id: "top",       label: "Top / Shirt",       Icon: Shirt,       example: "T-shirts, shirts, jackets, dresses" },
  { id: "bottom",    label: "Bottoms",           Icon: ShoppingBag, example: "Pants, jeans, trousers, skirts" },
  { id: "accessory", label: "Accessories",       Icon: Watch,       example: "Watches, bags, hats, glasses, shoes" },
  { id: "jewellery", label: "Jewellery",         Icon: Gem,         example: "Necklaces, earrings, rings, bracelets" },
];

function CreatePage() {
  const [category, setCategory] = useState<Category | null>(null);
  const [sub, setSub] = useState<ClothingSub | null>(null);

  // Resolve ar_mode that the rest of the app stores in DB
  const arMode =
    category === "clothing" ? "fashion" :
    category === "furniture" ? "furniture" :
    category === "makeup" ? "makeup" :
    category === "object_3d" ? "full_3d" : "";

  const canContinue = category && (category !== "clothing" || sub);
  const allowScan = category !== "object_3d"; // scanning a 3D file doesn't make sense
  const allowUpload = true;

  const linkSearch = canContinue
    ? { mode: arMode as any, subtype: (sub ?? undefined) as any }
    : undefined;

  return (
    <DashboardShell title="Create AR Experience">
      <div className="max-w-4xl mx-auto">
        {/* Stepper */}
        <ol className="flex items-center gap-2 text-xs font-semibold text-muted mb-6">
          <li className={`px-3 py-1.5 rounded-full ${category ? "bg-primary/10 text-primary" : "bg-white border"}`}>1. Category</li>
          <ChevronRight size={14} />
          <li className={`px-3 py-1.5 rounded-full ${category === "clothing" ? (sub ? "bg-primary/10 text-primary" : "bg-white border") : "bg-white/40 text-muted/60"}`}>
            {category === "clothing" ? "2. Sub-type" : "2. —"}
          </li>
          <ChevronRight size={14} />
          <li className={`px-3 py-1.5 rounded-full ${canContinue ? "bg-white border" : "bg-white/40 text-muted/60"}`}>3. Scan or Upload</li>
        </ol>

        {/* Step 1: category */}
        <section className="bg-card rounded-2xl p-6 glow-card">
          <h4 className="text-ink">1. Pick the product category</h4>
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
            We tune the AI try-on prompt and camera direction based on this.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => { setCategory(c.id); if (c.id !== "clothing") setSub(null); }}
                  className="text-left p-4 rounded-2xl border-2 transition-all"
                  style={{
                    borderColor: active ? "var(--primary)" : "var(--border)",
                    background: active ? "linear-gradient(135deg, rgba(2,132,199,0.08), rgba(56,189,248,0.04))" : "#fff",
                    boxShadow: active ? "0 12px 30px -14px rgba(2,132,199,0.45)" : "none",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-11 h-11 rounded-xl grid place-items-center text-white" style={{ background: c.tint }}>
                      <c.Icon size={20} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-ink">{c.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>{c.desc}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: clothing sub-type */}
        {category === "clothing" && (
          <section className="bg-card rounded-2xl p-6 glow-card mt-5">
            <h4 className="text-ink">2. What kind of clothing item?</h4>
            <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
              The try-on AI applies a top to the torso, pants to the legs, jewellery to the right spot, etc.
            </p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CLOTHING_SUBS.map((s) => {
                const active = sub === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSub(s.id)}
                    className="text-left p-4 rounded-2xl border-2 transition-all"
                    style={{
                      borderColor: active ? "var(--primary)" : "var(--border)",
                      background: active ? "linear-gradient(135deg, rgba(2,132,199,0.08), rgba(56,189,248,0.04))" : "#fff",
                    }}
                  >
                    <s.Icon size={20} className={active ? "text-primary" : "text-muted"} />
                    <div className="mt-2 font-semibold text-sm text-ink">{s.label}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-soft)" }}>{s.example}</div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Step 3: scan or upload */}
        <section className="bg-card rounded-2xl p-6 glow-card mt-5"
          style={{ opacity: canContinue ? 1 : 0.5, pointerEvents: canContinue ? "auto" : "none" }}>
          <h4 className="text-ink">3. Add your product</h4>
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
            Scan it live, or upload a photo / 3D file. Both go through the same AI pipeline.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allowScan ? (
              <Link
                to="/dashboard/scan"
                search={linkSearch as any}
                className="p-5 rounded-2xl text-white block transition-transform hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg,#0369A1,#38BDF8)", boxShadow: "0 18px 40px -18px rgba(2,132,199,0.55)" }}
              >
                <Camera size={22} />
                <div className="mt-2 font-display text-lg font-bold">Scan with camera</div>
                <div className="text-xs opacity-85 mt-1">40 guided angles → AI generates an AR-ready preview.</div>
              </Link>
            ) : (
              <div className="p-5 rounded-2xl border-2 border-dashed text-sm" style={{ borderColor: "var(--border)", color: "var(--ink-soft)" }}>
                Scanning isn't used for 3D model files — upload your .glb / .gltf below.
              </div>
            )}
            <Link
              to="/dashboard/upload"
              search={linkSearch as any}
              className="p-5 rounded-2xl border-2 transition-all block hover:border-primary"
              style={{ borderColor: "var(--border)", background: "#fff" }}
            >
              <UploadCloud size={22} className="text-primary" />
              <div className="mt-2 font-display text-lg font-bold text-ink">
                {category === "object_3d" ? "Upload .glb / .gltf" : "Upload a photo"}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
                {category === "object_3d"
                  ? "Real 3D model with WebXR + AR Quick Look. Max 50 MB."
                  : "JPG / PNG / WebP — AI cleans it into a studio render. Max 10 MB."}
              </div>
            </Link>
          </div>
        </section>

        <p className="mt-6 text-xs text-center" style={{ color: "var(--ink-soft)" }}>
          Tip: real GLB/USDZ generation from a single photo isn't free yet. For now we use AI photo composition for try-on (which works on any phone) and full WebXR 3D for any real .glb you upload.
        </p>
      </div>
    </DashboardShell>
  );
}
