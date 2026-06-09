import { Sparkles, X, Camera } from "lucide-react";

type Props = {
  productImage: string | null;
  productName: string;
  buttonLabel: string;
  buttonBg: string;
  buttonFg: string;
  buttonRadius: number;
  pageBg: string;
  fontColor: string;
  accent: string;
  overlay: string;
  arButtonRadius: number;
  arButtonText: string;
  showBranding: boolean;
  showProductName: boolean;
  mode: "fashion" | "furniture" | "full_3d" | "makeup";
};

/**
 * A miniature WYSIWYG mock of the public AR viewer page. Mirrors the layout
 * of `/ar/view/$productId` so customizing on the upload/edit page is
 * what-you-see-is-what-you-get.
 */
export function ArLivePreview(p: Props) {
  const badge = p.mode === "fashion" ? "TRY-ON" : p.mode === "full_3d" ? "3D AR" : p.mode === "makeup" ? "MAKEUP" : "PLACE IT";
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Store button preview */}
      <div className="rounded-2xl p-8 bg-soft grid place-items-center min-h-[260px]">
        <div className="text-[10px] uppercase tracking-wider text-muted mb-3">Store button</div>
        {p.productImage ? (
          <img src={p.productImage} alt="" className="w-24 h-24 object-contain rounded-xl mb-4 bg-white/60 p-2" />
        ) : (
          <div className="w-24 h-24 rounded-xl bg-white/60 grid place-items-center mb-4 text-muted text-xs">No image yet</div>
        )}
        <button type="button"
          style={{
            background: p.buttonBg, color: p.buttonFg, padding: "14px 28px", fontSize: 15,
            borderRadius: p.buttonRadius, fontWeight: 600, border: "none",
            boxShadow: "0 10px 28px -8px rgba(2,132,199,0.5)",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
          <Sparkles size={16} /> {p.buttonLabel}
        </button>
        {p.showBranding && (
          <div className="mt-3 text-[10px] uppercase tracking-wider text-muted">Powered by Ecomify</div>
        )}
      </div>

      {/* AR viewer mock — phone frame */}
      <div className="grid place-items-center">
        <div className="text-[10px] uppercase tracking-wider text-muted mb-3">Try-On viewer page</div>
        <div className="relative w-[220px] h-[420px] rounded-[34px] overflow-hidden shadow-2xl"
             style={{ background: p.pageBg, color: p.fontColor, border: "8px solid #111" }}>
          {/* Simulated camera feed */}
          <div className="absolute inset-0"
               style={{ background: "linear-gradient(135deg, #1f2937 0%, #0f172a 50%, #020617 100%)" }} />
          {p.productImage && (
            <img src={p.productImage} alt=""
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[70%] max-h-[55%] object-contain"
              style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,.6))" }} />
          )}
          {/* gradient overlays */}
          <div className="absolute inset-0 pointer-events-none"
               style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35), transparent 30%, transparent 60%, rgba(0,0,0,0.55))" }} />

          {/* top bar */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1.5">
            <span className="px-2 py-1 rounded-full text-[8px] font-semibold flex items-center gap-1"
                  style={{ background: p.overlay, color: p.fontColor, backdropFilter: "blur(8px)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: p.accent }} />
              {badge}
            </span>
            {p.showProductName && (
              <span className="px-2 py-1 rounded-full text-[8px] font-semibold truncate max-w-[55%]"
                    style={{ background: p.overlay, color: p.fontColor, backdropFilter: "blur(8px)" }}>
                {p.productName}
              </span>
            )}
            <span className="w-5 h-5 rounded-full grid place-items-center"
                  style={{ background: p.overlay, color: p.fontColor }}>
              <X size={10} />
            </span>
          </div>

          {/* shutter */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-6 w-14 h-14 rounded-full grid place-items-center"
               style={{ background: "#fff", boxShadow: `0 0 0 3px ${p.accent}` }}>
            <div className="w-11 h-11 rounded-full grid place-items-center" style={{ background: p.accent }}>
              <Camera size={16} color="#fff" />
            </div>
          </div>

          {/* CTA pill */}
          <div className="absolute left-2 right-2 bottom-[88px] grid place-items-center">
            <div className="px-3 py-1.5 text-[10px] font-semibold inline-flex items-center gap-1"
                 style={{ background: p.accent, color: "#fff", borderRadius: p.arButtonRadius }}>
              <Sparkles size={11} /> {p.arButtonText}
            </div>
          </div>

          {p.showBranding && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[7px] uppercase tracking-wider"
                 style={{ background: p.overlay, color: p.fontColor, opacity: 0.8 }}>
              Powered by <span style={{ color: p.accent, fontWeight: 700 }}>Ecomify</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
