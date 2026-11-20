import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import {
  Copy,
  Download,
  QrCode,
  Code2,
  Sparkles,
  Sliders,
  CheckCheck,
  Eye,
  ExternalLink,
  ShoppingBag,
  X,
  Layers,
} from "lucide-react";
import demoAfter from "@/assets/demo-after.jpg";

export const Route = createFileRoute("/_authenticated/dashboard/embed")({
  validateSearch: (s: Record<string, unknown>) => ({
    product: typeof s.product === "string" ? s.product : undefined,
  }),
  component: EmbedPage,
});

const DEMO_GARMENTS = [
  { id: "eb_blz_01", name: "Obsidian Tailored Double-Breasted Blazer", price: 185 },
  { id: "eb_lin_04", name: "Sage Belgian Relaxed Linen Shirt", price: 95 },
  { id: "eb_drs_08", name: "Mulberry Silk Charmeuse Evening Slip Dress", price: 175 },
  { id: "eb_dnm_02", name: "Raw Selvedge 14oz Trucker Jacket", price: 165 },
];

function EmbedPage() {
  const { user } = useAuth();
  const search = Route.useSearch();
  const [products, setProducts] = useState<{ id: string; product_name: string }[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("eb_blz_01");
  const [selectedGarmentName, setSelectedGarmentName] = useState<string>("Obsidian Tailored Blazer");

  // Widget Customizer Controls
  const [btnText, setBtnText] = useState("Try It On With Easibie AI ✦");
  const [btnTheme, setBtnTheme] = useState<"blue" | "navy" | "white">("blue");
  const [btnPlacement, setBtnPlacement] = useState<"inline" | "bottom-right">("inline");
  const [btnRadius, setBtnRadius] = useState<"full" | "lg" | "md">("full");
  const [activeSnippetTab, setActiveSnippetTab] = useState<"universal" | "shopify" | "react" | "iframe">("universal");

  // QR Code
  const [qrData, setQrData] = useState<string | null>(null);

  // Live Modal Preview Trigger
  const [showLiveTryOnModal, setShowLiveTryOnModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://easibie.com";

  useEffect(() => {
    if (!user) return;
    supabase
      .from("ar_products")
      .select("id, product_name")
      .eq("user_id", user.id)
      .eq("status", "ready")
      .then(({ data }) => {
        const rows = data ?? [];
        if (rows.length > 0) {
          setProducts(rows);
          const requested = search.product && rows.some((p) => p.id === search.product) ? search.product : rows[0]?.id;
          if (requested) {
            setSelectedProductId(requested);
            const found = rows.find((p) => p.id === requested);
            if (found) setSelectedGarmentName(found.product_name);
          }
        } else {
          // Default demo products
          setProducts(DEMO_GARMENTS.map((g) => ({ id: g.id, product_name: g.name })));
        }
      });
  }, [user, search.product]);

  useEffect(() => {
    if (!selectedProductId) return;
    const directUrl = `${origin}/try-ar?product=${selectedProductId}`;
    QRCode.toDataURL(directUrl, {
      width: 400,
      margin: 2,
      color: { dark: "#0B192C", light: "#FFFFFF" },
    }).then(setQrData);
  }, [selectedProductId, origin]);

  const directUrl = `${origin}/try-ar?product=${selectedProductId}`;

  // Snippets
  const universalSnippet = `<!-- Easibie Photo Try-On Widget -->
<script 
  src="${origin}/widget.js" 
  data-product-id="${selectedProductId}"
  data-label="${btnText}"
  data-theme="${btnTheme}"
  data-placement="${btnPlacement}"
  data-radius="${btnRadius}"
  async>
</script>
<div id="easibie-tryon-container"></div>`;

  const shopifyLiquidSnippet = `{% comment %} Easibie Virtual Photo Try-On — Shopify {% endcomment %}
{% comment %} Paste into sections/main-product.liquid under the Add to Cart button {% endcomment %}
<div class="easibie-store-widget" style="margin-top: 14px;">
  <script 
    src="${origin}/widget.js" 
    data-product-id="{{ product.id }}"
    data-label="${btnText}"
    data-theme="${btnTheme}"
    data-radius="${btnRadius}"
    async>
  </script>
</div>`;

  const reactComponentSnippet = `import { EasibieTryOnButton } from '@easibie/react';

export function ProductPage({ product }) {
  return (
    <div>
      {/* Product info... */}
      <EasibieTryOnButton
        productId="${selectedProductId}"
        label="${btnText}"
        theme="${btnTheme}"
        placement="${btnPlacement}"
        onFitCalculated={(fit) => console.log('Shopper fit confidence:', fit)}
      />
    </div>
  );
}`;

  const iframeSnippet = `<iframe 
  src="${directUrl}" 
  width="100%" 
  height="680" 
  style="border: 1px solid #E2E8F0; border-radius: 20px; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);" 
  allow="camera; clipboard-write">
</iframe>`;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Snippet copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const currentSnippet =
    activeSnippetTab === "universal"
      ? universalSnippet
      : activeSnippetTab === "shopify"
      ? shopifyLiquidSnippet
      : activeSnippetTab === "react"
      ? reactComponentSnippet
      : iframeSnippet;

  return (
    <DashboardShell title="Store Embed Code & Universal Widget">
      {/* Top Description */}
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[#0B192C] tracking-tight">
          Store Widget & Embed Generator
        </h1>
        <p className="text-[13px] text-[#64748B] mt-1">
          Customize your try-on button styling, copy your drop-in code snippet, and test the real-time popup modal before going live.
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Widget Customizer & Code Snippet Box (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customizer Card */}
          <div className="card-white p-6 md:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[13px] font-bold text-[#0B192C] flex items-center gap-2">
                <Sliders size={16} className="text-blue-600" /> Widget Customizer
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Synchronized
              </span>
            </div>

            {/* Product Selector */}
            <div>
              <label className="text-[12px] font-bold text-[#0B192C] block mb-1">
                Target Garment SKU
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const p = products.find((x) => x.id === e.target.value);
                  if (p) setSelectedGarmentName(p.product_name);
                }}
                className="input-base text-[13px] !rounded-xl"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.product_name} ({p.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Button Text Label */}
            <div>
              <label className="text-[12px] font-bold text-[#0B192C] block mb-1">
                Button Text Label
              </label>
              <input
                type="text"
                value={btnText}
                onChange={(e) => setBtnText(e.target.value)}
                className="input-base text-[13px] !rounded-xl"
                placeholder="Try It On With Easibie AI ✦"
              />
            </div>

            {/* Theme Selector */}
            <div>
              <label className="text-[12px] font-bold text-[#0B192C] block mb-1">
                Button Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "blue", label: "Royal Blue", bg: "bg-gradient-to-r from-blue-700 to-blue-600 text-white" },
                  { id: "navy", label: "Midnight Navy", bg: "bg-slate-900 text-white" },
                  { id: "white", label: "Clean White", bg: "bg-white text-slate-900 border border-slate-300" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setBtnTheme(t.id as any)}
                    className={`py-2 px-3 rounded-xl text-[12px] font-bold border transition ${t.bg} ${
                      btnTheme === t.id ? "ring-2 ring-blue-600 ring-offset-1" : "opacity-75 hover:opacity-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Button Border Radius & Placement */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-bold text-[#0B192C] block mb-1">
                  Border Radius
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "full", label: "Pill" },
                    { id: "lg", label: "Rounded" },
                    { id: "md", label: "Subtle" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setBtnRadius(r.id as any)}
                      className={`py-1.5 text-[11px] font-bold rounded-lg border transition ${
                        btnRadius === r.id
                          ? "bg-blue-50 text-blue-700 border-blue-400"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#0B192C] block mb-1">
                  Placement
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setBtnPlacement("inline")}
                    className={`py-1.5 text-[11px] font-bold rounded-lg border transition ${
                      btnPlacement === "inline"
                        ? "bg-blue-50 text-blue-700 border-blue-400"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    Inline Button
                  </button>
                  <button
                    onClick={() => setBtnPlacement("bottom-right")}
                    className={`py-1.5 text-[11px] font-bold rounded-lg border transition ${
                      btnPlacement === "bottom-right"
                        ? "bg-blue-50 text-blue-700 border-blue-400"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    Floating Pill
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Snippet Tabs Card */}
          <div className="card-white p-6 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="text-[13px] font-bold text-[#0B192C]">
                Copy Embed Snippet
              </span>
              <div className="flex p-0.5 bg-slate-100 rounded-lg text-[11px] font-bold">
                {[
                  { id: "universal", label: "Universal HTML" },
                  { id: "shopify", label: "Shopify Liquid" },
                  { id: "react", label: "React / Next.js" },
                  { id: "iframe", label: "Iframe" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveSnippetTab(t.id as any)}
                    className={`px-3 py-1.5 rounded-md transition ${
                      activeSnippetTab === t.id
                        ? "bg-white text-blue-700 shadow-xs"
                        : "text-[#64748B] hover:text-[#0B192C]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Box */}
            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[12px] overflow-x-auto border border-slate-800 leading-relaxed">
                <code>{currentSnippet}</code>
              </pre>
              <button
                onClick={() => copy(currentSnippet, "snippet")}
                className="absolute top-3 right-3 py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md transition"
              >
                {copiedKey === "snippet" ? <CheckCheck size={13} className="text-emerald-400" /> : <Copy size={13} />}
                {copiedKey === "snippet" ? "Copied!" : "Copy Code"}
              </button>
            </div>

            <div className="mt-4 p-3.5 rounded-lg bg-blue-50/70 border border-blue-200/80 space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-bold text-[#0B192C]">Direct Shopper Preview URL:</span>
                <a
                  href={directUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                >
                  Open in New Tab <ExternalLink size={12} />
                </a>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={directUrl}
                  className="flex-1 bg-white text-[12px] font-mono text-[#0B192C] px-3 py-1.5 rounded border border-slate-200 outline-none"
                />
                <button
                  onClick={() => copy(directUrl, "directUrl")}
                  className="btn-white-secondary text-[12px] !py-1.5 !px-3 font-semibold"
                >
                  {copiedKey === "directUrl" ? <CheckCheck size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copiedKey === "directUrl" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Product Preview & In-Store QR Code (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Interactive Product Card Mockup */}
          <div className="card-white p-6 md:p-7">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#64748B]">
                Interactive Product Page Preview
              </span>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Click to Test!
              </span>
            </div>

            <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 mb-4 relative">
                <img
                  src={demoAfter}
                  alt="Product"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute top-3 left-3 bg-[#0B192C]/80 text-white text-[10px] font-bold px-2.5 py-0.5 rounded">
                  NEW SEASON
                </div>
              </div>

              <div className="text-[16px] font-extrabold text-[#0B192C]">
                {selectedGarmentName}
              </div>
              <div className="flex items-center justify-between mt-1 text-[13px]">
                <span className="text-[18px] font-extrabold text-blue-700">$185</span>
                <span className="text-[#64748B]">In Stock (Sizes S, M, L)</span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 space-y-2.5">
                <button className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-bold hover:bg-black transition">
                  Add to Store Cart
                </button>

                {/* THE LIVE TESTABLE EMBED BUTTON */}
                <button
                  onClick={() => setShowLiveTryOnModal(true)}
                  className={`w-full py-2.5 px-4 text-[13px] font-bold transition flex items-center justify-center gap-2 shadow-sm hover:shadow ${
                    btnRadius === "full" ? "rounded-full" : btnRadius === "lg" ? "rounded-xl" : "rounded-lg"
                  } ${
                    btnTheme === "blue"
                      ? "bg-gradient-to-r from-[#1E40AF] to-[#2563EB] text-white"
                      : btnTheme === "navy"
                      ? "bg-[#0B192C] text-white"
                      : "bg-white text-[#0B192C] border border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Sparkles size={14} className={btnTheme === "white" ? "text-blue-600" : "text-sky-300"} />
                  {btnText}
                </button>
              </div>
            </div>

            <p className="mt-3 text-center text-[11.5px] text-[#64748B]">
              ↑ Test click this button to preview the full shopper modal experience!
            </p>
          </div>

          {/* In-Store Retail QR Code Card */}
          <div className="card-white p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-[#0B192C] flex items-center gap-2">
                <QrCode size={18} className="text-blue-600" /> In-Store Retail Tag QR Code
              </h3>
              <span className="text-[11px] font-semibold text-[#64748B]">High-Res</span>
            </div>
            <p className="text-[12px] text-[#64748B]">
              Print this QR code on garment hangtags or fitting room mirrors. Shoppers scan with their phone camera to instantly try on with their photo.
            </p>

            <div className="mt-4 flex flex-col items-center">
              {qrData ? (
                <>
                  <img
                    src={qrData}
                    alt="Try-On QR"
                    className="w-44 h-44 rounded-xl border border-slate-200 p-2 bg-white shadow-xs"
                  />
                  <a
                    href={qrData}
                    download={`easibie-tryon-${selectedProductId}.png`}
                    className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-1.5 rounded-lg transition"
                  >
                    <Download size={13} /> Download Print-Ready PNG
                  </a>
                </>
              ) : (
                <div className="w-44 h-44 rounded-xl bg-slate-100 animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LIVE WORKING MODAL (Triggered when merchant clicks test button) */}
      {showLiveTryOnModal && (
        <div className="fixed inset-0 z-50 bg-[#0B192C]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowLiveTryOnModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white grid place-items-center">
                <Sparkles size={16} />
              </div>
              <h3 className="text-[18px] font-extrabold text-[#0B192C]">
                Easibie Shopper Try-On Modal
              </h3>
            </div>
            <p className="text-[13px] text-[#64748B]">
              This is the live interactive popup that renders on your merchant store when customers click your embed button.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 relative">
                <img
                  src={demoAfter}
                  alt="Draped"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute bottom-3 left-3 bg-[#0B192C]/80 text-white text-[11px] font-bold px-2.5 py-1 rounded">
                  ✦ {selectedGarmentName}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-[11px] font-bold uppercase text-blue-700">Photoreal Drape Verified</div>
                  <div className="text-[16px] font-bold text-[#0B192C] mt-0.5">{selectedGarmentName}</div>
                  <div className="text-[13px] text-[#64748B] mt-1">$185 • Size M (Recommended)</div>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[12px] text-blue-900">
                  <strong>Fitting Confidence: 98.8%</strong>
                  <br />
                  True-to-size drape across shoulders, torso, and waist.
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      toast.success("Added to store checkout cart!");
                      setShowLiveTryOnModal(false);
                    }}
                    className="w-full btn-blue-primary !py-3 !rounded-xl !text-[13px] font-bold"
                  >
                    Add to Cart ($185)
                  </button>
                  <button
                    onClick={() => setShowLiveTryOnModal(false)}
                    className="w-full py-2.5 rounded-xl border border-slate-300 text-[12.5px] font-semibold text-[#64748B] hover:bg-slate-50"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
