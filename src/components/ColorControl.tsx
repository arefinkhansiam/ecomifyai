import { useEffect, useMemo, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { toast } from "sonner";

/* ---------- color math ---------- */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function parseColor(value: string): { hex: string; alpha: number } {
  const v = value.trim();
  const rgba = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/i.exec(v);
  if (rgba) {
    return { hex: rgbToHex(+rgba[1], +rgba[2], +rgba[3]), alpha: rgba[4] !== undefined ? Math.round(parseFloat(rgba[4]) * 100) : 100 };
  }
  if (/^#[0-9a-f]{6}$/i.test(v)) return { hex: v, alpha: 100 };
  if (/^#[0-9a-f]{8}$/i.test(v)) {
    const a = parseInt(v.slice(7, 9), 16) / 255;
    return { hex: v.slice(0, 7), alpha: Math.round(a * 100) };
  }
  if (/^#[0-9a-f]{3}$/i.test(v)) {
    const r = v[1], g = v[2], b = v[3];
    return { hex: `#${r}${r}${g}${g}${b}${b}`, alpha: 100 };
  }
  return { hex: "#38BDF8", alpha: 100 };
}
function composeOutput(hex: string, alpha: number): string {
  if (alpha >= 100) return hex;
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(alpha / 100).toFixed(2)})`;
}

const FALLBACK_PRESETS = [
  "#0EA5E9", "#38BDF8", "#7C3AED", "#EC4899", "#F59E0B",
  "#10B981", "#EF4444", "#FFFFFF", "#0B1220", "#1E293B",
];

export function ColorControl({
  label,
  value,
  onChange,
  allowAlpha = false,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  allowAlpha?: boolean;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const parsed = useMemo(() => parseColor(value), [value]);
  const [hex, setHex] = useState(parsed.hex);
  const [alpha, setAlpha] = useState(parsed.alpha);
  const [palette, setPalette] = useState<string[]>([]);

  // Sync from prop
  useEffect(() => { setHex(parsed.hex); setAlpha(parsed.alpha); }, [parsed.hex, parsed.alpha]);

  // Click outside
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  // Load palette
  useEffect(() => {
    if (!user || !open) return;
    (async () => {
      const { data } = await supabase
        .from("vendor_palettes" as any)
        .select("colors")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const colors = (data as any)?.colors;
      if (Array.isArray(colors)) setPalette(colors as string[]);
    })();
  }, [user, open]);

  const commit = (h: string, a: number) => {
    setHex(h); setAlpha(a);
    onChange(allowAlpha ? composeOutput(h, a) : h);
  };

  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };

  const saveToPalette = async () => {
    if (!user) return;
    const next = Array.from(new Set([hex, ...palette])).slice(0, 24);
    setPalette(next);
    const { data: existing } = await supabase
      .from("vendor_palettes" as any).select("id").eq("user_id", user.id).limit(1).maybeSingle();
    if ((existing as any)?.id) {
      await supabase.from("vendor_palettes" as any).update({ colors: next } as any).eq("id", (existing as any).id);
    } else {
      await supabase.from("vendor_palettes" as any).insert({ user_id: user.id, name: "Brand colors", colors: next } as any);
    }
    toast.success("Saved to palette");
  };

  const removeFromPalette = async (c: string) => {
    if (!user) return;
    const next = palette.filter((x) => x !== c);
    setPalette(next);
    const { data: existing } = await supabase
      .from("vendor_palettes" as any).select("id").eq("user_id", user.id).limit(1).maybeSingle();
    if ((existing as any)?.id) {
      await supabase.from("vendor_palettes" as any).update({ colors: next } as any).eq("id", (existing as any).id);
    }
  };

  const presets = palette.length > 0 ? palette : FALLBACK_PRESETS;

  return (
    <div>
      {label && <label className="text-xs text-muted uppercase tracking-wide">{label}</label>}
      <div className="mt-1 relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full min-w-0 flex items-center gap-2 border rounded-xl px-2 py-1.5 hover:border-sky-400 transition-colors overflow-hidden"
          style={{ borderColor: "var(--border)", background: "#fff" }}
        >
          <span
            className="w-9 h-9 rounded-lg border shrink-0"
            style={{
              background: value,
              borderColor: "rgba(0,0,0,0.1)",
              backgroundImage: alpha < 100 ? `${value}, repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 10px 10px` : undefined,
            }}
          />
          <span className="min-w-0 flex-1 text-left text-xs font-mono text-ink truncate">{value}</span>
        </button>

        {open && (
          <div className="absolute z-50 mt-2 left-0 w-[min(320px,calc(100vw-48px))] rounded-2xl border bg-white shadow-2xl p-3 space-y-3"
               style={{ borderColor: "var(--border)" }}>
            <HexColorPicker color={hex} onChange={(c) => commit(c, alpha)} style={{ width: "100%", height: 160 }} />

            {/* HEX */}
            <div>
              <div className="text-[10px] uppercase text-muted mb-1">Hex</div>
              <input
                value={hex}
                onChange={(e) => {
                  const v = e.target.value;
                  setHex(v);
                  if (/^#[0-9a-f]{6}$/i.test(v)) commit(v, alpha);
                }}
                className="w-full px-2 py-1.5 rounded-lg border text-xs font-mono"
                style={{ borderColor: "var(--border)" }}
              />
            </div>

            {/* RGB */}
            <div>
              <div className="text-[10px] uppercase text-muted mb-1">RGB</div>
              <div className="grid grid-cols-3 gap-2">
                {(["r", "g", "b"] as const).map((k) => (
                  <input
                    key={k}
                    type="number"
                    min={0} max={255}
                    value={(rgb as any)[k]}
                    onChange={(e) => {
                      const v = Math.max(0, Math.min(255, Number(e.target.value) || 0));
                      const next = { ...rgb, [k]: v };
                      commit(rgbToHex(next.r, next.g, next.b), alpha);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border text-xs font-mono text-center"
                    style={{ borderColor: "var(--border)" }}
                  />
                ))}
              </div>
            </div>

            {/* Alpha */}
            {allowAlpha && (
              <div>
                <div className="flex items-center justify-between text-[10px] uppercase text-muted mb-1">
                  <span>Opacity</span><span className="font-mono">{alpha}%</span>
                </div>
                <input
                  type="range" min={0} max={100} value={alpha}
                  onChange={(e) => commit(hex, Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>
            )}

            {/* Palette */}
            <div>
              <div className="flex items-center justify-between text-[10px] uppercase text-muted mb-1">
                <span>{palette.length > 0 ? "Brand palette" : "Suggested"}</span>
                <button onClick={saveToPalette} className="inline-flex items-center gap-1 text-[10px] text-sky-600 hover:text-sky-700">
                  Save
                </button>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {presets.map((c) => (
                  <div key={c} className="relative group">
                    <button
                      onClick={() => commit(c, alpha)}
                      className="w-full aspect-square rounded-md border hover:scale-110 transition-transform"
                      style={{ background: c, borderColor: "rgba(0,0,0,0.1)" }}
                    />
                    {palette.includes(c) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromPalette(c); }}
                        className="absolute -top-1 -right-1 w-5 h-4 rounded-full bg-white border grid place-items-center opacity-0 group-hover:opacity-100 text-[8px] text-red-500"
                        style={{ borderColor: "var(--border)" }}
                      >
                        Del
                      </button>
                    )}
                  </div>
                ))}
                {palette.length === 0 && (
                  <button onClick={saveToPalette}
                    className="w-full aspect-square rounded-md border border-dashed grid place-items-center hover:border-sky-400 text-[10px] text-muted"
                    style={{ borderColor: "var(--border)" }}>
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
