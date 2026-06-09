import { useEffect, useRef, useState } from "react";
import { HexColorPicker, RgbaStringColorPicker } from "react-colorful";

const PRESETS = [
  "#0369A1", "#38BDF8", "#0EA5E9", "#7C3AED", "#EC4899", "#F59E0B",
  "#10B981", "#EF4444", "#FFFFFF", "#000000", "#1E293B", "#F1F5F9",
];

const GRADIENT_PRESETS = [
  "linear-gradient(135deg,#7C3AED 0%,#EC4899 50%,#38BDF8 100%)",
  "linear-gradient(135deg,#0369A1 0%,#38BDF8 100%)",
  "linear-gradient(135deg,#F59E0B 0%,#EF4444 100%)",
  "linear-gradient(135deg,#10B981 0%,#06B6D4 100%)",
  "linear-gradient(135deg,#1E293B 0%,#38BDF8 100%)",
  "linear-gradient(135deg,#EC4899 0%,#7C3AED 100%)",
];

type Mode = "solid" | "gradient" | "alpha";

export function AdvancedColorPicker({
  label,
  value,
  onChange,
  allowGradient = false,
  allowAlpha = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  allowGradient?: boolean;
  allowAlpha?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isGradient = value?.includes("gradient");
  const isRgba = value?.startsWith("rgba");
  const [mode, setMode] = useState<Mode>(
    isGradient ? "gradient" : isRgba ? "alpha" : "solid"
  );

  // Gradient editor state
  const [gFrom, setGFrom] = useState("#7C3AED");
  const [gTo, setGTo] = useState("#38BDF8");
  const [gAngle, setGAngle] = useState(135);

  useEffect(() => {
    if (isGradient) {
      const m = value.match(/(\d+)deg.*?(#[0-9a-fA-F]{3,8})[^,]*,\s*(#[0-9a-fA-F]{3,8})/);
      if (m) { setGAngle(Number(m[1])); setGFrom(m[2]); setGTo(m[3]); }
    }
  }, [value, isGradient]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const swatch = isGradient ? value : value;

  const applyGradient = (from: string, to: string, angle: number) => {
    const g = `linear-gradient(${angle}deg,${from} 0%,${to} 100%)`;
    setGFrom(from); setGTo(to); setGAngle(angle);
    onChange(g);
  };

  return (
    <div>
      <label className="text-xs text-muted uppercase tracking-wide">{label}</label>
      <div className="mt-1 relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-2 border rounded-xl px-2 py-1.5 hover:border-sky-400 transition-colors"
          style={{ borderColor: "var(--border)", background: "#fff" }}
        >
          <span
            className="w-9 h-9 rounded-lg border shrink-0"
            style={{
              background: swatch,
              borderColor: "rgba(0,0,0,0.1)",
              backgroundImage: isRgba
                ? `${swatch}, linear-gradient(45deg,#ccc 25%,transparent 25%),linear-gradient(-45deg,#ccc 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ccc 75%),linear-gradient(-45deg,transparent 75%,#ccc 75%)`
                : undefined,
              backgroundSize: isRgba ? "auto, 8px 8px, 8px 8px, 8px 8px, 8px 8px" : undefined,
              backgroundPosition: isRgba ? "0 0, 0 0, 0 4px, 4px -4px, -4px 0" : undefined,
            }}
          />
          <span className="flex-1 text-left text-xs font-mono text-ink truncate">{value}</span>
        </button>

        {open && (
          <div className="absolute z-50 mt-2 left-0 w-[260px] rounded-2xl border bg-white shadow-2xl p-3 space-y-3"
               style={{ borderColor: "var(--border)" }}>
            {/* Mode tabs */}
            <div className="flex gap-1 p-1 rounded-lg bg-slate-100">
              <TabBtn active={mode === "solid"} onClick={() => { setMode("solid"); if (isGradient || isRgba) onChange("#38BDF8"); }}>Solid</TabBtn>
              {allowAlpha && (
                <TabBtn active={mode === "alpha"} onClick={() => { setMode("alpha"); onChange("rgba(255,255,255,0.14)"); }}>Alpha</TabBtn>
              )}
              {allowGradient && (
                <TabBtn active={mode === "gradient"} onClick={() => { setMode("gradient"); applyGradient(gFrom, gTo, gAngle); }}>Gradient</TabBtn>
              )}
            </div>

            {mode === "solid" && (
              <>
                <HexColorPicker color={/^#[0-9a-fA-F]{3,8}$/.test(value) ? value : "#38BDF8"} onChange={onChange} style={{ width: "100%" }} />
                <input value={value} onChange={(e) => onChange(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border text-xs font-mono"
                  style={{ borderColor: "var(--border)" }} />
                <div className="grid grid-cols-6 gap-1.5">
                  {PRESETS.map((c) => (
                    <button key={c} onClick={() => onChange(c)}
                      className="w-full aspect-square rounded-md border hover:scale-110 transition-transform"
                      style={{ background: c, borderColor: "rgba(0,0,0,0.1)" }} />
                  ))}
                </div>
              </>
            )}

            {mode === "alpha" && (
              <>
                <RgbaStringColorPicker color={isRgba ? value : "rgba(255,255,255,0.14)"} onChange={onChange} style={{ width: "100%" }} />
                <input value={value} onChange={(e) => onChange(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border text-xs font-mono"
                  style={{ borderColor: "var(--border)" }} />
              </>
            )}

            {mode === "gradient" && (
              <>
                <div className="h-14 rounded-lg border" style={{ background: `linear-gradient(${gAngle}deg,${gFrom} 0%,${gTo} 100%)`, borderColor: "var(--border)" }} />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[10px] uppercase text-muted mb-1">From</div>
                    <HexColorPicker color={gFrom} onChange={(c) => applyGradient(c, gTo, gAngle)} style={{ width: "100%", height: 100 }} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-muted mb-1">To</div>
                    <HexColorPicker color={gTo} onChange={(c) => applyGradient(gFrom, c, gAngle)} style={{ width: "100%", height: 100 }} />
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted mb-1">Angle · {gAngle}°</div>
                  <input type="range" min={0} max={360} value={gAngle}
                    onChange={(e) => applyGradient(gFrom, gTo, Number(e.target.value))}
                    className="w-full accent-sky-500" />
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted mb-1">Presets</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {GRADIENT_PRESETS.map((g, i) => (
                      <button key={i} onClick={() => onChange(g)}
                        className="h-9 rounded-md border hover:scale-105 transition-transform"
                        style={{ background: g, borderColor: "rgba(0,0,0,0.1)" }} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors"
      style={{
        background: active ? "white" : "transparent",
        color: active ? "var(--primary)" : "var(--ink-soft)",
        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
      }}
    >
      {children}
    </button>
  );
}
