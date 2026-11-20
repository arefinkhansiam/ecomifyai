import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { MarketingShell } from "@/components/MarketingShell";
import {
  Code2,
  Copy,
  CheckCheck,
  ExternalLink,
  QrCode,
  Download,
  ShoppingBag,
  Sliders,
  TrendingUp,
  ShieldCheck,
  Check,
  Zap,
  X,
  Store,
} from "lucide-react";
import demoAfter from "@/assets/demo-after.jpg";

export const Route = createFileRoute("/for-stores")({
  head: () => ({
    meta: [
      { title: "For Fashion Stores & Retailers — Easibie Virtual Try-On" },
      {
        name: "description",
        content:
          "Integrate Easibie photo try-on into your Shopify, WooCommerce, or headless fashion store. Generate custom embed snippets, direct links, and in-store QR codes.",
      },
    ],
  }),
  component: ForStoresPage,
});

const DEMO_GARMENTS = [
  { id: "blazer-obsidian", name: "Obsidian Tailored Double-Breasted Blazer", price: 185 },
  { id: "linen-shirt", name: "Sage Belgian Relaxed Linen Shirt", price: 95 },
  { id: "silk-slip", name: "Mulberry Silk Charmeuse Evening Slip Dress", price: 175 },
  { id: "denim-jacket", name: "Raw Selvedge 14oz Trucker Jacket", price: 165 },
];

function ForStoresPage() {
  const [selectedGarment, setSelectedGarment] = useState(DEMO_GARMENTS[0]);
  const [embedBtnText, setEmbedBtnText] = useState("Try It On With Easibie");
  const [embedTheme, setEmbedTheme] = useState<"blue" | "navy" | "white">("blue");
  const [btnRadius, setBtnRadius] = useState<"full" | "md" | "sm">("md");
  const [embedPlacement, setEmbedPlacement] = useState<"inline" | "bottom-right">("inline");
  const [embedTab, setEmbedTab] = useState<"html" | "shopify" | "react" | "iframe">("html");

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [showLiveModal, setShowLiveModal] = useState(false);

  // Return Savings Calculator
  const [orders, setOrders] = useState(5000);
  const [aov, setAov] = useState(120);
  const [returnRate, setReturnRate] = useState(25);

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:8080";
  const directPreviewUrl = `${origin}/try-ar?product=${selectedGarment.id}`;

  useEffect(() => {
    QRCode.toDataURL(directPreviewUrl, {
      width: 320,
      margin: 1,
      color: { dark: "#0F172A", light: "#FFFFFF" },
    }).then(setQrData);
  }, [selectedGarment.id, directPreviewUrl]);

  // Calculations
  const returnsSaved = Math.round(orders * 12 * (returnRate / 100) * 0.38);
  const logisticsSaved = Math.round(returnsSaved * 16.5);

  const snippets = {
    html: `<!-- Easibie Universal Fashion Try-On Button -->
<script 
  src="${origin}/widget.js" 
  data-product-id="${selectedGarment.id}"
  data-label="${embedBtnText}"
  data-theme="${embedTheme}"
  async>
</script>
<div id="easibie-tryon-root"></div>`,
    shopify: `{% comment %} Easibie Virtual Try-On for Shopify {% endcomment %}
{% comment %} Paste into sections/main-product.liquid under the Add to Cart form {% endcomment %}
<div class="easibie-store-widget" style="margin-top: 12px;">
  <script 
    src="${origin}/widget.js" 
    data-product-id="{{ product.id }}"
    data-label="${embedBtnText}"
    data-theme="${embedTheme}"
    async>
  </script>
</div>`,
    react: `import { EasibieTryOnButton } from '@easibie/react';

export function ProductDetails({ product }) {
  return (
    <div className="product-actions">
      <EasibieTryOnButton
        productId="${selectedGarment.id}"
        label="${embedBtnText}"
        theme="${embedTheme}"
      />
    </div>
  );
}`,
    iframe: `<iframe 
  src="${directPreviewUrl}" 
  width="100%" 
  height="660" 
  style="border: 1px solid #E2E8F0; border-radius: 12px;" 
  allow="camera; clipboard-write">
</iframe>`,
  };

  const currentCode = snippets[embedTab];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Snippet copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <MarketingShell>
      {/* HERO */}
      <section className="px-4 pt-12 pb-16 blue-cloud-bg border-b border-[#E2E8F0]">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[12px] font-semibold mb-4">
            <Store size={14} className="text-blue-700" />
            <span>Built for Fashion E-Commerce Retailers</span>
          </div>
          <h1 className="text-[36px] sm:text-[50px] font-bold text-[#0F172A] tracking-tight">
            Seamless Virtual Fitting for Your Online Store
          </h1>
          <p className="mt-4 text-[16px] text-[#475569] max-w-2xl mx-auto leading-relaxed">
            Install the Easibie widget on Shopify, WooCommerce, or custom React storefronts in under 60 seconds.
            Eliminate shopper sizing doubt, reduce reverse logistics, and boost conversions.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#store-configurator" className="btn-blue-primary text-[14px]">
              Configure Store Widget
            </a>
            <Link to="/auth" search={{ mode: "signup" }} className="btn-white-secondary text-[14px]">
              Start 14-Day Free Pilot
            </Link>
          </div>
        </div>
      </section>

      {/* CORE INTEGRATION & EMBED STUDIO */}
      <section id="store-configurator" className="px-4 py-20 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-[#0F172A]">Store Embed & Widget Generator</h2>
            <p className="mt-2 text-[15px] text-[#475569]">
              Customize your button styling, test the live shopper dialog, and copy production-ready code.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Controls (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="card-white p-6 space-y-4">
                <div className="text-[14px] font-bold text-[#0F172A] border-b border-slate-100 pb-2">
                  Widget Preferences
                </div>

                {/* SKU Selector */}
                <div>
                  <label className="text-[12px] font-semibold text-[#0F172A] block mb-1">
                    Select Target Garment SKU
                  </label>
                  <select
                    value={selectedGarment.id}
                    onChange={(e) => {
                      const found = DEMO_GARMENTS.find((g) => g.id === e.target.value);
                      if (found) setSelectedGarment(found);
                    }}
                    className="input-base text-[13px]"
                  >
                    {DEMO_GARMENTS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} (${g.price})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Button Text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-semibold text-[#0F172A] block mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={embedBtnText}
                      onChange={(e) => setEmbedBtnText(e.target.value)}
                      className="input-base text-[13px]"
                    />
                  </div>

                  <div>
                    <label className="text-[12px] font-semibold text-[#0F172A] block mb-1">
                      Button Theme
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "blue", label: "Royal Blue" },
                        { id: "navy", label: "Midnight" },
                        { id: "white", label: "White" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setEmbedTheme(t.id as any)}
                          className={`py-1.5 px-2 text-[11px] font-semibold rounded border transition ${
                            embedTheme === t.id
                              ? "bg-blue-50 text-blue-700 border-blue-400"
                              : "bg-white text-slate-700 border-slate-200"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct Preview Link */}
                <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200">
                  <div className="flex items-center justify-between text-[12px] mb-1.5">
                    <span className="font-bold text-[#0F172A]">Direct Shopper Preview URL:</span>
                    <a
                      href={directPreviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                    >
                      Open in New Tab <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={directPreviewUrl}
                      className="flex-1 bg-white text-[12px] font-mono text-[#0F172A] px-3 py-1.5 rounded border border-slate-200 outline-none"
                    />
                    <button
                      onClick={() => handleCopy(directPreviewUrl, "directUrl")}
                      className="btn-white-secondary text-[12px] !py-1.5 !px-3 font-semibold"
                    >
                      {copiedKey === "directUrl" ? <CheckCheck size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {copiedKey === "directUrl" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Code Snippets Card */}
              <div className="card-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-slate-100 pb-2">
                  <span className="text-[13px] font-bold text-[#0F172A]">Code Snippets</span>
                  <div className="flex gap-1 text-[11px]">
                    {[
                      { id: "html", label: "Universal HTML" },
                      { id: "shopify", label: "Shopify Liquid" },
                      { id: "react", label: "React SDK" },
                      { id: "iframe", label: "Iframe" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setEmbedTab(tab.id as any)}
                        className={`px-2.5 py-1 rounded font-semibold transition ${
                          embedTab === tab.id
                            ? "bg-slate-900 text-white"
                            : "text-[#64748B] hover:text-[#0F172A]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <pre className="p-4 rounded-lg bg-slate-900 text-slate-200 font-mono text-[12px] overflow-x-auto leading-relaxed border border-slate-800">
                    <code>{currentCode}</code>
                  </pre>
                  <button
                    onClick={() => handleCopy(currentCode, "snippet")}
                    className="absolute top-2.5 right-2.5 py-1 px-2.5 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1 transition"
                  >
                    {copiedKey === "snippet" ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copiedKey === "snippet" ? "Copied!" : "Copy Code"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Mockup & QR (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Product Mockup */}
              <div className="card-white p-6">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[#64748B]">
                    Storefront Preview
                  </span>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    Click Button to Test
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="aspect-[4/3] rounded overflow-hidden bg-slate-900 mb-3 relative">
                    <img
                      src={demoAfter}
                      alt="Product"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <div className="text-[14px] font-bold text-[#0F172A] truncate">
                    {selectedGarment.name}
                  </div>
                  <div className="text-[13px] font-bold text-blue-700 mt-0.5">${selectedGarment.price}</div>

                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                    <button className="w-full py-2 rounded bg-slate-900 text-white text-[12.5px] font-semibold hover:bg-black transition">
                      Add to Cart
                    </button>

                    <button
                      onClick={() => setShowLiveModal(true)}
                      className={`w-full py-2 px-3 text-[12.5px] font-semibold transition flex items-center justify-center gap-1.5 rounded shadow-sm ${
                        embedTheme === "blue"
                          ? "bg-[#1E40AF] hover:bg-[#1D4ED8] text-white"
                          : embedTheme === "navy"
                          ? "bg-slate-900 hover:bg-black text-white"
                          : "bg-white text-[#0F172A] border border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {embedBtnText}
                    </button>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="card-white p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-bold text-[#0F172A] flex items-center gap-1.5">
                    <QrCode size={16} className="text-blue-600" /> In-Store Retail QR Tag
                  </span>
                  <span className="text-[11px] text-[#64748B]">Scan to Fit</span>
                </div>
                <p className="text-[12px] text-[#64748B]">
                  Print on clothing tags so in-store shoppers can preview sizes from their phone.
                </p>

                <div className="mt-4 flex flex-col items-center">
                  {qrData ? (
                    <>
                      <img
                        src={qrData}
                        alt="QR Code"
                        className="w-36 h-36 rounded border border-slate-200 p-1 bg-white shadow-xs"
                      />
                      <a
                        href={qrData}
                        download={`easibie-tag-${selectedGarment.id}.png`}
                        className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded transition"
                      >
                        <Download size={13} /> Download Tag PNG
                      </a>
                    </>
                  ) : (
                    <div className="w-36 h-36 rounded bg-slate-100 animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {showLiveModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowLiveModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded"
            >
              <X size={18} />
            </button>
            <div className="text-[16px] font-bold text-[#0F172A] mb-1">
              Shopper Fitting Dialog
            </div>
            <p className="text-[12px] text-[#64748B] mb-4">
              Live preview triggered by your merchant store embed snippet.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="aspect-[3/4] rounded bg-slate-900 overflow-hidden relative">
                <img
                  src={demoAfter}
                  alt="Draped"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-[14px] font-bold text-[#0F172A]">{selectedGarment.name}</div>
                  <div className="text-[12px] text-[#64748B] mt-0.5">${selectedGarment.price} • Recommended Size: M</div>
                </div>

                <div className="p-2.5 bg-blue-50 rounded border border-blue-200 text-[11.5px] text-blue-900">
                  <strong>Fit Fidelity: 99.1%</strong>
                  <br />
                  Proper proportions at bust, waist, and hemline.
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      toast.success("Added to cart!");
                      setShowLiveModal(false);
                    }}
                    className="w-full btn-blue-primary !py-2 !text-[12.5px]"
                  >
                    Add to Cart (${selectedGarment.price})
                  </button>
                  <button
                    onClick={() => setShowLiveModal(false)}
                    className="w-full py-1.5 rounded border border-slate-300 text-[12px] text-[#64748B] hover:bg-slate-50"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MarketingShell>
  );
}
