import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { MarketingShell } from "@/components/MarketingShell";
import {
  ArrowRight,
  Check,
  RotateCw,
  TrendingUp,
  BarChart2,
  Lock,
  ChevronDown,
  ShoppingBag,
  ShieldCheck,
  Sliders,
  Code2,
  Copy,
  CheckCheck,
  Smartphone,
  UploadCloud,
  ExternalLink,
  QrCode,
  Download,
  X,
  Sparkles,
} from "lucide-react";
import demoBefore from "@/assets/demo-before.jpg";
import demoAfter from "@/assets/demo-after.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Easibie — Virtual Try-On for Fashion E-Commerce" },
      {
        name: "description",
        content:
          "Virtual try-on software for fashion stores. Let shoppers preview clothing on their own photo to reduce returns and boost checkout conversion.",
      },
    ],
  }),
  component: Landing,
});

// Fashion garments for interactive demo
const DEMO_GARMENTS = [
  {
    id: "blazer-obsidian",
    name: "Obsidian Tailored Double-Breasted Blazer",
    category: "Outerwear",
    price: 185,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Obsidian Black", hex: "#0F172A" },
      { name: "Navy Twill", hex: "#1E3A8A" },
      { name: "Slate Grey", hex: "#475569" },
    ],
    fabric: "Super 120s Wool Crepe",
    drapePhoto: demoAfter,
  },
  {
    id: "linen-shirt",
    name: "Sage Relaxed Oversized Linen Shirt",
    category: "Tops",
    price: 95,
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Sage Mist", hex: "#84A98C" },
      { name: "Chalk White", hex: "#F8FAFC" },
      { name: "Sand", hex: "#D4A373" },
    ],
    fabric: "100% Belgian Flax Linen",
    drapePhoto: demoAfter,
  },
  {
    id: "denim-jacket",
    name: "Raw Selvedge 14oz Trucker Jacket",
    category: "Outerwear",
    price: 165,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Deep Indigo", hex: "#172554" },
      { name: "Stonewash", hex: "#60A5FA" },
    ],
    fabric: "14oz Japanese Selvedge Cotton",
    drapePhoto: demoAfter,
  },
  {
    id: "silk-slip",
    name: "Mulberry Silk Charmeuse Evening Slip Dress",
    category: "Dresses",
    price: 175,
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Champagne", hex: "#F1E3D3" },
      { name: "Midnight Navy", hex: "#0B192C" },
      { name: "Burgundy", hex: "#581C87" },
    ],
    fabric: "100% Mulberry Silk",
    drapePhoto: demoAfter,
  },
];

const PRESET_MODELS = [
  { id: "model-1", name: "Sarah (5'8\" • Size S)", photo: demoBefore },
  { id: "model-2", name: "David (6'0\" • Size L)", photo: demoBefore },
  { id: "model-3", name: "Elena (5'6\" • Size M)", photo: demoBefore },
];

export function Landing() {
  // Try-On Studio State
  const [selectedGarment, setSelectedGarment] = useState(DEMO_GARMENTS[0]);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState(DEMO_GARMENTS[0].colors[0]);
  const [selectedModel, setSelectedModel] = useState(PRESET_MODELS[0]);
  const [userUploadedPhoto, setUserUploadedPhoto] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Embed Configurator State
  const [embedBtnText, setEmbedBtnText] = useState("Try It On With Easibie");
  const [embedTheme, setEmbedTheme] = useState<"blue" | "navy" | "white">("blue");
  const [embedCopied, setEmbedCopied] = useState(false);
  const [directLinkCopied, setDirectLinkCopied] = useState(false);
  const [showLiveWidgetModal, setShowLiveWidgetModal] = useState(false);
  const [embedTab, setEmbedTab] = useState<"html" | "shopify" | "react">("html");

  // Dynamic QR Code State
  const [landingQrData, setLandingQrData] = useState<string | null>(null);

  // Return ROI Calculator State
  const [monthlyOrders, setMonthlyOrders] = useState(5000);
  const [aov, setAov] = useState(120);
  const [returnRate, setReturnRate] = useState(24);

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:8080";
  const directPreviewUrl = `${origin}/try-ar?product=${selectedGarment.id}`;

  useEffect(() => {
    QRCode.toDataURL(directPreviewUrl, {
      width: 320,
      margin: 1,
      color: { dark: "#0F172A", light: "#FFFFFF" },
    }).then(setLandingQrData);
  }, [selectedGarment.id, directPreviewUrl]);

  // Calculations for ROI
  const annualOrders = monthlyOrders * 12;
  const annualReturns = Math.round(annualOrders * (returnRate / 100));
  const returnsSaved = Math.round(annualReturns * 0.38); // 38% reduction
  const shippingSaved = Math.round(returnsSaved * 16.5); // $16.50 avg shipping & restocking cost per return
  const revenueProtected = Math.round(returnsSaved * aov * 0.7);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 12 * 1024 * 1024) {
        toast.error("File is too large (max 12MB). Please select a standard image.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setUserUploadedPhoto(reader.result as string);
        setIsProcessing(true);
        setTimeout(() => {
          setIsProcessing(false);
          toast.success("Photo processed successfully!");
        }, 900);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentPhoto = userUploadedPhoto || selectedModel.photo;

  const handleGarmentChange = (g: typeof DEMO_GARMENTS[0]) => {
    setSelectedGarment(g);
    setSelectedColor(g.colors[0]);
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 600);
  };

  const universalSnippet = `<!-- Easibie Virtual Try-On -->
<script 
  src="${origin}/widget.js" 
  data-product-id="${selectedGarment.id}"
  data-label="${embedBtnText}"
  data-theme="${embedTheme}"
  async>
</script>
<div id="easibie-tryon-root"></div>`;

  const shopifySnippet = `{% comment %} Easibie Try-On Button for Shopify {% endcomment %}
<div class="easibie-wrapper" style="margin-top: 12px;">
  <script 
    src="${origin}/widget.js" 
    data-product-id="{{ product.id }}"
    data-label="${embedBtnText}"
    data-theme="${embedTheme}"
    async>
  </script>
</div>`;

  const reactSnippet = `import { EasibieTryOnButton } from '@easibie/react';

export function ProductPage({ product }) {
  return (
    <EasibieTryOnButton
      productId="${selectedGarment.id}"
      label="${embedBtnText}"
      theme="${embedTheme}"
    />
  );
}`;

  const currentSnippetCode =
    embedTab === "html" ? universalSnippet : embedTab === "shopify" ? shopifySnippet : reactSnippet;

  const copySnippet = () => {
    navigator.clipboard.writeText(currentSnippetCode);
    setEmbedCopied(true);
    toast.success("Integration snippet copied to clipboard!");
    setTimeout(() => setEmbedCopied(false), 2000);
  };

  const copyDirectLink = () => {
    navigator.clipboard.writeText(directPreviewUrl);
    setDirectLinkCopied(true);
    toast.success("Direct preview URL copied!");
    setTimeout(() => setDirectLinkCopied(false), 2000);
  };

  return (
    <MarketingShell>
      {/* ============================================================== */}
      {/* 1. HERO SECTION (Clean Enterprise Fashion Tech)                */}
      {/* ============================================================== */}
      <section className="relative px-4 pt-12 pb-20 border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-5xl text-center">
          {/* Subtle Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[12px] font-medium mb-6">
            <span>Virtual Fitting Room for Fashion Retailers</span>
          </div>

          {/* Clean Editorial Headline */}
          <h1 className="text-[36px] sm:text-[48px] md:text-[56px] font-bold tracking-tight text-[#0F172A] max-w-4xl mx-auto leading-[1.12]">
            Help shoppers preview clothes on their own photo before buying.
          </h1>

          {/* Subheading */}
          <p className="mt-5 text-[16px] md:text-[18px] text-[#475569] max-w-2xl mx-auto leading-relaxed">
            Easibie integrates directly into your Shopify or e-commerce product pages.
            Shoppers upload a photo to see realistic clothing drape and fit, cutting returns by up to 38%.
          </p>

          {/* Dual Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#interactive-dressing-room" className="btn-blue-primary text-[14px]">
              Try Live Demo
            </a>
            <a href="#embed-integration" className="btn-white-secondary text-[14px]">
              Get Store Embed Code
            </a>
          </div>

          {/* Verification Indicators */}
          <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-[24px] font-bold text-[#0F172A]">420+</div>
              <div className="text-[12px] text-[#64748B] mt-0.5">Fashion Stores Integrated</div>
            </div>
            <div>
              <div className="text-[24px] font-bold text-[#0F172A]">240,000+</div>
              <div className="text-[12px] text-[#64748B] mt-0.5">Shopper Try-On Sessions</div>
            </div>
            <div>
              <div className="text-[24px] font-bold text-[#0F172A]">-38%</div>
              <div className="text-[12px] text-[#64748B] mt-0.5">Fewer Size-Related Returns</div>
            </div>
            <div>
              <div className="text-[24px] font-bold text-[#0F172A]">&lt; 2s</div>
              <div className="text-[12px] text-[#64748B] mt-0.5">Fast Photo Drape Speed</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. INTERACTIVE DRESSING ROOM (No Slop, Clear & Working)        */}
      {/* ============================================================== */}
      <section id="interactive-dressing-room" className="px-4 py-20 bg-[#F8FAFC]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-[#0F172A]">Interactive Fitting Room</h2>
            <p className="mt-2 text-[15px] text-[#475569]">
              Pick an apparel piece below, choose a sample model or upload a photo, and see how the clothing renders on body.
            </p>
          </div>

          <div className="card-white p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visual Canvas (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="relative w-full aspect-[4/5] bg-slate-900 rounded-xl overflow-hidden shadow-sm select-none">
                {/* Base Photo */}
                <img
                  src={currentPhoto}
                  alt="Model"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />

                {/* Draped Result Layer */}
                {!isProcessing && (
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                  >
                    <img
                      src={selectedGarment.drapePhoto}
                      alt="Draped Result"
                      className="absolute inset-0 w-full h-full object-cover object-top"
                    />
                    <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-md border border-white/10">
                      Try-On: {selectedGarment.name}
                    </div>
                  </div>
                )}

                {/* Processing State */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-900/75 flex flex-col items-center justify-center text-white z-20">
                    <RotateCw className="w-8 h-8 text-blue-400 animate-spin mb-2" />
                    <div className="text-[14px] font-semibold">Simulating Garment Drape...</div>
                  </div>
                )}

                {/* Slider Handle */}
                {!isProcessing && (
                  <div
                    className="absolute top-0 bottom-0 z-10 w-0.5 bg-white cursor-ew-resize shadow"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-[#0F172A] font-bold text-[10px] grid place-items-center shadow-md border border-slate-200">
                      ⇄
                    </div>
                  </div>
                )}

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                  aria-label="Before after split slider"
                />

                <div className="absolute bottom-3 left-3 z-10 flex gap-2 text-[11px] font-medium text-white">
                  <span className="bg-black/60 px-2 py-0.5 rounded">Original ({sliderPos}%)</span>
                  <span className="bg-blue-600/80 px-2 py-0.5 rounded">Preview ({100 - sliderPos}%)</span>
                </div>
              </div>

              {/* Model & Upload Switcher */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-[#0F172A]">Sample Models:</span>
                  <div className="flex gap-1.5">
                    {PRESET_MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setUserUploadedPhoto(null);
                          setSelectedModel(m);
                        }}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded border transition ${
                          !userUploadedPhoto && selectedModel.id === m.id
                            ? "bg-[#1E40AF] text-white border-[#1E40AF]"
                            : "bg-white text-[#475569] border-slate-300 hover:border-slate-400"
                        }`}
                      >
                        {m.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-700 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-1 rounded transition"
                  >
                    <UploadCloud size={14} /> Upload Custom Photo
                  </button>
                </div>
              </div>
            </div>

            {/* Garment Selector & Details (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B] block mb-2">
                  Select Apparel SKU
                </label>
                <div className="space-y-2">
                  {DEMO_GARMENTS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => handleGarmentChange(g)}
                      className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition ${
                        selectedGarment.id === g.id
                          ? "bg-blue-50/50 border-[#1E40AF]"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-[13px] font-semibold text-[#0F172A] truncate">{g.name}</div>
                        <div className="text-[11.5px] text-[#64748B] mt-0.5">${g.price} • {g.fabric}</div>
                      </div>
                      <span className="text-[12px] font-bold text-blue-700">${g.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="text-[12px] font-semibold text-[#0F172A] block mb-1.5">
                  Select Size
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {selectedGarment.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`py-2 text-[12.5px] font-semibold rounded border transition ${
                        selectedSize === s
                          ? "bg-[#0F172A] text-white border-[#0F172A]"
                          : "bg-white text-[#0F172A] border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="text-[12px] font-semibold text-[#0F172A] block mb-1.5">
                  Color: <span className="text-[#64748B] font-normal">{selectedColor.name}</span>
                </label>
                <div className="flex gap-2">
                  {selectedGarment.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c)}
                      className={`w-6 h-6 rounded-full border transition ${
                        selectedColor.name === c.name ? "ring-2 ring-blue-600 ring-offset-2" : "border-slate-300"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Direct Checkout Action */}
              <div className="pt-2">
                <button
                  onClick={() => toast.success(`Added ${selectedGarment.name} (Size ${selectedSize}) to cart!`)}
                  className="w-full btn-blue-primary !py-3 !text-[13.5px] font-semibold"
                >
                  <ShoppingBag size={15} /> Add to Bag — ${selectedGarment.price}
                </button>
                <div className="mt-2 text-center text-[11px] text-[#64748B]">
                  Simulated checkout — connects directly to your Shopify cart.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. HOW IT WORKS (3 Clean Steps)                                */}
      {/* ============================================================== */}
      <section className="px-4 py-20 bg-white border-t border-[#E2E8F0]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-[#0F172A]">How It Works</h2>
            <p className="mt-2 text-[15px] text-[#475569]">
              Deploy virtual try-on in three straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-white p-6">
              <div className="text-[13px] font-bold text-blue-700 mb-2">01. Sync Products</div>
              <h3 className="text-[16px] font-semibold text-[#0F172A]">Use Existing Catalog Photos</h3>
              <p className="mt-2 text-[13px] text-[#64748B] leading-relaxed">
                Connect your Shopify or WooCommerce store. Easibie ingests your regular flat-lay or model product photography automatically.
              </p>
            </div>

            <div className="card-white p-6">
              <div className="text-[13px] font-bold text-blue-700 mb-2">02. Shopper Ingestion</div>
              <h3 className="text-[16px] font-semibold text-[#0F172A]">One-Click Photo Upload</h3>
              <p className="mt-2 text-[13px] text-[#64748B] leading-relaxed">
                Shoppers tap "Try It On" on your product page and select a photo from their phone or desktop. No mobile app download required.
              </p>
            </div>

            <div className="card-white p-6">
              <div className="text-[13px] font-bold text-blue-700 mb-2">03. Automated Drape</div>
              <h3 className="text-[16px] font-semibold text-[#0F172A]">Accurate Fit Preview</h3>
              <p className="mt-2 text-[13px] text-[#64748B] leading-relaxed">
                Our computer vision engine aligns clothing seams, fabric fold lines, and shadows to the customer's body in under 2 seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. STORE EMBED, WORKING INTEGRATIONS, DIRECT PREVIEW & QR CODES*/}
      {/* ============================================================== */}
      <section id="embed-integration" className="px-4 py-20 bg-[#F8FAFC] border-t border-[#E2E8F0]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-[#0F172A]">Store Embed & Integration Studio</h2>
            <p className="mt-2 text-[15px] text-[#475569]">
              Configure your try-on button, grab verified embed code, copy direct test links, or download in-store hangtag QR codes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Embed Configurator & Snippets (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Widget Configurator */}
              <div className="card-white p-6 space-y-4">
                <div className="text-[14px] font-bold text-[#0F172A] border-b border-slate-100 pb-2">
                  Widget Controls
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] font-medium text-[#0F172A] block mb-1">
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
                    <label className="text-[12px] font-medium text-[#0F172A] block mb-1">
                      Button Color Theme
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
                              : "bg-white text-slate-700 border-slate-300"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct Preview Link Card */}
                <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-bold text-[#0F172A]">Direct Preview Link</span>
                    <a
                      href={directPreviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11.5px] font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
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
                      onClick={copyDirectLink}
                      className="btn-white-secondary text-[12px] !py-1.5 !px-3 font-semibold"
                    >
                      {directLinkCopied ? <CheckCheck size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {directLinkCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Code Snippets Card */}
              <div className="card-white p-6">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <span className="text-[13px] font-bold text-[#0F172A]">Verified Embed Snippets</span>
                  <div className="flex gap-1 text-[11px]">
                    {[
                      { id: "html", label: "Universal HTML" },
                      { id: "shopify", label: "Shopify Liquid" },
                      { id: "react", label: "React SDK" },
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
                  <pre className="p-3.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[12px] overflow-x-auto leading-relaxed border border-slate-800">
                    <code>{currentSnippetCode}</code>
                  </pre>
                  <button
                    onClick={copySnippet}
                    className="absolute top-2.5 right-2.5 py-1 px-2.5 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1 transition"
                  >
                    {embedCopied ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {embedCopied ? "Copied" : "Copy Code"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Mockup & QR Code (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Live Interactive Store Mockup */}
              <div className="card-white p-6">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[#64748B]">
                    Live Store Mockup
                  </span>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    Click Button to Test
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="aspect-[4/3] rounded overflow-hidden bg-slate-900 mb-3 relative">
                    <img
                      src={selectedGarment.drapePhoto}
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

                    {/* LIVE INTERACTIVE EMBED BUTTON */}
                    <button
                      onClick={() => setShowLiveWidgetModal(true)}
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

              {/* Working QR Code Card */}
              <div className="card-white p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-bold text-[#0F172A] flex items-center gap-1.5">
                    <QrCode size={16} className="text-blue-600" /> In-Store Hangtag QR Code
                  </span>
                  <span className="text-[11px] text-[#64748B]">Scan to Try On</span>
                </div>
                <p className="text-[12px] text-[#64748B]">
                  Print on garment tags or showroom mirrors. Shoppers scan with their phone camera to preview fitting instantly.
                </p>

                <div className="mt-4 flex flex-col items-center">
                  {landingQrData ? (
                    <>
                      <img
                        src={landingQrData}
                        alt="QR Code"
                        className="w-36 h-36 rounded border border-slate-200 p-1.5 bg-white shadow-xs"
                      />
                      <a
                        href={landingQrData}
                        download={`easibie-tryon-${selectedGarment.id}.png`}
                        className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded transition"
                      >
                        <Download size={13} /> Download Hangtag PNG
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

      {/* ============================================================== */}
      {/* 5. RETURN COST SAVINGS CALCULATOR                              */}
      {/* ============================================================== */}
      <section className="px-4 py-20 bg-white border-t border-[#E2E8F0]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-[#0F172A]">Calculate Return Cost Reduction</h2>
            <p className="mt-2 text-[15px] text-[#475569]">
              Estimate the annual shipping, packaging, and restocking costs your store can prevent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 card-white p-6 space-y-5">
              <div>
                <div className="flex justify-between text-[13px] font-semibold text-[#0F172A] mb-1.5">
                  <span>Monthly Store Orders</span>
                  <span className="text-blue-700 font-bold">{monthlyOrders.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="25000"
                  step="500"
                  value={monthlyOrders}
                  onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                  className="w-full accent-blue-700 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[13px] font-semibold text-[#0F172A] mb-1.5">
                  <span>Average Order Value</span>
                  <span className="text-blue-700 font-bold">${aov}</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="400"
                  step="10"
                  value={aov}
                  onChange={(e) => setAov(Number(e.target.value))}
                  className="w-full accent-blue-700 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[13px] font-semibold text-[#0F172A] mb-1.5">
                  <span>Current Apparel Return Rate</span>
                  <span className="text-blue-700 font-bold">{returnRate}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="45"
                  step="1"
                  value={returnRate}
                  onChange={(e) => setReturnRate(Number(e.target.value))}
                  className="w-full accent-blue-700 cursor-pointer"
                />
              </div>
            </div>

            <div className="md:col-span-5 card-deep-blue p-7">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Annual Logistics Saved
              </div>
              <div className="text-[40px] font-bold text-white tracking-tight mt-1">
                ${shippingSaved.toLocaleString()}
              </div>
              <p className="text-[12.5px] text-slate-300 mt-1">
                Based on an average return processing cost of $16.50 per parcel.
              </p>

              <div className="mt-6 pt-5 border-t border-slate-700 space-y-2.5 text-[12.5px]">
                <div className="flex justify-between text-slate-300">
                  <span>Returns Prevented</span>
                  <span className="font-semibold text-white">{returnsSaved.toLocaleString()} garments</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Net Margin Protected</span>
                  <span className="font-semibold text-white">${revenueProtected.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="w-full py-2.5 rounded bg-white text-[#0F172A] hover:bg-slate-100 font-semibold text-[13px] text-center block transition"
                >
                  Start 14-Day Free Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. TRANSPARENT PRICING                                         */}
      {/* ============================================================== */}
      <section id="pricing" className="px-4 py-20 bg-[#F8FAFC] border-t border-[#E2E8F0]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-[#0F172A]">Simple, Transparent Pricing</h2>
            <p className="mt-2 text-[15px] text-[#475569]">
              14-day free trial on all plans. No credit card required to start.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Starter */}
            <div className="card-white p-7 flex flex-col justify-between">
              <div>
                <span className="text-[12px] font-bold uppercase text-[#64748B]">Starter Pilot</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-[36px] font-bold text-[#0F172A]">$0</span>
                  <span className="text-[12px] text-[#64748B]">/ 14 days</span>
                </div>
                <p className="text-[13px] text-[#64748B] mt-1.5">For boutiques testing try-on engagement.</p>

                <div className="mt-5 pt-5 border-t border-slate-100 space-y-2.5 text-[12.5px] text-[#0F172A]">
                  <div className="flex items-center gap-2"><Check size={14} className="text-blue-700" /> 250 photo try-on sessions</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-blue-700" /> 10 store products</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-blue-700" /> Universal embed snippet</div>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="w-full btn-white-secondary text-[13px] text-center block"
                >
                  Start Free Pilot
                </Link>
              </div>
            </div>

            {/* Growth */}
            <div className="card-white p-7 flex flex-col justify-between border-2 border-[#1E40AF] relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1E40AF] text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">
                Most Popular
              </div>
              <div>
                <span className="text-[12px] font-bold uppercase text-blue-700">Growth Brand</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-[36px] font-bold text-[#0F172A]">$49</span>
                  <span className="text-[12px] text-[#64748B]">/ month</span>
                </div>
                <p className="text-[13px] text-[#64748B] mt-1.5">For scaling brands reducing returns.</p>

                <div className="mt-5 pt-5 border-t border-slate-100 space-y-2.5 text-[12.5px] text-[#0F172A]">
                  <div className="flex items-center gap-2 font-medium"><Check size={14} className="text-blue-700" /> 2,500 try-on sessions / mo</div>
                  <div className="flex items-center gap-2 font-medium"><Check size={14} className="text-blue-700" /> Unlimited garments</div>
                  <div className="flex items-center gap-2 font-medium"><Check size={14} className="text-blue-700" /> Custom branding colors</div>
                  <div className="flex items-center gap-2 font-medium"><Check size={14} className="text-blue-700" /> Shopify 1-click sync</div>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="w-full btn-blue-primary text-[13px] text-center block"
                >
                  Start 14-Day Free Trial
                </Link>
              </div>
            </div>

            {/* Enterprise */}
            <div className="card-white p-7 flex flex-col justify-between">
              <div>
                <span className="text-[12px] font-bold uppercase text-[#64748B]">Enterprise</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-[36px] font-bold text-[#0F172A]">$99</span>
                  <span className="text-[12px] text-[#64748B]">/ month</span>
                </div>
                <p className="text-[13px] text-[#64748B] mt-1.5">For high-volume apparel retailers.</p>

                <div className="mt-5 pt-5 border-t border-slate-100 space-y-2.5 text-[12.5px] text-[#0F172A]">
                  <div className="flex items-center gap-2"><Check size={14} className="text-blue-700" /> 10,000+ try-on sessions</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-blue-700" /> Headless React SDK</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-blue-700" /> Dedicated account support</div>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="w-full btn-white-secondary text-[13px] text-center block"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. FREQUENTLY ASKED QUESTIONS                                  */}
      {/* ============================================================== */}
      <section className="px-4 py-20 bg-white border-t border-[#E2E8F0]">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-[#0F172A]">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How does Photo Try-On work for shoppers?",
                a: "Shoppers click 'Try It On' on your product page and upload a standard photo. Our engine aligns garment draping and proportions to their body in under two seconds.",
              },
              {
                q: "Are customer photos stored permanently?",
                a: "No. Customer photos are processed in temporary encrypted RAM to generate the visual preview and are purged immediately. We do not store biometric data or sell user images.",
              },
              {
                q: "How long does installation take?",
                a: "Under 60 seconds. You paste one script tag into your Shopify Liquid theme or website HTML. The button appears automatically with your brand colors.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group card-white p-4 cursor-pointer"
              >
                <summary className="text-[14px] font-semibold text-[#0F172A] flex items-center justify-between list-none">
                  {faq.q}
                  <ChevronDown size={16} className="text-[#64748B] group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-2.5 text-[13px] text-[#475569] leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* MODAL: LIVE WORKING TEST POPUP                                 */}
      {/* ============================================================== */}
      {showLiveWidgetModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowLiveWidgetModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded"
            >
              <X size={18} />
            </button>

            <div className="text-[16px] font-bold text-[#0F172A] mb-1">
              Shopper Fitting Preview
            </div>
            <p className="text-[12px] text-[#64748B] mb-4">
              This is the exact popup dialog your customers see on product pages.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="aspect-[3/4] rounded bg-slate-900 overflow-hidden relative">
                <img
                  src={selectedGarment.drapePhoto}
                  alt="Draped"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-[14px] font-bold text-[#0F172A]">{selectedGarment.name}</div>
                  <div className="text-[12px] text-[#64748B] mt-0.5">${selectedGarment.price} • Size {selectedSize}</div>
                </div>

                <div className="p-2.5 bg-blue-50 rounded border border-blue-200 text-[11.5px] text-blue-900">
                  <strong>Fit Confidence: 98.8%</strong>
                  <br />
                  True to size based on shoulder & chest measurements.
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      toast.success("Added to cart!");
                      setShowLiveWidgetModal(false);
                    }}
                    className="w-full btn-blue-primary !py-2 !text-[12.5px]"
                  >
                    Add to Cart (${selectedGarment.price})
                  </button>
                  <button
                    onClick={() => setShowLiveWidgetModal(false)}
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
