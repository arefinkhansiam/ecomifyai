import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Sparkles, UploadCloud, RotateCw, ShoppingBag, ShieldCheck, Camera, ArrowRight, Check, Sliders, Info } from "lucide-react";
import { MarketingShell } from "@/components/MarketingShell";
import demoBefore from "@/assets/demo-before.jpg";
import demoAfter from "@/assets/demo-after.jpg";

export const Route = createFileRoute("/try-ar")({
  head: () => ({
    meta: [
      { title: "Live Shopper Photo Try-On Studio | Easibie" },
      { name: "description", content: "Test Easibie's AI Photo Try-On in action. Upload a full-body photo or select a sample model, choose an apparel piece, and preview instant draping." },
    ],
  }),
  component: TryItOnPage,
});

const CATALOG = [
  {
    id: "blazer",
    name: "Obsidian Tailored Double-Breasted Blazer",
    category: "Outerwear",
    price: 185,
    sizes: ["S", "M", "L", "XL"],
    colors: ["#0F172A", "#1E3A8A", "#475569"],
    img: demoAfter,
    fit: "99.2% True to Size",
  },
  {
    id: "linen",
    name: "Sage Minimalist Belgian Linen Shirt",
    category: "Tops",
    price: 95,
    sizes: ["XS", "S", "M", "L"],
    colors: ["#84A98C", "#F8FAFC", "#D4A373"],
    img: demoAfter,
    fit: "98.7% Relaxed Cut",
  },
  {
    id: "denim",
    name: "Raw Selvedge 14oz Trucker Jacket",
    category: "Outerwear",
    price: 165,
    sizes: ["S", "M", "L", "XL"],
    colors: ["#172554", "#60A5FA"],
    img: demoAfter,
    fit: "97.9% Boxy Fit",
  },
  {
    id: "dress",
    name: "Mulberry Silk Charmeuse Evening Slip Dress",
    category: "Dresses",
    price: 175,
    sizes: ["XS", "S", "M", "L"],
    colors: ["#F1E3D3", "#0B192C", "#581C87"],
    img: demoAfter,
    fit: "98.4% Fluid Bias Cut",
  },
];

function TryItOnPage() {
  const [activeTab, setActiveTab] = useState<"photo" | "camera">("photo");
  const [selectedProduct, setSelectedProduct] = useState(CATALOG[0]);
  const [selectedSize, setSelectedSize] = useState("M");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sliderVal, setSliderVal] = useState(50);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUserPhoto(reader.result as string);
        setIsProcessing(true);
        setTimeout(() => {
          setIsProcessing(false);
          toast.success("Photo analysed and garment draped!");
        }, 1200);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <MarketingShell>
      <section className="relative px-4 pt-12 pb-24 blue-cloud-bg min-h-screen">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="pill-blue-badge">
              <Sparkles size={13} /> Shopper Fitting Studio
            </span>
            <h1 className="text-[34px] sm:text-[48px] font-extrabold text-[#0B192C] mt-3">
              AI Virtual Try-On Studio
            </h1>
            <p className="mt-3 text-[16px] text-[#475569]">
              This is the interactive try-on window your fashion store shoppers experience.
              Upload a photo to see millimetre-accurate neural draping.
            </p>

            {/* Mode Selector Pill: Active Photo Try-On vs Upcoming Live Camera AR */}
            <div className="mt-6 inline-flex p-1 bg-white border border-[#E2E8F0] rounded-full shadow-sm">
              <button
                onClick={() => setActiveTab("photo")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-bold transition ${
                  activeTab === "photo"
                    ? "bg-[#1E40AF] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#0B192C]"
                }`}
              >
                <UploadCloud size={15} /> Photo Try-On (Active)
              </button>
              <button
                onClick={() => setActiveTab("camera")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-bold transition ${
                  activeTab === "camera"
                    ? "bg-[#1E40AF] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#0B192C]"
                }`}
              >
                <Camera size={15} /> Live Camera AR
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                  Upcoming v2.0
                </span>
              </button>
            </div>
          </div>

          {/* TAB 1: ACTIVE PHOTO TRY-ON */}
          {activeTab === "photo" ? (
            <div className="card-white p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Visual Canvas */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="relative w-full aspect-[4/5] bg-slate-900 rounded-2xl overflow-hidden shadow-inner select-none">
                  {/* Base Photo */}
                  <img
                    src={userPhoto || demoBefore}
                    alt="Original photo"
                    className="absolute inset-0 w-full h-full object-cover object-top"
                  />

                  {/* Draped Layer with Slider */}
                  {!isProcessing && (
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(0 0 0 ${sliderVal}%)` }}
                    >
                      <img
                        src={selectedProduct.img}
                        alt="Draped Result"
                        className="absolute inset-0 w-full h-full object-cover object-top"
                      />
                      <div className="absolute top-4 right-4 bg-[#0B192C]/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/20">
                        ✦ AI Draped: {selectedProduct.name}
                      </div>
                    </div>
                  )}

                  {/* Loading State */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-[#0B192C]/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
                      <RotateCw className="w-10 h-10 text-sky-400 animate-spin mb-3" />
                      <div className="text-[16px] font-bold">Generating Photoreal Fit...</div>
                      <div className="text-[12px] text-slate-300 mt-1">Applying cloth physics & texture mapping</div>
                    </div>
                  )}

                  {/* Split Divider */}
                  {!isProcessing && (
                    <div
                      className="absolute top-0 bottom-0 z-10 w-1 bg-white cursor-ew-resize shadow-md"
                      style={{ left: `${sliderVal}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-[#0B192C] font-extrabold text-[10px] grid place-items-center shadow-lg border border-slate-200">
                        ⇄
                      </div>
                    </div>
                  )}

                  {/* Range Input for slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderVal}
                    onChange={(e) => setSliderVal(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                    aria-label="Before after split slider"
                  />

                  <div className="absolute bottom-4 left-4 z-10 flex gap-2">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                      Original ({sliderVal}%)
                    </span>
                    <span className="bg-blue-600/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                      Try-On ({100 - sliderVal}%)
                    </span>
                  </div>
                </div>

                {/* Upload Trigger */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[12.5px] text-[#475569]">
                    <span className="font-bold text-[#0B192C]">Ideal Photo:</span> Full-body or upper-body front snapshot with good lighting.
                  </div>
                  <div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="btn-blue-primary text-[12.5px] !py-2 !px-4"
                    >
                      <UploadCloud size={15} /> Upload Photo
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Garment Selector & Sizing */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                <div>
                  <label className="text-[12px] font-bold uppercase tracking-wider text-[#64748B] block mb-2">
                    Select Apparel Item
                  </label>
                  <div className="space-y-2">
                    {CATALOG.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedProduct(p);
                          setIsProcessing(true);
                          setTimeout(() => setIsProcessing(false), 700);
                        }}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                          selectedProduct.id === p.id
                            ? "bg-blue-50/70 border-blue-600 shadow-sm"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-[13px] font-bold text-[#0B192C] truncate">{p.name}</div>
                          <div className="text-[11.5px] text-[#64748B] mt-0.5">${p.price} • {p.category}</div>
                        </div>
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                          {p.fit}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[12px] font-bold text-[#0B192C]">Recommended Size</label>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Confidence 98.8%
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProduct.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`py-2 text-[13px] font-bold rounded-lg border transition ${
                          selectedSize === s
                            ? "bg-[#0B192C] text-white border-[#0B192C]"
                            : "bg-white text-[#0B192C] border-slate-300 hover:border-slate-400"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Privacy & Trust Box */}
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-[12px] text-[#475569] space-y-1.5">
                  <div className="font-bold text-[#0B192C] flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" /> Biometric Privacy Protected
                  </div>
                  <p>
                    Your photo is processed only in encrypted memory for this session and purged immediately.
                    We never sell or store your photos.
                  </p>
                </div>

                {/* Cart Action */}
                <button
                  onClick={() => toast.success(`Added ${selectedProduct.name} (${selectedSize}) to store cart!`)}
                  className="w-full btn-blue-primary !py-3.5 !rounded-xl !text-[14px]"
                >
                  <ShoppingBag size={16} /> Add to Store Bag — ${selectedProduct.price}
                </button>
              </div>
            </div>
          ) : (
            /* TAB 2: UPCOMING LIVE CAMERA AR ROADMAP INFO */
            <div className="card-white p-8 max-w-3xl mx-auto text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#1E40AF] mx-auto grid place-items-center shadow-sm">
                <Camera size={32} />
              </div>
              <div>
                <span className="pill-upcoming-badge">Coming in v2.0 • Q3 2026</span>
                <h2 className="text-[26px] font-extrabold text-[#0B192C] mt-2">
                  Live Camera AR Body Tracking
                </h2>
                <p className="mt-3 text-[15px] text-[#475569] max-w-xl mx-auto leading-relaxed">
                  We are actively building browser-based 60FPS body skeleton tracking with WebAssembly & WebGPU.
                  Shoppers will be able to stand in front of their webcam or phone camera and see clothing follow their movement in real time.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left max-w-lg mx-auto space-y-3 text-[13px] text-[#475569]">
                <div className="font-bold text-[#0B192C]">Planned Specifications:</div>
                <div className="flex items-center gap-2"><Check size={15} className="text-blue-600" /> Real-time 33-point body keypoint tracking</div>
                <div className="flex items-center gap-2"><Check size={15} className="text-blue-600" /> Sub-16ms frame latency on mobile Safari & Chrome</div>
                <div className="flex items-center gap-2"><Check size={15} className="text-blue-600" /> Automatic fallback to Photo Try-On on unsupported devices</div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    const email = prompt("Enter your email for the v2.0 Live AR private beta:");
                    if (email) toast.success(`Thank you! ${email} has been added to the beta waitlist.`);
                  }}
                  className="btn-blue-primary !py-3 !px-8"
                >
                  Request Early Access to Live AR Beta →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </MarketingShell>
  );
}
